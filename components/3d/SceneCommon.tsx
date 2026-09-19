"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import type { PointerTarget } from "./usePointerTarget";

/** True on phones/tablets (coarse pointer). Decided on the client after mount. */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

/**
 * OrbitControls sets `touch-action: none` on the canvas, which hijacks page scrolling on
 * phones. Mount this after the controls to hand vertical swipes back to the page.
 */
export function TouchScrollFriendly() {
  const { gl } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const apply = () => {
      if (el.style.touchAction !== "pan-y") el.style.touchAction = "pan-y";
    };
    apply();
    // OrbitControls writes `touch-action: none` when it connects; undo it whenever that happens.
    const mo = new MutationObserver(apply);
    mo.observe(el, { attributes: true, attributeFilter: ["style"] });
    const t = window.setTimeout(apply, 300);
    return () => {
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, [gl]);
  return null;
}

export function StageLights({ accent = "#ff9f1c", secondary = "#4de5ff" }: { accent?: string; secondary?: string }) {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-12, 18, 10]} intensity={1.1} color={accent} />
      <pointLight position={[10, 6, -8]} intensity={40} color={secondary} distance={40} decay={2} />
      <pointLight position={[-8, 2, 8]} intensity={18} color="#ffffff" distance={30} decay={2} />
    </>
  );
}

export function StageFloor() {
  return (
    <Grid
      position={[0, 0.001, 0]}
      args={[80, 80]}
      cellSize={1}
      cellThickness={0.5}
      cellColor="#182030"
      sectionSize={5}
      sectionThickness={1}
      sectionColor="#27364f"
      fadeDistance={48}
      fadeStrength={1.6}
      infiniteGrid
    />
  );
}

/** Low black deck with an accent edge line. Unit box scaled by the parent. */
export function StageDeck({ width, depth, height = 0.7, z = 0, accent = "#ff9f1c" }: { width: number; depth: number; height?: number; z?: number; accent?: string }) {
  return (
    <group position={[0, height / 2, z]}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#0a0d13" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, height / 2 + 0.005, depth / 2 - 0.02]}>
        <boxGeometry args={[width, 0.02, 0.05]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

/**
 * Keeps a world-space aim point alive: follows the visitor's pointer / gyroscope,
 * falls back to a slow figure-8 sweep after 2.5 s of inactivity.
 */
export function useAimTarget(pointer: React.RefObject<PointerTarget>, halfWidth: number, depth: number) {
  const target = useRef(new THREE.Vector3(0, 0, 3));
  const idleMix = useRef(1);
  useFrame(({ clock }, dt) => {
    const p = pointer.current;
    const t = clock.elapsedTime;
    const idle = performance.now() - p.lastInput > 2500;
    idleMix.current += ((idle ? 1 : 0) - idleMix.current) * (1 - Math.exp(-dt * 1.5));
    const sweepX = Math.sin(t * 0.45) * halfWidth * 0.8;
    const sweepZ = 2 + Math.sin(t * 0.9) * depth * 0.5;
    const ptrX = p.x * halfWidth;
    const ptrZ = 3 - p.y * depth;
    const m = idleMix.current;
    const tx = ptrX * (1 - m) + sweepX * m;
    const tz = ptrZ * (1 - m) + sweepZ * m;
    target.current.x += (tx - target.current.x) * (1 - Math.exp(-dt * 4));
    target.current.z += (tz - target.current.z) * (1 - Math.exp(-dt * 4));
  });
  return target;
}

/** Gentle camera parallax against the pointer. */
export function CameraRig({ pointer, base, lookAt, amount = 1 }: { pointer: React.RefObject<PointerTarget>; base: [number, number, number]; lookAt: [number, number, number]; amount?: number }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(...lookAt));
  useFrame((_, dt) => {
    const p = pointer.current;
    const k = 1 - Math.exp(-dt * 2.5);
    camera.position.x += (base[0] + p.x * 1.4 * amount - camera.position.x) * k;
    camera.position.y += (base[1] + p.y * 0.6 * amount - camera.position.y) * k;
    camera.position.z += (base[2] - camera.position.z) * k;
    camera.lookAt(look.current);
  });
  return null;
}
