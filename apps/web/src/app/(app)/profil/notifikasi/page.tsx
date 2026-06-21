"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, Check } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardHeader, CardTitle, CardContent } from "@beautifio/ui"
import { useAuth } from "@/hooks/use-auth"

const NOTIF_TYPES: { key: string; label: string; desc: string }[] = [
  { key: "circle_mention", label: "@Mention di Forum", desc: "Seseorang menyebut namamu di obrolan forum" },
  { key: "inspirasi_mention", label: "@Mention di Inspirasi", desc: "Seseorang menyebut namamu di artikel" },
  { key: "tanya_answer", label: "Pertanyaan Terjawab", desc: "Pertanyaanmu di forum mendapat jawaban" },
  { key: "member_joined", label: "Anggota Baru", desc: "Ada anggota baru bergabung di forummua" },
  { key: "member_left", label: "Anggota Keluar", desc: "Ada anggota keluar dari forummua" },
  { key: "attachment_reported", label: "Konten Dilaporkan", desc: "Ada attachment di forummu yang dilaporkan" },
  { key: "member_banned", label: "Anggota Diblokir", desc: "Anggota forum terkena banned" },
]

export default function NotifikasiPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !supabase) return
    ;(async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
      if (data) {
        const map: Record<string, boolean> = {}
        data.forEach((p) => { map[p.notification_type] = p.enabled })
        setPrefs(map)
      }
      setLoading(false)
    })()
  }, [user])

  const toggle = async (key: string) => {
    if (!supabase || !user) return
    const newVal = !prefs[key]
    setPrefs((prev) => ({ ...prev, [key]: newVal }))
    setSaving(key)
    try {
      if (key in prefs) {
        await supabase
          .from("notification_preferences")
          .update({ enabled: newVal })
          .eq("user_id", user.id)
          .eq("notification_type", key)
      } else {
        await supabase
          .from("notification_preferences")
          .insert({ user_id: user.id, notification_type: key, enabled: newVal })
      }
    } catch { /* silent */ }
    setSaving(null)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="sticky top-0 bg-bg border-b border-border z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-bold text-text-primary">Pengaturan Notifikasi</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : (
          NOTIF_TYPES.map((nt) => {
            const enabled = prefs[nt.key] !== false
            return (
              <Card key={nt.key} padding="md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{nt.label}</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">{nt.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(nt.key)}
                    disabled={saving === nt.key}
                    className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${
                      enabled ? "bg-primary" : "bg-border"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                        enabled ? "translate-x-[22px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
