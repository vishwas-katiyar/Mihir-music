"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle, ReceiptText } from "lucide-react";
import type { Inquiry } from "@/lib/db/schema";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from "@/lib/leads/types";
import { cn } from "@/lib/utils";

const statusBadge: Record<LeadStatus, string> = {
  new: "bg-gold/15 text-gold-soft",
  contacted: "bg-sky-400/15 text-sky-200",
  quoted: "bg-white/8 text-ink/80",
  won: "bg-emerald-400/15 text-emerald-200",
  lost: "bg-rose-400/15 text-rose-200",
};

const cell = "sm:px-4 sm:py-3";
const cardLabel = "block text-[11px] uppercase tracking-[0.14em] text-muted sm:hidden";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function relativeTime(d: Date): string {
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function whatsappHrefFor(lead: Inquiry): string | null {
  const digits = (lead.phone ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const to = digits.length === 10 ? `91${digits}` : digits;
  const text = [
    `Hi ${lead.name || "there"}, this is Mihir Sound & Light.`,
    `Thanks for your enquiry about ${lead.eventType}${lead.venueCity ? ` in ${lead.venueCity}` : ""}${lead.eventDate ? ` on ${lead.eventDate}` : ""}.`,
    lead.estimatedBudgetHigh > 0 ? `Your estimate: ${inr(lead.estimatedBudgetLow)} – ${inr(lead.estimatedBudgetHigh)}.` : null,
    "Happy to share availability and a firm quote — what time works to talk?",
  ]
    .filter(Boolean)
    .join("\n");
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}

export function LeadsTable({ rows }: { rows: Inquiry[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<number | null>(null);

  const setStatus = async (id: number, status: LeadStatus) => {
    setBusy(id);
    try {
      await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center sm:p-10">
        <p className="text-base text-ink/85">No leads yet.</p>
        <p className="mt-1 text-sm text-muted">Enquiries from the estimator and the contact form land here the moment they&apos;re submitted.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm sm:min-w-[920px]">
        <thead className="hidden bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-muted sm:table-header-group">
          <tr>
            <th className="px-4 py-3 font-normal">Contact</th>
            <th className="px-4 py-3 font-normal">Event</th>
            <th className="px-4 py-3 font-normal">City / Date</th>
            <th className="px-4 py-3 text-right font-normal">Estimate</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal">Received</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {rows.map((r) => {
            const wa = whatsappHrefFor(r);
            return (
              <tr key={r.id} className="grid grid-cols-2 items-start gap-x-3 gap-y-2 px-4 py-4 sm:table-row sm:p-0">
                <td className={cn("col-span-2 min-w-0", cell)}>
                  <div className="break-words text-ink">{r.name || "No name given"}</div>
                  {r.phone && <div className="text-xs text-muted">{r.phone}</div>}
                </td>
                <td className={cn("col-span-2 min-w-0 text-ink/85", cell)}>
                  <div className="break-words">{r.eventType}</div>
                  <div className="text-xs text-muted">
                    {r.crowdSize} · {r.venueType}
                  </div>
                </td>
                <td className={cn("min-w-0", cell)}>
                  <span className={cardLabel}>City / Date</span>
                  <div className="text-ink/85">{r.venueCity || "—"}</div>
                  <div className="text-xs text-muted">{r.eventDate || "Date not given"}</div>
                </td>
                <td className={cn("tabular-nums text-ink sm:text-right", cell)}>
                  <span className={cardLabel}>Estimate</span>
                  {r.estimatedBudgetHigh > 0 ? `${inr(r.estimatedBudgetLow)} – ${inr(r.estimatedBudgetHigh)}` : "Contact form"}
                </td>
                <td className={cn(cell)}>
                  <span className={cardLabel}>Status</span>
                  <select
                    value={r.status}
                    disabled={busy === r.id}
                    onChange={(e) => setStatus(r.id, e.target.value as LeadStatus)}
                    className={cn(
                      "min-h-9 rounded-full border-0 bg-transparent px-2.5 py-1 text-xs outline-none disabled:opacity-50",
                      statusBadge[r.status as LeadStatus] ?? "bg-white/8 text-ink/80",
                    )}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-charcoal text-ink">
                        {LEAD_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={cn("text-xs text-muted", cell)}>{relativeTime(new Date(r.createdAt))}</td>
                <td className={cn("col-span-2 whitespace-nowrap sm:text-right", cell)}>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/12 px-3 text-xs text-ink/85 transition hover:border-gold/60 hover:text-gold sm:min-h-0 sm:py-1.5"
                      >
                        <MessageCircle className="h-3 w-3" /> WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/invoice/new?leadId=${r.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/12 px-3 text-xs text-ink/85 transition hover:border-gold/60 hover:text-gold sm:min-h-0 sm:py-1.5"
                    >
                      <ReceiptText className="h-3 w-3" /> Invoice
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
