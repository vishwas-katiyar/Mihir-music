"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function InvoiceLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/invoices/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Could not sign in");
      return;
    }
    router.push("/invoice");
    router.refresh();
  };

  return (
    <div className="mx-auto mt-10 max-w-sm sm:mt-16">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/5 text-gold">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted">Invoices are for internal use. Enter the daily password.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-muted">Password</span>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-base text-ink outline-none focus:border-gold/60 focus:ring-4 focus:ring-gold/10"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-rose-300">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy || !password} className="min-h-11 w-full rounded-full bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition hover:brightness-105 disabled:opacity-50">
          {busy ? "Checking" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-xs text-muted">Hint: today&apos;s date, DDMMYYYY, Indian time. Sessions last 12 hours.</p>
    </div>
  );
}
