import Link from "next/link";
import Image from "next/image";
import { Globe, Phone, Mail, MapPin } from "lucide-react";
import { Instagram, Youtube, Facebook } from "@/components/ui/SocialIcons";
import { site, nav } from "@/lib/site";
import { services } from "@/lib/services";
import { Container } from "@/components/ui/Container";

/**
 * Footer link labels say what the page is, not just its nav name, so the anchor text
 * carries meaning for crawlers as well as visitors. Keyed by route so lib/site.ts stays
 * the single source of the route list.
 */
const exploreLabels: Record<(typeof nav)[number]["href"], string> = {
  "/services": "Event production services",
  "/gear": "Sound, lighting and rigging inventory",
  "/portfolio": "Live show portfolio",
  "/estimate": "Instant 3D event estimate",
  "/contact": "Contact and booking",
};

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-white/8 bg-stage-2/60">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex" aria-label={`${site.name} home`}>
              <Image src="/logo-horizontal.svg" alt={site.name} width={300} height={130} className="h-auto w-[280px] max-w-full" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              Live event production from Indore, Madhya Pradesh: line-array sound, intelligent DMX lighting, certified truss
              rigging and show execution for weddings, concerts and corporate events across India since {site.foundingYear}.
            </p>
            <address className="mt-6 space-y-2 text-sm not-italic text-muted">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                <span>
                  {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}
                </span>
              </div>
              <a href={`tel:${site.phone}`} className="flex items-center gap-2 hover:text-ink">
                <Phone className="h-4 w-4 text-gold" /> {site.phoneDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-ink">
                <Mail className="h-4 w-4 text-gold" /> {site.email}
              </a>
            </address>
          </div>

          <div>
            <h3 className="eyebrow text-gold">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/" className="text-muted transition hover:text-ink">
                  {site.name} home
                </Link>
              </li>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-muted transition hover:text-ink">
                    {exploreLabels[n.href] ?? n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-gold">Services</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="text-muted transition hover:text-ink">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-gold">Service areas</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {site.areasServed.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className="mt-8 flex gap-2">
              {[
                { href: site.social.instagram, Icon: Instagram, label: "Instagram" },
                { href: site.social.youtube, Icon: Youtube, label: "YouTube" },
                { href: site.social.facebook, Icon: Facebook, label: "Facebook" },
                { href: site.social.google, Icon: Globe, label: "Google Business" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${site.name} on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted transition hover:border-gold/60 hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Rated {site.rating.value}/5 from {site.rating.count}+ Google reviews.
          </p>
          <p className="text-xs text-muted">Sound, light, rigging and show control.</p>
        </div>
      </Container>
    </footer>
  );
}
