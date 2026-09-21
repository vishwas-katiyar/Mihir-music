// Contact sheet of every social template PNG (skips -overlay files, which are transparent).
// Output: assets/brand/14-social-media-templates/contact-sheet.png
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { OUT, textPath } from "./core.mjs";

const root = path.join(OUT, "14-social-media-templates");
const groups = ["feed-square", "feed-portrait", "story", "covers"];
const cellH = 420;
const gap = 28;
const pad = 60;
const labelH = 44;
const sheetW = 2400;

const tiles = [];
for (const g of groups) {
  const dir = path.join(root, g);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".png") && !f.includes("overlay")).sort()) {
    tiles.push({ group: g, file: path.join(dir, f), name: f.replace(/\.png$/, "") });
  }
}
if (!tiles.length) {
  console.log("no social templates found yet");
  process.exit(0);
}

// Lay tiles in rows, scaling each to cellH tall, wrapping at sheetW.
const rows = [];
let row = [];
let x = pad;
for (const t of tiles) {
  const meta = await sharp(t.file).metadata();
  const w = Math.round((meta.width / meta.height) * cellH);
  if (row.length && x + w > sheetW - pad) {
    rows.push(row);
    row = [];
    x = pad;
  }
  row.push({ ...t, w });
  x += w + gap;
}
if (row.length) rows.push(row);

const sheetH = pad * 2 + 120 + rows.length * (cellH + labelH + gap);
const comps = [];
const labels = [];
let y = pad + 120;
for (const r of rows) {
  let cx = pad;
  for (const t of r) {
    comps.push({ input: await sharp(t.file).resize({ height: cellH }).png().toBuffer(), left: cx, top: y });
    labels.push({ text: `${t.group} / ${t.name}`, x: cx, y: y + cellH + 30, max: t.w });
    cx += t.w + gap;
  }
  y += cellH + labelH + gap;
}

const title = textPath("cinzel", "MIHIR SOCIAL TEMPLATES", { size: 54, letterSpacing: 0.22 });
const labelPaths = labels
  .map((l) => {
    let txt = l.text;
    let tp = textPath("montserrat", txt, { size: 17 });
    while (tp.advance > l.max && txt.length > 8) {
      txt = txt.slice(0, -4) + "…";
      tp = textPath("montserrat", txt, { size: 17 });
    }
    return `<path fill="#A9A38F" transform="translate(${l.x} ${l.y})" d="${tp.d}"/>`;
  })
  .join("\n");
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}">
<path fill="#D4AF37" transform="translate(${pad} ${pad + 54})" d="${title.d}"/>
${labelPaths}
</svg>`;

await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: "#0B0B0B" } })
  .composite([...comps, { input: Buffer.from(overlay), left: 0, top: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "contact-sheet.png"));
console.log(`wrote 14-social-media-templates/contact-sheet.png (${tiles.length} templates, ${sheetW}x${sheetH})`);
