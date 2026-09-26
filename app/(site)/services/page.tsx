import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Capabilities } from "@/components/sections/Capabilities";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, serviceId, serviceSchema, shareMeta, webPageSchema } from "@/lib/schema";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

const title = "Event Production Services in Indore";
const description =
  "Five event production services in Indore: line-array sound, DMX lighting, certified truss rigging, DJ setups and show calling. Book one or the full production.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/services" },
  ...shareMeta({ title, description, path: "/services" }),
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            name: title,
            description,
            path: "/services",
            type: "CollectionPage",
            mainEntity: {
              "@type": "ItemList",
              name: "Event production services",
              itemListOrder: "https://schema.org/ItemListOrderAscending",
              numberOfItems: services.length,
              itemListElement: services.map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.name,
                url: `${site.url}/services/${s.slug}`,
                item: { "@id": serviceId(s.slug) },
              })),
            },
            dateModified: "2026-09-21",
          }),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]),
          ...services.map(serviceSchema),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }]} />
      <section className="pb-4 pt-8">
        <Container>
          <SectionHeading
            as="h1"
            title="Everything between the power drop and the last encore."
            lead="Each system is available on its own or as an integrated production. Explore the specs, then build a live estimate."
          />
        </Container>
      </section>
      <Capabilities />
      <ClosingCTA />
    </>
  );
}
