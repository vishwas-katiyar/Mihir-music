// A5 rate card, front (hero) + back (packages). Trim 148 x 210mm, 3mm bleed.
// Package data mirrors lib/packages.ts - update both if pricing changes.
// Output: assets/brand/15-print-collateral/rate-card/
import path from "node:path";
import {
  OUT, BUSINESS, COLORS,
  printDoc, guides, svgDoc, renderPrintPNG, writeSVG,
  text, multiline, rule, bullet, mark, watermark, particles,
} from "./print-core.mjs";

const DIR = path.join(OUT, "15-print-collateral", "rate-card");
const TRIM_W = 148, TRIM_H = 210, BLEED = 3;

// Mirrors lib/packages.ts - keep the two in sync if pricing changes.
const PACKAGES = [
  {
    name: "Club / House",
    price: "₹85,000", // ₹
    label: "Starter rig",
    features: ["Compact line-array sound package", "Dual subs and stage wedges", "8-12 moving lights with haze", "Crew and deck setup"],
  },
  {
    name: "Wedding Luxe",
    price: "₹1.6 Lakh",
    label: "Signature production",
    featured: true,
    features: ["Premium line-array and cardioid subs", "Full DMX pixel scene design", "Stage build + designer lighting cues", "Show-caller and live audio engineer"],
  },
  {
    name: "Arena Fest",
    price: "₹3.2 Lakh",
    label: "Large-format show",
    features: ["High-SPL flown arrays and festival subs", "Lasers, strobes, blinders and haze", "Full comms & logistics coordination", "On-site show calling and strike crew"],
  },
];

async function front({ withGuides }) {
  const doc = printDoc({ trimW: TRIM_W, trimH: TRIM_H, bleed: BLEED, background: COLORS.black });
  const parts = [particles(doc, { count: 90 })];
  parts.push(watermark({ cx: doc.x(TRIM_W * 0.5), cy: doc.y(TRIM_H * 0.62), size: 190, opacity: 0.045 }));

  const logo = mark("primary", { x: 0, y: 0, width: 92, withTagline: true, fill: "gold" });
  parts.push(`<g transform="translate(${(doc.x(TRIM_W / 2) - logo.width / 2).toFixed(3)} ${doc.y(30).toFixed(3)})">${logo.body}</g>`);

  const headlineY = doc.y(30) + logo.height + 14;
  parts.push(text("cinzel", "RATE CARD", { x: doc.x(TRIM_W / 2), y: headlineY, size: 8.5, fill: COLORS.white, align: "center", letterSpacing: 0.18, upper: true }).body);
  parts.push(text("montserratSemi", `SEASON 2026-27`, { x: doc.x(TRIM_W / 2), y: headlineY + 8, size: 3.4, fill: COLORS.gold, align: "center", letterSpacing: 0.16, upper: true }).body);

  parts.push(rule(doc.x(TRIM_W / 2 - 20), doc.y(TRIM_H - 34), 40, { thickness: 0.35 }));
  const line = multiline("montserrat", "Weddings, concerts, corporate shows and college fests across Madhya Pradesh.", {
    x: doc.x(TRIM_W / 2), y: doc.y(TRIM_H - 29), size: 3.4, maxWidth: 100, fill: "#B9B29A", align: "center", lineHeight: 1.4,
  });
  parts.push(line.body);
  parts.push(text("montserratSemi", BUSINESS.phone, { x: doc.x(TRIM_W / 2), y: doc.y(TRIM_H - 15), size: 3.6, fill: COLORS.white, align: "center" }).body);
  parts.push(text("montserrat", BUSINESS.web, { x: doc.x(TRIM_W / 2), y: doc.y(TRIM_H - 10), size: 3, fill: COLORS.gold, align: "center" }).body);

  if (withGuides) parts.push(guides(doc));
  return svgDoc(doc, parts.join("\n"), { title: "MIHIR rate card - front" });
}

async function back({ withGuides }) {
  const doc = printDoc({ trimW: TRIM_W, trimH: TRIM_H, bleed: BLEED, background: COLORS.black });
  const parts = [particles(doc, { count: 40, opacity: [0.03, 0.15] })];

  const pad = 12;
  const logo = mark("horizontal", { x: doc.x(pad), y: doc.y(pad - 1), height: 10, withTagline: false, fill: "gold" });
  parts.push(logo.body);
  parts.push(text("montserratSemi", "PACKAGES", { x: doc.x(TRIM_W - pad), y: doc.y(pad + 6), size: 3, fill: "#8A8370", align: "right", letterSpacing: 0.18, upper: true }).body);
  parts.push(rule(doc.x(pad), doc.y(pad + 12), TRIM_W - pad * 2, { thickness: 0.3, opacity: 0.55 }));

  const top = pad + 18;
  const avail = TRIM_H - top - pad - 12; // leave room for the footnote
  const gap = 6;
  const cardH = (avail - gap * (PACKAGES.length - 1)) / PACKAGES.length;

  PACKAGES.forEach((pkg, i) => {
    const y = top + i * (cardH + gap);
    const cardX = pad;
    const cardW = TRIM_W - pad * 2;
    const bg = pkg.featured ? "#161207" : "#0F0F0F";
    const stroke = pkg.featured ? "url(#mihirGold)" : "#2A2A2A";
    parts.push(`<rect x="${doc.x(cardX).toFixed(3)}" y="${doc.y(y).toFixed(3)}" width="${cardW.toFixed(3)}" height="${cardH.toFixed(3)}" rx="2.5" fill="${bg}" stroke="${stroke}" stroke-width="${pkg.featured ? 0.5 : 0.3}"/>`);
    if (pkg.featured) {
      parts.push(text("montserratSemi", "MOST BOOKED", { x: doc.x(cardX + cardW - 4), y: doc.y(y + 3.4), size: 1.7, fill: COLORS.gold, align: "right", letterSpacing: 0.14, upper: true }).body);
    }
    const innerX = cardX + 5;
    parts.push(text("cinzelBold", pkg.name, { x: doc.x(innerX), y: doc.y(y + 7), size: 4.6, fill: COLORS.white }).body);
    parts.push(text("montserratSemi", pkg.label.toUpperCase(), { x: doc.x(innerX), y: doc.y(y + 11.3), size: 2.2, fill: "#8A8370", letterSpacing: 0.1 }).body);
    parts.push(text("montserratBold", `${pkg.price}`, { x: doc.x(cardX + cardW - 5), y: doc.y(y + 9.3), size: 5.2, fill: "url(#mihirGold)", align: "right" }).body);
    parts.push(text("montserrat", "onwards", { x: doc.x(cardX + cardW - 5), y: doc.y(y + 13), size: 2, fill: "#8A8370", align: "right" }).body);

    const featY = y + 16;
    const rowH = (cardH - 16 - 3) / pkg.features.length;
    pkg.features.forEach((feat, fi) => {
      const fy = featY + fi * rowH;
      parts.push(bullet(doc.x(innerX + 0.6), doc.y(fy + rowH / 2 - 0.2)));
      parts.push(text("montserrat", feat, { x: doc.x(innerX + 3), y: doc.y(fy + rowH / 2 + 1), size: 2.5, fill: "#D8D2C0" }).body);
    });
  });

  parts.push(text("montserrat", "Final quote depends on venue, guest count and load-in access. Ask for a written estimate.", {
    x: doc.x(TRIM_W / 2), y: doc.y(TRIM_H - pad - 4), size: 2.3, fill: "#6B6250", align: "center",
  }).body);

  if (withGuides) parts.push(guides(doc));
  return svgDoc(doc, parts.join("\n"), { title: "MIHIR rate card - back" });
}

async function build() {
  for (const [name, fn] of [["front", front], ["back", back]]) {
    const svgPrint = await fn({ withGuides: false });
    const svgProof = await fn({ withGuides: true });
    writeSVG(svgPrint, path.join(DIR, `rate-card-${name}.svg`));
    writeSVG(svgProof, path.join(DIR, `rate-card-${name}-guides.svg`));
    await renderPrintPNG(svgPrint, path.join(DIR, `rate-card-${name}.png`));
    await renderPrintPNG(svgProof, path.join(DIR, `rate-card-${name}-guides.png`));
    console.log(`wrote rate-card-${name} (+ -guides), A5 148x210mm trim, 3mm bleed`);
  }
}
await build();
