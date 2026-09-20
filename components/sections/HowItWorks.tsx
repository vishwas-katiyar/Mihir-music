import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";

/**
 * Booking in four steps. Every claim here is traceable to lib/faqs.ts or lib/site.ts
 * (working hours, payment methods, load-in times, written load plans). No advance
 * percentages or turnaround promises, because none are published elsewhere on the site.
 */
const steps = [
  {
    title: "Tell us the show",
    body: `Event type, crowd, venue and date, on WhatsApp, by phone or through the 3D estimator on this page. We answer 09:00 to 22:00, every day of the week, in English or Hindi.`,
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
    <section id="how-it-works" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="display-tight max-w-[14ch] text-4xl uppercase text-ink sm:text-5xl">Four steps to show night</h2>
            </div>
            <p className="max-w-[40ch] text-base text-muted">
              First show with us? This is the whole process, from the first message to load-out.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.title} className="flex flex-col bg-stage p-6 sm:p-7">
                <h3 className="display-tight text-2xl uppercase text-ink">{s.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ink/80">{s.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <p className="mt-6 text-sm text-muted">
          Prefer to talk it through? Call{" "}
          <a href={`tel:${site.phone}`} className="text-ink underline decoration-white/30 underline-offset-4 transition hover:decoration-gold">
            {site.phoneDisplay}
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
