import { createClient } from "@/lib/supabase/server";

export type UserTier = "reguler" | "pro" | "ultimate";

export interface TierLimits {
  tier: UserTier;
  maxChatsPerWeek: number;
  maxTebakPerDay: number;
  maxJourneys: number;
  maxCircles: number;
  eventDiscountPercent: number;
}

const TIER_CONFIG: Record<UserTier, Omit<TierLimits, "tier">> = {
  reguler: { maxChatsPerWeek: 20, maxTebakPerDay: 5, maxJourneys: 3, maxCircles: 3, eventDiscountPercent: 0 },
  pro: { maxChatsPerWeek: 50, maxTebakPerDay: 15, maxJourneys: 10, maxCircles: 999, eventDiscountPercent: 10 },
  ultimate: { maxChatsPerWeek: 999999, maxTebakPerDay: 999999, maxJourneys: 999, maxCircles: 999, eventDiscountPercent: 20 },
};

export async function getUserTier(userId: string): Promise<UserTier> {
  const supabase = await createClient();
  // Auto-cleanup: expire any stale subscriptions before reading (best-effort)
  try {
    await supabase.from("user_subscriptions")
      .update({ status: "expired" })
      .eq("user_id", userId).eq("status", "active")
      .lt("expires_at", new Date().toISOString());
  } catch { /* non-blocking */ }

  // Query active subscription and join plan tier separately
  const { data: sub } = await supabase.from("user_subscriptions")
    .select("plan_id").eq("user_id", userId).eq("status", "active")
    .maybeSingle();

  if (!sub?.plan_id) return "reguler";

  const { data: plan } = await supabase.from("subscription_plans")
    .select("tier").eq("id", sub.plan_id).single();

  return (plan?.tier as UserTier) || "reguler";
}

export function getTierLimits(tier: UserTier): TierLimits {
  return { tier, ...TIER_CONFIG[tier] };
}

export async function getWeeklyChatCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1)); // Monday
  startOfWeek.setHours(0, 0, 0, 0);
  const { count } = await supabase.from("bisik_chats")
    .select("*", { count: "exact", head: true })
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
    .gte("created_at", startOfWeek.toISOString());
  return count || 0;
}

export async function getDailyTebakCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { count } = await supabase.from("tebak_sessions")
    .select("*", { count: "exact", head: true })
    .or(`player_a_id.eq.${userId},player_b_id.eq.${userId}`)
    .gte("created_at", startOfDay.toISOString());
  return count || 0;
}
