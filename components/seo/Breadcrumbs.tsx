import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  /** Ordered trail, home first, current page last. The last item renders as text, not a link. */
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Visible breadcrumb trail in the mono label voice: a row of hairline-separated links
 * under the nav pill on every page except home. Server component, plain anchors, so the
 * path back to /services and / is in the HTML for crawlers. Structured data for the same
 * trail comes from lib/schema.ts (breadcrumbSchema); this component emits none.
 */
export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Breadcrumb" className={cn("pt-28 sm:pt-32", className)}>
      <Container>
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.href} className="eyebrow flex items-center gap-3 text-muted">
                {last ? (
                  <span aria-current="page" className="text-ink/80">
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
                    {item.label}
                  </Link>
                )}
                {!last && (
                  <span aria-hidden className="h-3 w-px bg-white/20" />
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
