"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, WifiOff, Volume2, VolumeX } from "lucide-react"
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
import { useSound } from "@/lib/tebak/use-sound"
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
  const [isAdvancing, setIsAdvancing] = useState(false)
  const guessStartTime = useRef(Date.now())
  const botPlayedRef = useRef<Set<string>>(new Set())
  const selectedAnswerRef = useRef<string | null>(null)
  const prevQuestionId = useRef<string | null>(null)
  const roundIdsRef = useRef<Set<string>>(new Set())
  const submittedRef = useRef(false)
  const advancingRef = useRef(false)
  const currentQSeqRef = useRef<number | null>(null)
  const lastAnswerRef = useRef<TebakAnswer | null>(null)
  const { play, isMuted, toggleMute } = useSound()

  const isPlayerA = gameSession.player_a_id === userId
  const opponentId = isPlayerA ? gameSession.player_b_id : gameSession.player_a_id
  const isSubject = gameSession.current_subject === (isPlayerA ? "a" : "b")

  const subjectName = isSubject ? myName : opponentName

  const refreshQuestions = useCallback(async (roundOverride?: number) => {
    if (!supabase) { console.error('GameRoom: supabase null'); return }
    const roundNum = roundOverride ?? gameSession.current_round
    const { data: round, error: roundErr } = await supabase
      .from("tebak_rounds")
      .select("id")
      .eq("session_id", sessionId)
      .eq("round_number", roundNum)
      .maybeSingle()
    if (roundErr) { console.error('GameRoom: round query error', roundErr); return }
    if (!round) { console.error('GameRoom: no round found for session', sessionId, 'round', roundNum); return }

    const { data, error: qErr } = await supabase
      .from("tebak_questions")
      .select("*")
      .eq("round_id", round.id)
      .order("sequence_number")
    if (qErr) { console.error('GameRoom: questions query error', qErr); return }
    if (!data) { console.error('GameRoom: no data from questions query'); return }

    roundIdsRef.current = new Set(data.map((q: any) => q.round_id))
    setQuestions(data as TebakQuestion[])
    const activeRound = data.filter(
      (q: any) => q.status === "subject_answering" || q.status === "guesser_guessing"
    )
    const current = activeRound[0]
    setCurrentQ(current || null)
    if (current) {
      currentQSeqRef.current = current.sequence_number
    }
    if (current?.status === "guesser_guessing" && !isSubject) {
      guessStartTime.current = Date.now()
    }
  }, [sessionId, isSubject, gameSession.current_round])

  useEffect(() => {
    refreshQuestions()
  }, [refreshQuestions])

  useEffect(() => {
    if (questions.length > 0) return
    const interval = setInterval(refreshQuestions, 2000)
    return () => clearInterval(interval)
  }, [questions.length, refreshQuestions])

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

  useEffect(() => {
    if (currentQ && currentQ.id !== prevQuestionId.current) {
      prevQuestionId.current = currentQ.id
      setLocked(false)
      setSelectedAnswer(null)
      selectedAnswerRef.current = null
      submittedRef.current = false
      play('tap')
    }
  }, [currentQ, play])

  useEffect(() => {
    if (!currentQ || currentQ.status !== 'subject_answering') return
    if (currentQ.subject_deadline) return
    startQuestionTimer(sessionId, currentQ.sequence_number)
  }, [currentQ, sessionId])

  useEffect(() => {
    const unsub = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => {
        setGameSession(prev => ({ ...prev, ...s }))
        if (s.status === "finished") setFinished(true)
      },
      onQuestionUpdate: async (q) => {
        if (advancingRef.current) return /* Bug #1: ignore all updates during advance */
        if (!roundIdsRef.current.has(q.round_id)) return
        /* Bug #2: only accept if it's the currently active question */
        if (q.sequence_number !== currentQSeqRef.current) return
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
        if (q.status === "revealed" && !advancingRef.current) {
          setRevealed(true)
        }
      },
      onAnswerSubmitted: (a) => {
        setAnswers((prev) => [...prev, a])
        lastAnswerRef.current = a
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
    setIsAdvancing(true)
    advancingRef.current = true /* Bug #1: lock subscription guard */
    setRevealed(false)
    setCurrentQ(null)

    const result = await advanceGame(sessionId, currentSeq)
    if (result?.status === 'game_finished') {
      setFinished(true)
      setIsAdvancing(false)
      advancingRef.current = false
      return
    }
    /* Update session state before refreshQuestions so it queries correct round */
    if (result?.current_round != null) {
      setGameSession(prev => ({
        ...prev,
        current_round: result.current_round!,
        current_q_seq: result.current_q_seq ?? prev.current_q_seq,
      }))
    }
    await refreshQuestions(result?.current_round)

    setIsAdvancing(false)
    advancingRef.current = false /* unlock */
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
    play('submit')
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
    play('submit')
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

  /* Play correct/wrong/timeout sound when revealed changes to true */
  useEffect(() => {
    if (!revealed || !currentQ) return
    const ans = currentAnswer ?? lastAnswerRef.current
    if (!currentQ.subject_answered_at || ans?.answer === '__timeout__' || ans?.answer === '__subject_timeout__') {
      play('timeout')
    } else if (ans?.is_correct === true) {
      play('correct')
    } else if (ans?.is_correct === false) {
      play('wrong')
    }
  }, [revealed])

  /* Play winner/lose sound when game finishes */
  useEffect(() => {
    if (!finished) return
    const myScore = isPlayerA ? gameSession.score_a : gameSession.score_b
    const theirScore = isPlayerA ? gameSession.score_b : gameSession.score_a
    if (myScore > theirScore) {
      play('winner')
    } else if (myScore < theirScore) {
      play('lose')
    }
  }, [finished])

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

  /* Build question text for the player's role */
  const questionText = currentQ
    ? isSubject
      ? currentQ.question_text
      : (currentQ.question_for_guesser ?? currentQ.question_text).replace(/\{NamaSubject\}/g, subjectName ?? 'Lawan')
    : ''

  /* Role label */
  const roleLabel = currentQ
    ? isSubject
      ? { icon: '🎯', text: 'Pertanyaan untukmu' }
      : currentQ.status === 'guesser_guessing'
        ? { icon: '🔍', text: `Tebaklah pikiran ${subjectName ?? 'Lawan'}` }
        : { icon: '🔍', text: `Apa yang sedang dipikirkan ${subjectName ?? 'Lawan'}?` }
    : null

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm border border-border flex items-center justify-center cursor-pointer shadow-sm hover:bg-white transition-colors"
        aria-label={isMuted() ? 'Unmute' : 'Mute'}
      >
        {isMuted() ? <VolumeX size={16} className="text-text-secondary" /> : <Volume2 size={16} className="text-text-secondary" />}
      </button>

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
      ) : tension && !revealed ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden animate-fadeIn">
          {/* Dark overlay fade in */}
          <div className="absolute inset-0 bg-black/40 animate-fadeIn" style={{ animationDuration: '0.2s' }} />
          {/* Center card */}
          <div className="relative z-10 animate-scaleIn">
            <div className="bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden p-10 text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 animate-pulse">
                <span className="text-4xl">?</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">
                Membuka jawaban {subjectName ?? 'Lawan'}...
              </h3>
              <p className="text-sm text-text-secondary">
                {isSubject ? `${opponentName || 'Lawan'} sedang menebak` : `Menunggu hasil tebakan`}
              </p>
            </div>
          </div>
        </div>
      ) : revealed && currentQ ? (
        <div className="animate-fadeSlideUp flex-1 flex flex-col">
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
        </div>
      ) : isAdvancing ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fadeIn">
          <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden p-8 text-center">
            <div className="flex gap-1.5 items-center justify-center mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm text-text-secondary">Menyiapkan pertanyaan berikutnya...</p>
          </div>
        </div>
      ) : currentQ ? (
        <div className="animate-fadeSlideUp flex-1 flex flex-col">
          <QuestionView
            question={currentQ}
            isSubject={isSubject}
            selectedAnswer={selectedAnswer}
            submitting={submitting}
            locked={locked}
            questionText={questionText}
            roleLabel={roleLabel}
            onSubjectAnswer={handleSubjectAnswer}
            onGuesserGuess={handleGuesserGuess}
            onGuesserTimeout={handleGuesserTimeout}
            onSubjectTimeout={handleSubjectAnswerTimeout}
          />
        </div>
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
  questionText,
  roleLabel,
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
  questionText: string
  roleLabel: { icon: string; text: string } | null
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
          {/* Question number + role label */}
          <div className="text-center mb-3 space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Pertanyaan {question.sequence_number}/5
            </span>
            {roleLabel && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary">
                <span>{roleLabel.icon}</span>
                <span>{roleLabel.text}</span>
              </div>
            )}
          </div>

          <h2 className="text-lg font-bold text-text-primary text-center mb-5 leading-relaxed">
            {questionText}
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
                    />
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
                isUrgent
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
