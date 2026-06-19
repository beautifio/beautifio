import { createClient } from "@/lib/supabase/client"
import type { BisikMessage, BisikSession } from "./queries"

export function subscribeToBisikSession(
  sessionId: string,
  onStatusChange: (status: string) => void,
  onNewMessage: (message: BisikMessage) => void,
) {
  const supabase = createClient()
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`bisik:${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'bisik_sessions',
      filter: `id=eq.${sessionId}`,
    }, (payload) => onStatusChange((payload.new as BisikSession).status))
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'bisik_messages',
      filter: `session_id=eq.${sessionId}`,
    }, (payload) => onNewMessage(payload.new as BisikMessage))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
