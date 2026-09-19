import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { todayIST } from "./calc";

/**
 * Admin session for /invoice.
 *
 * Password: today's date in IST as DDMMYYYY (per the owner's spec). Anyone who knows
 * the rule can derive it, so `INVOICE_PASSWORD` in the environment overrides it with a
 * real secret when set. Sessions are HMAC-signed HttpOnly cookies, 12 hours.
 */

export const SESSION_COOKIE = "msl_invoice_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  const s = process.env.INVOICE_SESSION_SECRET ?? process.env.ADMIN_TOKEN;
  if (!s) {
    if (process.env.NODE_ENV === "production") throw new Error("Set ADMIN_TOKEN or INVOICE_SESSION_SECRET");
    return "dev-only-insecure-secret";
  }
  return s;
}

/** DDMMYYYY for Asia/Kolkata today. */
export function expectedDatePassword(): string {
  const [y, m, d] = todayIST().split("-");
  return `${d}${m}${y}`;
}

export function passwordIsValid(candidate: string): boolean {
  const input = Buffer.from(candidate.trim());
  const accepted = [process.env.INVOICE_PASSWORD, expectedDatePassword()].filter((v): v is string => Boolean(v));
  return accepted.some((p) => {
    const buf = Buffer.from(p);
    return buf.length === input.length && timingSafeEqual(buf, input);
  });
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionValue(now = Date.now()): string {
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

export function verifySessionValue(value: string | undefined, now = Date.now()): boolean {
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < now) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};

/** Server components / route handlers: is the current request an authenticated admin? */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionValue(jar.get(SESSION_COOKIE)?.value);
}
