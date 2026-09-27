import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/invoices/auth";
import { getLeadById, updateLead } from "@/lib/leads/repo";
import { LEAD_STATUSES } from "@/lib/leads/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const unauthorised = () => NextResponse.json({ ok: false, error: "Sign in required" }, { status: 401 });
const notFound = () => NextResponse.json({ ok: false, error: "Lead not found" }, { status: 404 });
const parseId = (raw: string) => {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
};

const PatchSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorised();
  const id = parseId((await params).id);
  if (!id) return notFound();
  const row = await getLeadById(id);
  return row ? NextResponse.json({ ok: true, lead: row }) : notFound();
}

/** PATCH { status?, adminNotes? } */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!(await isAdmin())) return unauthorised();
  const id = parseId((await params).id);
  if (!id) return notFound();
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid patch" }, { status: 400 });
  const row = await updateLead(id, parsed.data);
  return row ? NextResponse.json({ ok: true, lead: row }) : notFound();
}
