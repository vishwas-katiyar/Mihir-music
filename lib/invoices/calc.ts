import { z } from "zod";
import type { InvoiceLine, InvoicePayment } from "@/lib/db/schema";

/**
 * Shared invoice math and validation. Used by the editor (live totals), the API
 * (authoritative totals on save) and the PDF, so every surface agrees to the paise.
 */

export const INVOICE_STATUSES = ["draft", "sent", "partially_paid", "paid", "cancelled"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const STATUS_LABEL: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  partially_paid: "Partially paid",
  paid: "Paid",
  cancelled: "Cancelled",
};

export const DEFAULT_TERMS = [
  "Payment is due within 30 days of the invoice date unless agreed otherwise.",
  "Cancellations within 7 days of the event may incur up to 50% of the invoice value.",
  "Equipment must be returned in delivered condition; damage or loss is charged at replacement cost.",
  "The client arranges venue power, access, permissions and security for equipment on site.",
  "Advance payments are non-refundable once crew and equipment are blocked for the date.",
];

/** Money helpers: rupees (number, 2 dp) <-> paise (integer). */
export const toPaise = (rupees: number) => Math.round((Number.isFinite(rupees) ? rupees : 0) * 100);
export const toRupees = (paise: number) => paise / 100;
export const inr = (paise: number, opts: { symbol?: boolean } = {}) => {
  const v = toRupees(paise).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return opts.symbol === false ? `INR ${v}` : `₹${v}`;
};

export interface Totals {
  subtotalPaise: number;
  discountPaise: number;
  taxablePaise: number;
  gstPaise: number;
  grandTotalPaise: number;
  advancePaidPaise: number;
  balanceDuePaise: number;
}

export const lineAmountPaise = (l: InvoiceLine) => Math.round(l.quantity * l.ratePaise);

export const PAYMENT_METHODS = ["upi", "cash", "bank", "card", "other"] as const;
export const METHOD_LABEL: Record<InvoicePayment["method"], string> = { upi: "UPI", cash: "Cash", bank: "Bank transfer", card: "Card", other: "Other" };

export const PaymentInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  amountPaise: z.number().int().min(1, "Amount must be more than zero"),
  method: z.enum(PAYMENT_METHODS).default("upi"),
  reference: z.string().trim().max(80).default(""),
  note: z.string().trim().max(200).default(""),
});
export type PaymentInput = z.infer<typeof PaymentInputSchema>;

export const sumPayments = (payments: InvoicePayment[]) => payments.reduce((s, p) => s + Math.max(0, Math.round(p.amountPaise)), 0);

export function computeTotals(items: InvoiceLine[], discountPaise: number, gstRateBp: number, advancePaidPaise: number): Totals {
  const subtotalPaise = items.reduce((s, l) => s + lineAmountPaise(l), 0);
  const discount = Math.min(Math.max(0, Math.round(discountPaise)), subtotalPaise);
  const taxablePaise = subtotalPaise - discount;
  const gstPaise = Math.round((taxablePaise * Math.max(0, gstRateBp)) / 10_000);
  const grandTotalPaise = taxablePaise + gstPaise;
  const advance = Math.max(0, Math.round(advancePaidPaise));
  const balanceDuePaise = Math.max(grandTotalPaise - advance, 0);
  return { subtotalPaise, discountPaise: discount, taxablePaise, gstPaise, grandTotalPaise, advancePaidPaise: advance, balanceDuePaise };
}

/** Suggests a status from money state; the admin can still override. */
export function suggestStatus(t: Totals, current: InvoiceStatus): InvoiceStatus {
  if (current === "cancelled") return current;
  if (t.grandTotalPaise > 0 && t.balanceDuePaise === 0) return "paid";
  if (t.advancePaidPaise > 0 && t.balanceDuePaise > 0) return "partially_paid";
  return current === "paid" || current === "partially_paid" ? "sent" : current;
}

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const LineSchema = z.object({
  title: z.string().trim().max(120),
  description: z.string().trim().max(500).default(""),
  quantity: z.number().min(0).max(1_000_000),
  ratePaise: z.number().int().min(0).max(1_000_000_000_00),
});

export const InvoiceInputSchema = z.object({
  issueDate: isoDate,
  dueDate: isoDate.optional().or(z.literal("")),
  eventTitle: z.string().trim().max(160).optional().or(z.literal("")),
  eventStart: isoDate.optional().or(z.literal("")),
  eventEnd: isoDate.optional().or(z.literal("")),
  venue: z.string().trim().max(200).optional().or(z.literal("")),
  clientName: z.string().trim().min(1, "Client name is required").max(160),
  clientPhone: z.string().trim().max(30).optional().or(z.literal("")),
  clientEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  clientAddress: z.string().trim().max(600).optional().or(z.literal("")),
  items: z.array(LineSchema).min(1, "Add at least one line").max(60),
  discountPaise: z.number().int().min(0).default(0),
  gstRateBp: z.number().int().min(0).max(2800).default(0),
  /** Only honoured on create: an advance already in hand becomes the first payment. */
  initialPayment: PaymentInputSchema.optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  terms: z.array(z.string().trim().max(400)).max(20).default(DEFAULT_TERMS),
  status: z.enum(INVOICE_STATUSES).default("draft"),
});

export type InvoiceInput = z.infer<typeof InvoiceInputSchema>;

/** Drops lines that are entirely blank so an untouched trailing row never saves. */
export function pruneLines(items: InvoiceLine[]): InvoiceLine[] {
  return items.filter((l) => l.title.trim() || l.description.trim() || l.quantity > 0 || l.ratePaise > 0);
}

export const emptyLine = (): InvoiceLine => ({ title: "", description: "", quantity: 1, ratePaise: 0 });

/** Today's date in Asia/Kolkata as YYYY-MM-DD. */
export function todayIST(): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function formatDateIN(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
