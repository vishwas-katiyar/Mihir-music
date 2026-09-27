/** Lead pipeline status, mirroring the pattern in lib/invoices/calc.ts. */
export const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export const isLeadStatus = (v: string): v is LeadStatus => (LEAD_STATUSES as readonly string[]).includes(v);
