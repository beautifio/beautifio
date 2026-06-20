"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, ExternalLink, Crown, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/use-auth"

interface Plan {
  id: string
  name: string
  duration_type: string
  price_idr: number
  max_active_chats: number
  features: string[]
  display_order: number
}

export default function UpgradePage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [bankAccount, setBankAccount] = useState("")
  const [waLink, setWaLink] = useState("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    ;(async () => {
      const [plansRes, settingsRes] = await Promise.all([
        supabase.from("subscription_plans").select("*").eq("is_active", true).order("display_order"),
        supabase.from("app_settings").select("key, value").in("key", ["payment_bank_account", "payment_wa_link"]),
      ])
      setPlans(plansRes.data ?? [])
      const s = settingsRes.data ?? []
      setBankAccount(s.find((x) => x.key === "payment_bank_account")?.value ?? "")
      setWaLink(s.find((x) => x.key === "payment_wa_link")?.value ?? "")
      if (plansRes.data?.length) setSelectedPlan(plansRes.data[1]?.id ?? plansRes.data[0].id)
      setLoading(false)
    })()
  }, [])

  const selected = plans.find((p) => p.id === selectedPlan)

  const formatPrice = (v: number) =>
    `Rp ${v.toLocaleString("id-ID")}`

  const handleCopy = () => {
    if (!selected || !user) return
    const text = `Halo, saya mau subscribe ${selected.name} (${formatPrice(selected.price_idr)}). Username: ${user.email}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleWA = () => {
    if (!selected || !user || !waLink) return
    const text = encodeURIComponent(
      `Halo, saya mau subscribe ${selected.name} (${formatPrice(selected.price_idr)}). Username: ${user.email}`,
    )
    window.open(`${waLink}?text=${text}`, "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-content mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary mb-6 cursor-pointer"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Crown size={32} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">Upgrade ke Bisik Pro</h1>
          <p className="text-sm text-text-secondary mt-1">Ngobrol lebih banyak, lebih dalam.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {plans.map((plan) => {
            const isSelected = plan.id === selectedPlan
            const isBest = plan.duration_type === "monthly"
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#FFC64F] bg-amber-50/50 shadow-md"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                {isBest && (
                  <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-[#FFC64F] text-[10px] font-bold text-[#084463]">
                    TERBAIK
                  </span>
                )}
                <p className="text-sm font-bold text-text-primary">{plan.name}</p>
                <p className="text-2xl font-bold text-[#084463] mt-2">{formatPrice(plan.price_idr)}</p>
                <p className="text-[10px] text-text-secondary mt-3">Fitur:</p>
                <ul className="mt-1 space-y-1">
                  {(plan.features as string[]).map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-secondary">
                      <Check size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="p-5 rounded-2xl bg-[#084463] text-white text-center mb-8">
            <p className="text-sm opacity-80">Kamu pilih</p>
            <p className="text-lg font-bold mt-1">
              {selected.name} — {formatPrice(selected.price_idr)}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Hingga {selected.max_active_chats} obrolan aktif
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Cara Pembayaran
          </p>

          {bankAccount && (
            <div className="mb-4">
              <p className="text-xs text-text-secondary mb-1">Transfer ke:</p>
              <p className="text-sm font-bold text-text-primary">{bankAccount}</p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <Copy size={14} />
              {copied ? "Tersalin!" : "Copy Pesan"}
            </button>
            {waLink && (
              <button
                onClick={handleWA}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors cursor-pointer"
              >
                <ExternalLink size={14} />
                Konfirmasi via WA
              </button>
            )}
          </div>

          <p className="text-[11px] text-text-secondary text-center">
            Pembayaran diproses manual oleh tim Beautifio. Akun Pro aktif dalam 1x24 jam setelah konfirmasi.
          </p>
        </div>
      </div>
    </div>
  )
}
