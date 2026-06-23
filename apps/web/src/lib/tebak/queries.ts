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
}

export type TebakRound = {
  id: string
  session_id: string
  subject_player: 'a' | 'b'
  round_number: number
  status: string
}

export type TebakQuestion = {
  id: string
  round_id: string
  question_bank_id: string
  question_text: string
  question_for_guesser: string | null
  options: string[]
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
