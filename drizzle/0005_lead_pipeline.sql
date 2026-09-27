-- Turns raw inquiries into a workable pipeline: status, when the crew followed up, and freeform notes.
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'new';
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "contacted_at" timestamptz;
ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "admin_notes" text;
CREATE INDEX IF NOT EXISTS "inquiries_status_idx" ON "inquiries" ("status");
