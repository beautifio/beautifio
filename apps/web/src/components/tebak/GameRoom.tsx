"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, X, HelpCircle, Trophy, ArrowRight, Loader2, WifiOff } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import {
  submitSubjectAnswer,
  submitGuesserAnswer,
  advanceGame,
  botPlayTurn,
  replaceDisconnectedWithBot,
  updateUserHeartbeat,
} from "@/lib/tebak/actions"
import { Timer } from "./Timer"
import { DigitalClock } from "./DigitalClock"
import { MatchIntro } from "./MatchIntro"
import { ScoreBoard } from "./ScoreBoard"
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
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null)
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
    }
  }, [currentQ])

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

  const handleAdvance = async () => {
    setSelectedAnswer(null)
    setRevealed(false)
    setLastAnswerCorrect(null)
    setLocked(false)
    selectedAnswerRef.current = null
    await advanceGame(sessionId)
    await refreshQuestions()
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

  const handleGuesserGuess = (answer: string) => {
    if (!currentQ || locked) return
    setSelectedAnswer(answer)
    selectedAnswerRef.current = answer
  }

  const handleGuesserTimeout = async () => {
    if (locked) return
    setLocked(true)
    if (!currentQ) return
    const answer = selectedAnswerRef.current || "__timeout__"
    try {
      const result = await submitGuesserAnswer(currentQ.id, userId, answer, guessStartTime.current)
      if (result) setLastAnswerCorrect(result.isCorrect)
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
        <ResultScreen
          session={gameSession}
          isPlayerA={isPlayerA}
          opponentName={opponentName}
          compatibility={compatibility}
          onBack={() => window.location.href = "/tebak"}
        />
      ) : currentQ ? (
        <QuestionView
          question={currentQ}
          isSubject={isSubject}
          selectedAnswer={selectedAnswer}
          submitting={submitting}
          locked={locked}
          revealed={revealed}
          lastAnswerCorrect={lastAnswerCorrect}
          onSubjectAnswer={handleSubjectAnswer}
          onGuesserGuess={handleGuesserGuess}
          onGuesserTimeout={handleGuesserTimeout}
          onAdvance={handleAdvance}
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
  revealed,
  lastAnswerCorrect,
  onSubjectAnswer,
  onGuesserGuess,
  onGuesserTimeout,
  onAdvance,
}: {
  question: TebakQuestion
  isSubject: boolean
  selectedAnswer: string | null
  submitting: boolean
  locked: boolean
  revealed: boolean
  lastAnswerCorrect: boolean | null
  onSubjectAnswer: (a: string) => void
  onGuesserGuess: (a: string) => void
  onGuesserTimeout: () => void
  onAdvance: () => void
}) {
  const waitingForSubject = question.status === "subject_answering" && !isSubject
  const waitingForGuesser = question.status === "guesser_guessing" && isSubject
  const needAction = isSubject
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

          <div className="space-y-2.5 mb-5">
            {(question.options as string[]).map((opt) => {
              const isSelected = selectedAnswer === opt
              const isCorrect = revealed && opt === question.correct_answer
              const isWrong = revealed && isSelected && opt !== question.correct_answer

              let btnStyle = "border-border bg-surface hover:border-primary/30"
              if (isSelected && !revealed) btnStyle = "border-primary bg-primary/5"
              if (isCorrect) btnStyle = "border-green-500 bg-green-50"
              if (isWrong) btnStyle = "border-red-500 bg-red-50"

              return (
                <button
                  key={opt}
                  onClick={() => {
                    if (revealed) return
                    if (isSubject) {
                      if (submitting) return
                      onSubjectAnswer(opt)
                    } else {
                      if (locked) return
                      onGuesserGuess(opt)
                    }
                  }}
                  disabled={(isSubject ? submitting : locked) || revealed || !needAction}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    revealed ? "cursor-default" : ""
                  } ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected && !revealed
                          ? "border-primary bg-primary"
                          : isCorrect
                          ? "border-green-500 bg-green-500"
                          : isWrong
                          ? "border-red-500 bg-red-500"
                          : "border-border"
                      }`}
                    >
                      {(isSelected || isCorrect || isWrong) && (
                        isCorrect ? <Check size={12} className="text-white" /> :
                        isWrong ? <X size={12} className="text-white" /> : null
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      revealed && opt === question.correct_answer
                        ? "text-green-700"
                        : revealed && isWrong
                        ? "text-red-700"
                        : "text-text-primary"
                    }`}>
                      {opt}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {question.status === "guesser_guessing" && question.guesser_deadline && !revealed && (
            <div className="mb-4">
              {isSubject ? (
                <div className="flex flex-col items-center gap-3">
                  <DigitalClock
                    deadline={question.guesser_deadline}
                    onTimeout={() => {}}
                    label="Menunggu lawan menebak"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Timer
                    deadline={question.guesser_deadline}
                    onTimeout={onGuesserTimeout}
                  />
                </div>
              )}
            </div>
          )}

          {waitingForSubject && (
            <div className="flex flex-col items-center gap-2 py-6 text-text-secondary">
              <Loader2 size={20} className="animate-spin" />
              <p className="text-sm">Menunggu lawan menjawab</p>
            </div>
          )}

          {revealed && (
            <div className="text-center mb-4 animate-in fade-in slide-in-from-bottom-1 duration-400">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                lastAnswerCorrect === true
                  ? "bg-green-100 text-green-700"
                  : lastAnswerCorrect === false
                  ? "bg-red-100 text-red-700"
                  : "bg-primary/10 text-primary"
              }`}>
                {lastAnswerCorrect === true ? (
                  <><Check size={18} /> Benar! +10 poin</>
                ) : lastAnswerCorrect === false ? (
                  <><X size={18} /> Salah</>
                ) : (
                  <><HelpCircle size={18} /> Lawan sudah menjawab</>
                )}
              </div>
              {!isSubject && lastAnswerCorrect !== true && question.correct_answer && (
                <p className="text-sm text-text-secondary mt-2">
                  Jawaban: <span className="font-bold text-green-600">{question.correct_answer}</span>
                </p>
              )}
            </div>
          )}

          {revealed && (
            <button
              onClick={onAdvance}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer mt-auto"
            >
              {question.sequence_number < 5 ? "Pertanyaan Selanjutnya" : "Selesai Round Ini"}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultScreen({
  session,
  isPlayerA,
  opponentName,
  compatibility,
  onBack,
}: {
  session: TebakSession
  isPlayerA: boolean
  opponentName: string | null
  compatibility: number
  onBack: () => void
}) {
  const myScore = isPlayerA ? session.score_a : session.score_b
  const theirScore = isPlayerA ? session.score_b : session.score_a
  const isWin = myScore > theirScore
  const isDraw = myScore === theirScore

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
        isWin ? "bg-yellow-100" : isDraw ? "bg-blue-100" : "bg-gray-100"
      }`}>
        <Trophy size={40} className={isWin ? "text-yellow-500" : isDraw ? "text-blue-500" : "text-gray-400"} />
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">
        {isWin ? "Kamu Menang!" : isDraw ? "Seri!" : "Kamu Kalah"}
      </h2>
      <p className="text-sm text-text-secondary mb-8">
        Skor akhir: {myScore} - {theirScore}
      </p>

      <div className="w-full max-w-xs space-y-3 mb-6">
        <div className="flex justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-sm text-text-secondary">Kamu</span>
          <span className="text-sm font-bold text-text-primary">{myScore} poin</span>
        </div>
        <div className="flex justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-sm text-text-secondary">{opponentName || "Lawan"}</span>
          <span className="text-sm font-bold text-text-primary">{theirScore} poin</span>
        </div>
      </div>

      {/* Compatibility */}
      <div className="w-full max-w-xs mb-8">
        <div className="p-5 rounded-xl bg-surface border border-border text-center">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary mb-3">
            Tingkat Kecocokan
          </p>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                compatibility <= 30 ? "bg-red-400" : compatibility <= 60 ? "bg-orange-400" : compatibility <= 85 ? "bg-green-400" : "bg-accent"
              }`}
              style={{ width: `${compatibility}%` }}
            />
          </div>
          <p className={`text-sm font-bold ${
            compatibility <= 30 ? "text-red-500" : compatibility <= 60 ? "text-orange-500" : compatibility <= 85 ? "text-green-600" : "text-accent"
          }`}>
            {compatibility <= 30 ? "Kurang cocok" : compatibility <= 60 ? "Cukup cocok" : compatibility <= 85 ? "Cocok!" : "Soulmate! 😱"}
          </p>
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full max-w-xs py-3.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
      >
        Main Lagi
      </button>
    </div>
  )
}
