-- Initial schema for Mihir Sound & Light (Vercel Postgres)
-- Apply with: npm run db:push   (or paste into the Vercel Postgres query console)

CREATE TABLE IF NOT EXISTS "inquiries" (
  "id" serial PRIMARY KEY,
  "name" text,
  "phone" text,
  "event_type" text NOT NULL,
  "crowd_size" text NOT NULL,
  "venue_type" text NOT NULL,
  "venue_city" text,
  "event_date" text,
  "estimated_budget_low" integer NOT NULL,
  "estimated_budget_high" integer NOT NULL,
  "rig" text,
  "source" text DEFAULT 'estimator',
  "created_at" timestamptz DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "inquiries_event_date_idx" ON "inquiries" ("event_date");
CREATE INDEX IF NOT EXISTS "inquiries_created_at_idx" ON "inquiries" ("created_at");

CREATE TABLE IF NOT EXISTS "inventory_items" (
  "id" serial PRIMARY KEY,
  "group" text NOT NULL,
  "category" text NOT NULL,
  "equipment" text NOT NULL,
  "model" text NOT NULL,
  "qty" text NOT NULL,
  "spec" text,
  "available" boolean DEFAULT true NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
