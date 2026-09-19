import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Crawler policy.
 *
 * Since 2024 the big AI vendors split their crawlers by purpose, and a robots.txt rule
 * for one no longer covers the other:
 *
 *   search / answer crawlers   OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User,
 *                              PerplexityBot, Perplexity-User, Bingbot, Googlebot, Applebot,
 *                              DuckAssistBot, Amazonbot
 *   training-only crawlers     GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot,
 *                              meta-externalagent, Bytespider
 *
 * The common 2026 publisher pattern is "block training, allow answering", because a
 * training crawl sends no traffic back. That calculus is for publishers whose product is
 * the text itself. It is the wrong call here: Mihir Sound & Light is a small local
 * service business whose entire problem is being unknown to the models. Being in the
 * training corpus means an assistant can name the business even with no live retrieval,
 * which for a local vendor is pure upside - there is no article inventory to cannibalise.
 *
 * So the default below is allow-all, with every relevant agent named explicitly so the
 * intent is unmistakable and so a future blanket block does not silently apply. If the
 * owner ever changes their mind about training use, flip the agents in TRAINING_CRAWLERS
 * from `allow` to `disallow` - answer-engine citation eligibility is unaffected.
 */

const ANSWER_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Bingbot",
  "Applebot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "DuckAssistBot",
  "Amazonbot",
  "YandexBot",
];

const TRAINING_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Meta-ExternalAgent",
  "cohere-ai",
  "Diffbot",
  "Timpibot",
  "Omgilibot",
];

/** Private endpoints: no value to any crawler, and /api/indexnow must not be pinged by bots. */
const DISALLOWED_PATHS = ["/api/", "/invoice", "/i/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: ANSWER_CRAWLERS, allow: "/", disallow: DISALLOWED_PATHS },
      { userAgent: TRAINING_CRAWLERS, allow: "/", disallow: DISALLOWED_PATHS },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
