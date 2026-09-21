"use client";

import { useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/site";
import { services } from "@/lib/services";
import { packages } from "@/lib/packages";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-white/12 bg-stage/70 px-4 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted/80 focus:border-gold/60 focus:ring-4 focus:ring-gold/10";

/**
 * Booking form that composes a WhatsApp message — no backend, no data stored.
 * The send button is a plain link, so it works without JS-driven popups.
 */
export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", city: "", service: "", notes: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.name.trim() && form.phone.replace(/\D/g, "").length >= 10 && form.date && form.city.trim() && form.service;

  const href = useMemo(() => {
    const dateStr = form.date
      ? new Date(form.date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" })
      : "";
    const msg = [
      "Hi Mihir! I want to book your event production services.",
      "",
      `Name: ${form.name.trim()}`,
      `Phone: +91 ${form.phone.replace(/\D/g, "").slice(-10)}`,
      dateStr && `Date: ${dateStr}`,
      form.time && `Time: ${form.time}`,
      `Venue city: ${form.city.trim()}`,
      `Service: ${form.service}`,
      form.notes.trim() && `Notes: ${form.notes.trim()}`,
      "",
      "Please share availability and pricing.",
    ]
      .filter(Boolean)
      .join("\n");
    return whatsappUrl(msg);
  }, [form]);

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-2 block text-muted">Name *</span>
          <input required value={form.name} onChange={set("name")} placeholder="Your name" className={inputCls} autoComplete="name" />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block text-muted">Phone *</span>
          <input required type="tel" inputMode="numeric" value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" className={inputCls} autoComplete="tel" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-2 block text-muted">Event date *</span>
          <input required type="date" value={form.date} onChange={set("date")} className={inputCls} />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block text-muted">Event time</span>
          <input type="time" value={form.time} onChange={set("time")} className={inputCls} />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow mb-2 block text-muted">Venue city *</span>
        <input required value={form.city} onChange={set("city")} placeholder="Indore, Ujjain, Bhopal…" className={inputCls} autoComplete="address-level2" />
      </label>
      <label className="block">
        <span className="eyebrow mb-2 block text-muted">Service *</span>
        <select required value={form.service} onChange={set("service")} className={cn(inputCls, "appearance-none")}>
          <option value="">Select a service</option>
          <optgroup label="Packages">
            {packages.map((p) => (
              <option key={p.id} value={`${p.name} (${p.price})`}>
                {p.name} ({p.price})
              </option>
            ))}
          </optgroup>
          <optgroup label="Individual systems">
            {services.map((s) => (
              <option key={s.slug} value={s.shortName}>
                {s.shortName} only
              </option>
            ))}
          </optgroup>
        </select>
      </label>
      <label className="block">
        <span className="eyebrow mb-2 block text-muted">Notes</span>
        <textarea rows={4} value={form.notes} onChange={set("notes")} placeholder="Guest count, venue details, mood, technical requirements" className={inputCls} />
      </label>

      <a
        href={valid ? href : undefined}
        aria-disabled={!valid}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full px-7 text-sm font-semibold transition-[transform,filter,background-color,color] duration-200 ease-out-strong",
          valid ? "bg-gold text-charcoal shadow-glow-gold hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.97]" : "cursor-not-allowed bg-white/8 text-muted",
        )}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {valid ? "Send via WhatsApp" : "Fill the required fields to send"}
      </a>
      <p className="text-xs text-muted">Opens WhatsApp with your details pre-filled. Nothing is stored on this website.</p>
    </form>
  );
}
