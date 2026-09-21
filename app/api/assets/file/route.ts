import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/invoices/auth";
import { resolveBrandKitFile, mimeTypeFor } from "@/lib/assets/brandKit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/assets/file?path=<relPath>            → inline (for <img> previews)
 * GET /api/assets/file?path=<relPath>&download=1 → attachment (single-file download)
 * Admin-only, same session as /invoice. `path` must be one of BrandKitFile.relPath.
 */
export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.redirect(new URL("/invoice/login", req.url));
  }

  const url = new URL(req.url);
  const rel = url.searchParams.get("path");
  if (!rel) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const full = resolveBrandKitFile(rel);
  if (!full) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = await readFile(full);
  const headers: Record<string, string> = {
    "Content-Type": mimeTypeFor(full),
    "Cache-Control": "private, no-store",
  };
  if (url.searchParams.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="${path.basename(full)}"`;
  }
  return new NextResponse(data, { headers });
}
