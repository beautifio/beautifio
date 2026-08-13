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

  // Fire ALL independent queries in parallel
  const [
    profileRes, tierRes, discRes, testsRes, journeyRes, timelineRes,
    bisikRes, careRes, circleRes, unreadRes,
  ] = await Promise.allSettled([
    supabase.from("users").select("full_name, bio, city, phone, province, avatar_url, date_of_birth").eq("id", userId).single(),
    getUserTier(userId),
    supabase.rpc("get_user_disc_profile", { p_user_id: userId }),
    supabase.from("user_test_results").select("module, scores, completed_at").eq("user_id", userId).order("completed_at", { ascending: false }),
    supabase.from("dream_journeys").select("id, title, emoji, status").eq("user_id", userId).eq("status", "active").maybeSingle(),
    supabase.from("growth_timeline_events").select("event_type, title, description, event_date").eq("user_id", userId).order("event_date", { ascending: false }).limit(3),
    supabase.from("bisik_chats").select("id").or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`).eq("status", "active"),
    supabase.from("care_chat_sessions").select("id").eq("user_id", userId).in("status", ["waiting", "active"]),
    supabase.from("circle_members").select("id", { count: "exact", head: true }).eq("user_id", userId).is("left_at", null),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_read", false),
  ])

  // Parallel: article stats + life engine (independent)
  const [articleRes, lifeRes] = await Promise.allSettled([
    getUserArticleStats(userId),
    getLifeEngineData(),
  ])

  // Build identity from results
  const profile = profileRes.status === "fulfilled" ? profileRes.value.data : null
  const tier = tierRes.status === "fulfilled" ? tierRes.value : "reguler"
  const discRaw = discRes.status === "fulfilled" ? discRes.value.data : null
  const tests = testsRes.status === "fulfilled" ? testsRes.value.data : null
  const journey = journeyRes.status === "fulfilled" ? journeyRes.value.data : null
  const timeline = timelineRes.status === "fulfilled" ? timelineRes.value.data : null
  const bisik = bisikRes.status === "fulfilled" ? bisikRes.value.data : null
  const care = careRes.status === "fulfilled" ? careRes.value.data : null
  const circleCount = circleRes.status === "fulfilled" ? (circleRes.value.count ?? 0) : 0
  const unreadCount = unreadRes.status === "fulfilled" ? (unreadRes.value.count ?? 0) : 0
  const articleStats = articleRes.status === "fulfilled" ? articleRes.value : { total_read: 0, total_minutes: 0 }
  const lifeEngine = lifeRes.status === "fulfilled" ? lifeRes.value : null

  // Build response
  const identity: any = {
    user: {
      name: auth.user.email?.split("@")[0] || "Pengguna",
      bio: "", avatar: null, completeness: 0, missingFields: [],
      tier, mitraRole: null,
    },
    disc: null, tesAh: null, lifeEngine: null,
    journey: null, timeline: [],
    activity: { bisik: { activeChats: 0, unread: 0 }, care: { activeSessions: 0 }, circle: { joined: 0 }, baca: null },
    unreadNotifications: 0,
  }

  if (profile) {
    const filledCount = COMPLETENESS_FIELDS.filter(f => !!(profile as any)[f]).length
    identity.user = {
      name: (profile as any).full_name || auth.user.email?.split("@")[0] || "Pengguna",
      bio: (profile as any).bio || "",
      avatar: (profile as any).avatar_url || null,
      completeness: Math.round((filledCount / COMPLETENESS_FIELDS.length) * 100) / 100,
      missingFields: COMPLETENESS_FIELDS.filter(f => !(profile as any)[f]),
      tier,
      mitraRole: null,
    }
  }

  const role = (auth.user.user_metadata?.role || auth.user.app_metadata?.role) || null
  identity.user.mitraRole = ["psychologist", "care_volunteer"].includes(role as string) ? role : null

  if (discRaw?.scores && Object.keys(discRaw.scores).length > 0) {
    identity.disc = { primary: discRaw.primary || null, secondary: discRaw.secondary || null, gameCount: discRaw.game_count || 0, scores: discRaw.scores || {} }
  }

  if (tests?.length) {
    identity.tesAh = { latest: tests[0], modules: tests.reduce((acc: any, t: any) => { if (!acc[t.module]) acc[t.module] = t; return acc }, {}) }
  }

  if (journey) {
    const [bigWinsRes, doneRes] = await Promise.all([
      supabase.from("big_wins").select("*", { count: "exact", head: true }).eq("journey_id", (journey as any).id),
      supabase.from("big_wins").select("*", { count: "exact", head: true }).eq("journey_id", (journey as any).id).eq("is_completed", true),
    ])
    identity.journey = { ...journey, bigWinsTotal: bigWinsRes.count ?? 0, bigWinsDone: doneRes.count ?? 0 }
  }

  if (timeline?.length) {
    identity.timeline = timeline.map((e: any) => ({ date: e.event_date, emoji: getEventEmoji(e.event_type), title: e.title, description: e.description }))
  }

  if (articleStats.total_read > 0 || articleStats.total_minutes > 0) {
    identity.activity.baca = { totalRead: articleStats.total_read, totalMinutes: articleStats.total_minutes }
  }

  identity.activity.bisik.activeChats = (bisik || []).length
  identity.activity.care.activeSessions = (care || []).length
  identity.activity.circle.joined = circleCount
  identity.unreadNotifications = unreadCount

  if (lifeEngine) {
    identity.lifeEngine = {
      level: (lifeEngine as any).level,
      totalPoints: (lifeEngine as any).totalPoints,
      growthZone: (lifeEngine as any).growthZone || null,
      capitals: Object.fromEntries(ALL_DIMENSIONS.map((dim: string) => [dim, { total: (lifeEngine as any).capitals[dim]?.total_points || 0 }])),
    }
  }

  return NextResponse.json(identity)
}

function getEventEmoji(type: string): string {
  const map: Record<string, string> = { activity_completed: "✅", reflection_written: "📝", small_win_completed: "🌟", big_win_completed: "🏆", big_win_failed: "💪", journey_pivoted: "🔄", circle_joined: "👥", mentor_interaction: "💬" }
  return map[type] || "📌"
}
