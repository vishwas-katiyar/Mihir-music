import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { isAdmin } from "@/lib/invoices/auth";
import { listInvoices, summary } from "@/lib/invoices/repo";
import { INVOICE_STATUSES, STATUS_LABEL, inr, type InvoiceStatus } from "@/lib/invoices/calc";
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
  const status = (INVOICE_STATUSES as readonly string[]).includes(statusParam) ? (statusParam as InvoiceStatus) : "all";
  const [rows, stats] = await Promise.all([listInvoices({ q, status }), summary()]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Invoices</h1>
          <p className="mt-1 text-sm text-muted">
            {stats.count} total · {inr(stats.billedPaise)} billed · <span className="text-amber-soft">{inr(stats.duePaise)} outstanding</span>
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-2" action="/invoice" method="get">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search client, number, event"
              className="w-64 rounded-full border border-white/12 bg-white/5 py-2 pl-9 pr-4 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-gold/60"
            />
          </label>
          <select name="status" defaultValue={status} className="rounded-full border border-white/12 bg-charcoal px-3 py-2 text-sm text-ink outline-none focus:border-gold/60">
            <option value="all">All statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button type="submit" className={cn("rounded-full border border-white/15 px-4 py-2 text-sm text-ink/85 transition hover:border-gold/60")}>
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
