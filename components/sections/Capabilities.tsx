import Link from "next/link";
import { Speaker, Sparkles, Construction, Disc3, Radio, ArrowUpRight } from "lucide-react";
import { services, type Service } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const icons: Record<Service["slug"], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "arena-audio": Speaker,
  "dmx-lighting": Sparkles,
  "stage-rigging": Construction,
  "dj-setup": Disc3,
  "show-execution": Radio,
};

const accentText = { gold: "text-gold", cyan: "text-cyan", white: "text-ink" };

export function Capabilities({ compact = false }: { compact?: boolean }) {
  return (
    <section id="capabilities" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            title="Five systems. One crew. Zero hand-offs."
            lead="Audio, lighting, rigging, DJ and show control are designed together so the truss carries the right fixtures, the arrays clear the sightlines and every cue lands on the beat."
          />
        </Reveal>

        <div className={cn("mt-14 grid gap-5", compact ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2 xl:grid-cols-3")}>
          {services.map((s, i) => {
            const Icon = icons[s.slug];
            const featured = !compact && i === 0;
            return (
              <Reveal key={s.slug} delay={i * 0.06} className={cn(featured && "xl:col-span-2")}>
                <TiltCard glint={s.accent} className="h-full">
                  <Link
                    href={`/services/${s.slug}`}
                    className="group flex h-full flex-col rounded-[1.75rem] border border-white/6 bg-white/[0.03] p-1.5 transition-colors hover:border-white/12"
                  >
                    <article className="glass flex h-full flex-col rounded-[calc(1.75rem-0.375rem)] p-6 sm:p-7">
                      <Icon className={cn("h-6 w-6", accentText[s.accent])} strokeWidth={1.5} />
                      <h3 className="display-tight mt-6 text-2xl uppercase text-ink sm:text-3xl">{s.shortName}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted">{s.summary}</p>

                      <dl className={cn("mt-6 grid gap-2", featured ? "sm:grid-cols-3" : "grid-cols-1")}>
                        {s.specs.slice(0, 3).map((sp) => (
                          <div key={sp.label} className="rounded-xl border border-white/8 bg-panel/50 p-3">
                            <dt className="eyebrow text-muted">{sp.label}</dt>
                            <dd className="mt-1.5 text-sm text-ink">{sp.value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-auto flex items-center gap-2 pt-6 eyebrow text-ink/70 transition-colors group-hover:text-gold">
                        Explore {s.shortName.toLowerCase()}
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </article>
                  </Link>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
