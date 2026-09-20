import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { gear, gearBrands } from "@/lib/gear";

/**
 * Inventory digest for the home page: every group from lib/gear.ts, model names and
 * quantities only. Static markup, so the brand and model names are crawlable text on the
 * page most visitors actually see. The full specification table stays on /gear.
 */
export function GearHighlights() {
  return (
    <section id="gear" className="border-y border-white/10 bg-panel/30 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16">
            <div>
              <h2 className="display-tight text-4xl uppercase text-ink sm:text-5xl">Owned, not sub-hired</h2>
              <p className="mt-4 text-base text-muted">
                Every array, fixture and truss section below is ours, serviced between shows and moved by our crew. What you see quoted is what arrives.
              </p>
              <Link href="/gear" className="mt-6 inline-flex items-center gap-2 text-sm text-gold transition hover:text-amber-soft">
                Full inventory and specs <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {gear.map((group) => (
                <div key={group.title} className="border-t border-white/10 pt-5">
                  <dt className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{group.title}</dt>
                  {group.items.map((it) => (
                    <dd key={it.equipment} className="mt-3 grid grid-cols-[1fr_auto] items-baseline gap-4 text-sm">
                      <span className="text-ink/85">
                        {it.model}
                        <span className="block text-xs text-muted">{it.equipment}</span>
                      </span>
                      <span className="font-mono text-xs text-gold">{it.qty}</span>
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        {/* Manufacturers named in the table above, as a plain wordmark row. Static: the page already has one marquee (reviews). */}
        <Reveal delay={0.1} className="mt-16 border-t border-white/10 pt-8">
          <ul aria-label="Equipment brands we own" className="flex flex-wrap gap-x-10 gap-y-4">
            {gearBrands.map((b) => (
              <li key={b.name} className="font-display text-lg font-semibold tracking-[-0.02em] text-ink/70 sm:text-xl">
                {b.name}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
