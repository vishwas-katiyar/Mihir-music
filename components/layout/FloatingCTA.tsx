"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Phone } from "lucide-react";
import { site, whatsappUrl, defaultWhatsappMessage } from "@/lib/site";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.52 3.48A11.79 11.79 0 0 0 12.08 0C5.46 0 .05 5.4.05 12.03c0 2.12.55 4.18 1.6 6l-1.7 6.2 6.36-1.67a11.97 11.97 0 0 0 5.77 1.75h.01c6.62 0 12.03-5.4 12.03-12.03 0-3.21-1.25-6.24-3.48-8.5Zm-8.44 18.47h-.01a9.92 9.92 0 0 1-5.07-1.38l-.36-.22-3.77 1 .99-3.66-.24-.38a9.9 9.9 0 0 1-1.52-5.2c0-5.47 4.46-9.93 9.94-9.93A9.9 9.9 0 0 1 21.97 12c0 5.48-4.46 9.95-9.93 9.95Zm5.46-7.44c-.3-.15-1.77-.87-2.05-.97-.28-.11-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.47-.88-.78-1.48-1.73-1.66-2.02-.17-.3-.02-.46.13-.6.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.94-2.24-.25-.59-.5-.51-.68-.52l-.58-.01c-.2 0-.52.08-.8.38-.28.3-1.07 1.05-1.07 2.56 0 1.5 1.09 2.96 1.24 3.16.15.2 2.14 3.27 5.18 4.58.72.32 1.28.51 1.72.66.73.23 1.39.2 1.91.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35Z" />
    </svg>
  );
}

/**
 * Floating actions on small screens: WhatsApp on the glass surface, then the call, gold
 * and closest to the thumb, mirroring the hero's pair. The nav carries WhatsApp on desktop.
 * They stay away until the first viewport has scrolled past, because every page opens with
 * its own pair of buttons and the discs would sit on top of them.
 */
export function FloatingCTA() {
  const reduce = useReducedMotion();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const actions = [
    {
      key: "whatsapp",
      href: whatsappUrl(defaultWhatsappMessage),
      external: true,
      label: `WhatsApp ${site.name}`,
      surface: "glass text-ink",
      icon: <WhatsAppIcon className="h-6 w-6" />,
    },
    {
      key: "call",
      href: `tel:${site.phone}`,
      external: false,
      label: `Call ${site.name} on ${site.phoneDisplay}`,
      surface: "bg-gold text-charcoal shadow-[0_12px_40px_rgb(0_0_0/0.45)]",
      icon: <Phone className="h-5 w-5" aria-hidden />,
    },
  ];

  return (
    <div className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] z-40 flex flex-col gap-3 lg:hidden">
      <AnimatePresence>
        {past &&
          actions.map((a, i) => (
            <motion.a
              key={a.key}
              href={a.href}
              {...(a.external ? { target: "_blank", rel: "noreferrer" } : {})}
              aria-label={a.label}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 22, delay: reduce ? 0 : i * 0.04 }}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              className={`flex h-13 w-13 items-center justify-center rounded-full transition-[filter] hover:brightness-105 ${a.surface}`}
            >
              {a.icon}
            </motion.a>
          ))}
      </AnimatePresence>
    </div>
  );
}
