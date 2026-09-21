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
 * Admin-only: same session cookie as /invoice. Streams the archive, nothing touches disk.
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/invoice/login", req.url));
  }

  const folder = new URL(req.url).searchParams.get("folder");
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

  const archive = new ZipArchive({ zlib: { level: 6 } });
  const passthrough = new PassThrough();
  archive.on("error", (err: Error) => passthrough.destroy(err));
  archive.pipe(passthrough);
  archive.directory(dir, rootName);
  void archive.finalize();

  return new NextResponse(Readable.toWeb(passthrough) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
