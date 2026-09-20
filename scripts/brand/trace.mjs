// Trace a raster logo (gold/white on dark, or dark on light) into clean SVG path data.
//
//   node scripts/brand/trace.mjs <input image> <name> [--threshold 0.42] [--upscale 3000] [--invert]
//
// Writes scripts/brand/traced/<name>.json  { d, width, height, bbox }  and a preview
// scripts/brand/traced/<name>.preview.svg so the result can be checked visually.
// core.mjs picks up traced/monogram.json and traced/wordmark.json automatically.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import potrace from "potrace";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const input = args[0];
const name = args[1];
if (!input || !name) {
  console.error("usage: node scripts/brand/trace.mjs <image> <name> [--threshold 0.42] [--upscale 3000] [--invert] [--crop x,y,w,h]");
  process.exit(1);
}
const opt = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const threshold = parseFloat(opt("--threshold", "0.42"));
const upscale = parseInt(opt("--upscale", "3000"), 10);
const forceInvert = args.includes("--invert");
const crop = opt("--crop", null);
const blur = parseFloat(opt("--blur", "0"));
const mask = opt("--mask", null); // "x,y,w,h;x,y,w,h" in crop-relative source pixels -> painted background

export async function traceImage(file, { threshold = 0.42, upscale = 3000, invert = null, crop = null, blur = 0, mask = null } = {}) {
  let img = sharp(file).ensureAlpha();
  if (crop) {
    const [left, top, width, height] = crop.split(",").map((n) => parseInt(n, 10));
    img = img.extract({ left, top, width, height });
  }
  // Composite over black first so transparent inputs behave like gold-on-black.
  const meta = await img.metadata();
  const scale = upscale / (crop ? parseInt(crop.split(",")[2], 10) : meta.width);
  let grey = img
    .flatten({ background: "#000000" })
    .resize({ width: upscale, kernel: "lanczos3" })
    .greyscale();
  if (blur > 0) grey = grey.blur(blur);
  const { data, info } = await grey.raw().toBuffer({ resolveWithObject: true });
  const masks = mask ? mask.split(";").map((m) => m.split(",").map((n) => Math.round(parseFloat(n) * scale))) : [];

  // Decide polarity from the border: bright border => dark foreground.
  if (invert === null) {
    let sum = 0;
    let n = 0;
    const step = Math.max(1, Math.floor(info.width / 200));
    for (let x = 0; x < info.width; x += step) {
      sum += data[x] + data[(info.height - 1) * info.width + x];
      n += 2;
    }
    for (let y = 0; y < info.height; y += step) {
      sum += data[y * info.width] + data[y * info.width + info.width - 1];
      n += 2;
    }
    invert = sum / n > 128; // light background -> foreground is dark
  }

  // Paint masked rectangles with the background luminance so stray neighbours vanish.
  for (const [mx, my, mw, mh] of masks) {
    for (let y = Math.max(0, my); y < Math.min(info.height, my + mh); y++) {
      for (let x = Math.max(0, mx); x < Math.min(info.width, mx + mw); x++) data[y * info.width + x] = invert ? 255 : 0;
    }
  }
  // Build a hard black-on-white bitmap for potrace.
  const cut = Math.round(threshold * 255);
  const bin = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const fg = invert ? v < cut : v > cut;
    bin[i] = fg ? 0 : 255;
  }
  const bitmapPng = await sharp(bin, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();

  const d = await new Promise((resolve, reject) => {
    const t = new potrace.Potrace({
      threshold: 128,
      blackOnWhite: true,
      turdSize: Math.max(4, Math.round(upscale / 8)), // drop stray specks; real strokes are connected to the main shape
      optCurve: true,
      optTolerance: 0.25,
      alphaMax: 1.0,
      turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
    });
    t.loadImage(bitmapPng, (err) => {
      if (err) return reject(err);
      const tag = t.getPathTag();
      const m = tag.match(/ d="([^"]+)"/);
      resolve(m ? m[1] : "");
    });
  });

  // Bounding box from the traced path itself (specks dropped by potrace must not count).
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  const nums = d.replace(/[A-Za-z]/g, " ").trim().split(/[\s,]+/).map(Number);
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i], y = nums[i + 1];
    if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y;
  }
  x1 = Math.floor(x1); y1 = Math.floor(y1); x2 = Math.ceil(x2); y2 = Math.ceil(y2);
  return { d, width: info.width, height: info.height, bbox: { x1, y1, x2, y2 }, invert, scale };
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1].endsWith("trace.mjs")) {
  const res = await traceImage(input, { threshold, upscale, invert: forceInvert ? true : null, crop, blur, mask });
  const outDir = path.join(here, "traced");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(res));
  const { x1, y1, x2, y2 } = res.bbox;
  const preview = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x1 - 20} ${y1 - 20} ${x2 - x1 + 40} ${y2 - y1 + 40}" width="${Math.round((x2 - x1 + 40) / 2)}">
<rect x="${x1 - 20}" y="${y1 - 20}" width="${x2 - x1 + 40}" height="${y2 - y1 + 40}" fill="#000"/>
<path d="${res.d}" fill="#D4AF37" fill-rule="evenodd"/>
</svg>`;
  fs.writeFileSync(path.join(outDir, `${name}.preview.svg`), preview);
  await sharp(Buffer.from(preview)).png().toFile(path.join(outDir, `${name}.preview.png`));
  console.log(`traced ${name}: bitmap ${res.width}x${res.height}, bbox ${x1},${y1} → ${x2},${y2}, path ${Math.round(res.d.length / 1024)} KB, polarity ${res.invert ? "dark-on-light" : "light-on-dark"}`);
}
