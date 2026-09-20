import type { Metadata } from "next";
import { Instagram, Youtube } from "@/components/ui/SocialIcons";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TiltCard } from "@/components/ui/TiltCard";
import { Reveal } from "@/components/ui/Reveal";
import { InstagramReels } from "@/components/sections/InstagramReels";
import { Testimonials } from "@/components/sections/Testimonials";
import { ClosingCTA } from "@/components/sections/ClosingCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { formats as showFormats } from "@/lib/formats";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Live Show Portfolio: Weddings, Concerts, Corporate & Club Productions",
  description:
    "Production formats we run in Indore and across India: wedding sangeet stages, open-ground concerts, corporate summits and club nights, with the rig specs behind each one.",
  alternates: { canonical: "/portfolio" },
};

/**
 * Show formats rather than invented client names (data in lib/formats.ts, shared with
 * the home page digest). Photos and reels live on Instagram and YouTube, linked below.
 */
const styling = {
  wedding: { accent: "amber" as const, gradient: "from-amber/25 via-transparent to-pink/15" },
  concert: { accent: "cyan" as const, gradient: "from-cyan/25 via-transparent to-violet/20" },
  corporate: { accent: "white" as const, gradient: "from-white/15 via-transparent to-cyan/15" },
  club: { accent: "amber" as const, gradient: "from-pink/20 via-transparent to-amber/20" },
} satisfies Record<string, { accent: "amber" | "cyan" | "white"; gradient: string }>;

const formats = showFormats.map((f) => ({
  title: f.title,
  stat: f.audience,
  rig: f.rig,
  ...styling[f.slug as keyof typeof styling],
}));

const accentText = { amber: "text-amber", cyan: "text-cyan", white: "text-ink" };

export default function PortfolioPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Portfolio", path: "/portfolio" }])} />
      <section className="pb-4 pt-40">
        <Container>
          <SectionHeading
            as="h1"
            eyebrow="Portfolio"
            title="Four show formats we've refined over a decade of load-ins."
            lead="Every event is different; the rig logic is not. Here is what each format needs and how we build it. Watch the shows themselves on Instagram and YouTube."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.social.instagram} target="_blank" rel="noreferrer" className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-ink/85 transition hover:border-amber/60 hover:text-amber">
              <Instagram className="h-4 w-4" /> Reels on Instagram
            </a>
            <a href={site.social.youtube} target="_blank" rel="noreferrer" className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 text-ink/85 transition hover:border-amber/60 hover:text-amber">
              <Youtube className="h-4 w-4" /> Show videos on YouTube
            </a>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {formats.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <TiltCard glint={f.accent} intensity={7} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/8 bg-panel/40">
                    <div className={cn("relative h-48 bg-gradient-to-br sm:h-56", f.gradient)}>
                      <div className="grid-bg absolute inset-0 opacity-70" />
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <h2 className="display-tight text-2xl uppercase text-ink sm:text-3xl">{f.title}</h2>
                      <p className={cn("mt-2 text-sm", accentText[f.accent])}>{f.stat}</p>
                      <ul className="mt-5 space-y-2.5 text-sm text-ink/85">
                        {f.rig.map((r) => (
                          <li key={r} className="flex gap-3">
                            <span className={cn("mt-2 h-1 w-1 shrink-0 rounded-full", f.accent === "cyan" ? "bg-cyan" : f.accent === "white" ? "bg-ink" : "bg-amber")} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <InstagramReels />
      <Testimonials />
      <ClosingCTA />
    </>
  );
}
