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

/** Human label for a top-level folder slug (e.g. "05-wordmark" -> "Wordmark"). */
export function folderLabel(slug: string): string {
  return LABEL_OVERRIDES[slug] ?? titleCase(slug);
}

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "svg", "webp", "gif", "ico"]);

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
        label: folderLabel(e.name),
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

export interface BrandKitFile {
  /** Path relative to BRAND_KIT_DIR, forward slashes, e.g. "10-responsive-logo/favicon/favicon-192.png". Pass this as `path` to /api/assets/file. */
  relPath: string;
  name: string;
  /** Subfolder within the top-level folder, "" if the file sits directly in it. */
  dir: string;
  ext: string;
  sizeBytes: number;
  isImage: boolean;
}

/** Every file inside one top-level folder, recursively. Returns null if the slug isn't a real folder. */
export function listBrandKitFiles(slug: string): BrandKitFile[] | null {
  const dir = resolveBrandKitFolder(slug);
  if (!dir) return null;
  const out: BrandKitFile[] = [];
  const walk = (current: string, relDir: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full, relDir ? `${relDir}/${entry.name}` : entry.name);
        continue;
      }
      const ext = path.extname(entry.name).slice(1).toLowerCase();
      out.push({
        relPath: `${slug}/${relDir ? `${relDir}/` : ""}${entry.name}`,
        name: entry.name,
        dir: relDir,
        ext,
        sizeBytes: fs.statSync(full).size,
        isImage: IMAGE_EXTENSIONS.has(ext),
      });
    }
  };
  walk(dir, "");
  return out.sort((a, b) => a.relPath.localeCompare(b.relPath));
}

/**
 * Resolve a `path` query value (as produced in BrandKitFile.relPath) to a real file
 * strictly inside BRAND_KIT_DIR. Rejects traversal, missing files and directories.
 */
export function resolveBrandKitFile(relPath: string): string | null {
  if (!relPath || relPath.includes("..") || relPath.startsWith("/") || relPath.includes("\\") || relPath.includes("\0")) return null;
  const base = path.resolve(BRAND_KIT_DIR);
  const full = path.resolve(path.join(base, relPath));
  if (full !== base && !full.startsWith(base + path.sep)) return null;
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
  return full;
}

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  svg: "image/svg+xml",
  webp: "image/webp",
  gif: "image/gif",
  ico: "image/x-icon",
  ttf: "font/ttf",
  css: "text/css; charset=utf-8",
  json: "application/json; charset=utf-8",
  md: "text/plain; charset=utf-8",
  txt: "text/plain; charset=utf-8",
};

export function mimeTypeFor(filePath: string): string {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return MIME_TYPES[ext] ?? "application/octet-stream";
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
