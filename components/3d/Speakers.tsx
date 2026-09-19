"use client";

import { PopIn } from "./PopIn";

const cabinet = { color: "#0f1319", metalness: 0.3, roughness: 0.75 } as const;

interface LineArrayProps {
  /** X position of the hang */
  x: number;
  /** Either the truss height (flown) or deck top (ground stacked) */
  y: number;
  z?: number;
  boxes: number;
  flown?: boolean;
  accent: string;
}

/**
 * Line-array hang: cabinets step down from the rigging point with progressive
 * splay so the column curves toward the audience like a real J-array.
 */
export function LineArray({ x, y, z = 0, boxes, flown = true, accent }: LineArrayProps) {
  const h = 0.44;
  return (
    <group position={[x, y, z]}>
      {flown && (
        <mesh position={[0, -0.25, 0]}>
          <boxGeometry args={[1.05, 0.12, 0.7]} />
          <meshStandardMaterial color="#7d8794" metalness={0.9} roughness={0.35} />
        </mesh>
      )}
      {Array.from({ length: boxes }).map((_, i) => {
        const yy = flown ? -0.4 - i * h - i * 0.02 : i * h + h / 2;
        const splay = flown ? (i / Math.max(1, boxes - 1)) * 0.28 : 0;
        return (
          <PopIn key={i} delay={i * 0.04} position={[0, yy, 0]}>
            <group rotation={[splay, 0, 0]}>
              <mesh>
                <boxGeometry args={[0.95, h - 0.04, 0.62]} />
                <meshStandardMaterial {...cabinet} />
              </mesh>
              <mesh position={[0, 0, 0.32]}>
                <planeGeometry args={[0.82, h - 0.14]} />
                <meshStandardMaterial color="#1b2230" roughness={1} />
              </mesh>
              <mesh position={[0.38, 0, 0.33]}>
                <circleGeometry args={[0.025, 8]} />
                <meshBasicMaterial color={accent} toneMapped={false} />
              </mesh>
            </group>
          </PopIn>
        );
      })}
    </group>
  );
}

export function SubStack({ x, z, count, accent }: { x: number; z: number; count: number; accent: string }) {
  const h = 0.62;
  return (
    <group position={[x, 0, z]}>
      {Array.from({ length: count }).map((_, i) => (
        <PopIn key={i} delay={0.15 + i * 0.05} position={[0, i * h + h / 2, 0]}>
          <mesh>
            <boxGeometry args={[1.1, h - 0.03, 0.85]} />
            <meshStandardMaterial {...cabinet} />
          </mesh>
          <mesh position={[0, 0, 0.44]}>
            <ringGeometry args={[0.16, 0.22, 24]} />
            <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.8} />
          </mesh>
        </PopIn>
      ))}
    </group>
  );
}
