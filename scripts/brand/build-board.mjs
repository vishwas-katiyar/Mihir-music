// The MIHIR brand board: all 13 reference panels on one 4K canvas, composed as pure vector
// from core.mjs lockups plus the festival and palette compositions.
//
//   node scripts/brand/build-board.mjs

import path from "node:path";
import { fileURLToPath } from "node:url";
import { COLORS, TAGLINE, lockups, place, paintFor, textPath, renderPNG, renderJPG, writeSVG, OUT } from "./core.mjs";
import { festivalArt } from "./build-festival.mjs";
import { paletteArt } from "./build-guide.mjs";

const f2 = (n) => n.toFixed(2);

export const BOARD_W = 4096;
export const BOARD_H = 2731;
const BG = "#0B0B0B";
const GUTTER_FILL = "#222222";
const LABEL = "#C9C9C9";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function text(fontKey, str, { x, y, size, letterSpacing = 0, fill, anchor = "start", maxWidth, opacity }) {
  let t = textPath(fontKey, str, { size, letterSpacing });
  if (maxWidth && t.bbox.x2 - t.bbox.x1 > maxWidth) {
    size *= maxWidth / (t.bbox.x2 - t.bbox.x1);
    t = textPath(fontKey, str, { size, letterSpacing });
  }
  const w = t.bbox.x2 - t.bbox.x1;
  let dx = x - t.bbox.x1;
  if (anchor === "middle") dx -= w / 2;
  if (anchor === "end") dx -= w;
  const op = opacity != null ? ` opacity="${opacity}"` : "";
  return { body: `<path fill="${fill}"${op} transform="translate(${f2(dx)} ${f2(y)})" d="${t.d}"/>`, width: w, height: t.bbox.y2 - t.bbox.y1 };
}

/** Scale a mark to fit inside a box (contain) and centre it. */
function fit(mark, { x, y, w, h }, { align = "center" } = {}) {
  const s = Math.min(w / mark.width, h / mark.height);
  const pw = mark.width * s;
  const ph = mark.height * s;
  const px = align === "left" ? x : x + (w - pw) / 2;
  const py = y + (h - ph) / 2;
  return place(mark, { x: px, y: py, width: pw });
}

/** Use one shared gold gradient (#mihirGold) for every core lockup on the board. */
const goldPaint = paintFor("gold").paint;

// ---------------------------------------------------------------------------
// Panel compositions. Each receives its content box {x,y,w,h} and returns SVG.
// ---------------------------------------------------------------------------
const panels = {
  primary(box) {
    return fit(lockups.primary({ fill: "gold" }), pad(box, 0.1)).body;
  },
  horizontal(box) {
    return fit(lockups.horizontal({ fill: "gold" }), pad(box, 0.1)).body;
  },
  stacked(box) {
    // Vertical arrangement: large monogram / rule / wordmark / tagline.
    const b = pad(box, 0.1);
    const parts = [];
    const mono = fit(lockups.icon({ fill: "gold" }), { x: b.x, y: b.y, w: b.w, h: b.h * 0.52 });
    parts.push(mono.body);
    let y = b.y + b.h * 0.52 + b.h * 0.03;
    const ruleW = b.w * 0.4;
    parts.push(`<rect x="${f2(b.x + (b.w - ruleW) / 2)}" y="${f2(y)}" width="${f2(ruleW)}" height="3" rx="1.5" fill="${goldPaint}" opacity="0.85"/>`);
    y += b.h * 0.05;
    const word = fit(lockups.wordmark({ fill: "gold" }), { x: b.x + b.w * 0.14, y, w: b.w * 0.72, h: b.h * 0.22 });
    parts.push(word.body);
    y += b.h * 0.22 + b.h * 0.05;
    const tag = fit(lockups.tagline({ fill: "gold" }), { x: b.x + b.w * 0.14, y, w: b.w * 0.72, h: b.h * 0.05 });
    parts.push(tag.body);
    return parts.join("\n");
  },
  icon(box) {
    return fit(lockups.icon({ fill: "gold" }), pad(box, 0.14)).body;
  },
  wordmark(box) {
    return fit(lockups.wordmark({ fill: "gold" }), pad(box, 0.1)).body;
  },
  mono(box) {
    return fit(lockups.primary({ fill: COLORS.black }), pad(box, 0.1)).body;
  },
  inverse(box) {
    return fit(lockups.primary({ fill: COLORS.white }), pad(box, 0.1)).body;
  },
  avatar(box) {
    const b = pad(box, 0.08);
    const parts = [];
    // Large avatar
    const R = Math.min(b.w * 0.36, b.h * 0.42);
    const cx = b.x + b.w * 0.4;
    const cy = b.y + b.h * 0.5;
    parts.push(avatarMark(cx, cy, R));
    // Small avatar + caption
    const r = R * 0.38;
    const sx = b.x + b.w * 0.84;
    parts.push(avatarMark(sx, cy - r * 0.2, r));
    parts.push(text("cinzel", "PROFILE", { x: cx, y: cy + R + b.h * 0.1, size: b.h * 0.045, letterSpacing: 0.24, fill: "#7A7A7A", anchor: "middle" }).body);
    parts.push(text("cinzel", "THUMB", { x: sx, y: cy + R + b.h * 0.1, size: b.h * 0.045, letterSpacing: 0.24, fill: "#7A7A7A", anchor: "middle" }).body);
    return parts.join("\n");
  },
  badge(box) {
    const b = pad(box, 0.06);
    const R = Math.min(b.w, b.h) / 2;
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;
    const parts = [];
    parts.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(R)}" fill="${COLORS.black}" stroke="${goldPaint}" stroke-width="${f2(R * 0.035)}"/>`);
    parts.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(R * 0.9)}" fill="none" stroke="${goldPaint}" stroke-width="${f2(R * 0.012)}" opacity="0.9"/>`);
    // Content inside the inner ring
    const inner = R * 0.9;
    const mono = fit(lockups.icon({ fill: "gold" }), { x: cx - inner * 0.42, y: cy - inner * 0.78, w: inner * 0.84, h: inner * 0.78 });
    parts.push(mono.body);
    const word = fit(lockups.wordmark({ fill: "gold" }), { x: cx - inner * 0.6, y: cy + inner * 0.02, w: inner * 1.2, h: inner * 0.44 });
    parts.push(word.body);
    const tag = fit(lockups.tagline({ fill: "gold" }), { x: cx - inner * 0.6, y: cy + inner * 0.57, w: inner * 1.2, h: inner * 0.07 });
    parts.push(tag.body);
    // Small dots at 3 and 9 o'clock between the rings
    for (const a of [Math.PI, 0]) {
      parts.push(`<circle cx="${f2(cx + Math.cos(a) * R * 0.95)}" cy="${f2(cy + Math.sin(a) * R * 0.95)}" r="${f2(R * 0.014)}" fill="${goldPaint}"/>`);
    }
    return parts.join("\n");
  },
  responsive(box) {
    const b = pad(box, 0.07);
    const parts = [];
    const steps = [
      { mark: lockups.primary({ fill: "gold" }), label: "FULL LOGO  ≥ 200 PX", scale: 1 },
      { mark: lockups.horizontal({ fill: "gold" }), label: "HORIZONTAL  ≥ 160 PX", scale: 0.9 },
      { mark: lockups.wordmark({ fill: "gold" }), label: "WORDMARK  ≥ 120 PX", scale: 0.62 },
      { mark: lockups.icon({ fill: "gold" }), label: "ICON  ≥ 24 PX", scale: 0.55 },
    ];
    const gap = b.w * 0.04;
    const cw = (b.w - gap) / 2;
    const ch = (b.h - gap) / 2;
    steps.forEach((s, i) => {
      const cx = b.x + (i % 2) * (cw + gap);
      const cy = b.y + Math.floor(i / 2) * (ch + gap);
      const artH = ch * 0.68;
      const boxX = cx + cw * 0.08 + (cw * 0.84 * (1 - s.scale)) / 2;
      const boxY = cy + ch * 0.05;
      const m = fit(s.mark, { x: boxX, y: boxY, w: cw * 0.84 * s.scale, h: artH * s.scale });
      // Bottom-align the mark on the art area's baseline
      const dy = boxY + artH - (boxY + (artH * s.scale - m.height) / 2 + m.height);
      parts.push(`<g transform="translate(0 ${f2(dy)})">${m.body}</g>`);
      parts.push(`<rect x="${f2(cx + cw * 0.08)}" y="${f2(cy + ch * 0.8)}" width="${f2(cw * 0.84)}" height="1" fill="#2A2A2A"/>`);
      parts.push(text("cinzel", s.label, { x: cx + cw / 2, y: cy + ch * 0.93, size: ch * 0.075, letterSpacing: 0.16, fill: "#8A8A8A", anchor: "middle", maxWidth: cw * 0.9 }).body);
    });
    return parts.join("\n");
  },
  festival(box) {
    const art = festivalArt({ width: box.w, height: box.h, variant: "banner", id: "boardFest" });
    return {
      defs: `${art.defs}<clipPath id="boardFestClip"><rect x="${f2(box.x)}" y="${f2(box.y)}" width="${f2(box.w)}" height="${f2(box.h)}"/></clipPath>`,
      body: `<g clip-path="url(#boardFestClip)"><g transform="translate(${f2(box.x)} ${f2(box.y)})">${art.body}</g></g>`,
    };
  },
  variations(box) {
    const b = pad(box, 0.05);
    const tiles = [
      { label: "GOLD ON BLACK", bg: COLORS.black, fill: "gold" },
      { label: "BLACK ON WHITE", bg: COLORS.white, fill: COLORS.black },
      { label: "WHITE ON BLACK", bg: COLORS.black, fill: COLORS.white },
      { label: "BLACK ON GOLD", bg: COLORS.gold, fill: COLORS.black },
      { label: "GOLD ON NAVY", bg: COLORS.navy, fill: "gold" },
      { label: "WHITE ON GREY", bg: COLORS.grey, fill: COLORS.white },
    ];
    const cols = 3;
    const rows = 2;
    const gap = b.w * 0.025;
    const tw = (b.w - gap * (cols - 1)) / cols;
    const th = (b.h - gap * (rows - 1)) / rows;
    const parts = [];
    tiles.forEach((t, i) => {
      const cx = b.x + (i % cols) * (tw + gap);
      const cy = b.y + Math.floor(i / cols) * (th + gap);
      const lightBg = t.bg === COLORS.white || t.bg === COLORS.gold;
      parts.push(`<rect x="${f2(cx)}" y="${f2(cy)}" width="${f2(tw)}" height="${f2(th)}" rx="${f2(tw * 0.02)}" fill="${t.bg}" stroke="#2A2A2A" stroke-width="1"/>`);
      const m = fit(lockups.primary({ fill: t.fill }), { x: cx + tw * 0.12, y: cy + th * 0.1, w: tw * 0.76, h: th * 0.62 });
      parts.push(m.body);
      parts.push(
        text("cinzel", t.label, { x: cx + tw / 2, y: cy + th * 0.9, size: th * 0.055, letterSpacing: 0.18, fill: lightBg ? "#333333" : "#9A9A9A", anchor: "middle", maxWidth: tw * 0.9 }).body,
      );
    });
    return parts.join("\n");
  },
  palette(box) {
    const art = paletteArt({ width: box.w, height: box.h, id: "boardPal", compact: true, background: BG });
    return {
      defs: art.defs,
      body: `<g transform="translate(${f2(box.x)} ${f2(box.y)})">${art.body}</g>`,
    };
  },
};

function pad(box, frac) {
  const p = Math.min(box.w, box.h) * frac;
  return { x: box.x + p, y: box.y + p, w: box.w - 2 * p, h: box.h - 2 * p };
}

function avatarMark(cx, cy, R) {
  const parts = [];
  parts.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(R)}" fill="${COLORS.black}" stroke="${goldPaint}" stroke-width="${f2(R * 0.04)}"/>`);
  parts.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(R * 0.9)}" fill="none" stroke="${goldPaint}" stroke-width="${f2(R * 0.01)}" opacity="0.6"/>`);
  const m = fit(lockups.icon({ fill: "gold" }), { x: cx - R * 0.62, y: cy - R * 0.62, w: R * 1.24, h: R * 1.24 });
  parts.push(m.body);
  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export function boardArt() {
  const W = BOARD_W;
  const H = BOARD_H;
  const margin = 48;
  const gutter = 14;
  const headerH = 120;
  const labelH = 64;

  const gridX = margin;
  const gridY = margin + headerH;
  const gridW = W - margin * 2;
  const gridH = H - margin * 2 - headerH;

  const rowH = [760, 760];
  rowH.push(gridH - rowH[0] - rowH[1] - gutter * 2);

  const row1 = splitRow(gridX, gridY, gridW, rowH[0], [1, 1, 1, 1, 1], gutter);
  const row2 = splitRow(gridX, gridY + rowH[0] + gutter, gridW, rowH[1], [1, 1, 1, 1, 1], gutter);
  const row3 = splitRow(gridX, gridY + rowH[0] + rowH[1] + gutter * 2, gridW, rowH[2], [1.62, 1.1, 1.28], gutter);

  const spec = [
    { box: row1[0], label: "1. PRIMARY LOGO", draw: panels.primary },
    { box: row1[1], label: "2. HORIZONTAL LOGO", draw: panels.horizontal },
    { box: row1[2], label: "3. STACKED / VERTICAL LOGO", draw: panels.stacked },
    { box: row1[3], label: "4. ICON / MARK (Symbol Only)", draw: panels.icon },
    { box: row1[4], label: "5. WORDMARK (Text Only)", draw: panels.wordmark },
    { box: row2[0], label: "6. MONOCHROME LOGO", draw: panels.mono, bg: COLORS.white, labelFill: "#444444" },
    { box: row2[1], label: "7. INVERSE / NEGATIVE LOGO", draw: panels.inverse },
    { box: row2[2], label: "8. SOCIAL MEDIA AVATAR", draw: panels.avatar },
    { box: row2[3], label: "9. BADGE / EMBLEM VERSION", draw: panels.badge },
    { box: row2[4], label: "10. RESPONSIVE LOGO (Multi-size usage)", draw: panels.responsive },
    { box: row3[0], label: "11. FESTIVAL / EVENT VARIATION", draw: panels.festival, flush: true },
    { box: row3[1], label: "12. COLOUR VARIATIONS (for different backgrounds)", draw: panels.variations },
    { box: row3[2], label: "13. BRAND COLOURS & TYPOGRAPHY", draw: panels.palette, flush: true },
  ];

  const defs = [paintFor("gold").defs];
  const body = [];
  body.push(`<rect width="${W}" height="${H}" fill="${BG}"/>`);
  // Gutter field behind the panels
  body.push(`<rect x="${gridX}" y="${gridY}" width="${gridW}" height="${gridH}" fill="${GUTTER_FILL}"/>`);

  // Header
  const headY = margin + headerH * 0.62;
  body.push(text("cinzelBold", "MIHIR  BRAND BOARD", { x: margin + 8, y: headY, size: 44, letterSpacing: 0.3, fill: goldPaint }).body);
  body.push(text("cinzel", TAGLINE, { x: W - margin - 8, y: headY, size: 30, letterSpacing: 0.22, fill: "#8A8A8A", anchor: "end" }).body);
  body.push(text("cinzel", "GOLD #D4AF37  ·  BLACK #000000  ·  CHARCOAL #1A1A1A  ·  WHITE #F5F5F5", { x: W / 2, y: headY, size: 24, letterSpacing: 0.18, fill: "#5A5A5A", anchor: "middle" }).body);

  for (const p of spec) {
    const { box } = p;
    const bg = p.bg || BG;
    body.push(`<rect x="${f2(box.x)}" y="${f2(box.y)}" width="${f2(box.w)}" height="${f2(box.h)}" fill="${bg}"/>`);
    // Label strip
    const labelFill = p.labelFill || LABEL;
    const content = { x: box.x, y: box.y + labelH, w: box.w, h: box.h - labelH };
    const out = p.draw(content);
    if (typeof out === "string") body.push(out);
    else {
      defs.push(out.defs);
      body.push(out.body);
    }
    // Label drawn after content so festival/palette art never covers it
    body.push(`<rect x="${f2(box.x)}" y="${f2(box.y)}" width="${f2(box.w)}" height="${labelH}" fill="${bg}"/>`);
    body.push(text("cinzel", p.label, { x: box.x + 26, y: box.y + labelH * 0.66, size: 25, letterSpacing: 0.12, fill: labelFill, maxWidth: box.w - 52 }).body);
    body.push(`<rect x="${f2(box.x + 26)}" y="${f2(box.y + labelH - 1)}" width="${f2(box.w - 52)}" height="1" fill="${p.bg ? "#DDDDDD" : "#1E1E1E"}"/>`);
  }

  return { width: W, height: H, defs: defs.join("\n"), body: body.join("\n") };
}

function splitRow(x, y, w, h, weights, gutter) {
  const total = weights.reduce((a, b) => a + b, 0);
  const usable = w - gutter * (weights.length - 1);
  let cx = x;
  return weights.map((wt) => {
    const pw = (usable * wt) / total;
    const box = { x: cx, y, w: pw, h };
    cx += pw + gutter;
    return box;
  });
}

export async function build({ outDir = path.join(OUT, "board"), log = console.log } = {}) {
  const art = boardArt();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${art.width}" height="${art.height}" viewBox="0 0 ${art.width} ${art.height}">
<title>MIHIR - Brand board</title>
<defs>
${art.defs}
</defs>
${art.body}
</svg>`;
  writeSVG(svg, path.join(outDir, "mihir-brand-board.svg"));
  await renderPNG(svg, path.join(outDir, "mihir-brand-board.png"), { width: art.width });
  await renderJPG(svg, path.join(outDir, "mihir-brand-board.jpg"), { width: art.width, quality: 92 });
  log(`wrote mihir-brand-board ${art.width}x${art.height} (svg, png, jpg)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
}
