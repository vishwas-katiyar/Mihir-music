// Brand colours & typography: specimen card, palette tokens (JSON + CSS) and font bundle.
//
//   node scripts/brand/build-guide.mjs
//
// Exports `paletteArt` so build-board.mjs can embed the same vector card in panel 13.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COLORS, TAGLINE, BRAND, paintFor, textPath, renderPNG, writeSVG, OUT, lockups, place } from "./core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const f2 = (n) => n.toFixed(2);

export const GRADIENT_STOPS = [
  { offset: 0, hex: "#F9E9A0" },
  { offset: 0.22, hex: "#E4C160" },
  { offset: 0.48, hex: "#F3D77B" },
  { offset: 0.7, hex: "#C9A23A" },
  { offset: 1, hex: "#8E6A14" },
];

export const PALETTE = [
  { key: "gold", name: "Gold", hex: COLORS.gold, role: "Primary brand colour - logo, accents, rules", tier: "primary" },
  { key: "black", name: "Black", hex: COLORS.black, role: "Primary background", tier: "primary" },
  { key: "charcoal", name: "Charcoal", hex: COLORS.charcoal, role: "Secondary dark surface, cards, panels", tier: "primary" },
  { key: "white", name: "White", hex: COLORS.white, role: "Light background, inverse logo", tier: "primary" },
  { key: "goldLight", name: "Gold Light", hex: COLORS.goldLight, role: "Highlights, calls to action on dark", tier: "secondary" },
  { key: "goldDeep", name: "Gold Deep", hex: COLORS.goldDeep, role: "Shadow tone of the gradient, gold on light", tier: "secondary" },
  { key: "navy", name: "Navy", hex: COLORS.navy, role: "Alternative dark background (colour variations)", tier: "support" },
  { key: "grey", name: "Grey", hex: COLORS.grey, role: "Neutral background for white logo", tier: "support" },
];

export const TYPOGRAPHY = [
  { font: null, family: "Custom calligraphic lettering", weight: "Traced vector", use: "Wordmark & Monogram (never retype)", specimen: BRAND, letterSpacing: 0 },
  { font: "montserratSemi", family: "Montserrat", weight: "SemiBold (600)", use: "Tagline & Labels", specimen: TAGLINE, letterSpacing: 0.09 },
  { font: "cinzel", family: "Cinzel", weight: "Regular (400)", use: "Headings & Guide Labels", specimen: "BRAND GUIDELINES", letterSpacing: 0.12 },
  { font: "playfair", family: "Playfair Display", weight: "Regular (400)", use: "Editorial / Body Display", specimen: "Elegant · Bold · Premium · Timeless", letterSpacing: 0.02 },
];

/** Text path positioned by left x / baseline y. Returns { body, width, height, bbox }. */
function text(fontKey, str, { x, y, size, letterSpacing = 0, fill, anchor = "start", opacity, maxWidth }) {
  let t = textPath(fontKey, str, { size, letterSpacing });
  if (maxWidth && t.bbox.x2 - t.bbox.x1 > maxWidth) {
    size *= maxWidth / (t.bbox.x2 - t.bbox.x1);
    t = textPath(fontKey, str, { size, letterSpacing });
  }
  const w = t.bbox.x2 - t.bbox.x1;
  let dx = x - t.bbox.x1;
  if (anchor === "middle") dx = x - t.bbox.x1 - w / 2;
  if (anchor === "end") dx = x - t.bbox.x2;
  const op = opacity != null ? ` opacity="${opacity}"` : "";
  return {
    body: `<path fill="${fill}"${op} transform="translate(${f2(dx)} ${f2(y)})" d="${t.d}"/>`,
    width: w,
    height: t.bbox.y2 - t.bbox.y1,
    top: y + t.bbox.y1,
    bottom: y + t.bbox.y2,
  };
}

/**
 * Colours & typography card. Returns { defs, body } in canvas coordinates 0..W x 0..H.
 * `compact` drops the header (used for the board panel, which has its own label).
 */
export function paletteArt({ width: W, height: H, id = "pal", compact = false, background = "#0A0A0A" }) {
  const gold = paintFor("gold", `${id}Gold`);
  const paint = gold.paint;
  const parts = [];
  const u = H / 2250; // design unit: everything scales with the 4000 x 2250 reference
  const ts = compact ? 1.45 * u : u; // text unit: compact (board panel) text is enlarged for legibility
  const margin = W * 0.06;

  parts.push(`<rect width="${W}" height="${H}" fill="${background}"/>`);

  let y = compact ? H * 0.1 : H * 0.115;
  if (!compact) {
    const head = text("cinzel", "BRAND COLOURS & TYPOGRAPHY", { x: margin, y, size: 78 * u, letterSpacing: 0.28, fill: paint });
    parts.push(head.body);
    parts.push(`<rect x="${f2(margin)}" y="${f2(y + 40 * u)}" width="${f2(W - margin * 2)}" height="${f2(2 * u)}" fill="${COLORS.gold}" opacity="0.35"/>`);
    y += 175 * u;
  }

  // Section label helper
  const section = (label, yy) =>
    text("cinzel", label, { x: margin, y: yy, size: 34 * ts, letterSpacing: 0.3, fill: "#9A9A9A" }).body;

  // ---- Swatches -----------------------------------------------------------
  parts.push(section("COLOURS", y));
  y += 60 * u;
  const primaries = PALETTE.filter((p) => p.tier === "primary");
  const secondaries = PALETTE.filter((p) => p.tier === "secondary");
  const swR = 128 * u;
  const colW = (W - margin * 2) / 6;
  const cy = y + swR + 20 * u;
  [...primaries, ...secondaries].forEach((p, i) => {
    const cx = margin + colW * i + colW / 2;
    const isSecondary = p.tier === "secondary";
    const r = isSecondary ? swR * 0.78 : swR;
    const ring =
      p.hex.toUpperCase() === "#000000" || p.hex.toUpperCase() === "#1A1A1A"
        ? `stroke="#3A3A3A" stroke-width="${f2(2 * u)}"`
        : p.hex.toUpperCase() === "#F5F5F5"
          ? `stroke="#6A6A6A" stroke-width="${f2(2.5 * u)}"`
          : "";
    parts.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(r)}" fill="${p.hex}" ${ring}/>`);
    if (isSecondary) {
      parts.push(`<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(swR)}" fill="none" stroke="#2A2A2A" stroke-width="${f2(1.5 * u)}" stroke-dasharray="${f2(6 * u)} ${f2(10 * u)}"/>`);
    }
    const ny = cy + swR + 70 * ts;
    parts.push(text("cinzelBold", p.name.toUpperCase(), { x: cx, y: ny, size: 34 * ts, letterSpacing: 0.18, fill: COLORS.white, anchor: "middle", maxWidth: colW * 0.92 }).body);
    parts.push(text("playfair", p.hex.toUpperCase(), { x: cx, y: ny + 52 * ts, size: 34 * ts, letterSpacing: 0.06, fill: "#9A9A9A", anchor: "middle" }).body);
  });
  y = cy + swR + 70 * ts + 52 * ts + 40 * u;

  // Gradient bar + note
  const barH = 26 * u;
  const barId = `${id}Bar`;
  const barDefs = `<linearGradient id="${barId}" x1="0" y1="0" x2="1" y2="0">${GRADIENT_STOPS.map((s) => `<stop offset="${s.offset}" stop-color="${s.hex}"/>`).join("")}</linearGradient>`;
  y += 30 * u;
  parts.push(`<rect x="${f2(margin)}" y="${f2(y)}" width="${f2(W - margin * 2)}" height="${f2(barH)}" rx="${f2(barH / 2)}" fill="url(#${barId})"/>`);
  y += barH + 52 * ts;
  const note = "Gold gradient: " + GRADIENT_STOPS.map((s) => s.hex).join(" → ");
  parts.push(text("playfair", note, { x: margin, y, size: 32 * ts, letterSpacing: 0.04, fill: "#9A9A9A", maxWidth: (W - margin * 2) * 0.66 }).body);
  parts.push(text("cinzel", "VERTICAL, TOP TO BOTTOM", { x: W - margin, y, size: 26 * ts, letterSpacing: 0.26, fill: "#6A6A6A", anchor: "end", maxWidth: (W - margin * 2) * 0.3 }).body);

  // ---- Typography -----------------------------------------------------------
  y += 120 * ts;
  parts.push(section("TYPOGRAPHY", y));
  parts.push(`<rect x="${f2(margin)}" y="${f2(y + 28 * u)}" width="${f2(W - margin * 2)}" height="${f2(1.5 * u)}" fill="#2A2A2A"/>`);
  y += 100 * u;

  const rowGap = (H - y - H * 0.06) / TYPOGRAPHY.length;
  const specimenX = margin + (W - margin * 2) * 0.36;
  TYPOGRAPHY.forEach((t, i) => {
    const ry = y + rowGap * i;
    const labelY = ry + rowGap * 0.42;
    const labelMax = (specimenX - margin) * 0.92;
    parts.push(text("cinzel", `${t.family} ${t.weight}`.toUpperCase(), { x: margin, y: labelY, size: 30 * ts, letterSpacing: 0.2, fill: COLORS.white, maxWidth: labelMax }).body);
    parts.push(text("playfair", t.use, { x: margin, y: labelY + 48 * ts, size: 30 * ts, letterSpacing: 0.02, fill: "#8A8A8A", maxWidth: labelMax }).body);
    const sizes = [150, 58, 62, 78];
    const fills = [paint, paint, COLORS.white, COLORS.white];
    if (t.font === null) {
      // The wordmark is traced artwork, so show the real thing rather than a font specimen.
      const wm = place(lockups.wordmark({ fill: paint }), { width: Math.min((W - margin - specimenX) * 0.62, 900 * u) });
      parts.push(place(wm, { x: specimenX, y: ry + rowGap * 0.55 - wm.height * 0.72 }).body);
    } else {
      const sp = text(t.font, t.specimen, {
        x: specimenX, y: ry + rowGap * 0.55, size: sizes[i] * u, letterSpacing: t.letterSpacing, fill: fills[i], maxWidth: W - margin - specimenX,
      });
      parts.push(sp.body);
    }
    if (i < TYPOGRAPHY.length - 1) {
      parts.push(`<rect x="${f2(margin)}" y="${f2(ry + rowGap - 4 * u)}" width="${f2(W - margin * 2)}" height="${f2(1 * u)}" fill="#1E1E1E"/>`);
    }
  });

  return { defs: `${gold.defs}\n${barDefs}`, body: parts.join("\n") };
}

function document({ width, height, defs, body, title }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<title>${title}</title>
<defs>
${defs}
</defs>
${body}
</svg>`;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------
export function coloursJSON() {
  return {
    brand: BRAND,
    tagline: TAGLINE,
    palette: PALETTE.map(({ key, name, hex, role, tier }) => ({ key, name, hex, role, tier })),
    goldGradient: {
      direction: "vertical (top to bottom)",
      css: `linear-gradient(180deg, ${GRADIENT_STOPS.map((s) => `${s.hex} ${Math.round(s.offset * 100)}%`).join(", ")})`,
      stops: GRADIENT_STOPS,
    },
    typography: TYPOGRAPHY.map(({ family, weight, use }) => ({ family, weight, use })),
  };
}

export function coloursCSS() {
  const vars = PALETTE.map((p) => `  --brand-${p.key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${p.hex};`).join("\n");
  const grad = `linear-gradient(180deg, ${GRADIENT_STOPS.map((s) => `${s.hex} ${Math.round(s.offset * 100)}%`).join(", ")})`;
  return `/* MIHIR brand tokens - generated by scripts/brand/build-guide.mjs */
:root {
${vars}
  --brand-gold-gradient: ${grad};

  --brand-font-display: "Cinzel Decorative", "Cinzel", Georgia, serif;   /* headings (the wordmark itself is a traced SVG, never live text) */
  --brand-font-label: "Montserrat", Arial, sans-serif;                   /* tagline, labels */
  --brand-font-editorial: "Playfair Display", Georgia, serif;           /* editorial / body display */
  --brand-tagline: "${TAGLINE}";
}
`;
}

// [file name in the kit, source file in scripts/brand/fonts, face, Google Fonts page].
// Kit copies use the canonical Google Fonts family names.
const FONT_SOURCES = [
  ["Cinzel-400.ttf", "Cinzel-400.ttf", "Cinzel Regular 400", "https://fonts.google.com/specimen/Cinzel"],
  ["Cinzel-700.ttf", "Cinzel-700.ttf", "Cinzel Bold 700", "https://fonts.google.com/specimen/Cinzel"],
  ["Cinzel-900.ttf", "Cinzel-900.ttf", "Cinzel Black 900", "https://fonts.google.com/specimen/Cinzel"],
  ["CinzelDecorative-400.ttf", "CinzelDecorative-400.ttf", "Cinzel Decorative Regular 400", "https://fonts.google.com/specimen/Cinzel+Decorative"],
  ["CinzelDecorative-700.ttf", "CinzelDecorative-700.ttf", "Cinzel Decorative Bold 700", "https://fonts.google.com/specimen/Cinzel+Decorative"],
  ["CinzelDecorative-900.ttf", "CinzelDecorative-900.ttf", "Cinzel Decorative Black 900", "https://fonts.google.com/specimen/Cinzel+Decorative"],
  ["PlayfairDisplay-400.ttf", "Playfair-400.ttf", "Playfair Display Regular 400", "https://fonts.google.com/specimen/Playfair+Display"],
  ["PlayfairDisplay-700.ttf", "Playfair-700.ttf", "Playfair Display Bold 700", "https://fonts.google.com/specimen/Playfair+Display"],
  ["PlayfairDisplay-700i.ttf", "Playfair-700i.ttf", "Playfair Display Bold Italic 700", "https://fonts.google.com/specimen/Playfair+Display"],
  ["PlayfairDisplay-900.ttf", "Playfair-900.ttf", "Playfair Display Black 900", "https://fonts.google.com/specimen/Playfair+Display"],
  ["PlayfairDisplay-900i.ttf", "Playfair-900i.ttf", "Playfair Display Black Italic 900", "https://fonts.google.com/specimen/Playfair+Display"],
  ["Montserrat-600.ttf", "Montserrat-600.ttf", "Montserrat SemiBold 600", "https://fonts.google.com/specimen/Montserrat"],
  ["Montserrat-700.ttf", "Montserrat-700.ttf", "Montserrat Bold 700", "https://fonts.google.com/specimen/Montserrat"],
];

function fontsReadme() {
  const rows = FONT_SOURCES.map(([file, , name, url]) => `| \`${file}\` | ${name} | ${url} |`).join("\n");
  return `# MIHIR brand fonts

Static TTF instances of the three Google Fonts families used by the brand. All are licensed
under the SIL Open Font License 1.1 (see \`OFL-LICENSE.txt\`): free to use, embed and
redistribute, including commercially, as long as the fonts themselves are not sold on their own.

| File | Face | Source |
| --- | --- | --- |
${rows}

## Roles

- **Cinzel Decorative Black** - wordmark "MIHIR" and the "M" monogram.
- **Cinzel Bold** - tagline "${TAGLINE}", labels and spaced-caps lines.
- **Playfair Display** - editorial / body display copy (regular, bold, italics as needed).

## Web use

\`\`\`css
@font-face { font-family: "Cinzel Decorative"; font-weight: 900; src: url("CinzelDecorative-900.ttf") format("truetype"); }
@font-face { font-family: "Cinzel"; font-weight: 700; src: url("Cinzel-700.ttf") format("truetype"); }
@font-face { font-family: "Montserrat"; font-weight: 600; src: url("Montserrat-600.ttf") format("truetype"); }
@font-face { font-family: "Playfair Display"; font-weight: 400; src: url("PlayfairDisplay-400.ttf") format("truetype"); }
\`\`\`
`;
}

export async function build({ outDir = path.join(OUT, "13-brand-colours-typography"), log = console.log } = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  const W = 4000;
  const H = 2250;
  const art = paletteArt({ width: W, height: H });
  const svg = document({ width: W, height: H, ...art, title: "MIHIR - Brand colours &amp; typography" });
  writeSVG(svg, path.join(outDir, "brand-colours-typography-card.svg"));
  await renderPNG(svg, path.join(outDir, "brand-colours-typography-card.png"), { width: W });
  log(`wrote brand-colours-typography-card ${W}x${H}`);

  fs.writeFileSync(path.join(outDir, "colours.json"), JSON.stringify(coloursJSON(), null, 2) + "\n");
  fs.writeFileSync(path.join(outDir, "colours.css"), coloursCSS());
  log("wrote colours.json, colours.css");

  // Fonts bundle
  const fontsDir = path.join(outDir, "fonts");
  fs.mkdirSync(fontsDir, { recursive: true });
  for (const f of fs.readdirSync(fontsDir)) if (f.endsWith(".ttf")) fs.unlinkSync(path.join(fontsDir, f));
  for (const [file, src] of FONT_SOURCES) {
    fs.copyFileSync(path.join(here, "fonts", src), path.join(fontsDir, file));
  }
  fs.writeFileSync(path.join(fontsDir, "fonts-README.md"), fontsReadme());
  const lic = path.join(fontsDir, "OFL-LICENSE.txt");
  if (!fs.existsSync(lic) || fs.statSync(lic).size < 1000) {
    fs.writeFileSync(
      lic,
      "SIL Open Font License, Version 1.1\n\nThe full licence text could not be fetched while building this kit.\nRead it at https://openfontlicense.org/documents/OFL.txt\n",
    );
  }
  log(`wrote fonts/ (${FONT_SOURCES.length} TTFs, fonts-README.md, OFL-LICENSE.txt)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await build();
}
