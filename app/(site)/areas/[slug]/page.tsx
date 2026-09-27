import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { areas, getArea } from "@/lib/areas";
import { formats } from "@/lib/formats";
import { packages } from "@/lib/packages";
import { faqs } from "@/lib/faqs";
import { site, whatsappUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, faqSchema, ID, shareMeta, webPageSchema } from "@/lib/schema";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";
import { FAQ } from "@/components/sections/FAQ";
import { ClosingCTA } from "@/components/sections/ClosingCTA";

interface Params {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return areas.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const a = getArea(slug);
  if (!a) return {};
  // Bare title: the root layout's template appends " | Mihir Sound & Light" for the <title> tag.
  const title = `Sound & Light Production in ${a.city}`;
  const description = `Line-array sound, DMX lighting and certified truss rigging for weddings, concerts and corporate events in ${a.city}, Madhya Pradesh — the same crew and rig based in Indore, ${a.driveTime} away.`;
  return {
    title,
    description,
    alternates: { canonical: `/areas/${a.slug}` },
    ...shareMeta({ title, description, path: `/areas/${a.slug}` }),
  };
}

/**
 * Coverage and package-difference answers are the ones a city-page visitor actually asks.
 * The general "what does it cost in Indore" FAQ is deliberately left out here — its
 * numbers are already the packages grid above, and its Indore-specific phrasing reads
 * oddly next to a Bhopal/Ujjain/Dewas H1.
 */
const areaFaqKeywords = ["cities do you serve", "difference between your three production"];
const areaFaqs = faqs.filter((f) => areaFaqKeywords.some((k) => f.q.includes(k)));

export default async function AreaPage({ params }: Params) {
  const { slug } = await params;
  const a = getArea(slug);
  if (!a) notFound();

  const path = `/areas/${a.slug}`;
  const waMessage = `Hi Mihir, I'd like a quote for a show in ${a.city}. Please share availability and pricing.`;

  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            name: `Sound & Light Production in ${a.city}`,
            description: `Event sound, lighting and rigging production serving ${a.city}, Madhya Pradesh, operated from Indore.`,
            path,
            mainEntity: { "@id": ID.business },
            speakableSelectors: ["h1", "[data-speakable]"],
            dateModified: "2026-09-27",
          }),
          faqSchema(areaFaqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Areas", path: "/areas" },
            { name: a.city, path },
          ]),
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Areas", href: "/areas" },
          { label: a.city, href: path },
        ]}
      />

      <article>
        <section className="pt-8 pb-20">
          <Container>
            <div className="eyebrow text-gold">{a.city}, Madhya Pradesh</div>
            <h1 className="display-tight mt-4 max-w-4xl text-balance text-4xl uppercase text-ink sm:text-6xl lg:text-7xl">
              Sound and light production in {a.city}.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink/85 sm:text-xl" data-speakable>
              {site.name} rigs weddings, concerts and corporate shows in {a.city}, travelling {a.driveTime} from our
              Indore base with the same crew, owned inventory and FOH engineer that run every show — nothing subcontracted.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{a.note} The starting prices below are the same as everywhere else; the final quote adds travel and load-in for {a.city}.</p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/estimate">Estimate with this system</Button>
              <Button href={whatsappUrl(waMessage)} external variant="glass">
                Ask on WhatsApp
              </Button>
            </div>
          </Container>
        </section>

        <section className="pb-24">
          <Container>
            <h2 className="eyebrow text-gold">Formats we run in {a.city}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {formats.map((f, i) => (
                <Reveal key={f.slug} delay={i * 0.05}>
                  <GlassCard className="h-full">
                    <h3 className="font-display text-base font-semibold text-ink">{f.shortTitle}</h3>
                    <p className="mt-1 text-xs text-muted">{f.audience}</p>
                    <ul className="mt-4 space-y-2 text-xs text-ink/80">
                      {f.rig.slice(0, 2).map((r) => (
                        <li key={r} className="flex gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {r}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        <section className="pb-24">
          <Container>
            <h2 className="eyebrow text-gold">Starting prices</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {packages.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.06}>
                  <GlassCard className="h-full">
                    <div className="text-xs text-muted">{p.label}</div>
                    <h3 className="font-display mt-1 text-xl font-semibold text-ink">{p.name}</h3>
                    <div className="mt-2 text-2xl font-bold text-gold">{p.price}</div>
                    <ul className="mt-4 space-y-2 text-xs text-ink/80">
                      {p.features.slice(0, 3).map((feat) => (
                        <li key={feat} className="flex gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /> {feat}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        <FAQ items={areaFaqs} title={`${a.city}: what people ask before booking.`} />
      </article>
      <ClosingCTA />
    </>
  );
}
