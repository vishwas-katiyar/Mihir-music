"use client";

import { Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation, CarouselIndicator } from "@/components/motion-primitives/carousel";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { reviews } from "@/lib/reviews";
import { site } from "@/lib/site";

/** One quote at a time in large type (motion-primitives Carousel, drag or arrows). */
export function Testimonials() {
  return (
    <section id="reviews" className="border-y border-white/10 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="display-tight text-4xl uppercase text-ink sm:text-5xl">What clients say</h2>
            <a href={site.social.google} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink">
              <span className="flex text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                ))}
              </span>
              {site.rating.value} on Google, {site.rating.count}+ reviews
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Carousel className="pb-12">
            <CarouselContent>
              {reviews.map((r) => (
                <CarouselItem key={r.name} className="px-1">
                  <figure className="max-w-4xl">
                    <blockquote className="font-display text-2xl leading-snug tracking-[-0.02em] text-ink sm:text-3xl lg:text-4xl">“{r.text}”</blockquote>
                    <figcaption className="mt-6 text-sm text-muted">
                      <span className="text-ink">{r.name}</span>, {r.role.toLowerCase()}
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNavigation alwaysShow className="left-auto right-0 top-auto -bottom-1 w-auto translate-y-0 gap-2 px-0" classNameButton="bg-white/5 ring-1 ring-white/12 hover:bg-white/10 [&_svg]:stroke-ink" />
            <CarouselIndicator className="justify-start" classNameButton="bg-white/25 data-[active]:bg-gold" />
          </Carousel>
        </Reveal>
      </Container>
    </section>
  );
}
