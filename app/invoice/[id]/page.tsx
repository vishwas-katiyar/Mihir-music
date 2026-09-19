import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/invoices/auth";
import { getInvoiceById } from "@/lib/invoices/repo";
import { rowToInput, rowToJson } from "@/lib/invoices/serialize";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";

export const dynamic = "force-dynamic";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/invoice/login");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const row = await getInvoiceById(id);
  if (!row) notFound();
  return <InvoiceEditor mode="edit" initial={rowToInput(row)} record={rowToJson(row)} />;
}
