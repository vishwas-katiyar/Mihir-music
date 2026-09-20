// Build the MIHIR logo lockup family from the shared design core:
//   01-primary-logo, 02-horizontal-logo, 03-stacked-logo, 04-icon-mark,
//   05-wordmark and 10-responsive-logo (incl. the favicon set + favicon.ico).
//
//   node scripts/brand/build-lockups.mjs
//
// Every mark is written as an SVG master (text already outlined by core.mjs,
// so no font dependency) plus a 4000 px wide PNG. Transparent variants have
// background:null; "on-black" variants sit on COLORS.black.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  COLORS,
  TAGLINE,
  lockups,
  place,
  svgDocument,
  renderPNG,
  writeSVG,
  textPath,
  paintFor,
  OUT,
} from "./core.mjs";

const PNG_WIDTH = 4000;
const produced = [];

// ---------------------------------------------------------------------------
// Small helpers (local to this script; core geometry is untouched)
// ---------------------------------------------------------------------------

/** Scale a mark so it fits inside boxW x boxH (keeps aspect). */
function fit(mark, boxW, boxH) {
  const s = Math.min(boxW / mark.width, boxH / mark.height);
  return place(mark, { width: mark.width * s });
}

/** Write <folder>/<name>.svg and .png for a lockup. */
async function emit(folder, name, lockup, { background = null, square = false, padding = 0.08, png = true, pngWidth = PNG_WIDTH } = {}) {
  const dir = path.join(OUT, folder);
  const svg = svgDocument({ ...lockup, background, square, padding, fill: "gold" });
  produced.push(writeSVG(svg, path.join(dir, `${name}.svg`)));
  if (png) produced.push(await renderPNG(svg, path.join(dir, `${name}.png`), { width: pngWidth }));
  return svg;
}

/** Emit the usual pair: gold-on-black + gold-transparent. */
async function emitPair(folder, base, lockup, opts = {}) {
  await emit(folder, `${base}-gold-on-black`, lockup, { ...opts, background: COLORS.black });
  await emit(folder, `${base}-gold-transparent`, lockup, { ...opts, background: null });
}

/** The plain "M" letter only (no swash), tight box. Used for the favicon. */
function plainM({ fill = "gold", size = 1000 } = {}) {
  const { paint } = paintFor(fill);
  const m = textPath("cinzelDecoBlack", "M", { size });
  const w = m.bbox.x2 - m.bbox.x1;
  const h = m.bbox.y2 - m.bbox.y1;
  const body = `<path fill="${paint}" transform="translate(${(-m.bbox.x1).toFixed(2)} ${(-m.bbox.y1).toFixed(2)})" d="${m.d}"/>`;
  return { body, width: w, height: h };
}

/**
 * Stacked / vertical lockup. Same architecture as lockups.primary() but the
 * wordmark and tagline run slightly narrower relative to the monogram, which
 * gives a taller, more column-like silhouette. Everything is centred on W.
 */
function stacked(opts = {}) {
  return lockups.stacked(opts);
}

/** Wordmark with the tagline centred beneath it. */
function wordmarkWithTagline({ fill = "gold" } = {}) {
  const word = lockups.wordmark({ fill });
  const tag = place(lockups.tagline({ fill }), { width: word.width * 0.82 });
  const gap = Math.round(word.width * 0.05);
  const y = word.height + gap;
  const body = [
    place(word, { x: 0, y: 0 }).body,
    place(tag, { x: (word.width - tag.width) / 2, y }).body,
  ].join("\n");
  return { body, width: word.width, height: y + tag.height };
}

/**
 * Favicon tile as a mark in a 1000-unit local box: rounded square with the
 * plain M centred. `tile` is the square colour (black for real favicons,
 * charcoal when shown on a black sheet so the tile stays visible).
 */
function faviconTile({ fill = "gold", tile = COLORS.black, rounded = true, outline = false } = {}) {
  const S = 1000;
  const m = plainM({ fill, size: 1000 });
  const s = Math.min((S * 0.62) / m.height, (S * 0.76) / m.width);
  const mw = m.width * s;
  const mh = m.height * s;
  const x = (S - mw) / 2;
  const y = (S - mh) / 2 + S * 0.012; // optical centre: nudge the cap slightly down
  const { paint } = paintFor(fill);
  const rx = rounded ? S * 0.1875 : 0; // 12/64
  const body = [
    `<rect width="${S}" height="${S}" rx="${rx.toFixed(1)}" fill="${tile}"${outline ? ` stroke="${paint}" stroke-width="6" stroke-opacity="0.55"` : ""}/>`,
    `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(5)})">${m.body}</g>`,
  ].join("\n");
  return { body, width: S, height: S };
}

/** Stand-alone favicon SVG with viewBox 0 0 64 64 (no padding). */
function faviconSVG({ rounded = true } = {}) {
  const tile = faviconTile({ tile: COLORS.black, rounded });
  const { defs } = paintFor("gold");
  const inner = place(tile, { width: 64 }).body;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
<title>MIHIR</title>
<defs>
${defs}
</defs>
${inner}
</svg>`;
}

/** Render a square SVG to a size x size PNG buffer (supersampled, then lanczos). */
async function renderSquarePNG(svg, size) {
  const svgW = parseFloat(svg.match(/<svg[^>]*\swidth="([\d.]+)"/)[1]);
  const density = (72 * 1024) / svgW; // supersample to 1024, then downsample
  return sharp(Buffer.from(svg), { density })
    .resize(size, size, { kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * Minimal ICO encoder using PNG-compressed entries (valid since Windows Vista).
 * ICONDIR (6 bytes) + ICONDIRENTRY (16 bytes) per image + raw PNG bytes.
 */
function encodeICO(images /* [{ size, buf }] */) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, buf } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 = 256)
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2); // colour count (0 = no palette)
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8); // bytes in resource
    e.writeUInt32LE(offset, 12); // offset from start of file
    offset += buf.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

/** Small centred Cinzel label as a mark. */
function label(text, { size = 46, fontKey = "cinzel", letterSpacing = 0.12, paint, opacity = 1 } = {}) {
  const t = textPath(fontKey, text, { size, letterSpacing });
  const w = t.bbox.x2 - t.bbox.x1;
  const h = t.bbox.y2 - t.bbox.y1;
  const body = `<path fill="${paint}" opacity="${opacity}" transform="translate(${(-t.bbox.x1).toFixed(2)} ${(-t.bbox.y1).toFixed(2)})" d="${t.d}"/>`;
  return { body, width: w, height: h };
}

/**
 * Brand-guide panel: the four responsive sizes side by side, each captioned,
 * separated by thin chevrons.
 */
function responsiveSheet() {
  const { paint } = paintFor("gold");
  const rowH = 1000; // artwork row height
  const cells = [
    { title: "Full Logo (Large)", hint: "240 px and wider", mark: fit(lockups.primary(), 1350, rowH) },
    { title: "Wordmark (Medium)", hint: "120 to 240 px", mark: fit(lockups.wordmark(), 980, rowH) },
    { title: "Icon (Small)", hint: "48 to 120 px", mark: fit(lockups.icon(), 560, 560) },
    { title: "Favicon (Extra Small)", hint: "16 to 48 px", mark: fit(faviconTile({ tile: COLORS.charcoal, outline: true }), 300, 300) },
  ];
  const sepW = 260; // room for the chevron between cells
  const cellPad = 60;
  const parts = [];
  let x = 0;
  cells.forEach((c, i) => {
    const t = label(c.title, { paint, size: 48 });
    const h = label(c.hint, { paint, size: 30, letterSpacing: 0.16, opacity: 0.55 });
    const cellW = Math.max(c.mark.width, t.width, h.width) + cellPad * 2;
    const cx = x + cellW / 2;
    // artwork, vertically centred in the row
    parts.push(place(c.mark, { x: cx - c.mark.width / 2, y: (rowH - c.mark.height) / 2 }).body);
    // caption + hint beneath
    parts.push(place(t, { x: cx - t.width / 2, y: rowH + 90 }).body);
    parts.push(place(h, { x: cx - h.width / 2, y: rowH + 90 + t.height + 34 }).body);
    x += cellW;
    if (i < cells.length - 1) {
      const sx = x + sepW / 2;
      const sy = rowH / 2;
      parts.push(
        `<path d="M${(sx - 22).toFixed(1)} ${(sy - 60).toFixed(1)} L${(sx + 22).toFixed(1)} ${sy.toFixed(1)} L${(sx - 22).toFixed(1)} ${(sy + 60).toFixed(1)}" fill="none" stroke="${paint}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>`,
      );
      x += sepW;
    }
  });
  // a hairline rule under the artwork row ties the panel together
  parts.unshift(`<rect x="0" y="${(rowH + 40).toFixed(1)}" width="${x.toFixed(1)}" height="2" fill="${paint}" opacity="0.25"/>`);
  return { body: parts.join("\n"), width: x, height: rowH + 90 + 48 + 34 + 30 + 20 };
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
async function main() {
  if (!TAGLINE.startsWith("SOUND & LIGHT")) throw new Error("Unexpected tagline in core.mjs");

  // 01 primary
  await emitPair("01-primary-logo", "primary-logo", lockups.primary());

  // 02 horizontal
  await emitPair("02-horizontal-logo", "horizontal-logo", lockups.horizontal());
  await emit("02-horizontal-logo", "horizontal-logo-no-tagline-gold-transparent", lockups.horizontal({ withTagline: false }));

  // 03 stacked
  await emitPair("03-stacked-logo", "stacked-logo", stacked());

  // 04 icon (square documents)
  await emitPair("04-icon-mark", "icon-mark", lockups.icon(), { square: true });

  // 05 wordmark
  await emitPair("05-wordmark", "wordmark", lockups.wordmark());
  await emitPair("05-wordmark", "wordmark-with-tagline", wordmarkWithTagline());

  // 10 responsive system
  const R = "10-responsive-logo";
  // (full / wordmark / icon at other sizes are the same files as folders 01, 05 and 04 - not duplicated here)
  await emit(R, "responsive-favicon-extra-small-gold-transparent", plainM(), { square: true, png: false });

  // favicon set
  const favDir = path.join(OUT, R, "favicon");
  fs.mkdirSync(favDir, { recursive: true });
  const favSVG = faviconSVG({ rounded: true });
  const favSquareSVG = faviconSVG({ rounded: false }); // apple-touch: iOS masks its own corners
  produced.push(writeSVG(favSVG, path.join(favDir, "favicon.svg")));
  const pngs = {};
  for (const size of [16, 32, 48, 192, 512]) {
    pngs[size] = await renderSquarePNG(favSVG, size);
    const p = path.join(favDir, `favicon-${size}.png`);
    fs.writeFileSync(p, pngs[size]);
    produced.push(p);
  }
  {
    const p = path.join(favDir, "favicon-180.png");
    fs.writeFileSync(p, await renderSquarePNG(favSquareSVG, 180));
    produced.push(p);
  }
  {
    const ico = encodeICO([16, 32, 48].map((size) => ({ size, buf: pngs[size] })));
    const p = path.join(favDir, "favicon.ico");
    fs.writeFileSync(p, ico);
    produced.push(p);
  }

  // responsive sheet
  await emit(R, "responsive-logo-sheet-gold-on-black", responsiveSheet(), { background: COLORS.black, padding: 0.06 });

  // ---- report ----
  console.log(`\n${produced.length} files written under ${OUT}\n`);
  for (const p of produced) {
    const rel = path.relative(OUT, p).replaceAll("\\", "/");
    const size = fs.statSync(p).size;
    let dims = "";
    if (p.endsWith(".svg")) {
      const m = fs.readFileSync(p, "utf8").match(/<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/);
      if (m) dims = `${m[1]} x ${m[2]}`;
    } else if (p.endsWith(".png")) {
      const md = await sharp(p).metadata();
      dims = `${md.width} x ${md.height}${md.hasAlpha ? " (alpha)" : ""}`;
    } else if (p.endsWith(".ico")) {
      const buf = fs.readFileSync(p);
      dims = `${buf.readUInt16LE(4)} entries`;
    }
    console.log(`${rel.padEnd(78)} ${dims.padEnd(22)} ${(size / 1024).toFixed(1).padStart(8)} KB`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
