"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { EventEstimator3D } from "@/components/sections/EventEstimator3D";

interface DrawerCtx {
  open: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const Ctx = createContext<DrawerCtx | null>(null);

export function useEstimateDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useEstimateDrawer must be used inside <EstimateDrawerProvider>");
  return ctx;
}

export function EstimateDrawerProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openDrawer = useCallback(() => setOpen(true), []);
  const closeDrawer = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, openDrawer, closeDrawer }), [open, openDrawer, closeDrawer]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Glassmorphic bottom sheet that hosts the full 3D estimator without leaving the page.
 * Drag down or press Escape to dismiss. The estimator (and its WebGL canvas) only
 * mounts while the sheet is open.
 */
export function EstimateDrawer() {
  const { open, closeDrawer } = useEstimateDrawer();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, closeDrawer]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-charcoal/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDrawer}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Instant 3D event estimator"
            onClick={(e) => e.stopPropagation()}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 140 || info.velocity.y > 800) closeDrawer();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 190, damping: 26 }}
            className="glass-specular flex max-h-[94dvh] w-full max-w-7xl flex-col rounded-t-[2.25rem]"
          >
            <div className="flex items-center justify-between px-6 pt-4 sm:px-8">
              <div className="mx-auto h-1.5 w-14 rounded-full bg-white/35" aria-hidden />
            </div>
            <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-3 sm:px-8">
              <h2 className="display-tight text-2xl uppercase text-ink sm:text-3xl">Configure the show. Send it to WhatsApp.</h2>
              <button type="button" onClick={closeDrawer} aria-label="Close estimator" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-ink transition hover:border-gold/60 hover:text-gold">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 overflow-y-auto px-4 pb-8 sm:px-8">
              <EventEstimator3D expanded source="drawer" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
