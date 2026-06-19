'use server'
import { createClient } from "@/lib/supabase/server"

export async function joinTebakQueue(): Promise<{ sessionId: string; playerRole: 'a' | 'b' }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Cek apakah user sudah punya active session
  const { data: existingPlayer } = await supabase
    .from('tebak_sessions')
    .select('id')
    .or(`player_a_id.eq.${user.id},player_b_id.eq.${user.id}`)
    .in('status', ['waiting', 'active'])
    .maybeSingle()
  if (existingPlayer) {
    return { sessionId: existingPlayer.id, playerRole: 'a' }
  }

  // Cari session waiting (bukan milik user)
  const { data: existing } = await supabase
    .from('tebak_sessions')
    .select('id')
    .eq('status', 'waiting')
    .neq('player_a_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existing) {
    const firstSubject: 'a' | 'b' = Math.random() > 0.5 ? 'a' : 'b'

    await supabase.from('tebak_sessions').update({
      player_b_id: user.id, status: 'active', current_subject: firstSubject,
    }).eq('id', existing.id)

    const { data: round } = await supabase.from('tebak_rounds').insert({
      session_id: existing.id, subject_player: firstSubject, round_number: 1,
    }).select('id').single()

    if (round) await selectQuestionsForRound(existing.id, round.id)

    return { sessionId: existing.id, playerRole: 'b' }
  }

  // Buat session baru sebagai A
  const { data: session } = await supabase.from('tebak_sessions').insert({
    player_a_id: user.id, status: 'waiting',
  }).select('id').single()

  return { sessionId: session!.id, playerRole: 'a' }
}

export async function submitSubjectAnswer(questionId: string, answer: string): Promise<void> {
  const supabase = await createClient()
  const now = new Date()
  const deadline = new Date(now.getTime() + 15_000)

  await supabase.from('tebak_questions').update({
    correct_answer: answer,
    subject_answered_at: now.toISOString(),
    guesser_deadline: deadline.toISOString(),
    status: 'guesser_guessing',
  }).eq('id', questionId)
}

export async function submitGuesserAnswer(
  questionId: string, guesserId: string, answer: string, startedAt: number
): Promise<{ isCorrect: boolean; points: number }> {
  const supabase = await createClient()

  const { data: q } = await supabase
    .from('tebak_questions')
    .select('correct_answer, guesser_deadline, round_id')
    .eq('id', questionId).single()

  if (!q?.correct_answer) throw new Error('Subject has not answered yet')

  const now = new Date()
  if (new Date(q.guesser_deadline!) < now) {
    await supabase.from('tebak_answers').insert({
      question_id: questionId, guesser_id: guesserId,
      answer: '__timeout__', is_correct: false, time_ms: 15000,
    })
    return { isCorrect: false, points: 0 }
  }

  const isCorrect = answer === q.correct_answer
  const timeTaken = Date.now() - startedAt

  await supabase.from('tebak_answers').insert({
    question_id: questionId, guesser_id: guesserId,
    answer, is_correct: isCorrect, time_ms: timeTaken,
  })

  if (isCorrect) {
    const { data: q } = await supabase.from('tebak_questions').select('round_id').eq('id', questionId).single()
    if (!q) return { isCorrect: true, points: 10 }
    const { data: r } = await supabase.from('tebak_rounds').select('session_id').eq('id', q.round_id).single()
    if (!r) return { isCorrect: true, points: 10 }
    const { data: session } = await supabase.from('tebak_sessions').select('player_a_id, player_b_id').eq('id', r.session_id).single()

    if (session) {
      const isPlayerA = session.player_a_id === guesserId
      if (isPlayerA) {
        await supabase.rpc('increment_tebak_score', { session_id: r.session_id, column: 'score_a', amount: 10 })
      } else {
        await supabase.rpc('increment_tebak_score', { session_id: r.session_id, column: 'score_b', amount: 10 })
      }
    }
  }

  await supabase.from('tebak_questions').update({ status: 'revealed' }).eq('id', questionId)

  return { isCorrect, points: isCorrect ? 10 : 0 }
}

async function selectQuestionsForRound(sessionId: string, roundId: string): Promise<void> {
  const supabase = await createClient()
  const { data: bank } = await supabase
    .from('tebak_question_bank')
    .select('id, question_text, options')
    .eq('is_active', true)
    .limit(20)

  if (!bank?.length) return

  const shuffled = bank.sort(() => Math.random() - 0.5).slice(0, 5)

  await supabase.from('tebak_questions').insert(
    shuffled.map((q, i) => ({
      round_id: roundId,
      question_bank_id: q.id,
      question_text: q.question_text,
      options: q.options,
      sequence_number: i + 1,
    }))
  )
}

export async function advanceGame(sessionId: string): Promise<void> {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('tebak_sessions')
    .select('*, tebak_rounds(*)')
    .eq('id', sessionId).single()

  if (!session) return

  const round = session.tebak_rounds.find((r: any) => r.round_number === session.current_round)
  if (!round) return

  const { data: questions } = await supabase
    .from('tebak_questions')
    .select('status')
    .eq('round_id', round.id)

  const allRevealed = questions?.every((q: any) => q.status === 'revealed') ?? false

  if (!allRevealed) {
    await supabase.from('tebak_sessions').update({
      current_q_seq: session.current_q_seq + 1,
    }).eq('id', sessionId)
    return
  }

  await supabase.from('tebak_rounds').update({ status: 'done' }).eq('id', round.id)

  if (session.current_round === 1) {
    const newSubject: 'a' | 'b' = session.current_subject === 'a' ? 'b' : 'a'
    const { data: newRound } = await supabase.from('tebak_rounds').insert({
      session_id: sessionId, subject_player: newSubject, round_number: 2,
    }).select('id').single()

    if (newRound) {
      await selectQuestionsForRound(sessionId, newRound.id)
      await supabase.from('tebak_sessions').update({
        current_round: 2, current_subject: newSubject, current_q_seq: 1,
      }).eq('id', sessionId)
    }
  } else {
    await supabase.from('tebak_sessions').update({
      status: 'finished', finished_at: new Date().toISOString(),
    }).eq('id', sessionId)
  }
}
