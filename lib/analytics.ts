"use client";

/**
 * GA4 event tracking. `@next/third-parties/google`'s <GoogleAnalytics> (app/layout.tsx)
 * defines window.gtag globally, so this just calls it defensively — safe to import from
 * any client component, and a silent no-op in dev/without consent/with an ad-blocker.
 */
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent = "whatsapp_click" | "phone_click" | "estimate_submit" | "contact_submit";

export function trackEvent(name: AnalyticsEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {
    /* analytics must never break the page */
  }
}
