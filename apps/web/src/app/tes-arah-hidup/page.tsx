"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Compass, ArrowRight, Brain, Heart, Briefcase, Sparkles, Crown, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const MODULES = [
  { key: "personality", title: "Kenali Kepribadianmu", desc: "5 dimensi OCEAN yang membentuk karaktermu. Cocok untuk memahami cara kerja & gaya komunikasi.", icon: Brain, color: "#6BB9D4", qty: 20, time: "3" },
  { key: "interest", title: "Temukan Minat Karirmu", desc: "6 tipe RIASEC + Holland Code untuk rekomendasi karir dan jurusan yang pas buatmu.", icon: Briefcase, color: "#FFC64F", qty: 20, time: "3" },
  { key: "values", title: "Pahami Nilai Hidupmu", desc: "10 nilai Schwartz yang mengungkap apa yang paling kamu yakini dan prioritaskan dalam hidup.", icon: Heart, color: "#084463", qty: 20, time: "3" },
]

const DIM_LITE: Record<string, string[]> = {
  personality: ["O","C","E","A","N"],
  interest: ["R","I","A","S","E","C"],
  values: ["SD","PO","UN","AC","SE","ST","CO","TR","BE","HE"],
}
const DIM_SHORT: Record<string, string> = {
  O:"Ketrbukaan",C:"Ketelitian",E:"Ekstraversi",A:"Altruisme",N:"Emosi",
  R:"Realistic",I:"Investigative",A2:"Artistic",S:"Social",E2:"Enterprising",C2:"Conventional",
  SD:"Mandiri",PO:"Pengaruh",UN:"Universal",AC:"Prestasi",SE:"Aman",
  ST:"Stimulasi",CO:"Kesesuaian",TR:"Tradisi",BE:"Peduli",HE:"Nikmat",
}

export default function TesDashboard() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

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
      })
  }, [user, authLoading])

  const doneModules = Object.keys(results)
  const hasAnyResult = doneModules.length > 0
  const allDone = doneModules.length === 3
  const canRetake = (mod: string) => {
    const r = results[mod]
    if (!r) return true
    return (Date.now() - new Date(r.completed_at).getTime()) > 90 * 24 * 60 * 60 * 1000
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[#084463]" />
    </div>
  )

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-5 pt-6">
        {/* Hero */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(8,68,99,0.08)" }}>
            <Compass size={28} style={{ color: "#084463" }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Tes Arah Hidup</h1>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "#647488" }}>
            Bingung mau jadi apa? Jurusan apa yang cocok? Pekerjaan apa yang sesuai dengan kepribadianmu?
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-[11px]" style={{ color: "#647488" }}>
            <span>✅ 3 tes singkat</span>
            <span>⏱ ±3-5 menit/modul</span>
            <span>🆓 Gratis</span>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl border mb-4" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
          <h3 className="text-xs font-bold mb-3" style={{ color: "#1E2938" }}>📊 Rangkuman Hasil</h3>
          {!hasAnyResult ? (
            <div className="space-y-2">
              {MODULES.map(m => (
                <div key={m.key} className="flex items-center gap-2 text-xs" style={{ color: "#647488" }}>
                  <m.icon size={14} style={{ color: "#E2E8F0" }} />
                  <span>{m.title.split(" ").slice(1).join(" ")} — Belum tes</span>
                </div>
              ))}
              <p className="text-[10px] italic mt-1" style={{ color: "#647488" }}>Ambil tes pertama di bawah ini ↓</p>
            </div>
          ) : (
            <div className="space-y-2">
              {MODULES.map(m => {
                const r = results[m.key]
                const dims = DIM_LITE[m.key] || []
                const scores = r ? (typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores) : null
                return (
                  <div key={m.key} className="flex items-center gap-2">
                    <m.icon size={14} style={{ color: r ? m.color : "#E2E8F0" }} />
                    {r ? (
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-[10px] font-semibold" style={{ color: "#1E2938" }}>{m.title.split(" ").slice(1).join(" ")}</span>
                        <span className="text-[10px]" style={{ color: "#647488" }}>
                          {dims.slice(0, 3).map(d => `${DIM_SHORT[d]||d}:${scores?.[d]?.toFixed?.(1)||scores?.[d]||"?"}`).join(" ")}
                        </span>
                        {canRetake(m.key) && (
                          <button onClick={() => router.push(`/tes-arah-hidup/${m.key}?lite=true`)} className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>Retake</button>
                        )}
                        {!canRetake(m.key) && <Clock size={11} style={{ color: "#E2E8F0" }} />}
                      </div>
                    ) : (
                      <span className="text-xs" style={{ color: "#647488" }}>Belum tes</span>
                    )}
                  </div>
                )
              })}
              <button onClick={() => router.push("/tes-arah-hidup/hasil")}
                className="w-full mt-1 py-1.5 rounded-lg text-[10px] font-semibold cursor-pointer border" style={{ borderColor: "#084463", color: "#084463" }}>
                Lihat Detail →
              </button>
            </div>
          )}
        </div>

        {/* Module Cards */}
        <p className="text-[10px] uppercase tracking-wider font-semibold mb-2 mt-6" style={{ color: "#647488" }}>Modul Tes</p>
        <div className="space-y-3 mb-6">
          {MODULES.map(m => {
            const done = !!results[m.key]
            return (
              <div key={m.key} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: done ? m.color : "#E2E8F0", borderLeft: `4px solid ${m.color}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${m.color}15` }}>
                    <m.icon size={18} style={{ color: m.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold" style={{ color: "#1E2938" }}>{m.title}</h4>
                      {done && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>✓</span>}
                    </div>
                    <p className="text-[11px] leading-relaxed mb-2" style={{ color: "#647488" }}>{m.desc}</p>
                    <div className="flex items-center gap-3">
                      <button onClick={() => router.push(`/tes-arah-hidup/${m.key}?lite=true`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-white" style={{ background: m.color }}>
                        {done ? "Retake" : "Mulai Tes"} <ArrowRight size={11} />
                      </button>
                      <span className="text-[10px]" style={{ color: "#647488" }}>{m.qty} soal · ±{m.time} menit · Gratis</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Apa Selanjutnya? */}
        <div className="mt-6">
          <h3 className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: "#1E2938" }}>📈 Apa Selanjutnya?</h3>

          <div className="p-4 rounded-xl border-2 mb-3" style={{ background: "#FFFFFF", borderColor: "#084463" }}>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} style={{ color: "#FFC64F" }} />
              <span className="text-xs font-bold" style={{ color: "#084463" }}>Versi Pro</span>
            </div>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#647488" }}>
              Ingin hasil yang lebih mendalam? Tes 340 soal standar internasional (IPIP-120, O*NET-60, PVQ-40) dengan laporan komprehensif, analisis per dimensi, rekomendasi karir detail, dan PDF export. Bonus: 1 sesi konsultasi 30 menit gratis.
            </p>
            <button onClick={() => router.push("/bisik/upgrade")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: "#084463", color: "#FFFFFF" }}>
              Lihat Paket Pro →
            </button>
          </div>

          <div className="p-4 rounded-xl border border-dashed" style={{ background: "rgba(255,198,79,0.03)", borderColor: "#FFC64F" }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} style={{ color: "#FFC64F" }} />
              <span className="text-xs font-bold" style={{ color: "#1E2938" }}>Konsultasi dengan Psikolog</span>
            </div>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#647488" }}>
              Mau hasilmu dibacakan langsung oleh psikolog profesional? Booking sesi 1-on-1 via chat. Psikolog akan jelaskan tiap dimensi, kaitkan dengan situasimu, dan berikan saran pengembangan personal.
            </p>
            <div className="flex gap-2 mb-3">
              <span className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>30 menit · Rp 50K</span>
              <span className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>60 menit · Rp 90K</span>
            </div>
            <button onClick={() => router.push("/tes-arah-hidup/konsultasi")}
              className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-2" style={{ borderColor: "#FFC64F", color: "#084463", background: "transparent" }}>
              Pilih Psikolog →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
