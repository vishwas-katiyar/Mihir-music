import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { isAdmin } from "@/lib/invoices/auth";
import { listInvoices, summary, type ListStatus } from "@/lib/invoices/repo";
import { INVOICE_STATUSES, STATUS_LABEL, inr } from "@/lib/invoices/calc";
import { InvoiceTable } from "@/components/invoice/InvoiceTable";
import { isDbConfigured } from "@/lib/db";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function InvoiceListPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/invoice/login");
  if (!isDbConfigured) {
    return <p className="text-sm text-rose-300">Database is not configured. Set POSTGRES_URL and run the migrations.</p>;
  }
  const { q = "", status: statusParam = "all" } = await searchParams;
  const status: ListStatus = statusParam === "deleted" || (INVOICE_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as ListStatus) : "all";
  const [rows, stats] = await Promise.all([listInvoices({ q, status }), summary()]);

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Invoices</h1>
          {/* Each figure stays whole on a phone; only the separators break. */}
          <p className="mt-1 text-sm text-muted">
            <span className="whitespace-nowrap">{stats.count} invoices</span> · <span className="whitespace-nowrap">{inr(stats.billedPaise)} billed</span> ·{" "}
            <span className="whitespace-nowrap text-emerald-200">{inr(stats.collectedPaise)} collected</span> ·{" "}
            <span className="whitespace-nowrap text-gold-soft">{inr(stats.duePaise)} outstanding</span>
          </p>
        </div>
        {/* Phones: search on its own line, then status and Filter share the next one. */}
        <form className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap" action="/invoice" method="get">
          <label className="relative col-span-2 sm:col-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search client, number, event"
              className="min-h-11 w-full rounded-full border border-white/12 bg-white/5 py-2 pl-9 pr-4 text-base text-ink outline-none placeholder:text-muted/70 focus:border-gold/60 sm:min-h-0 sm:w-64 sm:text-sm"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="min-h-11 w-full min-w-0 rounded-full border border-white/12 bg-charcoal px-3 py-2 text-base text-ink outline-none focus:border-gold/60 sm:min-h-0 sm:w-auto sm:text-sm"
          >
            <option value="all">All statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
            <option value="deleted">Deleted (restorable)</option>
          </select>
          <button type="submit" className={cn("min-h-11 rounded-full border border-white/15 px-4 py-2 text-sm text-ink/85 transition hover:border-gold/60 sm:min-h-0")}>
            Filter
          </button>
        </form>
      </div>

      <div className="mt-8">
        <InvoiceTable rows={rows} />
      </div>
    </>
  );
}
