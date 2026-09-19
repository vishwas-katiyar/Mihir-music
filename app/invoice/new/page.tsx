import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/invoices/auth";
import { DEFAULT_TERMS, emptyLine, todayIST, type InvoiceInput } from "@/lib/invoices/calc";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  if (!(await isAdmin())) redirect("/invoice/login");
  const initial: InvoiceInput = {
    issueDate: todayIST(),
    dueDate: "",
    eventTitle: "",
    eventStart: "",
    eventEnd: "",
    venue: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    clientAddress: "",
    items: [emptyLine()],
    discountPaise: 0,
    gstRateBp: 0,
    notes: "",
    terms: DEFAULT_TERMS,
    status: "draft",
  };
  return <InvoiceEditor mode="create" initial={initial} />;
}
