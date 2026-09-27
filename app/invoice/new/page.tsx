import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/invoices/auth";
import { DEFAULT_TERMS, emptyLine, todayIST, toPaise, type InvoiceInput } from "@/lib/invoices/calc";
import { InvoiceEditor } from "@/components/invoice/InvoiceEditor";
import { getLeadById } from "@/lib/leads/repo";
import { isDbConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: Props) {
  if (!(await isAdmin())) redirect("/invoice/login");

  const { leadId } = await searchParams;
  const leadIdNum = leadId ? Number(leadId) : null;
  const lead = leadIdNum && isDbConfigured ? await getLeadById(leadIdNum) : null;

  const initial: InvoiceInput = {
    issueDate: todayIST(),
    dueDate: "",
    eventTitle: lead ? `${lead.eventType} — ${lead.crowdSize}` : "",
    eventStart: lead?.eventDate ?? "",
    eventEnd: "",
    venue: lead?.venueCity ?? "",
    clientName: lead?.name ?? "",
    clientPhone: lead?.phone ?? "",
    clientEmail: "",
    clientAddress: "",
    items: lead && lead.estimatedBudgetLow > 0 ? [{ ...emptyLine(), title: `${lead.eventType} production`, description: `${lead.crowdSize}, ${lead.venueType}`, quantity: 1, ratePaise: toPaise(lead.estimatedBudgetLow) }] : [emptyLine()],
    discountPaise: 0,
    gstRateBp: 0,
    notes: lead ? `From a ${lead.source ?? "estimator"} enquiry received ${lead.createdAt.toISOString().slice(0, 10)}.` : "",
    terms: DEFAULT_TERMS,
    status: "draft",
  };
  return <InvoiceEditor mode="create" initial={initial} />;
}
