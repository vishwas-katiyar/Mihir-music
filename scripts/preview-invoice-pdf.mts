/**
 * Renders sample invoices to PDF without touching the database, so the layout can be
 * checked (and rasterised) locally.
 *
 *   npx tsx scripts/preview-invoice-pdf.mts <out-dir>
 *
 * Writes partial.pdf (advance received, balance due with UPI), paid.pdf, cancelled.pdf
 * and long.pdf (14 lines with GST, to check page breaks).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "../components/invoice/InvoicePdf";
import { upiQrDataUrl } from "../lib/invoices/upi";
import { computeTotals, DEFAULT_TERMS } from "../lib/invoices/calc";
import type { InvoiceRow, InvoiceLine, InvoicePayment } from "../lib/db/schema";

const outDir = process.argv[2] ?? ".preview";
mkdirSync(outDir, { recursive: true });
const logo = readFileSync(path.join(process.cwd(), "public", "logo.png"));

function row(partial: Partial<InvoiceRow> & { items: InvoiceLine[]; payments?: InvoicePayment[]; discountPaise?: number; gstRateBp?: number }): InvoiceRow {
  const payments = partial.payments ?? [];
  const paid = payments.reduce((s, p) => s + p.amountPaise, 0);
  const t = computeTotals(partial.items, partial.discountPaise ?? 0, partial.gstRateBp ?? 0, paid);
  const now = new Date();
  return {
    id: 1,
    invoiceNumber: "MSL-2026-0042",
    token: "previewtoken_previewtoken",
    status: t.balanceDuePaise === 0 ? "paid" : paid > 0 ? "partially_paid" : "sent",
    issueDate: "2026-09-19",
    dueDate: "2026-10-03",
    eventTitle: "Sangeet night, Sharma wedding",
    eventStart: "2026-11-21",
    eventEnd: "2026-11-21",
    venue: "Sayaji Hotel lawns, Indore",
    clientName: "Rajesh Sharma",
    clientPhone: "+91 98260 12345",
    clientEmail: "rajesh.sharma@example.com",
    clientAddress: "12 Saket Nagar, Indore, Madhya Pradesh 452018",
    notes: "Load-in from 2 pm on the event day. Generator and stage power to be arranged by the venue.",
    terms: DEFAULT_TERMS,
    createdAt: now,
    updatedAt: now,
    paidAt: t.balanceDuePaise === 0 ? now : null,
    deletedAt: null,
    ...partial,
    payments,
    discountPaise: t.discountPaise,
    gstRateBp: partial.gstRateBp ?? 0,
    advancePaidPaise: t.advancePaidPaise,
    subtotalPaise: t.subtotalPaise,
    gstPaise: t.gstPaise,
    grandTotalPaise: t.grandTotalPaise,
    balanceDuePaise: t.balanceDuePaise,
  };
}

const baseItems: InvoiceLine[] = [
  { title: "Line array PA system", description: "JBL VT 6 a side with 3 cardioid subs a side, Soundcraft Si Impact, FOH engineer", quantity: 1, ratePaise: 6500000 },
  { title: "Moving head lighting package", description: "16 Clay Paky Sharpy beams, 12 pixel bars, haze, Avolites Tiger Touch with operator", quantity: 1, ratePaise: 4500000 },
  { title: "Truss and stage", description: "12 m front truss, 14 x 6 m deck with entry ramp and skirting", quantity: 1, ratePaise: 3000000 },
  { title: "Cold pyro units", description: "Stage-safe cold spark fountains for the couple entry", quantity: 4, ratePaise: 250000 },
  { title: "Crew travel and accommodation", description: "", quantity: 1, ratePaise: 800000 },
];

const pay = (id: string, date: string, amountPaise: number, method: InvoicePayment["method"], reference = ""): InvoicePayment => ({ id, date, amountPaise, method, reference, note: "" });

const samples: Record<string, InvoiceRow> = {
  partial: row({ items: baseItems, discountPaise: 500000, payments: [pay("p1", "2026-09-10", 5000000, "upi", "UTR 42781XXXX")] }),
  paid: row({ items: baseItems, discountPaise: 500000, payments: [pay("p1", "2026-09-10", 5000000, "upi", "UTR 42781XXXX"), pay("p2", "2026-11-22", 10800000, "bank", "NEFT ref 9931")] }),
  cancelled: row({ items: baseItems.slice(0, 3), status: "cancelled" }),
  long: row({
    invoiceNumber: "MSL-2026-0043",
    gstRateBp: 1800,
    items: [...baseItems, ...baseItems, ...baseItems.slice(0, 4)].map((l, i) => ({ ...l, title: `${l.title} ${i + 1}` })),
    payments: [pay("p1", "2026-09-10", 2500000, "cash")],
  }),
};

for (const [name, inv] of Object.entries(samples)) {
  const qr = inv.balanceDuePaise > 0 && inv.status !== "cancelled" ? await upiQrDataUrl(inv.balanceDuePaise, inv.invoiceNumber) : undefined;
  const buf = await renderToBuffer(createElement(InvoicePdf, { invoice: inv, logoSrc: logo, qrSrc: qr, shareUrl: `https://mihir-music.vercel.app/i/${inv.token}` }));
  const out = path.join(outDir, `${name}.pdf`);
  writeFileSync(out, buf);
  console.log(out, `${buf.length}B`);
}
