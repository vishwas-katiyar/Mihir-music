"use client";

import { useRef } from "react";
import { ArrowRight, ChevronDown, MessageCircle, Star } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { RigShowcase } from "@/components/3d/RigShowcase";
import { Container } from "@/components/ui/Container";
import { useEstimateDrawer } from "@/components/providers/EstimateDrawer";
import { site, whatsappUrl, defaultWhatsappMessage } from "@/lib/site";

const years = new Date().getFullYear() - site.foundingYear;
const ease = [0.32, 0.72, 0, 1] as const;
const spring = { type: "spring", stiffness: 400, damping: 22 } as const;

/**
 * Immersive hero: the live 3D rig is the full-bleed backdrop, copy sits on a scrim in
 * front of it. Phones see the truss above the fold with the message anchored at the
 * bottom; desktops get a split read with the rig filling the right two-thirds.
 * Two actions only (estimate drawer, WhatsApp) and one line of verifiable trust.
 */
export function HeroStage() {
  const { openDrawer } = useEstimateDrawer();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  // Parallax on exit: rig drifts down and copy fades as the hero scrolls away. Transform + opacity only.
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

      <Container className="pointer-events-none relative z-10 flex flex-1 flex-col justify-end pt-32 pb-12 sm:pb-16 lg:justify-center lg:pt-36 lg:pb-28">
        <motion.div className="pointer-events-auto max-w-[44rem] lg:max-w-[52rem]" style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}>
          <motion.p
            className="eyebrow text-gold"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span>
              {site.address.locality}
              <span className="hidden sm:inline"> · Live event production</span> · since {site.foundingYear}
            </span>
          </motion.p>

          <TextEffect
            as="h1"
            per="word"
            preset="fade-in-blur"
            speedReveal={1.6}
            delay={0.15}
            className="display-tight mt-5 text-balance uppercase text-ink text-[clamp(2.75rem,1.5rem+5.5vw,5rem)]"
          >
            Sound and light that fill the floor.
          </TextEffect>

          {/* data-speakable: the one-sentence answer voice assistants may read aloud (see lib/schema.ts webPageSchema) */}
          <div data-speakable>
            <TextEffect
              as="p"
              per="word"
              preset="fade"
              delay={0.6}
              speedReveal={3}
              className="mt-6 max-w-[48ch] text-base leading-relaxed text-ink/80 sm:text-lg"
            >
              Line arrays, Sharpy beams and certified truss for weddings, concerts and corporate shows across Madhya Pradesh. One crew from Indore, one call.
            </TextEffect>
          </div>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6, ease }}
          >
            <motion.button
              type="button"
              onClick={openDrawer}
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={spring}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gold px-7 text-sm font-semibold text-charcoal shadow-glow-gold transition-[filter] hover:brightness-105"
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
              <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden />
              WhatsApp us
            </motion.a>
          </motion.div>

          {/* Trust line: every figure here is verifiable (Google profile, company age, service area). */}
          <motion.ul
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <li>
              <a
                href={site.social.google}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-ink"
              >
                <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden />
                <span>
                  <span className="font-semibold text-ink">{site.rating.value}</span> · {site.rating.count}+ Google reviews
                </span>
              </a>
            </li>
            <li>{years}+ years of live shows</li>
            <li className="hidden sm:block">Indore · Bhopal · Ujjain · Pan-India</li>
          </motion.ul>
        </motion.div>
      </Container>

      {/* Desktop footer row: scroll cue on the left, rig caption on the right. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-7 z-10 hidden lg:block">
        <Container className="flex items-end justify-between">
          <motion.div
            className="eyebrow flex items-center gap-2 text-muted"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            <motion.span
              animate={reduce ? undefined : { y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="inline-flex"
              aria-hidden
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.span>
            Scroll
          </motion.div>
          <motion.p
            className="eyebrow text-muted"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            Live 3D · our standard wedding rig · drag to orbit
          </motion.p>
        </Container>
      </div>
    </section>
  );
}
