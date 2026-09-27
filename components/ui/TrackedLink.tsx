"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

/**
 * A plain `<a>` that also fires a GA4 event on click — for wiring analytics onto CTAs
 * that live in server components (ClosingCTA, ContactSection, Footer) without converting
 * the whole section to a client component.
 */
export function TrackedLink({
  event,
  params,
  ...rest
}: { event: AnalyticsEvent; params?: Record<string, string | number | boolean | undefined> } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...rest} onClick={() => trackEvent(event, params)} />;
}
