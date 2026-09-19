import Image from "next/image";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, lineAmountPaise, formatDateIN, METHOD_LABEL, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { UPI } from "@/lib/invoices/upi";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const statusTone: Record<InvoiceStatus, string> = {
  draft: "bg-slate-100 text-slate-700",
  sent: "bg-amber-50 text-amber-800",
  partially_paid: "bg-sky-50 text-sky-800",
  paid: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-rose-50 text-rose-800",
};

const Label = ({ children }: { children: React.ReactNode }) => <div className="text-[10.5px] font-medium uppercase tracking-[0.14em] text-slate-500">{children}</div>;

/**
 * The invoice as a printable sheet. Mirrors the PDF: brand bar, meta strip, parties,
 * items, payments received, totals with a balance call-out, UPI, notes, terms.
 */
export function InvoiceDocument({ invoice: inv, qrSrc }: { invoice: InvoiceRow; qrSrc?: string }) {
  const status = inv.status as InvoiceStatus;
  const isPaid = inv.grandTotalPaise > 0 && inv.balanceDuePaise === 0 && status !== "cancelled";
  const eventRange =
    inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);

  return (
    <article className="relative mx-auto w-full max-w-[860px] overflow-hidden bg-white text-[#0f172a] shadow-[0_30px_80px_rgb(0_0_0/0.5)] print:max-w-none print:shadow-none">
      {isPaid && (
        <div aria-hidden className="pointer-events-none absolute right-8 top-40 rotate-[-14deg] select-none rounded-lg border-4 border-emerald-500/70 px-5 py-2 font-display text-4xl font-bold uppercase tracking-[0.2em] text-emerald-600/70">
          Paid
        </div>
      )}
      {status === "cancelled" && (
        <div aria-hidden className="pointer-events-none absolute right-8 top-40 rotate-[-14deg] select-none rounded-lg border-4 border-rose-500/60 px-5 py-2 font-display text-4xl font-bold uppercase tracking-[0.2em] text-rose-600/60">
          Cancelled
        </div>
      )}

      {/* Brand bar */}
      <header className="flex flex-col gap-6 bg-[#0b0c10] px-7 py-7 text-white sm:flex-row sm:items-start sm:justify-between sm:px-10">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="" width={52} height={52} className="h-13 w-13 rounded-full ring-2 ring-[#ffb800]/70" />
          <div>
            <div className="font-display text-lg font-bold tracking-[-0.03em]">{site.name}</div>
            <div className="mt-0.5 text-xs text-white/60">Live event production, Indore</div>
          </div>
        </div>
        <div className="sm:text-right">
          <div className="font-display text-3xl font-bold tracking-[-0.04em]">Invoice</div>
          <div className="mt-1 font-mono text-sm text-[#ffb800]">{inv.invoiceNumber}</div>
        </div>
      </header>
      <div className="h-1 bg-[#ffb800]" />

      <div className="px-7 py-8 sm:px-10">
        {/* Meta strip */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-slate-200 pb-6 sm:grid-cols-4">
          <div>
            <Label>Issued</Label>
            <dd className="mt-1 text-sm font-medium">{formatDateIN(inv.issueDate)}</dd>
          </div>
          <div>
            <Label>Due</Label>
            <dd className="mt-1 text-sm font-medium">{inv.dueDate ? formatDateIN(inv.dueDate) : "On receipt"}</dd>
          </div>
          <div>
            <Label>Event</Label>
            <dd className="mt-1 text-sm font-medium">{eventRange || "As agreed"}</dd>
          </div>
          <div>
            <Label>Status</Label>
            <dd className="mt-1">
              <span className={cn("inline-block rounded px-2 py-0.5 text-xs font-semibold", statusTone[status])}>{STATUS_LABEL[status]}</span>
            </dd>
          </div>
        </dl>

        {/* Parties */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <Label>Billed to</Label>
            <div className="mt-2 text-lg font-semibold">{inv.clientName}</div>
            {inv.clientAddress && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{inv.clientAddress}</p>}
            {(inv.clientPhone || inv.clientEmail) && <p className="mt-1 text-sm text-slate-600">{[inv.clientPhone, inv.clientEmail].filter(Boolean).join(" · ")}</p>}
            {(inv.eventTitle || inv.venue) && (
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-medium">{inv.eventTitle || "Live event production"}</span>
                {inv.venue && <span className="text-slate-500"> · {inv.venue}</span>}
              </p>
            )}
          </div>
          <div className="sm:text-right">
            <Label>From</Label>
            <div className="mt-2 text-lg font-semibold">{site.name}</div>
            <p className="mt-1 text-sm text-slate-600">
              {site.address.street}, {site.address.locality}
              <br />
              {site.address.region} {site.address.postalCode}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {site.phoneDisplay}
              <br />
              {site.email}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b-2 border-[#0b0c10] text-left text-[10.5px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-2 pr-4 font-medium">Item</th>
                <th className="py-2 pr-4 text-right font-medium">Qty</th>
                <th className="py-2 pr-4 text-right font-medium">Rate</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((l, i) => (
                <tr key={i} className="border-b border-slate-100 align-top">
                  <td className="py-3.5 pr-4">
                    <div className="font-medium">{l.title || "Item"}</div>
                    {l.description && <div className="mt-0.5 text-xs text-slate-500">{l.description}</div>}
                  </td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-slate-700">{l.quantity}</td>
                  <td className="py-3.5 pr-4 text-right tabular-nums text-slate-700">{inr(l.ratePaise)}</td>
                  <td className="py-3.5 text-right font-medium tabular-nums">{inr(lineAmountPaise(l))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payments + totals */}
        <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_300px]">
          <div>
            {inv.payments.length > 0 && (
              <>
                <Label>Payments received</Label>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {inv.payments.map((p) => (
                      <tr key={p.id} className="border-b border-slate-100">
                        <td className="py-2 pr-3 text-slate-700">{formatDateIN(p.date)}</td>
                        <td className="py-2 pr-3 text-slate-500">
                          {METHOD_LABEL[p.method]}
                          {p.reference ? ` · ${p.reference}` : ""}
                        </td>
                        <td className="py-2 text-right tabular-nums text-emerald-700">{inr(p.amountPaise)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {inv.notes && (
              <div className={cn(inv.payments.length > 0 && "mt-6")}>
                <Label>Notes</Label>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{inv.notes}</p>
              </div>
            )}
          </div>

          <dl className="text-sm">
            <div className="flex justify-between py-1.5">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="tabular-nums">{inr(inv.subtotalPaise)}</dd>
            </div>
            {inv.discountPaise > 0 && (
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-500">Discount</dt>
                <dd className="tabular-nums">- {inr(inv.discountPaise)}</dd>
              </div>
            )}
            {inv.gstRateBp > 0 && (
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-500">GST {inv.gstRateBp / 100}%</dt>
                <dd className="tabular-nums">{inr(inv.gstPaise)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 py-2 font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{inr(inv.grandTotalPaise)}</dd>
            </div>
            {inv.advancePaidPaise > 0 && (
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-500">Received</dt>
                <dd className="tabular-nums text-emerald-700">- {inr(inv.advancePaidPaise)}</dd>
              </div>
            )}
            <div className={cn("mt-2 flex items-baseline justify-between rounded-lg px-4 py-3", isPaid ? "bg-emerald-50 text-emerald-800" : "bg-[#0b0c10] text-white")}>
              <dt className="text-xs font-medium uppercase tracking-[0.14em]">{isPaid ? "Paid in full" : "Balance due"}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums tracking-[-0.03em]">{inr(inv.balanceDuePaise)}</dd>
            </div>
          </dl>
        </div>

        {/* UPI */}
        {inv.balanceDuePaise > 0 && status !== "cancelled" && (
          <div className="mt-8 flex flex-col gap-5 rounded-xl border border-slate-200 p-5 sm:flex-row sm:items-center">
            {qrSrc && (
              // eslint-disable-next-line @next/next/no-img-element -- data URL generated server-side
              <img src={qrSrc} alt={`UPI QR code for ${inr(inv.balanceDuePaise)}`} className="h-32 w-32 shrink-0 rounded-md" />
            )}
            <div className="text-sm">
              <Label>Pay the balance by UPI</Label>
              <p className="mt-2 text-slate-700">
                Scan with any UPI app to pay <span className="font-semibold text-[#0f172a]">{inr(inv.balanceDuePaise)}</span> to <span className="font-mono">{UPI.id}</span> ({UPI.payeeName}).
              </p>
              <p className="mt-1 text-slate-500">Use {inv.invoiceNumber} as the reference and share the screenshot on WhatsApp so we can mark it received.</p>
            </div>
          </div>
        )}

        {inv.terms.length > 0 && (
          <section className="mt-10">
            <Label>Terms</Label>
            <ol className="mt-2 grid gap-1 text-xs leading-relaxed text-slate-500 sm:grid-cols-2 sm:gap-x-8">
              {inv.terms.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-slate-400">{i + 1}.</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <footer className="mt-10 flex flex-wrap justify-between gap-2 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
          <span>Thank you for choosing {site.name}</span>
        </footer>
      </div>
    </article>
  );
}
