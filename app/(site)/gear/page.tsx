import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GearTable } from "@/components/sections/GearTable";
import { AudioShowcase } from "@/components/sections/AudioShowcase";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, shareMeta, webPageSchema } from "@/lib/schema";

const title = "Sound & Lighting Equipment, Indore";
const description =
  "Owned sound, lighting and rigging inventory in Indore: JBL and RCF line arrays, cardioid subs, Clay Paky Sharpy movers, Avolites console and Tomcat truss.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/gear" },
  ...shareMeta({ title, description, path: "/gear" }),
};

export default function GearPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ name: title, description, path: "/gear", dateModified: "2026-09-21" }),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gear", path: "/gear" }]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gear", href: "/gear" }]} />
      <section className="pb-4 pt-8">
        <Container>
          <SectionHeading
            as="h1"
            title="Owned inventory. Maintained in-house. On the truck when you need it."
            lead="No sub-hire roulette. Every array, fixture and truss section listed here is ours, serviced between shows and transported by our crew."
          />
        </Container>
      </section>
      <GearTable heading={false} />
      <AudioShowcase />
      <ClosingCTA />
    </>
  );
}
