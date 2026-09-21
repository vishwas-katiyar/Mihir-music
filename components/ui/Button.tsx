import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass";

const styles: Record<Variant, string> = {
  primary: "bg-gold text-charcoal shadow-glow-gold hover:brightness-105",
  glass: "glass text-ink hover:border-white/25",
};

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
}

/**
 * Pill CTA in the site's one button voice (sentence case, Space Grotesk 600), matching the
 * hero actions. Always a link: every CTA on this site navigates or opens WhatsApp. Internal
 * links point right, external ones point out.
 */
export function Button({ href, children, variant = "primary", external, className }: ButtonProps) {
  const cls = cn(
    "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold",
    "transition-[transform,filter,border-color] duration-200 ease-out-strong hover:-translate-y-0.5 active:scale-[0.97]",
    styles[variant],
    className,
  );
  const Icon = external ? ArrowUpRight : ArrowRight;
  const content = (
    <>
      {children}
      <Icon className="h-4 w-4 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5" aria-hidden />
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
