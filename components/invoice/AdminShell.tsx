"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus, FolderDown } from "lucide-react";
import { site } from "@/lib/site";

/** Minimal admin chrome for /invoice: brand, new-invoice shortcut, logout. Hidden on the login page. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const onLogin = pathname === "/invoice/login";

  const logout = async () => {
    await fetch("/api/invoices/login", { method: "DELETE" });
    router.push("/invoice/login");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-charcoal text-ink">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/invoice" className="flex items-center gap-3" aria-label={`${site.name} invoices`}>
            <Image src="/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
            <Image src="/wordmark.svg" alt="" width={96} height={42} className="h-6 w-auto" />
            <span className="hidden border-l border-white/15 pl-3 text-xs uppercase tracking-[0.18em] text-muted sm:block">Invoices</span>
          </Link>
          {!onLogin && (
            <div className="flex items-center gap-2">
              <Link href="/invoice/assets" aria-label="Brand assets" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-ink/80 transition hover:border-gold/60 hover:text-ink sm:px-4">
                <FolderDown className="h-4 w-4" /> <span className="hidden sm:inline">Brand assets</span>
              </Link>
              <Link href="/invoice/new" aria-label="New invoice" className="inline-flex items-center gap-2 rounded-full bg-gold px-3 py-2 text-sm font-semibold text-charcoal transition hover:brightness-105 sm:px-4">
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New invoice</span>
              </Link>
              <button type="button" onClick={logout} aria-label="Sign out" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-2 text-sm text-ink/80 transition hover:border-gold/60 hover:text-ink sm:px-4">
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
