"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Home, RotateCcw, Loader2, X, Check, MessageCircle, Send } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { offerRematch, respondToRematch } from "@/lib/tebak/actions"
import { createBisikInvite, createProChatFromTebak } from "@/lib/tebak/bisik-bridge"
import { inviteBotToChat } from "@/lib/bisik/bot-actions"
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
      // Bot → direct chat
      if (opponentIsBot) {
        const result = await inviteBotToChat(opponentId)
        if (result.success && result.chatId) {
          router.push(`/bisik/chat/${result.chatId}`)
          return
        }
        setBisikState('idle')
      } else if (isPro) {
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

  // Confetti logic from previous fix
  const [particles, setParticles] = useState<{ left: string; color: string; anim: string }[]>([])
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        color: ['#FFC64F', '#6BB9D4', '#084463', '#EF4444', '#22C55E'][i % 5],
        anim: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
      }))
    )
  }, [])
  
  const margin = Math.abs(myScore - theirScore)
  let marginText: string;
  if (isDraw) marginText = "SERI! Tidak ada yang menang hari ini 😅"
  else if (margin < 10) marginText = "Sengit sekali!"
  else if (margin <= 30) marginText = "Kemenangan solid!"
  else marginText = "Dominasi total!"

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #1A2A4A 50%, #084463 100%)' }}>
      {/* Ambient orbs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: '#FFC64F' }} />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full opacity-15 blur-3xl" style={{ background: '#6BB9D4' }} />

      {isWin && particles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p, i) => <div key={i} className="absolute w-2 h-2 rounded-full opacity-70" style={{ left: p.left, top: '-10px', backgroundColor: p.color, animation: p.anim }} />)}
        </div>
      )}
      {isWin && <style>{`@keyframes confetti-fall { 0% { transform: translateY(-10px); } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>}

      {/* Scrollable content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="max-w-content mx-auto w-full">
          
          {/* Trophy + title */}
          <div className="flex flex-col items-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: isWin ? 'rgba(255,198,79,0.15)' : isDraw ? 'rgba(107,185,212,0.15)' : 'rgba(255,255,255,0.05)', border: `2px solid ${isWin ? 'rgba(255,198,79,0.3)' : isDraw ? 'rgba(107,185,212,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
              <Trophy size={30} className={isWin ? "text-accent" : isDraw ? "text-secondary" : "text-white/30"} />
            </div>
            <h2 className="text-lg font-bold font-display text-white">{isDraw ? "SERI!" : isWin ? "Kamu Menang!" : "Kamu Kalah"}</h2>
            <p className="text-xs text-white/40 mt-0.5">{marginText}</p>
          </div>

          {/* Glass card */}
          <div className="rounded-2xl p-4 backdrop-blur-xl border border-white/10 mb-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {/* Score row */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-xs text-white/50 mb-0.5 font-semibold tracking-wide uppercase">{myName || "Kamu"}</p>
                <p className="text-2xl font-bold text-white">{myScore}</p>
              </div>
              <span className="text-sm font-bold text-white/20">VS</span>
              <div className="text-center">
                <p className="text-xs text-white/50 mb-0.5 font-semibold tracking-wide uppercase">{opponentName || "Lawan"}</p>
                <p className="text-2xl font-bold text-white">{theirScore}</p>
              </div>
            </div>

            <div className="h-px bg-white/5 mb-4" />

            {/* Compatibility */}
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-2">Kompatibilitas</p>
              <p className="text-lg font-bold font-display text-white mb-2">{compatibilityLabel || '🔄 Saling Melengkapi'}</p>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-1">
                <div className="h-full rounded-full bg-accent transition-all duration-[1500ms] ease-out" style={{ width: `${compatibility}%` }} />
              </div>
              <p className="text-sm font-bold text-accent">{compatibility}% cocok</p>
            </div>
          </div>

          {/* Insight */}
          {compatibilityInsight && (
            <div className="rounded-xl p-3 backdrop-blur-xl border border-white/10 mb-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line">{compatibilityInsight}</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky buttons */}
      <div className="shrink-0 px-4 w-full flex flex-col items-center gap-2 text-sm" style={{ paddingBottom: 'max(80px, calc(4rem + env(safe-area-inset-bottom)))' }}>
        <div className="max-w-content mx-auto w-full flex flex-col items-center gap-2">
          {rematchState === 'offering' ? (
            <div className="flex items-center gap-2 text-white/50"><Loader2 className="animate-spin" size={14} /><span className="text-xs">Menunggu {opponentName || 'lawan'}...</span></div>
          ) : rematchState === 'receiving' ? (
            <div className="w-full flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-white/70">{opponentName || 'Lawan'} ingin main lagi!</span>
              <div className="w-full flex gap-2">
                <button onClick={() => handleRespond(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-white/5 transition-colors"><X size={14} /> Tolak</button>
                <button onClick={() => handleRespond(true)} className="flex-1 py-2.5 rounded-xl bg-accent text-primary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-colors"><Check size={14} /> Terima</button>
              </div>
            </div>
          ) : rematchState === 'accepted' ? (
            <div className="flex items-center gap-2 text-green-400 text-xs"><Check size={14} /><span>Tantangan diterima! Memulai game baru...</span></div>
          ) : rematchState === 'declined' ? (
            <div className="flex items-center gap-2 text-red-400 text-xs"><X size={14} /><span>Tantangan ditolak.</span></div>
          ) : (
            <>
              <button onClick={opponentIsBot ? () => router.push('/tebak') : handleOfferRematch} className="w-full py-2.5 rounded-xl text-white/80 font-medium text-sm flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"><RotateCcw size={16} /> Main Lagi</button>
              
              <button onClick={handleBisik} disabled={bisikLoading} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer" style={{ background: 'linear-gradient(135deg, #6BB9D4, #084463)', color: '#FFFFFF', boxShadow: '0 4px 20px rgba(107,185,212,0.3)' }}>
                {bisikLoading ? <Loader2 className="animate-spin" size={16} /> : <MessageCircle size={16} />}
                {bisikState === 'sent' && !opponentIsBot ? '✅ Undangan Terkirim' : opponentIsBot ? 'Ngobrol di Bisik' : isPro ? 'Chat Langsung di Bisik' : 'Kenalan di Bisik'}
              </button>
              
              <button onClick={onHome} className="w-full py-2.5 rounded-xl text-white/40 font-medium text-xs flex items-center justify-center gap-1.5 hover:text-white/60 transition-colors cursor-pointer"><Home size={14} /> Kembali ke Home</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
