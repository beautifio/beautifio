"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, WifiOff } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import {
  submitSubjectAnswer,
  submitGuesserAnswer,
  handleSubjectTimeout,
  startQuestionTimer,
  advanceGame,
  botPlayTurn,
  replaceDisconnectedWithBot,
  updateUserHeartbeat,
} from "@/lib/tebak/actions"
import { Timer } from "./Timer"
import { DigitalClock } from "./DigitalClock"
import { MatchIntro } from "./MatchIntro"
import { ScoreBoard } from "./ScoreBoard"
import { JedaScreen } from "./JedaScreen"
import { RoundResultScreen } from "./RoundResultScreen"
import { WinnerScreen } from "./WinnerScreen"
import type { TebakSession, TebakQuestion, TebakAnswer } from "@/lib/tebak/queries"

type Props = {
  sessionId: string
  session: TebakSession
  userId: string
}

export function GameRoom({ sessionId, session: initialSession, userId }: Props) {
  const [gameSession, setGameSession] = useState<TebakSession>(initialSession)
  const [questions, setQuestions] = useState<TebakQuestion[]>([])
  const [currentQ, setCurrentQ] = useState<TebakQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)
  const [answers, setAnswers] = useState<TebakAnswer[]>([])
  const [opponentIsBot, setOpponentIsBot] = useState(false)
  const [disconnectMsg, setDisconnectMsg] = useState<string | null>(null)
  const [opponentName, setOpponentName] = useState<string | null>(null)
  const [myName, setMyName] = useState<string | null>(null)
  const [showIntro, setShowIntro] = useState(true)
  const [locked, setLocked] = useState(false)
  const [botThinking, setBotThinking] = useState(false)
  const guessStartTime = useRef(Date.now())
  const botPlayedRef = useRef<Set<string>>(new Set())
  const selectedAnswerRef = useRef<string | null>(null)
  const prevQuestionId = useRef<string | null>(null)
  const roundIdsRef = useRef<Set<string>>(new Set())
  const submittedRef = useRef(false)

  const isPlayerA = gameSession.player_a_id === userId
  const opponentId = isPlayerA ? gameSession.player_b_id : gameSession.player_a_id
  const isSubject = gameSession.current_subject === (isPlayerA ? "a" : "b")

  const refreshQuestions = useCallback(async () => {
    if (!supabase) { console.error('GameRoom: supabase null'); return }
    console.log('GameRoom: refreshQuestions, round=', gameSession.current_round, 'session=', sessionId, 'isSubject=', isSubject)
    const { data: round, error: roundErr } = await supabase
      .from("tebak_rounds")
      .select("id")
      .eq("session_id", sessionId)
      .eq("round_number", gameSession.current_round)
      .maybeSingle()
    if (roundErr) { console.error('GameRoom: round query error', roundErr); return }
    if (!round) { console.error('GameRoom: no round found for session', sessionId, 'round', gameSession.current_round); return }
    console.log('GameRoom: found round', round.id)

    const { data, error: qErr } = await supabase
      .from("tebak_questions")
      .select("*")
      .eq("round_id", round.id)
      .order("sequence_number")
    if (qErr) { console.error('GameRoom: questions query error', qErr); return }
    if (!data) { console.error('GameRoom: no data from questions query'); return }
    console.log('GameRoom: questions fetched', data.length, data)

    roundIdsRef.current = new Set(data.map((q: any) => q.round_id))
    setQuestions(data as TebakQuestion[])
    const activeRound = data.filter(
      (q: any) => q.status === "subject_answering" || q.status === "guesser_guessing"
    )
    const current = activeRound[0]
    setCurrentQ(current || null)
    if (current?.status === "guesser_guessing" && !isSubject) {
      guessStartTime.current = Date.now()
    }
  }, [sessionId, isSubject, gameSession.current_round])

  useEffect(() => {
    refreshQuestions()
  }, [refreshQuestions])

  // Retry fetching questions if still empty (race condition safety net)
  useEffect(() => {
    if (questions.length > 0) return
    const interval = setInterval(refreshQuestions, 2000)
    return () => clearInterval(interval)
  }, [questions.length, refreshQuestions])

  // Fetch opponent + current user info
  useEffect(() => {
    if (!supabase) return
    supabase.from("users").select("is_bot, full_name, avatar_url").eq("id", opponentId).single().then(({ data }) => {
      if (!data) return
      if (data.is_bot) setOpponentIsBot(true)
      if (data.full_name) setOpponentName(data.full_name)
    })
    supabase.from("users").select("full_name").eq("id", userId).single().then(({ data }) => {
      if (data?.full_name) setMyName(data.full_name)
    })
  }, [opponentId, userId])

  // Heartbeat + disconnect detection
  useEffect(() => {
    const hb = setInterval(() => updateUserHeartbeat(userId), 30_000)
    updateUserHeartbeat(userId)
    return () => clearInterval(hb)
  }, [userId])

  useEffect(() => {
    if (finished || opponentIsBot || disconnectMsg) return
    const check = setInterval(async () => {
      const { data: opp } = await supabase!
        .from("users")
        .select("last_active_at, is_bot")
        .eq("id", opponentId)
        .single()
      if (!opp || opp.is_bot) return
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      if (!opp.last_active_at || opp.last_active_at < fiveMinAgo) {
        setDisconnectMsg("Lawan terputus. Pemain lain mengambil alih...")
        await replaceDisconnectedWithBot(sessionId, opponentId)
        setOpponentIsBot(true)
        clearInterval(check)
      }
    }, 15_000)
    return () => clearInterval(check)
  }, [sessionId, opponentId, finished, opponentIsBot, disconnectMsg])

  // Bot auto-play
  useEffect(() => {
    if (!opponentIsBot || !currentQ || botThinking || !supabase) return

    const isBotTurn =
      (gameSession.current_subject === (isPlayerA ? "b" : "a") && currentQ.status === "subject_answering") ||
      (gameSession.current_subject !== (isPlayerA ? "b" : "a") && currentQ.status === "guesser_guessing")

    if (!isBotTurn) return
    if (botPlayedRef.current.has(currentQ.id)) return
    botPlayedRef.current.add(currentQ.id)

    setBotThinking(true)
    botPlayTurn(sessionId, currentQ.id, opponentId)
      .then(() => refreshQuestions())
      .catch(() => {})
      .finally(() => setBotThinking(false))
  }, [opponentIsBot, currentQ, botThinking, sessionId, opponentId, isPlayerA, gameSession.current_subject, refreshQuestions])

  // Reset locked/selection when question changes
  useEffect(() => {
    if (currentQ && currentQ.id !== prevQuestionId.current) {
      prevQuestionId.current = currentQ.id
      setLocked(false)
      setSelectedAnswer(null)
      selectedAnswerRef.current = null
      submittedRef.current = false
    }
  }, [currentQ])

  // Auto-start timer when a subject_answering question appears without deadline
  useEffect(() => {
    if (!currentQ || currentQ.status !== 'subject_answering') return
    if (currentQ.subject_deadline) return
    startQuestionTimer(sessionId, currentQ.sequence_number)
  }, [currentQ, sessionId])

  // Real-time subscriptions
  useEffect(() => {
    const unsub = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => {
        setGameSession(prev => ({ ...prev, ...s }))
        if (s.status === "finished") setFinished(true)
      },
      onQuestionUpdate: async (q) => {
        if (!roundIdsRef.current.has(q.round_id)) return
        setQuestions((prev) => {
          const exists = prev.some(p => p.id === q.id)
          if (!exists && q.sequence_number > 1) {
            setLocked(false)
            setSelectedAnswer(null)
            selectedAnswerRef.current = null
          }
          return prev.map((p) => (p.id === q.id ? q : p))
        })
        setCurrentQ(q)
        if (q.status === "guesser_guessing" && !isSubject) {
          guessStartTime.current = Date.now()
        }
        if (q.status === "revealed") {
          setRevealed(true)
        }
      },
      onAnswerSubmitted: (a) => {
        setAnswers((prev) => [...prev, a])
      },
    })
    return unsub
  }, [sessionId, isSubject])

  const handleSubjectAnswerTimeout = useCallback(() => {
    if (!currentQ) return
    handleSubjectTimeout(currentQ.id, sessionId)
  }, [currentQ, sessionId])

  const [showRoundResult, setShowRoundResult] = useState(false)

  const doAdvance = async () => {
    const currentSeq = gameSession.current_q_seq
    setRevealed(false)
    setLocked(false)
    selectedAnswerRef.current = null
    submittedRef.current = false
    setSelectedAnswer(null)
    const result = await advanceGame(sessionId, currentSeq)
    if (result?.status === 'game_finished') {
      setFinished(true)
      return
    }
    await refreshQuestions()
  }

  const handleAdvance = () => {
    if (currentQ?.sequence_number === 5 && gameSession.current_round === 1) {
      setShowRoundResult(true)
      return
    }
    doAdvance()
  }

  const handleRoundResultComplete = () => {
    setShowRoundResult(false)
    doAdvance()
  }

  const handleSubjectAnswer = async (answer: string) => {
    if (!currentQ || submitting) return
    setSubmitting(true)
    setSelectedAnswer(answer)
    try {
      await submitSubjectAnswer(currentQ.id, answer)
    } catch {} finally {
      setSubmitting(false)
    }
  }

  const handleGuesserGuess = async (answer: string) => {
    if (!currentQ || locked || submittedRef.current) return
    if (currentQ.status !== "guesser_guessing") return
    submittedRef.current = true
    setSelectedAnswer(answer)
    setLocked(true)
    setTension(true)
    tensionStartRef.current = Date.now()
    try {
      await submitGuesserAnswer(currentQ.id, userId, answer, guessStartTime.current)
    } catch (e) {
      submittedRef.current = false
      setLocked(false)
      setTension(false)
      console.error("submitGuesserAnswer error", e)
    }
  }

  const [tension, setTension] = useState(false)
  const tensionStartRef = useRef(0)

  useEffect(() => {
    if (!tension) return
    const minDuration = 1500
    const elapsed = Date.now() - tensionStartRef.current
    const remaining = Math.max(0, minDuration - elapsed)
    const t = setTimeout(() => {
      setTension(false)
    }, remaining)
    return () => clearTimeout(t)
  }, [tension])

  const handleTensionDone = useCallback(() => {
    setTension(false)
  }, [])

  const handleGuesserTimeout = async () => {
    if (locked || submittedRef.current) return
    setLocked(true)
    if (!currentQ) return
    try {
      await submitGuesserAnswer(currentQ.id, userId, "__timeout__", guessStartTime.current)
    } catch (e) {
      console.error("handleGuesserTimeout error", e)
    }
  }

  const myDots = questions.map(q => {
    const a = answers.find(ans => ans.question_id === q.id && ans.guesser_id === userId)
    if (!a) return null
    return a.is_correct ?? null
  })
  const theirDots = questions.map(q => {
    const a = answers.find(ans => ans.question_id === q.id && ans.guesser_id === opponentId)
    if (!a) return null
    return a.is_correct ?? null
  })
  const guesserAnswers = answers.filter(a => a.is_correct != null)
  const myGuesses = guesserAnswers.filter(a => a.guesser_id === userId)
  const correctCount = myGuesses.filter(a => a.is_correct).length
  const totalCount = myGuesses.length
  const compatibility = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

  const currentAnswer = currentQ
    ? answers.find(a => a.question_id === currentQ.id && a.guesser_id === (isSubject ? opponentId : userId))
    : undefined
  const guesserIsCorrect = currentAnswer?.is_correct ?? null
  const guesserAnswerText = currentAnswer?.answer ?? null

  let resultType: 'correct' | 'wrong' | 'subject_timeout' | 'guesser_timeout' = 'correct'
  if (revealed && currentQ) {
    if (!currentQ.subject_answered_at) {
      resultType = 'subject_timeout'
    } else if (guesserAnswerText === '__timeout__') {
      resultType = 'guesser_timeout'
    } else if (guesserIsCorrect === true) {
      resultType = 'correct'
    } else {
      resultType = 'wrong'
    }
  }

  const handleBegin = useCallback(() => {
    setShowIntro(false)
    refreshQuestions()
  }, [refreshQuestions])

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Disconnect banner */}
      {disconnectMsg && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs font-medium">
          <WifiOff size={14} />
          {disconnectMsg}
        </div>
      )}

      {/* Header */}
      <div className="bg-surface border-b border-border">
        <ScoreBoard
          scoreA={gameSession.score_a}
          scoreB={gameSession.score_b}
          round={gameSession.current_round}
          isPlayerA={isPlayerA}
          myName={myName}
          opponentName={opponentName}
          myDots={myDots}
          theirDots={theirDots}
        />
      </div>

      {showIntro ? (
        <MatchIntro
          myName={myName}
          opponentName={opponentName}
          onBegin={handleBegin}
        />
      ) : finished ? (
        <WinnerScreen
          session={gameSession}
          isPlayerA={isPlayerA}
          opponentName={opponentName}
          myName={myName}
          compatibility={compatibility}
          onRematch={() => window.location.href = "/tebak"}
          onHome={() => window.location.href = "/"}
        />
      ) : showRoundResult ? (
        <RoundResultScreen
          session={gameSession}
          round={1}
          answers={answers}
          questions={questions}
          isPlayerA={isPlayerA}
          myName={myName}
          opponentName={opponentName}
          onComplete={handleRoundResultComplete}
        />
      ) : tension ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">Membuka jawaban...</h3>
            <p className="text-sm text-text-secondary">
              {isSubject ? `${opponentName || 'Lawan'} sedang menebak` : `Menunggu hasil tebakan`}
            </p>
          </div>
        </div>
      ) : revealed && currentQ ? (
        <JedaScreen
          resultType={resultType}
          subjectName={isSubject ? myName : opponentName}
          guesserName={isSubject ? opponentName : myName}
          correctAnswer={currentQ.correct_answer ?? ''}
          myScore={isPlayerA ? gameSession.score_a : gameSession.score_b}
          theirScore={isPlayerA ? gameSession.score_b : gameSession.score_a}
          isLastQuestion={currentQ.sequence_number === 5}
          isLastRound={gameSession.current_round === 2}
          onComplete={handleAdvance}
        />
      ) : currentQ ? (
          <QuestionView
            question={currentQ}
            isSubject={isSubject}
            selectedAnswer={selectedAnswer}
            submitting={submitting}
            locked={locked}
            onSubjectAnswer={handleSubjectAnswer}
            onGuesserGuess={handleGuesserGuess}
            onGuesserTimeout={handleGuesserTimeout}
            onSubjectTimeout={handleSubjectAnswerTimeout}
          />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}
    </div>
  )
}

function QuestionView({
  question,
  isSubject,
  selectedAnswer,
  submitting,
  locked,
  onSubjectAnswer,
  onGuesserGuess,
  onGuesserTimeout,
  onSubjectTimeout,
}: {
  question: TebakQuestion
  isSubject: boolean
  selectedAnswer: string | null
  submitting: boolean
  locked: boolean
  onSubjectAnswer: (a: string) => void
  onGuesserGuess: (a: string) => void
  onGuesserTimeout: () => void
  onSubjectTimeout: () => void
}) {
  const myTurn = isSubject
    ? question.status === "subject_answering"
    : question.status === "guesser_guessing"

  return (
    <div className="flex-1 flex flex-col px-4 py-4">
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-accent via-primary to-secondary" />

        <div className="p-5">
          <div className="text-center mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Pertanyaan {question.sequence_number}/5
            </span>
          </div>

          <h2 className="text-lg font-bold text-text-primary text-center mb-5">
            {question.question_text}
          </h2>

          <div className="space-y-3 mb-5">
            {(question.options as string[]).map((opt) => {
              const isSelected = selectedAnswer === opt && !submitting

              let btnStyle = "border-border bg-surface"
              if (isSelected) btnStyle = "border-primary bg-primary/5"
              if (myTurn) btnStyle += " active:scale-[0.98] active:bg-primary/10 transition-all duration-75"

              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (!myTurn) return
                    if (isSubject) {
                      if (submitting) return
                      onSubjectAnswer(opt)
                    } else {
                      if (locked) return
                      onGuesserGuess(opt)
                    }
                  }}
                  disabled={!myTurn}
                  className={`w-full text-left min-h-[56px] py-4 px-5 rounded-xl border-2 ${
                    myTurn ? "cursor-pointer" : "cursor-default opacity-60"
                  } ${btnStyle}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                    </div>
                    <span className="text-base font-medium text-text-primary leading-tight">
                      {opt}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {question.status === "subject_answering" && question.subject_deadline && (
            <div className="mb-4">
              <DigitalClock
                deadline={question.subject_deadline}
                onTimeout={onSubjectTimeout}
                label={isSubject ? "Jawab sebelum waktu habis" : "Menunggu lawan menjawab"}
              />
            </div>
          )}

          {question.status === "guesser_guessing" && question.guesser_deadline && (
            <div className="mb-4">
              {isSubject ? (
                <DigitalClock
                  deadline={question.guesser_deadline}
                  onTimeout={() => {}}
                  label="Menunggu lawan menebak"
                />
              ) : (
                <Timer
                  deadline={question.guesser_deadline}
                  onTimeout={onGuesserTimeout}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


