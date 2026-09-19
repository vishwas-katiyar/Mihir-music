"use client";

import { useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Quality } from "./CanvasGate";
import { Truss } from "./Truss";
import { MovingHead } from "./MovingHead";
import { Haze } from "./Haze";
import { LineArray, SubStack } from "./Speakers";
import { StageLights, StageFloor, StageDeck, TouchScrollFriendly, useCoarsePointer } from "./SceneCommon";

const GOLD = "#ffb800";
const WHITE = "#eef0ff";

/** Beams follow the pointer while it is over the canvas, otherwise sweep slowly. */
function useLocalTarget(halfWidth: number, depth: number) {
  const { pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, depth * 0.5));
  const last = useRef(0);
  const prev = useRef(new THREE.Vector2());
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (prev.current.distanceToSquared(pointer) > 1e-6) {
      last.current = t;
      prev.current.copy(pointer);
    }
    const idle = t - last.current > 2.5;
    const tx = idle ? Math.sin(t * 0.35) * halfWidth * 0.7 : pointer.x * halfWidth;
    const tz = idle ? depth * 0.5 + Math.sin(t * 0.55) * depth * 0.5 : depth * 0.3 - pointer.y * depth;
    const k = 1 - Math.exp(-dt * 3.5);
    target.current.x += (tx - target.current.x) * k;
    target.current.z += (tz - target.current.z) * k;
  });
  return target;
}

function Rig({ quality }: { quality: Exclude<Quality, "off"> }) {
  const high = quality === "high";
  const width = 12;
  const height = 6.2;
  const target = useLocalTarget(5, 4);
  const count = high ? 6 : 4;

  return (
    <>
      <StageLights accent={GOLD} secondary="#7a7f99" />
      <fog attach="fog" args={["#0b0d12", 16, 40]} />
      <StageFloor />
      <StageDeck width={10} depth={4} z={-0.5} accent={GOLD} />
      <Truss width={width} height={height} />
      {Array.from({ length: count }, (_, i) => {
        const t = i / Math.max(1, count - 1);
        return (
          <MovingHead
            key={i}
            position={[-width / 2 + 1.2 + t * (width - 2.4), height - 0.55, 0]}
            color={i % 2 === 0 ? GOLD : WHITE}
            target={target}
            spread={[(t - 0.5) * 5, 0]}
            phase={i * 0.9}
            length={10}
            radius={0.6}
            intensity={1}
            speed={0.45}
          />
        );
      })}
      <LineArray x={-width / 2 + 0.8} y={height - 0.1} z={0.3} boxes={5} accent={GOLD} />
      <LineArray x={width / 2 - 0.8} y={height - 0.1} z={0.3} boxes={5} accent={GOLD} />
      <SubStack x={-width / 2 + 0.8} z={1.9} count={2} accent={GOLD} />
      <SubStack x={width / 2 - 0.8} z={1.9} count={2} accent={GOLD} />
      {high && <Haze position={[0, 4.5, -4]} width={22} height={9} density={0.12} colorA={GOLD} colorB="#6b7280" />}
    </>
  );
}

/**
 * Contained "rig on a turntable" scene for the hero card. Slow auto-orbit, drag to look
 * around, beams track the pointer. Deliberately quiet: six fixtures, one accent colour.
 */
export function RigShowcaseScene({ quality, active }: { quality: Exclude<Quality, "off">; active: boolean }) {
  const coarse = useCoarsePointer();
  return (
    <Canvas
      className="absolute inset-0"
      dpr={quality === "high" ? [1, 1.5] : 1}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 34, near: 0.1, far: 80, position: [0, 3.2, 15] }}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => gl.setClearColor("#0b0d12", 0)}
    >
      <OrbitControls
        target={[0, 2.8, 0]}
        enablePan={false}
        enableZoom={false}
        enableRotate={!coarse}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={1.05}
        maxPolarAngle={1.45}
        autoRotate
        autoRotateSpeed={0.45}
      />
      {coarse && <TouchScrollFriendly />}
      <Rig quality={quality} />
    </Canvas>
  );
}
