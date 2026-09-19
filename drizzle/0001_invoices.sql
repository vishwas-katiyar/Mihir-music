-- Invoices: admin-authored at /invoice, shared read-only at /i/<token>.
-- Money is stored as integer paise. Apply with: npm run db:migrate

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" serial PRIMARY KEY,
  "invoice_number" text NOT NULL,
  "token" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  "issue_date" text NOT NULL,
  "due_date" text,
  "event_title" text,
  "event_start" text,
  "event_end" text,
  "venue" text,
  "client_name" text NOT NULL,
  "client_phone" text,
  "client_email" text,
  "client_address" text,
  "items" jsonb NOT NULL,
  "discount_paise" integer NOT NULL DEFAULT 0,
  "gst_rate_bp" integer NOT NULL DEFAULT 0,
  "advance_paid_paise" integer NOT NULL DEFAULT 0,
  "subtotal_paise" integer NOT NULL,
  "gst_paise" integer NOT NULL DEFAULT 0,
  "grand_total_paise" integer NOT NULL,
  "balance_due_paise" integer NOT NULL,
  "notes" text,
  "terms" jsonb NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  "paid_at" timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_number_uq" ON "invoices" ("invoice_number");
CREATE UNIQUE INDEX IF NOT EXISTS "invoices_token_uq" ON "invoices" ("token");
CREATE INDEX IF NOT EXISTS "invoices_client_idx" ON "invoices" ("client_name");
CREATE INDEX IF NOT EXISTS "invoices_created_idx" ON "invoices" ("created_at");
