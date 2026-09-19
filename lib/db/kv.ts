import { kv } from "@vercel/kv";

/**
 * Vercel KV (Upstash Redis) — hot cache in front of Postgres.
 *   demand:<yyyy-mm-dd>   → number of inquiries for that date (drives the "high demand" hint)
 *   inventory:availability→ JSON snapshot of unit availability (refreshed by admin/seed)
 *   rl:<ip>               → sliding-window rate limit for the quote endpoint
 */
export const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

const DEMAND_TTL = 60 * 60 * 24 * 400; // keep a year+ of date demand

export async function bumpDateDemand(date: string) {
  if (!isKvConfigured) return null;
  const key = `demand:${date}`;
  const n = await kv.incr(key);
  if (n === 1) await kv.expire(key, DEMAND_TTL);
  return n;
}

export async function getDateDemand(date: string) {
  if (!isKvConfigured) return 0;
  return (await kv.get<number>(`demand:${date}`)) ?? 0;
}

export interface AvailabilitySnapshot {
  updatedAt: string;
  items: { equipment: string; available: boolean }[];
}

export async function getInventoryAvailability() {
  if (!isKvConfigured) return null;
  return kv.get<AvailabilitySnapshot>("inventory:availability");
}

export async function setInventoryAvailability(snapshot: AvailabilitySnapshot) {
  if (!isKvConfigured) return;
  await kv.set("inventory:availability", snapshot, { ex: 60 * 60 * 6 });
}

/** Fixed-window limiter: `limit` hits per `windowSec` per key. Fails open without KV. */
export async function rateLimit(key: string, limit = 8, windowSec = 60) {
  if (!isKvConfigured) return { ok: true, remaining: limit };
  const k = `rl:${key}:${Math.floor(Date.now() / 1000 / windowSec)}`;
  const n = await kv.incr(k);
  if (n === 1) await kv.expire(k, windowSec);
  return { ok: n <= limit, remaining: Math.max(0, limit - n) };
}
