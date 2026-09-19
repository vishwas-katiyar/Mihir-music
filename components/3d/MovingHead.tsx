"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { createBeamMaterial, getBeamGeometry } from "./materials";

export interface MovingHeadProps {
  position: [number, number, number];
  color: string;
  /** World-space point every fixture in the rig aims around. */
  target: React.RefObject<THREE.Vector3>;
  /** Per-fixture spread so beams fan out instead of converging on one dot. */
  spread?: [number, number];
  length?: number;
  radius?: number;
  intensity?: number;
  /** Autonomous sway when the visitor is idle */
  phase?: number;
  speed?: number;
}

const _dummy = new THREE.Object3D();
const _aim = new THREE.Vector3();

/**
 * A moving-head fixture: yoke + lens + volumetric beam.
 * Slerps toward the shared target every frame — no React state involved.
 */
export function MovingHead({
  position,
  color,
  target,
  spread = [0, 0],
  length = 14,
  radius = 0.9,
  intensity = 1,
  phase = 0,
  speed = 0.6,
}: MovingHeadProps) {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(() => createBeamMaterial(color, intensity, length), [color, intensity, length]);
  const geometry = useMemo(() => getBeamGeometry(length, radius), [length, radius]);

  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g || !target.current) return;
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;

    _aim.copy(target.current);
    _aim.x += spread[0] + Math.sin(t * speed + phase) * 0.6;
    _aim.z += spread[1] + Math.cos(t * speed * 0.8 + phase) * 0.4;

    _dummy.position.set(position[0], position[1], position[2]);
    _dummy.lookAt(_aim);
    g.quaternion.slerp(_dummy.quaternion, 1 - Math.exp(-dt * 5));
  });

  return (
    <group position={position}>
      {/* Yoke arm mounts to the truss */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.16, 0.36, 0.16]} />
        <meshStandardMaterial color="#1f2430" metalness={0.8} roughness={0.4} />
      </mesh>
      <group ref={group}>
        <mesh>
          <boxGeometry args={[0.36, 0.42, 0.44]} />
          <meshStandardMaterial color="#12161f" metalness={0.85} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.23]}>
          <circleGeometry args={[0.14, 24]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
        <mesh geometry={geometry} material={material} position={[0, 0, 0.24]} frustumCulled={false} />
      </group>
    </group>
  );
}
