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
  owner_name?: string
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
  opts?: { skipTopicFilter?: boolean },
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
    .order("created_at", { ascending: false })
    .limit(20)

  if (!opts?.skipTopicFilter && topicIds.length > 0) {
    query = query.in("topic_id", topicIds)
  }

  if (swipedCardIds.length > 0) {
    query = query.not("id", "in", `(${swipedCardIds.join(",")})`)
  }

  const { data } = await query
  const cards = (data ?? []) as BisikCard[]

  // Fetch owner names for all cards
  if (cards.length > 0) {
    const ownerIds = [...new Set(cards.map((c) => c.user_id))]
    const { data: owners } = await supabase
      .from("users")
      .select("id, bisik_anonymous_name, bisik_custom_name")
      .in("id", ownerIds)

    const ownerMap = new Map(
      (owners ?? []).map((o) => [o.id, o.bisik_custom_name || o.bisik_anonymous_name || "Anonymous"])
    )

    return cards.map((card) => ({
      ...card,
      owner_name: ownerMap.get(card.user_id) || "Anonymous",
    })) as BisikCard[]
  }

  return cards
}

export async function swipeLeft(
  cardId: string,
  cardOwnerId: string,
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  await supabase.from("bisik_swipes").insert({
    swiper_id: user.id,
    card_id: cardId,
    card_owner_id: cardOwnerId,
    direction: "left",
  })
}

export async function swipeRight(
  card: BisikCard,
): Promise<{ error: string | null; maxAllowed?: number }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: maxChats } = await supabase
    .rpc("get_user_max_chats", { p_user_id: user.id })

  const { count: activeCount } = await supabase
    .from("bisik_chats")
    .select("*", { count: "exact", head: true })
    .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .in("status", ["pending", "active"])

  if ((activeCount ?? 0) >= (maxChats ?? 5)) {
    return { error: "CHAT_LIMIT_REACHED", maxAllowed: maxChats ?? 5 }
  }

  await supabase.from("bisik_swipes").insert({
    swiper_id: user.id,
    card_id: card.id,
    card_owner_id: card.user_id,
    direction: "right",
  })

  return { error: null }
}
