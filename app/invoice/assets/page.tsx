import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Package } from "lucide-react";
import { isAdmin } from "@/lib/invoices/auth";
import { listBrandKitFolders, totalBrandKitSize, formatBytes } from "@/lib/assets/brandKit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Brand assets",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Admin-only download of the generated brand kit (assets/brand): everything, or one folder at a time. */
export default async function BrandAssetsPage() {
  if (!(await isAdmin())) redirect("/invoice/login");

  const folders = listBrandKitFolders();
  const total = totalBrandKitSize();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Brand assets</h1>
          <p className="mt-1 text-sm text-muted">Logos, social templates and print collateral, generated from the MIHIR brand kit. Admin only. Click a folder to preview its files.</p>
        </div>
        <a
          href="/api/assets/download"
          className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition hover:brightness-105"
        >
          <Download className="h-4 w-4" /> Download everything ({formatBytes(total.sizeBytes)})
        </a>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {folders.map((f) => (
          <div key={f.slug} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition hover:border-gold/40">
            <Link href={`/invoice/assets/${f.slug}`} className="flex min-w-0 items-center gap-3 overflow-hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gold">
                <Package className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{f.label}</div>
                <div className="text-xs text-muted">
                  {formatBytes(f.sizeBytes)} &middot; {f.fileCount} {f.fileCount === 1 ? "file" : "files"}
                </div>
              </div>
            </Link>
            <a
              href={`/api/assets/download?folder=${encodeURIComponent(f.slug)}`}
              aria-label={`Download ${f.label}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-ink/80 transition hover:border-gold/60 hover:text-ink"
            >
              <Download className="h-3.5 w-3.5" /> ZIP
            </a>
          </div>
        ))}
      </div>

      {folders.length === 0 && <p className="mt-8 text-sm text-muted">No brand assets found. Run `node scripts/brand/build-all.mjs` to generate the kit.</p>}
    </>
  );
}
