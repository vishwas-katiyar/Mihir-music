import { randomBytes } from "node:crypto";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { InvoiceRow } from "@/lib/db/schema";
import { computeTotals, pruneLines, type InvoiceInput, type InvoiceStatus } from "./calc";

const { invoices } = schema;

const newToken = () => randomBytes(16).toString("base64url");
const blank = (v?: string | null) => (v && v.trim() ? v.trim() : null);

/** MSL-YYYY-NNNN, sequential within the invoice year. Retries on a rare race. */
async function nextInvoiceNumber(issueDate: string): Promise<string> {
  const year = issueDate.slice(0, 4);
  const prefix = `MSL-${year}-`;
  const [row] = await db
    .select({ max: sql<string | null>`max(${invoices.invoiceNumber})` })
    .from(invoices)
    .where(ilike(invoices.invoiceNumber, `${prefix}%`));
  const last = row?.max ? Number(row.max.slice(prefix.length)) : 0;
  return `${prefix}${String((Number.isFinite(last) ? last : 0) + 1).padStart(4, "0")}`;
}

function toColumns(input: InvoiceInput) {
  const items = pruneLines(input.items);
  const t = computeTotals(items, input.discountPaise, input.gstRateBp, input.advancePaidPaise);
  return {
    issueDate: input.issueDate,
    dueDate: blank(input.dueDate),
    eventTitle: blank(input.eventTitle),
    eventStart: blank(input.eventStart),
    eventEnd: blank(input.eventEnd),
    venue: blank(input.venue),
    clientName: input.clientName.trim(),
    clientPhone: blank(input.clientPhone),
    clientEmail: blank(input.clientEmail),
    clientAddress: blank(input.clientAddress),
    items,
    discountPaise: t.discountPaise,
    gstRateBp: input.gstRateBp,
    advancePaidPaise: t.advancePaidPaise,
    subtotalPaise: t.subtotalPaise,
    gstPaise: t.gstPaise,
    grandTotalPaise: t.grandTotalPaise,
    balanceDuePaise: t.balanceDuePaise,
    notes: blank(input.notes),
    terms: input.terms.filter((s) => s.trim()),
    status: input.status,
    paidAt: input.status === "paid" ? new Date() : null,
  };
}

export async function createInvoice(input: InvoiceInput): Promise<InvoiceRow> {
  const cols = toColumns(input);
  for (let attempt = 0; attempt < 3; attempt++) {
    const invoiceNumber = await nextInvoiceNumber(input.issueDate);
    try {
      const [row] = await db
        .insert(invoices)
        .values({ ...cols, invoiceNumber, token: newToken() })
        .returning();
      return row;
    } catch (e) {
      if (attempt === 2 || !/unique/i.test(String(e))) throw e;
    }
  }
  throw new Error("Could not allocate an invoice number");
}

export async function updateInvoice(id: number, input: InvoiceInput): Promise<InvoiceRow | null> {
  const cols = toColumns(input);
  const [row] = await db
    .update(invoices)
    .set({ ...cols, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return row ?? null;
}

export async function setStatus(id: number, status: InvoiceStatus): Promise<InvoiceRow | null> {
  const [row] = await db
    .update(invoices)
    .set({ status, paidAt: status === "paid" ? new Date() : null, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return row ?? null;
}

/** New share token: the old link stops working. */
export async function rotateToken(id: number): Promise<InvoiceRow | null> {
  const [row] = await db.update(invoices).set({ token: newToken(), updatedAt: new Date() }).where(eq(invoices.id, id)).returning();
  return row ?? null;
}

export async function deleteInvoice(id: number): Promise<boolean> {
  const rows = await db.delete(invoices).where(eq(invoices.id, id)).returning({ id: invoices.id });
  return rows.length > 0;
}

export const getInvoiceById = async (id: number) => (await db.select().from(invoices).where(eq(invoices.id, id)))[0] ?? null;
export const getInvoiceByToken = async (token: string) => (await db.select().from(invoices).where(eq(invoices.token, token)))[0] ?? null;

export interface ListOptions {
  q?: string;
  status?: InvoiceStatus | "all";
  limit?: number;
}

export async function listInvoices({ q, status = "all", limit = 200 }: ListOptions = {}): Promise<InvoiceRow[]> {
  const filters = [];
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    filters.push(or(ilike(invoices.clientName, like), ilike(invoices.invoiceNumber, like), ilike(invoices.eventTitle, like), ilike(invoices.clientPhone, like)));
  }
  if (status !== "all") filters.push(eq(invoices.status, status));
  const where = filters.length ? and(...filters) : undefined;
  return db.select().from(invoices).where(where).orderBy(desc(invoices.createdAt)).limit(limit);
}

export async function summary() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      billed: sql<number>`coalesce(sum(${invoices.grandTotalPaise}) filter (where ${invoices.status} <> 'cancelled'), 0)::bigint`,
      due: sql<number>`coalesce(sum(${invoices.balanceDuePaise}) filter (where ${invoices.status} in ('sent','partially_paid')), 0)::bigint`,
    })
    .from(invoices);
  return { count: Number(row?.count ?? 0), billedPaise: Number(row?.billed ?? 0), duePaise: Number(row?.due ?? 0) };
}
