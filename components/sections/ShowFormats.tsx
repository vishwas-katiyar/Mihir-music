import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { formats } from "@/lib/formats";

/**
 * Portfolio digest for the home page. Server-rendered, no images, no client JS: four
 * rows, each naming a format, its crowd size and the rig we bring. The full page keeps
 * the long-form version and the social links.
 */
export function ShowFormats() {
  return (
    <section id="portfolio" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="display-tight max-w-[16ch] text-4xl uppercase text-ink sm:text-5xl">Four formats, one rig logic</h2>
              <p className="mt-4 max-w-[56ch] text-base text-muted">
                Every event is different. The build is not. This is what each format needs and what turns up on the truck.
              </p>
            </div>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm text-ink/80 transition hover:text-gold">
              Full portfolio <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <ol className="grid border-t border-white/10 sm:grid-cols-2 lg:grid-cols-4 lg:border-t-0 lg:border-l">
            {formats.map((f) => (
              <li key={f.slug} className="border-b border-white/10 py-7 sm:px-6 sm:[&:nth-child(odd)]:pl-0 lg:border-b-0 lg:border-r lg:px-6 lg:py-2 lg:[&:nth-child(odd)]:pl-6">
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">{f.shortTitle}</h3>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-gold">{f.audience}</p>
                <ul className="mt-5 grid gap-2.5 text-sm leading-snug text-ink/80">
                  {f.rig.slice(0, 3).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
