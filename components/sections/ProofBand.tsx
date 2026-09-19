"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { Container } from "@/components/ui/Container";
import { site } from "@/lib/site";

const years = new Date().getFullYear() - site.foundingYear;

/** Every figure here is verifiable: company age, the Google profile, and owned inventory. */
const stats = [
  { value: years, suffix: "+", label: `years producing live shows, since ${site.foundingYear}` },
  { value: site.rating.count, suffix: "+", label: `Google reviews, rated ${site.rating.value} out of 5` },
  { value: 24, suffix: "", label: "Clay Paky Sharpy moving heads in stock" },
  { value: 8, suffix: " t", label: "certified flown load on Tomcat and Prolyte truss" },
];

/** Full-width figures band. Numbers count up once the band scrolls into view. */
export function ProofBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <section aria-label="Company facts" className="border-y border-white/10">
      <Container>
        <div ref={ref} className="grid grid-cols-2 divide-white/10 md:grid-cols-4 md:divide-x">
          {stats.map((s, i) => (
            <div key={s.label} className={i % 2 === 1 ? "py-8 pl-6 md:pl-8" : "py-8 pr-6 md:pr-8 md:[&:not(:first-child)]:pl-8"}>
              <div className="font-display text-4xl font-bold tracking-[-0.04em] text-ink sm:text-5xl">
                <AnimatedNumber value={inView ? s.value : 0} springOptions={{ stiffness: 60, damping: 20 }} />
                <span className="text-gold">{s.suffix}</span>
              </div>
              <p className="mt-2 max-w-[22ch] text-sm leading-snug text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
