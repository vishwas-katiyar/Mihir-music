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
 * Scroll-entry reveal built on motion-primitives `InView`: heavy fade-up with blur,
 * fires once. Static for reduced-motion users.
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
        hidden: { opacity: 0, y, filter: "blur(6px)" },
        visible: { opacity: 1, y: 0, filter: "blur(0px)" },
      }}
      transition={{ duration: 0.85, delay, ease: [0.32, 0.72, 0, 1] }}
    >
      <div className={cn(className)}>{children}</div>
    </InView>
  );
}
