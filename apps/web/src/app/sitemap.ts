import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://beautifio.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

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

  const [articlesRes, storiesRes, opportunitiesRes] = await Promise.all([
    supabase.from("articles").select("slug, updated_at").eq("is_published", true),
    supabase.from("stories").select("slug, updated_at").eq("is_published", true).is("deleted_at", null),
    supabase.from("opportunities").select("slug, updated_at").eq("is_active", true),
  ]);

  const articleEntries: MetadataRoute.Sitemap = (articlesRes.data || []).map((a) => ({
    url: `${BASE_URL}/inspirasi/${a.slug}`,
    lastModified: new Date(a.updated_at || new Date()),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const storyEntries: MetadataRoute.Sitemap = (storiesRes.data || []).map((s) => ({
    url: `${BASE_URL}/cerita/${s.slug}`,
    lastModified: new Date(s.updated_at || new Date()),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const opportunityEntries: MetadataRoute.Sitemap = (opportunitiesRes.data || []).map((o) => ({
    url: `${BASE_URL}/opportunity/${o.slug}`,
    lastModified: new Date(o.updated_at || new Date()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...articleEntries, ...storyEntries, ...opportunityEntries];
}
