-- Deleting an invoice now only stamps deleted_at; it can be restored from the admin "Deleted" filter.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
CREATE INDEX IF NOT EXISTS "invoices_deleted_idx" ON "invoices" ("deleted_at");
