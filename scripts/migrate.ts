/**
 * Apply every drizzle/*.sql file in order, tracking applied files in `_migrations`.
 * Non-interactive (CI-safe) alternative to `drizzle-kit push`.
 *   npm run db:migrate     (node --env-file=.env.local scripts/migrate.ts)
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool } from "pg";

async function main() {
  const url = (process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL)?.replace("sslmode=require", "sslmode=verify-full");
  if (!url) throw new Error("POSTGRES_URL missing. Copy it into .env.local (see .env.example).");
  const pool = new Pool({ connectionString: url, ssl: url.includes("sslmode=") ? { rejectUnauthorized: true } : undefined });

  await pool.query(`CREATE TABLE IF NOT EXISTS "_migrations" ("name" text PRIMARY KEY, "applied_at" timestamptz DEFAULT now() NOT NULL)`);
  const { rows } = await pool.query<{ name: string }>(`SELECT name FROM "_migrations"`);
  const applied = new Set(rows.map((r) => r.name));

  const dir = join(process.cwd(), "drizzle");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip   ${file}`);
      continue;
    }
    const sql = await readFile(join(dir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(`INSERT INTO "_migrations" (name) VALUES ($1)`, [file]);
      await client.query("COMMIT");
      console.log(`applied ${file}`);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }

  const tables = await pool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log("tables:", tables.rows.map((r) => r.table_name).join(", "));
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
