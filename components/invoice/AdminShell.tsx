"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus, FolderDown } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const action =
  "inline-flex min-h-11 w-11 items-center justify-center gap-2 rounded-full border border-white/15 text-sm text-ink/80 transition hover:border-gold/60 hover:text-ink sm:min-h-0 sm:w-auto sm:px-4 sm:py-2";

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
        {/* The site paints under the notch (viewportFit: cover), so the bar pads itself back out. */}
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] sm:gap-4 sm:px-6 sm:pb-4 sm:pt-[calc(1rem+env(safe-area-inset-top,0px))]">
          <Link href="/invoice" className="flex min-h-11 min-w-0 items-center gap-2.5 sm:min-h-0 sm:gap-3" aria-label={`${site.name} invoices`}>
            <Image src="/logo-mark.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 object-contain" />
            <Image src="/wordmark.svg" alt="" width={96} height={42} className="h-6 w-auto shrink-0" />
            <span className="hidden border-l border-white/15 pl-3 text-xs uppercase tracking-[0.18em] text-muted sm:block">Invoices</span>
          </Link>
          {!onLogin && (
            /* Phones get 44px icon buttons; the labels come back with the room to hold them. */
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/invoice/assets" aria-label="Brand assets" className={action}>
                <FolderDown className="h-4 w-4" /> <span className="hidden sm:inline">Brand assets</span>
              </Link>
              <Link href="/invoice/new" aria-label="New invoice" className={cn(action, "border-transparent bg-gold font-semibold text-charcoal hover:border-transparent hover:text-charcoal hover:brightness-105")}>
                <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New invoice</span>
              </Link>
              <button type="button" onClick={logout} aria-label="Sign out" className={action}>
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] pt-6 sm:px-6 sm:pt-8">{children}</main>
    </div>
  );
}
