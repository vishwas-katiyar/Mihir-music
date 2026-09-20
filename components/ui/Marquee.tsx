import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps extends HTMLAttributes<HTMLDivElement> {
  /** Scroll right-to-left by default; `reverse` flips it. */
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** How many copies of the children to lay out so the loop never shows a gap. */
  repeat?: number;
  children: ReactNode;
}

/**
 * Infinite horizontal marquee. The utility behind 21st.dev's "Testimonials Marquee"
 * (shadcnspace/marquee-01): the children are repeated `repeat` times inside a flex
 * track that translates by exactly one copy's width, so the loop is seamless.
 * Speed comes from `--duration`, spacing from `--gap`. Reduced-motion users get a
 * static row (see globals.css).
 */
export function Marquee({ className, reverse = false, pauseOnHover = false, repeat = 4, children, ...props }: MarqueeProps) {
  return (
    <div {...props} className={cn("group flex flex-row overflow-hidden [--duration:40s] [--gap:1rem] [gap:var(--gap)]", className)}>
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "animate-marquee-track flex shrink-0 flex-row justify-around [gap:var(--gap)]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
