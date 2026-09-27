import { toPaise } from "@/lib/invoices/calc";

/** One pickable line in the "Add item" sheet. Rate is a starting point — the admin can edit it after adding. */
export interface CatalogItem {
  title: string;
  description: string;
  /** Rupees; converted to paise below so this file stays readable. */
  rate: number;
}

export interface CatalogCategory {
  category: string;
  items: CatalogItem[];
}

/**
 * Starter catalog of what Mihir Sound & Light actually bills, grouped the way gear.ts and
 * services.ts already name things. Prices are typical per-event starting rates, not fixed —
 * every field on the inserted line stays editable.
 */
export const INVOICE_CATALOG: CatalogCategory[] = [
  {
    category: "Sound",
    items: [
      { title: "Line array sound system", description: "Flown JBL/RCF line array with cardioid subs and FOH engineer", rate: 45000 },
      { title: "Compact PA system", description: "Dual line-array tops and subs for smaller stages", rate: 18000 },
      { title: "Digital mixing console", description: "Soundcraft/Yamaha 48-channel console with engineer", rate: 8000 },
      { title: "Wireless microphone", description: "Additional handheld or lapel mic beyond the standard kit", rate: 1500 },
    ],
  },
  {
    category: "Lighting",
    items: [
      { title: "DMX moving head lighting rig", description: "Clay Paky Sharpy beams, Avolites console and operator", rate: 35000 },
      { title: "LED pixel mapping", description: "Elation/Chauvet pixel bars with RGB scene design", rate: 15000 },
      { title: "Haze & cold spark effects", description: "Low-fog, haze machine and cold pyrotechnics for entries", rate: 9000 },
    ],
  },
  {
    category: "Stage & video",
    items: [
      { title: "Stage & truss structure", description: "Tomcat/Prolyte aluminium truss with modular decking", rate: 40000 },
      { title: "LED video wall", description: "P3/P4 outdoor LED wall with IMAG playback", rate: 60000 },
    ],
  },
  {
    category: "DJ & party",
    items: [
      { title: "DJ setup with operator", description: "Pioneer-standard console, dance-floor PA and effect lighting", rate: 22000 },
      { title: "MC / anchor", description: "Professional emcee for the event", rate: 8000 },
    ],
  },
  {
    category: "Crew & services",
    items: [
      { title: "Show caller & production crew", description: "Stage manager, RF/hardline comms and run-of-show", rate: 15000 },
      { title: "Additional technician", description: "Extra hands for load-in, changeovers or load-out, per day", rate: 2000 },
    ],
  },
  {
    category: "Logistics",
    items: [
      { title: "Silent generator", description: "Backup power for the full rig, per day", rate: 6000 },
      { title: "Transport & logistics", description: "Vehicle and freight for gear to and from the venue", rate: 5000 },
    ],
  },
];

export const catalogRatePaise = (item: CatalogItem) => toPaise(item.rate);
