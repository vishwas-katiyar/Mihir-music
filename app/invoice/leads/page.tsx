import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { isAdmin } from "@/lib/invoices/auth";
import { isDbConfigured } from "@/lib/db";
import { leadSummary, listLeads, type ListLeadStatus } from "@/lib/leads/repo";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, isLeadStatus } from "@/lib/leads/types";
import { LeadsTable } from "@/components/invoice/LeadsTable";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/invoice/login");
  if (!isDbConfigured) {
    return <p className="text-sm text-rose-300">Database is not configured. Set POSTGRES_URL and run the migrations.</p>;
  }
  const { q = "", status: statusParam = "all" } = await searchParams;
  const status: ListLeadStatus = statusParam === "all" || isLeadStatus(statusParam) ? (statusParam as ListLeadStatus) : "all";
  const [rows, stats] = await Promise.all([listLeads({ q, status }), leadSummary()]);

  return (
    <>
      <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Leads</h1>
          <p className="mt-1 text-sm text-muted">
            <span className="whitespace-nowrap">{stats.total} total</span> ·{" "}
            <span className="whitespace-nowrap text-gold-soft">{stats.newCount} new</span> ·{" "}
            <span className="whitespace-nowrap">{stats.last7d} in the last 7 days</span>
            {stats.winRate !== null && <> · <span className="whitespace-nowrap text-emerald-200">{stats.winRate}% win rate</span></>}
          </p>
        </div>
        <form className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap" action="/invoice/leads" method="get">
          <label className="relative col-span-2 sm:col-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, phone, city"
              className="min-h-11 w-full rounded-full border border-white/12 bg-white/5 py-2 pl-9 pr-4 text-base text-ink outline-none placeholder:text-muted/70 focus:border-gold/60 sm:min-h-0 sm:w-64 sm:text-sm"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="min-h-11 w-full min-w-0 rounded-full border border-white/12 bg-charcoal px-3 py-2 text-base text-ink outline-none focus:border-gold/60 sm:min-h-0 sm:w-auto sm:text-sm"
          >
            <option value="all">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button type="submit" className={cn("min-h-11 rounded-full border border-white/15 px-4 py-2 text-sm text-ink/85 transition hover:border-gold/60 sm:min-h-0")}>
            Filter
          </button>
        </form>
      </div>

      <div className="mt-8">
        <LeadsTable rows={rows} />
      </div>
    </>
  );
}
