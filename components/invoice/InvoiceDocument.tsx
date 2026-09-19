import Image from "next/image";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, lineAmountPaise, formatDateIN, amountInWords, METHOD_LABEL, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { UPI } from "@/lib/invoices/upi";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const statusTone: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-amber-50 text-amber-800",
  partially_paid: "bg-sky-50 text-sky-800",
  paid: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-rose-50 text-rose-800",
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500", className)}>{children}</div>
);

/**
 * The invoice as a printable A4-style sheet. Same structure as the PDF: header with
 * reference block, bill-to and event panels, items table, amount in words, payments,
 * UPI, totals with balance call-out, notes, terms and signature.
 */
export function InvoiceDocument({ invoice: inv, qrSrc }: { invoice: InvoiceRow; qrSrc?: string }) {
  const status = inv.status as InvoiceStatus;
  const cancelled = status === "cancelled";
  const isPaid = inv.grandTotalPaise > 0 && inv.balanceDuePaise === 0 && !cancelled;
  const showUpi = inv.balanceDuePaise > 0 && !cancelled && Boolean(qrSrc);
  const eventDate =
    inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);

  return (
    <article className="relative mx-auto w-full max-w-[860px] overflow-hidden bg-white px-6 py-8 font-sans text-[13px] leading-snug text-gray-700 shadow-[0_30px_80px_rgb(0_0_0/0.5)] sm:px-10 sm:py-10 print:max-w-none print:px-0 print:shadow-none">
      {(isPaid || cancelled) && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-[38%] select-none text-center font-bold uppercase tracking-[0.25em] opacity-[0.07] -rotate-[24deg]",
            isPaid ? "text-[7rem] text-emerald-700 sm:text-[9rem]" : "text-[4.5rem] text-rose-700 sm:text-[6rem]",
          )}
        >
          {isPaid ? "Paid" : "Cancelled"}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3.5">
          <Image src="/logo.png" alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full" />
          <div>
            <div className="font-display text-xl font-bold tracking-[-0.02em] text-gray-900">{site.name}</div>
            <div className="mt-1 text-xs text-gray-500">
              {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}
            </div>
            <div className="text-xs text-gray-500">
              {site.phoneDisplay} <span className="mx-1 text-gray-300">|</span> {site.email}
            </div>
            <div className="text-xs text-gray-500">{site.url.replace(/^https?:\/\//, "")}</div>
          </div>
        </div>
        <div className="sm:w-[260px]">
          <div className="text-3xl font-bold tracking-[0.08em] text-gray-900 sm:text-right">INVOICE</div>
          <dl className="mt-2 divide-y divide-gray-200 border-t border-gray-200 text-[13px]">
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-gray-500">Invoice No.</dt>
              <dd className="font-semibold text-gray-900">{inv.invoiceNumber}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-gray-500">Invoice date</dt>
              <dd className="font-semibold text-gray-900">{formatDateIN(inv.issueDate)}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-gray-500">Due date</dt>
              <dd className="font-semibold text-gray-900">{inv.dueDate ? formatDateIN(inv.dueDate) : "On receipt"}</dd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <dt className="text-gray-500">Status</dt>
              <dd>
                <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]", statusTone[status])}>{STATUS_LABEL[status]}</span>
              </dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="mt-4 h-0.5 bg-[#ffb800]" />

      {/* Bill to / event details */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <section className="rounded border border-gray-300">
          <Label className="border-b border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-700">Bill to</Label>
          <div className="px-3 py-2.5">
            <div className="text-[15px] font-semibold text-gray-900">{inv.clientName}</div>
            {inv.clientAddress && <div className="mt-0.5 whitespace-pre-line">{inv.clientAddress}</div>}
            {inv.clientPhone && <div className="mt-0.5">{inv.clientPhone}</div>}
            {inv.clientEmail && <div className="mt-0.5">{inv.clientEmail}</div>}
          </div>
        </section>
        <section className="rounded border border-gray-300">
          <Label className="border-b border-gray-300 bg-gray-100 px-3 py-1.5 text-gray-700">Event details</Label>
          <dl className="px-3 py-2.5">
            <div className="text-[15px] font-semibold text-gray-900">{inv.eventTitle || "Live event production"}</div>
            <div className="mt-0.5 grid grid-cols-[4.5rem_1fr]">
              <dt className="text-gray-500">Date</dt>
              <dd className="text-gray-900">{eventDate || "As agreed"}</dd>
            </div>
            <div className="mt-0.5 grid grid-cols-[4.5rem_1fr]">
              <dt className="text-gray-500">Venue</dt>
              <dd className="text-gray-900">{inv.venue || "As agreed"}</dd>
            </div>
            <div className="mt-0.5 grid grid-cols-[4.5rem_1fr]">
              <dt className="text-gray-500">Supplier</dt>
              <dd className="text-gray-900">
                {site.name}, {site.address.locality}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Items */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="bg-[#0b0c10] text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-white">
              <th className="w-8 rounded-tl px-2 py-2 text-center font-semibold">#</th>
              <th className="px-2 py-2 font-semibold">Description</th>
              <th className="w-14 px-2 py-2 text-right font-semibold">Qty</th>
              <th className="w-28 px-2 py-2 text-right font-semibold">Rate</th>
              <th className="w-32 rounded-tr px-2 py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((l, i) => (
              <tr key={i} className={cn("border-b border-gray-200 align-top", i % 2 === 1 && "bg-gray-50")}>
                <td className="px-2 py-2 text-center text-gray-500">{i + 1}</td>
                <td className="px-2 py-2">
                  <div className="font-medium text-gray-900">{l.title || "Item"}</div>
                  {l.description && <div className="mt-0.5 text-xs text-gray-500">{l.description}</div>}
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-gray-900">{l.quantity}</td>
                <td className="px-2 py-2 text-right tabular-nums text-gray-900">{inr(l.ratePaise)}</td>
                <td className="px-2 py-2 text-right font-medium tabular-nums text-gray-900">{inr(lineAmountPaise(l))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Words, payments, UPI and totals */}
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] items-start gap-4 sm:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-3">
          <div className="rounded border border-gray-300 px-3 py-2">
            <Label>Total in words</Label>
            <div className="mt-0.5 font-medium text-gray-900">{amountInWords(inv.grandTotalPaise)}</div>
          </div>

          {inv.payments.length > 0 && (
            <table className="w-full border-collapse overflow-hidden rounded border border-gray-300">
              <thead>
                <tr className="bg-gray-100 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-500">
                  <th className="px-3 py-1.5 font-semibold">Date</th>
                  <th className="px-3 py-1.5 font-semibold">Mode / reference</th>
                  <th className="px-3 py-1.5 text-right font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 border-t border-gray-300">
                {inv.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-3 py-1.5 text-gray-900">{formatDateIN(p.date)}</td>
                    <td className="px-3 py-1.5">
                      {METHOD_LABEL[p.method]}
                      {p.reference ? `, ${p.reference}` : ""}
                    </td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums text-emerald-700">{inr(p.amountPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showUpi && (
            <div className="flex items-center gap-3 rounded border border-gray-300 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL generated server-side */}
              <img src={qrSrc} alt={`UPI QR code for ${inr(inv.balanceDuePaise)}`} className="h-24 w-24 shrink-0" />
              <dl>
                <Label>Pay by UPI</Label>
                <div className="mt-1 grid grid-cols-[3.5rem_1fr]">
                  <dt className="text-gray-500">UPI ID</dt>
                  <dd className="font-semibold text-gray-900">{UPI.id}</dd>
                </div>
                <div className="grid grid-cols-[3.5rem_1fr]">
                  <dt className="text-gray-500">Payee</dt>
                  <dd className="text-gray-900">{UPI.payeeName}</dd>
                </div>
                <div className="grid grid-cols-[3.5rem_1fr]">
                  <dt className="text-gray-500">Amount</dt>
                  <dd className="font-semibold text-gray-900">{inr(inv.balanceDuePaise)}</dd>
                </div>
                <p className="mt-1 text-xs text-gray-500">Scan with any UPI app. Quote {inv.invoiceNumber} in the remark and send the screenshot on WhatsApp.</p>
              </dl>
            </div>
          )}
        </div>

        <dl className="overflow-hidden rounded border border-gray-300 divide-y divide-gray-200">
          <div className="flex justify-between px-3 py-1.5">
            <dt className="text-gray-500">Subtotal</dt>
            <dd className="tabular-nums text-gray-900">{inr(inv.subtotalPaise)}</dd>
          </div>
          {inv.discountPaise > 0 && (
            <div className="flex justify-between px-3 py-1.5">
              <dt className="text-gray-500">Discount</dt>
              <dd className="tabular-nums text-gray-900">- {inr(inv.discountPaise)}</dd>
            </div>
          )}
          {inv.gstRateBp > 0 && (
            <>
              <div className="flex justify-between px-3 py-1.5">
                <dt className="text-gray-500">Taxable value</dt>
                <dd className="tabular-nums text-gray-900">{inr(inv.subtotalPaise - inv.discountPaise)}</dd>
              </div>
              <div className="flex justify-between px-3 py-1.5">
                <dt className="text-gray-500">GST @ {inv.gstRateBp / 100}%</dt>
                <dd className="tabular-nums text-gray-900">{inr(inv.gstPaise)}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between bg-gray-100 px-3 py-2 font-bold text-gray-900">
            <dt>Grand total</dt>
            <dd className="tabular-nums">{inr(inv.grandTotalPaise)}</dd>
          </div>
          <div className="flex justify-between px-3 py-1.5">
            <dt className="text-gray-500">Amount received</dt>
            <dd className={cn("tabular-nums", inv.advancePaidPaise > 0 ? "text-emerald-700" : "text-gray-900")}>{inr(inv.advancePaidPaise)}</dd>
          </div>
          <div className="flex items-center justify-between bg-[#0b0c10] px-3 py-2.5 text-white">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/75">{cancelled ? "Cancelled" : isPaid ? "Paid in full" : "Balance due"}</dt>
            <dd className="text-xl font-bold tabular-nums">{cancelled ? "No amount due" : inr(inv.balanceDuePaise)}</dd>
          </div>
        </dl>
      </div>

      {/* Notes, terms, signature */}
      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0">
          {inv.notes && (
            <div className="mb-3">
              <Label>Notes</Label>
              <p className="mt-0.5 whitespace-pre-line">{inv.notes}</p>
            </div>
          )}
          {inv.terms.length > 0 && (
            <>
              <Label>Terms and conditions</Label>
              <ol className="mt-1 space-y-0.5 text-xs text-gray-500">
                {inv.terms.map((t, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span>{i + 1}.</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <div className="mt-10 border-t border-gray-900 pt-1.5 text-right">
            <div className="font-semibold text-gray-900">For {site.name}</div>
            <div className="text-gray-500">Authorised signatory</div>
          </div>
        </div>
      </div>

      <footer className="mt-6 border-t border-gray-200 pt-2 text-[11px] text-gray-400">Computer-generated invoice. The latest copy and payment link stay at this address.</footer>
    </article>
  );
}
