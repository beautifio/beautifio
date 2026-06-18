import { supabase } from "@/lib/supabase/client";

export const DIMENSION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  character: { label: "Character", emoji: "🧭", color: "#FF5E5B" },
  dream_skill: { label: "Skill", emoji: "⚡", color: "#FFB627" },
  knowledge: { label: "Knowledge", emoji: "📚", color: "#6C3FA0" },
  physical: { label: "Health", emoji: "💪", color: "#16A34A" },
  social: { label: "Relationship", emoji: "🤝", color: "#0EA5E9" },
  spiritual: { label: "Spiritual", emoji: "✨", color: "#EC4899" },
};

export const ALL_DIMENSIONS = Object.keys(DIMENSION_LABELS);

export interface LifeCapital {
  dimension: string;
  total_points: number;
  recent_30d_points: number;
}

export interface LifeEngineResult {
  capitals: Record<string, LifeCapital>;
  totalPoints: number;
  level: number;
  growthZone: string | null;
  labels: typeof DIMENSION_LABELS;
}

export function calculateLevel(totalPoints: number): number {
  if (totalPoints <= 0) return 0;
  return Math.floor(Math.sqrt(totalPoints / 50)) + 1;
}

export function findGrowthZone(capitals: Record<string, LifeCapital>): string | null {
  const dims = ALL_DIMENSIONS.filter((d) => capitals[d] !== undefined);
  if (dims.length === 0) return null;

  const avgPoints = dims.reduce((sum, d) => sum + capitals[d].total_points, 0) / dims.length;

  const sorted = dims
    .map((d) => ({
      dimension: d,
      gap: avgPoints - capitals[d].total_points,
    }))
    .sort((a, b) => b.gap - a.gap);

  return sorted[0]?.dimension ?? null;
}

export async function getLifeEngineData(userId: string): Promise<LifeEngineResult | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_life_capital", { p_user_id: userId });

  if (error || !data) return null;

  const capitalMap: Record<string, LifeCapital> = {};
  for (const dim of ALL_DIMENSIONS) {
    const found = (data as LifeCapital[]).find((d: LifeCapital) => d.dimension === dim);
    capitalMap[dim] = found || { dimension: dim, total_points: 0, recent_30d_points: 0 };
  }

  const totalPoints = Object.values(capitalMap).reduce((sum, c) => sum + c.total_points, 0);
  const level = calculateLevel(totalPoints);
  const growthZone = findGrowthZone(capitalMap);

  return { capitals: capitalMap, totalPoints, level, growthZone, labels: DIMENSION_LABELS };
}
