import { existsSync } from "node:fs";
import path from "node:path";
import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, lineAmountPaise, formatDateIN, METHOD_LABEL, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { UPI } from "@/lib/invoices/upi";
import { site } from "@/lib/site";

/**
 * Brand typeface for the PDF. Space Grotesk ships in /public/fonts (OFL) and includes
 * the rupee glyph, so money renders as ₹ like the website. Falls back to Helvetica
 * (and "INR") if the files are missing in some environment.
 */
const fontDir = path.join(process.cwd(), "public", "fonts");
const fontFiles = { 400: "SpaceGrotesk-400.ttf", 500: "SpaceGrotesk-500.ttf", 700: "SpaceGrotesk-700.ttf" } as const;
const hasBrandFont = Object.values(fontFiles).every((f) => existsSync(path.join(fontDir, f)));

if (hasBrandFont) {
  Font.register({
    family: "Space Grotesk",
    fonts: Object.entries(fontFiles).map(([w, f]) => ({ src: path.join(fontDir, f), fontWeight: Number(w) })),
  });
}
Font.registerHyphenationCallback((word) => [word]);

const FAMILY = hasBrandFont ? "Space Grotesk" : "Helvetica";
const BOLD = hasBrandFont ? { fontWeight: 700 } : { fontFamily: "Helvetica-Bold" };
const MED = hasBrandFont ? { fontWeight: 500 } : { fontFamily: "Helvetica-Bold" };
const money = (p: number) => (hasBrandFont ? inr(p) : inr(p, { symbol: false }));

const c = {
  ink: "#0f172a",
  body: "#334155",
  muted: "#64748b",
  faint: "#94a3b8",
  line: "#e2e8f0",
  hair: "#f1f5f9",
  brand: "#0b0c10",
  gold: "#ffb800",
  green: "#047857",
  greenBg: "#ecfdf5",
  red: "#b42318",
  redBg: "#fef2f2",
  amberBg: "#fffbeb",
  amberTx: "#92400e",
  skyBg: "#f0f9ff",
  skyTx: "#075985",
  slateBg: "#f1f5f9",
};

const s = StyleSheet.create({
  page: { fontFamily: FAMILY, fontSize: 9.5, color: c.body, paddingBottom: 54 },
  bar: { backgroundColor: c.brand, paddingVertical: 26, paddingHorizontal: 40, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  barRule: { height: 4, backgroundColor: c.gold },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logo: { width: 40, height: 40, borderRadius: 20 },
  brandName: { ...BOLD, fontSize: 14, color: "#ffffff", letterSpacing: -0.3 },
  brandSub: { fontSize: 8.5, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  docTitle: { ...BOLD, fontSize: 22, color: "#ffffff", textAlign: "right", letterSpacing: -0.6 },
  docNo: { fontSize: 10, color: c.gold, textAlign: "right", marginTop: 3 },
  body: { paddingHorizontal: 40, paddingTop: 22 },
  meta: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: c.line, paddingBottom: 14 },
  metaCol: { flex: 1 },
  label: { fontSize: 7.5, color: c.muted, textTransform: "uppercase", letterSpacing: 1.2, ...MED },
  metaVal: { ...MED, fontSize: 10, color: c.ink, marginTop: 4 },
  pill: { alignSelf: "flex-start", marginTop: 3, fontSize: 8, ...BOLD, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 3 },
  parties: { flexDirection: "row", justifyContent: "space-between", marginTop: 22, gap: 24 },
  party: { flex: 1 },
  partyName: { ...BOLD, fontSize: 13, color: c.ink, marginTop: 6, letterSpacing: -0.2 },
  partyLine: { marginTop: 3, lineHeight: 1.4, color: c.body },
  right: { textAlign: "right" },
  table: { marginTop: 26 },
  thead: { flexDirection: "row", borderBottomWidth: 1.5, borderBottomColor: c.brand, paddingBottom: 6 },
  th: { fontSize: 7.5, color: c.muted, textTransform: "uppercase", letterSpacing: 1.2, ...MED },
  tr: { flexDirection: "row", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.hair },
  cItem: { flex: 1, paddingRight: 12 },
  cQty: { width: 50, textAlign: "right" },
  cRate: { width: 92, textAlign: "right" },
  cAmt: { width: 104, textAlign: "right" },
  itemTitle: { ...MED, color: c.ink, fontSize: 10 },
  itemDesc: { color: c.muted, marginTop: 2, fontSize: 8.5, lineHeight: 1.35 },
  amount: { ...MED, color: c.ink },
  bottom: { flexDirection: "row", marginTop: 22, gap: 28 },
  leftCol: { flex: 1 },
  totals: { width: 250 },
  tRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4.5 },
  tTotal: { borderTopWidth: 1, borderTopColor: c.line, marginTop: 3, paddingTop: 8 },
  callout: { marginTop: 8, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  calloutLabel: { fontSize: 7.5, textTransform: "uppercase", letterSpacing: 1.2, ...MED },
  calloutValue: { ...BOLD, fontSize: 17, letterSpacing: -0.4 },
  payRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: c.hair },
  upi: { marginTop: 22, borderWidth: 1, borderColor: c.line, borderRadius: 6, padding: 14, flexDirection: "row", alignItems: "center", gap: 16 },
  qr: { width: 86, height: 86 },
  terms: { marginTop: 22 },
  term: { flexDirection: "row", gap: 6, marginTop: 3, color: c.muted, fontSize: 8.2, lineHeight: 1.4 },
  stamp: { position: "absolute", right: 40, top: 128, borderWidth: 3, borderRadius: 6, paddingVertical: 5, paddingHorizontal: 12, transform: "rotate(-12deg)" },
  stampText: { ...BOLD, fontSize: 22, letterSpacing: 4, textTransform: "uppercase" },
  footer: { position: "absolute", left: 40, right: 40, bottom: 22, flexDirection: "row", justifyContent: "space-between", color: c.faint, fontSize: 7.5, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8 },
});

const statusStyle: Record<InvoiceStatus, { bg: string; tx: string }> = {
  draft: { bg: c.slateBg, tx: c.body },
  sent: { bg: c.amberBg, tx: c.amberTx },
  partially_paid: { bg: c.skyBg, tx: c.skyTx },
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
  const isPaid = inv.grandTotalPaise > 0 && inv.balanceDuePaise === 0 && status !== "cancelled";
  const eventRange =
    inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);
  const st = statusStyle[status];

  return (
    <Document title={`${inv.invoiceNumber} ${site.name}`} author={site.name} subject={`Invoice ${inv.invoiceNumber} for ${inv.clientName}`} creator={site.name}>
      <Page size="A4" style={s.page}>
        {/* Brand bar */}
        <View style={s.bar} fixed>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
            <View>
              <Text style={s.brandName}>{site.name}</Text>
              <Text style={s.brandSub}>Live event production, Indore</Text>
            </View>
          </View>
          <View>
            <Text style={s.docTitle}>Invoice</Text>
            <Text style={s.docNo}>{inv.invoiceNumber}</Text>
          </View>
        </View>
        <View style={s.barRule} fixed />

        {(isPaid || status === "cancelled") && (
          <View style={[s.stamp, { borderColor: isPaid ? c.green : c.red }]}>
            <Text style={[s.stampText, { color: isPaid ? c.green : c.red }]}>{isPaid ? "Paid" : "Cancelled"}</Text>
          </View>
        )}

        <View style={s.body}>
          {/* Meta strip */}
          <View style={s.meta}>
            <View style={s.metaCol}>
              <Text style={s.label}>Issued</Text>
              <Text style={s.metaVal}>{formatDateIN(inv.issueDate)}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.label}>Due</Text>
              <Text style={s.metaVal}>{inv.dueDate ? formatDateIN(inv.dueDate) : "On receipt"}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.label}>Event</Text>
              <Text style={s.metaVal}>{eventRange || "As agreed"}</Text>
            </View>
            <View style={s.metaCol}>
              <Text style={s.label}>Status</Text>
              <Text style={[s.pill, { backgroundColor: st.bg, color: st.tx }]}>{STATUS_LABEL[status]}</Text>
            </View>
          </View>

          {/* Parties */}
          <View style={s.parties}>
            <View style={s.party}>
              <Text style={s.label}>Billed to</Text>
              <Text style={s.partyName}>{inv.clientName}</Text>
              {inv.clientAddress ? <Text style={s.partyLine}>{inv.clientAddress}</Text> : null}
              {inv.clientPhone || inv.clientEmail ? <Text style={s.partyLine}>{[inv.clientPhone, inv.clientEmail].filter(Boolean).join("  ·  ")}</Text> : null}
              {inv.eventTitle || inv.venue ? (
                <Text style={[s.partyLine, { marginTop: 8 }]}>
                  <Text style={{ ...MED, color: c.ink }}>{inv.eventTitle || "Live event production"}</Text>
                  {inv.venue ? <Text style={{ color: c.muted }}>{`  ·  ${inv.venue}`}</Text> : null}
                </Text>
              ) : null}
            </View>
            <View style={[s.party, s.right]}>
              <Text style={s.label}>From</Text>
              <Text style={s.partyName}>{site.name}</Text>
              <Text style={s.partyLine}>{`${site.address.street}, ${site.address.locality}\n${site.address.region} ${site.address.postalCode}`}</Text>
              <Text style={s.partyLine}>{`${site.phoneDisplay}\n${site.email}`}</Text>
            </View>
          </View>

          {/* Items */}
          <View style={s.table}>
            <View style={s.thead}>
              <Text style={[s.th, s.cItem]}>Item</Text>
              <Text style={[s.th, s.cQty]}>Qty</Text>
              <Text style={[s.th, s.cRate]}>Rate</Text>
              <Text style={[s.th, s.cAmt]}>Amount</Text>
            </View>
            {inv.items.map((l, i) => (
              <View key={i} style={s.tr} wrap={false}>
                <View style={s.cItem}>
                  <Text style={s.itemTitle}>{l.title || "Item"}</Text>
                  {l.description ? <Text style={s.itemDesc}>{l.description}</Text> : null}
                </View>
                <Text style={s.cQty}>{String(l.quantity)}</Text>
                <Text style={s.cRate}>{money(l.ratePaise)}</Text>
                <Text style={[s.cAmt, s.amount]}>{money(lineAmountPaise(l))}</Text>
              </View>
            ))}
          </View>

          {/* Payments + totals */}
          <View style={s.bottom} wrap={false}>
            <View style={s.leftCol}>
              {inv.payments.length ? (
                <>
                  <Text style={s.label}>Payments received</Text>
                  {inv.payments.map((p) => (
                    <View key={p.id} style={s.payRow}>
                      <Text style={{ width: 70, color: c.body }}>{formatDateIN(p.date)}</Text>
                      <Text style={{ flex: 1, color: c.muted }}>{`${METHOD_LABEL[p.method]}${p.reference ? `  ·  ${p.reference}` : ""}`}</Text>
                      <Text style={{ width: 90, textAlign: "right", color: c.green, ...MED }}>{money(p.amountPaise)}</Text>
                    </View>
                  ))}
                </>
              ) : null}
              {inv.notes ? (
                <View style={{ marginTop: inv.payments.length ? 16 : 0 }}>
                  <Text style={s.label}>Notes</Text>
                  <Text style={[s.partyLine, { marginTop: 5 }]}>{inv.notes}</Text>
                </View>
              ) : null}
            </View>

            <View style={s.totals}>
              <View style={s.tRow}>
                <Text style={{ color: c.muted }}>Subtotal</Text>
                <Text>{money(inv.subtotalPaise)}</Text>
              </View>
              {inv.discountPaise > 0 ? (
                <View style={s.tRow}>
                  <Text style={{ color: c.muted }}>Discount</Text>
                  <Text>{`- ${money(inv.discountPaise)}`}</Text>
                </View>
              ) : null}
              {inv.gstRateBp > 0 ? (
                <View style={s.tRow}>
                  <Text style={{ color: c.muted }}>{`GST ${inv.gstRateBp / 100}%`}</Text>
                  <Text>{money(inv.gstPaise)}</Text>
                </View>
              ) : null}
              <View style={[s.tRow, s.tTotal]}>
                <Text style={{ ...MED, color: c.ink }}>Total</Text>
                <Text style={{ ...MED, color: c.ink }}>{money(inv.grandTotalPaise)}</Text>
              </View>
              {inv.advancePaidPaise > 0 ? (
                <View style={s.tRow}>
                  <Text style={{ color: c.muted }}>Received</Text>
                  <Text style={{ color: c.green }}>{`- ${money(inv.advancePaidPaise)}`}</Text>
                </View>
              ) : null}
              <View style={[s.callout, isPaid ? { backgroundColor: c.greenBg } : { backgroundColor: c.brand }]}>
                <Text style={[s.calloutLabel, { color: isPaid ? c.green : "rgba(255,255,255,0.7)" }]}>{isPaid ? "Paid in full" : "Balance due"}</Text>
                <Text style={[s.calloutValue, { color: isPaid ? c.green : "#ffffff" }]}>{money(inv.balanceDuePaise)}</Text>
              </View>
            </View>
          </View>

          {/* UPI */}
          {inv.balanceDuePaise > 0 && status !== "cancelled" ? (
            <View style={s.upi} wrap={false}>
              {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
              {qrSrc ? <Image src={qrSrc} style={s.qr} /> : null}
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Pay the balance by UPI</Text>
                <Text style={[s.partyLine, { marginTop: 6 }]}>
                  {`Scan with any UPI app to pay `}
                  <Text style={{ ...MED, color: c.ink }}>{money(inv.balanceDuePaise)}</Text>
                  {` to ${UPI.id} (${UPI.payeeName}).`}
                </Text>
                <Text style={[s.partyLine, { color: c.muted }]}>{`Use ${inv.invoiceNumber} as the reference and share the screenshot on WhatsApp so we can mark it received.`}</Text>
              </View>
            </View>
          ) : null}

          {inv.terms.length ? (
            <View style={s.terms}>
              <Text style={s.label}>Terms</Text>
              {inv.terms.map((t, i) => (
                <View key={i} style={s.term}>
                  <Text style={{ color: c.faint }}>{`${i + 1}.`}</Text>
                  <Text style={{ flex: 1 }}>{t}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <View style={s.footer} fixed>
          <Text>{shareUrl.replace(/^https?:\/\//, "")}</Text>
          <Text render={({ pageNumber, totalPages }) => `Thank you for choosing ${site.name}  ·  ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
