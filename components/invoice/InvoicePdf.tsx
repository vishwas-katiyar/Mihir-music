import { existsSync } from "node:fs";
import path from "node:path";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, lineAmountPaise, formatDateIN, amountInWords, METHOD_LABEL, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { UPI } from "@/lib/invoices/upi";
import { site } from "@/lib/site";

/**
 * Typefaces. Inter for the document (neutral, tabular numerals, has the rupee glyph);
 * Space Grotesk only for the business name so it matches the website. Both ship in
 * /public/fonts via `node scripts/fetch-fonts.mjs`. If the files are missing in some
 * environment we fall back to Helvetica and print "INR" instead of the ₹ sign.
 */
const fontDir = path.join(process.cwd(), "public", "fonts");
const interFiles = { 400: "Inter-400.ttf", 500: "Inter-500.ttf", 600: "Inter-600.ttf", 700: "Inter-700.ttf" } as const;
const groteskFile = "SpaceGrotesk-700.ttf";
const hasInter = Object.values(interFiles).every((f) => existsSync(path.join(fontDir, f)));
const hasGrotesk = existsSync(path.join(fontDir, groteskFile));

if (hasInter) {
  Font.register({
    family: "Inter",
    fonts: Object.entries(interFiles).map(([w, f]) => ({ src: path.join(fontDir, f), fontWeight: Number(w) })),
  });
}
if (hasGrotesk) Font.register({ family: "Space Grotesk", fonts: [{ src: path.join(fontDir, groteskFile), fontWeight: 700 }] });
Font.registerHyphenationCallback((word) => [word]);

const FAMILY = hasInter ? "Inter" : "Helvetica";
const BRAND_FAMILY = hasGrotesk ? "Space Grotesk" : hasInter ? "Inter" : "Helvetica-Bold";
const W = (weight: 500 | 600 | 700) => (hasInter ? { fontWeight: weight } : { fontFamily: "Helvetica-Bold" as const });
const money = (p: number) => (hasInter ? inr(p) : inr(p, { symbol: false }));

const c = {
  ink: "#111827",
  body: "#374151",
  muted: "#6b7280",
  faint: "#9ca3af",
  line: "#d1d5db",
  hair: "#e5e7eb",
  zebra: "#f9fafb",
  panel: "#f3f4f6",
  dark: "#0b0c10",
  gold: "#ffb800",
  green: "#047857",
  greenBg: "#ecfdf5",
  red: "#b42318",
  redBg: "#fef2f2",
  amber: "#92400e",
  amberBg: "#fffbeb",
  sky: "#075985",
  skyBg: "#f0f9ff",
};

const M = 36; // page margin in points
const COL = { no: 26, qty: 48, rate: 92, amt: 104 };

const s = StyleSheet.create({
  page: { fontFamily: FAMILY, fontSize: 9, color: c.body, paddingTop: M, paddingHorizontal: M, paddingBottom: 58, lineHeight: 1.35 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { flexDirection: "row", gap: 12, alignItems: "flex-start", maxWidth: 300 },
  logo: { width: 46, height: 46, borderRadius: 23 },
  brandName: { fontFamily: BRAND_FAMILY, fontWeight: 700, fontSize: 15, color: c.ink, letterSpacing: -0.3, lineHeight: 1.15, marginBottom: 3 },
  brandLine: { fontSize: 8.5, color: c.muted, marginTop: 1 },
  docTitle: { ...W(700), fontSize: 24, color: c.ink, letterSpacing: 2, textAlign: "right", lineHeight: 1, marginBottom: 6 },
  metaTable: { width: 210, borderTopWidth: 1, borderTopColor: c.hair },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 3.5, borderBottomWidth: 1, borderBottomColor: c.hair },
  metaKey: { color: c.muted },
  metaVal: { ...W(600), color: c.ink, textAlign: "right" },
  rule: { height: 2, backgroundColor: c.gold, marginTop: 12 },

  panels: { flexDirection: "row", gap: 12, marginTop: 12 },
  panel: { flex: 1, borderWidth: 1, borderColor: c.line, borderRadius: 3 },
  panelHead: { backgroundColor: c.panel, paddingVertical: 4.5, paddingHorizontal: 10, fontSize: 7.5, ...W(600), letterSpacing: 1, textTransform: "uppercase", color: c.body, borderBottomWidth: 1, borderBottomColor: c.line },
  panelBody: { paddingVertical: 8, paddingHorizontal: 10 },
  panelName: { ...W(600), fontSize: 11, color: c.ink },
  panelLine: { marginTop: 2, color: c.body },
  kv: { flexDirection: "row", marginTop: 2 },
  k: { width: 52, color: c.muted },
  v: { flex: 1, color: c.ink },

  table: { marginTop: 12 },
  thead: { flexDirection: "row", backgroundColor: c.dark, paddingVertical: 6.5, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  th: { color: "#ffffff", fontSize: 7.5, ...W(600), letterSpacing: 0.8, textTransform: "uppercase" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.hair, paddingVertical: 6, alignItems: "flex-start" },
  cell: { paddingHorizontal: 8 },
  cNo: { width: COL.no, textAlign: "center", color: c.muted },
  cDesc: { flex: 1 },
  cQty: { width: COL.qty, textAlign: "right" },
  cRate: { width: COL.rate, textAlign: "right" },
  cAmt: { width: COL.amt, textAlign: "right" },
  itemTitle: { ...W(500), color: c.ink },
  itemDesc: { color: c.muted, fontSize: 8, marginTop: 1 },
  num: { color: c.ink },

  below: { flexDirection: "row", gap: 16, marginTop: 12, alignItems: "flex-start" },
  left: { flex: 1 },
  totals: { width: 236, borderWidth: 1, borderColor: c.line, borderRadius: 3, overflow: "hidden" },
  tRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: c.hair },
  tGrand: { backgroundColor: c.panel, borderTopColor: c.line },
  tDue: { backgroundColor: c.dark, paddingVertical: 7 },

  box: { borderWidth: 1, borderColor: c.line, borderRadius: 3 },
  words: { paddingVertical: 6, paddingHorizontal: 10 },
  small: { fontSize: 7.5, ...W(600), letterSpacing: 1, textTransform: "uppercase", color: c.muted },
  wordsText: { ...W(500), color: c.ink, marginTop: 1.5 },

  payTable: { marginTop: 8, overflow: "hidden" },
  payHead: { flexDirection: "row", backgroundColor: c.panel, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: c.line },
  payRow: { flexDirection: "row", paddingVertical: 4, borderTopWidth: 1, borderTopColor: c.hair },

  upi: { marginTop: 8, padding: 8, flexDirection: "row", gap: 10, alignItems: "center" },
  qr: { width: 66, height: 66 },

  bottom: { flexDirection: "row", gap: 16, marginTop: 14 },
  terms: { flex: 1 },
  term: { flexDirection: "row", gap: 5, marginTop: 2, fontSize: 7.8, color: c.muted },
  sign: { width: 190, justifyContent: "flex-end" },
  signLine: { width: 190, borderTopWidth: 1, borderTopColor: c.ink, marginTop: 40, paddingTop: 5, alignItems: "flex-end" },

  watermark: { position: "absolute", left: 0, right: 0, top: 330, alignItems: "center", transform: "rotate(-24deg)", opacity: 0.08 },
  watermarkText: { ...W(700), letterSpacing: 10, textTransform: "uppercase" },

  // Anchored from the top: react-pdf drops bottom-anchored fixed nodes that fall inside the page padding.
  footer: { position: "absolute", left: M, right: M, top: 800, borderTopWidth: 1, borderTopColor: c.hair, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  footText: { color: c.faint, fontSize: 7.5 },
});

const statusStyle: Record<InvoiceStatus, { bg: string; tx: string }> = {
  draft: { bg: c.panel, tx: c.body },
  sent: { bg: c.amberBg, tx: c.amber },
  partially_paid: { bg: c.skyBg, tx: c.sky },
  paid: { bg: c.greenBg, tx: c.green },
  cancelled: { bg: c.redBg, tx: c.red },
};

export interface InvoicePdfProps {
  invoice: InvoiceRow;
  logoSrc?: string | Buffer;
  qrSrc?: string;
  shareUrl: string;
}

export function InvoicePdf({ invoice: inv, logoSrc, qrSrc, shareUrl }: InvoicePdfProps) {
  const status = inv.status as InvoiceStatus;
  const cancelled = status === "cancelled";
  const isPaid = inv.grandTotalPaise > 0 && inv.balanceDuePaise === 0 && !cancelled;
  const showUpi = inv.balanceDuePaise > 0 && !cancelled && Boolean(qrSrc);
  const eventDate =
    inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);
  const st = statusStyle[status];
  const shareHost = shareUrl.replace(/^https?:\/\//, "");

  return (
    <Document title={`${inv.invoiceNumber} ${site.name}`} author={site.name} subject={`Invoice ${inv.invoiceNumber} for ${inv.clientName}`} creator={site.name}>
      <Page size="A4" style={s.page}>
        {/* Running footer, declared first so it repeats on every page */}
        <View style={s.footer} fixed>
          <Text style={[s.footText, { flex: 1, paddingRight: 12 }]}>{`Computer-generated invoice. Latest copy and payment link: ${shareHost}`}</Text>
          <Text style={s.footText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

        {/* Faint diagonal watermark for settled or cancelled invoices */}
        {(isPaid || cancelled) && (
          <View style={s.watermark} fixed>
            <Text style={[s.watermarkText, { color: isPaid ? c.green : c.red, fontSize: isPaid ? 96 : 60 }]}>{isPaid ? "Paid" : "Cancelled"}</Text>
          </View>
        )}

        {/* Header: business identity left, document title and reference block right */}
        <View style={s.header}>
          <View style={s.brand}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
            <View>
              <Text style={s.brandName}>{site.name}</Text>
              <Text style={s.brandLine}>{`${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}`}</Text>
              <Text style={s.brandLine}>{`${site.phoneDisplay}  |  ${site.email}`}</Text>
              <Text style={s.brandLine}>{site.url.replace(/^https?:\/\//, "")}</Text>
            </View>
          </View>
          <View>
            <Text style={s.docTitle}>INVOICE</Text>
            <View style={s.metaTable}>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Invoice No.</Text>
                <Text style={s.metaVal}>{inv.invoiceNumber}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Invoice date</Text>
                <Text style={s.metaVal}>{formatDateIN(inv.issueDate)}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Due date</Text>
                <Text style={s.metaVal}>{inv.dueDate ? formatDateIN(inv.dueDate) : "On receipt"}</Text>
              </View>
              <View style={s.metaRow}>
                <Text style={s.metaKey}>Status</Text>
                <Text style={{ ...W(600), fontSize: 7.5, paddingVertical: 1.5, paddingHorizontal: 6, borderRadius: 2, backgroundColor: st.bg, color: st.tx, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  {STATUS_LABEL[status]}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={s.rule} />

        {/* Bill to / event details */}
        <View style={s.panels}>
          <View style={s.panel}>
            <Text style={s.panelHead}>Bill to</Text>
            <View style={s.panelBody}>
              <Text style={s.panelName}>{inv.clientName}</Text>
              {inv.clientAddress ? <Text style={s.panelLine}>{inv.clientAddress}</Text> : null}
              {inv.clientPhone ? <Text style={s.panelLine}>{inv.clientPhone}</Text> : null}
              {inv.clientEmail ? <Text style={s.panelLine}>{inv.clientEmail}</Text> : null}
            </View>
          </View>
          <View style={s.panel}>
            <Text style={s.panelHead}>Event details</Text>
            <View style={s.panelBody}>
              <Text style={s.panelName}>{inv.eventTitle || "Live event production"}</Text>
              <View style={s.kv}>
                <Text style={s.k}>Date</Text>
                <Text style={s.v}>{eventDate || "As agreed"}</Text>
              </View>
              <View style={s.kv}>
                <Text style={s.k}>Venue</Text>
                <Text style={s.v}>{inv.venue || "As agreed"}</Text>
              </View>
              <View style={s.kv}>
                <Text style={s.k}>Supplier</Text>
                <Text style={s.v}>{`${site.name}, ${site.address.locality}`}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Items. Header repeats when the table breaks across pages. */}
        <View style={s.table}>
          <View style={s.thead} fixed>
            <Text style={[s.th, s.cell, { width: COL.no, textAlign: "center" }]}>#</Text>
            <Text style={[s.th, s.cell, s.cDesc]}>Description</Text>
            <Text style={[s.th, s.cell, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cell, s.cRate]}>Rate</Text>
            <Text style={[s.th, s.cell, s.cAmt]}>Amount</Text>
          </View>
          {inv.items.map((l, i) => (
            <View key={i} style={[s.tr, i % 2 === 1 ? { backgroundColor: c.zebra } : {}]} wrap={false}>
              <Text style={[s.cell, s.cNo]}>{String(i + 1)}</Text>
              <View style={[s.cell, s.cDesc]}>
                <Text style={s.itemTitle}>{l.title || "Item"}</Text>
                {l.description ? <Text style={s.itemDesc}>{l.description}</Text> : null}
              </View>
              <Text style={[s.cell, s.cQty, s.num]}>{String(l.quantity)}</Text>
              <Text style={[s.cell, s.cRate, s.num]}>{money(l.ratePaise)}</Text>
              <Text style={[s.cell, s.cAmt, s.num, W(500)]}>{money(lineAmountPaise(l))}</Text>
            </View>
          ))}
        </View>

        {/* Amount in words, payments and UPI on the left; totals on the right */}
        <View style={s.below} wrap={false}>
          <View style={s.left}>
            <View style={[s.box, s.words]}>
              <Text style={s.small}>Total in words</Text>
              <Text style={s.wordsText}>{amountInWords(inv.grandTotalPaise)}</Text>
            </View>

            {inv.payments.length ? (
              <View style={[s.box, s.payTable]}>
                <View style={s.payHead}>
                  <Text style={[s.small, s.cell, { width: 84 }]}>Date</Text>
                  <Text style={[s.small, s.cell, { flex: 1 }]}>Mode</Text>
                  <Text style={[s.small, s.cell, { width: 84, textAlign: "right" }]}>Received</Text>
                </View>
                {inv.payments.map((p, i) => (
                  <View key={p.id} style={[s.payRow, i === 0 ? { borderTopWidth: 0 } : {}]}>
                    <Text style={[s.cell, { width: 84, color: c.ink }]}>{formatDateIN(p.date)}</Text>
                    <Text style={[s.cell, { flex: 1, color: c.body }]}>{`${METHOD_LABEL[p.method]}${p.reference ? `, ${p.reference}` : ""}`}</Text>
                    <Text style={[s.cell, { width: 84, textAlign: "right", color: c.green }, W(500)]}>{money(p.amountPaise)}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {showUpi ? (
              <View style={[s.box, s.upi]}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
                <Image src={qrSrc!} style={s.qr} />
                <View style={{ flex: 1 }}>
                  <Text style={s.small}>Pay by UPI</Text>
                  <View style={[s.kv, { marginTop: 3 }]}>
                    <Text style={[s.k, { width: 44 }]}>UPI ID</Text>
                    <Text style={[s.v, W(600)]}>{UPI.id}</Text>
                  </View>
                  <View style={s.kv}>
                    <Text style={[s.k, { width: 44 }]}>Payee</Text>
                    <Text style={s.v}>{UPI.payeeName}</Text>
                  </View>
                  <View style={s.kv}>
                    <Text style={[s.k, { width: 44 }]}>Amount</Text>
                    <Text style={[s.v, W(600)]}>{money(inv.balanceDuePaise)}</Text>
                  </View>
                  <Text style={{ color: c.muted, fontSize: 7.8, marginTop: 3 }}>{`Scan with any UPI app. Quote ${inv.invoiceNumber} in the remark and send the screenshot on WhatsApp.`}</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={s.totals}>
            <View style={[s.tRow, { borderTopWidth: 0 }]}>
              <Text style={{ color: c.muted }}>Subtotal</Text>
              <Text style={s.num}>{money(inv.subtotalPaise)}</Text>
            </View>
            {inv.discountPaise > 0 ? (
              <View style={s.tRow}>
                <Text style={{ color: c.muted }}>Discount</Text>
                <Text style={s.num}>{`- ${money(inv.discountPaise)}`}</Text>
              </View>
            ) : null}
            {inv.gstRateBp > 0 ? (
              <>
                <View style={s.tRow}>
                  <Text style={{ color: c.muted }}>Taxable value</Text>
                  <Text style={s.num}>{money(inv.subtotalPaise - inv.discountPaise)}</Text>
                </View>
                <View style={s.tRow}>
                  <Text style={{ color: c.muted }}>{`GST @ ${inv.gstRateBp / 100}%`}</Text>
                  <Text style={s.num}>{money(inv.gstPaise)}</Text>
                </View>
              </>
            ) : null}
            <View style={[s.tRow, s.tGrand]}>
              <Text style={[W(700), { color: c.ink }]}>Grand total</Text>
              <Text style={[W(700), { color: c.ink, fontSize: 10.5 }]}>{money(inv.grandTotalPaise)}</Text>
            </View>
            <View style={s.tRow}>
              <Text style={{ color: c.muted }}>Amount received</Text>
              <Text style={[s.num, { color: inv.advancePaidPaise > 0 ? c.green : c.ink }]}>{money(inv.advancePaidPaise)}</Text>
            </View>
            <View style={[s.tRow, s.tDue]}>
              <Text style={[W(600), { color: "rgba(255,255,255,0.75)", fontSize: 8, letterSpacing: 1, textTransform: "uppercase" }]}>{cancelled ? "Cancelled" : isPaid ? "Paid in full" : "Balance due"}</Text>
              <Text style={[W(700), { color: "#ffffff", fontSize: 14 }]}>{cancelled ? "No amount due" : money(inv.balanceDuePaise)}</Text>
            </View>
          </View>
        </View>

        {/* Notes, terms and signature */}
        <View style={s.bottom} wrap={false}>
          <View style={s.terms}>
            {inv.notes ? (
              <View style={{ marginBottom: 8 }}>
                <Text style={s.small}>Notes</Text>
                <Text style={{ marginTop: 2, color: c.body }}>{inv.notes}</Text>
              </View>
            ) : null}
            {inv.terms.length ? (
              <>
                <Text style={s.small}>Terms and conditions</Text>
                {inv.terms.map((t, i) => (
                  <View key={i} style={s.term}>
                    <Text>{`${i + 1}.`}</Text>
                    <Text style={{ flex: 1 }}>{t}</Text>
                  </View>
                ))}
              </>
            ) : null}
          </View>
          <View style={s.sign}>
            <View style={s.signLine}>
              <Text style={[W(600), { color: c.ink }]}>{`For ${site.name}`}</Text>
              <Text style={{ color: c.muted, marginTop: 1 }}>Authorised signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
