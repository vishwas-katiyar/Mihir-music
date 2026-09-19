import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = `${site.name}: Engineered sound. Choreographed light.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic OpenGraph card. Rendered at the edge, cached by Vercel.
 * Beam gradients echo the site's WebGL hero without shipping any 3D.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background:
            "linear-gradient(112deg, transparent 38%, rgba(255,159,28,0.28) 40%, transparent 46%), linear-gradient(70deg, transparent 58%, rgba(77,229,255,0.22) 60%, transparent 66%), radial-gradient(ellipse at 50% 120%, rgba(255,159,28,0.35), transparent 55%), linear-gradient(180deg, #07090d 0%, #0d1118 60%, #07090d 100%)",
          color: "#f8fafc",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#ffd166" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff9f1c", boxShadow: "0 0 24px #ff9f1c" }} />
          Live event production · Indore · Pan-India
        </div>
        <div style={{ marginTop: 28, fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: -5, textTransform: "uppercase", display: "flex", flexDirection: "column" }}>
          <span>Engineered sound.</span>
          <span>
            <span style={{ color: "#ff9f1c" }}>Choreographed</span> light.
          </span>
        </div>
        <div style={{ marginTop: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26, color: "#a6b0c3" }}>
          <span>{site.name} · Since {site.foundingYear}</span>
          <span style={{ color: "#f8fafc" }}>{site.phoneDisplay}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
