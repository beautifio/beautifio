import { createClient } from "@/lib/supabase/client"
import type { TebakSession, TebakQuestion, TebakAnswer } from "./queries"

export function subscribeToTebakGame(
  sessionId: string,
  callbacks: {
    onSessionUpdate: (session: TebakSession) => void
    onQuestionUpdate: (question: TebakQuestion) => void
    onAnswerSubmitted: (answer: TebakAnswer) => void
  }
) {
  const supabase = createClient()
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`tebak:${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE', schema: 'public', table: 'tebak_sessions',
      filter: `id=eq.${sessionId}`,
    }, (p) => callbacks.onSessionUpdate(p.new as TebakSession))
    .on('postgres_changes', {
      event: '*', schema: 'public', table: 'tebak_questions',
      /* Note: round_id filter not added because roundIds aren't known at subscription setup time.
         Cross-session events are guarded in onQuestionUpdate via roundIdsRef + currentQSeqRef. */
    }, (p) => callbacks.onQuestionUpdate(p.new as TebakQuestion))
    .on('postgres_changes', {
      event: 'INSERT', schema: 'public', table: 'tebak_answers',
    }, (p) => callbacks.onAnswerSubmitted(p.new as TebakAnswer))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
