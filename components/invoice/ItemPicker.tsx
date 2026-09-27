"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { INVOICE_CATALOG, catalogRatePaise, type CatalogItem } from "@/lib/invoices/catalog";
import { inr } from "@/lib/invoices/calc";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (item: CatalogItem) => void;
  onAddCustom: () => void;
}

/**
 * Bottom sheet on phones (where most admins run this), a centered dialog from `sm` up.
 * Stays open across taps so several items can be added in one pass; each tap flashes a
 * check on that row instead of closing, so the admin can see what landed.
 */
export function ItemPicker({ open, onClose, onSelect, onAddCustom }: Props) {
  const [query, setQuery] = useState("");
  const [justAdded, setJustAdded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return INVOICE_CATALOG;
    return INVOICE_CATALOG.map((g) => ({
      ...g,
      items: g.items.filter((it) => it.title.toLowerCase().includes(q) || it.description.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  if (!open) return null;

  const pick = (item: CatalogItem) => {
    onSelect(item);
    setJustAdded(item.title);
    window.setTimeout(() => setJustAdded((cur) => (cur === item.title ? null : cur)), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative flex max-h-[85vh] w-full flex-col rounded-t-3xl border border-white/10 bg-charcoal shadow-2xl sm:max-h-[80vh] sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 pt-5 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold tracking-[-0.02em] text-ink">Add item</h2>
            <p className="mt-0.5 text-xs text-muted">Tap to add. Add as many as you need, then close.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sound, lighting, DJ, crew…"
              className="min-h-11 w-full rounded-xl border border-white/12 bg-white/5 py-2.5 pl-10 pr-3.5 text-base text-ink outline-none placeholder:text-muted/60 focus:border-gold/60 focus:ring-4 focus:ring-gold/10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted">No items match &ldquo;{query}&rdquo;.</p>
          ) : (
            filtered.map((group) => (
              <div key={group.category} className="mb-2">
                <div className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{group.category}</div>
                {group.items.map((item) => {
                  const added = justAdded === item.title;
                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => pick(item)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 active:bg-white/8"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] text-ink">{item.title}</div>
                        <div className="truncate text-xs text-muted">{item.description}</div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm tabular-nums text-ink/85">{inr(catalogRatePaise(item))}</div>
                      </div>
                      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", added ? "bg-emerald-400/20 text-emerald-300" : "bg-white/5 text-muted")}>
                        {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button
            type="button"
            onClick={onAddCustom}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 text-sm text-ink/85 hover:border-gold/60"
          >
            <Plus className="h-4 w-4" /> Custom item not listed here
          </button>
        </div>
      </div>
    </div>
  );
}
