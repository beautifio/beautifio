import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getUserTier } from "@/lib/tier"
import { getLifeEngineData, ALL_DIMENSIONS } from "@/lib/life-engine"
import { getUserArticleStats } from "@/lib/article-queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

const COMPLETENESS_FIELDS = ["full_name", "bio", "city", "phone", "province", "avatar_url", "date_of_birth"] as const

export async function GET() {
  const supabase = await createClient()
  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const userId = auth.user.id

  const [
    profileRes,
    discRes,
    testRes,
    journeyRes,
    timelineRes,
    articleRes,
    bisikRes,
    careRes,
    notifRes,
    circleRes,
    tier,
    lifeEngine,
  ] = await Promise.all([
    supabase.from("users").select("full_name, bio, city, phone, province, avatar_url, date_of_birth").eq("id", userId).single(),
    supabase.rpc("get_user_disc_profile", { p_user_id: userId }).then(({ data }) => data as any),
    supabase.from("user_test_results").select("module, scores, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("dream_journeys").select("id, title, emoji, status").eq("user_id", userId).eq("status", "active").maybeSingle().then(async ({ data: j }) => {
      if (!j) return null
      const { count: bigWins } = await supabase.from("big_wins").select("*", { count: "exact", head: true }).eq("journey_id", j.id)
      const { count: done } = await supabase.from("big_wins").select("*", { count: "exact", head: true }).eq("journey_id", j.id).eq("is_completed", true)
      return { ...j, bigWinsTotal: bigWins ?? 0, bigWinsDone: done ?? 0 }
    }),
    supabase.from("growth_timeline_events").select("event_type, title, description, event_date").eq("user_id", userId).order("event_date", { ascending: false }).limit(3),
    getUserArticleStats(userId).catch(() => ({ total_read: 0, total_minutes: 0 })),
    supabase.from("bisik_chats").select("id, status").or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`).eq("status", "active"),
    supabase.from("care_chat_sessions").select("id, status, category").eq("user_id", userId).in("status", ["waiting", "active"]),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false),
    supabase.from("circle_members").select("id", { count: "exact", head: true }).eq("user_id", userId).is("left_at", null),
    getUserTier(userId),
    getLifeEngineData().catch(() => null),
  ])

  // --- Profile completeness ---
  const profile = profileRes.data
  const filledCount = profile ? COMPLETENESS_FIELDS.filter(f => !!profile[f as keyof typeof profile]).length : 0
  const completeness = filledCount / COMPLETENESS_FIELDS.length

  const missingFields = profile ? COMPLETENESS_FIELDS.filter(f => !profile[f as keyof typeof profile]) : []

  const role = auth.user.user_metadata?.role || auth.user.app_metadata?.role || null
  const mitraRole = ["psychologist", "care_volunteer"].includes(role) ? role : null

  // --- DISC ---
  const discFormatted = discRes?.scores && Object.keys(discRes.scores).length > 0 ? {
    primary: discRes.primary || null,
    secondary: discRes.secondary || null,
    gameCount: discRes.game_count || 0,
    scores: discRes.scores || {},
  } : null

  // --- Tes Arah Hidup ---
  const testRows = testRes.data || []
  const tesAh = testRows.length > 0 ? {
    latest: testRows[0],
    modules: testRows.reduce((acc: Record<string, any>, t: any) => {
      if (!acc[t.module]) acc[t.module] = t; return acc
    }, {}),
  } : null

  // --- Article stats ---
  const articleStats = articleRes && (articleRes.total_read > 0 || articleRes.total_minutes > 0) ? {
    totalRead: (articleRes as any).total_read || articleRes.total_read || 0,
    totalMinutes: articleRes.total_minutes || 0,
  } : null

  // --- Activity ---
  const activity = {
    bisik: { activeChats: (bisikRes.data || []).length, unread: 0 }, // unread handled via separate query if needed
    care: { activeSessions: (careRes.data || []).length },
    circle: { joined: circleRes.count ?? 0 },
  }

  // --- User info ---
  const userInfo = {
    name: profile?.full_name || auth.user.email?.split("@")[0] || "Pengguna",
    bio: profile?.bio || "",
    avatar: profile?.avatar_url || null,
    completeness: Math.round(completeness * 100) / 100,
    missingFields,
    tier,
    mitraRole,
  }

  return NextResponse.json({
    user: userInfo,
    disc: discFormatted,
    tesAh,
    lifeEngine: lifeEngine ? {
      level: lifeEngine.level,
      totalPoints: lifeEngine.totalPoints,
      growthZone: lifeEngine.growthZone || null,
      capitals: Object.fromEntries(
        ALL_DIMENSIONS.map((dim) => {
          const cap = lifeEngine.capitals[dim]
          return [dim, { total: cap?.total_points || 0 }]
        })
      ),
    } : null,
    journey: journeyRes,
    timeline: (timelineRes.data || []).map((e: any) => ({
      date: e.event_date,
      emoji: getEventEmoji(e.event_type),
      title: e.title,
      description: e.description,
    })),
    activity: {
      ...activity,
      baca: articleStats,
    },
    unreadNotifications: notifRes.count ?? 0,
  })
}

function getEventEmoji(type: string): string {
  const map: Record<string, string> = {
    activity_completed: "✅",
    reflection_written: "📝",
    small_win_completed: "🌟",
    big_win_completed: "🏆",
    big_win_failed: "💪",
    journey_pivoted: "🔄",
    circle_joined: "👥",
    mentor_interaction: "💬",
  }
  return map[type] || "📌"
}
