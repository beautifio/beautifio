'use server'
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getRandomBotId, getBotWinRate } from "./bot"

export async function joinTebakQueue(): Promise<{ sessionId: string; playerRole: 'a' | 'b'; isNew: boolean }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: result, error } = await supabase.rpc('find_or_create_tebak_session', {
    p_user_id: user.id,
  })

  if (error) {
    console.error('joinTebakQueue RPC error:', error)
    throw new Error('Failed to find or create session')
  }
  if (!result) {
    console.error('joinTebakQueue: RPC returned null')
    throw new Error('Failed to find or create session')
  }

  const { sessionId, playerRole, isNew } = result as { sessionId: string; playerRole: 'a' | 'b'; isNew: boolean }

  return { sessionId, playerRole, isNew }
}

export async function matchWithBot(sessionId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const botId = getRandomBotId('medium')

  const { error } = await supabase.rpc('activate_tebak_session', {
    p_session_id: sessionId,
    p_player_b_id: botId,
  })

  if (error) {
    console.error('matchWithBot RPC error:', error)
    return false
  }

  return true
}

export async function replaceDisconnectedWithBot(sessionId: string, disconnectedUserId: string): Promise<void> {
  const supabase = await createServerClient()
  const botId = getRandomBotId('low')

  const { data: session } = await supabase
    .from('tebak_sessions')
    .select('player_a_id, player_b_id')
    .eq('id', sessionId)
    .single()

  if (!session) return

  if (session.player_a_id === disconnectedUserId) {
    await supabase.from('tebak_sessions').update({ player_a_id: botId }).eq('id', sessionId)
  } else {
    await supabase.from('tebak_sessions').update({ player_b_id: botId }).eq('id', sessionId)
  }
}

export async function botPlayTurn(
  sessionId: string,
  questionId: string,
  botUserId: string,
): Promise<void> {
  const supabase = await createServerClient()

  const { data: q } = await supabase
    .from('tebak_questions')
    .select('status, correct_answer, options, round_id')
    .eq('id', questionId)
    .single()

  if (!q) return

  const { data: r } = await supabase
    .from('tebak_rounds')
    .select('session_id, subject_player')
    .eq('id', q.round_id)
    .single()

  if (!r) return

  const { data: session } = await supabase
    .from('tebak_sessions')
    .select('player_a_id, player_b_id')
    .eq('id', r.session_id)
    .single()

  if (!session) return

  const isBotSubject = r.subject_player === 'a'
    ? session.player_a_id === botUserId
    : session.player_b_id === botUserId

  const { data: botUser } = await supabase
    .from('users')
    .select('bot_win_rate')
    .eq('id', botUserId)
    .single()

  const winRate = botUser?.bot_win_rate ?? 50
  const options = q.options as string[]

  // Bot answers after 2-4 seconds (seems human)
  await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))

  if (isBotSubject) {
    const answer = options[Math.floor(Math.random() * options.length)]
    const now = new Date()
    const deadline = new Date(now.getTime() + 15_000)

    await supabase.from('tebak_questions').update({
      correct_answer: answer,
      subject_answered_at: now.toISOString(),
      guesser_deadline: deadline.toISOString(),
      status: 'guesser_guessing',
    }).eq('id', questionId)
  } else if (q.status === 'guesser_guessing') {
    const roll = Math.random() * 100
    const isCorrect = roll < winRate && q.correct_answer != null
    const answer = isCorrect
      ? q.correct_answer!
      : options.filter((o: string) => o !== q.correct_answer)[Math.floor(Math.random() * (options.length - 1))]

    const now = new Date()

    await supabase.from('tebak_answers').insert({
      question_id: questionId,
      guesser_id: botUserId,
      answer,
      is_correct: isCorrect,
      time_ms: Math.floor(Math.random() * 10000) + 3000,
    })

    if (isCorrect) {
      const isBotPlayerA = session.player_a_id === botUserId
      await supabase.rpc('increment_tebak_score', {
        session_id: r.session_id,
        column: isBotPlayerA ? 'score_a' : 'score_b',
        amount: 10,
      })
    }

    await supabase.from('tebak_questions').update({ status: 'revealed' }).eq('id', questionId)
  }
}

export async function checkOpponentDisconnected(sessionId: string, opponentId: string): Promise<boolean> {
  const supabase = await createServerClient()
  const { data: user } = await supabase
    .from('users')
    .select('last_active_at, is_bot')
    .eq('id', opponentId)
    .single()

  if (!user || user.is_bot) return false

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  return !user.last_active_at || user.last_active_at < fiveMinAgo
}

export async function getSessionWithPlayers(sessionId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('tebak_sessions')
    .select('*, player_a:player_a_id(id, full_name, avatar_url, is_bot), player_b:player_b_id(id, full_name, avatar_url, is_bot)')
    .eq('id', sessionId)
    .single()
  return data
}

export async function retryMatchmaking(sessionId: string): Promise<string | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: ourSession } = await supabase
    .from('tebak_sessions')
    .select('status')
    .eq('id', sessionId)
    .single()

  if (!ourSession || ourSession.status !== 'waiting') return null

  const { data: other } = await supabase
    .from('tebak_sessions')
    .select('id')
    .eq('status', 'waiting')
    .neq('player_a_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!other) return null

  await supabase.from('tebak_sessions').delete().eq('id', sessionId)

  const { data: roundId, error } = await supabase.rpc('activate_tebak_session', {
    p_session_id: other.id,
    p_player_b_id: user.id,
  })

  if (error) {
    console.error('retryMatchmaking activate_tebak_session RPC error:', error)
    return null
  }
  if (!roundId) {
    console.error('retryMatchmaking: activate_tebak_session returned null')
    return null
  }

  return other.id
}

export async function updateUserHeartbeat(userId: string): Promise<void> {
  const supabase = await createServerClient()
  await supabase.from('users').update({
    last_active_at: new Date().toISOString(),
  }).eq('id', userId)
}

async function selectQuestionsForRound(sessionId: string, roundId: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: bank, error: bankErr } = await supabase
    .from('tebak_question_bank')
    .select('id, question_text, options')
    .eq('is_active', true)
    .limit(20)

  if (bankErr) {
    console.error('selectQuestionsForRound: fetch question bank error:', bankErr)
    return
  }
  if (!bank?.length) {
    console.error('selectQuestionsForRound: no questions in bank')
    return
  }

  const shuffled = bank.sort(() => Math.random() - 0.5).slice(0, 5)

  const { error: insertErr } = await supabase.from('tebak_questions').insert(
    shuffled.map((q, i) => ({
      round_id: roundId,
      question_bank_id: q.id,
      question_text: q.question_text,
      options: q.options,
      sequence_number: i + 1,
    }))
  )

  if (insertErr) {
    console.error('selectQuestionsForRound: insert error:', insertErr)
  }
}

export async function submitSubjectAnswer(questionId: string, answer: string): Promise<void> {
  const supabase = await createServerClient()
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
  const supabase = await createServerClient()

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
    const { data: qq } = await supabase.from('tebak_questions').select('round_id').eq('id', questionId).single()
    if (qq) {
      const { data: rr } = await supabase.from('tebak_rounds').select('session_id').eq('id', qq.round_id).single()
      if (rr) {
        const { data: sess } = await supabase.from('tebak_sessions').select('player_a_id, player_b_id').eq('id', rr.session_id).single()
        if (sess) {
          const isPlayerA = sess.player_a_id === guesserId
          await supabase.rpc('increment_tebak_score', {
            session_id: rr.session_id,
            column: isPlayerA ? 'score_a' : 'score_b',
            amount: 10,
          })
        }
      }
    }
  }

  await supabase.from('tebak_questions').update({ status: 'revealed' }).eq('id', questionId)

  return { isCorrect, points: isCorrect ? 10 : 0 }
}

export async function advanceGame(sessionId: string): Promise<void> {
  const supabase = await createServerClient()

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
      await supabase.rpc('switch_tebak_subject', { p_session_id: sessionId })
    }
  } else {
    await supabase.from('tebak_sessions').update({
      status: 'finished', finished_at: new Date().toISOString(),
    }).eq('id', sessionId)
  }
}
