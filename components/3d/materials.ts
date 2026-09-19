import * as THREE from "three";

/**
 * Volumetric-style beam material.
 * Cone geometry, apex at the fixture, extending along +Z. Brightness falls off with
 * distance along the beam and softens at the silhouette (view-space normal), so a
 * cheap transparent cone reads as a light shaft in haze.
 */
export function createBeamMaterial(color: string, intensity = 1, length = 14) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uOpacity: { value: 0.55 },
      uLength: { value: length },
    },
    vertexShader: /* glsl */ `
      uniform float uLength;
      varying float vT;
      varying vec3 vNormal;
      void main() {
        vT = clamp(position.z / uLength, 0.0, 1.0);
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uIntensity;
      uniform float uOpacity;
      varying float vT;
      varying vec3 vNormal;
      void main() {
        float falloff = pow(1.0 - vT, 1.7);
        float edge = pow(abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 0.9);
        float dust = 0.85 + 0.15 * sin(vT * 38.0 - uTime * 4.0) * sin(vT * 11.0 + uTime * 1.7);
        float flicker = 0.94 + 0.06 * sin(uTime * 9.0 + vT * 6.0);
        float a = falloff * edge * dust * flicker * uOpacity;
        gl_FragColor = vec4(uColor * uIntensity, a);
      }
    `,
  });
}

/** Cone with apex at origin, extending along +Z. Shared across fixtures. */
const beamGeometryCache = new Map<string, THREE.ConeGeometry>();
export function getBeamGeometry(length: number, radius: number) {
  const key = `${length}:${radius}`;
  let g = beamGeometryCache.get(key);
  if (!g) {
    g = new THREE.ConeGeometry(radius, length, 24, 1, true);
    g.translate(0, -length / 2, 0); // apex → origin, extends along -Y
    g.rotateX(-Math.PI / 2); // -Y → +Z
    beamGeometryCache.set(key, g);
  }
  return g;
}

/**
 * Atmospheric haze plane: 3-octave value noise drifting slowly, additive, masked to the stage volume.
 */
export function createHazeMaterial(colorA: string, colorB: string, density = 0.22) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uDensity: { value: density },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uDensity;
      varying vec2 vUv;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
        return v;
      }
      void main() {
        vec2 p = vUv * vec2(4.0, 2.2) + vec2(uTime * 0.03, uTime * 0.015);
        float n = fbm(p) * 0.7 + fbm(p * 2.3 - uTime * 0.02) * 0.3;
        float maskY = smoothstep(0.0, 0.35, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
        float maskX = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
        vec3 col = mix(uColorA, uColorB, smoothstep(0.2, 0.8, vUv.x + 0.15 * sin(uTime * 0.2)));
        gl_FragColor = vec4(col, n * maskY * maskX * uDensity);
      }
    `,
  });
}
