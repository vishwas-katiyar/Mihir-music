// Social-media templates: Instagram / WhatsApp stories (1080x1920) and platform covers
// (Facebook cover, LinkedIn cover, YouTube banner, link-post card).
//
//   node scripts/brand/build-social-story.mjs
//
// Everything composes from core.mjs (traced marks, gold gradient, fonts) through the
// social layer in social-core.mjs, so the templates match the rest of the brand kit.
// Copy lives in the TEMPLATE FUNCTIONS below - change the strings and rebuild.
// The companion script build-social-feed.mjs produces feed-square/ and feed-portrait/.

import path from "node:path";
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
  ctaPill,
  ctaOutline,
  footerBar,
  cornerLogo,
  heroLogo,
  wordmarkAt,
  photoSlot,
  measure,
} from "./social-core.mjs";

const ROOT = path.join(OUT, "14-social-media-templates");
const STORY_DIR = path.join(ROOT, "story");
const COVER_DIR = path.join(ROOT, "covers");

const f2 = (n) => Number(n).toFixed(2);

// Instagram overlays its UI on the top 250 px and bottom 300 px of a story.
const STORY = FORMATS.story;
const SAFE = { top: 250, bottom: STORY.h - 300 }; // essential content stays inside [250, 1620]
const M = 72; // horizontal margin
const CX = STORY.w / 2;
// footerBar is 96 px tall; y = 1500 puts its bottom edge at 1596 (> 300 px from the bottom).
const STORY_FOOTER_Y = 1500;

// ---------------------------------------------------------------------------
// Local helpers (extra pieces on top of social-core; nothing here re-types the marks)
// ---------------------------------------------------------------------------

/** Monogram icon placed so its VISIBLE artwork is `artHeight` tall with its top at y. */
function iconArt({ cx, y, artHeight, opacity = 1 }) {
  const icon = lockups.icon({ fill: "gold" });
  const c = icon.content; // artwork box inside the 1000 x 1000 icon square
  const s = artHeight / c.h;
  const boxW = icon.width * s;
  const bx = cx - (c.x + c.w / 2) * s;
  const by = y - c.y * s;
  const g = place(icon, { x: bx, y: by, width: boxW }).body;
  return { body: opacity < 1 ? `<g opacity="${opacity}">${g}</g>` : g, width: c.w * s, height: c.h * s };
}

/** Faint giant monogram used as a backdrop, centred on (cx, cy). */
function backdropIcon({ cx, cy, artWidth, opacity }) {
  const icon = lockups.icon({ fill: "gold" });
  const c = icon.content;
  const s = artWidth / c.w;
  const artH = c.h * s;
  return iconArt({ cx, y: cy - artH / 2, artHeight: artH, opacity });
}

/** Label + value pair for event details (DATE / VENUE / TIME). Returns { body, height }. */
function detail(label, value, { cx, y, labelSize = 20, valueSize = 34 }) {
  const parts = [];
  const lb = eyebrow(label, { x: cx, y, align: "center", size: labelSize });
  parts.push(lb.body);
  const vy = y + labelSize * 1.65;
  const v = text(FONT.serif, value, { x: cx, y: vy, size: valueSize, fill: SOCIAL.ink, align: "center" });
  parts.push(v.body);
  return { body: parts.join("\n"), height: vy - y + v.height };
}

/** Row of five-point stars. */
function stars(cx, y, { n = 5, r = 17, gap = 16, fill = GOLD } = {}) {
  const star = (x, cy) => {
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${f2(x + Math.cos(a) * rad)},${f2(cy + Math.sin(a) * rad)}`);
    }
    return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
  };
  const total = n * r * 2 + (n - 1) * gap;
  let x = cx - total / 2 + r;
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(star(x, y + r));
    x += r * 2 + gap;
  }
  return { body: `<g>${out.join("")}</g>`, height: r * 2 };
}

/**
 * Items joined by " · ", greedily packed into lines no wider than maxWidth so a
 * separator never starts a line. Returns { body, height }.
 */
function dotLines(items, { x, y, size = 24, maxWidth = Infinity, align = "left", fill = SOCIAL.ink, fontKey = FONT.sansMedium, letterSpacing = 0, lineHeight = 1.5, upper = false }) {
  const sep = "  ·  ";
  const lines = [];
  let line = [];
  for (const it of items) {
    const test = [...line, it].join(sep);
    if (!line.length || measure(fontKey, upper ? test.toUpperCase() : test, size, letterSpacing) <= maxWidth) line.push(it);
    else {
      lines.push(line.join(sep));
      line = [it];
    }
  }
  if (line.length) lines.push(line.join(sep));
  const parts = [];
  let cy = y;
  for (const ln of lines) {
    const t = text(fontKey, ln, { x, y: cy, size, fill, align, letterSpacing, upper });
    parts.push(t.body);
    cy += size * lineHeight;
  }
  return { body: parts.join("\n"), height: cy - y - size * lineHeight + size * 1.25 };
}

/** Vertical soft gold rule (faded ends) centred on (cx, cy) with the given length. */
function vrule(cx, cy, length, { opacity = 0.9, thickness = 1.5 } = {}) {
  return `<rect x="${f2(cx - length / 2)}" y="${f2(cy - thickness / 2)}" width="${f2(length)}" height="${thickness}" fill="url(#goldRule)" opacity="${opacity}" transform="rotate(90 ${f2(cx)} ${f2(cy)})"/>`;
}

/** Small spaced caps line (footer-style label). */
function smallCaps(str, { x, y, align = "left", size = 20, fill = SOCIAL.gold, letterSpacing = 0.18 }) {
  return text(FONT.sansSemi, str, { x, y, size, fill, align, letterSpacing, upper: true });
}

/** Largest font size (<= max) at which `str` fits within maxWidth. */
function fitSize(fontKey, str, maxWidth, { max = 200, min = 24, letterSpacing = 0 } = {}) {
  let size = max;
  while (size > min && measure(fontKey, str, size, letterSpacing) > maxWidth) size -= 1;
  return size;
}

/** Tagline (traced kit text, Montserrat spaced caps) centred at cx with a given width. */
function taglineAt({ cx, y, width }) {
  const tag = place(lockups.tagline({ fill: "gold" }), { width });
  return { body: place(tag, { x: cx - tag.width / 2, y }).body, width: tag.width, height: tag.height };
}

async function emit(dir, name, svg, format, { transparent = false } = {}) {
  const svgPath = path.join(dir, `${name}.svg`);
  const pngPath = path.join(dir, `${name}.png`);
  writeSVG(svg, svgPath);
  await renderPNG(svg, pngPath, { width: format.w, ...(transparent ? { background: null } : {}) });
  console.log(`wrote ${path.relative(OUT, svgPath)} + .png (${format.w}x${format.h})`);
}

// ---------------------------------------------------------------------------
// TEMPLATE FUNCTIONS - stories (1080 x 1920)
// ---------------------------------------------------------------------------

/** 01 Brand statement: primary lockup, eyebrow, CTA pill, footer. */
function storyBrandStatement() {
  const parts = [bg(STORY, { glow: "both" }), frame(STORY, { inset: 48, opacity: 0.4 })];
  let y = 548;
  const eb = eyebrow("Indore  ·  Pan-India  ·  Since 2012", { x: CX, y, align: "center", size: 24 });
  parts.push(eb.body);
  y += eb.height + 56;
  const logo = heroLogo({ cx: CX, y, width: 760 });
  parts.push(logo.body);
  y += logo.height + 72;
  parts.push(ctaPill("Book your event", { cx: CX, y, size: 26, padX: 52, padY: 24 }).body);
  parts.push(footerBar(STORY, { y: STORY_FOOTER_Y, margin: M, size: 21 }));
  return canvas(STORY, parts, { title: "MIHIR story - brand statement" });
}

/** 02 Photo story. overlay=true -> transparent canvas, cutout photo slot, no bg. */
function storyPhoto({ overlay = false } = {}) {
  const parts = [];
  parts.push(photoSlot({ x: 0, y: 0, w: STORY.w, h: STORY.h, mode: overlay ? "cutout" : "placeholder", radius: 0, fadeBottom: 0.55, fadeTop: 0.18 }));
  if (!overlay) parts.push(particles(STORY, { count: 50, opacity: [0.1, 0.35] }));
  parts.push(cornerLogo({ x: M, y: 272, height: 76 }));
  let y = 1108;
  const eb = eyebrow("Sangeet  ·  Indore", { x: M, y, size: 24 });
  parts.push(eb.body);
  y += eb.height + 22;
  const hl = headline("Sangeet Night", { x: M, y, size: 84, maxWidth: STORY.w - M * 2 });
  parts.push(hl.body);
  y += hl.height + 12;
  const bd = body("Line-array sound, DMX lighting and stage rigging by Mihir Sound & Light.", { x: M, y, size: 28, maxWidth: STORY.w - M * 2, fill: SOCIAL.ink, lineHeight: 1.4 });
  parts.push(bd.body);
  y += bd.height + 34;
  const cta = ctaOutline("Swipe up  ·  Book now", { cx: M + 0, y, size: 22 });
  // anchor the outline pill to the left margin (ctaOutline centres on cx)
  parts.push(`<g transform="translate(${f2(cta.width / 2)} 0)">${cta.body}</g>`);
  parts.push(footerBar(STORY, { y: STORY_FOOTER_Y, margin: M, size: 21 }));
  return canvas(STORY, parts, { transparent: overlay, title: overlay ? "MIHIR story - photo overlay (transparent)" : "MIHIR story - photo" });
}

/** 03 Event tonight: faint monogram backdrop, small sharp monogram, statement, details. */
function storyEventTonight() {
  const parts = [bg(STORY, { glow: "top" }), frame(STORY, { inset: 48, opacity: 0.4 })];
  parts.push(backdropIcon({ cx: CX, cy: 900, artWidth: 1000, opacity: 0.12 }).body);
  let y = 470;
  const ic = iconArt({ cx: CX, y, artHeight: 96 });
  parts.push(ic.body);
  y += ic.height + 48;
  const eb = eyebrow("Tonight", { x: CX, y, align: "center", size: 26 });
  parts.push(eb.body);
  y += eb.height + 24;
  const st = statement("Garba Night", { x: CX, y, size: 150, align: "center", maxWidth: STORY.w - M * 2, lineHeight: 1.05 });
  parts.push(st.body);
  y += st.height + 28;
  parts.push(rule(CX, y, 420));
  y += 56;
  for (const [label, value] of [
    ["Date", "Saturday, 3 October 2026"],
    ["Venue", "Sayaji Lawns, Indore"],
    ["Time", "7:00 PM onwards"],
  ]) {
    const d = detail(label, value, { cx: CX, y });
    parts.push(d.body);
    y += d.height + 34;
  }
  parts.push(footerBar(STORY, { y: STORY_FOOTER_Y, margin: M, size: 21 }));
  return canvas(STORY, parts, { title: "MIHIR story - event tonight" });
}

/** 04 Booking: headline, huge phone, WhatsApp + web, ornament, small primary lockup. */
function storyBooking() {
  const parts = [bg(STORY, { glow: "both" }), frame(STORY, { inset: 48, opacity: 0.4 })];
  let y = 440;
  const eb = eyebrow("Now booking", { x: CX, y, align: "center", size: 26 });
  parts.push(eb.body);
  y += eb.height + 26;
  const hl = headline("Wedding season 2026-27", { x: CX, y, size: 82, align: "center", maxWidth: STORY.w - M * 2 });
  parts.push(hl.body);
  y += hl.height + 60;
  const phoneSize = fitSize(FONT.sansBold, BUSINESS.phone, STORY.w - M * 2, { max: 110 });
  const ph = text(FONT.sansBold, BUSINESS.phone, { x: CX, y, size: phoneSize, fill: GOLD, align: "center" });
  parts.push(ph.body);
  y += ph.height + 34;
  const wa = text(FONT.sansMedium, `WhatsApp  ·  ${BUSINESS.whatsapp}`, { x: CX, y, size: 30, fill: SOCIAL.ink, align: "center" });
  parts.push(wa.body);
  y += wa.height + 10;
  const web = text(FONT.sansMedium, BUSINESS.web, { x: CX, y, size: 30, fill: SOCIAL.muted, align: "center" });
  parts.push(web.body);
  y += web.height + 56;
  parts.push(ornament(CX, y, { width: 260 }));
  const logo = heroLogo({ cx: CX, y: 0, width: 360 });
  const logoY = SAFE.bottom - 24 - logo.height;
  parts.push(heroLogo({ cx: CX, y: logoY, width: 360 }).body);
  return canvas(STORY, parts, { title: "MIHIR story - booking" });
}

/** 05 Testimonial: big quote glyph, italic quote, stars, attribution, wordmark, footer (handle only). */
function storyTestimonial() {
  const parts = [bg(STORY, { glow: "top" }), frame(STORY, { inset: 48, opacity: 0.4 })];
  const q = textPath(FONT.serifBold, "“", { size: 260 });
  const qy = 520;
  parts.push(`<path fill="${GOLD}" transform="translate(${f2(M - q.bbox.x1)} ${f2(qy - q.bbox.y1)})" d="${q.d}"/>`);
  let y = qy + (q.bbox.y2 - q.bbox.y1) + 40;
  const quote = statement("The sound was crystal clear across 1,200 guests and the lighting made our sangeet look like a concert.", {
    x: M,
    y,
    size: 56,
    italic: true,
    maxWidth: STORY.w - M * 2,
    lineHeight: 1.2,
  });
  parts.push(quote.body);
  y += quote.height + 40;
  const starR = 17;
  const starGap = 16;
  const starsW = 5 * starR * 2 + 4 * starGap;
  const st = stars(M + starsW / 2, y, { r: starR, gap: starGap }); // stars() centres on cx -> row starts at the margin
  parts.push(st.body);
  y += st.height + 30;
  parts.push(body("—  Priya & Rohan, Wedding, Indore", { x: M, y, size: 28, fill: SOCIAL.muted, weight: "medium" }).body);
  const wm = wordmarkAt({ cx: CX, y: 0, width: 300 });
  const wmY = STORY_FOOTER_Y - 22 - 40 - wm.height;
  parts.push(wordmarkAt({ cx: CX, y: wmY, width: 300 }).body);
  parts.push(footerBar(STORY, { y: STORY_FOOTER_Y, margin: M, size: 21, showPhone: false }));
  return canvas(STORY, parts, { title: "MIHIR story - testimonial" });
}

/** 06 Countdown: monogram, eyebrow, giant number, DAYS TO GO, event name, footer. */
function storyCountdown() {
  const parts = [bg(STORY, { glow: "both" }), frame(STORY, { inset: 48, opacity: 0.4 })];
  let y = 400;
  const ic = iconArt({ cx: CX, y, artHeight: 110 });
  parts.push(ic.body);
  y += ic.height + 56;
  const eb = eyebrow("Countdown", { x: CX, y, align: "center", size: 26 });
  parts.push(eb.body);
  y += eb.height + 24;
  const num = textPath(FONT.displayBold, "3", { size: 520 });
  const numW = num.bbox.x2 - num.bbox.x1;
  const numH = num.bbox.y2 - num.bbox.y1;
  parts.push(`<path fill="${GOLD}" transform="translate(${f2(CX - numW / 2 - num.bbox.x1)} ${f2(y - num.bbox.y1)})" d="${num.d}"/>`);
  y += numH + 40;
  const dtg = text(FONT.display, "DAYS TO GO", { x: CX, y, size: 44, fill: SOCIAL.ink, align: "center", letterSpacing: 0.32 });
  parts.push(dtg.body);
  y += dtg.height + 36;
  parts.push(rule(CX, y, 360));
  y += 44;
  const ev = statement("Garba Night 2026", { x: CX, y, size: 64, align: "center", maxWidth: STORY.w - M * 2 });
  parts.push(ev.body);
  parts.push(footerBar(STORY, { y: STORY_FOOTER_Y, margin: M, size: 21 }));
  return canvas(STORY, parts, { title: "MIHIR story - countdown" });
}

// ---------------------------------------------------------------------------
// TEMPLATE FUNCTIONS - covers
// ---------------------------------------------------------------------------

/** 07 Facebook cover 1640x924. Essentials inside the centred 1200x600 (mobile crop). */
function facebookCover() {
  const F = FORMATS.fbCover;
  const zone = { x: (F.w - 1200) / 2, y: (F.h - 600) / 2, w: 1200, h: 600 };
  const parts = [bg(F, { glow: "both", seed: 11 }), frame(F, { inset: 40, opacity: 0.45 })];
  // Lockup on the left of the zone, vertically centred on the zone.
  const lk = place(lockups.horizontal({ fill: "gold" }), { width: 700 });
  const lkY = zone.y + (zone.h - lk.height) / 2;
  parts.push(place(lk, { x: zone.x, y: lkY }).body);
  // Divider + right column
  const divX = zone.x + lk.width + 44;
  parts.push(vrule(divX, zone.y + zone.h / 2, zone.h - 300));
  const colX = divX + 48;
  const colW = zone.x + zone.w - colX;
  const lines = [];
  let y = 0;
  const l1 = dotLines(["Line-array sound", "DMX lighting", "Stage rigging"], { x: 0, y: 0, size: 24, maxWidth: colW, fill: SOCIAL.ink, fontKey: FONT.sansMedium, lineHeight: 1.45 });
  lines.push({ b: l1, gap: 18 });
  const l2 = dotLines(["Weddings", "Concerts", "Corporate"], { x: 0, y: 0, size: 22, maxWidth: colW, fill: SOCIAL.muted, fontKey: FONT.sans, lineHeight: 1.45 });
  lines.push({ b: l2, gap: 34 });
  const l3 = text(FONT.sansBold, BUSINESS.phone, { x: 0, y: 0, size: 34, fill: GOLD });
  lines.push({ b: l3, gap: 0 });
  const totalH = lines.reduce((s, l) => s + l.b.height + l.gap, 0);
  y = zone.y + (zone.h - totalH) / 2;
  for (const l of lines) {
    parts.push(`<g transform="translate(${f2(colX)} ${f2(y)})">${l.b.body}</g>`);
    y += l.b.height + l.gap;
  }
  return canvas(F, parts, { title: "MIHIR Facebook cover" });
}

/** 08 LinkedIn cover 1584x396. Essentials inside the centred 1128x191 zone. */
function linkedinCover() {
  const F = FORMATS.linkedinCover;
  const zone = { x: (F.w - 1128) / 2, y: (F.h - 191) / 2, w: 1128, h: 191 };
  const parts = [bg(F, { glow: "top", grid: false, dust: true, seed: 5 })];
  const lk = place(lockups.horizontal({ fill: "gold", withTagline: false }), { width: 460 });
  const lkY = zone.y + (zone.h - lk.height) / 2;
  parts.push(place(lk, { x: zone.x, y: lkY }).body);
  const phone = smallCaps(BUSINESS.phone, { x: zone.x + zone.w, y: 0, align: "right", size: 20, letterSpacing: 0.14 });
  const phoneW = phone.width;
  const gap = 56;
  const tagLeft = zone.x + lk.width + gap;
  const tagRight = zone.x + zone.w - phoneW - gap;
  const tagW = Math.min(420, tagRight - tagLeft);
  const tag = taglineAt({ cx: (tagLeft + tagRight) / 2, y: 0, width: tagW });
  const midY = zone.y + zone.h / 2;
  parts.push(taglineAt({ cx: (tagLeft + tagRight) / 2, y: midY - tag.height / 2, width: tagW }).body);
  parts.push(smallCaps(BUSINESS.phone, { x: zone.x + zone.w, y: midY - 20 * 0.62, align: "right", size: 20, letterSpacing: 0.14 }).body);
  return canvas(F, parts, { title: "MIHIR LinkedIn cover" });
}

/** 09 YouTube banner 2560x1440. Essentials inside the centred 1546x423 safe area. */
function youtubeBanner() {
  const F = FORMATS.youtubeBanner;
  const zone = { x: (F.w - 1546) / 2, y: (F.h - 423) / 2, w: 1546, h: 423 };
  const parts = [bg(F, { glow: "both", seed: 21, dust: false }), particles(F, { count: 160, seed: 21 })];
  parts.push(backdropIcon({ cx: F.w / 2, cy: F.h / 2, artWidth: 1900, opacity: 0.06 }).body);
  const lk = place(lockups.horizontal({ fill: "gold" }), { width: 1000 });
  const lkY = zone.y + 10 + (zone.h - 80 - lk.height) / 2;
  parts.push(place(lk, { x: F.w / 2 - lk.width / 2, y: lkY }).body);
  const labelY = zone.y + zone.h - 22 - 46;
  parts.push(rule(F.w / 2, labelY - 26, zone.w - 120, { opacity: 0.5 }));
  parts.push(smallCaps(BUSINESS.handle, { x: zone.x + 60, y: labelY, size: 22, fill: SOCIAL.muted, letterSpacing: 0.12 }).body);
  parts.push(smallCaps(BUSINESS.phone, { x: zone.x + zone.w - 60, y: labelY, align: "right", size: 22, letterSpacing: 0.14 }).body);
  return canvas(F, parts, { title: "MIHIR YouTube banner" });
}

/** 10 Link post 1200x630 (same idea as the site's OpenGraph card). */
function linkPost() {
  const F = FORMATS.landscape;
  const parts = [bg(F, { glow: "top", grid: false, seed: 3 }), frame(F, { inset: 28, opacity: 0.35 })];
  const logo = heroLogo({ cx: F.w / 2, y: 0, width: 560 });
  const logoY = (F.h - 84 - logo.height) / 2;
  parts.push(heroLogo({ cx: F.w / 2, y: logoY, width: 560 }).body);
  parts.push(rule(F.w / 2, F.h - 100, F.w - 144, { opacity: 0.7 }));
  parts.push(smallCaps("Indore  ·  Pan-India  ·  Since 2012", { x: 72, y: F.h - 76, size: 19 }).body);
  parts.push(smallCaps(BUSINESS.phone, { x: F.w - 72, y: F.h - 76, align: "right", size: 19, fill: SOCIAL.ink, letterSpacing: 0.12 }).body);
  return canvas(F, parts, { title: "MIHIR link post card" });
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
await emit(STORY_DIR, "01-brand-statement-story", storyBrandStatement(), STORY);
await emit(STORY_DIR, "02-photo-story", storyPhoto(), STORY);
await emit(STORY_DIR, "02-photo-story-overlay", storyPhoto({ overlay: true }), STORY, { transparent: true });
await emit(STORY_DIR, "03-event-tonight-story", storyEventTonight(), STORY);
await emit(STORY_DIR, "04-booking-story", storyBooking(), STORY);
await emit(STORY_DIR, "05-testimonial-story", storyTestimonial(), STORY);
await emit(STORY_DIR, "06-countdown-story", storyCountdown(), STORY);

await emit(COVER_DIR, "facebook-cover-1640x924", facebookCover(), FORMATS.fbCover);
await emit(COVER_DIR, "linkedin-cover-1584x396", linkedinCover(), FORMATS.linkedinCover);
await emit(COVER_DIR, "youtube-banner-2560x1440", youtubeBanner(), FORMATS.youtubeBanner);
await emit(COVER_DIR, "link-post-1200x630", linkPost(), FORMATS.landscape);
