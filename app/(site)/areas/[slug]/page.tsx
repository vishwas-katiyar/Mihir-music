import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { areas, getArea } from "@/lib/areas";
import { faqs } from "@/lib/faqs";
import { site, whatsappUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, faqSchema, ID, shareMeta, webPageSchema } from "@/lib/schema";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
 * numbers are already on /estimate, and its Indore-specific phrasing reads oddly next
 * to a Bhopal/Ujjain/Dewas H1.
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
            <h1 className="display-tight max-w-4xl text-balance text-4xl uppercase text-ink sm:text-6xl lg:text-7xl">
              Sound and light production in {a.city}, Madhya Pradesh.
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-ink/85 sm:text-xl" data-speakable>
              {site.name} rigs weddings, concerts and corporate shows in {a.city}, travelling {a.driveTime} from our
              Indore base with the same crew, owned inventory and FOH engineer that run every show — nothing subcontracted.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">{a.note} That&apos;s {a.distanceKm} km from our Indore base.</p>

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
            <SectionHeading
              title="The same crew and rig, wherever the show is"
              lead={`Formats and starting prices don't change for ${a.city} — see the full breakdown on the pages that already cover them.`}
            />
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-ink underline decoration-white/30 underline-offset-4 hover:decoration-gold">
                See every format we run <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/estimate" className="inline-flex items-center gap-2 text-ink underline decoration-white/30 underline-offset-4 hover:decoration-gold">
                See starting prices <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>

        <FAQ items={areaFaqs} title={`${a.city}: what people ask before booking.`} />
      </article>
      <ClosingCTA />
    </>
  );
}
