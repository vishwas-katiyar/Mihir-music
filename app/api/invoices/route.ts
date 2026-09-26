import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/invoices/auth";
import { InvoiceInputSchema, INVOICE_STATUSES } from "@/lib/invoices/calc";
import { createInvoice, listInvoices, summary, InvoiceRuleError, type ListStatus } from "@/lib/invoices/repo";
import { rowToJson } from "@/lib/invoices/serialize";
import { isDbConfigured } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const unauthorised = () => NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
const noDb = () => NextResponse.json({ ok: false, error: "Database not configured" }, { status: 503 });

/** GET /api/invoices?q=&status= */
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return unauthorised();
  if (!isDbConfigured) return noDb();
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const statusParam = req.nextUrl.searchParams.get("status") ?? "all";
  const status: ListStatus = statusParam === "deleted" || (INVOICE_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as ListStatus) : "all";
  const [rows, stats] = await Promise.all([listInvoices({ q, status }), summary()]);
  return NextResponse.json({ ok: true, invoices: rows.map(rowToJson), summary: stats });
}

/** POST /api/invoices → create */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return unauthorised();
  if (!isDbConfigured) return noDb();
  const parsed = InvoiceInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid invoice" }, { status: 400 });
  }
  try {
    const row = await createInvoice(parsed.data);
    return NextResponse.json({ ok: true, invoice: rowToJson(row) }, { status: 201 });
  } catch (e) {
    if (e instanceof InvoiceRuleError) return NextResponse.json({ ok: false, error: e.message }, { status: 409 });
    throw e;
  }
}
