import type { InvoiceRow } from "@/lib/db/schema";
import type { InvoiceInput } from "./calc";

/** Row → editor form values (what the admin edits). */
export function rowToInput(r: InvoiceRow): InvoiceInput {
  return {
    issueDate: r.issueDate,
    dueDate: r.dueDate ?? "",
    eventTitle: r.eventTitle ?? "",
    eventStart: r.eventStart ?? "",
    eventEnd: r.eventEnd ?? "",
    venue: r.venue ?? "",
    clientName: r.clientName,
    clientPhone: r.clientPhone ?? "",
    clientEmail: r.clientEmail ?? "",
    clientAddress: r.clientAddress ?? "",
    items: r.items,
    discountPaise: r.discountPaise,
    gstRateBp: r.gstRateBp,
    advancePaidPaise: r.advancePaidPaise,
    notes: r.notes ?? "",
    terms: r.terms,
    status: r.status as InvoiceInput["status"],
  };
}

/** Row → JSON-safe object for API responses (Dates become ISO strings). */
export function rowToJson(r: InvoiceRow) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
  };
}
export type InvoiceJson = ReturnType<typeof rowToJson>;
