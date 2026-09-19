import type { Metadata } from "next";
import { HeroCalm } from "@/components/sections/HeroCalm";
import { ProofBand } from "@/components/sections/ProofBand";
import { InstagramReels } from "@/components/sections/InstagramReels";
import { ServicesList } from "@/components/sections/ServicesList";
import { EstimatorSection } from "@/components/sections/EstimatorSection";
import { PackagesCompare } from "@/components/sections/PackagesCompare";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, webPageSchema } from "@/lib/schema";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({
            name: `${site.name}: line-array sound, DMX stage lighting and truss rigging in Indore`,
            description: site.description,
            path: "/",
            dateModified: "2026-09-19",
          }),
          faqSchema(),
        ]}
      />
      <HeroCalm />
      <ProofBand />
      <InstagramReels />
      <ServicesList />
      <EstimatorSection />
      <PackagesCompare />
      <Testimonials />
      <FAQ />
      <ClosingCTA />
    </>
  );
}
