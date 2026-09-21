// Shared layer for social-media templates. Everything here composes from core.mjs so
// the marks, gold and type are identical to the rest of the kit.
//
//   import { FORMATS, canvas, bg, footerBar, headline, body, ctaPill, rule, photoSlot, ... } from "./social-core.mjs";
//
// All helpers return SVG fragments (strings) positioned in absolute canvas coordinates,
// or { body, width, height } blocks where noted. Text is converted to paths (no font deps).

import { COLORS, TAGLINE, lockups, place, textPath, paintFor } from "./core.mjs";

export const BUSINESS = {
  name: "Mihir Sound & Light",
  handle: "@mihir_sound_and_light_indore",
  phone: "+91 70000 51042",
  whatsapp: "wa.me/917000051042",
  web: "mihir-music.vercel.app",
  email: "mihirsoundandlight@gmail.com",
  city: "Indore, Madhya Pradesh",
  since: 2012,
  services: ["Arena Audio", "DMX Lighting", "Stage Rigging", "DJ Setup", "Show Execution"],
  servicesLong: [
    "Line-array sound systems",
    "Intelligent DMX stage lighting",
    "Certified truss & stage rigging",
    "DJ setups & party sound",
    "Show calling & live production crew",
  ],
  areas: ["Indore", "Bhopal", "Ujjain", "Dewas", "Pan-India"],
};

/** Canvas sizes in px. Render PNGs at exactly these sizes. */
export const FORMATS = {
  square: { w: 1080, h: 1080, label: "Instagram / Facebook post (1:1)" },
  portrait: { w: 1080, h: 1350, label: "Instagram feed portrait (4:5)" },
  story: { w: 1080, h: 1920, label: "Instagram / WhatsApp story & reel cover (9:16)" },
  landscape: { w: 1200, h: 630, label: "Facebook / LinkedIn link post (1.91:1)" },
  fbCover: { w: 1640, h: 924, label: "Facebook page cover" },
  linkedinCover: { w: 1584, h: 396, label: "LinkedIn page cover" },
  youtubeBanner: { w: 2560, h: 1440, label: "YouTube channel banner (safe area 1546x423 centred)" },
};

export const SOCIAL = {
  black: "#050505",
  ink: "#F5F5F5",
  muted: "#A9A38F", // warm grey for secondary copy
  gold: COLORS.gold,
  goldLight: COLORS.goldLight,
  goldDeep: COLORS.goldDeep,
  line: "rgba(212,175,55,0.35)",
};

const f2 = (n) => Number(n).toFixed(2);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------------------------------------------------------------------------
// Canvas + backgrounds
// ---------------------------------------------------------------------------
/**
 * Wrap fragments into a full SVG document of the given format.
 * `transparent: true` skips the base fill (for overlay templates).
 */
export function canvas(format, parts, { transparent = false, title = "MIHIR social template" } = {}) {
  const { w, h } = format;
  const gold = paintFor("gold"); // same id as core lockups (mihirGold)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<title>${esc(title)}</title>
<defs>
${gold.defs}
<radialGradient id="glowTop" cx="0.5" cy="0.18" r="0.75"><stop offset="0" stop-color="#D4AF37" stop-opacity="0.22"/><stop offset="0.55" stop-color="#D4AF37" stop-opacity="0.04"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<radialGradient id="glowBottom" cx="0.5" cy="1.05" r="0.8"><stop offset="0" stop-color="#8E6A14" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505" stop-opacity="0"/><stop offset="1" stop-color="#050505" stop-opacity="0.96"/></linearGradient>
<linearGradient id="fadeUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050505" stop-opacity="0.96"/><stop offset="1" stop-color="#050505" stop-opacity="0"/></linearGradient>
<linearGradient id="goldRule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D4AF37" stop-opacity="0"/><stop offset="0.5" stop-color="#F6E27A"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/></linearGradient>
<pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#D4AF37" stroke-opacity="0.07" stroke-width="1"/></pattern>
</defs>
${transparent ? "" : `<rect width="${w}" height="${h}" fill="${SOCIAL.black}"/>`}
${parts.filter(Boolean).join("\n")}
</svg>`;
}

/** The gold paint id used inside canvas(). */
export const GOLD = "url(#mihirGold)";

/** Standard dark backdrop: top glow, bottom warmth, faint grid, dust particles. */
export function bg(format, { glow = "top", grid = true, dust = true, seed = 7 } = {}) {
  const { w, h } = format;
  const parts = [];
  if (grid) parts.push(`<rect width="${w}" height="${h}" fill="url(#grid)"/>`);
  if (glow === "top" || glow === "both") parts.push(`<rect width="${w}" height="${h}" fill="url(#glowTop)"/>`);
  if (glow === "bottom" || glow === "both") parts.push(`<rect width="${w}" height="${h}" fill="url(#glowBottom)"/>`);
  if (dust) parts.push(particles(format, { seed }));
  return parts.join("\n");
}

/** Deterministic gold dust. */
export function particles(format, { count = 90, seed = 7, opacity = [0.12, 0.55] } = {}) {
  const { w, h } = format;
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 0.8 + rnd() * 2.2;
    const o = opacity[0] + rnd() * (opacity[1] - opacity[0]);
    out.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#F6E27A" opacity="${f2(o)}"/>`);
  }
  return `<g>${out.join("")}</g>`;
}

/** Thin frame inset from the edges (classic premium border). */
export function frame(format, { inset = 40, opacity = 0.5, width = 1.5 } = {}) {
  const { w, h } = format;
  return `<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="none" stroke="#D4AF37" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
const FONT = {
  display: "cinzel", // elegant caps headlines
  displayBold: "cinzelBold",
  serif: "playfair", // editorial statements
  serifBold: "playfairBold",
  serifItalic: "playfairBoldItalic",
  sans: "montserrat",
  sansMedium: "montserratMedium",
  sansSemi: "montserratSemi",
  sansBold: "montserratBold",
};
export { FONT };

/** Measure advance width of a string. */
export function measure(fontKey, text, size, letterSpacing = 0) {
  return textPath(fontKey, text, { size, letterSpacing }).advance;
}

/** Greedy word wrap to maxWidth. Returns array of lines. */
export function wrap(fontKey, text, size, maxWidth, letterSpacing = 0) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const wd of words) {
    const test = line ? `${line} ${wd}` : wd;
    if (measure(fontKey, test, size, letterSpacing) <= maxWidth || !line) line = test;
    else {
      lines.push(line);
      line = wd;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Multi-line text block. align: "left" | "center" | "right". Returns { body, width, height, lines }.
 * x is the anchor (left edge / centre / right edge depending on align); y is the top of the block.
 */
export function text(fontKey, str, { x, y, size, fill = SOCIAL.ink, letterSpacing = 0, align = "left", maxWidth = Infinity, lineHeight = 1.15, upper = false } = {}) {
  const content = upper ? String(str).toUpperCase() : String(str);
  const lines = Number.isFinite(maxWidth) ? wrap(fontKey, content, size, maxWidth, letterSpacing) : [content];
  const paths = [];
  let widest = 0;
  lines.forEach((ln, i) => {
    const t = textPath(fontKey, ln, { size, letterSpacing });
    const wdt = t.advance;
    widest = Math.max(widest, wdt);
    const baseline = y + size + i * size * lineHeight;
    const dx = align === "center" ? x - wdt / 2 : align === "right" ? x - wdt : x;
    paths.push(`<path fill="${fill}" transform="translate(${f2(dx)} ${f2(baseline)})" d="${t.d}"/>`);
  });
  const height = lines.length ? size + (lines.length - 1) * size * lineHeight + size * 0.25 : 0;
  return { body: paths.join("\n"), width: widest, height, lines: lines.length };
}

/** Eyebrow label: small spaced caps in gold. */
export function eyebrow(str, { x, y, align = "left", size = 22, fill = SOCIAL.gold } = {}) {
  return text(FONT.sansSemi, str, { x, y, size, fill, letterSpacing: 0.28, align, upper: true });
}

/** Elegant Cinzel headline in spaced caps (use for short statements). */
export function headline(str, { x, y, size = 72, align = "left", maxWidth = Infinity, fill = SOCIAL.ink, letterSpacing = 0.06, lineHeight = 1.18 } = {}) {
  return text(FONT.display, str, { x, y, size, fill, letterSpacing, align, maxWidth, lineHeight, upper: true });
}

/** Editorial Playfair statement (mixed case). */
export function statement(str, { x, y, size = 64, align = "left", maxWidth = Infinity, fill = SOCIAL.ink, italic = false, lineHeight = 1.12 } = {}) {
  return text(italic ? FONT.serifItalic : FONT.serifBold, str, { x, y, size, fill, align, maxWidth, lineHeight });
}

/** Body copy in Montserrat. */
export function body(str, { x, y, size = 26, align = "left", maxWidth = Infinity, fill = SOCIAL.muted, lineHeight = 1.45, weight = "regular" } = {}) {
  const key = weight === "medium" ? FONT.sansMedium : weight === "semi" ? FONT.sansSemi : FONT.sans;
  return text(key, str, { x, y, size, fill, align, maxWidth, lineHeight });
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------
/** Soft gold rule with faded ends, centred at cx. */
export function rule(cx, y, width, { opacity = 0.9, thickness = 1.5 } = {}) {
  return `<rect x="${f2(cx - width / 2)}" y="${f2(y)}" width="${f2(width)}" height="${thickness}" fill="url(#goldRule)" opacity="${opacity}"/>`;
}

/** Rule - dot - rule ornament centred at cx. */
export function ornament(cx, y, { width = 220 } = {}) {
  const half = width / 2;
  return `<g fill="#D4AF37"><rect x="${f2(cx - half)}" y="${f2(y)}" width="${f2(half - 22)}" height="1.5"/><circle cx="${f2(cx)}" cy="${f2(y + 0.75)}" r="4"/><rect x="${f2(cx + 22)}" y="${f2(y)}" width="${f2(half - 22)}" height="1.5"/></g>`;
}

/** Bullet list with small gold diamonds. Returns { body, height }. */
export function list(items, { x, y, size = 28, gap = 1.9, fill = SOCIAL.ink, maxWidth = Infinity } = {}) {
  const parts = [];
  let cy = y;
  for (const it of items) {
    parts.push(`<rect x="${f2(x)}" y="${f2(cy + size * 0.42)}" width="10" height="10" transform="rotate(45 ${f2(x + 5)} ${f2(cy + size * 0.42 + 5)})" fill="#D4AF37"/>`);
    const t = body(it, { x: x + 34, y: cy, size, fill, maxWidth: maxWidth - 34, weight: "medium" });
    parts.push(t.body);
    cy += Math.max(t.height, size) + size * (gap - 1);
  }
  return { body: parts.join("\n"), height: cy - y };
}

/** Pill CTA: gold fill, black text. Anchored by centre x, top y. */
export function ctaPill(label, { cx, y, size = 24, padX = 44, padY = 20, fill = GOLD, textFill = "#000" } = {}) {
  const t = textPath(FONT.sansBold, String(label).toUpperCase(), { size, letterSpacing: 0.14 });
  const w = t.advance + padX * 2;
  const h = size + padY * 2;
  const x = cx - w / 2;
  return {
    body: `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${f2(h / 2)}" fill="${fill}"/>
<path fill="${textFill}" transform="translate(${f2(x + padX)} ${f2(y + padY + size * 0.86)})" d="${t.d}"/>`,
    width: w,
    height: h,
  };
}

/** Outline pill (secondary CTA). */
export function ctaOutline(label, { cx, y, size = 22, padX = 40, padY = 18 } = {}) {
  const t = textPath(FONT.sansSemi, String(label).toUpperCase(), { size, letterSpacing: 0.14 });
  const w = t.advance + padX * 2;
  const h = size + padY * 2;
  const x = cx - w / 2;
  return {
    body: `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${f2(h / 2)}" fill="none" stroke="#D4AF37" stroke-width="1.5"/>
<path fill="#D4AF37" transform="translate(${f2(x + padX)} ${f2(y + padY + size * 0.86)})" d="${t.d}"/>`,
    width: w,
    height: h,
  };
}

/**
 * Footer bar: monogram left, handle centre, phone right, hairline above.
 * Sits at the bottom of the canvas. Returns SVG string.
 */
export function footerBar(format, { y = null, margin = 64, size = 20, showHandle = true, showPhone = true, showWeb = false } = {}) {
  const { w, h } = format;
  const barH = 96;
  const top = y ?? h - barH - margin * 0.6;
  const mono = place(lockups.icon({ fill: "gold" }), { height: barH * 0.95 });
  const parts = [];
  parts.push(rule(w / 2, top - 22, w - margin * 2, { opacity: 0.6 }));
  parts.push(place(mono, { x: margin - mono.width * 0.08, y: top - barH * 0.06 }).body);
  const midY = top + barH / 2 - size * 0.6;
  if (showHandle) parts.push(text(FONT.sansMedium, BUSINESS.handle, { x: w / 2, y: midY, size, fill: SOCIAL.muted, align: "center", letterSpacing: 0.04 }).body);
  const right = showWeb ? BUSINESS.web : showPhone ? BUSINESS.phone : "";
  if (right) parts.push(text(FONT.sansSemi, right, { x: w - margin, y: midY, size, fill: SOCIAL.gold, align: "right", letterSpacing: 0.06 }).body);
  return parts.join("\n");
}

/** Compact brand lockup for corners: horizontal logo without tagline, scaled to a height. */
export function cornerLogo({ x, y, height = 70, align = "left", withTagline = false }) {
  const lk = place(lockups.horizontal({ fill: "gold", withTagline, divider: true }), { height });
  const dx = align === "right" ? x - lk.width : align === "center" ? x - lk.width / 2 : x;
  return place(lk, { x: dx, y }).body;
}

/** Primary stacked lockup centred at cx, top y, given width. */
export function heroLogo({ cx, y, width = 640, withTagline = true }) {
  const lk = place(lockups.primary({ fill: "gold", withTagline }), { width });
  return { body: place(lk, { x: cx - lk.width / 2, y }).body, width: lk.width, height: lk.height };
}

/** Wordmark only, centred at cx. */
export function wordmarkAt({ cx, y, width = 520 }) {
  const lk = place(lockups.wordmark({ fill: "gold" }), { width });
  return { body: place(lk, { x: cx - lk.width / 2, y }).body, width: lk.width, height: lk.height };
}

/**
 * Photo slot. In "placeholder" mode draws a charcoal panel with a subtle label so the
 * template shows where the event photo goes. In "cutout" mode (for overlay PNGs) it
 * draws nothing, leaving the area transparent, and returns the gradient fades that
 * should sit on top of the photo so text stays readable.
 */
export function photoSlot({ x, y, w, h, mode = "placeholder", radius = 24, label = "YOUR EVENT PHOTO", fadeBottom = 0.45, fadeTop = 0 }) {
  const parts = [];
  if (mode === "placeholder") {
    parts.push(`<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${radius}" fill="#141414"/>`);
    parts.push(`<rect x="${f2(x + 1)}" y="${f2(y + 1)}" width="${f2(w - 2)}" height="${f2(h - 2)}" rx="${radius}" fill="none" stroke="#D4AF37" stroke-opacity="0.35" stroke-dasharray="10 12"/>`);
    // camera glyph + label
    const cx = x + w / 2;
    const cy = y + h / 2;
    parts.push(`<g fill="none" stroke="#D4AF37" stroke-opacity="0.6" stroke-width="3" transform="translate(${f2(cx - 36)} ${f2(cy - 40)})"><rect x="0" y="14" width="72" height="50" rx="8"/><path d="M22 14l8-12h12l8 12"/><circle cx="36" cy="39" r="14"/></g>`);
    parts.push(text(FONT.sansSemi, label, { x: cx, y: cy + 36, size: 18, fill: SOCIAL.muted, align: "center", letterSpacing: 0.26 }).body);
  }
  if (fadeBottom > 0) parts.push(`<rect x="${f2(x)}" y="${f2(y + h * (1 - fadeBottom))}" width="${f2(w)}" height="${f2(h * fadeBottom)}" fill="url(#fadeDown)"/>`);
  if (fadeTop > 0) parts.push(`<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h * fadeTop)}" fill="url(#fadeUp)"/>`);
  return parts.join("\n");
}

/** Service chips row (small outlined pills), centred at cx. Returns { body, height }. */
export function chips(items, { cx, y, size = 18, gap = 14, padX = 22, padY = 12, maxWidth = 900 }) {
  const measured = items.map((it) => ({ it, w: measure(FONT.sansSemi, it.toUpperCase(), size, 0.12) + padX * 2 }));
  const h = size + padY * 2;
  const rows = [];
  let row = [];
  let rowW = 0;
  for (const m of measured) {
    if (row.length && rowW + gap + m.w > maxWidth) {
      rows.push({ row, rowW });
      row = [];
      rowW = 0;
    }
    rowW += (row.length ? gap : 0) + m.w;
    row.push(m);
  }
  if (row.length) rows.push({ row, rowW });
  const parts = [];
  rows.forEach(({ row, rowW }, ri) => {
    let x = cx - rowW / 2;
    const ry = y + ri * (h + gap);
    for (const m of row) {
      const t = textPath(FONT.sansSemi, m.it.toUpperCase(), { size, letterSpacing: 0.12 });
      parts.push(`<rect x="${f2(x)}" y="${f2(ry)}" width="${f2(m.w)}" height="${f2(h)}" rx="${f2(h / 2)}" fill="rgba(212,175,55,0.08)" stroke="#D4AF37" stroke-opacity="0.55"/>`);
      parts.push(`<path fill="#F6E27A" transform="translate(${f2(x + padX)} ${f2(ry + padY + size * 0.86)})" d="${t.d}"/>`);
      x += m.w + gap;
    }
  });
  return { body: parts.join("\n"), height: rows.length * h + (rows.length - 1) * gap };
}

export { TAGLINE };
