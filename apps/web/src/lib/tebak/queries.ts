export type TebakSession = {
  id: string
  player_a_id: string
  player_b_id: string
  status: 'waiting' | 'active' | 'finished'
  score_a: number
  score_b: number
  current_round: number
  current_q_seq: number
  current_subject: 'a' | 'b' | null
  created_at: string
  finished_at: string | null
  advance_at: string | null
  player_a_ready: boolean
  player_b_ready: boolean
}

export type TebakRound = {
  id: string
  session_id: string
  subject_player: 'a' | 'b' | null
  round_number: number
  round_type: 'disc' | 'tebak'
  status: string
}

export type TebakQuestion = {
  id: string
  round_id: string
  question_bank_id: string
  question_text: string
  question_for_guesser: string | null
  options: string[]
  option_disc: string[] | null
  sequence_number: number
  correct_answer: string | null
  subject_answered_at: string | null
  guesser_deadline: string | null
  subject_deadline: string | null
  status: string
}

export type TebakAnswer = {
  id: string
  question_id: string
  guesser_id: string
  answer: string
  is_correct: boolean | null
  time_ms: number | null
  answered_at: string
}

const DISC_LABELS: Record<string, { label: string; desc: string; emoji: string }> = {
  D: { label: "Dominance", desc: "Tegas, kompetitif, berorientasi hasil", emoji: "🦁" },
  I: { label: "Influence", desc: "Antusias, persuasif, suka bersosialisasi", emoji: "🦜" },
  S: { label: "Steadiness", desc: "Sabar, stabil, pendengar yang baik", emoji: "🐢" },
  C: { label: "Conscientiousness", desc: "Teliti, sistematis, berorientasi detail", emoji: "🦉" },
}

export async function getUserDiscProfile(userId: string) {
  const { supabase } = await import("@/lib/supabase/client")
  if (!supabase) return null

  const { data: sessions } = await supabase.from("tebak_sessions")
    .select("id").in("status", ["finished","active"])
    .or(`player_a_id.eq.${userId},player_b_id.eq.${userId}`)
    .order("created_at", { ascending: false }).limit(20)

  if (!sessions?.length) return null

  const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 }
  let totalGames = 0

  for (const s of sessions) {
    const { data: answers } = await supabase.from("tebak_answers")
      .select("answer").eq("guesser_id", userId)
      .in("question_id", (await supabase.from("tebak_questions").select("id").in("round_id",
        (await supabase.from("tebak_rounds").select("id").eq("session_id", s.id).eq("round_type", "disc")).data?.map(r => r.id) || []
      )).data?.map(q => q.id) || [])

    if (!answers?.length) continue
    totalGames++
    const dimCounts: Record<string, number> = {}
    answers.forEach(a => { if (a.answer && DISC_LABELS[a.answer]) { dimCounts[a.answer] = (dimCounts[a.answer] || 0) + 1 } })
    const top = Object.entries(dimCounts).sort((a, b) => b[1] - a[1])
    if (top.length > 0) counts[top[0][0]]++
  }

  if (totalGames === 0) return null
  const topDims = Object.entries(counts).sort((a, b) => b[1] - a[1]).filter(([, v]) => v > 0)
  if (topDims.length === 0) return null
  const primary = topDims[0]; const secondary = topDims[1]
  return { totalGames, primary: { key: primary[0], ...DISC_LABELS[primary[0]], count: primary[1] }, secondary: secondary ? { key: secondary[0], ...DISC_LABELS[secondary[0]], count: secondary[1] } : undefined }
}
