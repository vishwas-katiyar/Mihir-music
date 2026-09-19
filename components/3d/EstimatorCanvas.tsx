"use client";

import dynamic from "next/dynamic";
import type { EstimateResult } from "@/lib/estimator";
import { CanvasGate } from "./CanvasGate";
import { StagePoster } from "./StagePoster";

const Scene = dynamic(() => import("./EstimatorScene").then((m) => m.EstimatorScene), {
  ssr: false,
  loading: () => <StagePoster />,
});

export function EstimatorCanvas({ rig, people, className }: { rig: EstimateResult["rig"]; people: number; className?: string }) {
  return (
    <CanvasGate className={className} fallback={<StagePoster />}>
      {(quality, active) => <Scene rig={rig} people={people} quality={quality} active={active} />}
    </CanvasGate>
  );
}
