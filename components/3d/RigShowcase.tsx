"use client";

import dynamic from "next/dynamic";
import { CanvasGate } from "./CanvasGate";
import { StagePoster } from "./StagePoster";

const Scene = dynamic(() => import("./RigShowcaseScene").then((m) => m.RigShowcaseScene), {
  ssr: false,
  loading: () => <StagePoster loading />,
});

/** Hero 3D card: mounts only on capable devices and only when near the viewport. */
export function RigShowcase({ className }: { className?: string }) {
  return (
    <CanvasGate className={className} fallback={<StagePoster />} rootMargin="0px">
      {(quality, active) => <Scene quality={quality} active={active} />}
    </CanvasGate>
  );
}
