import Image from "next/image";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { Reveal } from "@/components/ui/Reveal";
import { curatedReviews, type Review } from "@/lib/reviews";
import { getGoogleReviews } from "@/lib/reviews/business-profile";
import { site } from "@/lib/site";

/**
 * Reviews as two counter-scrolling rows of cards with faded edges. Layout pattern
 * from 21st.dev "Testimonials Marquee" (shadcnspace/marquee-01), restyled to the site:
 * gold stars, glass cards on the charcoal ground. Hovering a row pauses it so a quote can
 * be read in full. The glass here skips backdrop blur: the cards are in constant motion
 * and sit on a flat ground with nothing to frost.
 *
 * Content is live Google reviews when the Business Profile API env vars are set
 * (lib/reviews/business-profile.ts, cached a day), falling back to three hand-picked
 * real testimonials otherwise — never empty, never invented either way.
 */
function ReviewCard({ r }: { r: Review }) {
  const name = r.authorUrl ? (
    <a href={r.authorUrl} target="_blank" rel="noreferrer" className="block truncate font-medium text-ink transition hover:text-gold">
      {r.name}
    </a>
  ) : (
    <span className="block truncate font-medium text-ink">{r.name}</span>
  );
  return (
    <figure className="flex h-full w-[19rem] shrink-0 flex-col justify-between rounded-2xl border border-white/9 bg-[linear-gradient(180deg,rgb(18_24_33/0.86),rgb(12_17_25/0.78))] p-5 shadow-panel sm:w-[22rem]">
      <blockquote className="text-base leading-relaxed text-ink/90">“{r.text}”</blockquote>
      <figcaption className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2.5">
          {r.avatarUrl && <Image src={r.avatarUrl} alt="" width={32} height={32} className="h-8 w-8 shrink-0 rounded-full object-cover" unoptimized />}
          <span className="min-w-0">
            {name}
            <span className="block truncate text-xs text-muted">{r.role ?? (r.relativeTime ? `${r.relativeTime} · Google` : "")}</span>
          </span>
        </span>
        <span className="flex shrink-0 text-gold" aria-label={`${r.rating} out of 5 stars`}>
          {Array.from({ length: r.rating }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} aria-hidden />
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

export async function Testimonials() {
  const live = await getGoogleReviews();
  const reviews = live && live.reviews.length > 0 ? live.reviews : curatedReviews;

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
