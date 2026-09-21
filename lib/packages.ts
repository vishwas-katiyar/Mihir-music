export interface Package {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  label: string;
  accent: "gold" | "cyan" | "white";
  featured?: boolean;
  features: string[];
  cta: string;
}

export const packages: Package[] = [
  {
    id: "club",
    name: "Club / House",
    price: "₹85K",
    priceValue: 85000,
    label: "Starter rig",
    accent: "white",
    features: [
      "Compact line-array sound package",
      "Dual subs and stage wedges",
      "8-12 moving lights with haze",
      "Crew and deck setup",
    ],
    cta: "Request Club Setup",
  },
  {
    id: "wedding",
    name: "Wedding Luxe",
    price: "₹1.6L",
    priceValue: 160000,
    label: "Signature production",
    accent: "gold",
    featured: true,
    features: [
      "Premium line-array and cardioid subs",
      "Full DMX pixel scene design",
      "Stage build + designer lighting cues",
      "Show-caller and live audio engineer",
    ],
    cta: "Book Wedding Luxe",
  },
  {
    id: "arena",
    name: "Arena Fest",
    price: "₹3.2L",
    priceValue: 320000,
    label: "Large-format show",
    accent: "cyan",
    features: [
      "High-SPL flown arrays and festival subs",
      "Lasers, strobes, blinders and haze",
      "Full comms & logistics coordination",
      "On-site show calling and strike crew",
    ],
    cta: "Request Fest Package",
  },
];

/**
 * The package whose starting price is nearest to an estimate, on a log scale so the
 * comparison is proportional (1.4 lakh is closer to 1.6 lakh than to 85,000). Used by
 * the estimator readout, which is where the packages are presented since the
 * comparison table was retired.
 */
export function closestPackage(priceMid: number): Package {
  return packages.reduce((best, p) =>
    Math.abs(Math.log(p.priceValue / priceMid)) < Math.abs(Math.log(best.priceValue / priceMid)) ? p : best,
  );
}
