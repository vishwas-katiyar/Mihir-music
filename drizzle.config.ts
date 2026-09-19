import { defineConfig } from "drizzle-kit";

// drizzle-kit only auto-loads .env; pull .env.local too (Node ≥ 21 has loadEnvFile).
try {
  process.loadEnvFile(".env.local");
} catch {
  /* no .env.local (e.g. CI with real env vars) */
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
