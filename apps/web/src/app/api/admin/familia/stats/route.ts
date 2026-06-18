import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 86400000);
    const monthAgo = new Date(today.getTime() - 30 * 86400000);

    const [merchants, totalSessions, todaySessions, weekSessions, monthSessions, topMerchants, deals, rewards, achievements] = await Promise.all([
      supabase.from("familia_merchants").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("familia_voucher_sessions").select("id", { count: "exact", head: true }),
      supabase.from("familia_redemption_log").select("id", { count: "exact", head: true }).gte("redeemed_at", today.toISOString()),
      supabase.from("familia_redemption_log").select("id", { count: "exact", head: true }).gte("redeemed_at", weekAgo.toISOString()),
      supabase.from("familia_redemption_log").select("id", { count: "exact", head: true }).gte("redeemed_at", monthAgo.toISOString()),
      supabase.from("familia_redemption_log").select("merchant_id, status")
        .gte("redeemed_at", monthAgo.toISOString())
        .order("redeemed_at", { ascending: false }),
      supabase.from("familia_affiliate_deals").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("familia_achievement_rewards").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("familia_user_achievements").select("id", { count: "exact", head: true }).eq("is_completed", true),
    ]);

    // count successful redemptions per merchant
    const merchantCounts: Record<string, number> = {};
    for (const log of topMerchants.data || []) {
      if (log.status === "success") {
        merchantCounts[log.merchant_id] = (merchantCounts[log.merchant_id] || 0) + 1;
      }
    }
    const topMerchantEntries = Object.entries(merchantCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([merchantId, count]) => ({ merchantId, count }));

    // get merchant names for top entries
    if (topMerchantEntries.length > 0) {
      const ids = topMerchantEntries.map((e) => e.merchantId);
      const { data: merchNames } = await supabase
        .from("familia_merchants")
        .select("id, name")
        .in("id", ids);
      const nameMap = new Map((merchNames || []).map((m) => [m.id, m.name]));
      for (const entry of topMerchantEntries) {
        (entry as any).name = nameMap.get(entry.merchantId) || "Unknown";
      }
    }

    return NextResponse.json({
      data: {
        merchants: merchants.count || 0,
        total_voucher_sessions: totalSessions.count || 0,
        redemptions_today: todaySessions.count || 0,
        redemptions_week: weekSessions.count || 0,
        redemptions_month: monthSessions.count || 0,
        active_deals: deals.count || 0,
        active_rewards: rewards.count || 0,
        achievements_completed: achievements.count || 0,
        top_merchants: topMerchantEntries,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/familia/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
