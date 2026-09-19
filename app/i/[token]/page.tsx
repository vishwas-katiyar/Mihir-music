import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, MessageCircle, Smartphone } from "lucide-react";
import { getInvoiceByToken } from "@/lib/invoices/repo";
import { upiPayload, upiQrDataUrl } from "@/lib/invoices/upi";
import { inr } from "@/lib/invoices/calc";
import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { site, whatsappUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

const validToken = (t: string) => /^[A-Za-z0-9_-]{16,64}$/.test(t);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const inv = validToken(token) ? await getInvoiceByToken(token) : null;
  return {
    title: inv ? `Invoice ${inv.invoiceNumber}` : "Invoice",
    robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  };
}

/**
 * Client-facing invoice. Reachable only by its unguessable token; never indexed.
 * Actions: download the PDF, pay the balance by UPI, message us.
 */
export default async function SharedInvoicePage({ params }: Props) {
  const { token } = await params;
  if (!validToken(token)) notFound();
  const inv = await getInvoiceByToken(token);
  if (!inv) notFound();

  const qr = inv.balanceDuePaise > 0 ? await upiQrDataUrl(inv.balanceDuePaise, inv.invoiceNumber) : undefined;

  return (
    <div className="min-h-dvh bg-charcoal py-6 text-ink sm:py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-[860px] px-4 sm:px-6 print:hidden">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-sm text-muted hover:text-ink">
            {site.name}
          </Link>
          <div className="flex flex-wrap gap-2">
            <a href={`/api/i/${inv.token}/pdf`} className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-charcoal transition hover:brightness-105">
              <Download className="h-4 w-4" /> Download PDF
            </a>
            {inv.balanceDuePaise > 0 && (
              <a href={upiPayload(inv.balanceDuePaise, inv.invoiceNumber)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-ink transition hover:border-gold/60 sm:hidden">
                <Smartphone className="h-4 w-4" /> Pay {inr(inv.balanceDuePaise)} by UPI
              </a>
            )}
            <a
              href={whatsappUrl(`Hi Mihir, regarding invoice ${inv.invoiceNumber} for ${inv.clientName}.`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-sm text-ink transition hover:border-gold/60"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </div>
      <div className="px-2 sm:px-6">
        <InvoiceDocument invoice={inv} qrSrc={qr} />
      </div>
    </div>
  );
}
