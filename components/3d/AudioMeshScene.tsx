"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Quality } from "./CanvasGate";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uBeat;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  varying float vH;
  varying float vFx;

  void main() {
    float fx = (position.x + 12.0) / 24.0;          // 0..1 → low → high frequency
    float fy = (position.y + 6.0) / 12.0;

    // Moving spectrum peaks
    float band = 0.0;
    band += sin(fx * 6.2831 * 1.3 + uTime * 0.9);
    band += 0.5 * sin(fx * 6.2831 * 2.7 - uTime * 1.3);
    band += 0.33 * sin(fx * 6.2831 * 5.1 + uTime * 1.9);
    band += 0.25 * sin(fx * 6.2831 * 9.0 - uTime * 2.6);

    // Bass hump that pumps on the beat, decays toward the highs
    float bass = exp(-pow(fx - 0.12, 2.0) * 22.0) * uBeat * 1.9;
    float env = 0.45 + bass + (1.0 - fx) * 0.25;

    float wave = sin(position.y * 0.8 + uTime * 1.6 + fx * 5.0) * 0.22;
    float h = (band * 0.32 + 0.55) * env + wave;

    // Pointer ripple
    float d = distance(vec2(fx, fy), uPointer);
    h += exp(-d * d * 28.0) * 1.4;

    vec3 p = position;
    p.z = h;
    vH = h;
    vFx = fx;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.1 + clamp(h, 0.0, 2.5) * 0.9) * uPixelRatio * (26.0 / -mv.z);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying float vH;
  varying float vFx;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = dot(c, c);
    if (r > 0.25) discard;
    float soft = smoothstep(0.25, 0.05, r);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.15, 0.85, vFx));
    float lum = 0.35 + clamp(vH, 0.0, 2.2) * 0.45;
    gl_FragColor = vec4(col * lum, soft * 0.75);
  }
`;

function Mesh({ quality }: { quality: Exclude<Quality, "off"> }) {
  const { pointer, gl } = useThree();
  const pointerSmooth = useRef(new THREE.Vector2(0.3, 0.5));
  const segs = quality === "high" ? [128, 64] : [72, 36];

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uBeat: { value: 0 },
          uPointer: { value: new THREE.Vector2(0.3, 0.5) },
          uPixelRatio: { value: gl.getPixelRatio() },
          uColorA: { value: new THREE.Color("#ffb347") },
          uColorB: { value: new THREE.Color("#4de5ff") },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      }),
    [gl],
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    material.uniforms.uTime.value = t;
    // 128 BPM kick envelope
    const beatPhase = (t * 128) / 60;
    material.uniforms.uBeat.value = Math.pow(1 - (beatPhase % 1), 3);
    // pointer: R3F gives -1..1 inside the canvas; map to 0..1 and drift when idle
    const px = pointer.x * 0.5 + 0.5;
    const py = pointer.y * 0.5 + 0.5;
    const hasPointer = Math.abs(pointer.x) > 0.001 || Math.abs(pointer.y) > 0.001;
    const tx = hasPointer ? px : 0.5 + Math.sin(t * 0.4) * 0.3;
    const ty = hasPointer ? py : 0.5 + Math.cos(t * 0.3) * 0.25;
    pointerSmooth.current.x += (tx - pointerSmooth.current.x) * (1 - Math.exp(-dt * 4));
    pointerSmooth.current.y += (ty - pointerSmooth.current.y) * (1 - Math.exp(-dt * 4));
    material.uniforms.uPointer.value.copy(pointerSmooth.current);
  });

  return (
    <points rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={material} frustumCulled={false}>
      <planeGeometry args={[24, 12, segs[0], segs[1]]} />
    </points>
  );
}

export function AudioMeshScene({ quality, active }: { quality: Exclude<Quality, "off">; active: boolean }) {
  return (
    <Canvas
      className="absolute inset-0"
      dpr={quality === "high" ? [1, 1.5] : 1}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 38, position: [0, 7.5, 13], near: 0.1, far: 80 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ camera, gl }) => {
        camera.lookAt(0, 0.6, 0);
        gl.setClearColor("#07090d", 0);
      }}
    >
      <Mesh quality={quality} />
    </Canvas>
  );
}
