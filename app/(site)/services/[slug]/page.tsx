import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { services, getService } from "@/lib/services";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, faqSchema, serviceId, serviceSchema, shareMeta, webPageSchema } from "@/lib/schema";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ } from "@/components/sections/FAQ";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { RelatedServices } from "@/components/sections/RelatedServices";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: s.metaTitle,
    description: s.metaDescription,
    keywords: s.keywords,
    alternates: { canonical: `/services/${s.slug}` },
    ...shareMeta({ title: s.metaTitle, description: s.metaDescription, path: `/services/${s.slug}` }),
  };
}

const accentText = { gold: "text-gold", cyan: "text-cyan", white: "text-ink" };
const accentBorder = { gold: "border-gold/40", cyan: "border-cyan/40", white: "border-white/30" };

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            name: s.name,
            description: s.definition,
            path: `/services/${s.slug}`,
            mainEntity: { "@id": serviceId(s.slug) },
            speakableSelectors: ["h1", "[data-speakable]"],
            dateModified: "2026-09-21",
          }),
          serviceSchema(s),
          faqSchema(s.faq),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
            { name: s.shortName, path: `/services/${s.slug}` },
          ]),
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: s.shortName, href: `/services/${s.slug}` },
        ]}
      />
      <article>
        <section className="pt-8 pb-20">
          <Container>
            <div className={cn("eyebrow", accentText[s.accent])}>{s.shortName}</div>
            <h1 className="display-tight mt-4 max-w-4xl text-balance text-4xl uppercase text-ink sm:text-6xl lg:text-7xl">{s.headline}</h1>

            {/* Direct-answer block: the first paragraph is written to be quoted verbatim by AI search. */}
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink/85 sm:text-xl" data-speakable>
              {s.definition}
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{s.summary}</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/estimate">Estimate with this system</Button>
              <Button href={whatsappUrl(`Hi Mihir, I'd like a quote for ${s.name}. Please share availability and pricing.`)} external variant="glass">
                Ask on WhatsApp
              </Button>
            </div>
          </Container>
        </section>

        <section className="pb-24">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <GlassCard className="h-full">
                  <h2 className="eyebrow text-gold">Technical specification</h2>
                  <table className="mt-5 w-full text-sm">
                    <caption className="sr-only">{s.name} specifications</caption>
                    <tbody className="divide-y divide-white/8">
                      {s.specs.map((sp) => (
                        <tr key={sp.label}>
                          <th scope="row" className="eyebrow w-36 py-3 pr-4 text-left font-normal text-muted">
                            {sp.label}
                          </th>
                          <td className="py-3 text-ink">{sp.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              </Reveal>

              <div className="grid gap-6">
                <Reveal delay={0.06}>
                  <GlassCard>
                    <h2 className="eyebrow text-gold">What’s included</h2>
                    <ul className="mt-5 space-y-3 text-sm text-ink/85">
                      {s.deliverables.map((d) => (
                        <li key={d} className="flex gap-3">
                          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", accentText[s.accent])} /> {d}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
                <Reveal delay={0.12}>
                  <GlassCard>
                    <h2 className="eyebrow text-gold">Ideal for</h2>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {s.idealFor.map((d) => (
                        <li key={d} className={cn("rounded-full border px-3 py-1.5 text-xs text-ink/85", accentBorder[s.accent])}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
              </div>
            </div>
          </Container>
        </section>

        <FAQ items={s.faq} title={`${s.shortName}: questions we get asked.`} />

        <RelatedServices current={s.slug} />
      </article>
      <ClosingCTA />
    </>
  );
}
