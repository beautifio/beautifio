import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_LABELS } from "@/lib/inspirasi-data";
import InspirasiDetailClient from "./InspirasiDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("meta_title, meta_description, og_image, title, excerpt, cover_image")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return { title: "Inspirasi — Beautifio" };

    return {
      title: data.meta_title || data.title,
      description: data.meta_description || data.excerpt || "",
      openGraph: {
        title: data.meta_title || data.title,
        description: data.meta_description || data.excerpt || "",
        images: data.og_image || data.cover_image ? [{ url: data.og_image || data.cover_image }] : [],
      },
    };
  } catch {
    return { title: "Inspirasi — Beautifio" };
  }
}

export default async function InspirasiDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let initialItem: any = null;

  try {
    const supabase = await createClient();
    const { data: article } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (article) {
      initialItem = {
        id: article.id,
        slug: article.slug,
        type: article.type,
        source: article.source || "cerita",
        title: article.title,
        content: article.excerpt || "",
        full_content: article.content,
        author: article.author,
        initials: article.initials,
        cover_image: article.cover_image,
        category: article.category,
        category_id: article.category_id,
        category_label: article.category_id ? CATEGORY_LABELS[article.category_id] || article.category : article.category,
        reading_time: article.read_time_minutes,
        like_count: article.like_count,
        comment_count: article.comment_count,
        save_count: article.save_count,
        related_slugs: article.related_slugs || [],
        author_type: article.author_type,
        architecture: article.architecture,
        author_credentials: article.author_credentials,
        author_anon_name: article.author_anon_name,
        series_id: article.series_id,
        disclaimer_type: article.disclaimer_type,
        disclaimer_custom: article.disclaimer_custom,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        og_image: article.og_image,
      };
    }
  } catch {
    // fall through to client-side fetch / not found
  }

  if (!initialItem) notFound();

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-secondary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <InspirasiDetailClient initialItem={initialItem} slug={slug} />
    </Suspense>
  );
}
