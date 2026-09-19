import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Capabilities } from "@/components/sections/Capabilities";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema, serviceSchema } from "@/lib/schema";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Event Production Services: Sound, Lighting, Rigging, DJ & Show Control",
  description:
    "Line-array sound systems, intelligent DMX stage lighting, certified truss rigging, DJ setups and show execution for weddings, concerts and corporate events in Indore and across India.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={[breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]), ...services.map(serviceSchema)]} />
      <section className="pb-4 pt-40">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Services"
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
