-- Payment history per invoice. advance_paid_paise now stores the running total of payments.
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "payments" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill: an existing advance becomes the first recorded payment.
UPDATE "invoices"
SET "payments" = jsonb_build_array(jsonb_build_object(
  'id', 'legacy-advance',
  'date', "issue_date",
  'amountPaise', "advance_paid_paise",
  'method', 'other',
  'reference', '',
  'note', 'Advance recorded before payment history existed'
))
WHERE "advance_paid_paise" > 0 AND ("payments" IS NULL OR "payments" = '[]'::jsonb);
