import React from "react";
import { Helmet } from "react-helmet";

const SeoHelmet = ({
  title, // Required: Page title
  description, // Optional: Meta description
  keywords, // Optional: Comma-separated keywords
  url, // Optional: Canonical URL
  image, // Optional: Open Graph image URL
  ...rest // Optional: Other allowed Helmet props
}) => {
  // Ensure required title
  if (!title) {
    throw new Error('Required prop "title" is missing in SeoHelmet component.');
  }

  // Generate common meta tags
  const metaTags = [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "description", content: description || "" },
    { name: "keywords", content: keywords || "" },
    { name: "author", content: "Mihir Sound" },
    { name: "robots", content: "index, follow" }, // Allow indexing and following by search engines
    { itemprop: "name", content: title },
    { itemprop: "description", content: description || "" },
    { itemprop: "author", content: "Mihir Sound" },
  ];

  // Generate open graph and twitter card meta tags if image is provided
  if (image) {
    metaTags.push(
      { property: "og:image", content: image },
      { property: "twitter:image", content: image },
      { property: "twitter:card", content: "summary" }
    );

    metaTags.push({ property: "og:type", content: "website" });
  }

  // Generate schema.org markup if author is provided

  metaTags.push({
    itemprop: "publisher",
    content: "Mihir Sound & Light",
  });

  return (
    <Helmet {...rest}>
      <title>{title}</title>
      <meta name="canonical" content={url || window.location.href} />
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
    </Helmet>
  );
};

export default SeoHelmet;
