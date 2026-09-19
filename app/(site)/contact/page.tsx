import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact & Booking: Indore Event Sound and Lighting",
  description:
    "Book Mihir Sound & Light for weddings, concerts and corporate events. Call +91 70000 51042, WhatsApp, or send your event details. Bajrang Nagar, Indore, serving Madhya Pradesh and pan-India.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])} />
      <div className="pt-12">
        <ContactSection as="h1" />
      </div>
    </>
  );
}
