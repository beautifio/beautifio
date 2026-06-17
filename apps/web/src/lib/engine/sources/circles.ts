import { supabase } from "@/lib/supabase/client";
import type { MatchResult } from "./articles";

export async function matchCircle(
  keywords: string[],
  excludeIds: string[],
): Promise<MatchResult | null> {
  if (!supabase || keywords.length === 0) return null;

  const words = keywords.filter((k) => k.length > 1);
  if (words.length === 0) return null;

  const nameConditions = words.map((w) => `name.ilike.%${w}%`).join(",");
  const descConditions = words.map((w) => `description.ilike.%${w}%`).join(",");
  const catConditions = words.map((w) => `goal_category.ilike.%${w}%`).join(",");

  let query = supabase
    .from("circles")
    .select("id, name, description, goal_category")
    .or(`${nameConditions},${descConditions},${catConditions}`)
    .limit(5);

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data } = await query;
  if (!data || data.length === 0) return null;

  const scored = data.map((c) => ({
    ...c,
    score: words.filter((w) => c.name.toLowerCase().includes(w.toLowerCase())).length * 2 +
           words.filter((w) => (c.description || "").toLowerCase().includes(w.toLowerCase())).length +
           words.filter((w) => (c.goal_category || "").toLowerCase().includes(w.toLowerCase())).length,
  }));

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  return {
    contentId: best.id,
    contentType: "circle",
    slug: best.id,
    title: best.name,
    excerpt: best.description || best.goal_category || undefined,
    relevanceScore: best.score,
  };
}
