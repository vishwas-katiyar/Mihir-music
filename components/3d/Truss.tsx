"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

interface TrussProps {
  /** Span of the horizontal beam */
  width: number;
  /** Height of the beam above the floor */
  height: number;
  /** Square truss section size */
  section?: number;
  /** Bracing spacing */
  pitch?: number;
  /** Include ground-support towers at each end */
  towers?: boolean;
  position?: [number, number, number];
  color?: string;
}

const UP = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _m = new THREE.Matrix4();

function segmentMatrix(a: THREE.Vector3, b: THREE.Vector3, thickness: number, out: THREE.Matrix4) {
  _dir.subVectors(b, a);
  const len = _dir.length();
  _mid.addVectors(a, b).multiplyScalar(0.5);
  _q.setFromUnitVectors(UP, _dir.normalize());
  _s.set(thickness, len, thickness);
  return out.compose(_mid, _q, _s);
}

/** Build a square-section box truss between two points, returning segment pairs. */
function trussSegments(a: THREE.Vector3, b: THREE.Vector3, section: number, pitch: number) {
  const segs: [THREE.Vector3, THREE.Vector3][] = [];
  const axis = new THREE.Vector3().subVectors(b, a);
  const len = axis.length();
  axis.normalize();
  // Build a local frame (axis, u, v)
  const u = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const v = new THREE.Vector3().crossVectors(axis, u).normalize();
  u.crossVectors(v, axis).normalize();
  const h = section / 2;
  const corners = [
    new THREE.Vector3().addScaledVector(u, h).addScaledVector(v, h),
    new THREE.Vector3().addScaledVector(u, -h).addScaledVector(v, h),
    new THREE.Vector3().addScaledVector(u, -h).addScaledVector(v, -h),
    new THREE.Vector3().addScaledVector(u, h).addScaledVector(v, -h),
  ];
  // Chords
  for (const c of corners) segs.push([a.clone().add(c), b.clone().add(c)]);
  // Zig-zag bracing on each face
  const n = Math.max(1, Math.floor(len / pitch));
  for (let i = 0; i < n; i++) {
    const t0 = (i / n) * len;
    const t1 = ((i + 1) / n) * len;
    for (let f = 0; f < 4; f++) {
      const c0 = corners[f];
      const c1 = corners[(f + 1) % 4];
      const p0 = a.clone().addScaledVector(axis, t0).add(i % 2 === 0 ? c0 : c1);
      const p1 = a.clone().addScaledVector(axis, t1).add(i % 2 === 0 ? c1 : c0);
      segs.push([p0, p1]);
      if (i === 0) segs.push([a.clone().add(c0), a.clone().add(c1)]);
      if (i === n - 1) segs.push([b.clone().add(c0), b.clone().add(c1)]);
    }
  }
  return segs;
}

/**
 * Instanced aluminium truss — one draw call regardless of span.
 */
export function Truss({ width, height, section = 0.42, pitch = 0.55, towers = true, position = [0, 0, 0], color = "#aeb6c0" }: TrussProps) {
  const ref = useRef<THREE.InstancedMesh>(null);

  const segments = useMemo(() => {
    const segs: [THREE.Vector3, THREE.Vector3][] = [];
    const hw = width / 2;
    segs.push(...trussSegments(new THREE.Vector3(-hw, height, 0), new THREE.Vector3(hw, height, 0), section, pitch));
    if (towers) {
      segs.push(...trussSegments(new THREE.Vector3(-hw, 0, 0), new THREE.Vector3(-hw, height + section / 2, 0), section, pitch));
      segs.push(...trussSegments(new THREE.Vector3(hw, 0, 0), new THREE.Vector3(hw, height + section / 2, 0), section, pitch));
    }
    return segs;
  }, [width, height, section, pitch, towers]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    segments.forEach(([a, b], i) => {
      mesh.setMatrixAt(i, segmentMatrix(a, b, 0.045, _m));
    });
    mesh.count = segments.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [segments]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, segments.length]} position={position} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.32} />
    </instancedMesh>
  );
}
