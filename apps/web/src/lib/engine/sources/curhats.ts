import { supabase } from "@/lib/supabase/client";
import type { MatchResult } from "./articles";

export async function matchCurhatToComment(
  keywords: string[],
  excludeIds: string[],
  userId?: string,
): Promise<MatchResult | null> {
  if (!supabase || keywords.length === 0) return null;

  const words = keywords.filter((k) => k.length > 1);
  if (words.length === 0) return null;

  const termConditions = words.map((w) => `title.ilike.%${w}%`).join(",");
  const contentConditions = words.map((w) => `content.ilike.%${w}%`).join(",");

  let query = supabase
    .from("curhat_posts")
    .select("id, title, content, nickname, category, created_at")
    .eq("status", "visible")
    .or(`${termConditions},${contentConditions}`)
    .order("created_at", { ascending: false })
    .limit(5);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.map((id) => `"${id}"`).join(",")})`);
  }

  const { data } = await query;
  if (!data || data.length === 0) return null;

  const scored = data.map((c) => {
    let score = 0;
    const tLower = c.title.toLowerCase();
    const cLower = c.content.toLowerCase();
    for (const w of words) {
      if (tLower.includes(w.toLowerCase())) score += 2;
      if (cLower.includes(w.toLowerCase())) score += 1;
    }
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    contentId: best.id,
    contentType: "curhat",
    slug: best.id,
    title: best.title,
    excerpt: best.nickname || "Anonymous",
    relevanceScore: best.score,
  };
}

export async function matchCurhatToSupport(
  keywords: string[],
  excludeIds: string[],
): Promise<MatchResult | null> {
  return matchCurhatToComment(keywords, excludeIds);
}
