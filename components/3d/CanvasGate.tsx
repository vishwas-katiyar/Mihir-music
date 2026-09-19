"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Quality = "high" | "low" | "off";

interface NavigatorExtras extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/**
 * Decide once, on the client, how much GPU work this device should get.
 *  - off  : reduced motion, no WebGL, or data-saver → static poster
 *  - low  : phones / ≤4 cores / ≤4 GB → dpr 1, fewer fixtures, no haze
 *  - high : everything else
 */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "off";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "off";
  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return "off";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return "off";
  } catch {
    return "off";
  }
  const cores = nav.hardwareConcurrency ?? 8;
  const mem = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (cores <= 4 || mem <= 4 || (coarse && window.innerWidth < 900)) return "low";
  return "high";
}

interface CanvasGateProps {
  /** Render-prop receives the resolved quality and whether the element is on-screen. */
  children: (quality: Exclude<Quality, "off">, active: boolean) => ReactNode;
  fallback: ReactNode;
  className?: string;
  /** Start loading this far before the element enters the viewport. */
  rootMargin?: string;
}

/**
 * Mounts a WebGL canvas only when the device can handle it AND it's near the viewport.
 * Reports `active=false` when scrolled away so scenes can stop their frameloop.
 */
export function CanvasGate({ children, fallback, className, rootMargin = "240px" }: CanvasGateProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setQuality(detectQuality());
  }, []);

  useEffect(() => {
    if (!ref.current || quality === "off" || quality === null) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [quality, rootMargin]);

  return (
    // Callers own positioning (all current usages pass `absolute inset-0`).
    <div ref={ref} className={cn(className)} aria-hidden>
      {quality && quality !== "off" && mounted ? children(quality, active) : fallback}
    </div>
  );
}
