import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The repo root also has a package-lock (legacy static site); pin the workspace root here.
  turbopack: { root: path.join(__dirname) },
  poweredByHeader: false,
  reactStrictMode: true,
  // PDF renderer has native-ish internals that must not be bundled; logo must ship with the PDF function.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/api/i/[token]/pdf": ["./public/logo.png", "./public/fonts/*.ttf"],
    "/api/assets/download": ["./assets/brand/**"],
    "/api/assets/file": ["./assets/brand/**"],
  },
  images: { formats: ["image/avif", "image/webp"] },
  /**
   * Legacy URLs from the static single-page site this replaced. Google may still hold them,
   * and a 404 in Search Console's page-indexing report is a lost signal rather than a neutral
   * one. 308 keeps the method and tells Google the move is permanent.
   */
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/invoice.html", destination: "/invoice", permanent: true },
      { source: "/invoice/index.html", destination: "/invoice", permanent: true },
      { source: "/services.html", destination: "/services", permanent: true },
      { source: "/contact.html", destination: "/contact", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
