"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Clock, User, Check, Star } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

export default function KonsultasiPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [psychologists, setPsychologists] = useState<any[]>([])
  const [pricing, setPricing] = useState<any[]>([])
  const [vouchers, setVouchers] = useState<any[]>([])
  const [selectedPsy, setSelectedPsy] = useState<string | null>(null)
  const [selectedDur, setSelectedDur] = useState<number | null>(null)
  const [voucherCode, setVoucherCode] = useState("")
  const [voucherData, setVoucherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!supabase) return
    Promise.all([
      supabase.from("psychologists").select("*").eq("is_verified", true).eq("is_active", true),
      supabase.from("consultation_pricing").select("*").eq("is_active", true),
      supabase.from("consultation_vouchers").select("id, code, discount_type, discount_value, is_active").eq("is_active", true),
    ]).then(([r1, r2, r3]) => {
      setPsychologists(r1.data || [])
      setPricing(r2.data || [])
      setVouchers(r3.data || [])
      setLoading(false)
    })
  }, [user, authLoading])

  const applyVoucher = () => {
    if (!voucherCode.trim()) return
    const v = vouchers.find(v => v.code.toUpperCase() === voucherCode.trim().toUpperCase())
    if (v) {
      const now = new Date()
      if (v.valid_until && new Date(v.valid_until) < now) { setVoucherData({ error: "Voucher kadaluarsa" }); return }
      if (v.max_uses && v.used_count >= v.max_uses) { setVoucherData({ error: "Kuota habis" }); return }
      setVoucherData(v)
      setError("")
    } else {
      setVoucherData({ error: "Kode tidak valid" })
    }
  }

  const selectedPrice = selectedDur ? pricing.find(p => p.id === selectedDur) : null
  const basePrice = selectedPrice?.net_price || 0
  const discountAmount = voucherData?.discount_type === "percentage"
    ? Math.round(basePrice * (voucherData.discount_value / 100))
    : voucherData?.discount_type === "nominal" ? voucherData.discount_value : 0
  const finalPrice = Math.max(0, basePrice - discountAmount)

  const handlePay = async () => {
    if (!selectedPsy || !selectedDur || !user) return
    setPayLoading(true)
    setError("")

    // Create consultation session
    const { data: session } = await supabase!.from("consultation_sessions").insert({
      user_id: user.id, psychologist_id: selectedPsy,
      duration_minutes: selectedPrice?.duration_minutes || 60,
      net_price: finalPrice, gross_price: selectedPrice?.gross_price || 0,
      voucher_code: voucherData?.code || null, status: "pending_payment",
    }).select().single()

    if (!session) { setError("Gagal membuat sesi"); setPayLoading(false); return }

    // Create Doku payment
    const res = await fetch("/api/payment/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: "custom", amount: finalPrice, sub_type: "consultation", ref_id: session.id }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error || "Gagal"); setPayLoading(false); return }
    if (json.payment_url) window.location.href = json.payment_url
    else router.push("/tes-arah-hidup")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} />
    </div>
  )

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-5 pt-6">
        <button onClick={() => router.push("/tes-arah-hidup")} className="flex items-center gap-1 text-sm cursor-pointer mb-4" style={{ color: "#647488" }}><ArrowLeft size={16} /> Kembali</button>
        <h1 className="text-lg font-bold mb-4" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Booking Konsultasi</h1>

        {/* Step 1: Pick Psychologist */}
        <p className="text-xs font-semibold mb-2" style={{ color: "#647488" }}>1. Pilih Psikolog</p>
        <div className="space-y-2 mb-4">
          {psychologists.map(p => (
            <button key={p.id} onClick={() => setSelectedPsy(p.id)}
              className={`w-full text-left p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPsy === p.id ? "border-[#084463] bg-[#084463]/3" : "border-[#E2E8F0] bg-white"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "#6BB9D4", color: "#FFFFFF" }}>
                  {p.full_name?.charAt(0) || "?"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>{p.full_name}</p>
                  <p className="text-[10px]" style={{ color: "#647488" }}>{p.credentials || "Psikolog"} · {p.experience_years || 0}+ thn pengalaman</p>
                </div>
                <Star size={14} style={{ color: selectedPsy === p.id ? "#FFC64F" : "#E2E8F0" }} />
              </div>
            </button>
          ))}
        </div>

        {/* Step 2: Pick Duration */}
        <p className="text-xs font-semibold mb-2" style={{ color: "#647488" }}>2. Pilih Durasi</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {pricing.map(p => (
            <button key={p.id} onClick={() => setSelectedDur(p.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer text-center transition-all ${selectedDur === p.id ? "border-[#084463] bg-[#084463]/3" : "border-[#E2E8F0] bg-white"}`}>
              <Clock size={14} className="mx-auto mb-1" style={{ color: selectedDur === p.id ? "#084463" : "#647488" }} />
              <p className="text-xs font-bold" style={{ color: "#1E2938" }}>{p.duration_minutes} menit</p>
              <p className="text-[10px] font-semibold" style={{ color: "#FFC64F" }}>Rp {p.net_price.toLocaleString("id-ID")}</p>
            </button>
          ))}
        </div>

        {/* Step 3: Voucher */}
        <p className="text-xs font-semibold mb-2" style={{ color: "#647488" }}>3. Kode Promo (opsional)</p>
        <div className="flex gap-2 mb-4">
          <input value={voucherCode} onChange={e => { setVoucherCode(e.target.value); setVoucherData(null); }}
            placeholder="Kode voucher" className="flex-1 px-3 py-2 rounded-lg text-xs border outline-none uppercase" style={{ borderColor: "#E2E8F0" }} />
          <button onClick={applyVoucher} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>Pakai</button>
        </div>
        {voucherData?.error && <p className="text-xs mb-2" style={{ color: "#EF4444" }}>{voucherData.error}</p>}
        {voucherData?.discount_type && (
          <div className="p-2 rounded-lg mb-4 text-xs" style={{ background: "rgba(34,197,94,0.06)", color: "#22C55E" }}>
            Diskon: -Rp {discountAmount.toLocaleString("id-ID")} — Final: Rp {finalPrice.toLocaleString("id-ID")}
          </div>
        )}

        {/* Error */}
        {error && <p className="text-xs mb-3" style={{ color: "#EF4444" }}>{error}</p>}

        {/* CTA */}
        <button onClick={handlePay} disabled={!selectedPsy || !selectedDur || payLoading}
          className="w-full py-3.5 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 text-white"
          style={{ background: "#084463" }}>
          {payLoading ? "Memproses..." : `Bayar Rp ${finalPrice.toLocaleString("id-ID")}`}
        </button>
      </div>
    </div>
  )
}
