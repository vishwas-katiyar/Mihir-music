import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";
import { bumpDateDemand, rateLimit } from "@/lib/db/kv";
import { estimate, eventTypes, crowdSizes, venueTypes, type EventTypeId, type CrowdId, type VenueId } from "@/lib/estimator";
import { notifyNewLead } from "@/lib/leads/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ids = <T extends readonly { id: string }[]>(list: T) => list.map((x) => x.id);
const eventTypeIds = ids(eventTypes);
const crowdIds = ids(crowdSizes);
const venueIds = ids(venueTypes);

/**
 * Two shapes share this endpoint and the same `inquiries` table:
 *  - "estimator" / "drawer": eventType/crowd/venue are the 3D estimator's enum ids —
 *    the server re-runs the pricing model so the stored budget can't be tampered with.
 *  - "contact": the plain contact form. It never collects crowd size or venue type, and
 *    `eventType` is whatever package/service the visitor picked, as free text — so those
 *    are validated as non-empty strings instead of enums, and no price is computed.
 */
const QuoteSchema = z.object({
  eventType: z.string().trim().min(1).max(80),
  crowd: z.string().trim().max(40).optional().or(z.literal("")),
  venue: z.string().trim().max(80).optional().or(z.literal("")),
  name: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), "Enter a valid mobile number")
    .optional(),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  source: z.enum(["estimator", "drawer", "contact"]).default("estimator"),
  // honeypot — bots fill it, humans never see it
  website: z.string().max(0).optional(),
});

/**
 * POST /api/quote — persist an enquiry from the estimator or the contact form.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await rateLimit(ip);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = QuoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const input = parsed.data;
  const isEstimatorShaped = input.source !== "contact";
  if (isEstimatorShaped) {
    if (!eventTypeIds.includes(input.eventType) || !crowdIds.includes(input.crowd ?? "") || !venueIds.includes(input.venue ?? "")) {
      return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
    }
  }
  const result = isEstimatorShaped
    ? estimate({ eventType: input.eventType as EventTypeId, crowd: input.crowd as CrowdId, venue: input.venue as VenueId })
    : null;

  const lead = {
    name: input.name || null,
    phone: input.phone || null,
    eventType: result ? result.labels.eventType : input.eventType,
    crowdSize: result ? result.labels.crowd : input.crowd || "—",
    venueType: result ? result.labels.venue : input.venue || "—",
    venueCity: input.city || null,
    eventDate: input.date || null,
    estimatedBudgetLow: result ? result.price.low : 0,
    estimatedBudgetHigh: result ? result.price.high : 0,
    // Estimator: the rig snapshot the visitor saw. Contact form: their free-text notes, if any.
    rig: result ? JSON.stringify(result.rig) : input.notes ? JSON.stringify({ notes: input.notes }) : null,
    source: input.source,
  };

  if (!isDbConfigured) {
    // No database attached yet — still a success from the visitor's point of view.
    return NextResponse.json({ ok: true, persisted: false, estimate: result?.price ?? null });
  }

  const [row] = await db.insert(schema.inquiries).values(lead).returning({ id: schema.inquiries.id });

  if (input.date) await bumpDateDemand(input.date).catch(() => null);

  // Fire-and-forget: the visitor's response never waits on the email alert.
  notifyNewLead({ id: row.id, ...lead, source: input.source }).catch(() => null);

  return NextResponse.json({ ok: true, persisted: true, id: row.id, estimate: result?.price ?? null }, { status: 201 });
}

/** GET /api/quote — latest 50 inquiries. Protected by ADMIN_TOKEN (Bearer). Superseded by /api/leads for the admin UI; kept for scripted exports. */
export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  const auth = req.headers.get("authorization");
  if (!token || auth !== `Bearer ${token}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isDbConfigured) return NextResponse.json({ ok: true, inquiries: [] });
  const rows = await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt)).limit(50);
  return NextResponse.json({ ok: true, inquiries: rows });
}
