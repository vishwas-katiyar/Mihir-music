"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { EstimateResult } from "@/lib/estimator";
import type { Quality } from "./CanvasGate";
import { Truss } from "./Truss";
import { MovingHead } from "./MovingHead";
import { Haze } from "./Haze";
import { LineArray, SubStack } from "./Speakers";
import { StageLights, StageFloor, Turntable, useCoarsePointer } from "./SceneCommon";

type Rig = EstimateResult["rig"];

const CYAN = "#4de5ff";
const WHITE = "#e8ecff";

/** Beams follow the pointer inside the canvas; sweep autonomously otherwise. */
function useEstimatorTarget(halfWidth: number, depth: number) {
  const { pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, depth));
  const lastMove = useRef(0);
  const prev = useRef(new THREE.Vector2());
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (prev.current.distanceToSquared(pointer) > 1e-6) {
      lastMove.current = t;
      prev.current.copy(pointer);
    }
    const idle = t - lastMove.current > 2;
    const tx = idle ? Math.sin(t * 0.5) * halfWidth * 0.75 : pointer.x * halfWidth;
    const tz = idle ? depth * 0.6 + Math.sin(t * 0.8) * depth * 0.6 : depth * 0.4 - pointer.y * depth;
    target.current.x += (tx - target.current.x) * (1 - Math.exp(-dt * 4));
    target.current.z += (tz - target.current.z) * (1 - Math.exp(-dt * 4));
  });
  return target;
}

/** Stage deck whose footprint eases toward the current estimate. */
function Deck({ width, depth, accent }: { width: number; depth: number; accent: string }) {
  const group = useRef<THREE.Group>(null);
  const edge = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 5);
    g.scale.x += (width - g.scale.x) * k;
    g.scale.z += (depth - g.scale.z) * k;
    if (edge.current) edge.current.position.z = 0.5 - 0.02 / g.scale.z;
  });
  return (
    <group ref={group} position={[0, 0.35, 0]} scale={[width, 1, depth]}>
      <mesh>
        <boxGeometry args={[1, 0.7, 1]} />
        <meshStandardMaterial color="#0a0d13" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh ref={edge} position={[0, 0.355, 0.49]}>
        <boxGeometry args={[1, 0.02, 0.03]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Audience as instanced dots so crowd size is felt, not just read. */
function Crowd({ people, stageDepth, quality }: { people: number; stageDepth: number; quality: Exclude<Quality, "off"> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const count = Math.min(quality === "high" ? 900 : 350, Math.max(40, Math.round(people / 9)));
  const max = 900;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < max; i++) {
      const r = 4 + Math.sqrt(rnd()) * (6 + Math.sqrt(count) * 0.55);
      const a = (rnd() - 0.5) * Math.PI * 0.9;
      dummy.position.set(Math.sin(a) * r, 0.16, stageDepth / 2 + Math.cos(a) * r * 0.75);
      const s = i < count ? 1 : 0.0001;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, stageDepth, dummy]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, max]} frustumCulled={false}>
      <sphereGeometry args={[0.13, 6, 6]} />
      <meshStandardMaterial color="#2a3448" emissive="#1a2236" roughness={1} />
    </instancedMesh>
  );
}

/** Pixel bars along the deck edge, chasing in the accent colour. */
function PixelBars({ count, width, accent }: { count: number; width: number; accent: string }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const base = useMemo(() => new THREE.Color(accent), [accent]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const max = 36;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < max; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      dummy.position.set(-width / 2 + 0.6 + t * (width - 1.2), 0.74, width * 0 + 0.5);
      const s = i < count ? 1 : 0.0001;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [count, width, dummy]);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const pulse = 0.35 + 0.65 * Math.pow(Math.max(0, Math.sin(t * 3 - i * 0.45)), 2);
      color.copy(base).multiplyScalar(pulse);
      m.setColorAt(i, color);
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, max]} frustumCulled={false}>
      <boxGeometry args={[0.55, 0.06, 0.08]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

function Scene({ rig, quality }: { rig: Rig; quality: Exclude<Quality, "off">; people: number }) {
  const halfW = rig.trussWidth / 2;
  const target = useEstimatorTarget(halfW * 0.8, rig.stageDepth);

  const frontCount = Math.min(rig.beams, 24);
  const backCount = rig.beams - frontCount;
  const backZ = -rig.stageDepth * 0.55;

  const fixtures = (count: number, z: number, y: number, phaseOffset: number) =>
    Array.from({ length: count }, (_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = -halfW + 0.9 + t * (rig.trussWidth - 1.8);
      const color = i % 3 === 0 ? rig.accent : i % 3 === 1 ? CYAN : WHITE;
      return (
        <MovingHead
          key={`${z}-${i}`}
          position={[x, y, z]}
          color={color}
          target={target}
          spread={[(t - 0.5) * rig.trussWidth * 0.5, z < 0 ? 2 : 0]}
          phase={phaseOffset + i * 0.8}
          length={rig.trussHeight + 6}
          radius={0.55 + rig.trussHeight * 0.05}
          intensity={1.1}
        />
      );
    });

  const arrayFlown = rig.trussHeight - rig.arrayBoxesPerSide * 0.46 > 1.4;
  const arrayX = halfW - 0.9;
  const arrayY = arrayFlown ? rig.trussHeight - 0.1 : 0.7;

  return (
    <>
      <StageLights accent={rig.accent} />
      <fog attach="fog" args={["#07090d", 24, 60]} />
      <StageFloor />
      <Deck width={rig.stageWidth} depth={rig.stageDepth} accent={rig.accent} />
      <PixelBars count={rig.pixelBars} width={rig.stageWidth} accent={rig.accent} />

      <Truss width={rig.trussWidth} height={rig.trussHeight} position={[0, 0, -rig.stageDepth * 0.15]} />
      {fixtures(frontCount, -rig.stageDepth * 0.15, rig.trussHeight - 0.55, 0)}

      {backCount > 0 && (
        <>
          <Truss width={rig.trussWidth * 0.8} height={rig.trussHeight + 1.2} position={[0, 0, backZ]} />
          {fixtures(backCount, backZ, rig.trussHeight + 0.65, 3)}
        </>
      )}

      <LineArray x={-arrayX} y={arrayY} z={0.2} boxes={rig.arrayBoxesPerSide} flown={arrayFlown} accent={rig.accent} />
      <LineArray x={arrayX} y={arrayY} z={0.2} boxes={rig.arrayBoxesPerSide} flown={arrayFlown} accent={rig.accent} />
      <SubStack x={-arrayX - 0.2} z={rig.stageDepth / 2 + 0.9} count={rig.subsPerSide} accent={rig.accent} />
      <SubStack x={arrayX + 0.2} z={rig.stageDepth / 2 + 0.9} count={rig.subsPerSide} accent={rig.accent} />

      {rig.haze && quality === "high" && <Haze position={[0, rig.trussHeight * 0.7, backZ - 3]} width={rig.trussWidth * 2} height={rig.trussHeight * 1.8} density={0.16} colorA={rig.accent} />}
    </>
  );
}

/** Fixed camera for still renders: spherical position around the rig's look-at point, set once. */
function StillCamera({ rig, azimuth, polar, zoom }: { rig: Rig; azimuth: number; polar: number; zoom: number }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    const target = new THREE.Vector3(0, rig.trussHeight * 0.45, 0);
    const distance = (14 + rig.trussWidth * 0.45) * zoom;
    camera.position.set(
      target.x + distance * Math.sin(polar) * Math.sin(azimuth),
      target.y + distance * Math.cos(polar),
      target.z + distance * Math.sin(polar) * Math.cos(azimuth),
    );
    camera.lookAt(target);
    camera.updateProjectionMatrix();
  }, [camera, rig.trussHeight, rig.trussWidth, azimuth, polar, zoom]);
  return null;
}

/** Marks the document once enough frames have run for beams, haze and deck easing to settle. */
function ReadyFlag({ frames }: { frames: number }) {
  const count = useRef(0);
  useFrame(() => {
    count.current += 1;
    if (count.current === frames) document.documentElement.dataset.rigReady = "1";
  });
  return null;
}

export interface EstimatorSceneProps {
  rig: Rig;
  people: number;
  quality: Exclude<Quality, "off">;
  active: boolean;
  /** Still-render mode (scripts/render-rig-stills.mjs): fixed camera, no controls, ready flag after settling. */
  still?: { azimuth: number; polar: number; zoom: number };
}

export function EstimatorScene({ rig, people, quality, active, still }: EstimatorSceneProps) {
  const camZ = 14 + rig.trussWidth * 0.45;
  const lookY = rig.trussHeight * 0.45;
  const coarse = useCoarsePointer();
  // Same view OrbitControls would settle on from the initial camera, clamped to its polar range.
  const camDistance = Math.hypot(5.5 - lookY, camZ);
  const camPolar = Math.min(1.5, Math.max(0.95, Math.acos((5.5 - lookY) / camDistance)));
  return (
    <Canvas
      className="absolute inset-0"
      style={coarse && !still ? { pointerEvents: "none" } : undefined}
      dpr={still ? 1 : quality === "high" ? [1, 1.5] : 1}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 40, position: [0, 5.5, camZ], near: 0.1, far: 140 }}
      gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance", stencil: false, preserveDrawingBuffer: !!still }}
      onCreated={({ gl }) => gl.setClearColor("#07090d", 0)}
    >
      {still ? (
        <>
          <StillCamera rig={rig} azimuth={still.azimuth} polar={still.polar} zoom={still.zoom} />
          <ReadyFlag frames={150} />
        </>
      ) : coarse ? (
        <Turntable target={[0, lookY, 0]} distance={camDistance} polar={camPolar} speed={0.35} range={0.85} />
      ) : (
        <OrbitControls
          target={[0, lookY, 0]}
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          minPolarAngle={0.95}
          maxPolarAngle={1.5}
          minAzimuthAngle={-0.85}
          maxAzimuthAngle={0.85}
          autoRotate
          autoRotateSpeed={0.35}
        />
      )}
      <Scene rig={rig} quality={quality} people={people} />
      <Crowd people={people} stageDepth={rig.stageDepth} quality={quality} />
    </Canvas>
  );
}
