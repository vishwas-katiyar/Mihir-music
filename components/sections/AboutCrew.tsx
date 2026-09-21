import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { crewPhoto } from "@/lib/media";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const years = new Date().getFullYear() - site.foundingYear;

/**
 * Who turns up. A statement block in the company's own voice, no invented quotes and no
 * stock people: the only name is the founder's (lib/site.ts). When a real crew photo is
 * added to lib/media.ts the section becomes a split with the photo on the right; until
 * then it is text only rather than a placeholder box pretending to be a photograph.
 * Every fact below is traceable to lib/site.ts or lib/faqs.ts.
 */
const facts = [
  `Founded by ${site.legalOwner} in ${site.address.locality}, ${site.foundingYear}`,
  "A FOH engineer tunes every system on site",
  "Insured rigging crew, written load plan for every flown build",
  "English and Hindi, 09:00 to 22:00, seven days",
];

export function AboutCrew() {
  return (
    <section id="about" className="border-t border-white/10 py-24 sm:py-32">
      <Container>
        <div className={cn("grid gap-12", crewPhoto && "lg:grid-cols-12 lg:items-center lg:gap-16")}>
          <Reveal className={cn(crewPhoto && "lg:col-span-7")}>
            <h2 className="display-tight max-w-[16ch] text-4xl uppercase text-ink sm:text-5xl lg:text-6xl">
              {years} years of load-ins, one crew.
            </h2>
            <div className="mt-8 max-w-[58ch] space-y-5 text-base leading-relaxed text-ink/80 sm:text-lg">
              <p>
                The people who quote your show are the people who rig it. No sub-hired gear, no handover between a sales desk and a
                site crew.
              </p>
              <p>
                On the night, one engineer owns the sound from soundcheck to the last song, and one operator runs the lights live
                instead of leaving them on auto.
              </p>
            </div>
            <ul className="mt-10 grid gap-x-10 gap-y-3 border-t border-white/10 pt-6 text-sm text-muted sm:grid-cols-2">
              {facts.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </Reveal>

          {crewPhoto && (
            <Reveal delay={0.1} className="lg:col-span-5">
              <figure>
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 bg-[#0b0d12]">
                  <Image src={crewPhoto.src} alt={crewPhoto.alt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
                {crewPhoto.caption && <figcaption className="mt-3 text-sm text-muted">{crewPhoto.caption}</figcaption>}
              </figure>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
