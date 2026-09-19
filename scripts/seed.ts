/**
 * Seed inventory_items from lib/gear.ts and warm the KV availability snapshot.
 *   npm run db:seed        (node --env-file=.env.local scripts/seed.ts)
 * Node ≥ 22.6 runs TypeScript directly via type stripping.
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { inventoryItems } from "../lib/db/schema.ts";
import { gear } from "../lib/gear.ts";
import { setInventoryAvailability } from "../lib/db/kv.ts";

async function main() {
  const url = (process.env.POSTGRES_URL ?? process.env.DATABASE_URL)?.replace("sslmode=require", "sslmode=verify-full");
  if (!url) throw new Error("POSTGRES_URL missing. Copy it into .env.local (see .env.example).");
  const pool = new Pool({ connectionString: url, ssl: url.includes("sslmode=") ? { rejectUnauthorized: true } : undefined });
  const db = drizzle(pool);

  await db.delete(inventoryItems);
  const rows = gear.flatMap((g) =>
    g.items.map((it) => ({
      group: g.title,
      category: it.category,
      equipment: it.equipment,
      model: it.model,
      qty: it.qty,
      spec: it.spec,
      available: true,
    })),
  );
  await db.insert(inventoryItems).values(rows);
  console.log(`Seeded ${rows.length} inventory items`);

  await setInventoryAvailability({
    updatedAt: new Date().toISOString(),
    items: rows.map((r) => ({ equipment: r.equipment, available: true })),
  });
  console.log("KV availability snapshot written");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
