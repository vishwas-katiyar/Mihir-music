import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { packages, tierRows } from "@/lib/packages";
import { whatsappUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Packages as one comparison table. Rows are what actually changes between tiers,
 * so a planner can read across instead of decoding three marketing cards.
 * Scrolls horizontally on phones; the tier names stay visible as column headers.
 */
export function PackagesCompare() {
  return (
    <section id="packages" className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <h2 className="display-tight max-w-[14ch] text-4xl uppercase text-ink sm:text-5xl">Three ways to start</h2>
          <p className="mt-5 max-w-[60ch] text-base text-muted">
            Starting prices in rupees. Every tier scales with crowd and venue; the estimator gives a crowd-specific figure.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">Comparison of the Club, Wedding Luxe and Arena Fest production packages</caption>
              <thead>
                <tr className="border-b border-white/10 align-bottom">
                  <th scope="col" className="w-[18%] py-4 pr-6 font-normal text-muted">
                    What changes
                  </th>
                  {packages.map((p) => (
                    <th key={p.id} scope="col" className={cn("py-4 pr-6", p.featured && "border-t-2 border-gold")}>
                      <span className="block font-display text-xl font-semibold tracking-[-0.02em] text-ink">{p.name}</span>
                      <span className="mt-1 block text-xs text-muted">{p.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tierRows.map((row, ri) => (
                  <tr key={row.label} className={cn(ri < tierRows.length - 1 && "border-b border-white/8")}>
                    <th scope="row" className="py-5 pr-6 align-top font-normal text-muted">
                      {row.label}
                    </th>
                    {row.values.map((v, i) => (
                      <td
                        key={i}
                        className={cn(
                          "py-5 pr-6 align-top text-ink/90",
                          packages[i].featured && "bg-white/[0.025]",
                          row.label === "Starting price" && "font-display text-2xl font-semibold tracking-[-0.03em] text-ink",
                        )}
                      >
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="pt-6" />
                  {packages.map((p) => (
                    <td key={p.id} className={cn("pt-6 pr-6", p.featured && "bg-white/[0.025]")}>
                      <a
                        href={whatsappUrl(`Hi Mihir, I'm interested in the ${p.name} package (${p.price}). Please share availability and details.`)}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
                          p.featured ? "bg-gold text-charcoal hover:brightness-105" : "border border-white/15 text-ink hover:border-gold/60",
                        )}
                      >
                        <MessageCircle className="h-4 w-4" /> {p.cta}
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
