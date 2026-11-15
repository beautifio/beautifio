"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle, LogIn, LogOut, Clock } from 'lucide-react'

async function fetchCurrentUser() {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.data || null;
}

export default function VolunteerDashboard() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [pastChats, setPastChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    ;(async () => {
      const user = await fetchCurrentUser()
      if (!user) { router.push('/login'); return }

      // Get volunteer status
      const { data: officer } = await supabase.from('care_officers')
        .select('is_online').eq('user_id', user.id).single()
      setIsOnline(officer?.is_online || false)

      // Get active chats
      const { data: active } = await supabase.from('care_chat_sessions')
        .select('id, user_name, category, created_at')
        .eq('officer_id', user.id).eq('status', 'active')
        .order('created_at', { ascending: false })
      setActiveChats(active || [])

      // Get past chats
      const { data: past } = await supabase.from('care_chat_sessions')
        .select('id, user_name, category, created_at')
        .eq('officer_id', user.id).eq('status', 'closed')
        .order('created_at', { ascending: false }).limit(20)
      setPastChats(past || [])

      setLoading(false)
    })()
  }, [router])

  const toggleOnline = async () => {
    const supabase = createClient()
    if (!supabase) return
    const user = await fetchCurrentUser()
    if (!user) return

    const newStatus = !isOnline
    setIsOnline(newStatus)
    await supabase.from('care_officers').update({ is_online: newStatus }).eq('user_id', user.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-content mx-auto px-4 py-6">
        <h1 className="text-lg font-bold text-text-primary mb-1">Panel Volunteer</h1>
        <p className="text-sm text-text-secondary mb-4">Kelola chat yang kamu handle</p>

        {/* Toggle Online */}
        <button onClick={toggleOnline} className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors mb-5 ${isOnline ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-success text-white'}`}>
          {isOnline ? <><LogOut size={16} /> Set Offline</> : <><LogIn size={16} /> Set Online</>}
        </button>

        {/* Active Chats */}
        <h2 className="text-sm font-bold text-text-primary mb-2">
          <MessageCircle size={14} className="inline mr-1" /> Chat Aktif ({activeChats.length})
        </h2>
        {activeChats.length === 0 ? (
          <p className="text-xs text-text-secondary mb-5">Belum ada chat aktif</p>
        ) : (
          <div className="space-y-2 mb-5">
            {activeChats.map(c => (
              <button key={c.id} onClick={() => router.push(`/admin/care/chat/${c.id}`)} className="w-full p-3 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors text-left cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{c.user_name}</p>
                    <p className="text-xs text-text-secondary">{c.category}</p>
                  </div>
                  <Clock size={14} className="text-text-secondary/50" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Past Chats */}
        <h2 className="text-sm font-bold text-text-primary mb-2">Riwayat Chat ({pastChats.length})</h2>
        {pastChats.length === 0 ? (
          <p className="text-xs text-text-secondary">Belum ada riwayat</p>
        ) : (
          <div className="space-y-2">
            {pastChats.map(c => (
              <button key={c.id} onClick={() => router.push(`/admin/care/chat/${c.id}`)} className="w-full p-3 rounded-xl bg-surface border border-border hover:border-primary/30 transition-colors text-left cursor-pointer opacity-70">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{c.user_name}</p>
                    <p className="text-xs text-text-secondary">{c.category}</p>
                  </div>
                  <span className="text-[10px] text-text-secondary/50">Selesai</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
