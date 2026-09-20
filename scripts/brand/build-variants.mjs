// Brand-kit variant sets built on top of core.mjs (geometry untouched):
//   06-monochrome-logo      flat black lockups
//   07-inverse-logo         silver-gradient / flat white lockups for dark grounds
//   08-social-media-avatar  1:1 avatars (2048 + 512 px)
//   09-badge-emblem         circular emblem
//   12-colour-variations    six labelled colourways + contact sheet
// Usage: node scripts/brand/build-variants.mjs

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  lockups,
  place,
  textPath,
  paintFor,
  svgDocument,
  renderPNG,
  writeSVG,
  COLORS,
  OUT,
} from "./core.mjs";

const BLACK = "#000000";
const WHITE = "#FFFFFF";

// ---------------------------------------------------------------------------
// Silver metallic paint (inverse set). Injected through svgDocument's extraDefs
// with fill:"#fff" so the gold gradient is not added alongside it.
// ---------------------------------------------------------------------------
const SILVER_ID = "mihirSilver";
const SILVER = `url(#${SILVER_ID})`;
const silverDefs = `<linearGradient id="${SILVER_ID}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#FFFFFF"/>
  <stop offset="0.25" stop-color="#D9D9D9"/>
  <stop offset="0.5" stop-color="#F7F7F7"/>
  <stop offset="0.75" stop-color="#A8A8A8"/>
  <stop offset="1" stop-color="#7A7A7A"/>
</linearGradient>`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const produced = [];

/** The opaque background colour svgDocument painted, or null for transparent documents. */
function backgroundOf(svg) {
  const m = svg.match(/<rect width="\d+" height="\d+" fill="([^"]+)"\/>/);
  return m ? m[1] : null;
}

/**
 * The rasteriser anti-aliases the document edge, leaving a 1px ring with partial alpha
 * on otherwise opaque backgrounds. Flatten those files so they ship fully opaque.
 */
async function flattenPNG(file, background) {
  const buf = await sharp(file).flatten({ background }).png({ compressionLevel: 9 }).toBuffer();
  await fs.promises.writeFile(file, buf);
}

/** Write SVG + PNG(s). The first width gets the bare name; extra widths get a -<w> suffix. */
async function emit(dir, name, svg, widths = [4000]) {
  const base = path.join(OUT, dir, name);
  writeSVG(svg, `${base}.svg`);
  const background = backgroundOf(svg);
  for (let i = 0; i < widths.length; i++) {
    const w = widths[i];
    const suffix = i === 0 ? "" : `-${w}`;
    const file = `${base}${suffix}.png`;
    await renderPNG(svg, file, { width: w });
    if (background) await flattenPNG(file, background);
  }
  produced.push(`${dir}/${name}`);
  console.log("built", `${dir}/${name}`);
}

/** Centre a mark (unscaled) in a W x H box. */
function centreIn(mark, W, H) {
  return {
    body: place(mark, { x: (W - mark.width) / 2, y: (H - mark.height) / 2 }).body,
    width: W,
    height: H,
  };
}

/** Widen a mark's box so the document is landscape at the given aspect ratio. */
function landscape(mark, ratio = 1.6) {
  const W = Math.max(mark.width, mark.height * ratio);
  return centreIn(mark, W, W / ratio);
}

// ---------------------------------------------------------------------------
// 06 - Monochrome
// ---------------------------------------------------------------------------
async function buildMonochrome() {
  const dir = "06-monochrome-logo";
  const primary = lockups.primary({ fill: BLACK });
  await emit(dir, "monochrome-logo-black-on-white", svgDocument({ ...primary, background: WHITE, fill: BLACK }));
  await emit(dir, "monochrome-logo-black-transparent", svgDocument({ ...primary, background: null, fill: BLACK }));
  const icon = lockups.icon({ fill: BLACK });
  await emit(dir, "monochrome-icon-black-transparent", svgDocument({ ...icon, background: null, fill: BLACK }));
}

// ---------------------------------------------------------------------------
// 07 - Inverse
// ---------------------------------------------------------------------------
async function buildInverse() {
  const dir = "07-inverse-logo";
  const silver = lockups.primary({ fill: SILVER });
  await emit(
    dir,
    "inverse-logo-silver-on-black",
    svgDocument({ ...silver, background: BLACK, fill: "#fff", extraDefs: silverDefs }),
  );
  const white = lockups.primary({ fill: WHITE });
  await emit(dir, "inverse-logo-white-transparent", svgDocument({ ...white, background: null, fill: WHITE }));
  const icon = lockups.icon({ fill: WHITE });
  await emit(dir, "inverse-icon-white-transparent", svgDocument({ ...icon, background: null, fill: WHITE }));
}

// ---------------------------------------------------------------------------
// 08 - Social media avatars (1:1)
// ---------------------------------------------------------------------------
function avatar({ ring, disc, background }) {
  const S = 2000;
  const c = S / 2;
  const { paint } = paintFor("gold");
  const r = c - S * 0.06; // ring inset 6% of the side
  const monoW = ring ? 2 * r * 0.58 : S * 0.66;
  const mono = place(lockups.icon({ fill: "gold" }), { width: monoW });
  const behind = [
    disc ? `<circle cx="${c}" cy="${c}" r="${c}" fill="${BLACK}"/>` : "",
    ring
      ? `<circle cx="${c}" cy="${c}" r="${r.toFixed(1)}" fill="none" stroke="${paint}" stroke-width="${(S * 0.007).toFixed(1)}"/>`
      : "",
  ].join("\n");
  return svgDocument({ ...centreIn(mono, S, S), padding: 0, background, fill: "gold", behind });
}

async function buildAvatars() {
  const dir = "08-social-media-avatar";
  const sizes = [2048, 512];
  await emit(dir, "avatar-circle-gold-on-black", avatar({ ring: true, disc: false, background: BLACK }), sizes);
  await emit(dir, "avatar-square-gold-on-black", avatar({ ring: false, disc: false, background: BLACK }), sizes);
  await emit(dir, "avatar-circle-transparent", avatar({ ring: true, disc: true, background: null }), sizes);
}

// ---------------------------------------------------------------------------
// 09 - Badge emblem
// ---------------------------------------------------------------------------
function badge({ fill, background }) {
  const S = 2000;
  const c = S / 2;
  const { paint } = paintFor(fill);

  const mono = place(lockups.icon({ fill }), { width: S * 0.38 });
  const word = place(lockups.wordmark({ fill }), { width: S * 0.55 });
  const tag = place(lockups.tagline({ fill }), { width: S * 0.5 });

  // Ornament row: rect - dot - rect
  const ornW = 300;
  const dashW = 112;
  const dashH = 4;
  const dotR = 9;
  const ornH = dotR * 2;
  const orn = {
    width: ornW,
    height: ornH,
    body: `<g fill="${paint}">
  <rect x="0" y="${ornH / 2 - dashH / 2}" width="${dashW}" height="${dashH}" rx="2"/>
  <circle cx="${ornW / 2}" cy="${ornH / 2}" r="${dotR}"/>
  <rect x="${ornW - dashW}" y="${ornH / 2 - dashH / 2}" width="${dashW}" height="${dashH}" rx="2"/>
</g>`,
  };

  // The monogram's 1000-box carries ~22% air above and ~20% below the glyph;
  // overlap it into the wordmark the way lockups.primary does.
  const monoAirTop = mono.height * 0.22;
  const gapMonoWord = -mono.height * 0.14;
  const gapWordTag = word.width * 0.05; // clear space below the wordmark swash
  const gapTagOrn = 46;
  const total = mono.height + gapMonoWord + word.height + gapWordTag + tag.height + gapTagOrn + orn.height;
  const visual = total - monoAirTop;
  let y = (S - visual) / 2 - monoAirTop;

  const parts = [];
  parts.push(place(mono, { x: (S - mono.width) / 2, y }).body);
  y += mono.height + gapMonoWord;
  parts.push(place(word, { x: (S - word.width) / 2, y }).body);
  y += word.height + gapWordTag;
  parts.push(place(tag, { x: (S - tag.width) / 2, y }).body);
  y += tag.height + gapTagOrn;
  parts.push(place(orn, { x: (S - orn.width) / 2, y }).body);

  const behind = `<circle cx="${c}" cy="${c}" r="960" fill="none" stroke="${paint}" stroke-width="12"/>
<circle cx="${c}" cy="${c}" r="908" fill="none" stroke="${paint}" stroke-width="4"/>`;

  return svgDocument({ body: parts.join("\n"), width: S, height: S, padding: 0, background, fill, behind });
}

async function buildBadges() {
  const dir = "09-badge-emblem";
  await emit(dir, "badge-emblem-gold-on-black", badge({ fill: "gold", background: BLACK }), [2048]);
  await emit(dir, "badge-emblem-gold-transparent", badge({ fill: "gold", background: null }), [2048]);
  await emit(dir, "badge-emblem-black-on-white", badge({ fill: BLACK, background: WHITE }), [2048]);
}

// ---------------------------------------------------------------------------
// 12 - Colour variations
// ---------------------------------------------------------------------------
const VARIANTS = [
  { slug: "gold-on-black", label: "Gold on Black (Default)", fill: "gold", bg: COLORS.black },
  { slug: "black-on-white", label: "Black on White", fill: BLACK, bg: WHITE },
  { slug: "white-on-black", label: "White on Black", fill: WHITE, bg: COLORS.black },
  { slug: "black-on-gold", label: "Black on Gold", fill: BLACK, bg: COLORS.gold },
  { slug: "gold-on-navy", label: "Gold on Navy", fill: "gold", bg: COLORS.navy },
  { slug: "white-on-grey", label: "White on Grey", fill: WHITE, bg: COLORS.grey },
];

function contactSheet() {
  const W = 4000;
  const G = 60;
  const cols = 3;
  const rows = 2;
  const tileW = (W - G * (cols + 1)) / cols;
  const tileH = tileW / 1.6;
  const labelH = 120;
  const H = G + rows * (tileH + labelH) + (rows - 1) * G + G / 2;
  const parts = [];
  VARIANTS.forEach((v, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = G + col * (tileW + G);
    const y = G + row * (tileH + labelH + G);
    const edge = v.bg === COLORS.black ? ` stroke="#262626" stroke-width="2"` : "";
    parts.push(
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${tileW.toFixed(1)}" height="${tileH.toFixed(1)}" rx="24" fill="${v.bg}"${edge}/>`,
    );
    const lk = place(lockups.primary({ fill: v.fill }), { width: tileW * 0.76 });
    parts.push(place(lk, { x: x + (tileW - lk.width) / 2, y: y + (tileH - lk.height) / 2 }).body);
    const t = textPath("cinzel", v.label, { size: 38, letterSpacing: 0.08 });
    const tw = t.bbox.x2 - t.bbox.x1;
    const lx = x + tileW / 2 - tw / 2 - t.bbox.x1;
    const ly = y + tileH + 70;
    parts.push(`<path fill="${COLORS.gold}" transform="translate(${lx.toFixed(2)} ${ly.toFixed(2)})" d="${t.d}"/>`);
  });
  return svgDocument({
    body: parts.join("\n"),
    width: W,
    height: Math.round(H),
    padding: 0,
    background: "#0A0A0A",
    fill: "gold",
  });
}

async function buildColourVariations() {
  const dir = "12-colour-variations";
  for (const v of VARIANTS) {
    const lk = landscape(lockups.primary({ fill: v.fill }));
    await emit(dir, v.slug, svgDocument({ ...lk, padding: 0.12, background: v.bg, fill: v.fill }));
  }
  await emit(dir, "colour-variations-sheet", contactSheet());
}

// ---------------------------------------------------------------------------
await buildMonochrome();
await buildInverse();
await buildAvatars();
await buildBadges();
await buildColourVariations();
console.log(`\n${produced.length} assets written under ${OUT}`);
