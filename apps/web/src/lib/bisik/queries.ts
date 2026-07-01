import { createClient } from "@/lib/supabase/client"

export interface BisikChat {
  id: string
  card_id: string | null
  initiator_id: string
  receiver_id: string
  status: string
  expires_at: string | null
  initiated_at: string
  activated_at: string | null
  ended_at: string | null
  ended_by: string | null
  created_at: string
}

export interface BisikMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface BisikParticipant {
  id: string
  user_id: string
  nickname: string
}

export async function getBisikChat(chatId: string): Promise<BisikChat | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.from("bisik_chats").select("*").eq("id", chatId).maybeSingle()
  return data
}

export async function getBisikMessages(chatId: string): Promise<BisikMessage[]> {
  const supabase = createClient()
  if (!supabase) return []
  const { data } = await supabase
    .from("bisik_messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })
  return data || []
}

export async function getBisikParticipants(chatId: string): Promise<BisikParticipant[]> {
  const supabase = createClient()
  if (!supabase) return []
  const { data: chat } = await supabase
    .from("bisik_chats")
    .select("initiator_id, receiver_id")
    .eq("id", chatId)
    .maybeSingle()
  if (!chat) return []

  const { data: users } = await supabase
    .from("users")
    .select("id, bisik_anonymous_name, bisik_custom_name")
    .in("id", [chat.initiator_id, chat.receiver_id])
  return (
    users?.map((u) => ({
      id: u.id,
      user_id: u.id,
      nickname: u.bisik_custom_name || u.bisik_anonymous_name || "Anonymous",
    })) || []
  )
}
