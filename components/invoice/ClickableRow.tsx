"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Table row that opens `href` when clicked anywhere, while leaving real links inside
 * the row (share link, edit link) to do their own thing. Keyboard users get the same
 * behaviour with Enter or Space, and middle-click / ctrl-click open a new tab.
 */
export function ClickableRow({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();

  const onClick = (e: MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as HTMLElement).closest("a, button, input, select, textarea")) return;
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      window.open(href, "_blank", "noopener");
      return;
    }
    router.push(href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(href);
    }
  };

  return (
    <tr
      tabIndex={0}
      role="link"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cn("cursor-pointer outline-none transition-colors focus-visible:bg-white/[0.05] active:bg-white/[0.06]", className)}
    >
      {children}
    </tr>
  );
}
