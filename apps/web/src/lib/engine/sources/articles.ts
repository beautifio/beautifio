import { supabase } from "@/lib/supabase/client";

export interface MatchResult {
  contentId: string;
  contentType: "article" | "curhat" | "circle" | "mentor";
  slug: string;
  title: string;
  excerpt?: string;
  relevanceScore: number;
}

export async function matchArticle(
  keywords: string[],
  excludeIds: string[],
): Promise<MatchResult | null> {
  if (!supabase || keywords.length === 0) return null;

  const words = keywords.filter((k) => k.length > 1);
  if (words.length === 0) return null;

  const titleConditions = words.map((w) => `title.ilike.%${w}%`).join(",");
  const contentConditions = words.map((w) => `content.ilike.%${w}%`).join(",");

  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, excerpt, source, category")
    .eq("is_published", true)
    .not("id", "in", `(${excludeIds.map((id) => `"${id}"`).join(",") || '""'})`)
    .or(`${titleConditions},${contentConditions}`)
    .order("like_count", { ascending: false })
    .limit(5);

  if (!data || data.length === 0) return null;

  const scored = data.map((a) => {
    let score = 0;
    const titleLower = a.title.toLowerCase();
    const excerptLower = (a.excerpt || "").toLowerCase();
    for (const w of words) {
      if (titleLower.includes(w.toLowerCase())) score += 3;
      if (excerptLower.includes(w.toLowerCase())) score += 1;
    }
    if (a.source === "mentor") score += 1;
    return { ...a, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    contentId: best.id,
    contentType: "article",
    slug: best.slug,
    title: best.title,
    excerpt: best.excerpt || undefined,
    relevanceScore: best.score,
  };
}
