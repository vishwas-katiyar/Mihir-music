"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/motion-primitives/accordion";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { services } from "@/lib/services";

/**
 * Services as an expanding list (motion-primitives Accordion). One open at a time;
 * the open row shows specs and deliverables side by side, plus a link to the full page.
 */
export function ServicesList() {
  return (
    <section id="services" aria-labelledby="services-title" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <h2 id="services-title" className="display-tight max-w-[16ch] text-4xl uppercase text-ink sm:text-5xl">What we bring to a show</h2>
          <p className="mt-5 max-w-[60ch] text-base text-muted">
            Each system works on its own or as one integrated production. Open a row for the specification.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Accordion className="border-t border-white/10">
            {services.map((s) => (
              <AccordionItem key={s.slug} value={s.slug} className="border-b border-white/10">
                <AccordionTrigger className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:text-gold sm:items-center">
                  <span className="grid gap-1 sm:grid-cols-[minmax(0,14rem)_1fr] sm:items-baseline sm:gap-8">
                    <span className="font-display text-xl font-semibold tracking-[-0.02em] text-ink sm:text-2xl">{s.shortName}</span>
                    <span className="text-sm text-muted sm:text-base">{s.summary}</span>
                  </span>
                  <Plus className="mt-1 h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-data-expanded:rotate-45" strokeWidth={1.75} />
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-8 pb-8 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
                    <p className="text-sm leading-relaxed text-ink/80">{s.definition}</p>
                    <div className="grid gap-8 md:grid-cols-2">
                      <dl className="grid gap-3">
                        {s.specs.slice(0, 4).map((sp) => (
                          <div key={sp.label} className="grid grid-cols-[6.5rem_1fr] gap-3 text-sm">
                            <dt className="text-muted">{sp.label}</dt>
                            <dd className="text-ink">{sp.value}</dd>
                          </div>
                        ))}
                      </dl>
                      <div>
                        <ul className="grid gap-2 text-sm text-ink/85">
                          {s.deliverables.map((d) => (
                            <li key={d} className="flex gap-3">
                              <span className="mt-2 h-px w-3 shrink-0 bg-gold" />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <Link href={`/services/${s.slug}`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm text-gold transition hover:text-gold-soft">
                          Full {s.shortName.toLowerCase()} specification <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <Link href="/services" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink/80 transition hover:text-gold">
            All five services side by side <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
