import type { Metadata } from "next";
import { AdminShell } from "@/components/invoice/AdminShell";

export const metadata: Metadata = {
  title: "Invoices (admin)",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
