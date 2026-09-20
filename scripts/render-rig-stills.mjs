#!/usr/bin/env node
/**
 * Render one still per show format from the live 3D estimator scene, using headless Chrome
 * against the running dev server, then encode with sharp into public/media/.
 *
 *   npm run dev            (in another terminal)
 *   node scripts/render-rig-stills.mjs [--format wedding] [--out public/media] [--size 1800]
 *
 * Camera angles per format live in CAMERAS below. The page is app/dev/rig-still (dev only).
 * Chrome renders WebGL through SwiftShader here, so each frame is slow; the virtual-time
 * budget gives the scene time to settle (beam sweep, deck easing, haze) before the capture.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);

const BASE = args.base ?? "http://localhost:3000";
const OUT = path.resolve(args.out ?? "public/media");
const SIZE = Number(args.size ?? 1800);
const ONLY = args.format;

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));
if (!CHROME) throw new Error("No Chrome or Edge found for headless rendering.");

/** azimuth: side angle in radians (0 = dead centre); polar: angle from vertical (smaller = higher camera); zoom: distance multiplier. */
const CAMERAS = {
  wedding: { az: 0.38, polar: 1.22, zoom: 0.92 },
  concert: { az: -0.3, polar: 1.18, zoom: 1.0 },
  corporate: { az: 0.28, polar: 1.28, zoom: 0.95 },
  club: { az: -0.42, polar: 1.3, zoom: 0.9 },
};

function run(cmd, argv, timeoutMs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, argv, { stdio: ["ignore", "pipe", "pipe"] });
    let err = "";
    child.stderr.on("data", (d) => (err += d));
    const t = setTimeout(() => {
      child.kill();
      reject(new Error(`timeout after ${timeoutMs} ms\n${err.slice(-800)}`));
    }, timeoutMs);
    child.on("exit", (code) => {
      clearTimeout(t);
      code === 0 ? resolve(err) : reject(new Error(`exit ${code}\n${err.slice(-800)}`));
    });
  });
}

await mkdir(OUT, { recursive: true });

for (const [format, cam] of Object.entries(CAMERAS)) {
  if (ONLY && ONLY !== format) continue;
  const url = `${BASE}/dev/rig-still?format=${format}&az=${cam.az}&polar=${cam.polar}&zoom=${cam.zoom}`;
  const raw = path.join(OUT, `rig-${format}.raw.png`);
  const profile = path.join(OUT, `.chrome-${format}`);
  process.stdout.write(`rendering ${format} ... `);
  await run(
    CHROME,
    [
      "--headless=new",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--disable-extensions",
      "--hide-scrollbars",
      "--ignore-gpu-blocklist",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--force-device-scale-factor=1",
      `--window-size=${SIZE},${SIZE}`,
      "--virtual-time-budget=20000",
      "--timeout=120000",
      `--screenshot=${raw}`,
      url,
    ],
    180_000,
  );
  await rm(profile, { recursive: true, force: true });

  const img = sharp(await readFile(raw));
  const meta = await img.metadata();
  await img
    .clone()
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, `rig-${format}.jpg`));
  process.stdout.write(`${meta.width}x${meta.height} -> rig-${format}.jpg\n`);
}
console.log(`done -> ${OUT}`);
