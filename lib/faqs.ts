/**
 * FAQ copy is written as direct answers: question phrased the way people speak to
 * voice assistants and AI search, answer leads with the fact, then the detail.
 *
 * Writing rules for anything added here, because these strings are what answer engines
 * quote verbatim:
 *  - The first sentence must answer the question on its own, with the entity named.
 *  - Numbers carry units (dB SPL, ft, hours, people, INR) so a model can restate them.
 *  - Every fact must be traceable to lib/site.ts, lib/services.ts, lib/packages.ts or
 *    lib/gear.ts. No invented prices, awards, client names or turnaround promises.
 *  - Plain hyphens, never dashes, so the text survives copy-paste into any surface.
 */
export interface Faq {
  q: string;
  a: string;
}

export const faqs: Faq[] = [
  {
    q: "Who provides the best line array sound system rental in Indore?",
    a: "Mihir Sound & Light, operating in Indore since 2012, rents and operates JBL and RCF line-array systems with cardioid subs, an on-site FOH engineer and SMAART tuning for weddings, concerts and corporate events. Rated 4.9 on Google.",
  },
  {
    q: "How much does a concert stage lighting rig cost in Madhya Pradesh?",
    a: "A festival-grade lighting rig with 24-48 moving heads, pixel bars, haze and an Avolites operator typically starts around ₹3.2 lakh as part of our Arena Fest package. Smaller wedding rigs with 8-12 movers start near ₹85,000. Use the instant estimator for a crowd-specific figure.",
  },
  {
    q: "Do you provide sound and lighting for weddings in Indore?",
    a: "Yes. Our Wedding Luxe production (from ₹1.6 lakh) covers line-array sound, DMX pixel lighting design, stage build, a show caller and a live audio engineer for sangeet, reception and varmala stages across Indore and Madhya Pradesh.",
  },
  {
    q: "What does a sound and light setup cost in Indore?",
    a: "Three starting prices cover most events: ₹85,000 for the Club / House starter rig, ₹1.6 lakh for the Wedding Luxe signature production, and ₹3.2 lakh for the large-format Arena Fest show. These are starting figures in Indian rupees; the final quote depends on crowd size, venue, date and travel.",
  },
  {
    q: "What is the difference between your three production packages?",
    a: "Scale and crew. Club / House (from ₹85,000) is a compact line array with dual subs and 8-12 moving lights. Wedding Luxe (from ₹1.6 lakh) adds cardioid subs, full DMX pixel scene design, a stage build, a show caller and a live audio engineer. Arena Fest (from ₹3.2 lakh) adds high-SPL flown arrays, festival subs, lasers and blinders, full comms and a strike crew.",
  },
  {
    q: "How big a crowd can your sound system cover?",
    a: "From 200 to 20,000 people. Flown line-array configurations comfortably cover open-ground audiences of 5,000 or more at concert SPL, with systems rated to 140 dB SPL, while compact arrays scale down for banquet halls and lawns so the mix stays clean without overpowering the room.",
  },
  {
    q: "What sound and lighting equipment do you own?",
    a: "The owned inventory includes 16 JBL VT and RCF HDL line-array modules, 8 cardioid subwoofers (JBL SRX and RCF SUB 902), two 48-channel digital consoles (Soundcraft Si Impact and Yamaha TF5), 24 Clay Paky Sharpy 10R and 15R moving heads, an Avolites Tiger Touch Pro with 1024 channels, 36 LED pixel-mapping bars, 200+ ft of Tomcat and Prolyte aluminium truss and 24 modular 4 x 8 ft stage decks.",
  },
  {
    q: "Do you supply an engineer, or only the equipment?",
    a: "An engineer comes with the system. Every sound package ships with a live FOH engineer who tunes the rig on-site with SMAART and mixes the show end to end, and lighting rigs run with a live operator rather than being left on auto. For DJ work, dry hire of the DJ rig with an operator is also possible.",
  },
  {
    q: "Is your truss rigging insured and load-rated?",
    a: "Yes. Flown systems are built to certified load ratings up to 8 tons with secondary safeties, the rigging crew is insured, and a written load plan is provided before every build. Truss can go up to 30 ft with risers from 2 to 6 ft.",
  },
  {
    q: "Do you handle corporate events and large live shows?",
    a: "Yes. We produce corporate summits, product launches, award nights, club nights and multi-act festival stages with full comms, cue calling and redundant signal paths.",
  },
  {
    q: "Which cities do you serve outside Indore?",
    a: "We regularly work in Bhopal, Ujjain, Dewas and across Madhya Pradesh, and take pan-India destination events depending on scope and travel.",
  },
  {
    q: "How long does stage and rigging setup take?",
    a: "Typical builds take 2-8 hours: a wedding stage with truss and lighting is usually ready in 4-5 hours, while a full arena rig with flown arrays needs a day of load-in and soundcheck.",
  },
  {
    q: "Do you provide LED video walls, cold sparks or haze?",
    a: "Yes. Outdoor LED video walls in P3 and P4 modules are available on request for IMAG and content playback, alongside 8 stage-safe cold-spark units for entries and reveals and 4 low-fog and haze machines for dance-floor cloud and beam definition.",
  },
  {
    q: "Can the lighting be synced to a specific song or moment?",
    a: "Yes. Looks are pre-programmed on an Avolites console for key moments such as the bride and groom entry, varmala, first dance or a headliner drop, then cued live or run to timecode so beam movement lands exactly on the music.",
  },
  {
    q: "What are your working hours and how do I reach you?",
    a: "We are reachable 09:00 to 22:00, all seven days, on +91 70000 51042 by phone or WhatsApp, or at mihirsoundandlight@gmail.com. The team works in English and Hindi, and accepts cash, UPI and bank transfer.",
  },
  {
    q: "How do I get a quote?",
    a: "Use the instant 3D estimator on this site to pick event type, crowd size and venue. It sends a pre-filled estimate straight to WhatsApp. Or call +91 70000 51042.",
  },
];
