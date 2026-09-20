import type { Metadata } from "next";
import { HeroStage } from "@/components/sections/HeroStage";
import { ProofBand } from "@/components/sections/ProofBand";
import { RecentWork } from "@/components/sections/RecentWork";
import { ShowFormats } from "@/components/sections/ShowFormats";
import { ServicesList } from "@/components/sections/ServicesList";
import { GearHighlights } from "@/components/sections/GearHighlights";
import { BrandMarquee } from "@/components/sections/BrandMarquee";
import { HowItWorks } from "@/components/sections/HowItWorks";
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
            dateModified: "2026-09-20",
          }),
          faqSchema(),
        ]}
      />
      <HeroStage />
      <ProofBand />
      <RecentWork />
      <ShowFormats />
      <ServicesList />
      <EstimatorSection />
      <PackagesCompare />
      <GearHighlights />
      <BrandMarquee />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <ClosingCTA />
    </>
  );
}
