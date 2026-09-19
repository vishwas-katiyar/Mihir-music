import Image from "next/image";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, lineAmountPaise, formatDateIN, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
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

/**
 * The invoice as a white A4-like sheet. Server component; used on the public share
 * page and as the print layout. Mirrors the PDF so both surfaces match.
 */
export function InvoiceDocument({ invoice: inv, qrSrc }: { invoice: InvoiceRow; qrSrc?: string }) {
  const status = inv.status as InvoiceStatus;
  const eventRange =
    inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);

  return (
    <article className="mx-auto w-full max-w-[860px] bg-white text-[#0f172a] shadow-[0_30px_80px_rgb(0_0_0/0.5)] print:max-w-none print:shadow-none">
      <div className="p-7 sm:p-10">
        <header className="flex flex-col gap-6 border-b-2 border-[#c99700] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="" width={56} height={56} className="h-14 w-14 rounded-full" />
            <div>
              <div className="font-display text-xl font-bold tracking-[-0.03em]">{site.name}</div>
              <div className="mt-1 text-xs text-slate-500">
                {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}
              </div>
              <div className="text-xs text-slate-500">
                {site.phoneDisplay} · {site.email}
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="font-display text-3xl font-bold tracking-[-0.04em]">Invoice</div>
            <div className="mt-1 text-sm text-slate-600">{inv.invoiceNumber}</div>
            <div className="text-sm text-slate-600">
              Issued {formatDateIN(inv.issueDate)}
              {inv.dueDate ? `, due ${formatDateIN(inv.dueDate)}` : ""}
            </div>
            <span className={cn("mt-3 inline-block rounded px-2.5 py-1 text-xs font-semibold", statusTone[status])}>{STATUS_LABEL[status]}</span>
          </div>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Billed to</div>
            <div className="mt-2 text-base font-semibold">{inv.clientName}</div>
            {inv.clientAddress && <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{inv.clientAddress}</p>}
            {inv.clientPhone && <p className="text-sm text-slate-700">{inv.clientPhone}</p>}
            {inv.clientEmail && <p className="text-sm text-slate-700">{inv.clientEmail}</p>}
          </div>
          <div className="rounded-lg bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Event</div>
            <div className="mt-2 text-base font-semibold">{inv.eventTitle || "Live event production"}</div>
            {eventRange && <p className="mt-1 text-sm text-slate-700">{eventRange}</p>}
            {inv.venue && <p className="text-sm text-slate-700">{inv.venue}</p>}
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-[#0b0c10] text-left text-xs text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 text-right font-semibold">Qty</th>
                <th className="px-4 py-3 text-right font-semibold">Rate</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.items.map((l, i) => (
                <tr key={i} className={cn("border-t border-slate-200 align-top", i % 2 === 1 && "bg-slate-50")}>
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.title || "Item"}</div>
                    {l.description && <div className="mt-0.5 text-xs text-slate-500">{l.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{l.quantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{inr(l.ratePaise)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{inr(lineAmountPaise(l))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Pay by UPI</div>
            {inv.balanceDuePaise > 0 ? (
              <div className="mt-3 flex items-start gap-4">
                {qrSrc && (
                  // eslint-disable-next-line @next/next/no-img-element -- data URL generated server-side
                  <img src={qrSrc} alt={`UPI QR for ${inr(inv.balanceDuePaise)}`} className="h-28 w-28 rounded-md border border-slate-200 bg-white p-1" />
                )}
                <div className="text-sm text-slate-700">
                  <div className="text-lg font-semibold text-[#0f172a]">{inr(inv.balanceDuePaise)}</div>
                  <div className="mt-1">UPI ID: {UPI.id}</div>
                  <div>Reference: {inv.invoiceNumber}</div>
                  <p className="mt-2 text-xs text-slate-500">Scan with any UPI app, then share the screenshot on WhatsApp.</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-emerald-700">Paid in full. Thank you.</p>
            )}
          </div>
          <dl className="rounded-lg bg-slate-50 p-5 text-sm">
            <div className="flex justify-between py-1">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="tabular-nums">{inr(inv.subtotalPaise)}</dd>
            </div>
            {inv.discountPaise > 0 && (
              <div className="flex justify-between py-1">
                <dt className="text-slate-600">Discount</dt>
                <dd className="tabular-nums">- {inr(inv.discountPaise)}</dd>
              </div>
            )}
            {inv.gstRateBp > 0 && (
              <div className="flex justify-between py-1">
                <dt className="text-slate-600">GST {inv.gstRateBp / 100}%</dt>
                <dd className="tabular-nums">{inr(inv.gstPaise)}</dd>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
              <dt>Grand total</dt>
              <dd className="tabular-nums">{inr(inv.grandTotalPaise)}</dd>
            </div>
            <div className="flex justify-between py-1">
              <dt className="text-slate-600">Advance received</dt>
              <dd className="tabular-nums">{inr(inv.advancePaidPaise)}</dd>
            </div>
            <div className={cn("flex justify-between py-1 text-base font-semibold", inv.balanceDuePaise > 0 ? "text-rose-700" : "text-emerald-700")}>
              <dt>Balance due</dt>
              <dd className="tabular-nums">{inr(inv.balanceDuePaise)}</dd>
            </div>
          </dl>
        </div>

        {inv.notes && (
          <section className="mt-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Notes</div>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{inv.notes}</p>
          </section>
        )}

        {inv.terms.length > 0 && (
          <section className="mt-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Terms</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-slate-600">
              {inv.terms.map((t, i) => (
                <li key={i}>{t}</li>
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
