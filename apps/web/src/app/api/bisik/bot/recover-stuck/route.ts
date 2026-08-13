export const dynamic = "force-dynamic"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { botReplyToMessage } from "@/lib/bisik/bot-actions"

export async function GET() {
  const supabase = await createClient()

  // Find all active bot chats
  const { data: botChats } = await supabase.from("bisik_bot_chats")
    .select("chat_id, status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(50)

  if (!botChats?.length) {
    return NextResponse.json({ processed: 0, message: "No stuck chats" })
  }

  let replied = 0
  let errors = 0

  for (const bc of botChats) {
    try {
      // Get last message in this chat
      const { data: messages } = await supabase.from("bisik_messages")
        .select("sender_id, content, created_at")
        .eq("chat_id", bc.chat_id)
        .order("created_at", { ascending: false })
        .limit(2)

      if (!messages?.length) continue

      // Get chat to find bot_id
      const { data: chat } = await supabase.from("bisik_chats")
        .select("initiator_id, receiver_id")
        .eq("id", bc.chat_id)
        .single()

      if (!chat) continue

      // Find which is user and which is bot
      const { data: initiatorBot } = await supabase.from("tebak_bot_profiles")
        .select("id").eq("id", chat.initiator_id).maybeSingle()
      const { data: receiverBot } = await supabase.from("tebak_bot_profiles")
        .select("id").eq("id", chat.receiver_id).maybeSingle()

      const botId = initiatorBot ? chat.initiator_id : receiverBot ? chat.receiver_id : null
      if (!botId) continue

      // If last message is from user (not bot), reply
      const lastMsg = messages[0]
      if (lastMsg.sender_id !== botId) {
        const result = await botReplyToMessage(bc.chat_id, lastMsg.content)
        if (result.success) replied++
        else errors++
      }
    } catch {
      errors++
    }
  }

  return NextResponse.json({ processed: replied, errors })
}
