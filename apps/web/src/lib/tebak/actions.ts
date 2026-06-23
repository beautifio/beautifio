'use server'
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getRandomBotId } from "./bot"

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
  const botId = await getRandomBotId('medium')

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
  const botId = await getRandomBotId('low')

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

export async function advanceGame(
  sessionId: string, expectedSeq: number
): Promise<{ status: string; current_round?: number; current_q_seq?: number } | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc('advance_tebak_game', {
    p_session_id: sessionId,
    p_expected_seq: expectedSeq,
  })
  if (error) { console.error('advanceGame RPC error:', error); return null }
  return data as { status: string; current_round?: number; current_q_seq?: number } | null
}

export async function startQuestionTimer(sessionId: string, seq: number): Promise<string | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase.rpc('start_question_timer', {
    p_session_id: sessionId,
    p_seq: seq,
  })
  if (error) { console.error('startQuestionTimer error', error); return null }
  return data as string | null
}

export async function submitSubjectAnswer(questionId: string, answer: string): Promise<void> {
  const supabase = await createServerClient()
  const now = new Date()
  // +15.5s = 15s for the guesser + 500ms network latency buffer (Bug #5)
  const deadline = new Date(now.getTime() + 15_500)

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

  // Set server-timed advance
  const { data: q2 } = await supabase.from('tebak_questions').select('sequence_number, round_id').eq('id', questionId).single()
  if (q2) {
    const { data: r } = await supabase.from('tebak_rounds').select('session_id, round_number').eq('id', q2.round_id).single()
    if (r) {
      const isLastQ = q2.sequence_number === 5 && r.round_number === 1
      await supabase.rpc('set_session_advance_at', { 
        p_session_id: r.session_id,
        p_delay_seconds: isLastQ ? 8 : 3
      })
    }
  }

  return { isCorrect, points: isCorrect ? 10 : 0 }
}

export async function handleSubjectTimeout(questionId: string, sessionId: string): Promise<void> {
  const supabase = await createServerClient()

  const { data: q } = await supabase
    .from('tebak_questions')
    .select('status')
    .eq('id', questionId)
    .single()
  if (!q || q.status !== 'subject_answering') return

  const { data: session } = await supabase
    .from('tebak_sessions')
    .select('current_subject, player_a_id, player_b_id')
    .eq('id', sessionId)
    .single()
  if (!session) return

  const guesserCol = session.current_subject === 'a' ? 'score_b' : 'score_a'
  const guesserId = session.current_subject === 'a' ? session.player_b_id : session.player_a_id

  await supabase.rpc('increment_tebak_score', {
    session_id: sessionId,
    column: guesserCol,
    amount: 10,
  })

  await supabase.from('tebak_answers').insert({
    question_id: questionId,
    guesser_id: guesserId,
    answer: '__subject_timeout__',
    is_correct: false,
    time_ms: 20000,
  })

  await supabase.from('tebak_questions').update({
    status: 'revealed',
  }).eq('id', questionId)

  // Set server-timed advance
  const { data: q2 } = await supabase.from('tebak_questions').select('sequence_number, round_id').eq('id', questionId).single()
  if (q2) {
    const { data: r } = await supabase.from('tebak_rounds').select('session_id, round_number').eq('id', q2.round_id).single()
    if (r) {
      const isLastQ = q2.sequence_number === 5 && r.round_number === 1
      await supabase.rpc('set_session_advance_at', {
        p_session_id: r.session_id,
        p_delay_seconds: isLastQ ? 8 : 3
      })
    }
  }
}

export async function offerRematch(originalSessionId: string, opponentId: string): Promise<string> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Pastikan tidak ada offer yang sudah ada
  const { data: existing } = await supabase
    .from('tebak_rematch_offers')
    .select('id')
    .eq('original_session_id', originalSessionId)
    .eq('status', 'pending')
    .single()

  if (existing) {
    // Jika lawan sudah mengundang, terima saja
    const { data: acceptedOffer, error } = await supabase
      .from('tebak_rematch_offers')
      .update({ status: 'accepted' })
      .eq('id', existing.id)
      .select()
      .single()

    if (error || !acceptedOffer) throw new Error('Failed to accept existing offer')
    
    // Buat session baru
    const { data: newSession, error: newSessionError } = await supabase
      .rpc('find_or_create_tebak_session', { p_user_id: acceptedOffer.offered_by_id })

    if (newSessionError || !newSession) throw new Error('Failed to create new session on accept')

    await supabase.rpc('activate_tebak_session', {
      p_session_id: newSession.sessionId,
      p_player_b_id: acceptedOffer.offered_to_id
    })

    await supabase.from('tebak_rematch_offers').update({ new_session_id: newSession.sessionId }).eq('id', acceptedOffer.id)
    
    return newSession.sessionId
  }

  const { data, error } = await supabase
    .from('tebak_rematch_offers')
    .insert({
      original_session_id: originalSessionId,
      offered_by_id: user.id,
      offered_to_id: opponentId,
    })
    .select('id')
    .single()

  if (error) throw new Error('Failed to create rematch offer')
  return data.id
}

export async function respondToRematch(offerId: string, accept: boolean): Promise<string | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const status = accept ? 'accepted' : 'declined'
  const { data: offer, error } = await supabase
    .from('tebak_rematch_offers')
    .update({ status })
    .eq('id', offerId)
    .select()
    .single()

  if (error || !offer) throw new Error('Failed to respond to offer')

  if (accept) {
    const { data: newSession, error: newSessionError } = await supabase
      .rpc('find_or_create_tebak_session', { p_user_id: offer.offered_by_id })

    if (newSessionError || !newSession) throw new Error('Failed to create new session on accept')

    await supabase.rpc('activate_tebak_session', {
      p_session_id: newSession.sessionId,
      p_player_b_id: offer.offered_to_id
    })

    await supabase.from('tebak_rematch_offers').update({ new_session_id: newSession.sessionId }).eq('id', offer.id)

    return newSession.sessionId
  }

  return null
}

