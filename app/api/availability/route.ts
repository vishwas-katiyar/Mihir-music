import { NextResponse, type NextRequest } from "next/server";
import { getDateDemand, getInventoryAvailability, isKvConfigured } from "@/lib/db/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/availability?date=YYYY-MM-DD
 * KV-backed, sub-10 ms lookup used by the estimator while the visitor types a date.
 * `demand` is the number of inquiries already logged for that date.
 */
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ ok: false, error: "date must be YYYY-MM-DD" }, { status: 400 });
  }
  const [demand, inventory] = await Promise.all([getDateDemand(date), getInventoryAvailability()]);
  const d = new Date(date + "T00:00:00");
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const level = demand >= 3 ? "high" : demand >= 1 || weekend ? "moderate" : "open";
  return NextResponse.json(
    { ok: true, date, demand, level, weekend, inventory, cached: isKvConfigured },
    { headers: { "Cache-Control": "no-store" } },
  );
}
