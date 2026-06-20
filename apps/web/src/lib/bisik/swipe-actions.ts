'use server'

import { createClient } from "@/lib/supabase/server"

export interface BisikCard {
  id: string
  user_id: string
  topic_id: string
  content: string
  is_active: boolean
  view_count: number
  swipe_count: number
  created_at: string
  expires_at: string
  topic?: { name: string; emoji: string } | null
}

export async function enterBisikQueue(
  topicId: string,
  content: string,
): Promise<{ cardId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: card } = await supabase
    .from("bisik_cards")
    .insert({
      user_id: user.id,
      topic_id: topicId,
      content,
    })
    .select("id")
    .single()

  return { cardId: card!.id }
}

export async function getDiscoverCards(
  userId: string,
  topicIds: string[],
): Promise<BisikCard[]> {
  const supabase = await createClient()

  const { data: swiped } = await supabase
    .from("bisik_swipes")
    .select("card_id")
    .eq("swiper_id", userId)

  const swipedCardIds = swiped?.map((s) => s.card_id) ?? []

  let query = supabase
    .from("bisik_cards")
    .select("*, topic:bisik_topics(name, emoji)")
    .eq("is_active", true)
    .gt("expires_at", new Date().toISOString())
    .neq("user_id", userId)
    .in("topic_id", topicIds)
    .order("created_at", { ascending: false })
    .limit(20)

  if (swipedCardIds.length > 0) {
    query = query.not("id", "in", `(${swipedCardIds.join(",")})`)
  }

  const { data } = await query
  return (data ?? []) as BisikCard[]
}

export async function swipeLeft(
  swiperId: string,
  cardId: string,
  cardOwnerId: string,
): Promise<void> {
  const supabase = await createClient()
  await supabase.from("bisik_swipes").insert({
    swiper_id: swiperId,
    card_id: cardId,
    card_owner_id: cardOwnerId,
    direction: "left",
  })
}

export async function swipeRight(
  swiperId: string,
  card: BisikCard,
): Promise<{ error: string | null; maxAllowed?: number }> {
  const supabase = await createClient()

  const { data: maxChats } = await supabase
    .rpc("get_user_max_chats", { p_user_id: swiperId })

  const { count: activeCount } = await supabase
    .from("bisik_chats")
    .select("*", { count: "exact", head: true })
    .or(`initiator_id.eq.${swiperId},receiver_id.eq.${swiperId}`)
    .in("status", ["pending", "active"])

  if ((activeCount ?? 0) >= (maxChats ?? 5)) {
    return { error: "CHAT_LIMIT_REACHED", maxAllowed: maxChats ?? 5 }
  }

  await supabase.from("bisik_swipes").insert({
    swiper_id: swiperId,
    card_id: card.id,
    card_owner_id: card.user_id,
    direction: "right",
  })

  return { error: null }
}
