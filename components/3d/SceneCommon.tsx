"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";

const coarseQuery = "(pointer: coarse)";

/**
 * True on phones/tablets. Scenes are client-only (dynamic, ssr:false), so the first render
 * can read the media query directly instead of flipping after mount; that flip is what let
 * OrbitControls attach to touch devices for one frame and claim the gesture.
 */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(() => typeof window !== "undefined" && window.matchMedia(coarseQuery).matches);
  useEffect(() => {
    const mq = window.matchMedia(coarseQuery);
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return coarse;
}

/**
 * Presentational stand-in for OrbitControls on touch devices: a slow turntable around
 * `target` with no event listeners, so the canvas never owns a finger. Speed matches
 * OrbitControls' autoRotate units (revolutions per minute at 60fps).
 */
export function Turntable({ target, distance, polar, speed = 0.45, range }: { target: [number, number, number]; distance: number; polar: number; speed?: number; /** Limit the sweep to ±range radians (ping-pong) instead of full revolutions. */ range?: number }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(...target));
  const angle = useRef(0);
  const perSecond = ((2 * Math.PI) / 60) * speed;
  useFrame((_, dt) => {
    angle.current += perSecond * Math.min(dt, 0.1);
    const a = range == null ? angle.current : Math.sin(angle.current) * range;
    camera.position.set(
      look.current.x + distance * Math.sin(polar) * Math.sin(a),
      look.current.y + distance * Math.cos(polar),
      look.current.z + distance * Math.sin(polar) * Math.cos(a),
    );
    camera.lookAt(look.current);
  });
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
