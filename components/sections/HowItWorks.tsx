import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

/**
 * Booking in four steps. Every claim here is traceable to lib/faqs.ts or lib/site.ts
 * (working hours, payment methods, load-in times, written load plans). No advance
 * percentages or turnaround promises, because none are published elsewhere on the site.
 * Layout is a two-by-two of plain text blocks separated by space, not boxes: the steps
 * are read in order, they do not compete as cards.
 */
const steps = [
  {
    title: "Tell us about the show",
    body: "Event type, crowd, venue and date, on WhatsApp, by phone or through the 3D estimator on this page. We answer 09:00 to 22:00, every day, in English or Hindi.",
  },
  {
    title: "Rig plan and quote",
    body: "We size the array, lighting and truss for the room, then send a written quote in rupees. Flown systems come with a written load plan before anything goes up.",
  },
  {
    title: "Lock the date",
    body: "Confirm and pay by cash, UPI or bank transfer. The gear quoted is the gear that arrives: every module, fixture and truss section is owned, not sub-hired.",
  },
  {
    title: "Show day",
    body: "Load-in runs 2 to 8 hours depending on the rig. The FOH engineer tunes the system with SMAART, a live operator runs the lights, and the crew strikes after the last song.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <h2 id="how-it-works-title" className="display-tight max-w-[14ch] text-4xl uppercase text-ink sm:text-5xl">Four steps to show night</h2>
          <p className="mt-5 max-w-[52ch] text-base text-muted">
            First show with us? This is the whole process, from the first message to load-out. Prefer to talk it through? Call{" "}
            <a href={`tel:${site.phone}`} className="text-ink underline decoration-white/30 underline-offset-4 transition hover:decoration-gold">
              {site.phoneDisplay}
            </a>{" "}
            or{" "}
            <Link href="/contact" className="text-ink underline decoration-white/30 underline-offset-4 transition hover:decoration-gold">
              send your event details from the contact page
            </Link>
            .
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14 border-t border-white/10 pt-12">
          <ol className="grid gap-x-16 gap-y-12 sm:grid-cols-2 lg:max-w-5xl">
            {steps.map((s) => (
              <li key={s.title}>
                <h3 className="display-tight text-2xl uppercase text-ink sm:text-3xl">{s.title}</h3>
                <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-ink/80 sm:text-base">{s.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </section>
  );
}
