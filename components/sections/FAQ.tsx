import { faqs as defaultFaqs, type Faq } from "@/lib/faqs";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Answers are always visible: a two-column definition list, no accordion, no cards.
 * Every word is in the HTML for search engines and AI answers.
 */
export function FAQ({ items = defaultFaqs, title = "Straight answers" }: { items?: Faq[]; title?: string }) {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <h2 className="display-tight text-4xl uppercase text-ink sm:text-5xl">{title}</h2>
        </Reveal>
        <dl className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2">
          {items.map((f, i) => (
            <Reveal key={f.q} delay={(i % 2) * 0.06} as="div">
              <dt className="font-display text-lg font-semibold tracking-[-0.02em] text-ink">{f.q}</dt>
              <dd className="mt-3 text-sm leading-relaxed text-muted">{f.a}</dd>
            </Reveal>
          ))}
        </dl>
      </Container>
    </section>
  );
}
