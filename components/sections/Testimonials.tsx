import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { reviews, type Review } from "@/lib/reviews";
import { site } from "@/lib/site";

/**
 * Reviews as two counter-scrolling rows of cards with faded edges. Layout pattern
 * from 21st.dev "Testimonials Marquee" (shadcnspace/marquee-01), restyled to the site:
 * no avatars, no handles, gold stars, glass cards on the charcoal ground. Hovering a
 * row pauses it so a quote can be read in full. The glass here skips backdrop blur:
 * the cards are in constant motion and sit on a flat ground with nothing to frost.
 */
function ReviewCard({ r }: { r: Review }) {
  return (
    <figure className="flex h-full w-[19rem] shrink-0 flex-col justify-between rounded-2xl border border-white/9 bg-[linear-gradient(180deg,rgb(18_24_33/0.86),rgb(12_17_25/0.78))] p-5 shadow-panel sm:w-[22rem]">
      <blockquote className="text-base leading-relaxed text-ink/90">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span>
          <span className="block font-medium text-ink">{r.name}</span>
          <span className="block text-xs text-muted">{r.role}</span>
        </span>
        <span className="flex text-gold" aria-label={`${r.rating} out of 5 stars`}>
          {Array.from({ length: r.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  const half = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, half);
  const secondRow = reviews.length > 1 ? [...reviews.slice(half), ...reviews.slice(0, half)].filter((r, i, a) => a.indexOf(r) === i) : reviews;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="border-y border-white/10 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="reviews-title" className="display-tight text-4xl uppercase text-ink sm:text-5xl">What clients say</h2>
            <a href={site.social.google} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted transition hover:text-ink">
              <span className="flex text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                ))}
              </span>
              {site.rating.value} on Google, {site.rating.count}+ reviews
            </a>
          </div>
        </Reveal>
      </Container>

      <Reveal delay={0.1} className="relative mt-12">
        <Marquee pauseOnHover className="py-2 [--duration:55s] [--gap:1rem]">
          {firstRow.map((r) => (
            <ReviewCard key={r.name} r={r} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="py-2 [--duration:65s] [--gap:1rem]">
          {secondRow.map((r) => (
            <ReviewCard key={r.name} r={r} />
          ))}
        </Marquee>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-charcoal to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/5 bg-gradient-to-l from-charcoal to-transparent" />
      </Reveal>
    </section>
  );
}
