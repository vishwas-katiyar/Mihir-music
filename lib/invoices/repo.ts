import { randomBytes } from "node:crypto";
import { and, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { InvoicePayment, InvoiceRow } from "@/lib/db/schema";
import { computeTotals, paymentFits, pruneLines, sumPayments, type InvoiceInput, type InvoiceStatus, type PaymentInput } from "./calc";

const { invoices } = schema;

/** A well-formed request that would leave the invoice in an impossible state, e.g. paid more than it bills. */
export class InvoiceRuleError extends Error {}

const newToken = () => randomBytes(16).toString("base64url");
const newId = () => randomBytes(6).toString("base64url");
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

/**
 * Status follows the money unless the admin cancelled the invoice:
 * nothing paid → keep draft/sent, some paid → partially_paid, all paid → paid.
 */
function deriveStatus(requested: InvoiceStatus, grandTotalPaise: number, paidPaise: number): InvoiceStatus {
  if (requested === "cancelled") return "cancelled";
  if (grandTotalPaise > 0 && paidPaise >= grandTotalPaise) return "paid";
  if (paidPaise > 0) return "partially_paid";
  return requested === "paid" || requested === "partially_paid" ? "sent" : requested;
}

/** Editable fields → columns, with totals recomputed against the given payment list. */
function toColumns(input: InvoiceInput, payments: InvoicePayment[]) {
  const items = pruneLines(input.items);
  const paid = sumPayments(payments);
  const t = computeTotals(items, input.discountPaise, input.gstRateBp, paid);
  const status = deriveStatus(input.status, t.grandTotalPaise, paid);
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
    advancePaidPaise: paid,
    subtotalPaise: t.subtotalPaise,
    gstPaise: t.gstPaise,
    grandTotalPaise: t.grandTotalPaise,
    balanceDuePaise: t.balanceDuePaise,
    notes: blank(input.notes),
    terms: input.terms.filter((s) => s.trim()),
    payments,
    status,
    paidAt: status === "paid" ? new Date() : null,
  };
}

const toPayment = (p: PaymentInput): InvoicePayment => ({ id: newId(), date: p.date, amountPaise: Math.round(p.amountPaise), method: p.method, reference: p.reference, note: p.note });

export async function createInvoice(input: InvoiceInput): Promise<InvoiceRow> {
  const advance = input.initialPayment && input.initialPayment.amountPaise > 0 ? input.initialPayment : null;
  const payments = advance ? [toPayment(advance)] : [];
  const cols = toColumns(input, payments);
  if (advance) {
    const reason = paymentFits(cols.grandTotalPaise, 0, advance.amountPaise);
    if (reason) throw new InvoiceRuleError(reason);
  }
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

/** Full edit of the invoice body. Payments are untouched; totals and status re-derive. */
export async function updateInvoice(id: number, input: InvoiceInput): Promise<InvoiceRow | null> {
  const current = await getInvoiceById(id);
  if (!current) return null;
  const cols = toColumns(input, current.payments);
  const [row] = await db
    .update(invoices)
    .set({ ...cols, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return row ?? null;
}

/** Re-derive money and status after the payment list changes. */
async function savePayments(row: InvoiceRow, payments: InvoicePayment[]): Promise<InvoiceRow | null> {
  const paid = sumPayments(payments);
  const balance = Math.max(row.grandTotalPaise - paid, 0);
  const status = deriveStatus(row.status as InvoiceStatus, row.grandTotalPaise, paid);
  const [updated] = await db
    .update(invoices)
    .set({ payments, advancePaidPaise: paid, balanceDuePaise: balance, status, paidAt: status === "paid" ? (row.paidAt ?? new Date()) : null, updatedAt: new Date() })
    .where(eq(invoices.id, row.id))
    .returning();
  return updated ?? null;
}

export async function addPayment(id: number, payment: PaymentInput): Promise<InvoiceRow | null> {
  const row = await getInvoiceById(id);
  if (!row) return null;
  const reason = paymentFits(row.grandTotalPaise, sumPayments(row.payments), payment.amountPaise);
  if (reason) throw new InvoiceRuleError(reason);
  return savePayments(row, [...row.payments, toPayment(payment)]);
}

export async function removePayment(id: number, paymentId: string): Promise<InvoiceRow | null> {
  const row = await getInvoiceById(id);
  if (!row) return null;
  return savePayments(row, row.payments.filter((p) => p.id !== paymentId));
}

/** Manual status override (mainly for "sent" and "cancelled"); money-derived states win. */
export async function setStatus(id: number, status: InvoiceStatus): Promise<InvoiceRow | null> {
  const row = await getInvoiceById(id);
  if (!row) return null;
  const derived = deriveStatus(status, row.grandTotalPaise, row.advancePaidPaise);
  const [updated] = await db
    .update(invoices)
    .set({ status: derived, paidAt: derived === "paid" ? (row.paidAt ?? new Date()) : null, updatedAt: new Date() })
    .where(eq(invoices.id, id))
    .returning();
  return updated ?? null;
}

/** New share token: the old link stops working. */
export async function rotateToken(id: number): Promise<InvoiceRow | null> {
  const [row] = await db.update(invoices).set({ token: newToken(), updatedAt: new Date() }).where(eq(invoices.id, id)).returning();
  return row ?? null;
}

/** Soft delete: the invoice disappears from lists and its client link stops resolving, but nothing is lost. */
export async function deleteInvoice(id: number): Promise<boolean> {
  const rows = await db.update(invoices).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(invoices.id, id)).returning({ id: invoices.id });
  return rows.length > 0;
}

export async function restoreInvoice(id: number): Promise<InvoiceRow | null> {
  const [row] = await db.update(invoices).set({ deletedAt: null, updatedAt: new Date() }).where(eq(invoices.id, id)).returning();
  return row ?? null;
}

export const getInvoiceById = async (id: number) => (await db.select().from(invoices).where(eq(invoices.id, id)))[0] ?? null;
/** Client-facing lookup: deleted invoices are invisible. */
export const getInvoiceByToken = async (token: string) => (await db.select().from(invoices).where(and(eq(invoices.token, token), isNull(invoices.deletedAt))))[0] ?? null;

export type ListStatus = InvoiceStatus | "all" | "deleted";

export interface ListOptions {
  q?: string;
  status?: ListStatus;
  limit?: number;
}

export async function listInvoices({ q, status = "all", limit = 200 }: ListOptions = {}): Promise<InvoiceRow[]> {
  const filters = [status === "deleted" ? isNotNull(invoices.deletedAt) : isNull(invoices.deletedAt)];
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    filters.push(or(ilike(invoices.clientName, like), ilike(invoices.invoiceNumber, like), ilike(invoices.eventTitle, like), ilike(invoices.clientPhone, like))!);
  }
  if (status !== "all" && status !== "deleted") filters.push(eq(invoices.status, status));
  return db.select().from(invoices).where(and(...filters)).orderBy(desc(invoices.createdAt)).limit(limit);
}

export async function summary() {
  const [row] = await db
    .select({
      count: sql<number>`count(*)::int`,
      billed: sql<number>`coalesce(sum(${invoices.grandTotalPaise}) filter (where ${invoices.status} <> 'cancelled'), 0)::bigint`,
      due: sql<number>`coalesce(sum(${invoices.balanceDuePaise}) filter (where ${invoices.status} in ('sent','partially_paid')), 0)::bigint`,
      collected: sql<number>`coalesce(sum(${invoices.advancePaidPaise}) filter (where ${invoices.status} <> 'cancelled'), 0)::bigint`,
    })
    .from(invoices)
    .where(isNull(invoices.deletedAt));
  return { count: Number(row?.count ?? 0), billedPaise: Number(row?.billed ?? 0), duePaise: Number(row?.due ?? 0), collectedPaise: Number(row?.collected ?? 0) };
}
