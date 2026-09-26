import type { Metadata } from "next";
import { HeroStage } from "@/components/sections/HeroStage";
import { ProofBand } from "@/components/sections/ProofBand";
import { RecentWork } from "@/components/sections/RecentWork";
import { ServicesList } from "@/components/sections/ServicesList";
import { GearHighlights } from "@/components/sections/GearHighlights";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { AboutCrew } from "@/components/sections/AboutCrew";
import { EstimatorSection } from "@/components/sections/EstimatorSection";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema, shareMeta, webPageSchema } from "@/lib/schema";
import { site } from "@/lib/site";

/** Brand first on the home result (54 chars, under the 60 Google shows); the root layout's 84-char default is too long. */
const title = `${site.name} | Event Sound & Lighting in Indore`;
const description =
  "Line-array sound, DMX stage lighting, truss rigging and DJ setups for weddings, concerts and corporate events in Indore. Owned gear and a live crew since 2012.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  ...shareMeta({ title, description, path: "/" }),
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
      <ServicesList />
      <EstimatorSection />
      <GearHighlights />
      <HowItWorks />
      <AboutCrew />
      <Testimonials />
      <FAQ />
      <ClosingCTA />
    </>
  );
}
