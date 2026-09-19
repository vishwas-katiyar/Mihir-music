"use client";

import dynamic from "next/dynamic";
import { CanvasGate } from "./CanvasGate";
import { StagePoster } from "./StagePoster";

const Scene = dynamic(() => import("./AudioMeshScene").then((m) => m.AudioMeshScene), {
  ssr: false,
  loading: () => <StagePoster accent="cyan" />,
});

export function AudioMeshCanvas({ className }: { className?: string }) {
  return (
    <CanvasGate className={className} fallback={<StagePoster accent="cyan" />}>
      {(quality, active) => <Scene quality={quality} active={active} />}
    </CanvasGate>
  );
}
