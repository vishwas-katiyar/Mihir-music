"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/** Scales children from 0 → 1 with a critically-damped ease after mount. */
export function PopIn({ children, delay = 0, position }: { children: React.ReactNode; delay?: number; position?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    if (start.current === null) start.current = clock.elapsedTime + delay;
    const t = clock.elapsedTime - start.current;
    const s = t <= 0 ? 0.001 : Math.min(1, 1 - Math.exp(-t * 6) * (1 + t * 6));
    g.scale.setScalar(Math.max(0.001, s));
  });
  return (
    <group ref={ref} position={position} scale={0.001}>
      {children}
    </group>
  );
}
