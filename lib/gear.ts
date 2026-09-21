export interface GearItem {
  category: string;
  equipment: string;
  model: string;
  qty: string;
  spec: string;
}

export interface GearGroup {
  title: string;
  accent: "gold" | "cyan" | "white";
  items: GearItem[];
}

export const gear: GearGroup[] = [
  {
    title: "Audio Systems",
    accent: "gold",
    items: [
      { category: "Array", equipment: "Line Array Modules", model: "JBL VT / RCF HDL", qty: "16", spec: "8\" / 140 dB SPL" },
      { category: "Subs", equipment: "Cardioid Subwoofers", model: "JBL SRX / RCF SUB 902", qty: "8", spec: "18\" high-output" },
      { category: "Consoles", equipment: "Digital Mixers", model: "Soundcraft Si Impact / Yamaha TF5", qty: "2", spec: "48-channel live mix" },
    ],
  },
  {
    title: "Video & SFX",
    accent: "white",
    items: [
      { category: "Video", equipment: "Outdoor LED Video Walls", model: "P3 / P4 modules", qty: "On request", spec: "IMAG + content playback" },
      { category: "SFX", equipment: "Cold Pyrotechnics", model: "Stage-safe cold spark", qty: "8 units", spec: "Entry & reveal moments" },
      { category: "SFX", equipment: "Low-Fog & Haze", model: "Low-fog + haze machines", qty: "4", spec: "Dance-floor cloud, beam definition" },
    ],
  },
  {
    title: "Lighting Systems",
    accent: "cyan",
    items: [
      { category: "Movers", equipment: "Moving Head Beams", model: "Clay Paky Sharpy 10R / 15R", qty: "24", spec: "300W / 10k lumens" },
      { category: "DMX", equipment: "Lighting Controller", model: "Avolites Tiger Touch Pro", qty: "1", spec: "1024 channels + playback" },
      { category: "Pixels", equipment: "LED Mapping", model: "Elation / Chauvet", qty: "36", spec: "RGB + haze integration" },
    ],
  },
  {
    title: "Rigging & Structure",
    accent: "white",
    items: [
      { category: "Truss", equipment: "Aluminium Truss", model: "Tomcat / Prolyte", qty: "200+ ft", spec: "Bolt & stage-ready" },
      { category: "Risers", equipment: "Stage Platforms", model: "Modular Decking", qty: "24", spec: "4 × 8 ft sections" },
    ],
  },
];

/**
 * Manufacturers named in the models above, for the brand marquee. Keep in step with the
 * table: a name here must appear in at least one `model` string, so the marquee never
 * claims gear the inventory does not list.
 */
export const gearBrands: { name: string; role: string }[] = [
  { name: "JBL", role: "Line array" },
  { name: "RCF", role: "Line array" },
  { name: "Clay Paky", role: "Moving heads" },
  { name: "Avolites", role: "Lighting console" },
  { name: "Soundcraft", role: "Mixing console" },
  { name: "Yamaha", role: "Mixing console" },
  { name: "Tomcat", role: "Truss" },
  { name: "Prolyte", role: "Truss" },
  { name: "Elation", role: "LED pixels" },
  { name: "Chauvet", role: "LED pixels" },
];
