"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, WifiOff, Volume2, VolumeX } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import {
  submitSubjectAnswer,
  submitGuesserAnswer,
  handleSubjectTimeout as handleSubjectTimeoutAction,
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

// --- Helper Functions ---
const findActiveQuestion = (questions: TebakQuestion[], session: TebakSession) => {
  if (!questions) return null
  return questions.find(q =>
    (q.status === 'subject_answering' || q.status === 'guesser_guessing') &&
    q.sequence_number === session.current_q_seq
  ) ?? null
}

const findRevealedQuestion = (questions: TebakQuestion[], session: TebakSession) => {
  if (!questions) return null
  return questions.find(q =>
    q.status === 'revealed' &&
    q.sequence_number === session.current_q_seq
  ) ?? null
}

type Props = {
  sessionId: string
  session: TebakSession
  userId: string
}

// --- Main Component ---
export function GameRoom({ sessionId, session: initialSession, userId }: Props) {
  const router = useRouter()

  // --- State & Refs ---
  const [gameSession, setGameSession] = useState<TebakSession>(initialSession)
  const [questions, setQuestions] = useState<TebakQuestion[]>([])
  const [answers, setAnswers] = useState<TebakAnswer[]>([])
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [locked, setLocked] = useState(false)
  const [tension, setTension] = useState(false)
  const [botThinking, setBotThinking] = useState(false)
  
  const [opponentIsBot, setOpponentIsBot] = useState(false)
  const [opponentName, setOpponentName] = useState<string | null>(null)
  const [myName, setMyName] = useState<string | null>(null)
  
  const [showIntro, setShowIntro] = useState(initialSession.status === 'waiting')
  const [hasMounted, setHasMounted] = useState(false)

  const { play, isMuted, toggleMute } = useSound()
  const botPlayedRef = useRef<Set<string>>(new Set())
  const prevQuestionId = useRef<string | null>(null)
  const submittedRef = useRef(false)
  const tensionStartRef = useRef(0)
  const advancingRef = useRef(false)
  
  // --- Derived State ---
  const isPlayerA = gameSession.player_a_id === userId
  const opponentId = isPlayerA ? gameSession.player_b_id : gameSession.player_a_id
  const isSubject = gameSession.current_subject === (isPlayerA ? "a" : "b")
  const subjectName = isSubject ? myName : opponentName
  
  const currentQ = findActiveQuestion(questions, gameSession)
  const revealedQ = findRevealedQuestion(questions, gameSession)

  const isFinished = gameSession.status === 'finished'
  const isShowingJeda = !!gameSession.advance_at && !!revealedQ && !(revealedQ.sequence_number === 5 && gameSession.current_round === 1)
  const isShowingRoundResult = !!gameSession.advance_at && !!revealedQ && revealedQ.sequence_number === 5 && gameSession.current_round === 1
  const isLoading = !currentQ && !revealedQ && !isFinished && !showIntro

  // --- Data Sync ---
  const syncFullState = useCallback(async () => {
    if (!supabase) return
    const { data: sessionData } = await supabase.from('tebak_sessions').select('*').eq('id', sessionId).single()
    if (sessionData) {
      setGameSession(sessionData as TebakSession)
      const { data: rounds } = await supabase.from('tebak_rounds').select('id').eq('session_id', sessionId)
      if (rounds && rounds.length > 0) {
        const roundIds = rounds.map(r => r.id)
        const { data: qData } = await supabase.from("tebak_questions").select("*").in("round_id", roundIds).order("sequence_number")
        if (qData) {
          setQuestions(qData as TebakQuestion[])
          const { data: aData } = await supabase.from('tebak_answers').select('*').in('question_id', qData.map(q => q.id))
          if (aData) setAnswers(aData as TebakAnswer[])
        }
      }
    }
  }, [sessionId])

  useEffect(() => {
    setHasMounted(true)
    syncFullState()
  }, [syncFullState])

  useEffect(() => {
    if (!supabase) return
    const cleanup = subscribeToTebakGame(sessionId, {
      onSessionUpdate: (s) => setGameSession(s),
      onQuestionUpdate: (q) => setQuestions((prev) => [...prev.filter(p => p.id !== q.id), q]),
      onAnswerSubmitted: (a) => setAnswers((prev) => [...prev.filter(p => p.id !== a.id), a]),
    })
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [sessionId])

  // --- Game Flow Effects ---
  useEffect(() => {
    if (currentQ && currentQ.id !== prevQuestionId.current) {
      prevQuestionId.current = currentQ.id
      setLocked(false); setSelectedAnswer(null); submittedRef.current = false; setTension(false)
      play('tap')
    }
  }, [currentQ, play])

  useEffect(() => {
    if (!currentQ || currentQ.status !== 'subject_answering' || currentQ.subject_deadline) return
    startQuestionTimer(sessionId, currentQ.sequence_number)
  }, [currentQ, sessionId])
  
  useEffect(() => {
    if (!opponentIsBot || !currentQ || botThinking || !supabase) return
    const isBotTurn = (gameSession.current_subject === (isPlayerA ? "b" : "a") && currentQ.status === "subject_answering") || (gameSession.current_subject !== (isPlayerA ? "b" : "a") && currentQ.status === "guesser_guessing")
    if (!isBotTurn || botPlayedRef.current.has(currentQ.id)) return
    botPlayedRef.current.add(currentQ.id)
    setBotThinking(true)
    botPlayTurn(sessionId, currentQ.id, opponentId).finally(() => setBotThinking(false))
  }, [opponentIsBot, currentQ, botThinking, sessionId, opponentId, isPlayerA, gameSession.current_subject])
  
  // --- Handlers ---
  const handleSubjectAnswer = async (answer: string) => {
    if (!currentQ || submitting) return
    setSubmitting(true); setSelectedAnswer(answer); play('submit')
    try { await submitSubjectAnswer(currentQ.id, answer) } 
    catch (e) { console.error(e) } 
    finally { setSubmitting(false) }
  }

  const handleGuesserGuess = async (answer: string) => {
    if (!currentQ || locked || submittedRef.current || currentQ.status !== "guesser_guessing") return
    submittedRef.current = true; setSelectedAnswer(answer); setLocked(true); setTension(true); tensionStartRef.current = Date.now(); play('submit')
    try { await submitGuesserAnswer(currentQ.id, userId, answer, Date.now()) } 
    catch (e) { submittedRef.current = false; setLocked(false); setTension(false); console.error("submitGuesserAnswer error", e) }
  }
  
  const handleSubjectTimeout = useCallback(() => { 
    if (currentQ) handleSubjectTimeoutAction(currentQ.id, sessionId) 
  }, [currentQ, sessionId])
  const handleGuesserTimeout = useCallback(async () => { if (currentQ) await submitGuesserAnswer(currentQ.id, userId, "__timeout__", Date.now()) }, [currentQ, userId])
  
  // --- UI Computations ---
  const compatibility = 0; // Placeholder
  const myDots = questions.map(q => answers.find(ans => ans.question_id === q.id && ans.guesser_id === userId)?.is_correct ?? null)
  const theirDots = questions.map(q => answers.find(ans => ans.question_id === q.id && ans.guesser_id === opponentId)?.is_correct ?? null)
  
  const currentAnswer = revealedQ ? answers.find(a => a.question_id === revealedQ.id) : null;
  let resultType: 'correct' | 'wrong' | 'subject_timeout' | 'guesser_timeout' = 'correct';
  if (revealedQ) {
    if (!revealedQ.subject_answered_at) resultType = 'subject_timeout'
    else if (currentAnswer?.answer === '__timeout__') resultType = 'guesser_timeout'
    else if (currentAnswer?.is_correct === true) resultType = 'correct'
    else resultType = 'wrong'
  }
  const questionText = currentQ ? (isSubject ? currentQ.question_text : (currentQ.question_for_guesser ?? currentQ.question_text).replace(/\{NamaSubject\}/g, subjectName ?? 'Lawan')) : '';
  const roleLabel = currentQ ? (isSubject ? { icon: '🎯', text: 'Pertanyaan untukmu' } : { icon: '🔍', text: `Tebaklah pikiran ${subjectName ?? 'Lawan'}` }) : null;

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="bg-surface border-b border-border">
        <ScoreBoard scoreA={gameSession.score_a} scoreB={gameSession.score_b} round={gameSession.current_round} isPlayerA={isPlayerA} myName={myName} opponentName={opponentName} myDots={myDots} theirDots={theirDots} />
      </div>

      {showIntro ? <MatchIntro myName={myName} opponentName={opponentName} onBegin={() => setShowIntro(false)} />
      : isFinished ? <WinnerScreen session={gameSession} isPlayerA={isPlayerA} userId={userId} opponentId={opponentId} opponentName={opponentName} myName={myName} compatibility={compatibility} onHome={() => router.push('/')} />
      : isShowingRoundResult && gameSession.advance_at ? <RoundResultScreen session={gameSession} round={1} answers={answers} questions={questions} isPlayerA={isPlayerA} myName={myName} opponentName={opponentIsBot ? null : opponentName} deadline={gameSession.advance_at} />
      : isShowingJeda && gameSession.advance_at && revealedQ ? <JedaScreen deadline={gameSession.advance_at} resultType={resultType} subjectName={isSubject ? myName : (opponentIsBot ? null : opponentName)} guesserName={isSubject ? (opponentIsBot ? null : opponentName) : myName} correctAnswer={revealedQ.correct_answer ?? ''} myScore={isPlayerA ? gameSession.score_a : gameSession.score_b} theirScore={isPlayerA ? gameSession.score_b : gameSession.score_a} isLastQuestion={revealedQ.sequence_number === 5} isLastRound={gameSession.current_round === 2} />
      : tension && !revealedQ ? <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 animate-fadeIn" />
      : currentQ ? (
          <div className="flex-1 flex flex-col px-4 py-4">
            <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden relative">
              <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
              <div className="p-6 relative z-10 min-h-[420px] flex flex-col">
                <div className="flex-1">
                  <div className="text-center mb-4 space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Pertanyaan {currentQ.sequence_number}/5</span>
                    {roleLabel && <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary"><span>{roleLabel.icon}</span><span>{roleLabel.text}</span></div>}
                  </div>
                  <h2 className="text-lg font-bold text-text-primary text-center mb-6 leading-relaxed">{questionText}</h2>
                  <div className="space-y-3 mb-5">
                    {(currentQ.options as string[]).map((opt) => {
                      const isSelected = selectedAnswer === opt
                      const myTurn = isSubject ? currentQ.status === "subject_answering" : currentQ.status === "guesser_guessing"
                      const isSubmitted = isSubject ? submitting : locked
                      const isClickable = myTurn && !isSubmitted
                      let btnStyle = "border-border bg-surface"
                      if (isSelected) btnStyle = "border-primary bg-primary/5"
                      return (
                        <button key={opt} onClick={() => { if (!isClickable) return; if (isSubject) handleSubjectAnswer(opt); else handleGuesserGuess(opt); }} disabled={!isClickable} className={`w-full text-left min-h-[68px] py-5 px-5 rounded-2xl border-2 transition-all duration-200 ${isClickable ? "cursor-pointer hover:border-primary/40" : "cursor-default"} ${isSubmitted && !isSelected ? "opacity-40" : !myTurn ? "opacity-60" : ""} ${btnStyle}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected ? "border-primary bg-primary scale-110" : "border-border"}`} />
                            <span className="text-base font-medium text-text-primary leading-tight">{opt}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {currentQ.status === "subject_answering" && currentQ.subject_deadline && <div className="mb-4"><DigitalClock deadline={currentQ.subject_deadline} onTimeout={handleSubjectTimeout} label={isSubject ? "Jawab sebelum waktu habis" : "Menunggu lawan menjawab"} isUrgent /></div>}
                  {currentQ.status === "guesser_guessing" && currentQ.guesser_deadline && <div className="mb-4">{isSubject ? <DigitalClock deadline={currentQ.guesser_deadline} onTimeout={() => {}} label="Menunggu lawan menebak" /> : <Timer deadline={currentQ.guesser_deadline} onTimeout={handleGuesserTimeout} />}</div>}
                </div>
              </div>
            </div>
          </div>
        )
      : <div className="flex-1 flex flex-col items-center justify-center px-4 text-center"><div className="p-6 bg-surface rounded-2xl border border-border shadow-lg max-w-xs"><Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-4" /><p className="text-sm font-medium text-text-secondary">Sinkronisasi dengan server...</p></div></div>}
    </div>
  )
}
