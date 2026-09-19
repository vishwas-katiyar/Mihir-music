import { site } from "@/lib/site";
import { services } from "@/lib/services";
import { packages } from "@/lib/packages";
import { faqs } from "@/lib/faqs";

export const dynamic = "force-static";

/**
 * /llms.txt — structured per the llmstxt.org convention: an H1 with the name, a
 * blockquote summary, free prose, then H2 sections that are lists of markdown links
 * with descriptions, and an `## Optional` section for secondary material.
 *
 * Status check, so nobody over-invests in this file: Google has said publicly it does
 * not support llms.txt and does not plan to, and its May 2026 AI-features guidance
 * states no AI-specific text file is needed. No major vendor has committed to it as a
 * production retrieval signal, and measured crawler hits on llms.txt are negligible.
 * We keep it because it is a few kilobytes of cost, it is genuinely useful to agents
 * that fetch pages on a user's behalf (Claude-User, ChatGPT-User, Perplexity-User),
 * and it doubles as a single canonical fact sheet that keeps NAP details consistent.
 * It is not a substitute for the HTML pages, which is where the real work happens.
 */
export function GET() {
  const lines = [
    `# ${site.name}`,
    ``,
    `> ${site.description}`,
    ``,
    `${site.name} (also known as ${site.alternateName}) has operated out of ${site.address.locality}, ${site.address.region} since ${site.foundingYear} under owner ${site.legalOwner}. It rents and operates the equipment and supplies the crew: line-array PA, cardioid subwoofers, moving-head DMX lighting, aluminium truss and modular staging, DJ rigs, and the engineers and show callers who run them live. Work covers weddings, concerts, festivals, corporate summits and club nights.`,
    ``,
    `Service area: ${site.areasServed.join(", ")}. Packages start at ${packages[0].price} and the signature wedding production is ${packages[1].price}; all figures are Indian rupees and are starting prices, not fixed quotes.`,
    ``,
    `Contact: ${site.phoneDisplay} (phone and WhatsApp), ${site.email}. Address: ${site.address.street}, ${site.address.locality}, ${site.address.region} ${site.address.postalCode}, India. Open ${site.hours.split(" ")[1]} daily. Google rating ${site.rating.value}/5 from ${site.rating.count}+ reviews. Languages: English and Hindi.`,
    ``,
    `## Services`,
    ``,
    ...services.map((s) => `- [${s.name}](${site.url}/services/${s.slug}): ${s.definition}`),
    ``,
    `## Packages`,
    ``,
    ...packages.map(
      (p) =>
        `- [${p.name} - from ${p.price} (${p.label})](${site.url}/estimate): ${p.features.join("; ")}. Starting price in INR; final quote depends on crowd size, venue, date and travel.`,
    ),
    ``,
    `## Equipment`,
    ``,
    ...services.map(
      (s) => `- [${s.shortName} specification](${site.url}/services/${s.slug}): ${s.specs.map((sp) => `${sp.label}: ${sp.value}`).join("; ")}.`,
    ),
    `- [Full equipment inventory](${site.url}/gear): line arrays, cardioid subs, digital consoles, moving heads, LED pixel mapping, aluminium truss, modular decking, haze and cold-spark effects, LED video walls on request.`,
    ``,
    `## Answers`,
    ``,
    ...faqs.map((f) => `- [${f.q}](${site.url}/#faq): ${f.a}`),
    ``,
    `## Key pages`,
    ``,
    `- [Home](${site.url}/): overview of sound, lighting, rigging and show-execution services with packages and client reviews.`,
    `- [All services](${site.url}/services): the five production systems, each with technical specifications and deliverables.`,
    `- [Instant estimator](${site.url}/estimate): pick event type, crowd size and venue to get a price estimate delivered over WhatsApp.`,
    `- [Equipment inventory](${site.url}/gear): make, model, quantity and specification of the owned inventory.`,
    `- [Portfolio](${site.url}/portfolio): video from past concert, wedding and live-stage builds.`,
    `- [Contact](${site.url}/contact): phone, WhatsApp, email and address.`,
    ``,
    `## Optional`,
    ``,
    `- [Full text version](${site.url}/llms-full.txt): every service specification, deliverable, package and answer in one file.`,
    `- [Instagram](${site.social.instagram}): recent show photography and reels.`,
    `- [YouTube](${site.social.youtube}): full-length show video.`,
    `- [Facebook](${site.social.facebook}): page and client posts.`,
    `- [Google Business Profile](${site.social.google}): verified location, hours and customer reviews.`,
    ``,
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
