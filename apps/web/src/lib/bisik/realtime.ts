import { createClient } from "@/lib/supabase/client"
import type { BisikMessage, BisikChat } from "./queries"

export function subscribeToBisikChat(
  chatId: string,
  onStatusChange: (status: string) => void,
  onNewMessage: (message: BisikMessage) => void,
) {
  const supabase = createClient()
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`bisik-chat:${chatId}`)
    .on("postgres_changes", {
      event: "UPDATE",
      schema: "public",
      table: "bisik_chats",
      filter: `id=eq.${chatId}`,
    }, (payload) => onStatusChange((payload.new as BisikChat).status))
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "bisik_messages",
      filter: `chat_id=eq.${chatId}`,
    }, (payload) => onNewMessage(payload.new as BisikMessage))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
