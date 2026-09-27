import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { areas } from "@/lib/areas";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { breadcrumbSchema, shareMeta, webPageSchema, ID } from "@/lib/schema";
import { Container } from "@/components/ui/Container";
import { GlassCard } from "@/components/ui/GlassCard";
import { Reveal } from "@/components/ui/Reveal";

// Bare title: the root layout's template appends " | Mihir Sound & Light" for the <title> tag.
const title = "Areas we serve beyond Indore";
const description = `${site.name} is based in Indore and regularly travels to Bhopal, Ujjain and Dewas for weddings, concerts and corporate events, plus pan-India destination shows.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/areas" },
  ...shareMeta({ title, description, path: "/areas" }),
};

export default function AreasIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ name: "Areas we serve beyond Indore", description, path: "/areas", mainEntity: { "@id": ID.business }, dateModified: "2026-09-27" }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Areas", path: "/areas" },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Areas", href: "/areas" }]} />
      <section className="pt-8 pb-24">
        <Container>
          <div className="eyebrow text-gold">Coverage</div>
          <h1 className="display-tight mt-4 max-w-4xl text-balance text-4xl uppercase text-ink sm:text-6xl">Based in Indore, travelling further.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/85">
            The crew, rig and FOH engineer are the same wherever the show is. Beyond Indore we regularly travel to:
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {areas.map((a, i) => (
              <Reveal key={a.slug} delay={i * 0.06}>
                <Link href={`/areas/${a.slug}`}>
                  <GlassCard className="h-full transition hover:border-gold/40">
                    <h2 className="font-display text-2xl font-semibold text-ink">{a.city}</h2>
                    <p className="mt-2 text-sm text-muted">{a.distanceKm} km from Indore · {a.driveTime}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                      See {a.city} coverage <ArrowRight className="h-4 w-4" />
                    </span>
                  </GlassCard>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-sm text-muted">
            Also across Madhya Pradesh and pan-India for the right scope. Ask on{" "}
            <Link href="/contact" className="text-ink underline decoration-white/30 underline-offset-4 hover:decoration-gold">
              the contact page
            </Link>{" "}
            if your city isn&apos;t listed.
          </p>
        </Container>
      </section>
    </>
  );
}
