import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, lineAmountPaise, formatDateIN, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { UPI } from "@/lib/invoices/upi";
import { site } from "@/lib/site";

/**
 * A4 invoice. Built-in Helvetica only (no font fetch on the server), so money is
 * written as "INR 1,20,000.00"; the rupee glyph is not in the base-14 fonts.
 */
const c = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  panel: "#f8fafc",
  brand: "#0b0c10",
  gold: "#c99700",
  green: "#0b7a4e",
  red: "#b42318",
};

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 9.5, color: c.ink },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: c.gold },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 44, height: 44, borderRadius: 22 },
  brandName: { fontFamily: "Helvetica-Bold", fontSize: 15, letterSpacing: -0.3 },
  brandMeta: { color: c.muted, fontSize: 8.5, marginTop: 2 },
  docTitle: { fontFamily: "Helvetica-Bold", fontSize: 20, textAlign: "right" },
  metaRight: { textAlign: "right", color: c.muted, marginTop: 2 },
  status: { marginTop: 6, alignSelf: "flex-end", fontSize: 8, fontFamily: "Helvetica-Bold", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 4, backgroundColor: c.panel, color: c.ink },
  cols: { flexDirection: "row", gap: 16, marginTop: 18 },
  card: { flex: 1, backgroundColor: c.panel, borderRadius: 6, padding: 12 },
  label: { fontSize: 7.5, color: c.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  strong: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  body: { marginTop: 2, lineHeight: 1.45 },
  table: { marginTop: 18, borderWidth: 1, borderColor: c.line, borderRadius: 6, overflow: "hidden" },
  thead: { flexDirection: "row", backgroundColor: c.brand, color: "#ffffff", paddingVertical: 7, paddingHorizontal: 10 },
  th: { fontFamily: "Helvetica-Bold", fontSize: 8 },
  tr: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: c.line },
  trAlt: { backgroundColor: c.panel },
  cIdx: { width: 22 },
  cItem: { flex: 3 },
  cQty: { width: 44, textAlign: "right" },
  cRate: { width: 90, textAlign: "right" },
  cAmt: { width: 96, textAlign: "right" },
  desc: { color: c.muted, marginTop: 2, fontSize: 8.5 },
  bottom: { flexDirection: "row", gap: 16, marginTop: 18 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalsGrand: { borderTopWidth: 1, borderTopColor: c.line, marginTop: 4, paddingTop: 8 },
  qr: { width: 92, height: 92 },
  footer: { position: "absolute", left: 40, right: 40, bottom: 22, flexDirection: "row", justifyContent: "space-between", color: c.muted, fontSize: 7.5, borderTopWidth: 1, borderTopColor: c.line, paddingTop: 8 },
  terms: { marginTop: 16 },
  term: { flexDirection: "row", gap: 6, marginTop: 3, color: c.muted, fontSize: 8.5, lineHeight: 1.4 },
});

const money = (p: number) => inr(p, { symbol: false });

export interface InvoicePdfProps {
  invoice: InvoiceRow;
  logoSrc?: string | Buffer;
  qrSrc?: string;
  shareUrl: string;
}

export function InvoicePdf({ invoice: inv, logoSrc, qrSrc, shareUrl }: InvoicePdfProps) {
  const status = inv.status as InvoiceStatus;
  const eventRange = inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);

  return (
    <Document title={`${inv.invoiceNumber} ${site.name}`} author={site.name} subject={`Invoice ${inv.invoiceNumber} for ${inv.clientName}`}>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
            {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
            <View>
              <Text style={s.brandName}>{site.name}</Text>
              <Text style={s.brandMeta}>{site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}</Text>
              <Text style={s.brandMeta}>{site.phoneDisplay}  |  {site.email}</Text>
            </View>
          </View>
          <View>
            <Text style={s.docTitle}>INVOICE</Text>
            <Text style={s.metaRight}>{inv.invoiceNumber}</Text>
            <Text style={s.metaRight}>Issued {formatDateIN(inv.issueDate)}{inv.dueDate ? `  |  Due ${formatDateIN(inv.dueDate)}` : ""}</Text>
            <Text style={s.status}>{STATUS_LABEL[status].toUpperCase()}</Text>
          </View>
        </View>

        <View style={s.cols}>
          <View style={s.card}>
            <Text style={s.label}>Billed to</Text>
            <Text style={s.strong}>{inv.clientName}</Text>
            {inv.clientAddress ? <Text style={s.body}>{inv.clientAddress}</Text> : null}
            {inv.clientPhone ? <Text style={s.body}>{inv.clientPhone}</Text> : null}
            {inv.clientEmail ? <Text style={s.body}>{inv.clientEmail}</Text> : null}
          </View>
          <View style={s.card}>
            <Text style={s.label}>Event</Text>
            <Text style={s.strong}>{inv.eventTitle || "Live event production"}</Text>
            {eventRange ? <Text style={s.body}>{eventRange}</Text> : null}
            {inv.venue ? <Text style={s.body}>{inv.venue}</Text> : null}
          </View>
        </View>

        <View style={s.table}>
          <View style={s.thead}>
            <Text style={[s.th, s.cIdx]}>#</Text>
            <Text style={[s.th, s.cItem]}>Item</Text>
            <Text style={[s.th, s.cQty]}>Qty</Text>
            <Text style={[s.th, s.cRate]}>Rate (INR)</Text>
            <Text style={[s.th, s.cAmt]}>Amount (INR)</Text>
          </View>
          {inv.items.map((l, i) => (
            <View key={i} style={[s.tr, ...(i % 2 ? [s.trAlt] : [])]} wrap={false}>
              <Text style={s.cIdx}>{i + 1}</Text>
              <View style={s.cItem}>
                <Text>{l.title || "Item"}</Text>
                {l.description ? <Text style={s.desc}>{l.description}</Text> : null}
              </View>
              <Text style={s.cQty}>{l.quantity}</Text>
              <Text style={s.cRate}>{money(l.ratePaise).replace("INR ", "")}</Text>
              <Text style={s.cAmt}>{money(lineAmountPaise(l)).replace("INR ", "")}</Text>
            </View>
          ))}
        </View>

        <View style={s.bottom} wrap={false}>
          <View style={s.card}>
            <Text style={s.label}>Pay by UPI</Text>
            {inv.balanceDuePaise > 0 ? (
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
                {qrSrc ? <Image src={qrSrc} style={s.qr} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={s.strong}>{money(inv.balanceDuePaise)}</Text>
                  <Text style={s.body}>UPI ID: {UPI.id}</Text>
                  <Text style={s.body}>Reference: {inv.invoiceNumber}</Text>
                  <Text style={[s.body, { color: c.muted }]}>Scan with any UPI app and share the screenshot on WhatsApp.</Text>
                </View>
              </View>
            ) : (
              <Text style={[s.body, { color: c.green, fontFamily: "Helvetica-Bold" }]}>Paid in full. Thank you.</Text>
            )}
          </View>
          <View style={s.card}>
            <View style={s.totalsRow}>
              <Text>Subtotal</Text>
              <Text>{money(inv.subtotalPaise)}</Text>
            </View>
            {inv.discountPaise > 0 ? (
              <View style={s.totalsRow}>
                <Text>Discount</Text>
                <Text>- {money(inv.discountPaise)}</Text>
              </View>
            ) : null}
            {inv.gstRateBp > 0 ? (
              <View style={s.totalsRow}>
                <Text>GST {inv.gstRateBp / 100}%</Text>
                <Text>{money(inv.gstPaise)}</Text>
              </View>
            ) : null}
            <View style={[s.totalsRow, s.totalsGrand]}>
              <Text style={s.strong}>Grand total</Text>
              <Text style={s.strong}>{money(inv.grandTotalPaise)}</Text>
            </View>
            <View style={s.totalsRow}>
              <Text>Advance received</Text>
              <Text>{money(inv.advancePaidPaise)}</Text>
            </View>
            <View style={s.totalsRow}>
              <Text style={[s.strong, { color: inv.balanceDuePaise > 0 ? c.red : c.green }]}>Balance due</Text>
              <Text style={[s.strong, { color: inv.balanceDuePaise > 0 ? c.red : c.green }]}>{money(inv.balanceDuePaise)}</Text>
            </View>
          </View>
        </View>

        {inv.notes ? (
          <View style={s.terms} wrap={false}>
            <Text style={s.label}>Notes</Text>
            <Text style={s.body}>{inv.notes}</Text>
          </View>
        ) : null}

        {inv.terms.length ? (
          <View style={s.terms}>
            <Text style={s.label}>Terms</Text>
            {inv.terms.map((t, i) => (
              <View key={i} style={s.term}>
                <Text>{i + 1}.</Text>
                <Text style={{ flex: 1 }}>{t}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={s.footer} fixed>
          <Text>{shareUrl}</Text>
          <Text>Thank you for choosing {site.name}</Text>
        </View>
      </Page>
    </Document>
  );
}
