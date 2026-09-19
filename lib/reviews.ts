export interface Review {
  name: string;
  role: string;
  text: string;
  rating: 5;
}

export const reviews: Review[] = [
  {
    name: "Raj & Neha",
    role: "Wedding client",
    rating: 5,
    text: "Mihir Sound & Light delivered crystal-clear audio and lighting that matched the mood perfectly for our wedding. The team was punctual, professional and very easy to work with.",
  },
  {
    name: "Aman Verma",
    role: "Corporate event",
    rating: 5,
    text: "For our live event, they handled sound, lighting and stage setup with total confidence. The production quality felt premium and the team managed every cue smoothly.",
  },
  {
    name: "Priya Shah",
    role: "Private party",
    rating: 5,
    text: "Professional, creative and highly reliable. From the DJ setup to the final lighting cues, everything felt polished and well planned. We would book them again without hesitation.",
  },
];
