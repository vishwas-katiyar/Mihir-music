"use client";

import { useEffect, useRef } from "react";

export interface PointerTarget {
  x: number; // -1 (left) … 1 (right)
  y: number; // -1 (bottom) … 1 (top)
  idleFor: number; // seconds since last real input
  lastInput: number;
}

interface DeviceOrientationEventCtor {
  requestPermission?: () => Promise<"granted" | "denied">;
}

/**
 * Window-level pointer + device-orientation target, normalised to -1…1.
 * Returned as a ref so consumers can read it inside useFrame without re-renders.
 * On iOS the gyroscope needs a user gesture — we request permission on first touch.
 */
export function usePointerTarget() {
  const target = useRef<PointerTarget>({ x: 0, y: 0, idleFor: 0, lastInput: 0 });

  useEffect(() => {
    const t = target.current;
    const onPointer = (e: PointerEvent) => {
      t.x = (e.clientX / window.innerWidth) * 2 - 1;
      t.y = -((e.clientY / window.innerHeight) * 2 - 1);
      t.lastInput = performance.now();
    };
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      t.x = Math.max(-1, Math.min(1, e.gamma / 35));
      t.y = Math.max(-1, Math.min(1, (45 - e.beta) / 35));
      t.lastInput = performance.now();
    };
    const requestGyro = async () => {
      const ctor = DeviceOrientationEvent as unknown as DeviceOrientationEventCtor;
      try {
        if (typeof ctor.requestPermission === "function") {
          const res = await ctor.requestPermission();
          if (res !== "granted") return;
        }
        window.addEventListener("deviceorientation", onOrient, { passive: true });
      } catch {
        /* gyroscope unavailable — pointer fallback stays active */
      }
      window.removeEventListener("touchstart", requestGyro);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    if (window.matchMedia("(pointer: coarse)").matches) {
      window.addEventListener("touchstart", requestGyro, { passive: true, once: true });
    }
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("touchstart", requestGyro);
    };
  }, []);

  return target;
}
