"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Compass, ArrowRight, Brain, Heart, Briefcase, Sparkles, Crown, Clock, CheckCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const MODULES = [
  { key: "personality", title: "Kenali Kepribadianmu", desc: "Pahami karakter dan gaya komunikasimu melalui 20-120 soal eksplorasi diri.", icon: Brain, color: "#6BB9D4", qty: 20, time: "3-15" },
  { key: "interest", title: "Temukan Minat Karirmu", desc: "Eksplorasi tipe pekerjaan yang sesuai dengan minatmu.", icon: Briefcase, color: "#FFC64F", qty: 30, time: "5-15" },
  { key: "values", title: "Pahami Nilai Hidupmu", desc: "Temukan apa yang paling kamu yakini dan prioritaskan dalam hidup.", icon: Heart, color: "#084463", qty: 40, time: "5-10" },
]

const DIM_LITE: Record<string, string[]> = {
  personality: ["O","C","E","A","N"],
  interest: ["R","I","A2","S","E2","C2"],
  values: ["SD","PO","UN","AC","SE","ST","CO","TR","BE","HE"],
}
const DIM_SHORT: Record<string, string> = {
  O:"Keterbukaan",C:"Ketelitian",E:"Ekstraversi",A:"Keramahan",N:"Neurotisme",
  R:"Realistic",I:"Investigative",A2:"Artistic",S:"Social",E2:"Enterprising",C2:"Conventional",
  SD:"Mandiri",PO:"Pengaruh",UN:"Universal",AC:"Prestasi",SE:"Aman",
  ST:"Stimulasi",CO:"Kesesuaian",TR:"Tradisi",BE:"Peduli",HE:"Nikmat",
}

export default function TesDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [isUltimate, setIsUltimate] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!supabase || !user) return
    supabase.from("user_test_results").select("module, scores, completed_at")
      .eq("user_id", user.id).order("completed_at", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, any> = {}
        data?.forEach((r: any) => { if (!map[r.module]) map[r.module] = r })
        setResults(map)
        setLoading(false)
      }, () => { setLoading(false) })

    // Get user tier for retake info
    supabase!.from("user_subscriptions").select("plan_id").eq("user_id", user.id).eq("status", "active")
      .gt("expires_at", new Date().toISOString()).maybeSingle().then(({ data: sub }) => {
        if (!sub) return
        supabase!.from("subscription_plans").select("tier").eq("id", sub.plan_id).single().then(({ data: plan }) => {
          if (plan?.tier === "ultimate") setIsUltimate(true)
          else if (plan?.tier === "pro") setIsPro(true)
        })
      }, () => {})
  }, [user, authLoading])

  const doneModules = Object.keys(results)
  const hasAnyResult = doneModules.length > 0
  const canRetake = (mod: string) => {
    const r = results[mod]
    if (!r) return true
    return (Date.now() - new Date(r.completed_at).getTime()) > 90 * 24 * 60 * 60 * 1000
  }

  const daysUntilRetake = (mod: string) => {
    const r = results[mod]
    if (!r) return 0
    const elapsed = (Date.now() - new Date(r.completed_at).getTime()) / (24 * 60 * 60 * 1000)
    return Math.max(0, Math.ceil(90 - elapsed))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  )

  return (
    <div className="min-h-screen pb-24 bg-bg">
      {/* Hero — gradient Peacock */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #084463 0%, #0A1628 100%)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: "#FFC64F" }} />
        <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ background: "#6BB9D4" }} />
        
        <div className="max-w-content mx-auto px-5 py-10 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Compass size={32} style={{ color: "#FFC64F" }} />
          </div>
          <h1 className="text-xl font-bold mb-2 font-display" style={{ color: "#FFFFFF" }}>Eksplorasi Diri</h1>
          <p className="text-sm leading-relaxed max-w-sm mx-auto text-white/70">
            Kenali kepribadian, minat, dan nilai hidupmu. Hasil bersifat eksploratif — bukan diagnosis.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px] font-medium text-white/50">
            <span>✅ 3 tes singkat</span>
            <span>⏱ ±3-5 menit/modul</span>
            <span>🆓 Gratis</span>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-5 pt-6">
        {/* Summary */}
        <div className="p-4 rounded-2xl border mb-5 bg-surface shadow-sm">
          <h3 className="text-xs font-bold mb-3 text-text-primary">📊 Rangkuman Hasil</h3>
          {!hasAnyResult ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🧭</div>
              <p className="text-xs font-semibold text-text-primary mb-1">Mulai perjalanan mengenal dirimu</p>
              <p className="text-[10px] text-text-secondary/50 mb-3">Belum ada hasil tes. Ambil tes pertamamu di bawah.</p>
              <button onClick={() => router.push("/tes-arah-hidup/personality?lite=true")}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>
                🧠 Mulai Tes Kepribadian
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {MODULES.map(m => {
                const r = results[m.key]
                const dims = DIM_LITE[m.key] || []
                const scores = r ? (typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores) : null
                return (
                  <div key={m.key} className="flex items-center gap-2">
                    <m.icon size={14} style={{ color: r ? m.color : undefined }} className={r ? "" : "text-muted"} />
                    {r ? (
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-text-primary">{m.title.split(" ").slice(1).join(" ")}</span>
                        <span className="text-[10px] text-text-secondary">
                          {dims.slice(0, 3).map(d => `${DIM_SHORT[d]||d}:${scores?.[d]?.toFixed?.(1)||scores?.[d]||"?"}`).join(" ")}
                        </span>
                        {canRetake(m.key) ? (
                          <button onClick={() => router.push(`/tes-arah-hidup/${m.key}?lite=true`)} className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 cursor-pointer bg-primary/5 text-primary">Retake</button>
                        ) : (
                          <span className="text-[9px] text-text-secondary/50 shrink-0" title={isUltimate ? "Kamu bisa retake kapan saja" : isPro ? `${daysUntilRetake(m.key)} hari lagi` : "Upgrade ke Pro untuk retake"}>
                            <Clock size={11} className="text-muted" /> {isUltimate ? "" : isPro ? `${daysUntilRetake(m.key)}h` : ""}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary">Belum tes</span>
                    )}
                  </div>
                )
              })}
              <button onClick={() => router.push("/tes-arah-hidup/hasil")}
                className="w-full mt-1 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer border border-primary text-primary hover:bg-primary/5 transition-colors">
                Lihat Detail →
              </button>
            </div>
          )}
        </div>

        {/* Module Cards */}
        <p className="text-[10px] font-semibold tracking-widest uppercase text-text-secondary mb-3">Modul Tes</p>
        <div className="space-y-3 mb-5">
          {MODULES.map(m => {
            const done = !!results[m.key]
            return (
              <div key={m.key} className="p-4 rounded-2xl border bg-surface shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ borderColor: done ? m.color : "#E2E8F0", borderLeftWidth: "3px", borderLeftColor: m.color }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 backdrop-blur-sm"
                    style={{ background: `${m.color}18`, border: `1px solid ${m.color}30` }}>
                    <m.icon size={18} style={{ color: m.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold font-display text-text-primary">{m.title}</h4>
                      {done && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-success/10 text-success flex items-center gap-0.5"><CheckCircle size={10} /></span>}
                    </div>
                    <p className="text-[11px] leading-relaxed mb-2 text-text-secondary">{m.desc}</p>
                    <div className="flex items-center gap-2">
                      {(isPro || isUltimate) && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">Pro</span>
                      )}
                      {done && !canRetake(m.key) ? (
                        <span className="text-[10px] text-text-secondary/50" title={isUltimate ? "Kamu bisa retake kapan saja" : isPro ? `${daysUntilRetake(m.key)} hari lagi` : "Upgrade ke Pro untuk retake"}>
                          ⏰ {isUltimate ? "Retake" : isPro ? `${daysUntilRetake(m.key)}h` : "🔒 Pro"}
                        </span>
                      ) : (
                        <button onClick={() => router.push(`/tes-arah-hidup/${m.key}?lite=true`)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-white transition-colors"
                          style={{ background: m.color }}>
                          {done ? "Retake" : "Mulai Tes"} <ArrowRight size={11} />
                        </button>
                      )}
                      {(isPro || isUltimate) && (
                        <button onClick={() => router.push(`/tes-arah-hidup/${m.key}`)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors"
                          style={{ borderColor: m.color, color: m.color, background: m.color + '10' }}>
                          Pro <ArrowRight size={10} />
                        </button>
                      )}
                      <span className="text-[10px] text-text-secondary">{m.qty} soal · ±{m.time} menit · Gratis</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Upgrade CTA for completed testers */}
        {hasAnyResult && !isPro && !isUltimate && (
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-center mb-4">
            <p className="text-xs text-amber-700">
              Kamu sudah menyelesaikan tes. <strong>Upgrade ke Pro</strong> untuk retake kapan saja dan akses tes 120 soal.
            </p>
          </div>
        )}

        {/* Apa Selanjutnya? */}
        <h3 className="text-xs font-bold mb-3 flex items-center gap-1.5 text-text-primary">📈 Apa Selanjutnya?</h3>

        {/* Pro Card — full Peacock */}
        <div className="p-5 rounded-2xl mb-4" style={{ background: "#084463", color: "#FFFFFF" }}>
          <div className="flex items-center gap-2 mb-2">
            <Crown size={16} style={{ color: "#FFC64F" }} />
            <span className="text-xs font-bold">Versi Pro</span>
          </div>
          <p className="text-[11px] leading-relaxed mb-4 text-white/70">
            Ingin hasil yang lebih mendalam? Tes 340 soal standar internasional (IPIP-120, O*NET-60, PVQ-40) dengan laporan komprehensif, analisis per dimensi, rekomendasi karir detail, dan PDF export. Bonus: 1 sesi konsultasi 30 menit gratis.
          </p>
          <button onClick={() => router.push("/bisik/upgrade")}
            className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-2 border-white/30 text-white hover:bg-white/10 transition-colors">
            Lihat Paket Pro →
          </button>
        </div>

        {/* Konsultasi — Saffron accent */}
        <div className="p-5 rounded-2xl mb-5" style={{ background: "rgba(255,198,79,0.06)", border: "1px solid rgba(255,198,79,0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} style={{ color: "#FFC64F" }} />
            <span className="text-xs font-bold text-text-primary">Konsultasi dengan Psikolog</span>
          </div>
          <p className="text-[11px] leading-relaxed mb-3 text-text-secondary">
            Mau hasilmu dibacakan langsung oleh psikolog profesional? Booking sesi 1-on-1 via chat. Psikolog akan jelaskan tiap dimensi, kaitkan dengan situasimu, dan berikan saran pengembangan personal.
          </p>
          <div className="flex gap-2 mb-3">
            <span className="text-[10px] px-2 py-1 rounded-lg font-semibold bg-primary/5 text-primary">30 menit · Rp 50K</span>
            <span className="text-[10px] px-2 py-1 rounded-lg font-semibold bg-primary/5 text-primary">60 menit · Rp 90K</span>
          </div>
          <button onClick={() => router.push("/tes-arah-hidup/konsultasi")}
            className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-2 border-accent text-primary hover:bg-accent/5 transition-colors">
            Pilih Psikolog →
          </button>
        </div>
      </div>
    </div>
  )
}
