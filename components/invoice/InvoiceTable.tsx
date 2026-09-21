import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, formatDateIN, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { cn } from "@/lib/utils";
import { ClickableRow } from "./ClickableRow";

export const statusBadge: Record<InvoiceStatus, string> = {
  draft: "bg-white/8 text-ink/80",
  sent: "bg-gold/15 text-gold-soft",
  partially_paid: "bg-sky-400/15 text-sky-200",
  paid: "bg-emerald-400/15 text-emerald-200",
  cancelled: "bg-rose-400/15 text-rose-200",
};

export function InvoiceTable({ rows }: { rows: InvoiceRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
        <p className="text-base text-ink/85">No invoices yet.</p>
        <p className="mt-1 text-sm text-muted">Create the first one and share its link with the client.</p>
        <Link href="/invoice/new" className="mt-6 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal">
          New invoice
        </Link>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <p className="border-b border-white/10 bg-white/[0.02] px-4 py-2 text-xs text-muted">Click any row to open and update that invoice.</p>
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="px-4 py-3 font-normal">Invoice</th>
            <th className="px-4 py-3 font-normal">Client</th>
            <th className="px-4 py-3 font-normal">Event</th>
            <th className="px-4 py-3 text-right font-normal">Total</th>
            <th className="px-4 py-3 text-right font-normal">Balance</th>
            <th className="px-4 py-3 font-normal">Status</th>
            <th className="px-4 py-3 font-normal">Updated</th>
            <th className="px-4 py-3 font-normal" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/8">
          {rows.map((r) => (
            <ClickableRow key={r.id} href={`/invoice/${r.id}`} className="hover:bg-white/[0.04]">
              <td className="px-4 py-3">
                <span className="font-mono text-sm text-ink">{r.invoiceNumber}</span>
                <div className="text-xs text-muted">{formatDateIN(r.issueDate)}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-ink">{r.clientName}</div>
                {r.clientPhone && <div className="text-xs text-muted">{r.clientPhone}</div>}
              </td>
              <td className="px-4 py-3 text-ink/85">
                <div>{r.eventTitle ?? "Live event"}</div>
                <div className="text-xs text-muted">{formatDateIN(r.eventStart) || ""}</div>
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-ink">{inr(r.grandTotalPaise)}</td>
              <td className={cn("px-4 py-3 text-right tabular-nums", r.balanceDuePaise > 0 ? "text-gold-soft" : "text-emerald-200")}>{inr(r.balanceDuePaise)}</td>
              <td className="px-4 py-3">
                {r.deletedAt ? (
                  <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-xs text-rose-200">Deleted</span>
                ) : (
                  <span className={cn("rounded-full px-2.5 py-1 text-xs", statusBadge[r.status as InvoiceStatus])}>{STATUS_LABEL[r.status as InvoiceStatus]}</span>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-muted">{r.updatedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link href={`/invoice/${r.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs text-ink/85 transition hover:border-gold/60 hover:text-gold" title="Open and update">
                  <Pencil className="h-3 w-3" /> Edit
                </Link>
                {!r.deletedAt && (
                  <a href={`/i/${r.token}`} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-xs text-muted hover:text-ink" title="Open client link">
                    Share <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </td>
            </ClickableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
