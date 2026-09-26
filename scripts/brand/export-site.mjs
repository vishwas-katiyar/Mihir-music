// Export the site-facing brand files into public/ (plus app/opengraph-image.png and app/twitter-image.png) from the kit masters.
// favicon.ico deliberately lives in public/, not app/: Next hashes app/favicon.ico into a query string, and Google
// wants a stable favicon URL. Google also ignores SVG favicons, so the PNG sizes here are the ones Search can use.
// Run after `node scripts/brand/build-all.mjs`, or via `npm run brand:site`.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { lockups, place, textPath, paintFor, COLORS } from "./core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const kit = path.join(root, "assets", "brand");
const pub = path.join(root, "public");

async function svgToPng(svgFile, outFile, width, { background } = {}) {
  const svg = fs.readFileSync(svgFile);
  const m = svg.toString().match(/<svg[^>]*\swidth="([\d.]+)"/);
  const svgW = m ? parseFloat(m[1]) : 1000;
  let img = sharp(svg, { density: (72 * width) / svgW }).resize({ width });
  if (background) img = img.flatten({ background });
  await img.png({ compressionLevel: 9 }).toFile(outFile);
  return outFile;
}
const copy = (from, to) => {
  fs.copyFileSync(from, to);
  return to;
};

const jobs = [
  // Round/square avatars in nav, footer, admin shell, manifest, apple icon, schema.org logo
  () => svgToPng(path.join(kit, "08-social-media-avatar/avatar-square-gold-on-black.svg"), path.join(pub, "logo.png"), 512, { background: "#000000" }),
  () => svgToPng(path.join(kit, "08-social-media-avatar/avatar-square-gold-on-black.svg"), path.join(pub, "favicon-96.png"), 96, { background: "#000000" }),
  () => svgToPng(path.join(kit, "08-social-media-avatar/avatar-square-gold-on-black.svg"), path.join(pub, "icon-192.png"), 192, { background: "#000000" }),
  () => svgToPng(path.join(kit, "08-social-media-avatar/avatar-square-gold-on-black.svg"), path.join(pub, "icon-512.png"), 512, { background: "#000000" }),
  // Gold monogram on transparent: seals, dark surfaces
  () => svgToPng(path.join(kit, "04-icon-mark/icon-mark-gold-transparent.svg"), path.join(pub, "logo-mark.png"), 512),
  // Black monogram on transparent: white invoice surfaces
  () => svgToPng(path.join(kit, "06-monochrome-logo/monochrome-icon-black-transparent.svg"), path.join(pub, "logo-mark-black.png"), 512),
  // Lockups for navbar / footer / share card
  () => copy(path.join(kit, "05-wordmark/wordmark-gold-transparent.svg"), path.join(pub, "wordmark.svg")),
  () => copy(path.join(kit, "02-horizontal-logo/horizontal-logo-gold-transparent.svg"), path.join(pub, "logo-horizontal.svg")),
  () => svgToPng(path.join(kit, "02-horizontal-logo/horizontal-logo-gold-transparent.svg"), path.join(pub, "logo-horizontal.png"), 1600),
  () => svgToPng(path.join(kit, "01-primary-logo/primary-logo-gold-transparent.svg"), path.join(pub, "logo-primary.png"), 1200),
  // Stage-banner texture for the 3D rigs (components/3d/TrussBanner.tsx): 1024 px is all a phone GPU should carry
  () => svgToPng(path.join(kit, "02-horizontal-logo/horizontal-logo-gold-transparent.svg"), path.join(pub, "logo-banner.png"), 1024),
  // Favicons
  () => copy(path.join(kit, "10-responsive-logo/favicon/favicon.svg"), path.join(pub, "favicon.svg")),
  () => copy(path.join(kit, "10-responsive-logo/favicon/favicon.ico"), path.join(pub, "favicon.ico")),
  () => copy(path.join(kit, "10-responsive-logo/favicon/favicon-180.png"), path.join(pub, "apple-touch-icon.png")),
];

/** Static OpenGraph / Twitter card (1200x630): primary lockup on brand black with a soft gold glow. */
async function ogCard() {
  const W = 1200, H = 630;
  const { defs, paint } = paintFor("gold");
  const logo = place(lockups.primary({ fill: "gold" }), { width: 620 });
  const left = textPath("montserratSemi", "INDORE  ·  PAN-INDIA  ·  SINCE 2012", { size: 19, letterSpacing: 0.18 });
  const right = textPath("montserratSemi", "+91 70000 51042", { size: 19, letterSpacing: 0.12 });
  const rw = right.bbox.x2 - right.bbox.x1;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>${defs}
<radialGradient id="glow" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#D4AF37" stop-opacity="0.18"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="#000"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<g transform="translate(${((W - logo.width) / 2).toFixed(1)} ${((H - 60 - logo.height) / 2).toFixed(1)})">${logo.body}</g>
<rect x="72" y="${H - 96}" width="${W - 144}" height="1" fill="#D4AF37" opacity="0.35"/>
<path fill="${paint}" transform="translate(${72 - left.bbox.x1} ${H - 52})" d="${left.d}"/>
<path fill="${COLORS.white}" transform="translate(${W - 72 - rw - right.bbox.x1} ${H - 52})" d="${right.d}"/>
</svg>`;
  const out = path.join(root, "app", "opengraph-image.png");
  await sharp(Buffer.from(svg), { density: 144 }).resize({ width: W }).flatten({ background: "#000" }).png({ compressionLevel: 9 }).toFile(out);
  fs.writeFileSync(path.join(root, "app", "opengraph-image.alt.txt"), "Mihir Sound & Light - Sound & Light | Event | Production");
  fs.copyFileSync(out, path.join(root, "app", "twitter-image.png"));
  fs.writeFileSync(path.join(root, "app", "twitter-image.alt.txt"), "Mihir Sound & Light - Sound & Light | Event | Production");
  return out;
}
jobs.push(ogCard);

for (const job of jobs) {
  const out = await job();
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`wrote ${path.relative(root, out)} (${kb} KB)`);
}
