// Business card, front + back. Trim 90 x 54mm (standard India size), 3mm bleed.
// Output: assets/brand/15-print-collateral/business-card/
import path from "node:path";
import {
  OUT, BUSINESS, COLORS,
  printDoc, guides, svgDoc, renderPrintPNG, writeSVG,
  text, multiline, rule, mark, watermark, qr, particles,
} from "./print-core.mjs";

const DIR = path.join(OUT, "15-print-collateral", "business-card");
const TRIM_W = 90, TRIM_H = 54, BLEED = 3;

async function front({ withGuides }) {
  const doc = printDoc({ trimW: TRIM_W, trimH: TRIM_H, bleed: BLEED, background: COLORS.black });
  const parts = [particles(doc, { count: 40 })];
  parts.push(watermark({ cx: doc.x(TRIM_W * 0.82), cy: doc.y(TRIM_H * 0.15), size: 46, opacity: 0.06, rotate: -8 }));

  const logo = mark("stacked", { x: 0, y: 0, height: 34, withTagline: true, fill: "gold" });
  parts.push(`<g transform="translate(${(doc.x(TRIM_W / 2) - logo.width / 2).toFixed(3)} ${(doc.y(TRIM_H / 2) - logo.height / 2 - 1).toFixed(3)})">${logo.body}</g>`);

  if (withGuides) parts.push(guides(doc));
  return svgDoc(doc, parts.join("\n"), { title: "MIHIR business card - front" });
}

async function back({ withGuides }) {
  const doc = printDoc({ trimW: TRIM_W, trimH: TRIM_H, bleed: BLEED, background: COLORS.black });
  const parts = [particles(doc, { count: 30 })];
  parts.push(watermark({ cx: doc.x(TRIM_W * 0.12), cy: doc.y(TRIM_H * 1.04), size: 58, opacity: 0.05, rotate: 6 }));

  const pad = 8;
  const logo = mark("horizontal", { x: doc.x(pad), y: doc.y(pad - 2), height: 7, withTagline: false, fill: "gold" });
  parts.push(logo.body);
  parts.push(rule(doc.x(pad), doc.y(pad + 5.5), TRIM_W - pad * 2, { thickness: 0.25, opacity: 0.5 }));

  const nameY = doc.y(pad + 11);
  parts.push(text("cinzelBold", BUSINESS.legalOwner, { x: doc.x(pad), y: nameY, size: 4.6, fill: COLORS.white, letterSpacing: 0.02 }).body);
  parts.push(text("montserratSemi", BUSINESS.title.toUpperCase(), { x: doc.x(pad), y: nameY + 4.5, size: 2.5, fill: COLORS.gold, letterSpacing: 0.12 }).body);

  const addr = multiline("montserrat", BUSINESS.address, { x: doc.x(pad), y: nameY + 8.8, size: 2.3, maxWidth: 52, fill: "#8A8370", lineHeight: 1.35 });
  parts.push(addr.body);

  const rowsY = nameY + 8.8 + addr.height + 3.2;
  const rowGap = 8.4;
  const rows = [
    ["Phone & WhatsApp", BUSINESS.phone],
    ["Email", BUSINESS.email],
  ];
  rows.forEach(([label, value], i) => {
    const y = rowsY + i * rowGap;
    parts.push(text("montserratSemi", label.toUpperCase(), { x: doc.x(pad), y, size: 2.1, fill: "#8A8370", letterSpacing: 0.12 }).body);
    parts.push(text("montserrat", value, { x: doc.x(pad), y: y + 3.4, size: 3, fill: COLORS.white }).body);
  });
  parts.push(text("montserratSemi", BUSINESS.web, { x: doc.x(pad), y: rowsY + (rows.length - 1) * rowGap + 5.8, size: 2.6, fill: COLORS.gold, letterSpacing: 0.03 }).body);

  const qrSize = 17;
  const qrX = doc.x(TRIM_W - pad - qrSize);
  const qrY = doc.y(pad - 2);
  parts.push(await qr(BUSINESS.whatsapp, { x: qrX, y: qrY, size: qrSize }));
  parts.push(text("montserratSemi", "SCAN TO WHATSAPP", { x: qrX + qrSize / 2, y: qrY + qrSize + 3, size: 1.8, fill: "#8A8370", align: "center", letterSpacing: 0.08 }).body);

  if (withGuides) parts.push(guides(doc));
  return svgDoc(doc, parts.join(String.fromCharCode(10)), { title: "MIHIR business card - back" });
}

async function build() {
  for (const [name, fn] of [["front", front], ["back", back]]) {
    const svgPrint = await fn({ withGuides: false });
    const svgProof = await fn({ withGuides: true });
    writeSVG(svgPrint, path.join(DIR, `business-card-${name}.svg`));
    writeSVG(svgProof, path.join(DIR, `business-card-${name}-guides.svg`));
    await renderPrintPNG(svgPrint, path.join(DIR, `business-card-${name}.png`));
    await renderPrintPNG(svgProof, path.join(DIR, `business-card-${name}-guides.png`));
    console.log(`wrote business-card-${name} (+ -guides), 90x54mm trim, 3mm bleed`);
  }
}
await build();
