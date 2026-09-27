import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/invoices/auth";
import { isDbConfigured } from "@/lib/db";
import { leadSummary, listLeads, type ListLeadStatus } from "@/lib/leads/repo";
import { isLeadStatus } from "@/lib/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorised = () => NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
const noDb = () => NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

/** GET /api/leads?q=&status= — same admin session as /invoice. */
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorised();
  if (!isDbConfigured) return noDb();
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const statusParam = req.nextUrl.searchParams.get("status") ?? "all";
  const status: ListLeadStatus = statusParam === "all" || isLeadStatus(statusParam) ? (statusParam as ListLeadStatus) : "all";
  const [rows, summary] = await Promise.all([listLeads({ q, status }), leadSummary()]);
  return NextResponse.json({ ok: true, leads: rows, summary });
}
