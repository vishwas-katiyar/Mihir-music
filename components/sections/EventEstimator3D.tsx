"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Lightbulb, Speaker, Construction, Users, Clock, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  estimate,
  buildWhatsappPayload,
  eventTypes,
  crowdSizes,
  venueTypes,
  type EventTypeId,
  type CrowdId,
  type VenueId,
} from "@/lib/estimator";
import { EstimatorCanvas } from "@/components/3d/EstimatorCanvas";
import { packages, closestPackage } from "@/lib/packages";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { cn, formatINR } from "@/lib/utils";

interface Props {
  /** Full-page variant adds the contact fields */
  expanded?: boolean;
  /** Where the inquiry originated — stored with the lead */
  source?: "estimator" | "drawer";
}

interface Availability {
  level: "open" | "moderate" | "high";
  demand: number;
  weekend: boolean;
}

const inputCls =
  "w-full rounded-xl border border-white/12 bg-stage/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-amber/60 focus:ring-4 focus:ring-amber/10";

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: readonly { id: T; label: string }[];
}) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3 text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.id)}
              className={cn(
                "rounded-full border px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all duration-300 active:scale-[0.97]",
                active
                  ? "border-amber bg-amber text-black"
                  : "border-white/12 bg-white/5 text-ink/80 hover:border-white/30 hover:text-ink",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * Interactive 3D Event Stage Estimator.
 * Every selection re-runs the deterministic model in lib/estimator.ts; the 3D scene and
 * the WhatsApp payload both read from that single result, so they can never disagree.
 */
export function EventEstimator3D({ expanded = false, source = "estimator" }: Props) {
  const [eventType, setEventType] = useState<EventTypeId>("wedding");
  const [crowd, setCrowd] = useState<CrowdId>("s");
  const [venue, setVenue] = useState<VenueId>("lawn");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [availability, setAvailability] = useState<Availability | null>(null);
  /** Package the visitor tapped; null means "follow the estimate". Cleared whenever the estimate changes. */
  const [pickedPackage, setPickedPackage] = useState<string | null>(null);

  // A tapped package overrides "nearest to this estimate"; a new estimate clears the override.
  useEffect(() => setPickedPackage(null), [eventType, crowd, venue]);

  // KV-backed date demand lookup while the visitor picks a date
  useEffect(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setAvailability(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/availability?date=${date}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => j?.ok && setAvailability({ level: j.level, demand: j.demand, weekend: j.weekend }))
        .catch(() => null);
    }, 250);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [date]);

  /** Fire-and-forget persistence; WhatsApp opens regardless of the API outcome. */
  const persistQuote = () => {
    const payload = JSON.stringify({ eventType, crowd, venue, name, phone, city, date, source });
    try {
      fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => null);
    } catch {
      /* offline — ignore */
    }
  };

  const result = useMemo(() => estimate({ eventType, crowd, venue }), [eventType, crowd, venue]);
  const people = crowdSizes.find((c) => c.id === crowd)?.people ?? 350;
  const nearest = useMemo(() => closestPackage(result.price.mid), [result.price.mid]);
  const pkg = packages.find((p) => p.id === pickedPackage) ?? nearest;
  const href = useMemo(() => buildWhatsappPayload(result, { name, date, city }, pkg), [result, name, date, city, pkg]);

  const rigLines = [
    { Icon: Lightbulb, text: `${result.rig.beams} moving-head beams · ${result.rig.pixelBars} pixel bars` },
    { Icon: Speaker, text: `Line array ${result.rig.arrayBoxesPerSide}/side · ${result.rig.subsPerSide} subs/side` },
    { Icon: Construction, text: `Truss ${Math.round(result.rig.trussWidth)} m × ${result.rig.trussHeight} m · stage ${Math.round(result.rig.stageWidth)}×${Math.round(result.rig.stageDepth)} m` },
    { Icon: Users, text: `Crew of ${result.crew}` },
    { Icon: Clock, text: `Setup ${result.setupHours}` },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      {/* 3D preview */}
      <div className="relative min-h-[380px] min-w-0 overflow-hidden rounded-[2rem] border border-white/8 bg-stage-2 sm:min-h-[460px] lg:min-h-[620px]">
        <EstimatorCanvas rig={result.rig} people={people} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-5">
          <span className="eyebrow rounded-full border border-white/12 bg-stage/70 px-3 py-1.5 text-ink/80 backdrop-blur">
            Live rig preview · drag to orbit
          </span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={result.labels.eventType}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="eyebrow rounded-full px-3 py-1.5 text-black"
              style={{ background: result.rig.accent }}
            >
              {result.labels.eventType}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls + readout */}
      <div className="glass flex min-w-0 flex-col gap-7 rounded-[2rem] p-6 sm:p-8">
        <Segmented label="Event type" value={eventType} onChange={setEventType} options={eventTypes} />
        <Segmented label="Crowd size" value={crowd} onChange={setCrowd} options={crowdSizes} />
        <Segmented label="Venue" value={venue} onChange={setVenue} options={venueTypes} />

        {expanded && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow mb-2 block text-muted">Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" autoComplete="name" className={inputCls} />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block text-muted">Phone</span>
              <input type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" autoComplete="tel" className={inputCls} />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block text-muted">Event date</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              {availability && (
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 text-[11px]",
                    availability.level === "high" ? "text-pink" : availability.level === "moderate" ? "text-amber-soft" : "text-cyan",
                  )}
                >
                  <CalendarCheck className="h-3.5 w-3.5" />
                  {availability.level === "high"
                    ? `High demand: ${availability.demand} other inquiries for this date. Confirm early.`
                    : availability.level === "moderate"
                      ? availability.weekend
                        ? "Peak weekend. Good availability, lock the crew soon."
                        : "Some interest on this date. Still open."
                      : "Date looks open."}
                </span>
              )}
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block text-muted">City</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Indore, Bhopal…" autoComplete="address-level2" className={inputCls} />
            </label>
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-stage/60 p-5">
          <div className="eyebrow text-muted">Estimated production budget</div>
          {/* Prices count to the new value (state transition made visible) */}
          {/* flex-wrap so the two figures can break onto separate lines on narrow phones */}
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 font-display text-3xl font-bold tracking-[-0.04em] text-ink sm:text-4xl">
            <AnimatedNumber value={result.price.low} format={formatINR} springOptions={{ stiffness: 90, damping: 22 }} />
            <span className="text-muted">to</span>
            <AnimatedNumber value={result.price.high} format={formatINR} springOptions={{ stiffness: 90, damping: 22 }} />
          </div>
          <ul className="mt-5 space-y-2.5 text-sm text-ink/85">
            {rigLines.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber" strokeWidth={1.5} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Indicative range for {result.labels.eventType.toLowerCase()}, {result.labels.crowd} guests, {result.labels.venue.toLowerCase()}.
            Final quote depends on date, travel and show duration.
          </p>

          {/* Packages live here now (the comparison table was retired): three starting prices,
              the one nearest the estimate preselected, tap another to read what it includes. */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="eyebrow text-muted">Closest starting point</span>
              <span className="text-xs text-muted">Starting prices in rupees</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Production package">
              {packages.map((p) => {
                const active = p.id === pkg.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setPickedPackage(p.id === nearest.id ? null : p.id)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-left transition-colors duration-300 active:scale-[0.98]",
                      active ? "border-amber bg-amber/10" : "border-white/12 bg-white/5 hover:border-white/30",
                    )}
                  >
                    <span className={cn("block text-xs font-medium leading-tight", active ? "text-ink" : "text-ink/80")}>{p.name}</span>
                    <span className={cn("mt-1 block font-display text-base font-semibold tracking-[-0.03em]", active ? "text-amber" : "text-ink")}>
                      {formatINR(p.priceValue)}
                    </span>
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-ink/85 sm:grid-cols-2">
              {pkg.features.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2.5 h-px w-3 shrink-0 bg-amber" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={persistQuote}
          className="group inline-flex items-center justify-center gap-3 rounded-full bg-amber px-6 py-4 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-soft active:scale-[0.98]"
        >
          <MessageCircle className="h-4 w-4" />
          Send this estimate on WhatsApp
        </a>
      </div>
    </div>
  );
}
