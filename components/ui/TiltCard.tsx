"use client";

import { useReducedMotion } from "motion/react";
import { Tilt } from "@/components/motion-primitives/tilt";
import { Spotlight } from "@/components/motion-primitives/spotlight";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees */
  intensity?: number;
  glint?: "amber" | "cyan" | "white";
}

/** Spotlight gradient stops per accent (Tailwind classes, resolved at build). */
const glintClass = {
  amber: "from-gold/40 via-gold/15 to-transparent",
  cyan: "from-cyan/35 via-cyan/12 to-transparent",
  white: "from-white/30 via-white/10 to-transparent",
};

/**
 * Tilt card = motion-primitives `Tilt` (spring-damped 3D rotation) + `Spotlight`
 * (specular hotspot tracking the pointer). Same API as before so call sites are unchanged.
 * Reduced-motion users get a static card.
 */
export function TiltCard({ children, className, intensity = 9, glint = "amber" }: TiltCardProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={cn("relative h-full", className)}>{children}</div>;
  return (
    <Tilt rotationFactor={intensity} springOptions={{ stiffness: 160, damping: 18, mass: 0.5 }} className={cn("relative h-full will-change-transform", className)}>
      <Spotlight className={cn("mix-blend-screen", glintClass[glint])} size={360} springOptions={{ stiffness: 200, damping: 25 }} />
      {children}
    </Tilt>
  );
}
