"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, WifiOff, Volume2, VolumeX, Sparkles, Heart, Leaf, Star, Check, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { subscribeToTebakGame } from "@/lib/tebak/realtime"
import {
  submitSubjectAnswer,
  submitGuesserAnswer,
  submitDiscAnswer,
  handleSubjectTimeout as handleSubjectTimeoutAction,
  startQuestionTimer,
  signalMatchIntroReady,
  resetReadyFlags,
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
import { PanduanOverlay } from "./PanduanOverlay"
import { DiscProfileReveal } from "./DiscProfileReveal"
import type { TebakSession, TebakQuestion, TebakAnswer, TebakRound } from "@/lib/tebak/queries"

// --- Helper Functions ---
type RoundOf = Record<string, number>

const findActiveQuestion = (questions: TebakQuestion[], session: TebakSession, roundOf: RoundOf) => {
  if (!questions) return null
  return questions.find(q =>
    (q.status === 'subject_answering' || q.status === 'guesser_guessing' || q.status === 'both_answering') &&
    q.sequence_number === session.current_q_seq &&
    roundOf[q.round_id] === session.current_round
  ) ?? null
}

const findRevealedQuestion = (questions: TebakQuestion[], session: TebakSession, roundOf: RoundOf) => {
  if (!questions) return null
  return questions.find(q =>
    q.status === 'revealed' &&
    q.sequence_number === session.current_q_seq &&
    roundOf[q.round_id] === session.current_round
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
  
  const [showIntro, setShowIntro] = useState(true)
  const [showPanduan, setShowPanduan] = useState(false)
  const [showProfileReveal, setShowProfileReveal] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [syncFailed, setSyncFailed] = useState(false)
  const [, setSyncTick] = useState(0)

  const { play, isMuted, toggleMute } = useSound()
  const botPlayedRef = useRef<Set<string>>(new Set())
  const panduanShownRef = useRef<Set<number>>(new Set())
  const profileRevealShownRef = useRef(false)
  const prevQuestionId = useRef<string | null>(null)
  const submittedRef = useRef(false)
  const tensionStartRef = useRef(0)
  const advancingRef = useRef(false)
  const reconcilingRef = useRef(false)
  const lastQuestionRef = useRef<TebakQuestion | null>(null)
  const roundOfRef = useRef<Record<string, number>>({})
  const roundTypeRef = useRef<Record<string, 'disc' | 'tebak'>>({})
  const gameSessionRef = useRef(gameSession)
  const handleAdvanceRef = useRef<() => void>(() => {})
  
  // --- Derived State ---
  const isPlayerA = gameSession.player_a_id === userId
  const opponentId = isPlayerA ? gameSession.player_b_id : gameSession.player_a_id
  const currentQ = findActiveQuestion(questions, gameSession, roundOfRef.current)
  const revealedQ = findRevealedQuestion(questions, gameSession, roundOfRef.current)

  const isDiscRound = (currentQ ?? revealedQ) ? (roundTypeRef.current[(currentQ ?? revealedQ)!.round_id] === 'disc') : false
  const isSubject = isDiscRound ? false : (gameSession.current_subject === (isPlayerA ? "a" : "b"))
  const subjectName = isDiscRound ? myName : (isSubject ? myName : opponentName)

  // ScoreBoard DISC: cek tipe ronde saat ini lewat roundTypeRef, independen dari currentQ/revealedQ
  const scoreboardIsDisc = Object.entries(roundTypeRef.current)
    .some(([rid, rtype]) => roundOfRef.current[rid] === gameSession.current_round && rtype === 'disc')
  const discProgress = scoreboardIsDisc ? questions.filter(q => {
    const rn = roundOfRef.current[q.round_id]
    return rn === gameSession.current_round && answers.some(a => a.question_id === q.id && a.guesser_id === userId)
  }).length : 0
  const discTotal = scoreboardIsDisc ? questions.filter(q => roundOfRef.current[q.round_id] === gameSession.current_round).length : 0

  const iAmReady = isPlayerA ? gameSession.player_a_ready : gameSession.player_b_ready
  const opponentReady = isPlayerA ? gameSession.player_b_ready : gameSession.player_a_ready
  const bothReady = iAmReady && opponentReady

  const isFinished = gameSession.status === 'finished'
  const isShowingRoundResult = !!gameSession.advance_at && !!revealedQ && ((scoreboardIsDisc ? revealedQ.sequence_number === 5 : revealedQ.sequence_number === 5)) && gameSession.current_round !== 4
  const isShowingJeda = !!gameSession.advance_at && !!revealedQ && !(((scoreboardIsDisc ? revealedQ.sequence_number === 5 : revealedQ.sequence_number === 5)) && gameSession.current_round !== 4)
  const isLoading = !currentQ && !revealedQ && !isFinished && !showIntro
  const displayQ = currentQ || (tension && !revealedQ && lastQuestionRef.current ? lastQuestionRef.current : null)

  // --- DISC Profile Computation ---
  const computeProfile = (playerId: string) => {
    const discCounts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 }
    const commCounts: Record<string, number> = { Langsung: 0, Empatik: 0, Ekspresif: 0, Tenang: 0 }
    questions.forEach(q => {
      const rtype = roundTypeRef.current[q.round_id]
      if (rtype !== 'disc') return
      const ans = answers.find(a => a.question_id === q.id && a.guesser_id === playerId)
      if (!ans || !ans.answer || ans.answer === '__timeout__' || !q.option_disc) return
      const opts = q.options as string[]
      const idx = opts.indexOf(ans.answer)
      if (idx < 0 || idx >= (q.option_disc as string[]).length) return
      const trait = (q.option_disc as string[])[idx]
      const rn = roundOfRef.current[q.round_id]
      if (rn === 1) { if (trait in discCounts) discCounts[trait]++ }
      else if (rn === 2) { if (trait in commCounts) commCounts[trait]++ }
      else { if (trait in discCounts) discCounts[trait]++; else if (trait in commCounts) commCounts[trait]++ }
    })
    const discDom = Object.entries(discCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '?'
    const commDom = Object.entries(commCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '?'
    return { discCounts, commCounts, discDominant: discDom, commDominant: commDom }
  }
  const myDiscProfile = computeProfile(userId)
  const theirDiscProfile = computeProfile(opponentId)

  // --- Compatibility Computation ---
  const DISC_PAIRS: Record<string, Record<string, { label: string; base: number; emoji: string }>> = {
    D: { D: { label: 'Perlu Usaha', base: 35, emoji: '🔥' }, I: { label: 'Saling Melengkapi', base: 65, emoji: '🔄' }, S: { label: 'Perlu Usaha', base: 35, emoji: '🔥' }, C: { label: 'Saling Melengkapi', base: 65, emoji: '🔄' } },
    I: { D: { label: 'Saling Melengkapi', base: 65, emoji: '🔄' }, I: { label: 'Satu Frekuensi', base: 85, emoji: '🎯' }, S: { label: 'Saling Melengkapi', base: 65, emoji: '🔄' }, C: { label: 'Perlu Usaha', base: 35, emoji: '🔥' } },
    S: { D: { label: 'Perlu Usaha', base: 35, emoji: '🔥' }, I: { label: 'Saling Melengkapi', base: 65, emoji: '🔄' }, S: { label: 'Satu Frekuensi', base: 85, emoji: '🎯' }, C: { label: 'Satu Frekuensi', base: 75, emoji: '🎯' } },
    C: { D: { label: 'Saling Melengkapi', base: 65, emoji: '🔄' }, I: { label: 'Perlu Usaha', base: 35, emoji: '🔥' }, S: { label: 'Satu Frekuensi', base: 75, emoji: '🎯' }, C: { label: 'Perlu Usaha', base: 35, emoji: '🔥' } },
  }
  const discPair = DISC_PAIRS[myDiscProfile.discDominant]?.[theirDiscProfile.discDominant]
  let compatLabel = discPair?.label ?? 'Saling Melengkapi'
  let compatEmoji = discPair?.emoji ?? '🔄'
  let compatScore = discPair?.base ?? 60

  // Communication modifier
  if (myDiscProfile.commDominant === theirDiscProfile.commDominant) {
    compatScore = Math.min(95, compatScore + 15)
    if (compatScore >= 80) { compatLabel = 'Satu Frekuensi'; compatEmoji = '🎯' }
    else if (compatScore >= 55) { compatLabel = 'Saling Melengkapi'; compatEmoji = '🔄' }
  } else if ((myDiscProfile.commDominant === 'Langsung' && theirDiscProfile.commDominant === 'Empatik') || (myDiscProfile.commDominant === 'Empatik' && theirDiscProfile.commDominant === 'Langsung')) {
    compatScore = Math.max(20, compatScore - 15)
    if (compatScore < 45) { compatLabel = 'Perlu Usaha'; compatEmoji = '🔥' }
  }

  const compatibility = compatScore
  const compatibilityLabel = `${compatEmoji} ${compatLabel}`

  const DISC_DESC: Record<string, string> = {
    D: 'tegas, gas pol, ambil keputusan cepet, dan nggak suka basa-basi',
    I: 'sosial, antusias, sumber keseruan, dan gampang nyambung sama siapa aja',
    S: 'sabar, setia, pendengar yang baik, dan selalu ada buat orang lain',
    C: 'teliti, analitis, suka data & fakta, dan punya standar tinggi',
  }
  const COMM_DESC: Record<string, string> = {
    Langsung: 'blak-blakan, to the point, nggak muter-muter',
    Empatik: 'dengerin dulu, jaga perasaan, penuh pertimbangan',
    Ekspresif: 'antusias, cerita pakai emosi, gestur lebar',
    Tenang: 'pendiam, mikir dulu baru ngomong, secukupnya aja',
  }
  const PAIR_ADVICE: Record<string, string> = {
    'D_D': 'Kalian berdua sama-sama gas pol dan blak-blakan. Kekuatannya: kalau satu visi, kalian tim paling efisien — nggak ada waktu kebuang buat basa-basi. Risikonya: bisa tabrakan kalau beda arah. Kuncinya: bagi wilayah. Siapa pegang kendali di situasi apa.',
    'D_I': 'Kamu bawa arah dan ketegasan, lawanmu bawa energi dan koneksi sosial. Kamu yang mulai, dia yang bikin semuanya lebih hidup. Kuncinya: hargai gayanya yang santai — itu yang bikin kamu nggak terlalu kaku.',
    'D_S': 'Kamu gas, lawanmu rem. Kamu buru-buru, dia santai. Ini bisa bikin kamu frustrasi. Tapi justru lawanmu adalah penyeimbang terbaikmu — dia yang memastikan nggak ada yang terlewat. Kuncinya: sabar. Dia nggak lambat, dia teliti.',
    'D_C': 'Kamu fokus ke hasil, lawanmu fokus ke proses. Kamu gambar besarnya, dia urusin detailnya. Kombinasi ideal untuk eksekusi — selama kamu nggak ngegas dia yang lagi mikir. Kuncinya: kasih dia waktu analisis.',
    'I_I': 'Dua sumber energi bertemu! Kalian sama-sama sosial dan ekspresif. Seru banget, tapi kadang rebutan panggung. Kuncinya: ingat buat jadi pendengar juga. Lawanmu juga punya cerita.',
    'I_S': 'Kamu pembicara, lawanmu pendengar. Alami banget — kamu ngalir, dia menikmati. Lawanmu bikin kamu merasa didengerin. Kuncinya: jangan dominasi. Tanya pendapatnya juga.',
    'I_C': 'Kamu spontan dan ekspresif, lawanmu terstruktur dan analitis. Kamu mungkin ngerasa dia kaku, dia mungkin ngerasa kamu impulsif. Tapi justru kalian bisa belajar banyak: dia belajar fleksibel, kamu belajar terencana.',
    'S_S': 'Dua penenang. Harmonis, damai, dan saling ngerti. Jarang konflik karena kalian sama-sama menghindarinya. Kuncinya: jangan stuck di zona nyaman. Kadang perlu ada yang mulai duluan.',
    'S_C': 'Kalian sama-sama telaten dan hati-hati. Nyambung di ritme — nggak ada yang ngegas, semua terencana. Kuncinya: kadang perlu sedikit spontanitas biar nggak monoton.',
    'C_C': 'Dua analis. Kalian sama-sama teliti dan suka data. Diskusinya dalam dan berbobot. Tapi bisa overthinking bareng. Kuncinya: kadang keputusan cukup diambil, nggak perlu dianalisis terus.',
  }

  const pairKey = `${myDiscProfile.discDominant}_${theirDiscProfile.discDominant}`
  const pairKeyRev = `${theirDiscProfile.discDominant}_${myDiscProfile.discDominant}`
  const advice = PAIR_ADVICE[pairKey] ?? PAIR_ADVICE[pairKeyRev] ?? ''

  const DISC_LABEL: Record<string, string> = { D: 'Dominan', I: 'Influence', S: 'Steadiness', C: 'Conscientiousness' }
  const compatibilityInsight = `${myName || 'Kamu'} tipe ${DISC_LABEL[myDiscProfile.discDominant] ?? myDiscProfile.discDominant} — ${DISC_DESC[myDiscProfile.discDominant] ?? ''}. Cara ngomongmu ${myDiscProfile.commDominant} — ${COMM_DESC[myDiscProfile.commDominant] ?? ''}.

${opponentName || 'Lawan'} tipe ${DISC_LABEL[theirDiscProfile.discDominant] ?? theirDiscProfile.discDominant} — ${DISC_DESC[theirDiscProfile.discDominant] ?? ''}. Cara ngomongnya ${theirDiscProfile.commDominant} — ${COMM_DESC[theirDiscProfile.commDominant] ?? ''}.

${advice}`

  // --- Data Sync ---
  const syncFullState = useCallback(async () => {
    if (!supabase) return
    const { data: sessionData } = await supabase.from('tebak_sessions').select('*').eq('id', sessionId).single()
    if (sessionData) {
      setGameSession(sessionData as TebakSession)
      const { data: roundsData } = await supabase.from('tebak_rounds').select('id, round_number, round_type').eq('session_id', sessionId)
      if (roundsData && roundsData.length > 0) {
        const map: Record<string, number> = {}
        roundsData.forEach(r => {
          map[r.id] = r.round_number
          roundTypeRef.current[r.id] = r.round_type
        })
        roundOfRef.current = map
        const roundIds = roundsData.map(r => r.id)
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

  // Sync roundOfRef saat current_round berubah (round baru dibuat RPC → roundOfRef basi)
  const doSyncNewRound = useCallback(async (retries: number = 3) => {
    const sb = supabase
    if (!sb) return false
    const targetRound = gameSession.current_round
    if (targetRound <= 1) return false
    const currentRounds = new Set(Object.values(roundOfRef.current))
    if (currentRounds.has(targetRound)) return true

    for (let attempt = 0; attempt < retries; attempt++) {
      if (attempt > 0) {
        await new Promise(r => setTimeout(r, [500, 1000, 2000][Math.min(attempt - 1, 2)]))
      }
      try {
        const { data: rounds, error } = await sb
          .from('tebak_rounds')
          .select('id, round_number, round_type')
          .eq('session_id', sessionId)
        if (error) throw error
        if (!rounds || rounds.length === 0) { continue }

        const newRoundIds: string[] = []
        rounds.forEach(r => {
          if (!(r.id in roundOfRef.current)) {
            roundOfRef.current[r.id] = r.round_number
            roundTypeRef.current[r.id] = r.round_type
            newRoundIds.push(r.id)
          }
        })
        if (newRoundIds.length === 0) { setSyncFailed(false); setSyncTick(t => t + 1); return true }

        const { data: qData, error: qErr } = await sb
          .from('tebak_questions')
          .select('*')
          .in('round_id', newRoundIds)
          .order('sequence_number')
        if (qErr) throw qErr

        if (qData) {
          setQuestions(prev => {
            const existing = new Set(prev.map(p => p.id))
            return [...prev, ...(qData as TebakQuestion[]).filter(q => !existing.has(q.id))]
          })
          const { data: aData, error: aErr } = await sb
            .from('tebak_answers')
            .select('*')
            .in('question_id', qData.map(q => q.id))
          if (aErr) throw aErr
          if (aData) {
            setAnswers(prev => {
              const existing = new Set(prev.map(p => p.id))
              return [...prev, ...(aData as TebakAnswer[]).filter(a => !existing.has(a.id))]
            })
          }
        }
        setSyncFailed(false)
        setSyncTick(t => t + 1)
        return true
      } catch {
      }
    }
    setSyncFailed(true)
    return false
  }, [sessionId, gameSession.current_round])

  const retrySync = useCallback(() => {
    setSyncFailed(false)
    // fetch langsung tanpa nunggu reload
    doSyncNewRound(3)
  }, [doSyncNewRound])

  useEffect(() => {
    if (gameSession.current_round > 1) {
      doSyncNewRound(3)
    }
  }, [gameSession.current_round, doSyncNewRound])

  // Panduan: tampilkan overlay info saat masuk ronde baru (R1-3)
  useEffect(() => {
    const r = gameSession.current_round
    if (r < 1 || r > 3) return
    if (panduanShownRef.current.has(r)) return
    if (isLoading) return
    panduanShownRef.current.add(r)
    setShowPanduan(true)
  }, [gameSession.current_round, isLoading])

  // DiscProfileReveal: tampilkan profil DISC saat masuk R3 (setelah R2 selesai)
  useEffect(() => {
    if (isLoading) return
    if (gameSession.current_round !== 3) return
    if (profileRevealShownRef.current) return
    profileRevealShownRef.current = true
    setShowProfileReveal(true)
  }, [gameSession.current_round, isLoading])

  // MatchIntro auto-dismiss: kedua siap ATAU countdown 20s habis
  useEffect(() => {
    if (showIntro && bothReady) {
      resetReadyFlags(sessionId)
      setShowIntro(false)
    }
  }, [showIntro, bothReady, sessionId])

  useEffect(() => {
    if (!showIntro || !gameSession.created_at) return
    const deadline = new Date(gameSession.created_at).getTime() + 8000
    let fired = false
    const check = () => {
      if (Date.now() >= deadline && !fired) {
        fired = true
        resetReadyFlags(sessionId)
        setShowIntro(false)
      }
    }
    check()
    const t = setInterval(check, 500)
    return () => clearInterval(t)
  }, [showIntro, gameSession.created_at, sessionId])

  // Watchdog: jika isLoading > 5s & roundOfRef belum punya round ini → retry
  useEffect(() => {
    if (!isLoading) return
    const timer = setTimeout(() => {
      const target = gameSession.current_round
      if (target <= 1) return
      if (!new Set(Object.values(roundOfRef.current)).has(target) && !syncFailed) {
        doSyncNewRound(3)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [isLoading, gameSession.current_round, syncFailed, doSyncNewRound])

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

  // Keep refs in sync
  useEffect(() => { gameSessionRef.current = gameSession }, [gameSession])

  // --- Game Flow Effects ---
  useEffect(() => {
    if (currentQ) {
      lastQuestionRef.current = currentQ
      if (currentQ.id !== prevQuestionId.current) {
        prevQuestionId.current = currentQ.id
        setLocked(false); setSelectedAnswer(null); submittedRef.current = false; setTension(false)
        play('tap')
      }
    }
  }, [currentQ, play])

  useEffect(() => {
    if (showIntro || showPanduan) return
    if (!currentQ || currentQ.subject_deadline) return
    if (currentQ.status === 'subject_answering' || currentQ.status === 'both_answering') {
      startQuestionTimer(sessionId, currentQ.sequence_number)
    }
  }, [currentQ, sessionId, showIntro, showPanduan])
  
  useEffect(() => {
    if (!opponentIsBot || !currentQ || botThinking || !supabase) return
    const isBotTurn = isDiscRound
      ? currentQ.status === "both_answering"
      : (gameSession.current_subject === (isPlayerA ? "b" : "a") && currentQ.status === "subject_answering") || (gameSession.current_subject !== (isPlayerA ? "b" : "a") && currentQ.status === "guesser_guessing")
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

  const handleDiscAnswer = async (answer: string) => {
    if (!currentQ || submitting) return
    const startedAt = Date.now()
    setSubmitting(true); setSelectedAnswer(answer); play('submit')

    // Optimistic update: tambah jawaban ke state lokal
    const optimisticAnswer: TebakAnswer = {
      id: 'temp-' + startedAt,
      question_id: currentQ.id,
      guesser_id: userId,
      answer,
      is_correct: null,
      time_ms: 0,
    } as TebakAnswer
    setAnswers(prev => [...prev, optimisticAnswer])

    try {
      const result = await submitDiscAnswer(currentQ.id, answer, startedAt)
      if (result.status === 'already_answered') {
        // Revert optimistic — orang ini sudah jawab sebelumnya
        setAnswers(prev => prev.filter(a => a.id !== optimisticAnswer.id))
      }
      // 'revealed' atau 'answered' → biarkan Realtime Subscription update state
    } catch (e) {
      setAnswers(prev => prev.filter(a => a.id !== optimisticAnswer.id))
      console.error("handleDiscAnswer error", e)
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleSubjectTimeout = useCallback(() => { 
    if (currentQ) handleSubjectTimeoutAction(currentQ.id, sessionId) 
  }, [currentQ, sessionId])
  const handleGuesserTimeout = useCallback(async () => { if (currentQ) await submitGuesserAnswer(currentQ.id, userId, "__timeout__", Date.now()) }, [currentQ, userId])

  // Reconcile: re-fetch full state + reset flags — dipanggil handleAdvance gagal & window online
  const reconcileGameState = useCallback(async () => {
    if (!supabase) return
    if (reconcilingRef.current) return
    reconcilingRef.current = true
    try {
      const { data: sessionData } = await supabase.from('tebak_sessions').select('*').eq('id', sessionId).single()
      if (sessionData) setGameSession(sessionData as TebakSession)
      const { data: roundsData } = await supabase.from('tebak_rounds').select('id, round_number, round_type').eq('session_id', sessionId)
      if (roundsData) {
        roundsData.forEach(r => {
          roundOfRef.current[r.id] = r.round_number
          roundTypeRef.current[r.id] = r.round_type
        })
        const roundIds = roundsData.map(r => r.id)
        const { data: qData } = await supabase.from('tebak_questions').select('*').in('round_id', roundIds).order('sequence_number')
        if (qData) {
          setQuestions(prev => {
            const existing = new Set(prev.map(p => p.id))
            return [...prev, ...(qData as TebakQuestion[]).filter(q => !existing.has(q.id))]
          })
          const { data: aData } = await supabase.from('tebak_answers').select('*').in('question_id', qData.map(q => q.id))
          if (aData) {
            setAnswers(prev => {
              const existing = new Set(prev.map(p => p.id))
              return [...prev, ...(aData as TebakAnswer[]).filter(a => !existing.has(a.id))]
            })
          }
        }
      }
    } catch {
    } finally {
      reconcilingRef.current = false
    }
  }, [sessionId])

  const handleAdvance = useCallback(async () => {
    if (advancingRef.current) return
    advancingRef.current = true
    const expectedSeq = gameSession.current_q_seq
    let succeeded = false

    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        // Idempotency: cek state server dulu — sudah maju? kalau iya, jangan POST lagi
        try {
          const { data: checkSession } = await supabase!.from('tebak_sessions').select('current_round, current_q_seq').eq('id', sessionId).single()
          if (checkSession) {
            if (checkSession.current_round !== gameSession.current_round || checkSession.current_q_seq !== expectedSeq) {
              // Server sudah maju — reconcile saja
              await reconcileGameState()
              succeeded = true
              break
            }
          }
        } catch { /* cek gagal, lanjut retry */ }
        await new Promise(r => setTimeout(r, [500, 1000, 2000][Math.min(attempt - 1, 2)]))
      }
      try {
        const result = await advanceGame(sessionId, expectedSeq)
        if (result && result.status === 'game_finished') {
          reconcileGameState()
        }
        succeeded = true
        break
      } catch {
      }
    }

    advancingRef.current = false
    if (!succeeded) {
      await reconcileGameState()
    }
  }, [sessionId, gameSession.current_round, gameSession.current_q_seq, reconcileGameState])

  // Sync handleAdvanceRef agar watchdog & online handler selalu punya fungsi terbaru
  useEffect(() => { handleAdvanceRef.current = handleAdvance }, [handleAdvance])

  // Reconcile on reconnect + trigger advance ulang kalau overdue
  useEffect(() => {
    const handleOnline = () => {
      advancingRef.current = false
      setSyncFailed(false)
      reconcileGameState()
      const gs = gameSessionRef.current
      if (gs.advance_at && Date.now() > new Date(gs.advance_at).getTime() + 5000) {
        handleAdvanceRef.current()
      }
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [reconcileGameState])

  // Advance watchdog — polling untuk "online tapi request gagal" & simetris offline
  useEffect(() => {
    const interval = setInterval(() => {
      const gs = gameSessionRef.current
      if (!gs.advance_at) return
      if (Date.now() <= new Date(gs.advance_at).getTime() + 5000) return
      if (advancingRef.current) return
      handleAdvanceRef.current()
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Health-check polling — jaring pengaman independen dari realtime (WebSocket bisa putus)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return
      const gs = gameSessionRef.current
      if (gs.status === 'finished' || gs.status === 'waiting') return
      if (!supabase) return

      supabase.from('tebak_sessions')
        .select('current_round, current_q_seq, advance_at, status')
        .eq('id', sessionId)
        .single()
        .then(({ data }) => {
          if (!data) return
          const current = gameSessionRef.current
          if (data.current_round !== current.current_round ||
              data.current_q_seq !== current.current_q_seq ||
              data.status !== current.status ||
              data.advance_at !== current.advance_at) {
            reconcileGameState()
          }
        })
    }, 5000)
    return () => clearInterval(interval)
  }, [sessionId])

  // --- UI Computations ---
  const myDots = questions.map(q => {
    if (roundTypeRef.current[q.round_id] === 'disc') {
      return answers.find(a => a.question_id === q.id && a.guesser_id === userId) ? true : null
    }
    return answers.find(ans => ans.question_id === q.id && ans.guesser_id === userId)?.is_correct ?? null
  })
  const theirDots = questions.map(q => {
    if (roundTypeRef.current[q.round_id] === 'disc') {
      return answers.find(a => a.question_id === q.id && a.guesser_id === opponentId) ? true : null
    }
    return answers.find(ans => ans.question_id === q.id && ans.guesser_id === opponentId)?.is_correct ?? null
  })
  
  const currentAnswer = revealedQ ? answers.find(a => a.question_id === revealedQ.id) : null;
  let resultType: 'correct' | 'wrong' | 'subject_timeout' | 'guesser_timeout' = 'correct';
  if (revealedQ) {
    if (!revealedQ.subject_answered_at) resultType = 'subject_timeout'
    else if (currentAnswer?.answer === '__timeout__') resultType = 'guesser_timeout'
    else if (currentAnswer?.is_correct === true) resultType = 'correct'
    else resultType = 'wrong'
  }
  const questionText = displayQ ? (
    isDiscRound ? displayQ.question_text :
    (isSubject ? displayQ.question_text : (displayQ.question_for_guesser ?? displayQ.question_text).replace(/\{NamaSubject\}/g, subjectName ?? 'Lawan'))
  ) : '';
  const roleLabel = displayQ ? (
    isDiscRound ? { icon: '💬', text: 'Jawab tentang dirimu' } :
    (isSubject ? { icon: '🎯', text: 'Pertanyaan untukmu' } : { icon: '🔍', text: `Tebaklah pikiran ${subjectName ?? 'Lawan'}` })
  ) : null;
  const isMyTurn = displayQ ? (
    isDiscRound ? displayQ.status === "both_answering" :
    (isSubject ? displayQ.status === "subject_answering" : displayQ.status === "guesser_guessing")
  ) : false;

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="bg-surface border-b border-border">
        <ScoreBoard scoreA={gameSession.score_a} scoreB={gameSession.score_b} round={gameSession.current_round} isPlayerA={isPlayerA} myName={myName} opponentName={opponentName} myDots={myDots} theirDots={theirDots} isDiscRound={scoreboardIsDisc} discProgress={discProgress} discTotal={discTotal} />
      </div>

      {showIntro ? <MatchIntro myName={myName} opponentName={opponentName} onBegin={() => setShowIntro(false)} deadline={gameSession.created_at ? new Date(new Date(gameSession.created_at).getTime() + 8000).toISOString() : undefined} onReady={() => signalMatchIntroReady(sessionId)} opponentReady={opponentReady} sessionId={sessionId} />
      : showProfileReveal ? <DiscProfileReveal myProfile={myDiscProfile} theirProfile={theirDiscProfile} myName={myName} opponentName={opponentName} deadline={gameSession.advance_at ?? new Date(Date.now() + 20000).toISOString()} onAdvance={() => setShowProfileReveal(false)} />
      : showPanduan && !isFinished ? <PanduanOverlay round={gameSession.current_round} onMulai={() => setShowPanduan(false)} onReady={() => signalMatchIntroReady(sessionId)} opponentReady={!!opponentReady} iAmReady={!!iAmReady} sessionId={sessionId} />
      : isFinished ? <WinnerScreen session={gameSession} isPlayerA={isPlayerA} userId={userId} opponentId={opponentId} opponentName={opponentName} myName={myName} compatibility={compatibility} compatibilityLabel={compatibilityLabel} compatibilityInsight={compatibilityInsight} onHome={() => router.push('/')} />
      : isShowingRoundResult && gameSession.advance_at ? <RoundResultScreen session={gameSession} round={gameSession.current_round} answers={answers} questions={questions} isPlayerA={isPlayerA} myName={myName} opponentName={opponentIsBot ? null : opponentName} deadline={gameSession.advance_at} onAdvance={handleAdvance} isDiscRound={isDiscRound} />
      : isShowingJeda && gameSession.advance_at && revealedQ ? <JedaScreen deadline={gameSession.advance_at} resultType={resultType} subjectName={isSubject ? myName : (opponentIsBot ? null : opponentName)} guesserName={isSubject ? (opponentIsBot ? null : opponentName) : myName} correctAnswer={revealedQ.correct_answer ?? ''} myScore={isPlayerA ? gameSession.score_a : gameSession.score_b} theirScore={isPlayerA ? gameSession.score_b : gameSession.score_a} isLastQuestion={scoreboardIsDisc ? revealedQ.sequence_number === 5 : revealedQ.sequence_number === 5} isLastRound={gameSession.current_round === 4} onAdvance={handleAdvance} isDiscRound={isDiscRound} opponentName={opponentIsBot ? null : opponentName} myDiscAnswer={answers.find(a => a.question_id === revealedQ!.id && a.guesser_id === userId)?.answer ?? null} theirDiscAnswer={answers.find(a => a.question_id === revealedQ!.id && a.guesser_id === opponentId)?.answer ?? null} sessionId={sessionId} />
      : displayQ ? (
          <div className="flex-1 flex flex-col px-4 py-4 bg-primary text-primary-foreground">
            <div className="bg-primary/20 rounded-2xl border border-primary/50 shadow-xl overflow-hidden relative">
              <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
              <div className="p-6 relative z-10 min-h-[420px] flex flex-col">
                <div className="flex-1">
                  <div className="text-center mb-4 space-y-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-base font-medium">Pertanyaan {displayQ.sequence_number}/{scoreboardIsDisc ? 10 : 5}</span>
                    {roleLabel && <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-accent"><span>{roleLabel.icon}</span><span>{roleLabel.text}</span></div>}
                  </div>
                  <h2 className="text-2xl font-bold text-primary-foreground text-center mb-6 leading-relaxed">{questionText}</h2>
                  <div className="text-center mb-3">
                    {isMyTurn ? (
                      <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-semibold">Pilih jawabanmu</span>
                    ) : (
                      <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-semibold">⏳ Menunggu lawan menjawab...</span>
                    )}
                  </div>
                  <div className="space-y-3 mb-5">
                    {(displayQ.options as string[]).map((opt, index) => {
                      const isSelected = selectedAnswer === opt
                      const myTurn = isMyTurn
                      const isSubmitted = isDiscRound
                        ? !!answers.find(a => a.question_id === displayQ.id && a.guesser_id === userId)
                        : (isSubject ? submitting : locked || submittedRef.current)
                      const isClickable = myTurn && !isSubmitted

                      const optionIcons = [Sparkles, Heart, Leaf, Star]
                      const OptionIcon = optionIcons[index % optionIcons.length]
                      
                      let buttonClasses = "bg-[#0d5478] text-white border-white/10"
                      let iconClasses = "bg-white/20 text-white"

                      // Selected state
                      if (isSelected) {
                        buttonClasses = "!bg-accent border-accent !text-accent-foreground scale-[1.02] shadow-[0_0_20px_rgba(255,198,79,0.45)]"
                        iconClasses = "!bg-accent-foreground !text-accent"
                      }

                      // Revealed state (after answer/timeout)
                      if (revealedQ) {
                        const isCorrectAnswer = revealedQ.correct_answer === opt
                        const isMyGuesserAnswer = currentAnswer?.answer === opt
                        
                        if (isCorrectAnswer) {
                          buttonClasses = "bg-success border-success text-success-foreground"
                          iconClasses = "bg-success-foreground text-success"
                        } else if (isMyGuesserAnswer && !isCorrectAnswer) { // My wrong guess
                          buttonClasses = "bg-destructive border-destructive text-destructive-foreground"
                          iconClasses = "bg-destructive-foreground text-destructive"
                        } else if (!isCorrectAnswer) { // Other wrong options
                          buttonClasses = "opacity-60 bg-[#0d5478] text-white/50 border-white/10"
                          iconClasses = "bg-white/10 text-white/50"
                        }
                      }

                      return (
                        <button key={opt} onClick={() => { if (!isClickable) return; if (isDiscRound) handleDiscAnswer(opt); else if (isSubject) handleSubjectAnswer(opt); else handleGuesserGuess(opt); }} disabled={!isClickable} className={`w-full text-left min-h-[68px] py-5 px-5 rounded-2xl border-2 transition-all duration-200 ${isClickable ? "cursor-pointer hover:border-accent/60" : "cursor-default"} ${buttonClasses}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${iconClasses}`}>
                              <OptionIcon size={20} />
                            </div>
                            <span className="text-base font-semibold leading-tight">{opt}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {displayQ.status === "subject_answering" && displayQ.subject_deadline && <div className="mb-4"><DigitalClock deadline={displayQ.subject_deadline} onTimeout={handleSubjectTimeout} label={isSubject ? "Jawab sebelum waktu habis" : "Menunggu lawan menjawab"} isUrgent={!!isSubject} /></div>}
                  {displayQ.status === "guesser_guessing" && displayQ.guesser_deadline && <div className="mb-4">{isSubject ? <DigitalClock deadline={displayQ.guesser_deadline} onTimeout={() => {}} label="Menunggu lawan menebak" /> : <Timer deadline={displayQ.guesser_deadline} onTimeout={handleGuesserTimeout} />}</div>}
                  {displayQ.status === "both_answering" && displayQ.subject_deadline && <div className="mb-4"><DigitalClock deadline={displayQ.subject_deadline} onTimeout={() => reconcileGameState()} label="Jawab sebelum waktu habis" isUrgent={true} /></div>}
                  {tension && !revealedQ && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      <span className="text-xs text-accent font-semibold">Menunggu hasil...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      : <div className="flex-1 flex flex-col items-center justify-center px-4 text-center"><div className="p-6 bg-surface rounded-2xl border border-border shadow-lg max-w-xs">{syncFailed ? <><Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-4" /><p className="text-sm font-medium text-text-secondary mb-4">Sinkronisasi gagal</p><button onClick={retrySync} className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer">Coba lagi</button></> : <><Loader2 className="w-7 h-7 text-primary animate-spin mx-auto mb-4" /><p className="text-sm font-medium text-text-secondary">Sinkronisasi dengan server...</p></>}</div></div>}
    </div>
  )
}
