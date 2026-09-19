import fs from "node:fs";
import { createRequire } from "node:module";
const fontkit = createRequire(import.meta.url)("fontkit");

/**
 * Downloads the static TTFs the invoice PDF embeds into public/fonts.
 *   Inter          body and numerals of the invoice (neutral, tabular figures, has the rupee glyph)
 *   Space Grotesk  brand name only, matches the website
 * An old-browser User-Agent makes the Google Fonts CSS API return TTF instead of woff2.
 */
const UA = "Mozilla/5.0 (Windows NT 6.1; rv:5.0) Gecko/20100101 Firefox/5.0";
const FAMILIES = [
  { query: "Inter:wght@400;500;600;700", file: "Inter" },
  { query: "Space+Grotesk:wght@400;500;700", file: "SpaceGrotesk" },
];

fs.mkdirSync("public/fonts", { recursive: true });
for (const fam of FAMILIES) {
  const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`, { headers: { "User-Agent": UA } })).text();
  for (const b of css.split("@font-face").slice(1)) {
    const weight = b.match(/font-weight:\s*(\d+)/)?.[1];
    const url = b.match(/url\((https:[^)]+)\)/)?.[1];
    if (!weight || !url) continue;
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    const out = `public/fonts/${fam.file}-${weight}.ttf`;
    fs.writeFileSync(out, buf);
    const f = fontkit.openSync(out);
    console.log(out, buf.length + "B", f.familyName, f.subfamilyName, "rupee:", f.hasGlyphForCodePoint(0x20b9), "×:", f.hasGlyphForCodePoint(0xd7), "•:", f.hasGlyphForCodePoint(0x2022));
  }
}
