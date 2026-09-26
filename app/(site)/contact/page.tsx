import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ID, breadcrumbSchema, shareMeta, webPageSchema } from "@/lib/schema";

const title = "Contact & Booking, Indore";
const description =
  "Book Mihir Sound & Light in Indore for weddings, concerts and corporate events. Call or WhatsApp +91 70000 51042, 9am to 10pm daily. Madhya Pradesh and beyond.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  ...shareMeta({ title, description, path: "/contact" }),
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={[
          webPageSchema({ name: title, description, path: "/contact", type: "ContactPage", mainEntity: { "@id": ID.business }, dateModified: "2026-09-21" }),
          breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]),
        ]}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact", href: "/contact" }]} />
      <div>
        <ContactSection as="h1" />
      </div>
    </>
  );
}
