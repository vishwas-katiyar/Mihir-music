// Shared layer for print collateral (business cards, letterhead, rate card, banners).
// Everything is laid out in millimetres and composed from core.mjs so the marks, gold
// gradient and type match the rest of the kit. Output is an SVG master (mm viewBox,
// so it opens true-to-size in Illustrator/Inkscape/Canva) plus a 300 DPI PNG proof.
//
// Print files are commonly required in CMYK; SVG/PNG here stay in sRGB (screen proof
// quality) and the kit note tells the printer to convert at RIP - see this folder's
// README for exactly what to hand a press.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";
import { COLORS, TAGLINE, BRAND, lockups, place, textPath, paintFor, font, OUT } from "./core.mjs";

export const DPI = 300;
export const MM = DPI / 25.4; // px per mm at 300 DPI

export const BUSINESS = {
  legalOwner: "Mihir Chouhan",
  title: "Founder & Show Director",
  phone: "+91 70000 51042",
  phoneDial: "+917000051042",
  whatsapp: "https://wa.me/917000051042",
  email: "mihirsoundandlight@gmail.com",
  web: "mihir-music.vercel.app",
  webUrl: "https://mihir-music.vercel.app",
  address: "Bajrang Nagar 363, Indore, Madhya Pradesh 452001",
  since: 2012,
};

const f2 = (n) => Number(n).toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/**
 * Print document in millimetres. `trimW`/`trimH` are the finished size; `bleed` is
 * extra artwork run-off on every edge (0 for documents with no cutting, like a
 * letterhead or a QR insert). The SVG viewBox spans the full bleed rectangle;
 * (0,0) is the bleed's top-left, so a trim-relative x becomes x + bleed.
 */
export function printDoc({ trimW, trimH, bleed = 0, safe = 3, background = "#000000" }) {
  const W = trimW + bleed * 2;
  const H = trimH + bleed * 2;
  return {
    trimW, trimH, bleed, safe, background,
    W, H,
    /** Convert trim-relative mm to bleed-relative mm (what every coordinate below should use). */
    x: (mmFromTrimLeft) => bleed + mmFromTrimLeft,
    y: (mmFromTrimTop) => bleed + mmFromTrimTop,
    cx: () => W / 2,
    cy: () => H / 2,
  };
}

/** Guide overlay: bleed line (red), trim line (gold dashed), safe area (thin grey dashed). Not printed. */
export function guides(doc) {
  const { W, H, bleed, safe, trimW, trimH } = doc;
  const parts = [];
  if (bleed > 0) {
    parts.push(`<rect x="0" y="0" width="${f2(W)}" height="${f2(H)}" fill="none" stroke="#FF3B3B" stroke-width="0.15" stroke-dasharray="1.2 1"/>`);
    parts.push(`<rect x="${f2(bleed)}" y="${f2(bleed)}" width="${f2(trimW)}" height="${f2(trimH)}" fill="none" stroke="#D4AF37" stroke-width="0.2" stroke-dasharray="2 1.2"/>`);
  }
  parts.push(`<rect x="${f2(bleed + safe)}" y="${f2(bleed + safe)}" width="${f2(trimW - safe * 2)}" height="${f2(trimH - safe * 2)}" fill="none" stroke="#7A7A7A" stroke-width="0.12" stroke-dasharray="0.8 0.8"/>`);
  return `<g>${parts.join("\n")}</g>`;
}

/** Wrap fragments into a full SVG document, mm units, with the shared gold gradient defined. */
export function svgDoc(doc, body, { title = "MIHIR print collateral", extraDefs = "" } = {}) {
  const { defs } = paintFor("gold");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f2(doc.W)}mm" height="${f2(doc.H)}mm" viewBox="0 0 ${f2(doc.W)} ${f2(doc.H)}">
<title>${esc(title)}</title>
<defs>
${defs}
${extraDefs}
</defs>
${doc.background ? `<rect width="${f2(doc.W)}" height="${f2(doc.H)}" fill="${doc.background}"/>` : ""}
${body}
</svg>`;
}

/** Render an mm-viewBox SVG to a PNG at the given DPI (default 300). */
export async function renderPrintPNG(svg, outPath, { dpi = DPI } = {}) {
  const m = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const wmm = m ? parseFloat(m[1]) : 100;
  const widthPx = Math.round(wmm * (dpi / 25.4));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg), { density: dpi }).resize({ width: widthPx }).png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

export function writeSVG(svg, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg);
  return outPath;
}

// ---------------------------------------------------------------------------
// Typography (mm sizes translate 1:1 to SVG user units == mm, so "size" below is mm)
// ---------------------------------------------------------------------------
export function text(fontKey, str, { x, y, size, fill = COLORS.white, letterSpacing = 0, align = "left", upper = false } = {}) {
  const content = upper ? String(str).toUpperCase() : String(str);
  const t = textPath(fontKey, content, { size, letterSpacing });
  const w = t.advance;
  const dx = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  return { body: `<path fill="${fill}" transform="translate(${f2(dx)} ${f2(y)})" d="${t.d}"/>`, width: w };
}

/** Greedy word wrap in mm. */
export function wrapMM(fontKey, str, size, maxWidth, letterSpacing = 0) {
  const words = String(str).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (textPath(fontKey, test, { size, letterSpacing }).advance <= maxWidth || !line) line = test;
    else { lines.push(line); line = w; }
  }
  if (line) lines.push(line);
  return lines;
}

export function multiline(fontKey, str, { x, y, size, maxWidth, fill = COLORS.white, letterSpacing = 0, align = "left", lineHeight = 1.3 } = {}) {
  const lines = wrapMM(fontKey, str, size, maxWidth, letterSpacing);
  const parts = [];
  lines.forEach((ln, i) => {
    const t = text(fontKey, ln, { x, y: y + i * size * lineHeight, size, fill, letterSpacing, align });
    parts.push(t.body);
  });
  return { body: parts.join("\n"), height: lines.length * size * lineHeight };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
/** Thin gold rule, mm coordinates. */
export function rule(x, y, w, { thickness = 0.3, opacity = 0.9, fill = "url(#mihirGold)" } = {}) {
  return `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(thickness)}" fill="${fill}" opacity="${opacity}"/>`;
}

/** Small gold diamond bullet centred at (x,y). */
export function bullet(x, y, size = 1.1) {
  return `<rect x="${f2(x - size / 2)}" y="${f2(y - size / 2)}" width="${f2(size)}" height="${f2(size)}" transform="rotate(45 ${f2(x)} ${f2(y)})" fill="url(#mihirGold)"/>`;
}

/** A logo mark placed by mm box (width or height driven). Wraps core lockups/place. */
export function mark(which, { x, y, width, height, fill = "gold", withTagline } = {}) {
  const base = which === "icon" ? lockups.icon({ fill })
    : which === "wordmark" ? lockups.wordmark({ fill })
    : which === "horizontal" ? lockups.horizontal({ fill, withTagline: withTagline ?? true })
    : which === "primary" ? lockups.primary({ fill, withTagline: withTagline ?? true })
    : lockups.stacked({ fill, withTagline: withTagline ?? true });
  const placed = place(base, width ? { width } : { height });
  return { body: place(placed, { x, y }).body, width: placed.width, height: placed.height };
}

/** Faint oversized monogram watermark, centred at (cx, cy), rotated slightly. Opacity default very low. */
export function watermark({ cx, cy, size = 120, opacity = 0.05, rotate = 0 }) {
  const m = mark("icon", { x: 0, y: 0, height: size, fill: COLORS.gold });
  const dx = cx - m.width / 2;
  const dy = cy - size / 2;
  return `<g opacity="${opacity}" transform="rotate(${rotate} ${f2(cx)} ${f2(cy)})"><g transform="translate(${f2(dx)} ${f2(dy)})">${m.body}</g></g>`;
}

/** QR code as an inline SVG group at (x,y) sized to `size` mm square. Gold on transparent. */
export async function qr(url, { x, y, size = 20, dark = COLORS.gold, light = "#00000000" } = {}) {
  const raw = await QRCode.toString(url, { type: "svg", margin: 0, color: { dark, light } });
  const inner = raw.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const vb = raw.match(/viewBox="0 0 (\d+) (\d+)"/);
  const n = vb ? parseFloat(vb[1]) : 25;
  const s = size / n;
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(s)})">${inner}</g>`;
}

/** Deterministic gold dust for backgrounds (mm space). */
export function particles(doc, { count = 60, seed = 11, opacity = [0.05, 0.35], size = [0.2, 0.6] } = {}) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = rnd() * doc.W;
    const y = rnd() * doc.H;
    const r = size[0] + rnd() * (size[1] - size[0]);
    const o = opacity[0] + rnd() * (opacity[1] - opacity[0]);
    out.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${COLORS.goldLight}" opacity="${f2(o)}"/>`);
  }
  return `<g>${out.join("")}</g>`;
}

export { OUT, COLORS, TAGLINE, BRAND, font };
