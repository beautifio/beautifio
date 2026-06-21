"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bell, ChevronDown, ChevronUp } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

const GROUPS = [
  {
    key: "forum",
    label: "Forum",
    icon: "💬",
    items: [
      { key: "circle_mention", label: "@Mention di Forum" },
      { key: "tanya_answer", label: "Pertanyaan Terjawab" },
      { key: "member_joined", label: "Anggota Baru" },
      { key: "member_left", label: "Anggota Keluar" },
      { key: "attachment_reported", label: "Konten Dilaporkan" },
      { key: "member_banned", label: "Anggota Diblokir" },
    ],
  },
  {
    key: "inspirasi",
    label: "Inspirasi",
    icon: "📖",
    items: [
      { key: "inspirasi_mention", label: "@Mention di Inspirasi" },
    ],
  },
  {
    key: "promo_event",
    label: "Promo & Event",
    icon: "🎉",
    items: [
      { key: "event", label: "Event Baru" },
      { key: "promo", label: "Promo / Voucher" },
      { key: "recommendation", label: "Rekomendasi Produk" },
    ],
  },
]

const ALL_KEYS = GROUPS.flatMap((g) => g.items.map((i) => i.key))

export default function NotifikasiPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

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

  // Set default expanded
  useEffect(() => {
    setExpanded({ forum: true, inspirasi: true, promo_event: true })
  }, [])

  const setEnabled = useCallback(async (key: string, val: boolean) => {
    if (!supabase || !user) return
    setSaving(key)
    try {
      if (key in prefs) {
        await supabase
          .from("notification_preferences")
          .update({ enabled: val })
          .eq("user_id", user.id)
          .eq("notification_type", key)
      } else {
        await supabase
          .from("notification_preferences")
          .insert({ user_id: user.id, notification_type: key, enabled: val })
      }
      setPrefs((prev) => ({ ...prev, [key]: val }))
    } catch { /* silent */ }
    setSaving(null)
  }, [prefs, user, supabase])

  const toggleItem = useCallback(async (key: string) => {
    const newVal = !prefs[key]
    await setEnabled(key, newVal)
  }, [prefs, setEnabled])

  const toggleMaster = useCallback(async (groupKey: string) => {
    const group = GROUPS.find((g) => g.key === groupKey)
    if (!group) return
    const allOn = group.items.every((item) => prefs[item.key] !== false)
    const newVal = !allOn
    for (const item of group.items) {
      await setEnabled(item.key, newVal)
    }
  }, [prefs, setEnabled])

  const getMasterState = (groupKey: string) => {
    const group = GROUPS.find((g) => g.key === groupKey)
    if (!group) return "off"
    const enabled = group.items.filter((i) => prefs[i.key] !== false).length
    const total = group.items.length
    if (enabled === 0) return "off"
    if (enabled === total) return "on"
    return "mixed"
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pb-20">
        <Header />
        <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <Header />

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {GROUPS.map((group) => {
          const masterState = getMasterState(group.key)
          const isExpanded = expanded[group.key]
          return (
            <div key={group.key} className="rounded-xl border border-border overflow-hidden">
              {/* Master toggle */}
              <div className="flex items-center gap-3 px-4 py-3.5 bg-surface/50">
                <span className="text-lg">{group.icon}</span>
                <button
                  onClick={() => toggleMaster(group.key)}
                  className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer ${
                    masterState === "on" ? "bg-primary" : masterState === "mixed" ? "bg-primary/60" : "bg-border"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                      masterState === "on" || masterState === "mixed" ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="flex-1 text-sm font-bold text-text-primary">{group.label}</span>
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [group.key]: !prev[group.key] }))}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Sub-items */}
              {isExpanded && (
                <div className="divide-y divide-border">
                  {group.items.map((item) => {
                    const enabled = prefs[item.key] !== false
                    return (
                      <div key={item.key} className="flex items-center gap-3 px-4 py-3 bg-bg">
                        <button
                          onClick={() => toggleItem(item.key)}
                          disabled={masterState === "off" || saving === item.key}
                          className={`relative w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
                            enabled && masterState !== "off" ? "bg-primary" : "bg-border"
                          } ${masterState === "off" ? "opacity-30" : ""}`}
                        >
                          <div
                            className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${
                              enabled && masterState !== "off" ? "translate-x-[19px]" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span className={`text-xs flex-1 ${masterState === "off" ? "text-text-secondary/50" : "text-text-secondary"}`}>
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Header() {
  const router = useRouter()
  return (
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
  )
}
