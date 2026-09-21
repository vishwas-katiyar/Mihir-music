// Contact sheet of every print collateral PNG (proof/guides versions preferred so
// bleed and trim are visible). Output: assets/brand/15-print-collateral/contact-sheet.png
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { OUT, textPath } from "./core.mjs";

const root = path.join(OUT, "15-print-collateral");
const cellH = 460;
const gap = 30;
const pad = 60;
const sheetW = 2400;

function collect() {
  const items = [];
  const card = path.join(root, "business-card");
  const rate = path.join(root, "rate-card");
  const letter = path.join(root, "letterhead");
  const large = path.join(root, "large-format");
  if (fs.existsSync(card)) {
    items.push({ group: "business-card", name: "front", file: path.join(card, "business-card-front-guides.png") });
    items.push({ group: "business-card", name: "back", file: path.join(card, "business-card-back-guides.png") });
  }
  if (fs.existsSync(letter)) items.push({ group: "letterhead", name: "a4", file: path.join(letter, "letterhead-a4.png") });
  if (fs.existsSync(rate)) {
    items.push({ group: "rate-card", name: "front", file: path.join(rate, "rate-card-front-guides.png") });
    items.push({ group: "rate-card", name: "back", file: path.join(rate, "rate-card-back-guides.png") });
  }
  if (fs.existsSync(large)) {
    items.push({ group: "large-format", name: "standee", file: path.join(large, "standee-850x2000mm.png") });
    items.push({ group: "large-format", name: "backdrop", file: path.join(large, "backdrop-6x3ft.png") });
  }
  return items.filter((i) => fs.existsSync(i.file));
}

const tiles = collect();
if (!tiles.length) {
  console.log("no print collateral found yet");
  process.exit(0);
}

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

const labelH = 34;
const sheetH = pad * 2 + 110 + rows.length * (cellH + labelH + gap);
const comps = [];
const labels = [];
let y = pad + 110;
for (const r of rows) {
  let cx = pad;
  for (const t of r) {
    comps.push({ input: await sharp(t.file).resize({ height: cellH }).png().toBuffer(), left: cx, top: y });
    labels.push({ text: `${t.group} / ${t.name}`, x: cx, y: y + cellH + 26, max: t.w });
    cx += t.w + gap;
  }
  y += cellH + labelH + gap;
}

const title = textPath("cinzel", "MIHIR PRINT COLLATERAL", { size: 50, letterSpacing: 0.2 });
const labelPaths = labels
  .map((l) => {
    let txt = l.text;
    let tp = textPath("montserrat", txt, { size: 16 });
    while (tp.advance > l.max && txt.length > 6) {
      txt = txt.slice(0, -4) + "…";
      tp = textPath("montserrat", txt, { size: 16 });
    }
    return `<path fill="#A9A38F" transform="translate(${l.x} ${l.y})" d="${tp.d}"/>`;
  })
  .join("\n");
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}">
<path fill="#D4AF37" transform="translate(${pad} ${pad + 50})" d="${title.d}"/>
${labelPaths}
</svg>`;

await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: "#0B0B0B" } })
  .composite([...comps, { input: Buffer.from(overlay), left: 0, top: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "contact-sheet.png"));
console.log(`wrote 15-print-collateral/contact-sheet.png (${tiles.length} pieces, ${sheetW}x${sheetH})`);
