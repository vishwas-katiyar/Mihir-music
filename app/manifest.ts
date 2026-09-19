import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Mihir S&L",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07090d",
    theme_color: "#07090d",
    icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
