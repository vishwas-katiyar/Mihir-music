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

/** Cells carry the table padding from `sm` up; below it the row itself is the padded card. */
const cell = "sm:px-4 sm:py-3";
/** Column name repeated inside the card, where the header row is gone. */
const cardLabel = "block text-[11px] uppercase tracking-[0.14em] text-muted sm:hidden";

export function InvoiceTable({ rows }: { rows: InvoiceRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center sm:p-10">
        <p className="text-base text-ink/85">No invoices yet.</p>
        <p className="mt-1 text-sm text-muted">Create the first one and share its link with the client.</p>
        <Link href="/invoice/new" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gold px-5 text-sm font-semibold text-charcoal sm:min-h-0 sm:py-2.5">
          New invoice
        </Link>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <p className="border-b border-white/10 bg-white/[0.02] px-4 py-2 text-xs text-muted">
        <span className="sm:hidden">Tap</span>
        <span className="hidden sm:inline">Click</span> any row to open and update that invoice.
      </p>
      {/* Phones: the header row is dropped and each row restacks as a card, so nothing scrolls sideways. */}
      <table className="w-full text-left text-sm sm:min-w-[820px]">
        <thead className="hidden bg-white/[0.03] text-xs uppercase tracking-[0.12em] text-muted sm:table-header-group">
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
            <ClickableRow
              key={r.id}
              href={`/invoice/${r.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 px-4 py-4 hover:bg-white/[0.04] sm:table-row sm:p-0"
            >
              <td className={cn("order-1 min-w-0", cell)}>
                <span className="font-mono text-sm text-ink">{r.invoiceNumber}</span>
                <div className="text-xs text-muted">{formatDateIN(r.issueDate)}</div>
              </td>
              <td className={cn("order-3 col-span-2 min-w-0", cell)}>
                <div className="break-words text-ink">{r.clientName}</div>
                {r.clientPhone && <div className="text-xs text-muted">{r.clientPhone}</div>}
              </td>
              <td className={cn("order-4 col-span-2 min-w-0 text-ink/85", cell)}>
                <div className="break-words">{r.eventTitle ?? "Live event"}</div>
                <div className="text-xs text-muted">{formatDateIN(r.eventStart) || ""}</div>
              </td>
              <td className={cn("order-5 tabular-nums text-ink sm:text-right", cell)}>
                <span className={cardLabel}>Total</span>
                {inr(r.grandTotalPaise)}
              </td>
              <td className={cn("order-6 tabular-nums sm:text-right", r.balanceDuePaise > 0 ? "text-gold-soft" : "text-emerald-200", cell)}>
                <span className={cardLabel}>Balance</span>
                {inr(r.balanceDuePaise)}
              </td>
              <td className={cn("order-2 justify-self-end", cell)}>
                {r.deletedAt ? (
                  <span className="rounded-full bg-rose-400/15 px-2.5 py-1 text-xs text-rose-200">Deleted</span>
                ) : (
                  <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs", statusBadge[r.status as InvoiceStatus])}>{STATUS_LABEL[r.status as InvoiceStatus]}</span>
                )}
              </td>
              <td className={cn("order-7 col-span-2 text-xs text-muted", cell)}>
                {r.updatedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" })}
              </td>
              <td className={cn("order-8 col-span-2 whitespace-nowrap sm:text-right", cell)}>
                <div className="grid grid-cols-2 gap-2 sm:block">
                  <Link
                    href={`/invoice/${r.id}`}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/12 px-3 text-xs text-ink/85 transition hover:border-gold/60 hover:text-gold sm:min-h-0 sm:py-1.5"
                    title="Open and update"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Link>
                  {!r.deletedAt && (
                    <a
                      href={`/i/${r.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border border-white/12 px-3 text-xs text-muted transition hover:text-ink sm:ml-2 sm:min-h-0 sm:rounded-none sm:border-0 sm:px-0"
                      title="Open client link"
                    >
                      Share <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </td>
            </ClickableRow>
          ))}
        </tbody>
      </table>
    </div>
  );
}
