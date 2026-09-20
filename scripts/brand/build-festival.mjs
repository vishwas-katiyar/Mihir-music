// Festival / event variation: Ganpati campaign creatives (16:9 banner, 1:1 square, 9:16 story).
// Composed entirely from core.mjs pieces plus the calligraphic Ganesha motif defined here.
//
//   node scripts/brand/build-festival.mjs
//
// Exports `ganeshaMotif` and `festivalArt` so build-board.mjs can embed the same vector
// composition inside the brand board.

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COLORS,
  lockups,
  place,
  paintFor,
  ribbon,
  taper,
  textPath,
  renderPNG,
  writeSVG,
  OUT,
} from "./core.mjs";

const TILAK = "#E8452C";
const FESTIVAL_LINE = "GANPATI STHAPNA | AAGMAN | VISARJAN";

// ---------------------------------------------------------------------------
// Deterministic pseudo-random (mulberry32) so every build is identical.
// ---------------------------------------------------------------------------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f2 = (n) => n.toFixed(2);

// ---------------------------------------------------------------------------
// Ganesha motif: 12 calligraphic strokes in a 1000 x 1000 local box.
// Frontal head, large fan ear on the viewer's left, trunk sweeping down and
// curling to the left, single tusk on the right, three-point crown, red tilak.
// ---------------------------------------------------------------------------
export function ganeshaMotif({ paint, tilak = TILAK, halo = true } = {}) {
  const strokes = [];

  // 1. Head outline: open arc from the left jaw, over the crown line, down the right cheek.
  strokes.push(
    ribbon(
      [
        [[352, 500], [330, 380], [370, 270], [470, 240]],
        [[470, 240], [600, 205], [700, 290], [708, 400]],
        [[708, 400], [714, 480], [690, 545], [640, 600]],
      ],
      taper(11, { minHalfWidth: 1.4, power: 0.45 }),
    ),
  );

  // 2. Left ear: large fan leaving the head near the temple and returning at the jaw.
  strokes.push(
    ribbon(
      [
        [[372, 322], [270, 250], [150, 300], [140, 420]],
        [[140, 420], [132, 530], [230, 600], [372, 570]],
      ],
      taper(12, { minHalfWidth: 1.4, power: 0.5 }),
    ),
  );

  // 3. Inner ear fold.
  strokes.push(
    ribbon(
      [
        [[340, 380], [255, 380], [222, 450], [255, 530]],
      ],
      taper(5.5, { minHalfWidth: 1, power: 0.6 }),
    ),
  );

  // 4. Right ear: smaller, tucked behind the head.
  strokes.push(
    ribbon(
      [
        [[690, 340], [790, 300], [842, 400], [790, 500]],
        [[790, 500], [770, 540], [730, 560], [696, 560]],
      ],
      taper(8, { minHalfWidth: 1.2, power: 0.5 }),
    ),
  );

  // 5 + 6. Eyes: serene lowered lids.
  strokes.push(ribbon([[[425, 440], [440, 462], [478, 462], [494, 440]]], taper(4.5, { minHalfWidth: 0.8, power: 0.7 })));
  strokes.push(ribbon([[[560, 440], [576, 462], [614, 462], [630, 440]]], taper(4.5, { minHalfWidth: 0.8, power: 0.7 })));

  // 7. Trunk: thick at the root between the eyes, sweeping down and curling to the left.
  strokes.push(
    ribbon(
      [
        [[527, 478], [540, 545], [582, 590], [586, 650]],
        [[586, 650], [590, 735], [520, 800], [432, 790]],
        [[432, 790], [338, 780], [300, 690], [360, 650]],
        [[360, 650], [412, 618], [455, 668], [420, 700]],
      ],
      (u) => 5 + 24 * Math.pow(1 - u, 0.9) * Math.pow(Math.min(1, u / 0.1), 0.55),
      60,
    ),
  );

  // 8. Tusk: single tusk on the viewer's right of the trunk root.
  strokes.push(
    ribbon([[[604, 592], [652, 604], [676, 650], [664, 712]]], (u) => 2.5 + 12 * Math.pow(1 - u, 0.8)),
  );

  // 9-11. Crown: three tapered leaves rising from the head, centre tallest.
  strokes.push(ribbon([[[520, 262], [514, 210], [516, 160], [520, 108]]], taper(13, { minHalfWidth: 0.8, power: 0.7 })));
  strokes.push(ribbon([[[446, 272], [428, 232], [416, 196], [404, 150]]], taper(10, { minHalfWidth: 0.8, power: 0.7 })));
  strokes.push(ribbon([[[596, 272], [614, 232], [626, 196], [638, 150]]], taper(10, { minHalfWidth: 0.8, power: 0.7 })));

  const gold = strokes.map((d) => `<path d="${d}"/>`).join("\n  ");

  // Crown tips and ear tip: small beads.
  const beads = [
    [520, 100, 9],
    [402, 144, 7],
    [640, 144, 7],
  ]
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`)
    .join("");

  // 12. Tilak: red-orange vertical mark on the forehead.
  const tilakPath = ribbon([[[521, 300], [521, 330], [521, 365], [521, 396]]], taper(9, { minHalfWidth: 1, power: 0.9 }));

  const haloRing = halo
    ? `<circle cx="520" cy="470" r="352" fill="none" stroke="${paint}" stroke-width="2.4" opacity="0.42" stroke-dasharray="4 14"/>
  <circle cx="520" cy="470" r="336" fill="none" stroke="${paint}" stroke-width="1.6" opacity="0.28"/>`
    : "";

  const body = `<g>
  ${haloRing}
  <g fill="${paint}">
  ${gold}
  ${beads}
  </g>
  <path fill="${tilak}" d="${tilakPath}"/>
  <circle cx="521" cy="412" r="6" fill="${tilak}"/>
</g>`;
  return { body, width: 1000, height: 1000 };
}

// ---------------------------------------------------------------------------
// Atmosphere helpers (all in absolute canvas coordinates)
// ---------------------------------------------------------------------------
function particles(W, H, { count, seed = 7, paint = COLORS.gold, yMax = 0.92 }) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    // Denser toward the bottom (warm glow) but spread everywhere.
    const y = Math.pow(r(), 0.75) * H * yMax;
    const rad = 1.2 + r() * 3.6;
    const op = 0.2 + r() * 0.4;
    out.push(`<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(rad)}" opacity="${op.toFixed(2)}"/>`);
  }
  return `<g fill="${paint}">${out.join("")}</g>`;
}

function crowdBand(W, H, { seed = 11, top = 0.9, fill = "#2a2000", opacity = 0.75 } = {}) {
  const r = rng(seed);
  const pts = [`${0} ${H}`];
  const base = H * top;
  const step = W / 110;
  let x = 0;
  while (x <= W + step) {
    const k = r();
    let y = base + (r() - 0.5) * H * 0.02;
    if (k > 0.86) y -= H * (0.03 + r() * 0.05); // raised arms / flags
    else if (k > 0.5) y -= H * 0.012 * r(); // heads
    pts.push(`${f2(x)} ${f2(y)}`);
    x += step * (0.6 + r() * 0.8);
  }
  pts.push(`${W} ${H}`);
  // A second, nearer band a little lower and darker for depth.
  const r2 = rng(seed + 1);
  const pts2 = [`${0} ${H}`];
  const base2 = H * (top + 0.035);
  x = 0;
  while (x <= W + step) {
    const k = r2();
    let y = base2 + (r2() - 0.5) * H * 0.015;
    if (k > 0.9) y -= H * (0.025 + r2() * 0.04);
    else if (k > 0.45) y -= H * 0.01 * r2();
    pts2.push(`${f2(x)} ${f2(y)}`);
    x += step * (0.7 + r2() * 0.9);
  }
  pts2.push(`${W} ${H}`);
  return `<polygon points="${pts.join(" ")}" fill="${fill}" opacity="${opacity}"/>
<polygon points="${pts2.join(" ")}" fill="#120e00" opacity="0.9"/>`;
}

/** Temple / shikhara silhouette. Anchored with its base centre at (cx, baseY); total height h. */
function temple(cx, baseY, h, { fill = "#1c1608", opacity = 0.7 } = {}) {
  // Stacked trapezoids narrowing upward, then a finial and a small flag.
  const tiers = [
    [0.44, 0.36, 0.18], // [bottom half-width, top half-width, height] as fractions of h
    [0.34, 0.27, 0.2],
    [0.25, 0.18, 0.2],
    [0.16, 0.1, 0.17],
    [0.09, 0.045, 0.12],
  ];
  let y = baseY;
  const shapes = [];
  for (const [b, t, th] of tiers) {
    const yTop = y - h * th;
    shapes.push(
      `<polygon points="${f2(cx - h * b)} ${f2(y)} ${f2(cx + h * b)} ${f2(y)} ${f2(cx + h * t)} ${f2(yTop)} ${f2(cx - h * t)} ${f2(yTop)}"/>`,
    );
    y = yTop;
  }
  // Amalaka disc + kalash finial
  shapes.push(`<ellipse cx="${f2(cx)}" cy="${f2(y)}" rx="${f2(h * 0.06)}" ry="${f2(h * 0.02)}"/>`);
  shapes.push(`<rect x="${f2(cx - h * 0.008)}" y="${f2(y - h * 0.11)}" width="${f2(h * 0.016)}" height="${f2(h * 0.11)}"/>`);
  shapes.push(`<circle cx="${f2(cx)}" cy="${f2(y - h * 0.055)}" r="${f2(h * 0.022)}"/>`);
  // Flag pole + triangular flag
  const poleTop = y - h * 0.24;
  shapes.push(`<rect x="${f2(cx - h * 0.004)}" y="${f2(poleTop)}" width="${f2(h * 0.008)}" height="${f2(h * 0.14)}"/>`);
  shapes.push(`<polygon points="${f2(cx)} ${f2(poleTop)} ${f2(cx + h * 0.11)} ${f2(poleTop + h * 0.035)} ${f2(cx)} ${f2(poleTop + h * 0.07)}"/>`);
  // Side shrines
  shapes.push(`<polygon points="${f2(cx - h * 0.62)} ${f2(baseY)} ${f2(cx - h * 0.34)} ${f2(baseY)} ${f2(cx - h * 0.38)} ${f2(baseY - h * 0.22)} ${f2(cx - h * 0.48)} ${f2(baseY - h * 0.3)} ${f2(cx - h * 0.58)} ${f2(baseY - h * 0.22)}"/>`);
  shapes.push(`<polygon points="${f2(cx + h * 0.34)} ${f2(baseY)} ${f2(cx + h * 0.62)} ${f2(baseY)} ${f2(cx + h * 0.58)} ${f2(baseY - h * 0.22)} ${f2(cx + h * 0.48)} ${f2(baseY - h * 0.3)} ${f2(cx + h * 0.38)} ${f2(baseY - h * 0.22)}"/>`);
  return `<g fill="${fill}" opacity="${opacity}">${shapes.join("")}</g>`;
}

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------
/** Centred spaced-caps line. Returns { body, width, height, top, bottom } around baseline y. */
function capsLine(fontKey, text, { cx, y, size, letterSpacing = 0.2, fill, maxWidth }) {
  let t = textPath(fontKey, text, { size, letterSpacing });
  if (maxWidth && t.bbox.x2 - t.bbox.x1 > maxWidth) {
    size *= maxWidth / (t.bbox.x2 - t.bbox.x1);
    t = textPath(fontKey, text, { size, letterSpacing });
  }
  const w = t.bbox.x2 - t.bbox.x1;
  const x = cx - w / 2 - t.bbox.x1;
  return {
    body: `<path fill="${fill}" transform="translate(${f2(x)} ${f2(y)})" d="${t.d}"/>`,
    width: w,
    top: y + t.bbox.y1,
    bottom: y + t.bbox.y2,
    height: t.bbox.y2 - t.bbox.y1,
  };
}

/** rule — BOOK NOW — rule, centred on cx with the text baseline at y. */
function bookNow({ cx, y, size, ruleWidth, fill }) {
  const t = capsLine("cinzel", "BOOK NOW", { cx, y, size, letterSpacing: 0.3, fill });
  const capH = t.height;
  const midY = y - capH / 2;
  const gap = size * 0.5;
  const dash = size * 0.9;
  const thick = Math.max(2, size * 0.045);
  const halfText = t.width / 2;
  const parts = [t.body];
  for (const dir of [-1, 1]) {
    const dashStart = cx + dir * (halfText + gap);
    const dashEnd = dashStart + dir * dash;
    const ruleStart = dashEnd + dir * gap;
    const ruleEnd = ruleStart + dir * ruleWidth;
    const xa = Math.min(dashStart, dashEnd);
    const xb = Math.min(ruleStart, ruleEnd);
    parts.push(`<rect x="${f2(xa)}" y="${f2(midY - thick / 2)}" width="${f2(dash)}" height="${f2(thick)}" rx="${f2(thick / 2)}" fill="${fill}"/>`);
    parts.push(
      `<rect x="${f2(xb)}" y="${f2(midY - thick / 2)}" width="${f2(ruleWidth)}" height="${f2(thick)}" rx="${f2(thick / 2)}" fill="${fill}" opacity="0.55"/>`,
    );
  }
  return { body: parts.join("\n"), top: t.top, bottom: t.bottom };
}

// ---------------------------------------------------------------------------
// Compositions. Return { defs, body } in canvas coordinates 0..W x 0..H.
// `id` prefixes gradient ids so several compositions can share one SVG (the board).
// ---------------------------------------------------------------------------
export function festivalArt({ width: W, height: H, variant = "banner", id = "fest" }) {
  const gold = paintFor("gold", `${id}Gold`);
  const paint = gold.paint;
  const glowId = `${id}Glow`;
  const vignId = `${id}Vign`;

  const defs = `${gold.defs}
<radialGradient id="${glowId}" cx="0.5" cy="1.02" r="0.78" fx="0.5" fy="1.02">
  <stop offset="0" stop-color="#2a1d00"/>
  <stop offset="0.35" stop-color="#1a1200"/>
  <stop offset="1" stop-color="#050505"/>
</radialGradient>
<radialGradient id="${vignId}" cx="0.5" cy="0.5" r="0.75">
  <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
  <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
</radialGradient>`;

  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="#050505"/>`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#${glowId})"/>`);

  const isBanner = variant === "banner";
  const isStory = variant === "story";

  // Atmosphere
  const templeH = isBanner ? H * 0.42 : isStory ? H * 0.2 : H * 0.22;
  const templeX = isBanner ? W * 0.9 : W * 0.82;
  const crowdTop = isBanner ? 0.9 : isStory ? 0.935 : 0.92;
  parts.push(temple(templeX, H * (crowdTop + 0.02), templeH));
  parts.push(particles(W, H, { count: isBanner ? 260 : isStory ? 300 : 200, seed: 7, paint }));
  parts.push(crowdBand(W, H, { top: crowdTop }));

  // Foreground content
  const motif = ganeshaMotif({ paint });
  const wordFill = paint;
  const lineFill = paint;
  const bookFill = COLORS.goldLight;

  if (isBanner) {
    // Motif on the left ~30%, lockup + copy on the right.
    const motifH = H * 0.7;
    const motifX = W * 0.04;
    const motifBox = place(motif, { x: motifX, y: (H - motifH) / 2 - H * 0.06, height: motifH });
    parts.push(motifBox.body);

    const lock = lockups.horizontal({ fill: "gold", withTagline: false });
    // Re-point the gradient id (core uses #mihirGold) so this composition is self-contained.
    const lockBody = lock.body.replaceAll("url(#mihirGold)", paint);
    const rightLeft = motifX + motifBox.width + W * 0.02;
    const rightW = W * 0.96 - rightLeft;
    const rightCx = rightLeft + rightW / 2;
    const lockW = Math.min(W * 0.48, rightW * 0.92);
    const lockPlaced = place({ ...lock, body: lockBody }, { width: lockW, x: rightCx - lockW / 2, y: H * 0.2 });
    parts.push(lockPlaced.body);

    const lineY = H * 0.2 + lockPlaced.height + H * 0.085;
    const line = capsLine("cinzelBold", FESTIVAL_LINE, {
      cx: rightCx, y: lineY, size: H * 0.034, letterSpacing: 0.2, fill: lineFill, maxWidth: rightW * 0.94,
    });
    parts.push(line.body);

    const bn = bookNow({ cx: rightCx, y: line.bottom + H * 0.085, size: H * 0.03, ruleWidth: W * 0.08, fill: bookFill });
    parts.push(bn.body);
  } else {
    // Stacked: motif, wordmark, festival line, book now.
    const motifH = isStory ? H * 0.31 : H * 0.44;
    const topPad = isStory ? H * 0.14 : H * 0.05;
    const motifBox = place(motif, { x: (W - motifH) / 2, y: topPad, height: motifH });
    parts.push(motifBox.body);

    const word = lockups.wordmark({ fill: "gold" });
    const wordBody = word.body.replaceAll("url(#mihirGold)", paint);
    const wordW = W * (isStory ? 0.66 : 0.6);
    let y = topPad + motifH + (isStory ? H * 0.045 : H * 0.03);
    const wordPlaced = place({ ...word, body: wordBody }, { width: wordW, x: (W - wordW) / 2, y });
    parts.push(wordPlaced.body);
    y += wordPlaced.height + (isStory ? H * 0.04 : H * 0.04);

    const lineSize = W * (isStory ? 0.034 : 0.033);
    const line = capsLine("cinzelBold", FESTIVAL_LINE, { cx: W / 2, y, size: lineSize, letterSpacing: 0.2, fill: lineFill, maxWidth: W * 0.86 });
    parts.push(line.body);

    const bn = bookNow({ cx: W / 2, y: line.bottom + (isStory ? H * 0.05 : H * 0.075), size: W * 0.03, ruleWidth: W * 0.13, fill: bookFill });
    parts.push(bn.body);
  }

  parts.push(`<rect width="${W}" height="${H}" fill="url(#${vignId})"/>`);
  return { defs, body: parts.join("\n") };
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

export const FESTIVAL_FILES = [
  { name: "festival-ganpati-banner-16x9", width: 4000, height: 2250, variant: "banner" },
  { name: "festival-ganpati-square", width: 2160, height: 2160, variant: "square" },
  { name: "festival-ganpati-story", width: 2160, height: 3840, variant: "story" },
];

export async function build({ outDir = path.join(OUT, "11-festival-variation"), log = console.log } = {}) {
  for (const f of FESTIVAL_FILES) {
    const art = festivalArt({ width: f.width, height: f.height, variant: f.variant });
    const svg = document({ ...f, ...art, title: "MIHIR - Ganpati festival campaign" });
    writeSVG(svg, path.join(outDir, `${f.name}.svg`));
    await renderPNG(svg, path.join(outDir, `${f.name}.png`), { width: f.width });
    log(`wrote ${f.name} ${f.width}x${f.height}`);
  }
}

// Motif-only preview used while iterating on the drawing.
export async function previewMotif(outPath) {
  const { paint, defs } = paintFor("gold");
  const m = ganeshaMotif({ paint });
  const svg = document({
    width: 1000,
    height: 1000,
    defs,
    body: `<rect width="1000" height="1000" fill="#050505"/>${m.body}`,
    title: "motif",
  });
  await renderPNG(svg, outPath, { width: 1000 });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--motif") await previewMotif(process.argv[3]);
  else await build();
}
