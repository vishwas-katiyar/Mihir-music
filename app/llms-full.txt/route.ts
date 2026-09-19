import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { packages } from "@/lib/packages";
import { gear } from "@/lib/gear";
import { faqs } from "@/lib/faqs";

export const dynamic = "force-static";

/**
 * /llms-full.txt — the expanded companion to /llms.txt. One fetch gives an agent the
 * whole factual surface of the business: every service with specifications and
 * deliverables, the equipment inventory, package pricing as a comparison table, and
 * the answer set. Every figure here is read from the same data files the pages render,
 * so the two can never drift apart.
 */
export function GET() {
  const lines: string[] = [
    `# ${site.name} - full reference`,
    ``,
    `> ${site.description}`,
    ``,
    `Last generated from site data. Canonical source: ${site.url}`,
    ``,
    `## Business facts`,
    ``,
    `| Field | Value |`,
    `| --- | --- |`,
    `| Legal name | ${site.name} |`,
    `| Also known as | ${site.alternateName}, Mihir Light Sound |`,
    `| Owner | ${site.legalOwner} |`,
    `| Founded | ${site.foundingYear} (${new Date().getFullYear() - site.foundingYear}+ years operating) |`,
    `| Category | Live event production: sound, lighting, stage rigging |`,
    `| Address | ${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}, India |`,
    `| Coordinates | ${site.geo.lat}, ${site.geo.lng} |`,
    `| Phone / WhatsApp | ${site.phoneDisplay} |`,
    `| Email | ${site.email} |`,
    `| Hours | 09:00-22:00, all seven days |`,
    `| Service areas | ${site.areasServed.join(", ")} |`,
    `| Languages | English, Hindi |`,
    `| Payment | Cash, UPI, bank transfer |`,
    `| Currency | INR |`,
    `| Google rating | ${site.rating.value}/5 from ${site.rating.count}+ reviews |`,
    `| Website | ${site.url} |`,
    ``,
    `## Packages`,
    ``,
    `Starting prices in Indian rupees. The final quote depends on crowd size, venue, date and travel distance.`,
    ``,
    `| Package | Starting price (INR) | Positioned as | What is included |`,
    `| --- | --- | --- | --- |`,
    ...packages.map(
      (p) => `| ${p.name} | ${p.priceValue.toLocaleString("en-IN")} (${p.price}) | ${p.label} | ${p.features.join("; ")} |`,
    ),
    ``,
    `## Services`,
    ``,
  ];

  for (const s of services) {
    lines.push(
      `### ${s.name}`,
      ``,
      `${s.definition}`,
      ``,
      `${s.summary}`,
      ``,
      `Page: ${site.url}/services/${s.slug}`,
      ``,
      `Specification:`,
      ``,
      `| Item | Detail |`,
      `| --- | --- |`,
      ...s.specs.map((sp) => `| ${sp.label} | ${sp.value} |`),
      ``,
      `Included with the service:`,
      ``,
      ...s.deliverables.map((d) => `- ${d}`),
      ``,
      `Commonly booked for: ${s.idealFor.join(", ")}.`,
      ``,
    );
    for (const f of s.faq) {
      lines.push(`**${f.q}** ${f.a}`, ``);
    }
  }

  lines.push(`## Equipment inventory`, ``);
  for (const group of gear) {
    lines.push(
      `### ${group.title}`,
      ``,
      `| Equipment | Model | Quantity | Specification |`,
      `| --- | --- | --- | --- |`,
      ...group.items.map((i) => `| ${i.equipment} | ${i.model} | ${i.qty} | ${i.spec} |`),
      ``,
    );
  }

  lines.push(`## Questions and answers`, ``);
  for (const f of faqs) {
    lines.push(`### ${f.q}`, ``, f.a, ``);
  }

  lines.push(
    `## Contact`,
    ``,
    `- Phone and WhatsApp: ${site.phoneDisplay}`,
    `- Email: ${site.email}`,
    `- Instant estimate: ${site.url}/estimate`,
    `- Google Business Profile: ${site.social.google}`,
    `- Instagram: ${site.social.instagram}`,
    `- YouTube: ${site.social.youtube}`,
    `- Facebook: ${site.social.facebook}`,
    ``,
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
