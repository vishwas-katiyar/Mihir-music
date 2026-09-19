"use client";

import dynamic from "next/dynamic";
import { CanvasGate } from "./CanvasGate";
import { StagePoster } from "./StagePoster";

const Scene = dynamic(() => import("./StageHeroScene").then((m) => m.StageHeroScene), {
  ssr: false,
  loading: () => <StagePoster />,
});

/**
 * Drop-in hero background. Server-safe: the WebGL bundle only loads on capable
 * devices, only once the hero is near the viewport, and renders a CSS poster otherwise.
 */
export function StageHeroCanvas({ className }: { className?: string }) {
  return (
    <CanvasGate className={className} fallback={<StagePoster />} rootMargin="0px">
      {(quality, active) => <Scene quality={quality} active={active} />}
    </CanvasGate>
  );
}
