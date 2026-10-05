import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { Readable } from "node:stream";
import { ZipArchive } from "archiver";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/invoices/auth";
import { BRAND_KIT_DIR, resolveBrandKitFolder } from "@/lib/assets/brandKit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/assets/download            → mihir-brand-kit.zip (everything under assets/brand)
 * GET /api/assets/download?folder=X   → mihir-brand-kit-X.zip (one top-level folder)
 * GET /api/assets/download?type=png   → mihir-brand-kit-png.zip (PNG files only)
 * Admin-only: same session cookie as /invoice. Streams the archive, nothing touches disk.
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/invoice/login", req.url));
  }

  const folder = new URL(req.url).searchParams.get("folder");
  const type = new URL(req.url).searchParams.get("type");
  if (type && type !== "png") {
    return NextResponse.json({ error: "Unsupported type filter" }, { status: 400 });
  }

  let dir = BRAND_KIT_DIR;
  let filename = "mihir-brand-kit.zip";
  let rootName = "mihir-brand-kit";

  if (folder) {
    const resolved = resolveBrandKitFolder(folder);
    if (!resolved) return NextResponse.json({ error: "Unknown folder" }, { status: 400 });
    dir = resolved;
    filename = `mihir-brand-kit-${folder}.zip`;
    rootName = folder;
  }

  if (type === "png") {
    filename = folder ? `mihir-brand-kit-${folder}-png.zip` : "mihir-brand-kit-png.zip";
  }

  const archive = new ZipArchive({ zlib: { level: 6 } });
  const passthrough = new PassThrough();
  archive.on("error", (err: Error) => passthrough.destroy(err));
  archive.pipe(passthrough);

  if (type === "png") {
    const stack: Array<{ full: string; rel: string }> = [{ full: dir, rel: "" }];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) continue;
      for (const entry of fs.readdirSync(current.full, { withFileTypes: true })) {
        const full = path.join(current.full, entry.name);
        const rel = current.rel ? `${current.rel}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          stack.push({ full, rel });
          continue;
        }
        if (path.extname(entry.name).toLowerCase() === ".png") {
          archive.file(full, { name: `${rootName}/${rel}` });
        }
      }
    }
  } else {
    archive.directory(dir, rootName);
  }

  void archive.finalize();

  return new NextResponse(Readable.toWeb(passthrough) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
