// Large-format collateral: a roll-up standee and a stage/photo backdrop banner.
// No bleed (both are trimmed to the media size by the printer, artwork runs edge to
// edge). Output: assets/brand/15-print-collateral/large-format/
import path from "node:path";
import {
  OUT, BUSINESS, COLORS,
  printDoc, svgDoc, renderPrintPNG, writeSVG,
  text, multiline, rule, bullet, mark, watermark, qr, particles,
} from "./print-core.mjs";

const DIR = path.join(OUT, "15-print-collateral", "large-format");

const SERVICES = ["Arena Audio", "DMX Lighting", "Stage Rigging", "DJ Setup", "Show Execution"];

// ---------------------------------------------------------------------------
// Roll-up standee, 850 x 2000mm (33.5 x 78.7in) - the common Indian pull-up banner size.
// ---------------------------------------------------------------------------
async function standee() {
  const W = 850, H = 2000;
  const doc = printDoc({ trimW: W, trimH: H, bleed: 0, background: COLORS.black });
  const parts = [particles(doc, { count: 130, size: [1, 3] })];
  parts.push(watermark({ cx: W * 0.5, cy: H * 0.42, size: 620, opacity: 0.05 }));

  const pad = 60;
  const logo = mark("primary", { x: 0, y: 0, width: W - pad * 2, withTagline: true, fill: "gold" });
  const logoY = 130;
  parts.push(`<g transform="translate(${(W / 2 - logo.width / 2).toFixed(2)} ${logoY})">${logo.body}</g>`);

  const headlineY = logoY + logo.height + 90;
  const head = multiline("cinzel", "SOUND THAT FILLS THE ROOM. LIGHT THAT SETS THE MOOD.", {
    x: W / 2, y: headlineY, size: 34, maxWidth: W - pad * 2, fill: COLORS.white, align: "center", lineHeight: 1.32,
  });
  parts.push(head.body);

  const svcTop = headlineY + head.height + 70;
  parts.push(rule(pad, svcTop, W - pad * 2, { thickness: 1.4 }));
  const rowH = 62;
  SERVICES.forEach((s, i) => {
    const y = svcTop + 40 + i * rowH;
    parts.push(bullet(pad + 8, y - 2, 9));
    parts.push(text("montserratSemi", s, { x: pad + 30, y: y + 8, size: 22, fill: COLORS.white, letterSpacing: 0.02 }).body);
  });
  const rulesBottomY = svcTop + 40 + SERVICES.length * rowH + 10;
  parts.push(rule(pad, rulesBottomY, W - pad * 2, { thickness: 1.4 }));

  const bottomBandY = H - 260;
  const panelTop = rulesBottomY + 50;
  const panelBottom = bottomBandY - 50;
  const panelH = panelBottom - panelTop;
  parts.push(`<rect x="${pad}" y="${panelTop.toFixed(2)}" width="${W - pad * 2}" height="${panelH.toFixed(2)}" rx="14" fill="#0D0D0D" stroke="#D4AF37" stroke-opacity="0.35" stroke-width="2" stroke-dasharray="10 9"/>`);
  const camCx = W / 2, camCy = panelTop + panelH / 2 - 70;
  const camScale = 2.6;
  parts.push(`<g fill="none" stroke="#D4AF37" stroke-opacity="0.55" stroke-width="${(3 * camScale).toFixed(2)}" transform="translate(${(camCx - 36 * camScale).toFixed(2)} ${(camCy - 40 * camScale).toFixed(2)}) scale(${camScale})"><rect x="0" y="14" width="72" height="50" rx="8"/><path d="M22 14l8-12h12l8 12"/><circle cx="36" cy="39" r="14"/></g>`);
  parts.push(text("montserratSemi", "EVENT PHOTO HERE", { x: camCx, y: camCy + 46 * camScale, size: 22, fill: "#8A8370", align: "center", letterSpacing: 0.18 }).body);
  parts.push(text("montserrat", "Swap this panel for a hero shot of the rig, stage or crowd", { x: camCx, y: camCy + 46 * camScale + 34, size: 15, fill: "#5B5140", align: "center" }).body);
  parts.push(`<rect x="0" y="${bottomBandY}" width="${W}" height="${H - bottomBandY}" fill="#0B0B0B"/>`);
  parts.push(rule(pad, bottomBandY, W - pad * 2, { thickness: 1.2, opacity: 0.6 }));
  parts.push(text("cinzelBold", "BOOK YOUR EVENT", { x: pad, y: bottomBandY + 60, size: 30, fill: COLORS.gold, letterSpacing: 0.04 }).body);
  parts.push(text("montserratSemi", BUSINESS.phone, { x: pad, y: bottomBandY + 110, size: 28, fill: COLORS.white }).body);
  parts.push(text("montserrat", BUSINESS.web, { x: pad, y: bottomBandY + 148, size: 20, fill: "#B9B29A" }).body);

  const qrSize = 140;
  const qrCode = await qr(BUSINESS.whatsapp, { x: W - pad - qrSize, y: bottomBandY + 45, size: qrSize });
  parts.push(qrCode);
  parts.push(text("montserratSemi", "SCAN TO WHATSAPP", { x: W - pad - qrSize / 2, y: bottomBandY + qrSize + 68, size: 15, fill: "#8A8370", align: "center", letterSpacing: 0.08 }).body);

  const svg = svgDoc(doc, parts.join("\n"), { title: "MIHIR standee 850x2000mm" });
  writeSVG(svg, path.join(DIR, "standee-850x2000mm.svg"));
  await renderPrintPNG(svg, path.join(DIR, "standee-850x2000mm.png"), { dpi: 150 });
  console.log("wrote standee-850x2000mm, roll-up pull-up banner, no bleed, 150dpi (viewing distance, not close-read)");
}

// ---------------------------------------------------------------------------
// Stage / photo backdrop, 6 x 3 ft (1828.8 x 914.4mm) - step-and-repeat style pattern.
// ---------------------------------------------------------------------------
async function backdrop() {
  const W = 1828.8, H = 914.4;
  const doc = printDoc({ trimW: W, trimH: H, bleed: 0, background: COLORS.black });
  const parts = [];

  // Repeating faint wordmark tile pattern across the whole backdrop.
  const tileW = 260, tileH = 140;
  const cols = Math.ceil(W / tileW) + 1;
  const rows = Math.ceil(H / tileH) + 1;
  const tileLogo = mark("wordmark", { x: 0, y: 0, width: tileW * 0.72, fill: COLORS.goldDeep });
  const tileParts = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offsetX = (r % 2) * (tileW / 2);
      const x = c * tileW - tileW / 2 + offsetX;
      const y = r * tileH;
      tileParts.push(`<g transform="translate(${(x + (tileW - tileLogo.width) / 2).toFixed(2)} ${(y + (tileH - tileLogo.height) / 2).toFixed(2)})">${tileLogo.body}</g>`);
    }
  }
  parts.push(`<g opacity="0.16">${tileParts.join("")}</g>`);

  // Centre panel: full primary lockup, large, on a soft dark plate so it stays crisp
  // over the pattern for photos.
  const plateW = 980, plateH = 560;
  const plateX = (W - plateW) / 2, plateY = (H - plateH) / 2;
  parts.push(`<rect x="${plateX.toFixed(2)}" y="${plateY.toFixed(2)}" width="${plateW}" height="${plateH}" fill="#050505" opacity="0.55"/>`);
  const centreLogo = mark("primary", { x: 0, y: 0, width: plateW * 0.72, withTagline: true, fill: "gold" });
  parts.push(`<g transform="translate(${(W / 2 - centreLogo.width / 2).toFixed(2)} ${(plateY + (plateH - centreLogo.height) / 2).toFixed(2)})">${centreLogo.body}</g>`);

  const svg = svgDoc(doc, parts.join("\n"), { title: "MIHIR event backdrop 6x3ft" });
  writeSVG(svg, path.join(DIR, "backdrop-6x3ft.svg"));
  await renderPrintPNG(svg, path.join(DIR, "backdrop-6x3ft.png"), { dpi: 150 });
  console.log("wrote backdrop-6x3ft (1828.8x914.4mm), step-and-repeat, no bleed, 150dpi");
}

await standee();
await backdrop();
