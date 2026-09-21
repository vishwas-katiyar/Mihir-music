import fs from "node:fs";
import path from "node:path";

/** Root of the generated brand kit (logos, socials, print collateral - see assets/brand/README.md). */
export const BRAND_KIT_DIR = path.join(process.cwd(), "assets", "brand");

const LABEL_OVERRIDES: Record<string, string> = {
  board: "Corrected Brand Board",
  _source: "Original Source Images",
};

function titleCase(slug: string): string {
  return slug
    .replace(/^\d+-/, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function dirSize(dir: string): number {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    total += entry.isDirectory() ? dirSize(full) : fs.statSync(full).size;
  }
  return total;
}

export interface BrandKitFolder {
  /** Directory name under assets/brand - also the `folder` query value for the download route. */
  slug: string;
  label: string;
  sizeBytes: number;
  fileCount: number;
}

function countFiles(dir: string): number {
  let n = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    n += entry.isDirectory() ? countFiles(path.join(dir, entry.name)) : 1;
  }
  return n;
}

/** Top-level folders under assets/brand, for listing on the admin download page. */
export function listBrandKitFolders(): BrandKitFolder[] {
  if (!fs.existsSync(BRAND_KIT_DIR)) return [];
  return fs
    .readdirSync(BRAND_KIT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const full = path.join(BRAND_KIT_DIR, e.name);
      return {
        slug: e.name,
        label: LABEL_OVERRIDES[e.name] ?? titleCase(e.name),
        sizeBytes: dirSize(full),
        fileCount: countFiles(full),
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export function totalBrandKitSize(): { sizeBytes: number; fileCount: number } {
  if (!fs.existsSync(BRAND_KIT_DIR)) return { sizeBytes: 0, fileCount: 0 };
  return { sizeBytes: dirSize(BRAND_KIT_DIR), fileCount: countFiles(BRAND_KIT_DIR) };
}

/** Resolve a `folder` query value to a real, contained subdirectory - never outside BRAND_KIT_DIR. */
export function resolveBrandKitFolder(slug: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(slug)) return null;
  const full = path.join(BRAND_KIT_DIR, slug);
  if (path.dirname(full) !== BRAND_KIT_DIR) return null; // reject traversal
  if (!fs.existsSync(full) || !fs.statSync(full).isDirectory()) return null;
  return full;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v >= 10 ? 0 : 1)} ${units[i]}`;
}
