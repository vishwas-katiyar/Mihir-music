"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { nav, site, whatsappUrl, defaultWhatsappMessage } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Floating "island" nav: detached glass pill on desktop, full-screen staggered overlay on mobile.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <nav
        aria-label="Primary"
        className={cn(
          "flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border px-3 py-2 transition-all duration-500 ease-stage",
          scrolled || open ? "glass border-white/10" : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="flex items-center gap-3 pl-1" aria-label={`${site.name} home`}>
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full border border-amber/50 object-cover"
          />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="eyebrow text-amber-soft">Indore · Since {site.foundingYear}</span>
            <span className="font-display text-lg font-bold tracking-[-0.05em] text-ink">{site.name}</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "eyebrow rounded-full px-4 py-2.5 transition-colors",
                    active ? "bg-white/8 text-amber" : "text-ink/75 hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl(defaultWhatsappMessage)}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-amber px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-amber-soft sm:inline-flex"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/5 lg:hidden"
          >
            <span
              className={cn(
                "absolute h-px w-5 bg-ink transition-transform duration-500 ease-stage",
                open ? "rotate-45" : "-translate-y-1.5",
              )}
            />
            <span
              className={cn(
                "absolute h-px w-5 bg-ink transition-transform duration-500 ease-stage",
                open ? "-rotate-45" : "translate-y-1.5",
              )}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[-1] flex flex-col justify-end bg-stage/92 px-6 pb-12 pt-28 backdrop-blur-2xl lg:hidden"
          >
            <ul className="flex flex-col gap-2">
              {nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Link href={item.href} className="display-tight block py-2 text-5xl uppercase text-ink">
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-10 flex flex-col gap-3"
            >
              <a
                href={whatsappUrl(defaultWhatsappMessage)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-5 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Mihir
              </a>
              <a href={`tel:${site.phone}`} className="eyebrow text-center text-muted">
                {site.phoneDisplay}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
