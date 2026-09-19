import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventEstimator3D } from "@/components/sections/EventEstimator3D";
import { PackagesCompare } from "@/components/sections/PackagesCompare";
import { FAQ } from "@/components/sections/FAQ";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { faqs } from "@/lib/faqs";

export const metadata: Metadata = {
  title: "Instant 3D Event Estimate: Sound, Lighting & Stage Cost Calculator",
  description:
    "Pick event type, crowd size and venue to see a live 3D stage preview and an instant budget range for sound, lighting and rigging in Indore and across India. Send the exact rig to WhatsApp in one tap.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  const pricingFaqs = faqs.filter((f) => /cost|quote|price|setup/i.test(f.q));
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Estimate", path: "/estimate" }])} />
      <section className="pb-6 pt-40">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Instant estimator"
            title="Configure the show. See the rig. Send it."
            lead="Three choices give you a live 3D stage and a realistic budget range. Add your date and city and the whole thing lands in Mihir's WhatsApp. No forms, no waiting."
          />
        </Container>
      </section>
      <section className="pb-24">
        <Container>
          <EventEstimator3D expanded />
        </Container>
      </section>
      <PackagesCompare />
      <FAQ items={pricingFaqs} title="How pricing works." />
    </>
  );
}
