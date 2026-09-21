// A4 letterhead. No bleed (office printers trim nothing) - header band + footer band,
// blank middle for the letter body, faint monogram watermark centred.
// Output: assets/brand/15-print-collateral/letterhead/
import path from "node:path";
import {
  OUT, BUSINESS, COLORS,
  printDoc, svgDoc, renderPrintPNG, writeSVG,
  text, rule, mark, watermark,
} from "./print-core.mjs";

const DIR = path.join(OUT, "15-print-collateral", "letterhead");
const W = 210, H = 297; // A4 mm

function build() {
  const doc = printDoc({ trimW: W, trimH: H, bleed: 0, background: COLORS.white });
  const parts = [];

  // Header band
  const headerH = 34;
  parts.push(`<rect x="0" y="0" width="${W}" height="${headerH}" fill="${COLORS.black}"/>`);
  parts.push(`<rect x="0" y="${headerH}" width="${W}" height="1.2" fill="url(#mihirGold)"/>`);
  const logo = mark("horizontal", { x: 18, y: 8, height: 18, withTagline: true, fill: "gold" });
  parts.push(logo.body);

  // Right side of the header: quick contact line
  const rightX = W - 18;
  parts.push(text("montserratSemi", BUSINESS.phone, { x: rightX, y: 13, size: 3.4, fill: COLORS.white, align: "right" }).body);
  parts.push(text("montserrat", BUSINESS.email, { x: rightX, y: 18.4, size: 3, fill: "#B9B29A", align: "right" }).body);
  parts.push(text("montserratSemi", BUSINESS.web, { x: rightX, y: 23.6, size: 3, fill: COLORS.gold, align: "right" }).body);

  // Watermark, centred in the writing area
  parts.push(watermark({ cx: W / 2, cy: headerH + (H - headerH - 30) / 2, size: 150, opacity: 0.035 }));

  // Footer band
  const footerY = H - 22;
  parts.push(rule(18, footerY, W - 36, { thickness: 0.4, opacity: 0.6 }));
  const footerLine = `${BUSINESS.address}  |  ${BUSINESS.phone}  |  ${BUSINESS.email}  |  ${BUSINESS.web}`;
  parts.push(text("montserrat", footerLine, { x: W / 2, y: footerY + 5.5, size: 2.6, fill: "#5B5140", align: "center" }).body);
  parts.push(text("montserratSemi", `SOUND & LIGHT | EVENT | PRODUCTION  ·  SINCE ${BUSINESS.since}`, { x: W / 2, y: footerY + 10.5, size: 2.4, fill: COLORS.goldDeep, align: "center", letterSpacing: 0.1 }).body);

  return svgDoc(doc, parts.join("\n"), { title: "MIHIR letterhead" });
}

const svg = build();
writeSVG(svg, path.join(DIR, "letterhead-a4.svg"));
await renderPrintPNG(svg, path.join(DIR, "letterhead-a4.png"));
console.log("wrote letterhead-a4, A4 210x297mm, no bleed");
