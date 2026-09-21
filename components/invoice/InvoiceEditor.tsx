"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, ExternalLink, Link2, MessageCircle, Plus, RefreshCw, Trash2, Wallet } from "lucide-react";
import type { InvoiceLine } from "@/lib/db/schema";
import {
  computeTotals,
  emptyLine,
  formatDateIN,
  inr,
  lineAmountPaise,
  pruneLines,
  toPaise,
  toRupees,
  todayIST,
  INVOICE_STATUSES,
  METHOD_LABEL,
  PAYMENT_METHODS,
  STATUS_LABEL,
  type InvoiceInput,
  type InvoiceStatus,
  type PaymentInput,
} from "@/lib/invoices/calc";
import type { InvoiceJson } from "@/lib/invoices/serialize";
import { cn } from "@/lib/utils";

const input = "w-full rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-gold/60 focus:ring-4 focus:ring-gold/10";
const label = "mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-muted";

interface Props {
  mode: "create" | "edit";
  initial: InvoiceInput;
  record?: InvoiceJson;
}

/** Rupee input that stores paise; shows blank while typing. */
function MoneyInput({ paise, onChange, className, ...rest }: { paise: number; onChange: (paise: number) => void; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const [text, setText] = useState(paise ? String(toRupees(paise)) : "");
  return (
    <input
      {...rest}
      type="number"
      inputMode="decimal"
      min={0}
      step="0.01"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(toPaise(Number(e.target.value) || 0));
      }}
      onBlur={() => setText(paise ? String(toRupees(paise)) : "")}
      className={cn(input, "text-right tabular-nums", className)}
    />
  );
}

const emptyPayment = (): PaymentInput => ({ date: todayIST(), amountPaise: 0, method: "upi", reference: "", note: "" });

export function InvoiceEditor({ mode, initial, record }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<InvoiceInput>(initial);
  const [rec, setRec] = useState<InvoiceJson | undefined>(record);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [newPayment, setNewPayment] = useState<PaymentInput>(emptyPayment());
  const [paymentKey, setPaymentKey] = useState(0); // remounts the amount input after adding

  const paidPaise = rec ? rec.advancePaidPaise : form.initialPayment?.amountPaise ?? 0;
  const totals = useMemo(() => computeTotals(pruneLines(form.items), form.discountPaise, form.gstRateBp, paidPaise), [form, paidPaise]);

  const set = <K extends keyof InvoiceInput>(k: K, v: InvoiceInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (i: number, patch: Partial<InvoiceLine>) => setForm((f) => ({ ...f, items: f.items.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));
  const addLine = () => setForm((f) => ({ ...f, items: [...f.items, emptyLine()] }));
  const removeLine = (i: number) => setForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, j) => j !== i) : [emptyLine()] }));

  const shareUrl = rec ? `${typeof window !== "undefined" ? window.location.origin : ""}/i/${rec.token}` : "";

  const api = async (url: string, init: RequestInit, key: string) => {
    setBusy(key);
    setMessage(null);
    try {
      const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init.headers ?? {}) } });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push("/invoice/login");
        return null;
      }
      if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
      return json;
    } catch (e) {
      setMessage({ tone: "err", text: e instanceof Error ? e.message : "Something went wrong" });
      return null;
    } finally {
      setBusy(null);
    }
  };

  const applyRecord = (invoice: InvoiceJson) => {
    setRec(invoice);
    setForm((f) => ({ ...f, status: invoice.status as InvoiceStatus }));
  };

  const save = async () => {
    const payload: InvoiceInput = { ...form, items: pruneLines(form.items) };
    if (payload.initialPayment && payload.initialPayment.amountPaise <= 0) delete payload.initialPayment;
    if (mode === "create") {
      const json = await api("/api/invoices", { method: "POST", body: JSON.stringify(payload) }, "save");
      if (json?.ok) router.push(`/invoice/${json.invoice.id}`);
      return;
    }
    const json = await api(`/api/invoices/${rec!.id}`, { method: "PUT", body: JSON.stringify(payload) }, "save");
    if (json?.ok) {
      applyRecord(json.invoice);
      setMessage({ tone: "ok", text: "Saved. The client link now shows the updated invoice." });
      router.refresh();
    }
  };

  const patch = async (body: object, key: string, okText: string) => {
    const json = await api(`/api/invoices/${rec!.id}`, { method: "PATCH", body: JSON.stringify(body) }, key);
    if (json?.ok) {
      applyRecord(json.invoice);
      setMessage({ tone: "ok", text: okText });
    }
    return json?.ok === true;
  };

  const recordPayment = async () => {
    if (newPayment.amountPaise <= 0) return;
    const ok = await patch({ addPayment: newPayment }, "pay", `Recorded ${inr(newPayment.amountPaise)}`);
    if (ok) {
      setNewPayment(emptyPayment());
      setPaymentKey((k) => k + 1);
    }
  };

  const duplicate = async () => {
    const payload: InvoiceInput = { ...form, items: pruneLines(form.items), status: "draft", issueDate: todayIST() };
    delete payload.initialPayment;
    const json = await api("/api/invoices", { method: "POST", body: JSON.stringify(payload) }, "dup");
    if (json?.ok) router.push(`/invoice/${json.invoice.id}`);
  };

  const remove = async () => {
    if (!rec || !window.confirm(`Delete ${rec.invoiceNumber}? It moves to the Deleted list and the client link stops working. You can restore it later.`)) return;
    const json = await api(`/api/invoices/${rec.id}`, { method: "DELETE" }, "del");
    if (json?.ok) router.push("/invoice?status=deleted");
  };

  const restore = async () => {
    const ok = await patch({ restore: true }, "restore", "Invoice restored. The client link works again.");
    if (ok) router.refresh();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setMessage({ tone: "ok", text: "Link copied" });
  };

  const whatsappHref = () => {
    const digits = (form.clientPhone ?? "").replace(/\D/g, "");
    const to = digits.length === 10 ? `91${digits}` : digits;
    const due = totals.balanceDuePaise > 0 ? `Balance due: ${inr(totals.balanceDuePaise)}` : "Paid in full, thank you.";
    const text = `Hi ${form.clientName || ""}, here is your invoice ${rec?.invoiceNumber ?? ""} from Mihir Sound & Light.\n\nTotal: ${inr(totals.grandTotalPaise)}\nReceived: ${inr(paidPaise)}\n${due}\n\nView and download: ${shareUrl}`;
    return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        {rec?.deletedAt && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            <span>This invoice was deleted on {new Date(rec.deletedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}. The client link is disabled.</span>
            <button type="button" onClick={restore} disabled={busy !== null} className="rounded-full bg-rose-100 px-4 py-1.5 text-xs font-semibold text-rose-900 hover:brightness-105 disabled:opacity-50">
              Restore
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">{mode === "create" ? "New invoice" : rec?.invoiceNumber}</h1>
            <p className="mt-1 text-sm text-muted">{mode === "create" ? "Number is assigned on save." : `Last saved ${new Date(rec!.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`}</p>
          </div>
          <Link href="/invoice" className="text-sm text-muted hover:text-ink">
            All invoices
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Client name *</label>
            <input className={input} value={form.clientName} onChange={(e) => set("clientName", e.target.value)} placeholder="Person or company" />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input className={input} value={form.clientPhone ?? ""} onChange={(e) => set("clientPhone", e.target.value)} placeholder="10-digit mobile" inputMode="tel" />
          </div>
          <div>
            <label className={label}>Email</label>
            <input className={input} type="email" value={form.clientEmail ?? ""} onChange={(e) => set("clientEmail", e.target.value)} placeholder="optional" />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Billing address</label>
            <textarea className={input} rows={2} value={form.clientAddress ?? ""} onChange={(e) => set("clientAddress", e.target.value)} />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label}>Event</label>
            <input className={input} value={form.eventTitle ?? ""} onChange={(e) => set("eventTitle", e.target.value)} placeholder="Sangeet night, Sharma wedding" />
          </div>
          <div>
            <label className={label}>Event start</label>
            <input className={input} type="date" value={form.eventStart ?? ""} onChange={(e) => set("eventStart", e.target.value)} />
          </div>
          <div>
            <label className={label}>Event end</label>
            <input className={input} type="date" value={form.eventEnd ?? ""} onChange={(e) => set("eventEnd", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={label}>Venue</label>
            <input className={input} value={form.venue ?? ""} onChange={(e) => set("venue", e.target.value)} placeholder="Venue name, city" />
          </div>
          <div>
            <label className={label}>Invoice date *</label>
            <input className={input} type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} />
          </div>
          <div>
            <label className={label}>Due date</label>
            <input className={input} type="date" value={form.dueDate ?? ""} onChange={(e) => set("dueDate", e.target.value)} />
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Line items</h2>
            <button type="button" onClick={addLine} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink/85 hover:border-gold/60">
              <Plus className="h-3.5 w-3.5" /> Add line
            </button>
          </div>
          <div className="space-y-3">
            {form.items.map((l, i) => (
              <div key={i} className="grid gap-2 rounded-2xl border border-white/10 p-3 sm:grid-cols-[1fr_90px_130px_130px_36px] sm:items-end">
                <div className="grid gap-2">
                  <input className={input} value={l.title} onChange={(e) => setLine(i, { title: e.target.value })} placeholder="Item, e.g. JBL line array 6/side" />
                  <input className={cn(input, "text-xs")} value={l.description} onChange={(e) => setLine(i, { description: e.target.value })} placeholder="Description (optional)" />
                </div>
                <div>
                  <label className={label}>Qty</label>
                  <input className={cn(input, "text-right tabular-nums")} type="number" min={0} step="0.5" value={l.quantity} onChange={(e) => setLine(i, { quantity: Number(e.target.value) || 0 })} />
                </div>
                <div>
                  <label className={label}>Rate ₹</label>
                  <MoneyInput paise={l.ratePaise} onChange={(p) => setLine(i, { ratePaise: p })} />
                </div>
                <div>
                  <label className={label}>Amount</label>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 text-right text-sm tabular-nums text-ink/85">{inr(lineAmountPaise(l))}</div>
                </div>
                <button type="button" onClick={() => removeLine(i)} aria-label="Remove line" className="flex h-10 w-9 items-center justify-center rounded-xl text-muted hover:text-rose-300">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Discount ₹</label>
            <MoneyInput paise={form.discountPaise} onChange={(p) => set("discountPaise", p)} />
          </div>
          <div>
            <label className={label}>GST</label>
            <select className={cn(input, "bg-charcoal")} value={form.gstRateBp} onChange={(e) => set("gstRateBp", Number(e.target.value))}>
              <option value={0}>No GST</option>
              <option value={500}>5%</option>
              <option value={1200}>12%</option>
              <option value={1800}>18%</option>
            </select>
          </div>
        </section>

        {mode === "create" && (
          <section className="rounded-2xl border border-white/10 p-4">
            <h2 className="text-sm font-semibold text-ink">Advance already received?</h2>
            <p className="mt-1 text-xs text-muted">Optional. It is recorded as the first payment; more payments can be added later on the same invoice.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_150px_140px]">
              <div>
                <label className={label}>Amount ₹</label>
                <MoneyInput paise={form.initialPayment?.amountPaise ?? 0} onChange={(p) => set("initialPayment", { ...(form.initialPayment ?? emptyPayment()), amountPaise: p })} />
              </div>
              <div>
                <label className={label}>Date</label>
                <input className={input} type="date" value={form.initialPayment?.date ?? todayIST()} onChange={(e) => set("initialPayment", { ...(form.initialPayment ?? emptyPayment()), date: e.target.value })} />
              </div>
              <div>
                <label className={label}>Method</label>
                <select className={cn(input, "bg-charcoal")} value={form.initialPayment?.method ?? "upi"} onChange={(e) => set("initialPayment", { ...(form.initialPayment ?? emptyPayment()), method: e.target.value as PaymentInput["method"] })}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {METHOD_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-4">
          <div>
            <label className={label}>Notes to client</label>
            <textarea className={input} rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="Load-in time, power requirements, thanks" />
          </div>
          <div>
            <label className={label}>Terms (one per line)</label>
            <textarea className={cn(input, "text-xs")} rows={5} value={form.terms.join("\n")} onChange={(e) => set("terms", e.target.value.split("\n"))} />
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{inr(totals.subtotalPaise)}</dd>
            </div>
            {totals.discountPaise > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">Discount</dt>
                <dd className="tabular-nums">- {inr(totals.discountPaise)}</dd>
              </div>
            )}
            {totals.gstPaise > 0 && (
              <div className="flex justify-between">
                <dt className="text-muted">GST {form.gstRateBp / 100}%</dt>
                <dd className="tabular-nums">{inr(totals.gstPaise)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
              <dt>Grand total</dt>
              <dd className="tabular-nums">{inr(totals.grandTotalPaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Received</dt>
              <dd className="tabular-nums text-emerald-200">{inr(paidPaise)}</dd>
            </div>
            <div className={cn("flex justify-between text-base font-semibold", totals.balanceDuePaise > 0 ? "text-gold-soft" : "text-emerald-200")}>
              <dt>Balance due</dt>
              <dd className="tabular-nums">{inr(totals.balanceDuePaise)}</dd>
            </div>
          </dl>

          <div className="mt-5">
            <label className={label}>Status</label>
            <select className={cn(input, "bg-charcoal")} value={form.status} onChange={(e) => set("status", e.target.value as InvoiceStatus)}>
              {INVOICE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-muted">Paid and partially paid follow the payments automatically; use this for Sent or Cancelled.</p>
          </div>

          <button type="button" onClick={save} disabled={busy !== null || !form.clientName.trim()} className="mt-5 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition hover:brightness-105 disabled:opacity-50">
            {busy === "save" ? "Saving" : mode === "create" ? "Create invoice" : "Save changes"}
          </button>
          {message && (
            <p role="status" className={cn("mt-3 text-xs", message.tone === "ok" ? "text-emerald-200" : "text-rose-300")}>
              {message.text}
            </p>
          )}
        </div>

        {rec && (
          <div className="rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
              <Wallet className="h-3.5 w-3.5" /> Payments received
            </div>
            {rec.payments.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Nothing received yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-white/8 text-sm">
                {rec.payments.map((p) => (
                  <li key={p.id} className="flex items-start justify-between gap-3 py-2">
                    <div>
                      <div className="text-ink">{inr(p.amountPaise)}</div>
                      <div className="text-xs text-muted">
                        {formatDateIN(p.date)} · {METHOD_LABEL[p.method]}
                        {p.reference ? ` · ${p.reference}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove payment"
                      disabled={busy !== null}
                      onClick={() => window.confirm(`Remove the ${inr(p.amountPaise)} payment?`) && patch({ removePayment: p.id }, "unpay", "Payment removed")}
                      className="mt-0.5 text-muted hover:text-rose-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {totals.balanceDuePaise > 0 ? (
              <div className="mt-4 grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={label}>Amount ₹</label>
                    <MoneyInput key={paymentKey} paise={newPayment.amountPaise} onChange={(p) => setNewPayment((x) => ({ ...x, amountPaise: p }))} placeholder={String(toRupees(totals.balanceDuePaise))} />
                  </div>
                  <div>
                    <label className={label}>Date</label>
                    <input className={input} type="date" value={newPayment.date} onChange={(e) => setNewPayment((x) => ({ ...x, date: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select className={cn(input, "bg-charcoal")} value={newPayment.method} onChange={(e) => setNewPayment((x) => ({ ...x, method: e.target.value as PaymentInput["method"] }))}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {METHOD_LABEL[m]}
                      </option>
                    ))}
                  </select>
                  <input className={input} value={newPayment.reference} onChange={(e) => setNewPayment((x) => ({ ...x, reference: e.target.value }))} placeholder="UTR / reference" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setNewPayment((x) => ({ ...x, amountPaise: totals.balanceDuePaise }))} className="rounded-full border border-white/15 px-3 py-2 text-xs text-ink/85 hover:border-gold/60">
                    Full balance
                  </button>
                  <button type="button" onClick={recordPayment} disabled={busy !== null || newPayment.amountPaise <= 0} className="flex-1 rounded-full bg-gold px-3 py-2 text-xs font-semibold text-charcoal hover:brightness-105 disabled:opacity-50">
                    {busy === "pay" ? "Recording" : "Record payment"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs text-emerald-200">Paid in full. The client link and PDF now show PAID.</p>
            )}
          </div>
        )}

        {rec && (
          <div className="rounded-2xl border border-white/10 p-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted">Client link</div>
            <div className="mt-2 break-all rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-xs text-ink/85">{shareUrl}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <button type="button" onClick={copyLink} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 hover:border-gold/60">
                <Copy className="h-4 w-4" /> Copy
              </button>
              <a href={whatsappHref()} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-3 py-2 font-semibold text-charcoal hover:brightness-105">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href={`/api/i/${rec.token}/pdf`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 hover:border-gold/60">
                <Download className="h-4 w-4" /> PDF
              </a>
              <a href={`/i/${rec.token}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 hover:border-gold/60">
                <ExternalLink className="h-4 w-4" /> Preview
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
              <button type="button" onClick={duplicate} disabled={busy !== null} className="inline-flex items-center gap-1 hover:text-ink">
                <RefreshCw className="h-3.5 w-3.5" /> Duplicate
              </button>
              <button
                type="button"
                onClick={() => window.confirm("Issue a new link? The current link stops working.") && patch({ rotateToken: true }, "rotate", "New link issued")}
                disabled={busy !== null}
                className="inline-flex items-center gap-1 hover:text-ink"
              >
                <Link2 className="h-3.5 w-3.5" /> New link
              </button>
              <button type="button" onClick={remove} disabled={busy !== null} className="inline-flex items-center gap-1 hover:text-rose-300">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
