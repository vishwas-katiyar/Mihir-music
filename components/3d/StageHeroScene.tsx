"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor, Sparkles } from "@react-three/drei";
import type { Quality } from "./CanvasGate";
import { usePointerTarget } from "./usePointerTarget";
import { Truss } from "./Truss";
import { MovingHead } from "./MovingHead";
import { Haze } from "./Haze";
import { LineArray, SubStack } from "./Speakers";
import { StageLights, StageFloor, StageDeck, useAimTarget, CameraRig } from "./SceneCommon";

const AMBER = "#ffb347";
const CYAN = "#4de5ff";
const WHITE = "#e8ecff";

interface SceneProps {
  quality: Exclude<Quality, "off">;
  active: boolean;
}

function Rig({ quality }: { quality: Exclude<Quality, "off"> }) {
  const pointer = usePointerTarget();
  const high = quality === "high";
  const frontCount = high ? 10 : 6;
  const trussW = 18;
  const trussH = 7.4;
  const target = useAimTarget(pointer, 8, 5);

  const front = Array.from({ length: frontCount }, (_, i) => {
    const t = i / Math.max(1, frontCount - 1);
    const x = -trussW / 2 + 1.2 + t * (trussW - 2.4);
    const color = i % 3 === 0 ? CYAN : i % 3 === 1 ? AMBER : WHITE;
    return { x, color, spread: [(t - 0.5) * 6, 0] as [number, number], phase: i * 0.9 };
  });

  const backCount = high ? 6 : 0;
  const back = Array.from({ length: backCount }, (_, i) => {
    const t = i / (backCount - 1);
    const x = -6 + t * 12;
    return { x, color: i % 2 === 0 ? AMBER : CYAN, spread: [(t - 0.5) * 8, 3] as [number, number], phase: 2 + i * 1.3 };
  });

  return (
    <>
      <CameraRig pointer={pointer} base={[0, 3.4, 17.5]} lookAt={[0, 3.4, 0]} />
      <StageLights />
      <fog attach="fog" args={["#07090d", 22, 52]} />
      <StageFloor />
      <StageDeck width={15} depth={6} z={-1.5} accent={AMBER} />

      <Truss width={trussW} height={trussH} />
      {front.map((f, i) => (
        <MovingHead key={`f${i}`} position={[f.x, trussH - 0.55, 0]} color={f.color} target={target} spread={f.spread} phase={f.phase} intensity={1.15} />
      ))}

      {high && (
        <>
          <Truss width={14} height={8.6} position={[0, 0, -4.5]} />
          {back.map((b, i) => (
            <MovingHead key={`b${i}`} position={[b.x, 8.05, -4.5]} color={b.color} target={target} spread={b.spread} phase={b.phase} length={16} radius={0.7} intensity={0.9} speed={0.4} />
          ))}
          <Haze position={[0, 5.5, -6]} width={34} height={13} density={0.18} />
          <Sparkles count={110} scale={[30, 10, 14]} position={[0, 5, -2]} size={1.6} speed={0.25} opacity={0.35} color={AMBER} />
        </>
      )}

      <LineArray x={-trussW / 2 + 0.9} y={trussH - 0.1} z={0.3} boxes={high ? 7 : 5} accent={AMBER} />
      <LineArray x={trussW / 2 - 0.9} y={trussH - 0.1} z={0.3} boxes={high ? 7 : 5} accent={AMBER} />
      <SubStack x={-trussW / 2 + 0.9} z={2.2} count={2} accent={AMBER} />
      <SubStack x={trussW / 2 - 0.9} z={2.2} count={2} accent={AMBER} />
    </>
  );
}

/**
 * Hero canvas. dpr adapts to quality and live frame-rate; the frameloop pauses
 * when the hero scrolls out of view so the rest of the page gets the GPU back.
 */
export function StageHeroScene({ quality, active }: SceneProps) {
  const [dpr, setDpr] = useState(quality === "high" ? 1.5 : 1);
  return (
    <Canvas
      className="absolute inset-0"
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 42, near: 0.1, far: 120, position: [0, 3.4, 17.5] }}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => gl.setClearColor("#07090d", 0)}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => quality === "high" && setDpr(1.5)} />
      <Rig quality={quality} />
    </Canvas>
  );
}
