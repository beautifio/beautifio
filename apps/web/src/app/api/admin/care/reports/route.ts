import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()
  if (!["superadmin", "admin"].includes(profile?.role || "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  // Total & resolved this month
  const { count: totalMonth } = await supabase.from("care_chat_sessions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const { count: resolvedMonth } = await supabase.from("care_chat_sessions")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())
    .eq("status", "closed")

  // Avg response time
  const { data: metrics } = await supabase.from("care_session_metrics")
    .select("response_time_seconds, resolution_time_seconds")
    .gte("calculated_at", startOfMonth.toISOString())

  const avgResponse = metrics?.length ? Math.round(metrics.reduce((s, m) => s + (m.response_time_seconds || 0), 0) / metrics.length / 60) : 0
  const avgResolution = metrics?.length ? Math.round(metrics.reduce((s, m) => s + (m.resolution_time_seconds || 0), 0) / metrics.length / 3600 * 10) / 10 : 0

  // Avg rating
  const { data: surveys } = await supabase.from("care_satisfaction_surveys")
    .select("rating").gte("created_at", startOfMonth.toISOString())
  const avgRating = surveys?.length ? Math.round(surveys.reduce((s, r) => s + r.rating, 0) / surveys.length * 10) / 10 : 0

  // Per category
  const { data: allSessions } = await supabase.from("care_chat_sessions")
    .select("category, status, officer_id, is_ai_officer")
    .gte("created_at", startOfMonth.toISOString())

  const byCategory: Record<string, { total: number; resolved: number }> = {}
  allSessions?.forEach(s => {
    if (!byCategory[s.category]) byCategory[s.category] = { total: 0, resolved: 0 }
    byCategory[s.category].total++
    if (s.status === "closed") byCategory[s.category].resolved++
  })

  // Per agent
  const agentMap: Record<string, { total: number; resolved: number; ai: boolean }> = {}
  allSessions?.forEach(s => {
    if (!s.officer_id) return
    if (!agentMap[s.officer_id]) agentMap[s.officer_id] = { total: 0, resolved: 0, ai: !!s.is_ai_officer }
    agentMap[s.officer_id].total++
    if (s.status === "closed") agentMap[s.officer_id].resolved++
  })

  // Get agent names
  const agentIds = Object.keys(agentMap)
  const { data: agents } = await supabase.from("care_officers")
    .select("user_id, name").in("user_id", agentIds)
  const agentNames: Record<string, string> = {}
  agents?.forEach(a => { agentNames[a.user_id] = a.name })

  // AI volunteers
  const { data: aiVolunteers } = await supabase.from("care_ai_volunteers")
    .select("user_id, display_name")
  const aiNames: Record<string, string> = {}
  aiVolunteers?.forEach(a => { aiNames[a.user_id] = a.display_name })

  const agentStats = Object.entries(agentMap).map(([id, stats]) => ({
    id,
    name: agentNames[id] || aiNames[id] || "Unknown",
    total: stats.total,
    resolved: stats.resolved,
    isAI: stats.ai,
  })).sort((a, b) => b.total - a.total)

  return NextResponse.json({
    summary: { totalMonth: totalMonth || 0, resolvedMonth: resolvedMonth || 0, avgResponse, avgResolution, avgRating },
    byCategory: Object.entries(byCategory).map(([cat, data]) => ({ category: cat, ...data })),
    agentStats,
  })
}
