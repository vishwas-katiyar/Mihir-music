import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { services, type ServiceSlug } from "@/lib/services";

interface RelatedServicesProps {
  /** Slug of the service page being viewed; it is left out of the row. */
  current: ServiceSlug;
}

/**
 * Compact "Other services" row for a service detail page: the other four systems, each a
 * glass card whose anchor text is the full service name, plus a link back to the index.
 * Server component with plain anchors so every service page links every other one.
 */
export function RelatedServices({ current }: RelatedServicesProps) {
  const others = services.filter((s) => s.slug !== current);
  return (
    <section aria-labelledby="related-services-title" className="pb-12">
      <Container>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="related-services-title" className="eyebrow text-muted">
            Other services
          </h2>
          <Link href="/services" className="inline-flex min-h-11 items-center gap-2 text-sm text-gold transition hover:text-gold-soft">
            All event production services <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {others.map((s) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="glass block h-full rounded-2xl p-5 transition hover:border-gold/50">
                <span className="block font-display text-lg font-bold tracking-[-0.03em] text-ink">{s.name}</span>
                <span className="mt-2 line-clamp-2 block text-sm text-muted">{s.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
