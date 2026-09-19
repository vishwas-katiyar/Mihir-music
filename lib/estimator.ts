import { site } from "./site";

/**
 * Deterministic estimator model.
 * The same config object drives the 3D stage preview AND the WhatsApp payload,
 * so what the visitor sees is exactly what gets sent.
 */

export const eventTypes = [
  { id: "wedding", label: "Luxe Wedding", base: 120_000, beamBias: 1.0, audioBias: 0.9, colour: "#ffb347" },
  { id: "concert", label: "Concert / Fest", base: 240_000, beamBias: 1.4, audioBias: 1.4, colour: "#4de5ff" },
  { id: "corporate", label: "Corporate Summit", base: 100_000, beamBias: 0.8, audioBias: 0.9, colour: "#f8fafc" },
  { id: "club", label: "Club Night", base: 75_000, beamBias: 1.2, audioBias: 1.0, colour: "#ff4ecd" },
] as const;

export const crowdSizes = [
  { id: "xs", label: "Under 200", factor: 0.7, people: 150 },
  { id: "s", label: "200 to 500", factor: 1.0, people: 350 },
  { id: "m", label: "500 to 1,500", factor: 1.5, people: 1000 },
  { id: "l", label: "1,500 to 5,000", factor: 2.4, people: 3000 },
  { id: "xl", label: "5,000+", factor: 3.6, people: 8000 },
] as const;

export const venueTypes = [
  { id: "banquet", label: "Banquet Hall", factor: 1.0, lightFactor: 0.9, trussHeight: 5, indoor: true },
  { id: "lawn", label: "Lawn / Farmhouse", factor: 1.15, lightFactor: 1.1, trussHeight: 6.5, indoor: false },
  { id: "ground", label: "Open Ground / Arena", factor: 1.35, lightFactor: 1.3, trussHeight: 8.5, indoor: false },
  { id: "club", label: "Rooftop / Club", factor: 0.9, lightFactor: 1.0, trussHeight: 4.2, indoor: true },
] as const;

export type EventTypeId = (typeof eventTypes)[number]["id"];
export type CrowdId = (typeof crowdSizes)[number]["id"];
export type VenueId = (typeof venueTypes)[number]["id"];

export interface EstimateInput {
  eventType: EventTypeId;
  crowd: CrowdId;
  venue: VenueId;
}

export interface EstimateResult {
  input: EstimateInput;
  /** Rig configuration consumed by the 3D scene */
  rig: {
    beams: number;
    arrayBoxesPerSide: number;
    subsPerSide: number;
    trussWidth: number;
    trussHeight: number;
    stageWidth: number;
    stageDepth: number;
    pixelBars: number;
    haze: boolean;
    accent: string;
  };
  /** Price envelope in INR */
  price: { low: number; high: number; mid: number };
  crew: number;
  setupHours: string;
  labels: { eventType: string; crowd: string; venue: string };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const roundTo = (v: number, step: number) => Math.round(v / step) * step;

export function estimate(input: EstimateInput): EstimateResult {
  const ev = eventTypes.find((e) => e.id === input.eventType) ?? eventTypes[0];
  const crowd = crowdSizes.find((c) => c.id === input.crowd) ?? crowdSizes[1];
  const venue = venueTypes.find((v) => v.id === input.venue) ?? venueTypes[0];

  const mid = roundTo(ev.base * crowd.factor * venue.factor, 5000);
  const low = roundTo(mid * 0.85, 5000);
  const high = roundTo(mid * 1.18, 5000);

  const beams = clamp(Math.round(8 * crowd.factor * ev.beamBias * venue.lightFactor), 6, 48);
  const arrayBoxesPerSide = clamp(Math.round(2 + crowd.factor * 2.2 * ev.audioBias), 2, 12);
  const subsPerSide = clamp(Math.round(1 + crowd.factor * 1.1 * ev.audioBias), 1, 6);
  const stageWidth = clamp(8 + crowd.factor * 3.5, 8, 22);
  const stageDepth = clamp(4 + crowd.factor * 1.4, 4, 10);
  const trussWidth = stageWidth + 2;
  const pixelBars = clamp(Math.round(beams * 0.75), 4, 36);
  const crew = clamp(Math.round(3 + crowd.factor * 3 + (venue.indoor ? 0 : 1)), 3, 18);
  const setupHours = crowd.factor >= 2.4 ? "8-12 hrs (day-before load-in)" : crowd.factor >= 1.5 ? "5-8 hrs" : "2-5 hrs";

  return {
    input,
    rig: {
      beams,
      arrayBoxesPerSide,
      subsPerSide,
      trussWidth,
      trussHeight: venue.trussHeight,
      stageWidth,
      stageDepth,
      pixelBars,
      haze: ev.id !== "corporate",
      accent: ev.colour,
    },
    price: { low, high, mid },
    crew,
    setupHours,
    labels: { eventType: ev.label, crowd: crowd.label, venue: venue.label },
  };
}

export function buildWhatsappPayload(r: EstimateResult, contact?: { name?: string; date?: string; city?: string }) {
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const lines = [
    `Hi Mihir! I built an estimate on your website and would like to book.`,
    ``,
    `Event: ${r.labels.eventType}`,
    `Crowd: ${r.labels.crowd}`,
    `Venue: ${r.labels.venue}`,
    contact?.city ? `City: ${contact.city}` : "",
    contact?.date ? `Date: ${contact.date}` : "",
    contact?.name ? `Name: ${contact.name}` : "",
    ``,
    `Suggested rig:`,
    `• ${r.rig.beams} moving-head beams + ${r.rig.pixelBars} pixel bars`,
    `• Line array ${r.rig.arrayBoxesPerSide} boxes/side, ${r.rig.subsPerSide} subs/side`,
    `• Truss ${Math.round(r.rig.trussWidth)}m × ${r.rig.trussHeight}m, stage ${Math.round(r.rig.stageWidth)}×${Math.round(r.rig.stageDepth)}m`,
    `• Crew of ${r.crew}, setup ${r.setupHours}`,
    ``,
    `Estimate: ${inr(r.price.low)} to ${inr(r.price.high)}`,
    ``,
    `Please confirm availability and a final quote.`,
  ].filter((l) => l !== "");
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}
