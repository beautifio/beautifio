import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://beautifio.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/home`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/inspirasi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/curhat`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/cerita`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/opportunity`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },

    { url: `${BASE_URL}/roadmap`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/circle`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/mentors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/voucher`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/belanja`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/event`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Prisma-backed (migration off Supabase). Resilient: a DB hiccup still returns static pages.
  try {
    const [articles, stories, opportunities] = await Promise.all([
      prisma.articles.findMany({ where: { is_published: true }, select: { slug: true, updated_at: true } }),
      prisma.stories.findMany({ where: { is_published: true, deleted_at: null }, select: { slug: true, updated_at: true } }),
      prisma.opportunities.findMany({ where: { is_active: true }, select: { slug: true } }),
    ]);

    const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${BASE_URL}/inspirasi/${a.slug}`,
      lastModified: a.updated_at ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const storyEntries: MetadataRoute.Sitemap = stories.map((s) => ({
      url: `${BASE_URL}/cerita/${s.slug}`,
      lastModified: s.updated_at ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    const opportunityEntries: MetadataRoute.Sitemap = opportunities.map((o) => ({
      url: `${BASE_URL}/opportunity/${o.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...articleEntries, ...storyEntries, ...opportunityEntries];
  } catch {
    return staticPages;
  }
}
