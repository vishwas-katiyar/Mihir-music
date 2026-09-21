"use client";

import { useRef } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { RigShowcase } from "@/components/3d/RigShowcase";
import { Container } from "@/components/ui/Container";
import { useEstimateDrawer } from "@/components/providers/EstimateDrawer";
import { whatsappUrl, defaultWhatsappMessage } from "@/lib/site";

const spring = { type: "spring", stiffness: 400, damping: 22 } as const;

/**
 * Immersive hero: the live 3D rig is the full-bleed backdrop, copy sits on a scrim in
 * front of it. Phones see the truss above the fold with the message anchored at the
 * bottom; desktops get a split read with the rig filling the right two-thirds.
 * Three text elements only: headline, one sentence, two actions. Trust figures live in
 * the proof band directly below, the location label lives in the navbar.
 */
export function HeroStage() {
  const { openDrawer } = useEstimateDrawer();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Parallax on exit: rig drifts down and copy lifts as the hero scrolls away. Transform + opacity only.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const rigY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const copyOpacity = useTransform(scrollYProgress, [0.4, 1], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section ref={ref} className="relative isolate flex min-h-svh flex-col overflow-hidden">
      {/* Stage layer: full-bleed on phones, pushed right on desktop so copy owns the left third. */}
      <motion.div className="absolute inset-0 lg:left-[22%]" style={reduce ? undefined : { y: rigY }} aria-hidden>
        <RigShowcase className="absolute inset-0" />
      </motion.div>

      {/* Scrims keep text at contrast without hiding the rig: bottom-up on phones, left-to-right on desktop. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,var(--color-stage)_0%,rgb(7_9_13/0.88)_30%,rgb(7_9_13/0.35)_58%,transparent_100%)] lg:bg-[linear-gradient(to_right,var(--color-stage)_0%,rgb(7_9_13/0.94)_32%,rgb(7_9_13/0.45)_54%,transparent_76%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-stage to-transparent" />

      <Container className="pointer-events-none relative z-10 flex flex-1 flex-col justify-end pt-24 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] sm:pb-20 lg:justify-center lg:pb-24">
        {/* One entrance for the whole message: headline, sentence, actions rise in turn (CSS, see --animate-enter). */}
        <motion.div className="pointer-events-auto max-w-[44rem] lg:max-w-[52rem]" style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}>
          <h1 className="display-tight text-balance uppercase text-ink text-[clamp(2.75rem,1.5rem+5.5vw,5rem)] animate-enter [animation-delay:120ms]">
            Sound and light that fill the floor.
          </h1>

          {/* data-speakable: the one-sentence answer voice assistants may read aloud (see lib/schema.ts webPageSchema) */}
          <p data-speakable className="mt-6 max-w-[44ch] text-base leading-relaxed text-ink/80 animate-enter [animation-delay:220ms] sm:text-lg">
            Line arrays, Sharpy beams and certified truss for weddings, concerts and corporate shows across Madhya Pradesh.
          </p>

          <div className="mt-8 flex flex-col gap-3 animate-enter [animation-delay:320ms] sm:flex-row sm:items-center sm:gap-4">
            <motion.button
              type="button"
              onClick={openDrawer}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={spring}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gold px-7 text-sm font-semibold text-charcoal transition-[filter] hover:brightness-105"
            >
              Get an estimate
              <ArrowRight className="h-4 w-4" aria-hidden />
            </motion.button>
            <motion.a
              href={whatsappUrl(defaultWhatsappMessage)}
              target="_blank"
              rel="noreferrer"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={spring}
              className="glass inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold text-ink transition-colors hover:border-white/25"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </motion.a>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
