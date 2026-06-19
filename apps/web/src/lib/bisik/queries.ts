import { createClient } from "@/lib/supabase/client"

export interface BisikSession {
  id: string
  category: string
  status: string
  created_at: string
  matched_at: string | null
  ended_at: string | null
  end_reason: string | null
}

export interface BisikParticipant {
  id: string
  session_id: string
  user_id: string
  nickname: string
  mood_check: string
  joined_at: string
}

export interface BisikMessage {
  id: string
  session_id: string
  sender_id: string
  content: string
  created_at: string
}

export async function getBisikSession(sessionId: string): Promise<BisikSession | null> {
  const supabase = createClient()
  if (!supabase) return null
  const { data } = await supabase.from('bisik_sessions').select('*').eq('id', sessionId).single()
  return data
}

export async function getBisikParticipants(sessionId: string): Promise<BisikParticipant[]> {
  const supabase = createClient()
  if (!supabase) return []
  const { data } = await supabase.from('bisik_participants').select('*').eq('session_id', sessionId)
  return data || []
}

export async function getBisikMessages(sessionId: string): Promise<BisikMessage[]> {
  const supabase = createClient()
  if (!supabase) return []
  const { data } = await supabase.from('bisik_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true })
  return data || []
}
