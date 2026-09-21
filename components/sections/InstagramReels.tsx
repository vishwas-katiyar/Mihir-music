"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNavigation, CarouselIndicator } from "@/components/motion-primitives/carousel";
import { Instagram } from "@/components/ui/SocialIcons";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { instagramEmbedUrl, instagramHandle, instagramReels, instagramReelUrl, instagramUrl } from "@/lib/media";

/** One reel embed. The iframe mounts only when the card scrolls near the viewport. */
function ReelEmbed({ code, index }: { code: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 bg-charcoal">
      {show ? (
        <iframe
          title={`Instagram reel ${index + 1} from @${instagramHandle}`}
          src={instagramEmbedUrl(code)}
          loading="lazy"
          allow="encrypted-media; clipboard-write"
          allowFullScreen
          className="absolute inset-0 h-[calc(100%+2px)] w-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex items-end p-4">
          <a href={instagramReelUrl(code)} target="_blank" rel="noreferrer" className="text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
            Open on Instagram
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Recent shows as a carousel (motion-primitives Carousel): three reels per view on
 * desktop, one on phones; drag, arrows or dots to move. Embeds come straight from
 * Instagram, where the business posts.
 */
export function InstagramReels() {
  const codes = instagramReels.slice(0, 9);
  return (
    <section id="work" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="display-tight max-w-[14ch] text-4xl uppercase text-ink sm:text-5xl">Recent shows</h2>
              <p className="mt-4 max-w-[52ch] text-base text-muted">Filmed on the night and posted as it happens. Swipe through the latest.</p>
            </div>
            <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-ink/80 transition hover:text-gold">
              <Instagram className="h-4 w-4" /> @{instagramHandle} <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <Carousel className="pb-14">
            <CarouselContent className="-ml-4 items-start md:-ml-6" transition={{ type: "spring", stiffness: 120, damping: 22 }}>
              {codes.map((code, i) => (
                <CarouselItem key={code} className="pl-4 sm:w-1/2 md:w-1/3 md:pl-6">
                  <ReelEmbed code={code} index={i} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNavigation
              alwaysShow
              className="left-auto right-0 top-auto -bottom-1 w-auto translate-y-0 gap-2 px-0"
              classNameButton="bg-white/5 ring-1 ring-white/12 hover:bg-white/10 [&_svg]:stroke-ink"
            />
            <CarouselIndicator className="justify-start" classNameButton="bg-white/25" />
          </Carousel>
        </Reveal>
      </Container>
    </section>
  );
}
