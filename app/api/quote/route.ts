import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db, isDbConfigured, schema } from "@/lib/db";
import { bumpDateDemand, rateLimit } from "@/lib/db/kv";
import { estimate, eventTypes, crowdSizes, venueTypes } from "@/lib/estimator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ids = <T extends readonly { id: string }[]>(list: T) => list.map((x) => x.id) as [T[number]["id"], ...T[number]["id"][]];

const QuoteSchema = z.object({
  eventType: z.enum(ids(eventTypes)),
  crowd: z.enum(ids(crowdSizes)),
  venue: z.enum(ids(venueTypes)),
  name: z.string().trim().max(80).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), "Enter a valid mobile number")
    .optional(),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  source: z.enum(["estimator", "drawer", "contact"]).default("estimator"),
  // honeypot — bots fill it, humans never see it
  website: z.string().max(0).optional(),
});

/**
 * POST /api/quote — persist an estimator inquiry.
 * The server re-runs the pricing model so the stored budget can't be tampered with client-side.
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
  const result = estimate({ eventType: input.eventType, crowd: input.crowd, venue: input.venue });

  if (!isDbConfigured) {
    // No database attached yet — still a success from the visitor's point of view.
    return NextResponse.json({ ok: true, persisted: false, estimate: result.price });
  }

  const [row] = await db
    .insert(schema.inquiries)
    .values({
      name: input.name || null,
      phone: input.phone || null,
      eventType: result.labels.eventType,
      crowdSize: result.labels.crowd,
      venueType: result.labels.venue,
      venueCity: input.city || null,
      eventDate: input.date || null,
      estimatedBudgetLow: result.price.low,
      estimatedBudgetHigh: result.price.high,
      rig: JSON.stringify(result.rig),
      source: input.source,
    })
    .returning({ id: schema.inquiries.id });

  if (input.date) await bumpDateDemand(input.date).catch(() => null);

  return NextResponse.json({ ok: true, persisted: true, id: row.id, estimate: result.price }, { status: 201 });
}

/** GET /api/quote — latest 50 inquiries. Protected by ADMIN_TOKEN (Bearer). */
export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  const auth = req.headers.get("authorization");
  if (!token || auth !== `Bearer ${token}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (!isDbConfigured) return NextResponse.json({ ok: true, inquiries: [] });
  const rows = await db.select().from(schema.inquiries).orderBy(desc(schema.inquiries.createdAt)).limit(50);
  return NextResponse.json({ ok: true, inquiries: rows });
}
