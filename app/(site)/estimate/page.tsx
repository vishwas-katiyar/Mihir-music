import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EventEstimator3D } from "@/components/sections/EventEstimator3D";
import { FAQ } from "@/components/sections/FAQ";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, faqSchema, shareMeta, webPageSchema } from "@/lib/schema";
import { faqs } from "@/lib/faqs";

const title = "Sound & Light Cost Estimator, Indore";
const description =
  "Pick event type, crowd size and venue for an instant sound, lighting and stage budget in Indore with a live 3D rig preview, then send it to WhatsApp in one tap.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/estimate" },
  ...shareMeta({ title, description, path: "/estimate" }),
};

export default function EstimatePage() {
  const pricingFaqs = faqs.filter((f) => /cost|quote|price|setup/i.test(f.q));
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ name: title, description, path: "/estimate", dateModified: "2026-09-21" }),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Estimate", path: "/estimate" }]),
          faqSchema(pricingFaqs),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Estimate", href: "/estimate" }]} />
      <section className="pb-6 pt-8">
        <Container>
          <SectionHeading
            as="h1"
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
      <FAQ items={pricingFaqs} title="How pricing works." />
    </>
  );
}
