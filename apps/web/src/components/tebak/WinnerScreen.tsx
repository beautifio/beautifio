"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Home, Loader2, MessageCircle, Send } from "lucide-react"
import { Tebi } from "./art/Tebi"
import { Confetti } from "./art/Confetti"
import { IconCheck, IconCrown, IconHeart, IconRepeat, IconX } from "./art/icons"
import { supabase } from "@/lib/supabase/client"
import { offerRematch, respondToRematch } from "@/lib/tebak/actions"
import { createBisikInvite, createProChatFromTebak } from "@/lib/tebak/bisik-bridge"
import type { TebakSession } from "@/lib/tebak/queries"

type RematchOffer = {
  id: string
  offered_by_id: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  new_session_id: string | null
}

type Props = {
  session: TebakSession
  isPlayerA: boolean
  userId: string
  opponentId: string
  opponentName: string | null
  myName: string | null
  compatibility: number
  compatibilityLabel?: string
  compatibilityInsight?: string
  onHome: () => void
  opponentIsBot?: boolean
}

export function WinnerScreen({ session, isPlayerA, userId, opponentId, opponentName, myName, compatibility, compatibilityLabel, compatibilityInsight, onHome, opponentIsBot }: Props) {
  const router = useRouter()
  const myScore = isPlayerA ? session.score_a : session.score_b
  const theirScore = isPlayerA ? session.score_b : session.score_a
  const isWin = myScore > theirScore
  const isDraw = myScore === theirScore
  
  const [rematchState, setRematchState] = useState<'idle' | 'offering' | 'receiving' | 'accepted' | 'declined'>('idle')
  const [rematchOffer, setRematchOffer] = useState<RematchOffer | null>(null)
  const [bisikLoading, setBisikLoading] = useState(false)
  const [bisikState, setBisikState] = useState<'idle' | 'inviting' | 'sent' | 'chatting'>('idle')
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    supabase.from("user_subscriptions")
      .select("id").eq("user_id", userId).eq("status", "active")
      .gt("expires_at", new Date().toISOString()).maybeSingle()
      .then(({ data }) => { if (!cancelled) setIsPro(!!data) })
    return () => { cancelled = true }
  }, [userId])

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel(`rematch:${session.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tebak_rematch_offers',
        filter: `original_session_id=eq.${session.id}`
      }, (payload) => {
        const offer = payload.new as RematchOffer
        setRematchOffer(offer)
        if (offer.status === 'accepted' && offer.new_session_id) {
          setRematchState('accepted')
          setTimeout(() => router.push(`/tebak/${offer.new_session_id}`), 1000)
        } else if (offer.status === 'declined') {
          setRematchState('declined')
        } else if (offer.offered_by_id !== userId) {
          setRematchState('receiving')
        }
      })
      .subscribe()
    const _supabase = supabase
    return () => { _supabase?.removeChannel(channel) }
  }, [session.id, userId, router])

  const handleOfferRematch = async () => {
    setRematchState('offering')
    try {
      await offerRematch(session.id, opponentId)
    } catch (err) {
      console.error(err)
      setRematchState('idle')
    }
  }

  const handleBisik = async () => {
    setBisikLoading(true)
    setBisikState(isPro ? 'chatting' : 'inviting')
    try {
      if (isPro) {
        const result = await createProChatFromTebak(session.id)
        if (result.chatId) {
          router.push(`/bisik/chat/${result.chatId}`)
          return
        }
        setBisikState('idle')
      } else {
        const result = await createBisikInvite(session.id)
        if (result.success) {
          if (result.message === "existing_chat") {
            router.push(`/bisik/chat/${result.chatId}`)
          } else {
            setBisikState('sent')
          }
        } else {
          setBisikState('idle')
        }
      }
    } catch (err) {
      console.error(err)
      setBisikState('idle')
    } finally {
      setBisikLoading(false)
    }
  }

  const handleRespond = async (accept: boolean) => {
    if (!rematchOffer) return
    try {
      if (accept) {
        setRematchState('accepted')
        const newSessionId = await respondToRematch(rematchOffer.id, true)
        if (newSessionId) {
          router.push(`/tebak/${newSessionId}`)
        }
      } else {
        setRematchState('declined')
        await respondToRematch(rematchOffer.id, false)
      }
    } catch (err) {
      console.error(err)
      setRematchState('receiving')
    }
  }

  const margin = Math.abs(myScore - theirScore)
  let marginText: string;
  if (isDraw) marginText = "Skor kalian sama persis"
  else if (margin < 10) marginText = isWin ? "Menang tipis, sengit banget!" : "Kalah tipis, hampir saja!"
  else if (margin <= 30) marginText = isWin ? "Kemenangan yang mantap" : "Lawanmu jago menebak"
  else marginText = isWin ? "Kamu kenal dia luar dalam!" : "Masih ada ronde berikutnya"

  const compatTone = compatibility <= 30 ? "bg-tb-no" : compatibility <= 60 ? "bg-tb-me" : "bg-tb-yes"
  const btnBase = "tb-chunky w-full py-3.5 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"

  return (
    <div className="relative flex flex-col gap-4 animate-tb-slide-in">
      {isWin && <Confetti pieces={22} seed={myScore + 7} />}

      {/* Hasil */}
      <div className="tb-board p-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="relative mb-2">
          {isWin && <IconCrown size={34} className="absolute -top-6 left-1/2 -translate-x-1/2 text-tb-me animate-tb-bob" />}
          <Tebi mood={isWin ? "party" : isDraw ? "happy" : "sad"} size={96} className="animate-tb-pop" />
        </div>
        <h2 className="font-tebak text-3xl font-semibold text-tb-ink leading-tight">
          {isDraw ? "Seri!" : isWin ? "Kamu menang!" : "Kamu kalah"}
        </h2>
        <p className="text-sm text-tb-soft mt-1">{marginText}</p>

        <div className="mt-5 w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className={`rounded-2xl border-2 py-3 ${isWin || isDraw ? "border-tb-me bg-tb-me/10" : "border-tb-line"}`}>
            <p className="text-xs text-tb-me font-semibold truncate px-2">{myName || "Kamu"}</p>
            <p className="font-tebak text-4xl font-semibold text-tb-me tabular-nums leading-none mt-1">{myScore}</p>
          </div>
          <span className="font-tebak text-tb-soft">vs</span>
          <div className={`rounded-2xl border-2 py-3 ${!isWin && !isDraw ? "border-tb-them bg-tb-them/10" : "border-tb-line"}`}>
            <p className="text-xs text-tb-them font-semibold truncate px-2">{opponentName || "Lawan"}</p>
            <p className="font-tebak text-4xl font-semibold text-tb-them tabular-nums leading-none mt-1">{theirScore}</p>
          </div>
        </div>
      </div>

      {/* Kecocokan */}
      <div className="tb-board p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-tb-no/15 text-tb-no flex items-center justify-center shrink-0">
            <IconHeart size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-tb-soft">Kecocokan kalian</p>
            <p className="font-tebak text-lg font-semibold text-tb-ink leading-tight">{compatibilityLabel || "Saling melengkapi"}</p>
          </div>
          <span className="font-tebak text-2xl font-semibold text-tb-ink tabular-nums">{compatibility}%</span>
        </div>
        <div className="h-3 rounded-full bg-tb-deep border border-tb-line overflow-hidden">
          <div className={`h-full rounded-full ${compatTone} transition-[width] duration-1000 ease-out`} style={{ width: `${compatibility}%` }} />
        </div>
        {compatibilityInsight ? <p className="text-sm text-tb-soft leading-relaxed whitespace-pre-line mt-3">{compatibilityInsight}</p> : null}
      </div>

      {/* Aksi */}
      <div className="flex flex-col gap-3">
        {rematchState === 'offering' ? (
          <div className="tb-board p-4 flex items-center justify-center gap-3 text-sm text-tb-soft">
            <Tebi mood="think" size={36} className="animate-tb-bob" />
            Menunggu jawaban {opponentName || "lawan"}…
          </div>
        ) : rematchState === 'receiving' ? (
          <div className="tb-board p-4 flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-tb-ink">{opponentName || "Lawan"} mengajak main lagi</span>
            <div className="w-full flex gap-3">
              <button onClick={() => handleRespond(false)} className={`${btnBase} bg-transparent border-tb-line text-tb-soft`}><IconX size={16} /> Tolak</button>
              <button onClick={() => handleRespond(true)} className={`${btnBase} bg-tb-me border-tb-me text-tb-stage [--tb-edge:var(--color-tb-me-dark)]`}><IconCheck size={16} /> Main lagi</button>
            </div>
          </div>
        ) : rematchState === 'accepted' ? (
          <div className="tb-board p-4 flex items-center justify-center gap-3 text-sm text-tb-yes font-semibold">
            <Tebi mood="happy" size={36} /> Diterima! Menyiapkan permainan baru…
          </div>
        ) : rematchState === 'declined' ? (
          <div className="tb-board p-4 flex items-center justify-center gap-3 text-sm text-tb-soft">
            <Tebi mood="sad" size={36} />
            {rematchOffer?.offered_by_id === userId ? `${opponentName || "Lawan"} belum mau main lagi` : "Ajakan ditolak"}
          </div>
        ) : (
          <>
            <button onClick={handleOfferRematch} className={`${btnBase} bg-tb-me border-tb-me text-tb-stage [--tb-edge:var(--color-tb-me-dark)]`}>
              <IconRepeat size={18} /> Main lagi
            </button>
            {!opponentIsBot && bisikState === 'sent' ? (
              <div className="rounded-2xl border-2 border-tb-yes/40 bg-tb-yes/10 py-3 text-tb-yes font-semibold text-sm text-center">Undangan terkirim. Tunggu balasannya ya.</div>
            ) : !opponentIsBot && (
              <button onClick={handleBisik} disabled={bisikLoading} className={`${btnBase} bg-tb-them border-tb-them text-tb-stage [--tb-edge:var(--color-tb-them-dark)]`}>
                {bisikLoading ? <Loader2 className="animate-spin" size={16} /> : isPro ? <Send size={16} /> : <MessageCircle size={16} />}
                {isPro ? "Chat langsung di Bisik" : "Kenalan di Bisik"}
              </button>
            )}
            <button onClick={onHome} className={`${btnBase} bg-transparent border-tb-line text-tb-soft`}>
              <Home size={16} /> Kembali ke beranda
            </button>
          </>
        )}
      </div>
    </div>
  )
}
