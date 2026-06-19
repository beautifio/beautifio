"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, X, HelpCircle, Trophy, ArrowRight, Loader2, User } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import {
  submitSubjectAnswer,
  submitGuesserAnswer,
  advanceGame,
} from "@/lib/tebak/actions"
import { Timer } from "./Timer"
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
  const guessStartTime = useRef(Date.now())

  const isPlayerA = gameSession.player_a_id === userId
  const isSubject = gameSession.current_subject === (isPlayerA ? "a" : "b")

  // Helper untuk mendapatkan data terbaru
  const refreshQuestions = useCallback(async () => {
    if (!supabase) return
    const s = supabase.from("tebak_questions")
      .select("*, tebak_rounds!inner(session_id)")
      .eq("tebak_rounds.session_id", sessionId)
    if (s) {
      const { data } = await s.order("sequence_number")
      if (data) {
        setQuestions(data as TebakQuestion[])
        const activeRound = data.filter(
          (q: any) => !isSubject
            ? q.status === "guesser_guessing" || q.status === "subject_answering"
            : q.status === "subject_answering" || q.status === "guesser_guessing"
        )
        const current = activeRound[0]
        setCurrentQ(current || null)
        if (current?.status === "guesser_guessing" && !isSubject) {
          guessStartTime.current = Date.now()
        }
      }
    }
  }, [sessionId, isSubject])

  useEffect(() => {
    refreshQuestions()
  }, [refreshQuestions])

  // Real-time subscriptions
  useEffect(() => {
    const unsub = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => {
        setGameSession(s)
        if (s.status === "finished") setFinished(true)
      },
      onQuestionUpdate: async (q) => {
        setQuestions((prev) => prev.map((p) => (p.id === q.id ? q : p)))
        if (q.status === "guesser_guessing" && !isSubject) {
          setCurrentQ(q)
          guessStartTime.current = Date.now()
        }
        if (q.status === "revealed") {
          setRevealed(true)
          setCurrentQ(q)
        }
      },
      onAnswerSubmitted: (a) => {
        setAnswers((prev) => [...prev, a])
      },
    })
    return unsub
  }, [sessionId, isSubject])

  // Unguess advance game
  const handleAdvance = async () => {
    setSelectedAnswer(null)
    setRevealed(false)
    setLastAnswerCorrect(null)
    await advanceGame(sessionId)
    await refreshQuestions()
  }

  // Subject answers
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

  // Guesser guesses
  const handleGuesserGuess = async (answer: string) => {
    if (!currentQ || submitting) return
    setSubmitting(true)
    setSelectedAnswer(answer)
    try {
      const result = await submitGuesserAnswer(currentQ.id, userId, answer, guessStartTime.current)
      setLastAnswerCorrect(result.isCorrect)
    } catch {} finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Header */}
      <div className="bg-surface border-b border-border">
        <ScoreBoard
          scoreA={gameSession.score_a}
          scoreB={gameSession.score_b}
          round={gameSession.current_round}
          isPlayerA={isPlayerA}
        />
      </div>

      {finished ? (
        <ResultScreen
          session={gameSession}
          isPlayerA={isPlayerA}
          onBack={() => window.location.href = "/tebak"}
        />
      ) : currentQ ? (
        <QuestionView
          question={currentQ}
          isSubject={isSubject}
          selectedAnswer={selectedAnswer}
          submitting={submitting}
          revealed={revealed}
          lastAnswerCorrect={lastAnswerCorrect}
          onSubjectAnswer={handleSubjectAnswer}
          onGuesserGuess={handleGuesserGuess}
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
  revealed,
  lastAnswerCorrect,
  onSubjectAnswer,
  onGuesserGuess,
  onAdvance,
}: {
  question: TebakQuestion
  isSubject: boolean
  selectedAnswer: string | null
  submitting: boolean
  revealed: boolean
  lastAnswerCorrect: boolean | null
  onSubjectAnswer: (a: string) => void
  onGuesserGuess: (a: string) => void
  onAdvance: () => void
}) {
  const waitingForSubject = question.status === "subject_answering" && !isSubject
  const waitingForGuesser = question.status === "guesser_guessing" && isSubject
  const needAction = isSubject
    ? question.status === "subject_answering"
    : question.status === "guesser_guessing"

  return (
    <div className="flex-1 flex flex-col px-4 py-6">
      {/* Question number */}
      <div className="text-center mb-2">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          Pertanyaan {question.sequence_number}/5
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg font-bold text-text-primary text-center mb-6">
        {question.question_text}
      </h2>

      {/* Options */}
      <div className="space-y-2.5 mb-8">
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
                if (submitting || revealed) return
                if (isSubject) onSubjectAnswer(opt)
                else onGuesserGuess(opt)
              }}
              disabled={submitting || revealed || !needAction}
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

      {/* Timer for guesser */}
      {question.status === "guesser_guessing" && question.guesser_deadline && !isSubject && !revealed && (
        <div className="mb-6">
          <Timer
            deadline={question.guesser_deadline}
            onTimeout={() => {
              if (!selectedAnswer) onGuesserGuess("__timeout__")
            }}
          />
        </div>
      )}

      {/* Waiting states */}
      {waitingForSubject && (
        <div className="flex flex-col items-center gap-2 py-6 text-text-secondary">
          <Loader2 size={20} className="animate-spin" />
          <p className="text-sm">Menunggu lawan menjawab</p>
        </div>
      )}

      {waitingForGuesser && (
        <div className="flex flex-col items-center gap-2 py-6 text-text-secondary">
          <Loader2 size={20} className="animate-spin" />
          <p className="text-sm">Menunggu lawan menebak</p>
        </div>
      )}

      {/* Reveal result */}
      {revealed && (
        <div className="text-center mb-6">
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
          {!isSubject && lastAnswerCorrect !== true && (
            <p className="text-sm text-text-secondary mt-2">
              Jawaban: <span className="font-bold text-green-600">{question.correct_answer}</span>
            </p>
          )}
        </div>
      )}

      {/* Advance button */}
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
  )
}

function ResultScreen({
  session,
  isPlayerA,
  onBack,
}: {
  session: TebakSession
  isPlayerA: boolean
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

      <div className="w-full max-w-xs space-y-3 mb-8">
        <div className="flex justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-sm text-text-secondary">Kamu</span>
          <span className="text-sm font-bold text-text-primary">{myScore} poin</span>
        </div>
        <div className="flex justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-sm text-text-secondary">Lawan</span>
          <span className="text-sm font-bold text-text-primary">{theirScore} poin</span>
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
