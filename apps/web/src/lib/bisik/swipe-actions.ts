'use server'

import { createClient } from "@/lib/supabase/server"
import { generateNickname } from "@/lib/anonymous"
import type { BisikCategory, BisikMood } from "./actions"

export interface BisikQueueCard {
  id: string
  nickname: string
  category: BisikCategory
  mood_check: BisikMood
  topic_hint: string | null
  created_at: string
}

export async function enterBisikQueue(
  category: BisikCategory,
  moodCheck: BisikMood,
  topicHint?: string
): Promise<{ queueId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("bisik_queue").delete().eq("user_id", user.id)

  const { data: queue } = await supabase
    .from("bisik_queue")
    .insert({
      user_id: user.id,
      category,
      mood_check: moodCheck,
      topic_hint: topicHint || null,
      nickname: generateNickname(),
    })
    .select("id")
    .single()

  return { queueId: queue!.id }
}

export async function getDiscoverCards(
  category: BisikCategory,
): Promise<BisikQueueCard[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: swipedIds } = await supabase
    .from("bisik_swipes")
    .select("target_id")
    .eq("swiper_id", user.id)

  const alreadySwiped = swipedIds?.map(s => s.target_id) || []

  let query = supabase
    .from("bisik_queue")
    .select("id, nickname, category, mood_check, topic_hint, created_at")
    .eq("category", category)
    .eq("status", "waiting")
    .neq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(10)

  if (alreadySwiped.length > 0) {
    query = query.not("id", "in", `(${alreadySwiped.join(",")})`)
  }

  const { data } = await query
  return (data || []) as BisikQueueCard[]
}

export async function swipeLeft(targetQueueId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("bisik_swipes").insert({
    swiper_id: user.id,
    target_id: targetQueueId,
    direction: "left",
  })
}

export async function swipeRight(
  targetQueueId: string,
  myQueueId: string,
): Promise<{ sessionId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: target } = await supabase
    .from("bisik_queue")
    .select("id, user_id, category, mood_check, topic_hint, nickname")
    .eq("id", targetQueueId)
    .eq("status", "waiting")
    .single()

  if (!target) throw new Error("ALREADY_MATCHED")

  const { data: myQueue } = await supabase
    .from("bisik_queue")
    .select("nickname, topic_hint")
    .eq("id", myQueueId)
    .single()

  const { data: session } = await supabase
    .from("bisik_sessions")
    .insert({
      category: target.category,
      topic_hint: target.topic_hint || myQueue?.topic_hint,
      status: "active",
      matched_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  await supabase.from("bisik_participants").insert([
    {
      session_id: session!.id,
      user_id: user.id,
      nickname: myQueue?.nickname || generateNickname(),
      mood_check: target.mood_check,
    },
    {
      session_id: session!.id,
      user_id: target.user_id,
      nickname: target.nickname,
      mood_check: target.mood_check,
    },
  ])

  await supabase
    .from("bisik_queue")
    .update({ status: "matched" })
    .in("id", [targetQueueId, myQueueId])

  await supabase.from("bisik_swipes").insert({
    swiper_id: user.id,
    target_id: targetQueueId,
    direction: "right",
  })

  return { sessionId: session!.id }
}
