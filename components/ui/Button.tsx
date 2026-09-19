import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "cyan" | "outline";

const styles: Record<Variant, string> = {
  primary:
    "bg-amber text-black hover:bg-amber-soft shadow-glow-amber",
  cyan: "bg-cyan text-black hover:brightness-110 shadow-glow-cyan",
  ghost: "border border-white/12 bg-white/5 text-ink hover:border-amber/60 hover:text-amber",
  outline: "border border-amber/50 text-amber hover:bg-amber/10",
};

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  icon?: boolean;
  external?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Island button: pill with an optional nested icon disc (button-in-button).
 * Always rendered as a link — every CTA on this site navigates or opens WhatsApp.
 */
export function Button({ href, children, variant = "primary", icon = true, external, className, size = "md" }: ButtonProps) {
  const sizing = size === "lg" ? "px-7 py-3.5 text-sm" : size === "sm" ? "px-4 py-2 text-[11px]" : "px-5 py-3 text-xs";
  const cls = cn(
    "group inline-flex items-center gap-3 rounded-full font-mono font-semibold uppercase tracking-[0.16em] transition-all duration-500 ease-stage active:scale-[0.98]",
    sizing,
    styles[variant],
    className,
  );
  const content = (
    <>
      <span>{children}</span>
      {icon && (
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-500 ease-stage group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
            variant === "primary" || variant === "cyan" ? "bg-black/10" : "bg-white/8",
          )}
        >
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      )}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
