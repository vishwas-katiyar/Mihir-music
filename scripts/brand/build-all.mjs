// Rebuild the entire MIHIR brand kit into assets/brand.
// Usage: node scripts/brand/build-all.mjs   (or: npm run brand:build)
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const steps = [
  "build-lockups.mjs", // 01 primary, 02 horizontal, 03 stacked, 04 icon, 05 wordmark, 10 responsive + favicons
  "build-variants.mjs", // 06 monochrome, 07 inverse, 08 avatar, 09 badge, 12 colour variations
  "build-festival.mjs", // 11 festival / event variation
  "build-guide.mjs", // 13 brand colours & typography (+ fonts, colours.json / .css)
  "build-board.mjs", // board/ full corrected brand board
  "build-social-feed.mjs", // 14 social templates: feed square + portrait (+ photo overlays)
  "build-social-story.mjs", // 14 social templates: stories + covers
  "build-social-sheet.mjs", // 14 contact sheet of every social template
  "build-print-card.mjs", // 15 business card front + back
  "build-print-letterhead.mjs", // 15 A4 letterhead
  "build-print-ratecard.mjs", // 15 A5 rate card front + back
  "build-print-standee.mjs", // 15 roll-up standee + step-and-repeat backdrop
  "build-print-sheet.mjs", // 15 contact sheet of every print piece
  "export-site.mjs", // public/ + app/ files used by the website
];

let failed = false;
for (const step of steps) {
  const started = Date.now();
  process.stdout.write(`\n▶ ${step}\n`);
  const r = spawnSync(process.execPath, [path.join(here, step)], { stdio: "inherit" });
  if (r.status !== 0) {
    failed = true;
    console.error(`✖ ${step} exited with ${r.status}`);
    break;
  }
  console.log(`✔ ${step} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
}
process.exit(failed ? 1 : 0);
