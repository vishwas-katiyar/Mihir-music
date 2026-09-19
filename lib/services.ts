export type ServiceSlug =
  | "arena-audio"
  | "dmx-lighting"
  | "stage-rigging"
  | "dj-setup"
  | "show-execution";

export interface ServiceSpec {
  label: string;
  value: string;
}

export interface Service {
  slug: ServiceSlug;
  code: string;
  name: string;
  shortName: string;
  accent: "amber" | "cyan" | "white";
  headline: string;
  summary: string;
  /** One-sentence direct answer for generative search engines. */
  definition: string;
  specs: ServiceSpec[];
  deliverables: string[];
  idealFor: string[];
  keywords: string[];
  faq: { q: string; a: string }[];
}

export const services: Service[] = [
  {
    slug: "arena-audio",
    code: "SYS-01",
    name: "Arena Audio & Line-Array Sound Systems",
    shortName: "Arena Audio",
    accent: "amber",
    headline: "Sound you feel in your chest, tuned so every seat hears the same mix.",
    summary:
      "Phase-aligned line arrays, cardioid subwoofers and SMAART-tuned system design for weddings, concerts and corporate stages in Indore and across India.",
    definition:
      "Arena audio is a professionally designed, high-SPL sound system, typically a flown or ground-stacked line array with cardioid subs, engineered to give even coverage and intelligible sound across audiences from 200 to 20,000 people.",
    specs: [
      { label: "System", value: "JBL VT / RCF HDL line array modules" },
      { label: "Low end", value: "JBL SRX / RCF SUB 902 cardioid subs" },
      { label: "Peak SPL", value: "140 dB SPL ready" },
      { label: "Consoles", value: "Soundcraft / Behringer 48-ch digital" },
      { label: "Tuning", value: "SMAART phase alignment on-site" },
      { label: "Monitoring", value: "Stage wedges + IEM options" },
    ],
    deliverables: [
      "Venue coverage prediction and array placement",
      "FOH and monitor engineer for the full show",
      "Wireless mics, DI boxes and playback rigs",
      "Redundant signal path and backup console",
    ],
    idealFor: ["Concerts & festivals", "Wedding sangeet stages", "Corporate summits", "Club nights"],
    keywords: [
      "line array sound system rental Indore",
      "concert sound system Madhya Pradesh",
      "wedding sound system Indore",
      "professional audio hire India",
    ],
    faq: [
      {
        q: "How big a crowd can your line array cover?",
        a: "Our flown line-array configurations comfortably cover open-ground audiences of 5,000+ people at concert SPL. For banquet halls and lawns we scale down to compact arrays so the mix stays clean without overpowering the room.",
      },
      {
        q: "Do you provide a sound engineer with the system?",
        a: "Yes. Every system ships with a live FOH engineer who tunes the rig on-site with SMAART and mixes the show end-to-end.",
      },
    ],
  },
  {
    slug: "dmx-lighting",
    code: "SYS-02",
    name: "Intelligent DMX Stage Lighting",
    shortName: "DMX Lighting",
    accent: "cyan",
    headline: "Moving heads, pixel bars and haze, programmed to the beat, not left on auto.",
    summary:
      "Clay Paky Sharpy beams, LED pixel mapping and Avolites-programmed cues that turn a stage into a scene. Wedding-soft to festival-loud.",
    definition:
      "Intelligent DMX lighting uses digitally controlled moving-head fixtures, LED pixel bars and effects (strobes, haze, lasers) programmed on a lighting console so every look and colour change is cued precisely to the show.",
    specs: [
      { label: "Movers", value: "Clay Paky Sharpy 10R / 15R beams" },
      { label: "Console", value: "Avolites Tiger Touch Pro, 1024 ch" },
      { label: "Pixels", value: "Elation / Chauvet LED mapping bars" },
      { label: "Effects", value: "Strobes, haze, lasers, scenic washes" },
      { label: "Fixture count", value: "Up to 48 movers on one rig" },
      { label: "Programming", value: "Timecoded or live-busked cues" },
    ],
    deliverables: [
      "Lighting design plot mapped to the truss",
      "Pre-programmed looks for each show segment",
      "Live lighting operator throughout",
      "Haze and atmosphere management",
    ],
    idealFor: ["Wedding entries & first dances", "Concert headliner sets", "Product launches", "Award nights"],
    keywords: [
      "stage lighting Indore",
      "moving head lights rental Indore",
      "wedding lighting design Madhya Pradesh",
      "concert stage lighting rig cost India",
    ],
    faq: [
      {
        q: "Can the lighting sync to our wedding entry song?",
        a: "Yes. We pre-program looks for key moments (bride and groom entry, varmala, first dance) and cue them live so the beam movement lands exactly on the music.",
      },
    ],
  },
  {
    slug: "stage-rigging",
    code: "SYS-03",
    name: "Stage Rigging & Truss Structures",
    shortName: "Stage Rigging",
    accent: "white",
    headline: "Certified aluminium truss and modular decking, built to hold the show and the crowd's attention.",
    summary:
      "Tomcat / Prolyte aluminium truss, 4×8 ft modular risers and insured rigging crews with locked-off load plans for indoor and outdoor stages.",
    definition:
      "Stage rigging is the structural system (aluminium truss, ground support towers and modular stage decks) that safely suspends lighting, audio and scenic elements above performers and audiences.",
    specs: [
      { label: "Truss", value: "Tomcat / Prolyte aluminium, 200+ ft" },
      { label: "Load rating", value: "Certified flown systems up to 8 tons" },
      { label: "Decking", value: "24 × modular 4×8 ft stage platforms" },
      { label: "Heights", value: "Risers 2-6 ft, truss to 30 ft" },
      { label: "Safety", value: "Insured crew, secondary safeties, load plans" },
      { label: "Build time", value: "2-8 hours depending on scale" },
    ],
    deliverables: [
      "Stage and truss plot to venue dimensions",
      "Ground-support or flown configurations",
      "Skirting, stairs and cable management",
      "Strike and load-out crew",
    ],
    idealFor: ["Open-ground concerts", "Wedding mandap & stage builds", "Exhibitions", "Fashion shows"],
    keywords: [
      "stage truss rental Indore",
      "event stage setup Madhya Pradesh",
      "truss rigging company India",
    ],
    faq: [
      {
        q: "Is your truss rigging insured and load-rated?",
        a: "Yes. All flown systems are built to certified load ratings with secondary safeties, and our rigging crew is insured. We provide a load plan before every build.",
      },
    ],
  },
  {
    slug: "dj-setup",
    code: "SYS-04",
    name: "DJ Setup & Party Sound",
    shortName: "DJ Setup",
    accent: "amber",
    headline: "Club-grade DJ rigs for sangeets, cocktail nights and private parties.",
    summary:
      "Pioneer-standard DJ consoles, dance-floor subs, effect lighting and a DJ who reads the room, packaged for weddings and private events.",
    definition:
      "A professional DJ setup pairs a club-standard DJ controller and monitors with a tuned dance-floor PA and synchronised effect lighting, operated by an experienced DJ for weddings and parties.",
    specs: [
      { label: "Console", value: "Pioneer-standard DJ controller + booth monitors" },
      { label: "PA", value: "Compact line array + dual 18\" subs" },
      { label: "Lighting", value: "8-12 movers, strobes and haze" },
      { label: "Crew", value: "DJ + sound operator + light operator" },
    ],
    deliverables: ["Curated playlists per event segment", "MC / announcement mic", "Dance-floor lighting cues", "Setup and teardown"],
    idealFor: ["Sangeet & cocktail nights", "Birthday & anniversary parties", "College fests", "Club events"],
    keywords: ["DJ setup Indore", "wedding DJ Indore", "party sound system rental Indore"],
    faq: [
      {
        q: "Do you provide the DJ or only the equipment?",
        a: "Both options are available. Most clients book the full package (DJ, sound and lighting) but dry hire of the DJ rig with an operator is also possible.",
      },
    ],
  },
  {
    slug: "show-execution",
    code: "SYS-05",
    name: "Show Calling & Live Production Crew",
    shortName: "Show Execution",
    accent: "cyan",
    headline: "Every cue on time. Every changeover tight. A crew that runs the show, not just the gear.",
    summary:
      "Show callers, RF and hardline intercom, stage managers and backup consoles: the operational layer that makes a big production feel effortless.",
    definition:
      "Show execution is the on-site production management of a live event: cue calling, crew communications, changeovers and contingency planning that keep audio, lighting and performers synchronised.",
    specs: [
      { label: "Comms", value: "RF + hardline intercom networks" },
      { label: "Cue calling", value: "Dedicated show caller + run sheet" },
      { label: "Redundancy", value: "Backup console and signal paths" },
      { label: "Crew", value: "Stage manager, techs, strike team" },
    ],
    deliverables: ["Run-of-show document", "Rehearsal and soundcheck scheduling", "Artist and vendor coordination", "Post-show strike"],
    idealFor: ["Multi-act concerts", "Corporate summits & award nights", "Destination weddings", "Festivals"],
    keywords: ["event production company Indore", "live show production Madhya Pradesh", "stage management services India"],
    faq: [
      {
        q: "Do you coordinate with other vendors at the venue?",
        a: "Yes. Our stage manager coordinates with decorators, caterers, artists and venue staff so power, timings and stage access are locked before doors open.",
      },
    ],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
