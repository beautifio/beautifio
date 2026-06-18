"use client";

import { useEffect } from "react";

type SEOProps = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  jsonLd?: Record<string, any>;
};

const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

export default function SEOHead({
  title,
  description = "Beautifio membantu anak muda menemukan arah hidup, peluang, mentor, dan komunitas yang tepat untuk masa depan yang lebih baik.",
  ogImage,
  ogType = "website",
  canonical,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} — Beautifio` : "Beautifio — Masa Depan Dimulai Hari Ini";
    document.title = fullTitle;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:image", ogImage || `${BASE_URL}/og-default.png`, true);
    setMeta("og:url", canonical || window.location.href, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    if (jsonLd) {
      const scriptId = "seo-jsonld";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, ogImage, ogType, canonical, jsonLd]);

  return null;
}

export function articleJsonLd(article: {
  title: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    url: article.url,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
    publisher: { "@type": "Organization", name: "Beautifio", logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` } },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
