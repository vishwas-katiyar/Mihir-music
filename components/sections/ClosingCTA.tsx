import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { site, whatsappUrl, defaultWhatsappMessage } from "@/lib/site";

export function ClosingCTA() {
  return (
    <section className="border-t border-white/10 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <h2 className="display-tight max-w-[16ch] text-4xl uppercase text-ink sm:text-6xl lg:col-span-8">
              Your date is the only thing we can’t rent more of.
            </h2>
            <div className="lg:col-span-4 lg:justify-self-end">
              <p className="max-w-[34ch] text-base text-muted">Peak wedding and festival weekends fill months ahead. Lock the crew first, then design the show.</p>
              <a
                href={whatsappUrl(defaultWhatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-charcoal transition hover:brightness-105 active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp {site.phoneDisplay}
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
