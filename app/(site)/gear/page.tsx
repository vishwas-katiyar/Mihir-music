import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GearTable } from "@/components/sections/GearTable";
import { AudioShowcase } from "@/components/sections/AudioShowcase";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Equipment Inventory: Line Arrays, Sharpy Beams, Avolites, Truss",
  description:
    "Full sound, lighting and rigging inventory: JBL/RCF line arrays, cardioid subs, Clay Paky Sharpy moving heads, Avolites Tiger Touch Pro, Tomcat/Prolyte truss and modular staging, owned and operated in Indore.",
  alternates: { canonical: "/gear" },
};

export default function GearPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Gear", path: "/gear" }])} />
      <section className="pb-4 pt-40">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Gear"
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
