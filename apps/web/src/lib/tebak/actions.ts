'use server'
import { createClient as createServerClient } from "@/lib/supabase/server"
import { getRandomBotId } from "./bot"
import type { TebakQuestion } from "./queries"

import { getDailyTebakCount, getUserTier, getTierLimits } from "@/lib/tier"

export async function joinTebakQueue(): Promise<{ sessionId: string; playerRole: 'a' | 'b'; isNew: boolean; limitReached?: boolean; maxPerDay?: number }> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const tier = await getUserTier(user.id)
  const limits = getTierLimits(tier)
  const todayCount = await getDailyTebakCount(user.id)

  if (todayCount >= limits.maxTebakPerDay) {
    return { sessionId: "", playerRole: "a" as const, isNew: false, limitReached: true, maxPerDay: limits.maxTebakPerDay }
  }

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

  // Re-read question status to avoid race with cron timeout
  const { data: freshQ } = await supabase.from('tebak_questions').select('*').eq('id', questionId).single()
  if (!freshQ) return

  if (freshQ.status === 'both_answering') {
    // DISC round — bot picks random answer
    const answer = options[Math.floor(Math.random() * options.length)]
    const { error: insertError } = await supabase.from('tebak_answers').insert({
      question_id: questionId,
      guesser_id: botUserId,
      answer,
      is_correct: false,
      time_ms: Math.floor(Math.random() * 5000) + 2000,
    })
    if (!insertError) {
      // Check if both answered, reveal if so
      const { count } = await supabase.from('tebak_answers')
        .select('*', { count: 'exact', head: true })
        .eq('question_id', questionId)
      if (count && count >= 2) {
        await supabase.from('tebak_questions').update({
          status: 'revealed', advance_at: new Date(Date.now() + 6000).toISOString(),
        }).eq('id', questionId)
      }
    }
    return
  }

  if (isBotSubject && freshQ.status === 'subject_answering') {
    const answer = options[Math.floor(Math.random() * options.length)]
    const now = new Date()
    const deadline = new Date(now.getTime() + 15_000)

    await supabase.from('tebak_questions').update({
      correct_answer: answer,
      subject_answered_at: now.toISOString(),
      guesser_deadline: deadline.toISOString(),
      status: 'guesser_guessing',
    }).eq('id', questionId)
  } else if (freshQ.status === 'guesser_guessing') {
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
        col_name: isBotPlayerA ? 'score_a' : 'score_b',
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
): Promise<{ status: string; new_question: TebakQuestion | null } | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data, error } = await supabase.rpc('advance_tebak_game_v2', {
    p_session_id: sessionId,
    p_expected_seq: expectedSeq,
  })
  if (error) { 
    console.error('advanceGame RPC error:', error)
    throw error
  }
  return data as { status: string; new_question: TebakQuestion | null } | null
}

export async function startQuestionTimer(sessionId: string, seq: number): Promise<string | null> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const { data, error } = await supabase.rpc('start_question_timer', {
    p_session_id: sessionId,
    p_seq: seq,
  })
  if (error) { console.error('startQuestionTimer error', error); return null }
  return data as string | null
}

export async function submitSubjectAnswer(questionId: string, answer: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  const now = new Date()
  // +15.5s = 15s for the guesser + 500ms network latency buffer
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: q } = await supabase
    .from('tebak_questions')
    .select('correct_answer, guesser_deadline, round_id, sequence_number, status')
    .eq('id', questionId).single()

  if (!q?.correct_answer) throw new Error('Subject has not answered yet')

  // Idempotency guard: if already revealed (e.g. by cron handle_question_timeout
  // or a concurrent client call), skip silently to prevent double-score.
  if (q.status !== 'guesser_guessing') {
    return { isCorrect: false, points: 0 }
  }

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

  // Client-vs-client race guard: check if an answer was already inserted
  // by a concurrent submitGuesserAnswer call before we insert ours.
  // Note: .limit(1) not maybeSingle() because legacy data has duplicates
  // (pre-migration 708 cron inserted multiple __timeout__ rows per question).
  const { data: existingAnswers } = await supabase
    .from('tebak_answers')
    .select('id')
    .eq('question_id', questionId)
    .limit(1)

  if (existingAnswers && existingAnswers.length > 0) return { isCorrect: false, points: 0 }

  await supabase.from('tebak_answers').insert({
    question_id: questionId, guesser_id: guesserId,
    answer, is_correct: isCorrect, time_ms: timeTaken,
  })

  // Determine session context before scoring and setting advance_at
  const { data: r } = await supabase.from('tebak_rounds').select('session_id, round_number').eq('id', q.round_id).single()

  if (isCorrect && r) {
    const { data: session } = await supabase
      .from('tebak_sessions')
      .select('player_a_id')
      .eq('id', r.session_id)
      .single()

    if (session) {
      // Consistent with botPlayTurn pattern: compare guesserId to player_a_id
      const isPlayerA = session.player_a_id === guesserId
      await supabase.rpc('increment_tebak_score', {
        session_id: r.session_id,
        col_name: isPlayerA ? 'score_a' : 'score_b',
        amount: 10,
      })
    }
  }

  await supabase.from('tebak_questions').update({ status: 'revealed' }).eq('id', questionId)

  if (r) {
    const isLastQOfAnyRound = q.sequence_number === 5 && r.round_number < 4;
    await supabase.rpc('set_session_advance_at', { 
      p_session_id: r.session_id,
      p_delay_seconds: isLastQOfAnyRound ? 8 : 3
    })
  }

  return { isCorrect, points: isCorrect ? 10 : 0 }
}

export async function submitDiscAnswer(
  questionId: string, answer: string, startedAt: number
): Promise<{ status: 'answered' | 'revealed' | 'already_answered' }> {
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const { data: q, error: qError } = await supabase
    .from('tebak_questions')
    .select('round_id, sequence_number, status')
    .eq('id', questionId)
    .single()
  if (qError || !q) throw new Error('Question not found')

  if (q.status !== 'both_answering') return { status: 'already_answered' }

  const { data: round, error: roundError } = await supabase
    .from('tebak_rounds')
    .select('session_id')
    .eq('id', q.round_id)
    .single()
  if (roundError || !round) throw new Error('Round not found')

  const { data: session, error: sessionError } = await supabase
    .from('tebak_sessions')
    .select('player_a_id, player_b_id')
    .eq('id', round.session_id)
    .single()
  if (sessionError || !session) throw new Error('Session not found')

  // ═══ INSERT ATOMIK ═══
  // Bergantung pada UNIQUE(question_id, guesser_id). Duplikat → error 23505.
  // Prasyarat: ALTER TABLE tebak_answers ADD CONSTRAINT
  //   tebak_answers_question_guesser_unique UNIQUE (question_id, guesser_id);
  const { error: insertError } = await supabase
    .from('tebak_answers')
    .insert({
      question_id: questionId,
      guesser_id: user.id,
      answer,
      is_correct: null,
      time_ms: Date.now() - startedAt,
    })
  if (insertError) {
    if (insertError.code === '23505') return { status: 'already_answered' }
    console.error('submitDiscAnswer insert error:', insertError)
    throw insertError
  }

  // ═══ CEK KEDUA PEMAIN SUDAH JAWAB ═══
  // Cek eksplisit player_a DAN player_b — BUKAN count total.
  const { count: countA, error: countAError } = await supabase
    .from('tebak_answers')
    .select('*', { count: 'exact', head: true })
    .eq('question_id', questionId)
    .eq('guesser_id', session.player_a_id)
  if (countAError) throw countAError

  const { count: countB, error: countBError } = await supabase
    .from('tebak_answers')
    .select('*', { count: 'exact', head: true })
    .eq('question_id', questionId)
    .eq('guesser_id', session.player_b_id)
  if (countBError) throw countBError

  if (!countA || countA < 1 || !countB || countB < 1) return { status: 'answered' }

  // ═══ GUARD RACE: reveal hanya jika masih 'both_answering' ═══
  // handle_disc_timeout bisa reveal duluan → UPDATE kena 0 row → skip advance_at.
  const { data: revealed, error: revealError } = await supabase
    .from('tebak_questions')
    .update({ status: 'revealed' })
    .eq('id', questionId)
    .eq('status', 'both_answering')
    .select()
  if (revealError) throw revealError

  if (revealed && revealed.length > 0) {
    const delay = q.sequence_number === 10 ? 8 : 6
    const { error: advanceError } = await supabase.rpc('set_session_advance_at', {
      p_session_id: round.session_id,
      p_delay_seconds: delay,
    })
    if (advanceError) throw advanceError
  }

  return { status: 'revealed' }
}

export async function handleDiscTimeout(questionId: string): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase.rpc('handle_disc_timeout', {
    p_question_id: questionId,
  })
  if (error) {
    console.error('handleDiscTimeout RPC error:', error)
    throw error
  }
}

export async function signalMatchIntroReady(sessionId: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('tebak_sessions')
    .select('player_a_id, player_b_id')
    .eq('id', sessionId)
    .single()

  if (error || !session) throw new Error('Session not found')

  if (session.player_a_id === user.id) {
    await supabase.from('tebak_sessions').update({ player_a_ready: true }).eq('id', sessionId)
  } else if (session.player_b_id === user.id) {
    await supabase.from('tebak_sessions').update({ player_b_ready: true }).eq('id', sessionId)
  }
}

export async function resetReadyFlags(sessionId: string): Promise<void> {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('tebak_sessions')
    .update({ player_a_ready: false, player_b_ready: false })
    .eq('id', sessionId)
  if (error) throw error
}

export async function handleSubjectTimeout(questionId: string, _sessionId: string): Promise<void> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  await supabase.rpc('handle_question_timeout', {
    p_question_id: questionId,
  })
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

  // Notify opponent
  try {
    const { insertNotification } = await import("@/lib/notifications/insert")
    const { data: offerer } = await supabase.from("users").select("full_name").eq("id", user.id).single();
    await insertNotification({
      userId: opponentId, type: "tebak_rematch", title: "Rematch! 🎮",
      body: `${offerer?.full_name || "Lawanmu"} ingin bermain lagi. Terima atau tolak?`,
      data: { session_id: originalSessionId, offer_id: data.id }
    })
  } catch { /* non-critical */ }

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

