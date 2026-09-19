import fs from "node:fs";
import { createRequire } from "node:module";
const fontkit = createRequire(import.meta.url)("fontkit");

// Old-browser UA makes the Google Fonts CSS API return static TTF files instead of woff2.
const UA = "Mozilla/5.0 (Windows NT 6.1; rv:5.0) Gecko/20100101 Firefox/5.0";
const css = await (await fetch("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap", { headers: { "User-Agent": UA } })).text();
const blocks = css.split("@font-face").slice(1);
fs.mkdirSync("public/fonts", { recursive: true });
for (const b of blocks) {
  const weight = b.match(/font-weight:\s*(\d+)/)?.[1];
  const url = b.match(/url\((https:[^)]+)\)/)?.[1];
  if (!weight || !url) continue;
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const out = `public/fonts/SpaceGrotesk-${weight}.ttf`;
  fs.writeFileSync(out, buf);
  const f = fontkit.openSync(out);
  console.log(out, buf.length + "B", f.familyName, f.subfamilyName, "rupee:", f.hasGlyphForCodePoint(0x20b9), "×:", f.hasGlyphForCodePoint(0xd7), "•:", f.hasGlyphForCodePoint(0x2022));
}
