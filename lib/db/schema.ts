import { pgTable, serial, text, integer, timestamp, boolean, index, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Inquiries — every estimate sent from the 3D estimator or the contact form.
 * Budget is stored in INR as integers (low/high of the range shown to the visitor).
 */
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    name: text("name"),
    phone: text("phone"),
    eventType: text("event_type").notNull(),
    crowdSize: text("crowd_size").notNull(),
    venueType: text("venue_type").notNull(),
    venueCity: text("venue_city"),
    eventDate: text("event_date"), // ISO yyyy-mm-dd; kept as text so partial/unknown dates are allowed
    estimatedBudgetLow: integer("estimated_budget_low").notNull(),
    estimatedBudgetHigh: integer("estimated_budget_high").notNull(),
    rig: text("rig"), // JSON snapshot of the rig config the visitor saw
    source: text("source").default("estimator"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("inquiries_event_date_idx").on(t.eventDate), index("inquiries_created_at_idx").on(t.createdAt)],
);

/** InventoryItems — mirrors lib/gear.ts so availability can later be tracked per unit. */
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  group: text("group").notNull(),
  category: text("category").notNull(),
  equipment: text("equipment").notNull(),
  model: text("model").notNull(),
  qty: text("qty").notNull(),
  spec: text("spec"),
  available: boolean("available").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/** A billed line. Quantities may be fractional (hours, days); money in paise. */
export interface InvoiceLine {
  title: string;
  description: string;
  quantity: number;
  /** Unit rate in paise */
  ratePaise: number;
}

/**
 * Invoices — created and edited by the admin at /invoice, shared with clients at /i/<token>.
 * All money columns are integer paise to avoid floating-point drift.
 */
export const invoices = pgTable(
  "invoices",
  {
    id: serial("id").primaryKey(),
    invoiceNumber: text("invoice_number").notNull(),
    token: text("token").notNull(),
    status: text("status").notNull().default("draft"), // draft | sent | partially_paid | paid | cancelled
    issueDate: text("issue_date").notNull(), // YYYY-MM-DD
    dueDate: text("due_date"),
    eventTitle: text("event_title"),
    eventStart: text("event_start"),
    eventEnd: text("event_end"),
    venue: text("venue"),
    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone"),
    clientEmail: text("client_email"),
    clientAddress: text("client_address"),
    items: jsonb("items").$type<InvoiceLine[]>().notNull(),
    discountPaise: integer("discount_paise").notNull().default(0),
    gstRateBp: integer("gst_rate_bp").notNull().default(0), // basis points: 1800 = 18%
    advancePaidPaise: integer("advance_paid_paise").notNull().default(0),
    subtotalPaise: integer("subtotal_paise").notNull(),
    gstPaise: integer("gst_paise").notNull().default(0),
    grandTotalPaise: integer("grand_total_paise").notNull(),
    balanceDuePaise: integer("balance_due_paise").notNull(),
    notes: text("notes"),
    terms: jsonb("terms").$type<string[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("invoices_number_uq").on(t.invoiceNumber),
    uniqueIndex("invoices_token_uq").on(t.token),
    index("invoices_client_idx").on(t.clientName),
    index("invoices_created_idx").on(t.createdAt),
  ],
);

export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;

export type Inquiry = typeof inquiries.$inferSelect;
export type NewInquiry = typeof inquiries.$inferInsert;
export type InventoryItem = typeof inventoryItems.$inferSelect;
