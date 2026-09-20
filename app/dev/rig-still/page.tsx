import { notFound } from "next/navigation";
import { RigStill } from "./RigStill";

/**
 * Development-only render target for scripts/render-rig-stills.mjs. Headless Chrome opens
 * this page per show format and screenshots the full-viewport canvas. Never served in
 * production: the route 404s there, and it is not linked or listed in the sitemap.
 */
export default async function RigStillPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  const str = (v: string | string[] | undefined, d: string) => (typeof v === "string" && v ? v : d);
  const num = (v: string | string[] | undefined, d: number) => {
    const n = typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : d;
  };
  return (
    <RigStill
      format={str(params.format, "wedding")}
      azimuth={num(params.az, 0.35)}
      polar={num(params.polar, 1.25)}
      zoom={num(params.zoom, 1)}
    />
  );
}
