import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { passwordIsValid, createSessionValue, SESSION_COOKIE, sessionCookieOptions } from "@/lib/invoices/auth";
import { rateLimit } from "@/lib/db/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { password } → sets the admin session cookie. Rate limited per IP via KV. */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const rl = await rateLimit(`invoice-login:${ip}`, 10, 300);
  if (!rl.ok) return NextResponse.json({ ok: false, error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const parsed = z.object({ password: z.string().min(1).max(64) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Password required" }, { status: 400 });
  if (!passwordIsValid(parsed.data.password)) {
    return NextResponse.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionValue(), sessionCookieOptions);
  return res;
}

/** DELETE → logout */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
