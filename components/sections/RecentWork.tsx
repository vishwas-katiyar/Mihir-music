import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StagePoster } from "@/components/3d/StagePoster";
import { Instagram } from "@/components/ui/SocialIcons";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { formats, type ShowFormat } from "@/lib/formats";
import { instagramHandle, instagramUrl, photos, type Photo } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Work strip: one card per show format, photo-first. Until real photos are added
 * to lib/media.ts each card falls back to the CSS stage poster with the format named on
 * it, so nothing on the page pretends to be a photograph. The moment a photo with a
 * matching `category` exists it takes over the card, with venue and city in the caption.
 */
function WorkCard({ format, photo, featured }: { format: ShowFormat; photo?: Photo; featured?: boolean }) {
  const caption = photo ? [photo.venue, photo.city].filter(Boolean).join(", ") : format.audience;

  return (
    <article className="group relative flex h-full flex-col">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12]",
          featured ? "aspect-[4/3] lg:aspect-auto lg:min-h-0 lg:flex-1" : "aspect-[4/3]",
        )}
      >
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={featured ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-700 ease-stage group-hover:scale-[1.03]"
          />
        ) : (
          <>
            <StagePoster accent="amber" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07090d] to-transparent" />
            <p
              className={cn(
                "display-tight absolute left-5 top-5 max-w-[10ch] uppercase text-ink/90",
                featured ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl",
              )}
            >
              {format.shortTitle}
            </p>
          </>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{photo ? photo.alt : format.title}</h3>
          <p className="mt-1 truncate text-sm text-muted">{caption}</p>
        </div>
        <Link
          href="/portfolio"
          aria-label={`${format.title}: see the full portfolio`}
          className="mt-1 shrink-0 rounded-full border border-white/12 p-2 text-muted transition hover:border-gold/60 hover:text-gold"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function RecentWork() {
  const featured = formats[0];
  const rest = formats.slice(1);
  const photoFor = (slug: ShowFormat["slug"]) => photos.find((p) => p.category === slug);

  return (
    <section id="work" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="display-tight max-w-[14ch] text-4xl uppercase text-ink sm:text-5xl">Four shows, one crew</h2>
              <p className="mt-4 max-w-[52ch] text-base text-muted">
                The rigs we run every season, from a 300-guest sangeet to a 10,000-crowd ground.
              </p>
            </div>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-ink/80 transition hover:text-gold">
              <Instagram className="h-4 w-4" /> Filmed on the night: @{instagramHandle} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>

        {/* Reveal's motion wrapper takes no className, so grid placement lives on plain cells and height is passed down the chain. */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
          <div className="sm:col-span-2 lg:row-span-2 [&>*]:h-full">
            <Reveal className="h-full">
              <WorkCard format={featured} photo={photoFor(featured.slug)} featured />
            </Reveal>
          </div>
          {rest.map((f, i) => (
            <div key={f.slug} className={cn("[&>*]:h-full", i === 2 && "sm:col-span-2")}>
              <Reveal delay={0.08 * (i + 1)} className="h-full">
                <WorkCard format={f} photo={photoFor(f.slug)} />
              </Reveal>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
