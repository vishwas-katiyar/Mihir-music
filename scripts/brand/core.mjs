// Shared design core for the MIHIR brand kit.
// Every asset in assets/brand is composed from the pieces exported here so the
// monogram, wordmark, tagline and gold treatment are pixel-identical everywhere.
//
// Usage from a build script:
//   import { lockups, svgDocument, renderPNG, COLORS } from "./core.mjs";
//   const { body, width, height } = lockups.primary({ fill: "gold" });
//   const svg = svgDocument({ body, width, height, background: COLORS.black, fill: "gold" });
//   await renderPNG(svg, "assets/brand/01-primary-logo/primary-logo-gold-on-black.png", { width: 4000 });

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";
import sharp from "sharp";

const here = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Brand tokens
// ---------------------------------------------------------------------------
export const COLORS = {
  gold: "#D4AF37",
  goldLight: "#F6E27A",
  goldDeep: "#8E6A14",
  black: "#000000",
  charcoal: "#1A1A1A",
  white: "#F5F5F5",
  navy: "#0B1A3A",
  grey: "#3A3A3A",
};

export const TAGLINE = "SOUND & LIGHT | EVENT | PRODUCTION";
export const BRAND = "MIHIR";

// ---------------------------------------------------------------------------
// Fonts (static instances from Google Fonts, OFL licensed)
// ---------------------------------------------------------------------------
const fontFiles = {
  cinzel: "Cinzel-400.ttf",
  cinzelBold: "Cinzel-700.ttf",
  cinzelBlack: "Cinzel-900.ttf",
  cinzelDeco: "CinzelDecorative-400.ttf",
  cinzelDecoBold: "CinzelDecorative-700.ttf",
  cinzelDecoBlack: "CinzelDecorative-900.ttf",
  playfair: "Playfair-400.ttf",
  playfairBold: "Playfair-700.ttf",
  playfairBlack: "Playfair-900.ttf",
  playfairBoldItalic: "Playfair-700i.ttf",
  playfairBlackItalic: "Playfair-900i.ttf",
  montserratSemi: "Montserrat-600.ttf",
  montserratBold: "Montserrat-700.ttf",
};
const fontCache = {};
export function font(key) {
  if (!fontCache[key]) {
    fontCache[key] = opentype.loadSync(path.join(here, "fonts", fontFiles[key]));
  }
  return fontCache[key];
}

/**
 * Convert text to an SVG path. Returns { d, bbox:{x1,y1,x2,y2}, advance }.
 * letterSpacing is in em units (0.1 = 10% of the font size).
 */
export function textPath(fontKey, text, { size = 100, x = 0, y = 0, letterSpacing = 0 } = {}) {
  const f = font(fontKey);
  const p = f.getPath(text, x, y, size, { kerning: true, letterSpacing });
  const bb = p.getBoundingBox();
  const advance = f.getAdvanceWidth(text, size, { kerning: true, letterSpacing });
  return { d: p.toPathData(3), bbox: bb, advance };
}

// ---------------------------------------------------------------------------
// Calligraphic ribbon: a tapered, variable-width stroke built from cubic beziers
// ---------------------------------------------------------------------------
function cubic(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
  ];
}
function cubicTangent(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return [
    3 * mt * mt * (p1[0] - p0[0]) + 6 * mt * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * mt * mt * (p1[1] - p0[1]) + 6 * mt * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ];
}

/**
 * segments: array of [p0, c1, c2, p3] cubic beziers (consecutive, sharing endpoints).
 * widthFn(u) -> half-width at global parameter u in [0,1].
 * Returns a closed SVG path "d" string.
 */
export function ribbon(segments, widthFn, samplesPerSeg = 48) {
  const left = [];
  const right = [];
  const n = segments.length;
  segments.forEach((seg, si) => {
    for (let i = 0; i <= samplesPerSeg; i++) {
      if (si > 0 && i === 0) continue;
      const t = i / samplesPerSeg;
      const u = (si + t) / n;
      const [x, y] = cubic(...seg, t);
      let [tx, ty] = cubicTangent(...seg, t);
      const len = Math.hypot(tx, ty) || 1;
      tx /= len;
      ty /= len;
      const nx = -ty;
      const ny = tx;
      const w = widthFn(u);
      left.push([x + nx * w, y + ny * w]);
      right.push([x - nx * w, y - ny * w]);
    }
  });
  const fmt = (p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
  let d = `M${fmt(left[0])}`;
  for (let i = 1; i < left.length; i++) d += `L${fmt(left[i])}`;
  for (let i = right.length - 1; i >= 0; i--) d += `L${fmt(right[i])}`;
  return d + "Z";
}

/** Calligraphic taper: thin at both ends, full in the middle, optional bias. */
export function taper(maxHalfWidth, { minHalfWidth = 0.6, power = 0.55 } = {}) {
  return (u) => minHalfWidth + (maxHalfWidth - minHalfWidth) * Math.pow(Math.sin(Math.PI * u), power);
}

// ---------------------------------------------------------------------------
// Fill handling
// ---------------------------------------------------------------------------
/**
 * fill can be: "gold" (metallic gradient), or any CSS colour string.
 * Returns { defs, paint } where paint is the value for fill="...".
 */
export function paintFor(fill, id = "mihirGold") {
  if (fill === "gold") {
    return {
      defs: `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#F9E9A0"/>
  <stop offset="0.22" stop-color="#E4C160"/>
  <stop offset="0.48" stop-color="#F3D77B"/>
  <stop offset="0.7" stop-color="#C9A23A"/>
  <stop offset="1" stop-color="#8E6A14"/>
</linearGradient>`,
      paint: `url(#${id})`,
    };
  }
  return { defs: "", paint: fill };
}

// ---------------------------------------------------------------------------
// Traced artwork (preferred). scripts/brand/trace.mjs writes traced/<name>.json
// from the client's real logo files; when present these replace the font-built
// fallbacks below so every variation carries the exact reference design.
// ---------------------------------------------------------------------------
const tracedCache = {};
export function traced(name) {
  if (name in tracedCache) return tracedCache[name];
  const file = path.join(here, "traced", `${name}.json`);
  tracedCache[name] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : null;
  return tracedCache[name];
}
/** Fit a traced path into a box of the given width (height follows), origin 0,0. */
function tracedMark(t, { paint, width, height, padFrac = 0 }) {
  const bw = t.bbox.x2 - t.bbox.x1;
  const bh = t.bbox.y2 - t.bbox.y1;
  const s = width ? width / (bw * (1 + padFrac * 2)) : height / (bh * (1 + padFrac * 2));
  const W = bw * s * (1 + padFrac * 2);
  const H = bh * s * (1 + padFrac * 2);
  const ox = (W - bw * s) / 2 - t.bbox.x1 * s;
  const oy = (H - bh * s) / 2 - t.bbox.y1 * s;
  const body = `<path fill="${paint}" fill-rule="evenodd" transform="translate(${ox.toFixed(3)} ${oy.toFixed(3)}) scale(${s.toFixed(6)})" d="${t.d}"/>`;
  return { body, width: W, height: H };
}

// ---------------------------------------------------------------------------
// Core marks. Each returns { body, width, height } in its own local coordinate
// space (origin top-left) so they can be translated into lockups.
// ---------------------------------------------------------------------------

/** The "M" monogram with calligraphic swash. Local box 1000 x 1000. */
export function monogram({ paint }) {
  const size = 1000;
  const tr = traced("monogram");
  if (tr) {
    const bw = tr.bbox.x2 - tr.bbox.x1;
    const bh = tr.bbox.y2 - tr.bbox.y1;
    // Fit inside a 1000 box with ~4% breathing room, centred.
    const m = tracedMark(tr, { paint, ...(bw >= bh ? { width: size * 0.92 } : { height: size * 0.92 }) });
    const cx = (size - m.width) / 2;
    const cy = (size - m.height) / 2;
    const body = `<g transform="translate(${cx.toFixed(2)} ${cy.toFixed(2)})">${m.body}</g>`;
    // content = where the artwork actually sits inside the square box
    return { body, width: size, height: size, content: { x: cx, y: cy, w: m.width, h: m.height } };
  }
  // Ornate M, centred. Cinzel Decorative Black cap height ~ 0.7em.
  const m = textPath("cinzelDecoBlack", "M", { size: 780 });
  const mw = m.bbox.x2 - m.bbox.x1;
  const mh = m.bbox.y2 - m.bbox.y1;
  const mx = (size - mw) / 2 - m.bbox.x1;
  const my = (size - mh) / 2 - m.bbox.y1 + 10;

  // Swash centreline: rises from the lower-left, sweeps through the M's waist
  // and finishes in a small curl at the top-right.
  const swash = ribbon(
    [
      [[55, 705], [150, 640], [260, 608], [400, 588]],
      [[400, 588], [560, 562], [680, 528], [770, 468]],
      [[770, 468], [880, 396], [932, 318], [872, 282]],
      [[872, 282], [830, 258], [788, 290], [814, 322]],
    ],
    taper(14, { minHalfWidth: 1.2, power: 0.5 }),
  );
  // Slim highlight line following the swash gives the "stroke" a metallic edge.
  const body = `<g fill="${paint}">
  <path transform="translate(${mx.toFixed(2)} ${my.toFixed(2)})" d="${m.d}"/>
  <path d="${swash}"/>
</g>`;
  return { body, width: size, height: size };
}

/** "MIHIR" wordmark with under-swash. Local box tight around the glyphs plus swash. */
export function wordmark({ paint }) {
  const size = 1000;
  const tr = traced("wordmark");
  if (tr) return tracedMark(tr, { paint, width: 4200, padFrac: 0.01 });
  const t = textPath("cinzelDecoBlack", BRAND, { size, letterSpacing: 0.01 });
  const pad = 40;
  const ox = -t.bbox.x1 + pad;
  const oy = -t.bbox.y1 + pad;
  const w = t.bbox.x2 - t.bbox.x1;
  const h = t.bbox.y2 - t.bbox.y1;
  const baseline = oy; // glyph baseline is y = 0 in text space -> oy after translate
  const left = pad;
  const right = pad + w;

  // Under-swash: leaves the foot of the R, sweeps left beneath the letters and curls up.
  const y0 = baseline + 40;
  const swash = ribbon(
    [
      [[right - 30, y0 - 70], [right + 40, y0 + 10], [right - 120, y0 + 90], [right - 380, y0 + 95]],
      [[right - 380, y0 + 95], [right - 700, y0 + 100], [left + 500, y0 + 95], [left + 250, y0 + 80]],
      [[left + 250, y0 + 80], [left + 120, y0 + 72], [left + 60, y0 + 40], [left + 110, y0 + 10]],
      [[left + 110, y0 + 10], [left + 150, y0 - 12], [left + 190, y0 + 20], [left + 160, y0 + 40]],
    ],
    taper(13, { minHalfWidth: 1, power: 0.5 }),
  );
  const body = `<g fill="${paint}">
  <path transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)})" d="${t.d}"/>
  <path d="${swash}"/>
</g>`;
  return { body, width: w + pad * 2, height: h + pad * 2 + 120 };
}

/** Tagline in spaced Cinzel Bold caps. Returns tight box. */
export function tagline({ paint, text = TAGLINE, size = 100 }) {
  const t = textPath("montserratSemi", text, { size, letterSpacing: 0.09 });
  const w = t.bbox.x2 - t.bbox.x1;
  const h = t.bbox.y2 - t.bbox.y1;
  const body = `<path fill="${paint}" transform="translate(${(-t.bbox.x1).toFixed(2)} ${(-t.bbox.y1).toFixed(2)})" d="${t.d}"/>`;
  return { body, width: w, height: h };
}

/** Place a mark inside a lockup: scale to target width and translate. */
export function place(mark, { x = 0, y = 0, width, height } = {}) {
  let s = 1;
  if (width) s = width / mark.width;
  else if (height) s = height / mark.height;
  return {
    body: `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(5)})">${mark.body}</g>`,
    width: mark.width * s,
    height: mark.height * s,
  };
}

/**
 * Shared vertical architecture for primary / stacked lockups.
 * monoRatio = artwork width of the monogram relative to the wordmark width.
 */
function stackLockup({ fill, withTagline, wordWidth, monoRatio, tagWidth, gap }) {
  const { paint } = paintFor(fill);
  const W = 2000;
  const word = place(wordmark({ paint }), { width: wordWidth });
  const tag = place(tagline({ paint }), { width: tagWidth });
  const monoRaw = monogram({ paint });
  let mono;
  let monoTop;
  let monoBottom;
  if (monoRaw.content) {
    const s = (word.width * monoRatio) / monoRaw.content.w;
    mono = place(monoRaw, { width: monoRaw.width * s });
    monoTop = -monoRaw.content.y * s; // artwork top sits at y = 0
    monoBottom = monoTop + (monoRaw.content.y + monoRaw.content.h) * s;
  } else {
    mono = place(monoRaw, { width: wordWidth * 0.7 });
    monoTop = -20;
    monoBottom = mono.height - 100;
  }
  const parts = [];
  parts.push(place(mono, { x: (W - mono.width) / 2, y: monoTop }).body);
  let y = monoBottom + gap;
  parts.push(place(word, { x: (W - word.width) / 2, y }).body);
  y += word.height;
  if (withTagline) {
    // The wordmark's under-swash descends to the bottom of its box, so keep clear space
    // proportional to the wordmark width (matches the reference board).
    const tagGap = word.width * 0.05;
    parts.push(place(tag, { x: (W - tag.width) / 2, y: y + tagGap }).body);
    y += tag.height + tagGap;
  }
  return { body: parts.join(String.fromCharCode(10)), width: W, height: y + 20 };
}

// ---------------------------------------------------------------------------
// Lockups. Each returns { body, width, height } in a local coordinate space.
// `fill` is "gold" or a CSS colour. `withTagline` toggles the descriptor.
// ---------------------------------------------------------------------------
export const lockups = {
  /** Icon / mark only. 1000 x 1000. */
  icon({ fill = "gold" } = {}) {
    const { paint } = paintFor(fill);
    return monogram({ paint });
  },

  /** Wordmark only (no tagline). */
  wordmark({ fill = "gold" } = {}) {
    const { paint } = paintFor(fill);
    return wordmark({ paint });
  },

  /** Tagline only. */
  tagline({ fill = "gold" } = {}) {
    const { paint } = paintFor(fill);
    return tagline({ paint });
  },

  /** Primary: monogram above wordmark above tagline (proportions from the reference board). */
  primary({ fill = "gold", withTagline = true } = {}) {
    return stackLockup({ fill, withTagline, wordWidth: 1500, monoRatio: 0.88, tagWidth: 1300, gap: 22 });
  },

  /** Stacked / vertical: same architecture, monogram larger relative to the wordmark for a column silhouette. */
  stacked({ fill = "gold", withTagline = true } = {}) {
    return stackLockup({ fill, withTagline, wordWidth: 1360, monoRatio: 1.0, tagWidth: 1120, gap: 40 });
  },

  /** Horizontal: monogram | divider | wordmark with tagline beneath. */
  horizontal({ fill = "gold", withTagline = true, divider = true } = {}) {
    const { paint } = paintFor(fill);
    const mono = place(monogram({ paint }), { height: 760 });
    const word = place(wordmark({ paint }), { width: 1400 });
    const tag = place(tagline({ paint }), { width: 1060 });
    const gap = 90;
    const rightX = mono.width + gap * 2;
    const tagGap = word.width * 0.045;
    const textH = word.height + (withTagline ? tag.height + tagGap : 0);
    const H = Math.max(mono.height, textH) + 40;
    const parts = [];
    parts.push(place(mono, { x: 0, y: (H - mono.height) / 2 }).body);
    if (divider) {
      const dx = mono.width + gap;
      parts.push(`<rect x="${dx.toFixed(1)}" y="${(H * 0.14).toFixed(1)}" width="5" height="${(H * 0.72).toFixed(1)}" rx="2.5" fill="${paint}" opacity="0.85"/>`);
    }
    const ty = (H - textH) / 2;
    parts.push(place(word, { x: rightX, y: ty }).body);
    if (withTagline) {
      parts.push(place(tag, { x: rightX + (word.width - tag.width) / 2, y: ty + word.height + tagGap }).body);
    }
    return { body: parts.join("\n"), width: rightX + word.width, height: H };
  },
};

// ---------------------------------------------------------------------------
// Document + rendering helpers
// ---------------------------------------------------------------------------
/**
 * Wrap a lockup in a full SVG document.
 * padding: fraction of the larger dimension added around the artwork.
 * background: colour string, or null for transparent.
 * fill: pass the same fill used for the lockup so the gradient defs are included.
 * Extra `defs`/`extraBody` allow decorations (circles, glows) behind the mark.
 */
export function svgDocument({
  body,
  width,
  height,
  padding = 0.08,
  background = null,
  fill = "gold",
  square = false,
  extraDefs = "",
  behind = "",
  front = "",
  title = "MIHIR - Sound &amp; Light | Event | Production",
}) {
  const pad = Math.round(Math.max(width, height) * padding);
  let W = Math.round(width + pad * 2);
  let H = Math.round(height + pad * 2);
  let ox = pad;
  let oy = pad;
  if (square) {
    const side = Math.max(W, H);
    ox += (side - W) / 2;
    oy += (side - H) / 2;
    W = H = side;
  }
  const { defs } = paintFor(fill);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<title>${title}</title>
<defs>
${defs}
${extraDefs}
</defs>
${background ? `<rect width="${W}" height="${H}" fill="${background}"/>` : ""}
${behind}
<g transform="translate(${ox.toFixed(2)} ${oy.toFixed(2)})">
${body}
</g>
${front}
</svg>`;
}

/**
 * Render an SVG string to PNG at a given pixel width (height follows aspect).
 * `background`: colour to flatten onto. Defaults to the full-canvas background
 * rect emitted by svgDocument (if any), so opaque exports have no faintly
 * translucent border pixels left over from rasterising at a fractional canvas
 * size and resizing. Pass null to keep transparency regardless.
 */
export async function renderPNG(svg, outPath, { width = 4000, background } = {}) {
  const m = svg.match(/<svg[^>]*\swidth="([\d.]+)"/);
  const svgW = m ? parseFloat(m[1]) : 1000;
  const density = (72 * width) / svgW;
  if (background === undefined) {
    const bg = svg.match(/<\/defs>\s*<rect width="[\d.]+" height="[\d.]+" fill="([^"]+)"\/>/);
    background = bg ? bg[1] : null;
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  let img = sharp(Buffer.from(svg), { density }).resize({ width });
  if (background) img = img.flatten({ background });
  await img.png({ compressionLevel: 9 }).toFile(outPath);
  return outPath;
}

/** Render an SVG string to JPG (for opaque backgrounds only). */
export async function renderJPG(svg, outPath, { width = 4000, quality = 92 } = {}) {
  const m = svg.match(/<svg[^>]*\swidth="([\d.]+)"/);
  const svgW = m ? parseFloat(m[1]) : 1000;
  const density = (72 * width) / svgW;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg), { density }).resize({ width }).flatten({ background: "#000" }).jpeg({ quality, mozjpeg: true }).toFile(outPath);
  return outPath;
}

export function writeSVG(svg, outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg);
  return outPath;
}

/** Repo-relative output root for the kit. */
export const OUT = path.resolve(here, "..", "..", "assets", "brand");
