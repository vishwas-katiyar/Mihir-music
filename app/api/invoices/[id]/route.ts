import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/invoices/auth";
import { InvoiceInputSchema, INVOICE_STATUSES } from "@/lib/invoices/calc";
import { deleteInvoice, getInvoiceById, rotateToken, setStatus, updateInvoice } from "@/lib/invoices/repo";
import { rowToJson } from "@/lib/invoices/serialize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const unauthorised = () => NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
const notFound = () => NextResponse.json({ ok: false, error: "Invoice not found" }, { status: 404 });
const parseId = (raw: string) => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorised();
  const id = parseId((await params).id);
  if (!id) return notFound();
  const row = await getInvoiceById(id);
  return row ? NextResponse.json({ ok: true, invoice: rowToJson(row) }) : notFound();
}

/** PUT: full replace of editable fields (totals recomputed server-side). */
export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorised();
  const id = parseId((await params).id);
  if (!id) return notFound();
  const parsed = InvoiceInputSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json({ ok: false, error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid invoice" }, { status: 400 });
  }
  const row = await updateInvoice(id, parsed.data);
  return row ? NextResponse.json({ ok: true, invoice: rowToJson(row) }) : notFound();
}

const PatchSchema = z.union([z.object({ status: z.enum(INVOICE_STATUSES) }), z.object({ rotateToken: z.literal(true) })]);

/** PATCH: { status } or { rotateToken: true } */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorised();
  const id = parseId((await params).id);
  if (!id) return notFound();
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid patch" }, { status: 400 });
  const row = "status" in parsed.data ? await setStatus(id, parsed.data.status) : await rotateToken(id);
  return row ? NextResponse.json({ ok: true, invoice: rowToJson(row) }) : notFound();
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorised();
  const id = parseId((await params).id);
  if (!id) return notFound();
  return (await deleteInvoice(id)) ? NextResponse.json({ ok: true }) : notFound();
}
