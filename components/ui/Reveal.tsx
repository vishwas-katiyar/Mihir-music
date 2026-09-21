"use client";

import { useReducedMotion } from "motion/react";
import { InView } from "@/components/motion-primitives/in-view";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "article" | "li";
}

/**
 * Scroll-entry reveal built on motion-primitives `InView`: fade up, fires once, static
 * for reduced-motion users. Transform and opacity only — a filter animation on a
 * section-sized layer is the most expensive thing a mid-range phone meets while scrolling.
 */
export function Reveal({ children, className, delay = 0, y = 28, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  return (
    <InView
      as={as}
      once
      viewOptions={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.7, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className={cn(className)}>{children}</div>
    </InView>
  );
}
