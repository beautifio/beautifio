"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Home, RotateCcw, Loader2, X, Check } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { offerRematch, respondToRematch } from "@/lib/tebak/actions"
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
  onHome: () => void
}

export function WinnerScreen({ session, isPlayerA, userId, opponentId, opponentName, myName, compatibility, onHome }: Props) {
  const router = useRouter()
  const myScore = isPlayerA ? session.score_a : session.score_b
  const theirScore = isPlayerA ? session.score_b : session.score_a
  const isWin = myScore > theirScore
  const isDraw = myScore === theirScore
  
  const [rematchState, setRematchState] = useState<'idle' | 'offering' | 'receiving' | 'accepted' | 'declined'>('idle')
  const [rematchOffer, setRematchOffer] = useState<RematchOffer | null>(null)

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
    return () => { supabase.removeChannel(channel) }
  }, [session.id, userId, router])

  const handleOfferRematch = async () => {
    setRematchState('offering')
    try {
      await offerRematch(session.id, opponentId)
    } catch (err) {
      console.error(err)
      setRematchState('idle') // Reset on error
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

  const RematchUI = () => {
    switch (rematchState) {
      case 'offering':
        return <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin" /><span>Menunggu {opponentName || 'lawan'}...</span></div>
      case 'receiving':
        return (
          <div className="w-full max-w-xs flex flex-col items-center gap-3">
            <span className="text-sm font-semibold">{opponentName || 'Lawan'} ingin main lagi!</span>
            <div className="w-full flex gap-3">
              <button onClick={() => handleRespond(false)} className="flex-1 py-3 rounded-xl border border-border text-text-secondary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"><X size={16} /> Tolak</button>
              <button onClick={() => handleRespond(true)} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"><Check size={16} /> Terima</button>
            </div>
          </div>
        )
      case 'accepted':
        return <div className="flex flex-col items-center gap-2 text-green-600"><Check /><span>Tantangan diterima! Memulai game baru...</span></div>
      case 'declined':
        return <div className="flex flex-col items-center gap-2 text-red-500"><X /><span>{rematchOffer?.offered_by_id === userId ? `${opponentName || 'Lawan'} menolak` : 'Tantangan ditolak'}.</span></div>
      case 'idle':
      default:
        return (
          <>
            <button onClick={handleOfferRematch} className="w-full max-w-xs py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"><RotateCcw size={16} /> Main Lagi</button>
            <button onClick={onHome} className="w-full max-w-xs py-3 rounded-xl border border-border text-text-secondary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface transition-colors cursor-pointer"><Home size={16} /> Kembali ke Home</button>
          </>
        )
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
  
  let marginText: string;
  if (isDraw) marginText = "SERI! Tidak ada yang menang hari ini 😅"
  else if (margin < 10) marginText = "Sengit sekali!"
  else if (margin <= 30) marginText = "Kemenangan solid!"
  else marginText = "Dominasi total!"

  return (
    <div className="flex-1 flex flex-col px-4 py-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => <div key={i} className="absolute w-2 h-2 rounded-full opacity-70" style={{ left: p.left, top: `-10px`, backgroundColor: p.color, animation: p.anim }}/>)}
      </div>
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-10px); } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }`}</style>

      <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
        <div className="p-6 flex flex-col items-center gap-4 relative z-10 min-h-[420px]">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isWin ? "bg-yellow-100" : isDraw ? "bg-blue-100" : "bg-gray-100"}`}>
            <Trophy size={40} className={isWin ? "text-yellow-500 animate-pulse" : isDraw ? "text-blue-500" : "text-gray-400"} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">{isDraw ? "SERI!" : isWin ? "Kamu Menang!" : "Kamu Kalah"}</h2>
          <p className="text-sm text-text-secondary">{marginText}</p>
          <p className="text-lg font-bold text-text-primary">{myScore} - {theirScore}</p>
          
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border"><span className="text-sm text-text-secondary">{myName || "Kamu"}</span><span className="text-sm font-bold text-text-primary">{myScore} poin</span></div>
            <div className="flex justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border"><span className="text-sm text-text-secondary">{opponentName || "Lawan"}</span><span className="text-sm font-bold text-text-primary">{theirScore} poin</span></div>
          </div>
          
          <div className="w-full max-w-xs mt-2"><div className="p-4 rounded-xl bg-muted/50 border border-border text-center"><p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary mb-2">Tingkat Kecocokan</p><div className="h-2 rounded-full bg-muted overflow-hidden mb-2"><div className={`h-full rounded-full transition-all duration-1000 ${compatibility <= 30 ? "bg-red-400" : compatibility <= 60 ? "bg-orange-400" : compatibility <= 85 ? "bg-green-400" : "bg-accent"}`} style={{ width: `${compatibility}%` }}/></div><p className={`text-sm font-bold ${compatibility <= 30 ? "text-red-500" : compatibility <= 60 ? "text-orange-500" : compatibility <= 85 ? "text-green-600" : "text-accent"}`}>{compatibility <= 30 ? "Kurang cocok" : compatibility <= 60 ? "Cukup cocok" : compatibility <= 85 ? "Cocok!" : "Soulmate! 😱"}</p></div></div>

          <div className="mt-auto pt-4 w-full flex flex-col items-center gap-3 text-sm">
            <RematchUI />
          </div>
        </div>
      </div>
    </div>
  )
}
