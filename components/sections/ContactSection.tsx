import { Phone, MessageCircle, Globe, MapPin, Clock } from "lucide-react";
import { Instagram, Youtube, Facebook } from "@/components/ui/SocialIcons";
import { site, whatsappUrl, defaultWhatsappMessage } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { ContactForm } from "./ContactForm";

export function ContactSection({ as = "h2" }: { as?: "h1" | "h2" }) {
  return (
    <section id="contact" className="py-28 sm:py-36">
      <Container>
        <Reveal>
          <SectionHeading as={as} title="Let's build the right signal path." lead="Tell us the date, the city and the scale. We reply on WhatsApp within the hour during show season." />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Reveal>
              <GlassCard>
                <div className="eyebrow text-amber">Direct line</div>
                <h3 className="display-tight mt-4 text-3xl uppercase text-ink">{site.legalOwner}</h3>
                <address className="mt-3 flex items-start gap-2 text-sm not-italic text-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                  {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}
                </address>
                <div className="mt-6 flex flex-col gap-3">
                  <a href={`tel:${site.phone}`} className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink transition hover:border-amber/60 hover:text-amber">
                    <Phone className="h-4 w-4" /> {site.phoneDisplay}
                  </a>
                  <a href={whatsappUrl(defaultWhatsappMessage)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-ink transition hover:border-amber/60 hover:text-amber">
                    <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { href: site.social.instagram, Icon: Instagram, label: "Instagram" },
                    { href: site.social.youtube, Icon: Youtube, label: "YouTube" },
                    { href: site.social.facebook, Icon: Facebook, label: "Facebook" },
                    { href: site.social.google, Icon: Globe, label: "Google" },
                  ].map(({ href, Icon, label }) => (
                    <a key={label} href={href} target="_blank" rel="noreferrer" className="eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-ink/80 transition hover:border-amber/60 hover:text-amber">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </a>
                  ))}
                </div>
              </GlassCard>
            </Reveal>

            <Reveal delay={0.08}>
              <GlassCard>
                <div className="eyebrow text-amber">Venue intel</div>
                <dl className="mt-5 divide-y divide-white/10 text-sm">
                  {[
                    ["Venue type", "Indoor / Outdoor / Open ground"],
                    ["Formats", "Wedding / Concert / Corporate / Club"],
                    ["Typical setup", "2-8 hours"],
                    ["Coverage", "Indore + pan-India"],
                    ["Hours", "Every day, 9:00 to 22:00"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-muted">{k}</dt>
                      <dd className="text-right text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" /> Show-season response time: under an hour on WhatsApp.
                </div>
              </GlassCard>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <GlassCard inner="p-6 sm:p-8">
              <ContactForm />
            </GlassCard>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
