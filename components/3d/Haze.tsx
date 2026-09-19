"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { createHazeMaterial } from "./materials";

interface HazeProps {
  width?: number;
  height?: number;
  position?: [number, number, number];
  colorA?: string;
  colorB?: string;
  density?: number;
}

/** Drifting atmospheric haze behind the stage — makes beams read as volumetric. */
export function Haze({ width = 30, height = 12, position = [0, 5, -3], colorA = "#ff9f1c", colorB = "#4de5ff", density = 0.2 }: HazeProps) {
  const material = useMemo(() => createHazeMaterial(colorA, colorB, density), [colorA, colorB, density]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });
  return (
    <mesh position={position} material={material} frustumCulled={false}>
      <planeGeometry args={[width, height]} />
    </mesh>
  );
}
