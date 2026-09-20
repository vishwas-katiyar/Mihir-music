import { Container } from "@/components/ui/Container";
import { Marquee } from "@/components/ui/Marquee";
import { gearBrands } from "@/lib/gear";

/**
 * Brands on the truck. A single slow marquee of manufacturer names taken from the owned
 * inventory in lib/gear.ts, so every name here is something a buyer can find in the gear
 * table. Text chips rather than logos: no trademark artwork to license, and the names
 * stay crawlable. Reduced-motion users get a static row (globals.css).
 */
export function BrandMarquee() {
  return (
    <section aria-label="Equipment brands we own" className="border-b border-white/10 py-10">
      <Container className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">On our trucks</h2>
        <p className="text-sm text-muted">Owned inventory. Serviced between shows.</p>
      </Container>
      <div className="relative">
        <Marquee pauseOnHover repeat={6} className="[--duration:48s] [--gap:0.75rem]">
          {gearBrands.map((b) => (
            <span
              key={b.name}
              className="flex shrink-0 items-baseline gap-3 rounded-full border border-white/10 bg-panel/40 px-5 py-3"
            >
              <span className="font-display text-base font-semibold tracking-[-0.02em] text-ink sm:text-lg">{b.name}</span>
              <span className="eyebrow text-muted">{b.role}</span>
            </span>
          ))}
        </Marquee>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-stage to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-stage to-transparent" />
      </div>
    </section>
  );
}
