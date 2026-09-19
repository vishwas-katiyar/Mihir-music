-- Invoices created with the interim default terms get the original clauses back.
-- Only rows whose terms exactly equal the interim default are touched; edited terms stay.
UPDATE "invoices"
SET "terms" = '["Payment Terms: Payment is due within 30 days from the date of the invoice.","Cancellation Policy: Cancellations within 7 days may incur up to 50% fee.","Liability: Not responsible for damages caused by misuse or accidents.","Equipment: Must be returned in delivered condition; damages are charged.","Insurance: Clients must arrange adequate insurance for rented equipment.","Confidentiality: Client information is kept confidential."]'::jsonb,
    "updated_at" = now()
WHERE "terms" = '["Payment is due within 30 days of the invoice date unless agreed otherwise.","Cancellations within 7 days of the event may incur up to 50% of the invoice value.","Equipment must be returned in delivered condition; damage or loss is charged at replacement cost.","The client arranges venue power, access, permissions and security for equipment on site.","Advance payments are non-refundable once crew and equipment are blocked for the date."]'::jsonb;
