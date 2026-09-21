// Social-media feed templates (square 1080x1080 + portrait 1080x1350).
// Every template is a function of `format` and is rendered once per format, so the
// composition adapts to the taller canvas instead of being stretched.
//
//   node scripts/brand/build-social-feed.mjs
//
// Output: assets/brand/14-social-media-templates/feed-square/ and feed-portrait/
// (.svg master + .png at exact pixel size per template).

import path from "node:path";
import sharp from "sharp";
import { lockups, place, textPath, renderPNG, writeSVG, OUT } from "./core.mjs";
import {
  FORMATS,
  BUSINESS,
  SOCIAL,
  GOLD,
  FONT,
  canvas,
  bg,
  particles,
  frame,
  text,
  eyebrow,
  headline,
  statement,
  body,
  rule,
  ornament,
  list,
  ctaPill,
  ctaOutline,
  footerBar,
  cornerLogo,
  heroLogo,
  wordmarkAt,
  photoSlot,
  chips,
  measure,
} from "./social-core.mjs";

const ROOT = path.join(OUT, "14-social-media-templates");
const FEEDS = [
  { key: "square", dir: "feed-square" },
  { key: "portrait", dir: "feed-portrait" },
];

// Layout constants shared by every template.
const M = 80; // side / top margin
const FOOTER_MARGIN = 80; // footerBar margin so the monogram lands >= 72 px from the edge
const FOOTER_H = 96;
const f2 = (n) => Number(n).toFixed(2);
const tall = (f) => f.h / f.w > 1.15;

/** y of the footer hairline (mirrors footerBar's internal maths). */
const footerRuleY = (f) => f.h - FOOTER_H - FOOTER_MARGIN * 0.6 - 22;
/** Lowest y any content may reach. */
const contentBottom = (f) => footerRuleY(f) - 30;

// ---------------------------------------------------------------------------
// Local helpers (kept here so social-core.mjs stays untouched)
// ---------------------------------------------------------------------------

/**
 * Vertical flow. `steps` is a list of numbers (spacers) or functions (y) => { body, height }.
 * Everything is laid out from y = 0; use placeFlow() to drop the block onto the canvas.
 */
function flow(steps) {
  let y = 0;
  const parts = [];
  for (const s of steps) {
    if (typeof s === "number") {
      y += s;
      continue;
    }
    const r = s(y);
    if (!r) continue;
    parts.push(r.body);
    y += r.height || 0;
  }
  return { body: parts.join("\n"), height: y };
}

/** Centre (or top-anchor) a flow block between top and bottom. Reports overflow. */
function placeFlow(block, { top, bottom, align = "center" }) {
  const avail = bottom - top;
  const off = align === "center" ? top + Math.max(0, (avail - block.height) / 2) : top;
  return { body: `<g transform="translate(0 ${f2(off)})">${block.body}</g>`, overflow: block.height - avail, height: block.height, avail };
}

/** Wrap a plain SVG string as a flow step with a fixed height. */
const fixed = (svg, height) => ({ body: svg, height });

/** Monogram icon centred at cx with the artwork's top at y (tight box, not the 1000 px frame). */
function monogramAt({ cx, y, width }) {
  const icon = lockups.icon({ fill: "gold" });
  const c = icon.content || { x: 0, y: 0, w: icon.width, h: icon.height };
  const s = width / c.w; // `width` is the visible artwork width
  const m = place(icon, { width: icon.width * s });
  return { body: place(m, { x: cx - (c.x + c.w / 2) * s, y: y - c.y * s }).body, width, height: c.h * s };
}

/** Horizontal lockup (with tagline) centred at cx, top y, scaled to a width. */
function horizontalLockupAt({ cx, y, width, withTagline = true }) {
  const lk = place(lockups.horizontal({ fill: "gold", withTagline, divider: true }), { width });
  return { body: place(lk, { x: cx - lk.width / 2, y }).body, width: lk.width, height: lk.height };
}

/** Large Playfair opening quotation mark in gold, centred at cx, glyph top at y. */
function quoteMark({ cx, y, size = 220, fill = GOLD }) {
  const t = textPath(FONT.serifBold, "“", { size });
  const bw = t.bbox.x2 - t.bbox.x1;
  const bh = t.bbox.y2 - t.bbox.y1;
  const dx = cx - t.bbox.x1 - bw / 2;
  const dy = y - t.bbox.y1;
  return { body: `<path fill="${fill}" transform="translate(${f2(dx)} ${f2(dy)})" d="${t.d}"/>`, width: bw, height: bh };
}

/** Five-point star path centred at (cx, cy) with outer radius R. */
function starPath(cx, cy, R) {
  const r = R * 0.42;
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    d += `${i ? "L" : "M"}${f2(cx + rr * Math.cos(a))} ${f2(cy + rr * Math.sin(a))}`;
  }
  return `${d}Z`;
}

/** Row of n gold stars centred at cx, top y. */
function stars({ cx, y, n = 5, R = 12, gap = 16, fill = "#D4AF37" }) {
  const total = n * 2 * R + (n - 1) * gap;
  let x = cx - total / 2 + R;
  const parts = [];
  for (let i = 0; i < n; i++) {
    parts.push(`<path d="${starPath(x, y + R, R)}" fill="${fill}"/>`);
    x += 2 * R + gap;
  }
  return { body: `<g>${parts.join("")}</g>`, width: total, height: 2 * R };
}

/** "LABEL  value" on one line, centred at cx (label in small gold caps, value in white). */
function detailRow(label, value, { cx, y, size = 28, labelSize = 17, gap = 20 }) {
  const lw = measure(FONT.sansSemi, label.toUpperCase(), labelSize, 0.28);
  const vw = measure(FONT.sansMedium, value, size);
  const total = lw + gap + vw;
  const x0 = cx - total / 2;
  const l = eyebrow(label, { x: x0, y: y + (size - labelSize) * 0.92, size: labelSize });
  const v = text(FONT.sansMedium, value, { x: x0 + lw + gap, y, size, fill: SOCIAL.ink });
  return { body: l.body + "\n" + v.body, width: total, height: v.height };
}

/** 2-column spec grid: small gold cap label over a white value, gold tick above each cell. */
function specGrid(items, { x, y, width, cols = 2, labelSize = 16, valueSize = 28, rowGap = 30, colGap = 40 }) {
  const colW = (width - colGap * (cols - 1)) / cols;
  const parts = [];
  const cellH = labelSize * 1.25 + 10 + valueSize * 1.25;
  let rows = 0;
  items.forEach(([label, value], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    rows = Math.max(rows, row + 1);
    const cx = x + col * (colW + colGap);
    const cy = y + row * (cellH + rowGap);
    parts.push(`<rect x="${f2(cx)}" y="${f2(cy)}" width="26" height="2" fill="#D4AF37"/>`);
    parts.push(eyebrow(label, { x: cx, y: cy + 14, size: labelSize }).body);
    parts.push(text(FONT.sansMedium, value, { x: cx, y: cy + 14 + labelSize * 1.25 + 8, size: valueSize, fill: SOCIAL.ink, maxWidth: colW }).body);
  });
  return { body: parts.join("\n"), height: 14 + rows * cellH + (rows - 1) * rowGap };
}

/** Left-aligned outline CTA (ctaOutline is centre-anchored). */
function ctaOutlineLeft(label, { x, y }) {
  const probe = ctaOutline(label, { cx: 0, y: 0 });
  return ctaOutline(label, { cx: x + probe.width / 2, y });
}

// ---------------------------------------------------------------------------
// Templates. Each returns { parts, transparent?, title }.
// ---------------------------------------------------------------------------

function brandStatement(f) {
  const { w } = f;
  const block = flow([
    (y) => eyebrow(`Live event production · Indore · Since ${BUSINESS.since}`, { x: w / 2, y, align: "center" }),
    tall(f) ? 56 : 44,
    (y) => heroLogo({ cx: w / 2, y, width: tall(f) ? 820 : 760 }),
    tall(f) ? 56 : 44,
    (y) => fixed(ornament(w / 2, y, { width: 200 }), 2),
    tall(f) ? 56 : 44,
    (y) => ctaPill("Book your event", { cx: w / 2, y }),
  ]);
  const placed = placeFlow(block, { top: M, bottom: contentBottom(f) });
  return { title: "MIHIR - Brand statement", parts: [bg(f, { glow: "both" }), placed.body, footerBar(f, { margin: FOOTER_MARGIN })], placed };
}

function servicesOverview(f) {
  const { w } = f;
  const cw = w - 2 * M;
  const logoH = 64;
  const top = M + logoH + (tall(f) ? 72 : 48);
  const block = flow([
    (y) => eyebrow("What we do", { x: M, y }),
    22,
    (y) => headline("Everything your stage needs", { x: M, y, size: tall(f) ? 66 : 58, maxWidth: cw }),
    28,
    (y) => fixed(rule(M + 70, y, 140), 2),
    tall(f) ? 48 : 38,
    (y) => list(BUSINESS.servicesLong, { x: M, y, size: tall(f) ? 30 : 28, gap: tall(f) ? 2.0 : 1.8, maxWidth: cw }),
    tall(f) ? 56 : 40,
    (y) => ctaOutlineLeft("Get an estimate", { x: M, y }),
  ]);
  const placed = placeFlow(block, { top, bottom: contentBottom(f) });
  return {
    title: "MIHIR - Services overview",
    parts: [bg(f, { glow: "top" }), cornerLogo({ x: M, y: M, height: logoH }), placed.body, footerBar(f, { margin: FOOTER_MARGIN })],
    placed,
  };
}

function photoPost(f, { overlay = false } = {}) {
  const { w, h } = f;
  const cw = w - 2 * M;
  const ph = Math.round(h * (tall(f) ? 0.6 : 0.6));
  const parts = [];
  // Solid lower panel: on the opaque version it matches the canvas; on the overlay it is what
  // keeps the copy legible when the client's photo fills the whole frame.
  parts.push(`<rect x="0" y="${ph - 1}" width="${w}" height="${h - ph + 1}" fill="${SOCIAL.black}"/>`);
  parts.push(`<clipPath id="lowerPanel"><rect x="0" y="${ph}" width="${w}" height="${h - ph}"/></clipPath>`);
  parts.push(`<g clip-path="url(#lowerPanel)">${overlay ? "" : `<rect width="${w}" height="${h}" fill="url(#glowBottom)"/>`}${particles(f, { count: 70, seed: 5 })}</g>`);
  parts.push(photoSlot({ x: 0, y: 0, w, h: ph, mode: overlay ? "cutout" : "placeholder", radius: 0, fadeBottom: 0.5 }));

  const block = flow([
    (y) => eyebrow("Wedding · Sangeet night", { x: w / 2, y, align: "center" }),
    18,
    (y) => headline("Sound that fills the floor", { x: w / 2, y, size: tall(f) ? 58 : 50, align: "center", maxWidth: cw }),
    tall(f) ? 22 : 16,
    (y) => body("Line-array audio tuned to the room, so every beat reaches the last table.", { x: w / 2, y, size: tall(f) ? 26 : 24, align: "center", maxWidth: cw - 40 }),
    tall(f) ? 40 : 30,
    (y) => chips(BUSINESS.services, { cx: w / 2, y, size: 15, padX: 16, gap: 10, maxWidth: cw }),
  ]);
  const top = ph - (tall(f) ? 40 : 56);
  const placed = placeFlow(block, { top, bottom: contentBottom(f) });
  parts.push(placed.body, footerBar(f, { margin: FOOTER_MARGIN }));
  return { title: overlay ? "MIHIR - Photo post overlay (transparent)" : "MIHIR - Photo post", parts, transparent: overlay, placed };
}

function eventAnnouncement(f) {
  const { w } = f;
  const cw = w - 2 * M;
  const rows = [
    ["Date", "21 Sep 2026"],
    ["Venue", "Brilliant Convention Centre, Indore"],
    ["Time", "7 PM onwards"],
  ];
  const block = flow([
    (y) => monogramAt({ cx: w / 2, y, width: tall(f) ? 200 : 170 }),
    tall(f) ? 48 : 36,
    (y) => eyebrow("Live this weekend", { x: w / 2, y, align: "center" }),
    16,
    (y) => statement("Garba Night 2026", { x: w / 2, y, size: tall(f) ? 100 : 88, align: "center", maxWidth: cw }),
    tall(f) ? 36 : 26,
    (y) => fixed(ornament(w / 2, y, { width: 240 }), 2),
    tall(f) ? 48 : 36,
    ...rows.flatMap(([l, v], i) => [(y) => detailRow(l, v, { cx: w / 2, y, size: tall(f) ? 30 : 28 }), i < rows.length - 1 ? (tall(f) ? 22 : 16) : 0]),
  ]);
  const placed = placeFlow(block, { top: M, bottom: contentBottom(f) });
  return { title: "MIHIR - Event announcement", parts: [bg(f, { glow: "both" }), placed.body, footerBar(f, { margin: FOOTER_MARGIN })], placed };
}

function testimonial(f) {
  const { w } = f;
  const cw = w - 2 * M;
  const quote = "The sound was crystal clear across 1,200 guests and the lighting made our sangeet look like a concert.";
  const wm = wordmarkAt({ cx: w / 2, y: 0, width: 300 });
  const wmY = contentBottom(f) - wm.height;
  const block = flow([
    (y) => quoteMark({ cx: w / 2, y, size: 220 }),
    tall(f) ? 36 : 28,
    (y) => statement(quote, { x: w / 2, y, size: tall(f) ? 44 : 40, align: "center", maxWidth: cw - 40, italic: true, lineHeight: 1.3 }),
    tall(f) ? 44 : 36,
    (y) => stars({ cx: w / 2, y, R: 12, gap: 16 }),
    tall(f) ? 32 : 26,
    (y) => body("— Priya & Rohan, Wedding, Indore", { x: w / 2, y, size: 24, align: "center", weight: "medium" }),
  ]);
  const placed = placeFlow(block, { top: M, bottom: wmY - 56 });
  return {
    title: "MIHIR - Client testimonial",
    parts: [bg(f, { glow: "top" }), placed.body, wordmarkAt({ cx: w / 2, y: wmY, width: 300 }).body, footerBar(f, { margin: FOOTER_MARGIN, showPhone: false })],
    placed,
  };
}

function bookingCta(f) {
  const { w, h } = f;
  const cw = w - 2 * M;
  let ps = tall(f) ? 104 : 94;
  while (measure(FONT.sansBold, BUSINESS.phone, ps, 0.02) > cw - 40) ps -= 2;
  const lock = horizontalLockupAt({ cx: w / 2, y: 0, width: 380 });
  const lockY = h - M - lock.height;
  const block = flow([
    (y) => eyebrow("Now booking", { x: w / 2, y, align: "center" }),
    20,
    (y) => headline("Wedding season 2026-27", { x: w / 2, y, size: tall(f) ? 60 : 52, align: "center", maxWidth: cw }),
    tall(f) ? 28 : 22,
    (y) =>
      body("Line-array sound, DMX lighting and stage rigging for weddings, concerts and corporate events across Madhya Pradesh.", {
        x: w / 2,
        y,
        size: tall(f) ? 26 : 25,
        align: "center",
        maxWidth: cw - 120,
      }),
    tall(f) ? 64 : 44,
    (y) => text(FONT.sansBold, BUSINESS.phone, { x: w / 2, y, size: ps, fill: GOLD, align: "center", letterSpacing: 0.02 }),
    tall(f) ? 22 : 16,
    (y) => text(FONT.sansSemi, `WhatsApp · ${BUSINESS.whatsapp}`, { x: w / 2, y, size: 22, fill: SOCIAL.ink, align: "center", letterSpacing: 0.04 }),
    10,
    (y) => text(FONT.sansMedium, BUSINESS.web, { x: w / 2, y, size: 22, fill: SOCIAL.muted, align: "center", letterSpacing: 0.04 }),
    tall(f) ? 48 : 36,
    (y) => fixed(ornament(w / 2, y, { width: 220 }), 2),
  ]);
  const placed = placeFlow(block, { top: M, bottom: lockY - 56 });
  return {
    title: "MIHIR - Booking call to action",
    parts: [bg(f, { glow: "both" }), placed.body, horizontalLockupAt({ cx: w / 2, y: lockY, width: 380 }).body],
    placed,
  };
}

function gearSpotlight(f) {
  const { w } = f;
  const cw = w - 2 * M;
  const specs = [
    ["Coverage", "2,000+ guests"],
    ["Rigging", "Certified truss"],
    ["Control", "Digital mixing"],
    ["Crew", "Show-called"],
  ];
  const copy = "Flown arrays and ground subs tuned to the venue - even coverage from the front row to the last table.";
  let steps;
  if (tall(f)) {
    const photo = { w: cw, h: Math.round(cw * 0.5) };
    steps = [
      (y) => fixed(photoSlot({ x: M, y, w: photo.w, h: photo.h, radius: 24, label: "GEAR PHOTO", fadeBottom: 0 }), photo.h),
      44,
      (y) => eyebrow("Gear spotlight", { x: M, y }),
      16,
      (y) => headline("Line-array sound", { x: M, y, size: 60, maxWidth: cw }),
      18,
      (y) => body(copy, { x: M, y, size: 26, maxWidth: cw - 120 }),
      44,
      (y) => specGrid(specs, { x: M, y, width: cw }),
    ];
  } else {
    const side = Math.round(cw * 0.46);
    const gap = 56;
    const textW = cw - side - gap;
    steps = [
      (y) => {
        const col = flow([
          (yy) => eyebrow("Gear spotlight", { x: M, y: yy }),
          16,
          (yy) => headline("Line-array sound", { x: M, y: yy, size: 48, maxWidth: textW }),
          18,
          (yy) => body(copy, { x: M, y: yy, size: 24, maxWidth: textW }),
        ]);
        const off = y + Math.max(0, (side - col.height) / 2);
        const photo = photoSlot({ x: w - M - side, y, w: side, h: side, radius: 24, label: "GEAR PHOTO", fadeBottom: 0 });
        return fixed(`${photo}\n<g transform="translate(0 ${f2(off)})">${col.body}</g>`, side);
      },
      48,
      (y) => fixed(rule(w / 2, y, cw, { opacity: 0.5 }), 2),
      34,
      (y) => specGrid(specs, { x: M, y, width: cw }),
    ];
  }
  const placed = placeFlow(flow(steps), { top: M, bottom: contentBottom(f) });
  return { title: "MIHIR - Gear spotlight", parts: [bg(f, { glow: "top" }), placed.body, footerBar(f, { margin: FOOTER_MARGIN })], placed };
}

function festiveGreeting(f) {
  const { w } = f;
  const cw = w - 2 * M;
  const block = flow([
    (y) => fixed(ornament(w / 2, y, { width: 260 }), 2),
    tall(f) ? 52 : 40,
    (y) => headline("Wishing you a joyful Diwali", { x: w / 2, y, size: tall(f) ? 62 : 54, align: "center", maxWidth: cw - 40 }),
    tall(f) ? 30 : 22,
    (y) => statement("May your celebrations shine as bright as the stage.", { x: w / 2, y, size: tall(f) ? 34 : 30, align: "center", italic: true, fill: SOCIAL.muted, maxWidth: cw - 140 }),
    tall(f) ? 72 : 56,
    (y) => heroLogo({ cx: w / 2, y, width: 440 }),
  ]);
  const placed = placeFlow(block, { top: M + 24, bottom: contentBottom(f) });
  return {
    title: "MIHIR - Festive greeting",
    parts: [bg(f, { glow: "both", dust: false }), particles(f, { count: 160, seed: 11, opacity: [0.15, 0.6] }), frame(f, { inset: 40 }), placed.body, footerBar(f, { margin: FOOTER_MARGIN })],
    placed,
  };
}

const TEMPLATES = [
  { id: "01-brand-statement", build: brandStatement },
  { id: "02-services-overview", build: servicesOverview },
  { id: "03-photo-post", build: (f) => photoPost(f) },
  { id: "03-photo-post-overlay", build: (f) => photoPost(f, { overlay: true }) },
  { id: "04-event-announcement", build: eventAnnouncement },
  { id: "05-testimonial", build: testimonial },
  { id: "06-booking-cta", build: bookingCta },
  { id: "07-gear-spotlight", build: gearSpotlight },
  { id: "08-festive-greeting", build: festiveGreeting },
];

// ---------------------------------------------------------------------------
// Build + verify
// ---------------------------------------------------------------------------
async function checkAlpha(png, format, photoH) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => data[(y * info.width + x) * info.channels + 3];
  const samples = {
    corner: px(4, 4),
    photoMid: px(Math.round(format.w / 2), Math.round(photoH * 0.3)),
    lowerPanel: px(Math.round(format.w / 2), Math.round((photoH + format.h) / 2)),
  };
  const ok = samples.corner === 0 && samples.photoMid === 0 && samples.lowerPanel === 255;
  return { ok, samples };
}

async function main() {
  const written = [];
  const issues = [];
  for (const { key, dir } of FEEDS) {
    const format = FORMATS[key];
    for (const t of TEMPLATES) {
      const { parts, transparent = false, title, placed } = t.build(format);
      const svg = canvas(format, parts, { transparent, title });
      const base = path.join(ROOT, dir, t.id);
      writeSVG(svg, `${base}.svg`);
      await renderPNG(svg, `${base}.png`, { width: format.w, ...(transparent ? { background: null } : {}) });
      written.push(`${base}.svg`, `${base}.png`);
      const fit = placed ? `block ${Math.round(placed.height)} / avail ${Math.round(placed.avail)}` : "";
      if (placed && placed.overflow > 0) issues.push(`${dir}/${t.id}: content overflows by ${Math.round(placed.overflow)} px`);
      console.log(`${dir}/${t.id}.png  ${format.w}x${format.h}  ${fit}`);
      if (transparent) {
        const photoH = Math.round(format.h * 0.6);
        const a = await checkAlpha(`${base}.png`, format, photoH);
        console.log(`  alpha check ${a.ok ? "OK" : "FAILED"} ${JSON.stringify(a.samples)}`);
        if (!a.ok) issues.push(`${dir}/${t.id}: overlay alpha check failed ${JSON.stringify(a.samples)}`);
      }
    }
  }
  console.log(`\n${written.length} files written under ${ROOT}`);
  if (issues.length) {
    console.log("\nISSUES:");
    issues.forEach((i) => console.log(` - ${i}`));
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
