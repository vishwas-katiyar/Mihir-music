import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePdf } from "@/components/invoice/InvoicePdf";
import { getInvoiceByToken } from "@/lib/invoices/repo";
import { upiQrDataUrl } from "@/lib/invoices/upi";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Logo bytes for the PDF header: local file first (traced into the function), site fetch as fallback. */
async function logoBytes(): Promise<Buffer | undefined> {
  try {
    return await readFile(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    try {
      const res = await fetch(`${site.url}/logo.png`, { cache: "force-cache" });
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    } catch {
      /* no logo */
    }
  }
  return undefined;
}

/** GET /api/i/<token>/pdf → application/pdf. Public by token, like the share page. */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(token)) return new NextResponse("Not found", { status: 404 });
  const invoice = await getInvoiceByToken(token);
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  const shareUrl = `${site.url}/i/${invoice.token}`;
  const [logo, qr] = await Promise.all([
    logoBytes(),
    invoice.balanceDuePaise > 0 ? upiQrDataUrl(invoice.balanceDuePaise, invoice.invoiceNumber) : Promise.resolve(undefined),
  ]);

  const pdf = await renderToBuffer(<InvoicePdf invoice={invoice} logoSrc={logo} qrSrc={qr} shareUrl={shareUrl} />);
  const filename = `${invoice.invoiceNumber}-${invoice.clientName.replace(/[^A-Za-z0-9]+/g, "-").slice(0, 40)}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
