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

  // Use individual queries with error handling
  const identity: any = { user: { name: auth.user.email?.split("@")[0] || "Pengguna", bio: "", avatar: null, completeness: 0, missingFields: [], tier: "reguler", mitraRole: null }, disc: null, tesAh: null, lifeEngine: null, journey: null, timeline: [], activity: { bisik: { activeChats: 0, unread: 0 }, care: { activeSessions: 0 }, circle: { joined: 0 }, baca: null }, unreadNotifications: 0 }

  try {
    // Profile
    let profile: any = null
    try { const { data } = await supabase.from("users").select("full_name, bio, city, phone, province, avatar_url, date_of_birth").eq("id", userId).single(); profile = data } catch { /* ignore */ }
    if (profile) {
      const filledCount = COMPLETENESS_FIELDS.filter(f => !!profile[f]).length
      identity.user = {
        name: profile.full_name || auth.user.email?.split("@")[0] || "Pengguna",
        bio: profile.bio || "",
        avatar: profile.avatar_url || null,
        completeness: Math.round((filledCount / COMPLETENESS_FIELDS.length) * 100) / 100,
        missingFields: COMPLETENESS_FIELDS.filter(f => !profile[f]),
        tier: "reguler",
        mitraRole: null,
      }
    }

    // Tier
    try { identity.user.tier = await getUserTier(userId) } catch { /* default reguler */ }

    // Mitra role
    try {
      const role = auth.user.user_metadata?.role || auth.user.app_metadata?.role || null
      identity.user.mitraRole = ["psychologist", "care_volunteer"].includes(role) ? role : null
    } catch { /* ignore */ }

    // DISC
    try {
      const { data: discData } = await supabase.rpc("get_user_disc_profile", { p_user_id: userId })
      if (discData?.scores && Object.keys(discData.scores).length > 0) {
        identity.disc = { primary: discData.primary || null, secondary: discData.secondary || null, gameCount: discData.game_count || 0, scores: discData.scores || {} }
      }
    } catch { /* RPC may not exist yet */ }

    // Tes Arah Hidup
    try {
      const { data: tests } = await supabase.from("user_test_results").select("module, scores, completed_at").eq("user_id", userId).order("completed_at", { ascending: false })
      if (tests?.length) {
        identity.tesAh = { latest: tests[0], modules: tests.reduce((acc: any, t: any) => { if (!acc[t.module]) acc[t.module] = t; return acc }, {}) }
      }
    } catch { /* ignore */ }

    // Journey
    try {
      const { data: j } = await supabase.from("dream_journeys").select("id, title, emoji, status").eq("user_id", userId).eq("status", "active").maybeSingle()
      if (j) {
        const { count: bigWins } = await supabase.from("big_wins").select("*", { count: "exact", head: true }).eq("journey_id", j.id)
        const { count: done } = await supabase.from("big_wins").select("*", { count: "exact", head: true }).eq("journey_id", j.id).eq("is_completed", true)
        identity.journey = { ...j, bigWinsTotal: bigWins ?? 0, bigWinsDone: done ?? 0 }
      }
    } catch { /* ignore */ }

    // Timeline
    try {
      const { data: tl } = await supabase.from("growth_timeline_events").select("event_type, title, description, event_date").eq("user_id", userId).order("event_date", { ascending: false }).limit(3)
      identity.timeline = (tl || []).map((e: any) => ({ date: e.event_date, emoji: getEventEmoji(e.event_type), title: e.title, description: e.description }))
    } catch { /* ignore */ }

    // Article stats
    try {
      const stats = await getUserArticleStats(userId)
      if (stats.total_read > 0 || stats.total_minutes > 0) identity.activity.baca = { totalRead: stats.total_read, totalMinutes: stats.total_minutes }
    } catch { /* ignore */ }

    // Bisik
    try {
      const { data: bisik } = await supabase.from("bisik_chats").select("id").or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`).eq("status", "active")
      identity.activity.bisik.activeChats = (bisik || []).length
    } catch { /* ignore */ }

    // Care
    try {
      const { data: care } = await supabase.from("care_chat_sessions").select("id").eq("user_id", userId).in("status", ["waiting", "active"])
      identity.activity.care.activeSessions = (care || []).length
    } catch { /* ignore */ }

    // Circle
    try {
      const { count: circles } = await supabase.from("circle_members").select("id", { count: "exact", head: true }).eq("user_id", userId).is("left_at", null)
      identity.activity.circle.joined = circles ?? 0
    } catch { /* ignore */ }

    // Unread notifications
    try {
      const { count: unread } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false)
      identity.unreadNotifications = unread ?? 0
    } catch { /* ignore */ }

    // Life Engine
    try { identity.lifeEngine = await getLifeEngineData() } catch { /* RPC may not exist */ }
    if (identity.lifeEngine) {
      identity.lifeEngine = {
        level: identity.lifeEngine.level,
        totalPoints: identity.lifeEngine.totalPoints,
        growthZone: identity.lifeEngine.growthZone || null,
        capitals: Object.fromEntries(ALL_DIMENSIONS.map((dim: string) => [dim, { total: identity.lifeEngine.capitals[dim]?.total_points || 0 }])),
      }
    }

    return NextResponse.json(identity)
  } catch (e: any) {
    console.error("Identity API error:", e?.message || e)
    return NextResponse.json(identity)
  }
}

function getEventEmoji(type: string): string {
  const map: Record<string, string> = { activity_completed: "✅", reflection_written: "📝", small_win_completed: "🌟", big_win_completed: "🏆", big_win_failed: "💪", journey_pivoted: "🔄", circle_joined: "👥", mentor_interaction: "💬" }
  return map[type] || "📌"
}
