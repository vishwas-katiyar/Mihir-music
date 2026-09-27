import { site } from "@/lib/site";

/**
 * New-lead email alert. Uses Resend's plain REST API (no SDK dependency — one fetch call)
 * so it costs nothing when unconfigured: without RESEND_API_KEY this silently no-ops,
 * same fail-open pattern as lib/db/kv.ts. WhatsApp stays the primary channel either way;
 * this just means nobody has to remember to check the leads table.
 */
const isConfigured = () => Boolean(process.env.RESEND_API_KEY);

export interface LeadAlert {
  id: number;
  name: string | null;
  phone: string | null;
  eventType: string;
  crowdSize: string;
  venueType: string;
  venueCity: string | null;
  eventDate: string | null;
  estimatedBudgetLow: number;
  estimatedBudgetHigh: number;
  source: string | null;
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function toHtml(lead: LeadAlert): string {
  const rows: [string, string][] = [
    ["Name", lead.name || "—"],
    ["Phone", lead.phone || "—"],
    ["Event", lead.eventType],
    ["Crowd", lead.crowdSize],
    ["Venue", lead.venueType],
    ["City", lead.venueCity || "—"],
    ["Date", lead.eventDate || "—"],
    ["Estimate", `${inr(lead.estimatedBudgetLow)} – ${inr(lead.estimatedBudgetHigh)}`],
    ["Source", lead.source || "estimator"],
  ];
  const body = rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#8a8a8a">${k}</td><td style="padding:4px 0"><strong>${v}</strong></td></tr>`).join("");
  const waDigits = (lead.phone ?? "").replace(/\D/g, "");
  const waLink = waDigits ? `https://wa.me/${waDigits.length === 10 ? "91" + waDigits : waDigits}` : null;
  return `
    <div style="font-family:sans-serif;font-size:14px;color:#111">
      <h2 style="margin:0 0 12px">New enquiry — ${lead.eventType}</h2>
      <table>${body}</table>
      <p style="margin-top:16px">
        <a href="${site.url}/invoice/leads" style="color:#b8860b">Open in Leads</a>
        ${waLink ? ` &nbsp;·&nbsp; <a href="${waLink}" style="color:#25D366">Reply on WhatsApp</a>` : ""}
      </p>
    </div>`;
}

/** Fire-and-forget: never throws, never blocks the enquiry response. */
export async function notifyNewLead(lead: LeadAlert): Promise<void> {
  if (!isConfigured()) return;
  const to = process.env.LEAD_ALERT_EMAIL || site.email;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || `${site.name} <onboarding@resend.dev>`,
        to: [to],
        subject: `New enquiry: ${lead.eventType} · ${inr(lead.estimatedBudgetLow)}–${inr(lead.estimatedBudgetHigh)}`,
        html: toHtml(lead),
      }),
    });
    if (!res.ok) console.error("notifyNewLead: Resend returned", res.status, await res.text().catch(() => ""));
  } catch (e) {
    console.error("notifyNewLead failed", e);
  }
}
