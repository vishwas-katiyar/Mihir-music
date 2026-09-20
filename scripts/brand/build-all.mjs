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
