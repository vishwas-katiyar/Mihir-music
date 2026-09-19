import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Postgres via Drizzle + node-postgres (TCP, SSL). Works with Prisma Postgres, Neon,
 * Supabase or any standard Postgres. `POSTGRES_URL` (or `DATABASE_URL`) is read from
 * .env.local locally and from Vercel env vars in production.
 *
 * `isDbConfigured` lets API routes degrade gracefully: without a database the site
 * still works, WhatsApp remains the primary lead channel, we just skip persistence.
 */
// pg ≥ 8.16 warns that `sslmode=require` semantics are changing; we verify certs anyway, so say so explicitly.
const connectionString = (process.env.POSTGRES_URL ?? process.env.DATABASE_URL)?.replace("sslmode=require", "sslmode=verify-full");
export const isDbConfigured = Boolean(connectionString);

// Reuse one pool across hot reloads / lambda invocations
const globalForDb = globalThis as unknown as { __mihirPool?: Pool };

function createPool() {
  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ssl: connectionString?.includes("sslmode=") ? { rejectUnauthorized: true } : undefined,
  });
}

export const pool = globalForDb.__mihirPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__mihirPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
