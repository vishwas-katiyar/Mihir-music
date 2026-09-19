"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { RigShowcase } from "@/components/3d/RigShowcase";
import { Container } from "@/components/ui/Container";
import { useEstimateDrawer } from "@/components/providers/EstimateDrawer";

/**
 * Split hero: message left, a contained interactive 3D rig right (auto-orbit, beams
 * follow the cursor). One primary action (estimate) and one secondary link (work).
 */
export function HeroCalm() {
  const { openDrawer } = useEstimateDrawer();
  const reduce = useReducedMotion();

  return (
    <section className="relative pt-28 pb-16 sm:pt-32 lg:pb-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <TextEffect
              as="h1"
              per="word"
              preset="fade-in-blur"
              speedReveal={1.6}
              className="display-tight max-w-[12ch] text-[2.9rem] uppercase leading-[0.95] text-ink sm:text-[4.2rem] lg:text-[5rem]"
            >
              Sound, light and staging for shows people talk about.
            </TextEffect>

            {/* data-speakable: the one-sentence answer voice assistants may read aloud (see lib/schema.ts webPageSchema) */}
            <div data-speakable>
              <TextEffect as="p" per="word" preset="fade" delay={0.5} speedReveal={3} className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink/80">
                Line arrays, Sharpy beams and certified truss for weddings, concerts and corporate events, run by one crew from Indore.
              </TextEffect>
            </div>

            <motion.div
              className="mt-9 flex flex-wrap items-center gap-6"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            >
              <button
                type="button"
                onClick={openDrawer}
                className="inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-charcoal transition hover:brightness-105 active:scale-[0.98]"
              >
                Get an estimate
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="#work" className="text-sm text-ink/80 underline decoration-white/30 underline-offset-4 transition hover:text-ink hover:decoration-gold">
                See recent shows
              </Link>
            </motion.div>
          </div>

          <motion.figure
            className="lg:col-span-6"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12] sm:aspect-[4/3] lg:aspect-[5/6]">
              <RigShowcase className="absolute inset-0" />
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-sm text-muted">
              <span>Our standard wedding rig, live. Drag to orbit; the beams follow your cursor.</span>
            </figcaption>
          </motion.figure>
        </div>
      </Container>
    </section>
  );
}
