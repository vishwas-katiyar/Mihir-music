import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { isAdmin } from "@/lib/invoices/auth";
import { listBrandKitFiles, folderLabel, formatBytes } from "@/lib/assets/brandKit";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ folder: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { folder } = await params;
  return {
    title: folderLabel(folder),
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

const previewUrl = (relPath: string) => `/api/assets/file?path=${encodeURIComponent(relPath)}`;
const downloadUrl = (relPath: string) => `${previewUrl(relPath)}&download=1`;

/** Admin-only browser for one brand-kit folder: image thumbnails, a file list, and downloads. */
export default async function BrandAssetFolderPage({ params }: Props) {
  if (!(await isAdmin())) redirect("/invoice/login");

  const { folder } = await params;
  const files = listBrandKitFiles(folder);
  if (!files) notFound();

  const images = files.filter((f) => f.isImage);
  const others = files.filter((f) => !f.isImage);
  const label = folderLabel(folder);
  const displayName = (f: (typeof files)[number]) => (f.dir ? `${f.dir}/${f.name}` : f.name);

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
        <div>
          <Link href="/invoice/assets" className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted transition hover:text-ink sm:min-h-0">
            <ArrowLeft className="h-3.5 w-3.5" /> Brand assets
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{label}</h1>
          <p className="mt-1 text-sm text-muted">
            {files.length} {files.length === 1 ? "file" : "files"}
          </p>
        </div>
        <a
          href={`/api/assets/download?folder=${encodeURIComponent(folder)}`}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition hover:brightness-105 sm:w-auto"
        >
          <Download className="h-4 w-4" /> Download this folder (ZIP)
        </a>
      </div>

      {images.length > 0 && (
        <div className="mt-8">
          <h2 className="eyebrow text-amber">Preview</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((f) => (
              <div key={f.relPath} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                <a href={previewUrl(f.relPath)} target="_blank" rel="noreferrer" className="block">
                  <div className="flex aspect-square items-center justify-center bg-[#0a0a0a] p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element -- dynamic admin-only route, not a static asset */}
                    <img src={previewUrl(f.relPath)} alt={f.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                  </div>
                </a>
                {/* Touch has no hover, so the download stays visible until there is a pointer to reveal it. */}
                <a
                  href={downloadUrl(f.relPath)}
                  aria-label={`Download ${f.name}`}
                  className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-ink backdrop-blur transition hover:bg-black/80 sm:h-8 sm:w-8 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <div className="truncate border-t border-white/10 px-3 py-2 text-xs text-muted" title={displayName(f)}>
                  {displayName(f)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div className="mt-10">
          <h2 className="eyebrow text-amber">Other files</h2>
          <div className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
            {others.map((f) => (
              <div key={f.relPath} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium" title={displayName(f)}>
                    {displayName(f)}
                  </div>
                  <div className="text-xs text-muted">
                    {f.ext.toUpperCase()} &middot; {formatBytes(f.sizeBytes)}
                  </div>
                </div>
                <a
                  href={downloadUrl(f.relPath)}
                  aria-label={`Download ${f.name}`}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3 text-xs font-semibold text-ink/80 transition hover:border-gold/60 hover:text-ink sm:min-h-0 sm:py-2"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
