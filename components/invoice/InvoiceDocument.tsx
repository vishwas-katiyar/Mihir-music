import Image from "next/image";
import type { InvoiceRow } from "@/lib/db/schema";
import { inr, toRupees, lineAmountPaise, formatDateIN, amountInWords, splitTerm, METHOD_LABEL, STATUS_LABEL, type InvoiceStatus } from "@/lib/invoices/calc";
import { UPI } from "@/lib/invoices/upi";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const num = (p: number) => toRupees(p).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusTone: Record<InvoiceStatus, string> = { draft: "text-slate-500", sent: "text-[#113163]", partially_paid: "text-[#113163]", paid: "text-[#0b7a4e]", cancelled: "text-[#bd2d33]" };

/**
 * The invoice as a sheet, mirroring the PDF: navy header band with the monogram tile,
 * Bill To / From / Event Schedule cards, navy-headed items table, UPI card beside the
 * totals card, Terms & Conditions card, seal and signature.
 */
export function InvoiceDocument({ invoice: inv, qrSrc }: { invoice: InvoiceRow; qrSrc?: string }) {
  const status = inv.status as InvoiceStatus;
  const cancelled = status === "cancelled";
  const pending = inv.balanceDuePaise > 0 && !cancelled;
  const refundPaise = cancelled ? 0 : Math.max(inv.advancePaidPaise - inv.grandTotalPaise, 0);
  const settled = !cancelled && inv.grandTotalPaise > 0 && inv.balanceDuePaise === 0;
  const eventDate =
    inv.eventStart && inv.eventEnd && inv.eventStart !== inv.eventEnd ? `${formatDateIN(inv.eventStart)} to ${formatDateIN(inv.eventEnd)}` : formatDateIN(inv.eventStart || inv.eventEnd);

  return (
    <article className="mx-auto w-full max-w-[860px] overflow-hidden bg-white font-sans text-[13px] leading-snug text-[#334155] shadow-[0_30px_80px_rgb(0_0_0/0.5)] print:max-w-none print:shadow-none">
      {/* Header band */}
      <header className="bg-[#0b0b0b] px-4 py-5 text-white sm:px-10 sm:py-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:gap-4">
            <Image src="/logo-horizontal.png" alt={site.name} width={800} height={346} className="h-[52px] w-auto shrink-0 sm:h-[66px]" />
            <div className="hidden h-[62px] w-px shrink-0 bg-[#d4af37]/45 sm:block" />
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#d4af37]">Tax invoice</div>
              <div className="mt-1 text-[13px] font-semibold">{site.name}</div>
              <div className="mt-1 text-xs text-[#c9c2ae]">
                {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}
              </div>
              <div className="text-xs text-[#c9c2ae]">
                {site.phoneDisplay} <span className="mx-1.5 opacity-60">|</span> {site.email}
              </div>
            </div>
          </div>
          <dl className="w-full rounded-lg bg-white px-4 py-3 text-[#1e293b] sm:w-[220px]">
            <div className="text-[13px] font-bold">Invoice Details</div>
            <div className="mt-1 flex justify-between text-xs">
              <dt className="text-slate-500">Invoice No</dt>
              <dd className="font-semibold">{inv.invoiceNumber}</dd>
            </div>
            <div className="mt-0.5 flex justify-between text-xs">
              <dt className="text-slate-500">Date</dt>
              <dd className="font-semibold">{formatDateIN(inv.issueDate)}</dd>
            </div>
            <div className="mt-0.5 flex justify-between text-xs">
              <dt className="text-slate-500">Due</dt>
              <dd className="font-semibold">{inv.dueDate ? formatDateIN(inv.dueDate) : "On receipt"}</dd>
            </div>
            <div className="mt-0.5 flex justify-between text-xs">
              <dt className="text-slate-500">Status</dt>
              <dd className={cn("font-semibold", statusTone[status])}>{STATUS_LABEL[status]}</dd>
            </div>
          </dl>
        </div>
      </header>
      <div className="h-1.5 bg-[#d4af37]" />

      <div className="px-4 pb-8 pt-5 sm:px-10">
        {/* Bill To / From */}
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="rounded-md bg-[#f8fafc] px-4 py-3">
            <div className="font-bold text-[#1e293b]">Bill To</div>
            <div className="mt-1 text-[14px] font-semibold text-[#1e293b]">{inv.clientName}</div>
            {inv.clientAddress && <div className="mt-0.5 whitespace-pre-line">{inv.clientAddress}</div>}
            {inv.clientPhone && <div className="mt-0.5">{inv.clientPhone}</div>}
            {inv.clientEmail && <div className="mt-0.5">{inv.clientEmail}</div>}
          </section>
          <section className="rounded-md bg-[#f8fafc] px-4 py-3">
            <div className="font-bold text-[#1e293b]">From</div>
            <div className="mt-1 text-[14px] font-semibold text-[#1e293b]">{site.name}</div>
            <div className="mt-0.5">
              {site.address.street}, {site.address.locality}, {site.address.region} {site.address.postalCode}
            </div>
            <div className="mt-0.5">{site.phoneDisplay}</div>
            <div className="mt-0.5">{site.email}</div>
          </section>
        </div>

        {/* Event schedule */}
        <section className="mt-2 flex flex-col gap-1 rounded-md bg-[#f8fafc] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-bold text-[#1e293b]">Event Schedule</div>
            <div>{inv.eventTitle || "Live event production"}</div>
          </div>
          <div className="sm:text-right">
            <div className="font-semibold text-[#1e293b]">{eventDate || "Date as agreed"}</div>
            {inv.venue && <div>{inv.venue}</div>}
          </div>
        </section>

        {/* Items — phones drop the header row and restack each line as a card rather than scroll sideways. */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse sm:min-w-[600px]">
            <thead className="hidden sm:table-header-group">
              <tr className="bg-[#1a1a1a] text-left text-white">
                <th className="w-9 px-2 py-2 text-center font-bold">#</th>
                <th className="w-32 px-2 py-2 font-bold">Item</th>
                <th className="px-2 py-2 font-bold">Description</th>
                <th className="w-14 px-2 py-2 text-right font-bold">Qty</th>
                <th className="w-28 px-2 py-2 text-right font-bold">Rate (INR)</th>
                <th className="w-32 px-2 py-2 text-right font-bold">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="text-[#1e293b] [&_td]:border-[#e2e8f0] sm:[&_td]:border">
              {inv.items.map((l, i) => (
                <tr
                  key={i}
                  className={cn(
                    "grid grid-cols-[1.25rem_minmax(0,1fr)_auto] gap-x-2 border-b border-[#e2e8f0] px-1 py-2.5 sm:table-row sm:border-0 sm:p-0",
                    i % 2 === 1 && "bg-[#f8fafc]",
                  )}
                >
                  <td className="col-start-1 row-start-1 text-slate-500 sm:w-9 sm:px-2 sm:py-2 sm:text-center sm:text-[#1e293b]">{i + 1}</td>
                  <td className="col-start-2 row-start-1 font-medium sm:px-2 sm:py-2">{l.title || "-"}</td>
                  {/* An empty description earns no line of its own on a phone; the table still needs the cell. */}
                  <td className={cn("col-span-2 col-start-2 row-start-2 text-xs text-slate-500 sm:px-2 sm:py-2 sm:text-[13px] sm:text-[#334155]", !l.description && "hidden sm:table-cell")}>
                    {l.description || "-"}
                  </td>
                  <td className="col-start-2 row-start-3 text-xs tabular-nums text-slate-500 before:content-['Qty_'] sm:px-2 sm:py-2 sm:text-right sm:text-[13px] sm:text-[#1e293b] sm:before:content-none">
                    {l.quantity}
                  </td>
                  <td className="col-start-3 row-start-3 text-right text-xs tabular-nums text-slate-500 before:content-['Rate_'] sm:px-2 sm:py-2 sm:text-[13px] sm:text-[#1e293b] sm:before:content-none">
                    {num(l.ratePaise)}
                  </td>
                  <td className="col-start-3 row-start-1 text-right font-medium tabular-nums sm:px-2 sm:py-2">{num(lineAmountPaise(l))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* UPI + totals */}
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
          <section className="min-w-0 rounded-lg bg-[#f8fafc] p-4">
            <div className="text-[14px] font-bold text-[#113163]">UPI Payment</div>
            <div className="mt-1 text-xs text-slate-600">UPI ID: {UPI.id}</div>
            <div className="text-xs text-slate-600">Reference: {inv.invoiceNumber}</div>
            {pending && qrSrc ? (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-[108px] w-[108px] shrink-0 items-center justify-center rounded-lg border border-[#d9e2f1] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL generated server-side */}
                  <img src={qrSrc} alt={`UPI QR code for ${inr(inv.balanceDuePaise)}`} className="h-24 w-24" />
                </div>
                <div className="text-xs text-slate-600">
                  <div className="font-semibold text-[#1e293b]">Pay: {inr(inv.balanceDuePaise)}</div>
                  <div>Scan QR to pay</div>
                  <div>Share screenshot after transfer.</div>
                </div>
              </div>
            ) : cancelled ? (
              <div className="mt-4 text-xs text-[#bd2d33]">Invoice cancelled. No payment due.</div>
            ) : (
              <div className="mt-4 text-xs text-[#0b7a4e]">
                No pending amount.
                <br />
                Payment completed.
              </div>
            )}
            {inv.payments.length > 0 && (
              <div className="mt-3 border-t border-[#d9e2f1] pt-2 text-xs">
                <div className="font-semibold text-[#1e293b]">Payments received</div>
                {inv.payments.map((p) => (
                  <div key={p.id} className="mt-0.5 flex justify-between gap-3 text-slate-600">
                    <span>
                      {formatDateIN(p.date)} {METHOD_LABEL[p.method]}
                      {p.reference ? `, ${p.reference}` : ""}
                    </span>
                    <span className="font-medium tabular-nums text-[#0b7a4e]">{inr(p.amountPaise)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <dl className="min-w-0 rounded-lg bg-[#f8fafc] p-4">
            <div className="flex justify-between">
              <dt>Subtotal:</dt>
              <dd className="tabular-nums">{inr(inv.subtotalPaise)}</dd>
            </div>
            {inv.discountPaise > 0 && (
              <div className="mt-1 flex justify-between">
                <dt>Discount:</dt>
                <dd className="tabular-nums">- {inr(inv.discountPaise)}</dd>
              </div>
            )}
            {inv.gstRateBp > 0 && (
              <div className="mt-1 flex justify-between">
                <dt>GST @ {inv.gstRateBp / 100}%:</dt>
                <dd className="tabular-nums">{inr(inv.gstPaise)}</dd>
              </div>
            )}
            <div className="mt-1 flex justify-between">
              <dt>Advance Paid:</dt>
              <dd className="tabular-nums">{inr(inv.advancePaidPaise)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-[#b0bfdd] pt-2 text-[17px] font-bold">
              <dt className="text-[#1e293b]">Grand Total:</dt>
              <dd className="tabular-nums text-[#0b7a4e]">{inr(inv.grandTotalPaise)}</dd>
            </div>
            <div className="mt-1 flex justify-between text-[15px] font-bold">
              <dt className="text-[#1e293b]">Remaining Due:</dt>
              <dd className={cn("tabular-nums", pending ? "text-[#bd2d33]" : "text-[#0b7a4e]")}>{cancelled ? inr(0) : inr(inv.balanceDuePaise)}</dd>
            </div>
            {refundPaise > 0 && (
              <div className="mt-1 flex justify-between text-[15px] font-bold">
                <dt className="text-[#1e293b]">Refund Due to You:</dt>
                <dd className="tabular-nums text-[#bd2d33]">{inr(refundPaise)}</dd>
              </div>
            )}
            <div className="mt-2 text-xs text-slate-500">In words: {amountInWords(inv.grandTotalPaise)}</div>
          </dl>
        </div>

        {/* Notes + terms */}
        {(inv.terms.length > 0 || inv.notes) && (
          <section className="mt-4 rounded-lg bg-[#f8fafc] p-4">
            {inv.notes && (
              <div className={cn(inv.terms.length > 0 && "mb-3")}>
                <div className="text-[14px] font-bold text-[#1e293b]">Notes</div>
                <p className="mt-1 whitespace-pre-line text-xs">{inv.notes}</p>
              </div>
            )}
            {inv.terms.length > 0 && (
              <>
                <div className="text-[14px] font-bold text-[#1e293b]">Terms &amp; Conditions</div>
                <ul className="mt-1.5 space-y-0.5 text-xs">
                  {inv.terms.map((t, i) => {
                    const parts = splitTerm(t);
                    return (
                      <li key={i} className="flex gap-1.5">
                        <span>-</span>
                        <span>
                          {parts ? <span className="font-semibold text-[#1e293b]">{parts.label}: </span> : null}
                          {parts ? parts.text : t}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>
        )}

        {/* Seal + signature */}
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="text-xs text-slate-500">{settled ? "Received with thanks." : "Thank you for your business."}</div>
          <div className="flex items-end gap-2.5 self-end">
            <Image src="/logo-mark.png" alt="" width={54} height={54} className="h-[54px] w-[54px] object-contain opacity-90" />
            <div className="w-[170px] border-t border-[#1e293b] pt-1.5 text-right">
              <div className="font-bold text-[#1e293b]">For {site.name}</div>
              <div className="text-xs text-slate-500">Authorised Signatory</div>
            </div>
          </div>
        </div>

        <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t border-[#e2e8f0] pt-2 text-[11px] text-slate-500">
          <span>
            Generated by {site.url.replace(/^https?:\/\//, "")} | {site.email}
          </span>
          <span>Thank you for choosing {site.name}</span>
        </footer>
      </div>
    </article>
  );
}
