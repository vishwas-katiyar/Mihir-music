import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { Inquiry } from "@/lib/db/schema";
import { LEAD_STATUSES, type LeadStatus } from "./types";

const { inquiries } = schema;

export type ListLeadStatus = LeadStatus | "all";

export interface ListLeadOptions {
  q?: string;
  status?: ListLeadStatus;
  limit?: number;
}

export async function listLeads({ q, status = "all", limit = 200 }: ListLeadOptions = {}): Promise<Inquiry[]> {
  const filters = [];
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    filters.push(or(ilike(inquiries.name, like), ilike(inquiries.phone, like), ilike(inquiries.venueCity, like), ilike(inquiries.eventType, like))!);
  }
  if (status !== "all") filters.push(eq(inquiries.status, status));
  return db
    .select()
    .from(inquiries)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(inquiries.createdAt))
    .limit(limit);
}

export const getLeadById = async (id: number) => (await db.select().from(inquiries).where(eq(inquiries.id, id)))[0] ?? null;

export async function updateLead(id: number, patch: { status?: LeadStatus; adminNotes?: string | null }): Promise<Inquiry | null> {
  const current = await getLeadById(id);
  if (!current) return null;
  const values: Partial<typeof inquiries.$inferInsert> = {};
  if (patch.status) {
    values.status = patch.status;
    // First time a lead leaves "new", stamp when the crew actually followed up.
    if (!current.contactedAt && patch.status !== "new") values.contactedAt = new Date();
  }
  if (patch.adminNotes !== undefined) values.adminNotes = patch.adminNotes?.trim() || null;
  if (Object.keys(values).length === 0) return current;
  const [row] = await db.update(inquiries).set(values).where(eq(inquiries.id, id)).returning();
  return row ?? null;
}

/** Counts per status plus a rolling 7-day count, for the summary strip above the table. */
export async function leadSummary() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      newCount: sql<number>`count(*) filter (where ${inquiries.status} = 'new')::int`,
      won: sql<number>`count(*) filter (where ${inquiries.status} = 'won')::int`,
      lost: sql<number>`count(*) filter (where ${inquiries.status} = 'lost')::int`,
      last7d: sql<number>`count(*) filter (where ${inquiries.createdAt} > now() - interval '7 days')::int`,
    })
    .from(inquiries);
  const total = Number(row?.total ?? 0);
  const won = Number(row?.won ?? 0);
  const lost = Number(row?.lost ?? 0);
  const decided = won + lost;
  return {
    total,
    newCount: Number(row?.newCount ?? 0),
    won,
    lost,
    last7d: Number(row?.last7d ?? 0),
    // Conversion is only meaningful once a lead has been decided one way or the other.
    winRate: decided > 0 ? Math.round((won / decided) * 100) : null,
  };
}

export const allLeadStatuses = LEAD_STATUSES;
