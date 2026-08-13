"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Compass, ArrowLeft, Sparkles, Crown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const DIM_LABELS: Record<string, string> = {
  O: "Keterbukaan", C: "Ketelitian", E: "Ekstraversi", A: "Keramahan", N: "Neurotisme",
  R: "Realistic", I: "Investigative", A2: "Artistic", S: "Social", E2: "Enterprising", C2: "Conventional",
  SD: "Kemandirian", PO: "Pengaruh", UN: "Universal", AC: "Prestasi", SE: "Keamanan",
  ST: "Stimulasi", CO: "Kesesuaian", TR: "Tradisi", BE: "Kepedulian", HE: "Kenikmatan",
}

// Runtime mapping for old data (A→A2, E→E2, C→C2 only for interest module)
function mapDimKey(dim: string, module: string): string {
  if (module === 'interest') {
    const map: Record<string, string> = { A: 'A2', E: 'E2', C: 'C2' }
    return map[dim] || dim
  }
  return dim
}

const HOLLAND_MEANING: Record<string, string> = {
  R: 'Realistic — praktis, teknis, suka kerja fisik',
  I: 'Investigative — analitis, ilmiah, suka riset',
  A: 'Artistic — kreatif, ekspresif, suka seni',
  S: 'Social — suka membantu, mengajar, peduli',
  E: 'Enterprising — memimpin, meyakinkan, bisnis',
  C: 'Conventional — terstruktur, teliti, administratif',
}

const DIM_EMOJI: Record<string, string> = {
  O: "🧠", C: "📋", E: "🗣️", A: "🤝", N: "🌊",
  R: "🔧", I: "🔬", A2: "🎨", S: "👥", E2: "💼", C2: "📊",
  SD: "🎯", PO: "👑", UN: "🌍", AC: "🏆", SE: "🔒",
  ST: "🎢", CO: "📏", TR: "⛪", BE: "💕", HE: "🌟",
}

const DIM_DESC: Record<string, Record<string, string>> = {
  O: { high: "Kamu sangat terbuka pada pengalaman baru, suka eksplorasi ide, dan imajinatif. Cocok di bidang kreatif dan inovatif.", low: "Kamu cenderung praktis dan menyukai rutinitas. Lebih nyaman dengan hal yang sudah dikenal daripada eksperimen baru." },
  C: { high: "Kamu sangat terorganisir, disiplin, dan dapat diandalkan. Orang lain bisa mengandalkanmu untuk menyelesaikan tugas tepat waktu.", low: "Kamu fleksibel dan spontan. Kadang sulit mengikuti jadwal ketat, tapi mudah beradaptasi dengan perubahan." },
  E: { high: "Kamu energik dalam situasi sosial, mudah bergaul, dan senang menjadi pusat perhatian. Cocok di bidang yang butuh banyak interaksi.", low: "Kamu lebih nyaman dalam kelompok kecil atau sendiri. Cenderung reflektif dan memilih kualitas daripada kuantitas dalam hubungan." },
  A: { high: "Kamu sangat peduli pada orang lain, mudah percaya, dan senang membantu. Orang merasa nyaman curhat padamu.", low: "Kamu objektif dan tidak mudah terpengaruh emosi orang lain. Cocok untuk mengambil keputusan sulit tanpa bias personal." },
  N: { high: "Kamu sensitif terhadap stres dan cenderung khawatir. Tapi ini juga berarti kamu sangat peka terhadap lingkungan sekitar.", low: "Kamu tenang dan stabil secara emosional. Mampu menghadapi tekanan tanpa panik — aset berharga di situasi krisis." },
  // Values — Schwartz PVQ-40
  SD: { high: "Kamu sangat menghargai kebebasan berpikir dan bertindak. Kamu ingin menentukan jalan hidupmu sendiri tanpa dikendalikan orang lain.", low: "Kamu lebih nyaman mengikuti arahan dan struktur yang sudah ada. Kebebasan penuh bukan prioritas utamamu." },
  PO: { high: "Kamu menghargai status sosial, kekuasaan, dan kemampuan memimpin. Kamu ingin dihormati dan punya wewenang atas sumber daya dan orang lain.", low: "Kamu tidak terlalu peduli dengan status atau jabatan. Kepuasanmu datang dari kontribusi, bukan dari kekuasaan atau pengakuan." },
  UN: { high: "Kamu peduli pada keadilan sosial, lingkungan, dan kesejahteraan semua orang. Toleransi, perdamaian, dan persatuan adalah nilai intimu.", low: "Kamu lebih fokus pada lingkaran terdekatmu. Isu global atau universal bukan prioritas utamamu." },
  AC: { high: "Kamu ambisius dan sangat termotivasi oleh pencapaian. Standar tinggi dan keberhasilan pribadi adalah sumber kepuasanmu.", low: "Kamu lebih menikmati proses daripada hasil. Pencapaian bukan ukuran utama kebahagiaanmu." },
  SE: { high: "Kamu menghargai keamanan, stabilitas, dan ketertiban. Kamu ingin lingkungan yang terprediksi, aman, dan harmonis.", low: "Kamu lebih berani mengambil risiko dan tidak terlalu khawatir dengan ketidakpastian. Keamanan bukan pendorong utama keputusanmu." },
  ST: { high: "Kamu menyukai tantangan, sensasi baru, dan variasi dalam hidup. Kamu mudah bosan dengan rutinitas dan selalu mencari pengalaman seru.", low: "Kamu lebih suka ketenangan dan kestabilan. Sensasi dan tantangan bukan kebutuhan utamamu." },
  CO: { high: "Kamu taat pada aturan, disiplin diri, dan hormat pada norma sosial. Kamu menghargai ketertiban dan perilaku yang sesuai ekspektasi.", low: "Kamu fleksibel dengan aturan dan tidak terikat pada konvensi. Kamu mempertanyakan norma yang tidak masuk akal." },
  TR: { high: "Kamu menghargai tradisi, budaya, dan agama. Kamu menghormati kebijaksanaan leluhur dan menjaga warisan yang sudah ada.", low: "Kamu lebih terbuka pada perubahan dan modernitas. Tradisi bukan faktor utama dalam keputusan hidupmu." },
  BE: { high: "Kamu sangat peduli pada orang terdekat dan selalu ingin membantu. Kesetiaan, empati, dan tanggung jawab sosial adalah inti dirimu.", low: "Kamu menghargai batasan personal dan tidak mudah terbawa oleh kebutuhan orang lain. Kamu menjaga keseimbangan antara peduli dan menjaga diri." },
  HE: { high: "Kamu menikmati kesenangan hidup, momen bahagia, dan kepuasan pribadi. Kamu tahu cara menikmati hidup.", low: "Kamu lebih fokus pada tujuan jangka panjang dan bersedia menunda kepuasan sesaat. Kesenangan bukan prioritas utamamu." },
  // RIASEC Interest Types
  R: { high: "Kamu menyukai pekerjaan hands-on, praktis, dan berbasis keterampilan fisik. Kamu cocok di bidang teknik, mekanik, atau outdoor.", low: "Pekerjaan fisik dan teknis bukan minat utamamu. Kamu lebih tertarik pada bidang yang melibatkan ide atau interaksi sosial." },
  I: { high: "Kamu memiliki rasa ingin tahu ilmiah yang tinggi. Meneliti, menganalisis, dan memecahkan masalah adalah kekuatanmu.", low: "Kamu lebih praktis daripada teoritis. Pekerjaan berbasis riset dan data mungkin kurang cocok untukmu." },
  A2: { high: "Kreativitas adalah inti dirimu. Kamu mengekspresikan diri melalui seni, desain, musik, atau tulisan.", low: "Kamu lebih menyukai struktur dan aturan daripada ekspresi bebas. Pekerjaan rutin terasa lebih nyaman." },
  S: { high: "Kamu memiliki dorongan kuat untuk membantu, mengajar, dan mendampingi orang lain. Empatimu adalah kekuatan terbesarmu.", low: "Kamu lebih fokus pada tugas individu. Bekerja sendiri atau dengan data lebih sesuai untukmu." },
  E2: { high: "Kamu memiliki jiwa kepemimpinan dan kemampuan persuasi yang kuat. Dunia bisnis dan organisasi adalah panggungmu.", low: "Kamu lebih nyaman sebagai kontributor tim daripada pemimpin. Mengelola orang bukan prioritasmu." },
  C2: { high: "Kamu sangat terorganisir, menghargai prosedur, dan teliti dalam pekerjaan administratif. Akurasi adalah standarmu.", low: "Kamu lebih menyukai fleksibilitas dan variasi. Rutinitas administratif terasa membatasi." },
}

const HOLLAND_JOBS: Record<string, string[]> = {
  "R": ["Teknisi", "Insinyur", "Petani", "Pilot"],
  "I": ["Ilmuwan", "Dokter", "Programmer", "Analis Data"],
  "A": ["Desainer", "Penulis", "Musisi", "Fotografer"],
  "S": ["Guru", "Konselor", "Psikolog", "Pekerja Sosial"],
  "E": ["Pengusaha", "Manajer", "Sales", "Pengacara"],
  "C": ["Akuntan", "Admin", "Banker", "Data Entry"],
}
function ScoreBar({ label, score, max, emoji, color = "#084463" }: { label: string; score: number; max: number; emoji: string; color?: string }) {
  const pct = Math.min((score / max) * 100, 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm w-7 text-center">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-0.5">
          <span className="font-semibold" style={{ color: "#1E2938" }}>{label}</span>
          <span style={{ color }}>{Number.isInteger(score) ? score : score.toFixed(1)}</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "#E2E8F0" }}>
          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
    </div>
  )
}

function HasilContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const modul = searchParams.get("module")
  const { user } = useAuth()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    if (!supabase || !user) return
    const query = supabase.from("user_test_results").select("*")
      .eq("user_id", user.id).order("completed_at", { ascending: false }).limit(10)
    if (modul) query.eq("module", modul)
    query.then(({ data }) => {
      // Deduplicate: keep latest per module, skip partial results with < 3 dimensions
      const seen = new Set<string>()
      const deduped = (data || []).filter((r: any) => {
        const scores = typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores
        if (Object.keys(scores || {}).length < 3) return false // Skip partial results
        if (seen.has(r.module)) return false
        seen.add(r.module)
        return true
      })
      setResults(deduped); setLoading(false)
    })
    // Check Pro status
    supabase.from("user_subscriptions").select("id").eq("user_id", user.id).eq("status", "active")
      .gt("expires_at", new Date().toISOString()).maybeSingle()
      .then(({ data }) => { setIsPro(!!data) })
  }, [modul, user])

  const formatScores = (r: any) => {
    const raw = typeof r.scores === "string" ? JSON.parse(r.scores) : r.scores
    const isInterest = r.module === "interest"

    // Map old keys (A/E/C) to A2/E2/C2 for consistency
    const scores: Record<string, number> = {}
    Object.entries(raw).forEach(([k, v]) => {
      const key = mapDimKey(k, r.module)
      const val = Number(v)
      // Check if data is raw sum (old) or average (new)
      // Raw sum: interest score > 20 (30 questions × 5 pts max across 5+ dims = large)
      // Average: interest score 1-5 like other modules
      if (isInterest && val > 10) {
        // Old data: raw sum with 3 items per dimension
        scores[key] = Math.round((val / 3) * 10) / 10
      } else {
        scores[key] = typeof val === 'number' ? Math.round(val * 10) / 10 : val
      }
    })

    const entries: [string, number][] = Object.entries(scores)
    const sorted = entries.sort((a, b) => b[1] - a[1])
    const top3Codes = sorted.slice(0, 3).map(([k]) => k.startsWith('A2') ? 'A' : k.startsWith('E2') ? 'E' : k.startsWith('C2') ? 'C' : k)
    const top3 = top3Codes.join("")
    const isOldData = isInterest && Object.values(raw).some((v: any) => Number(v) > 10)
    return { scores: Object.fromEntries(entries), top3, sorted, max: r.module === 'values' ? 6 : 5, isInterest, isOldData }
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-5 pt-6">
        <button onClick={() => router.push("/tes-arah-hidup")} className="flex items-center gap-1 text-sm cursor-pointer mb-4" style={{ color: "#647488" }}>
          <ArrowLeft size={16} /> Kembali ke Tes
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(8,68,99,0.08)" }}>
            <Sparkles size={22} style={{ color: "#FFC64F" }} />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Hasil Eksplorasi Diri</h1>
            <p className="text-xs" style={{ color: "#647488" }}>{modul ? "Hasil per modul" : "Semua hasil"}</p>
          </div>
        </div>

        {results.length > 0 && (
          <p className="text-[10px] text-text-secondary/50 mb-4">Skala 1–5 · Semakin tinggi semakin dominan · ⬤ = tertinggi, ⬤ = lainnya</p>
        )}

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 rounded-xl bg-white border border-[#E2E8F0] animate-pulse" />)}</div>
        ) : results.length === 0 ? (
          <div className="text-center py-16">
            <Compass size={40} className="mx-auto mb-3" style={{ color: "#E2E8F0" }} />
            <p className="text-sm" style={{ color: "#647488" }}>Belum ada hasil tes</p>
            <button onClick={() => router.push("/tes-arah-hidup")} className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>Mulai Tes</button>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map(r => {
              const { scores, top3, sorted, max, isInterest, isOldData } = formatScores(r)
              const isPro = (r as any).is_pro === true
              const moduleTitle = r.module === "personality" ? "🧠 Kepribadian"
                : r.module === "interest" ? "💼 Minat Karir" : "❤️ Nilai Hidup"
              const cardGradient = r.module === "personality"
                ? "linear-gradient(135deg, rgba(107,185,212,0.06), rgba(255,255,255,1))"
                : r.module === "interest"
                ? "linear-gradient(135deg, rgba(255,198,79,0.06), rgba(255,255,255,1))"
                : "linear-gradient(135deg, rgba(8,68,99,0.04), rgba(255,255,255,1))"
              const cardBorder = r.module === "personality" ? "#6BB9D4" : r.module === "interest" ? "#FFC64F" : "#084463"
              return (
                <div key={r.id} className="p-5 rounded-xl border" style={{ background: cardGradient, borderColor: `${cardBorder}30` }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold" style={{ color: "#1E2938" }}>{moduleTitle}</h3>
                    <div className="flex items-center gap-2">
                      {isPro && <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold">Pro</span>}
                      {isOldData && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Versi lama</span>}
                      <span className="text-[10px]" style={{ color: "#647488" }}>
                        {new Date(r.completed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}
                    </span>
                  </div>
                  </div>
                  <div className="space-y-2.5">
                    {sorted.map(([dim, val]) => (
                      <ScoreBar key={dim} label={DIM_LABELS[dim] || dim} score={val} max={max} emoji={DIM_EMOJI[dim] || "•"} color={dim === sorted[0][0] ? "#084463" : "#6BB9D4"} />
                    ))}
                  </div>
                  {isPro && (
                    <div className="mt-3 flex justify-center">
                      <svg width="140" height="140" viewBox="0 0 140 140">
                        {[0.25, 0.5, 0.75, 1].map(r => {
                          const pts = sorted.map((_, i) => {
                            const a = (Math.PI * 2 * i) / sorted.length - Math.PI / 2
                            return `${70 + 50 * r * Math.cos(a)},${70 + 50 * r * Math.sin(a)}`
                          }).join(" ")
                          return <polygon key={r} points={pts} fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                        })}
                        <polygon points={sorted.map(([, val], i) => {
                          const a = (Math.PI * 2 * i) / sorted.length - Math.PI / 2
                          const r = Math.min(val / max, 1) * 50
                          return `${70 + r * Math.cos(a)},${70 + r * Math.sin(a)}`
                        }).join(" ")} fill="rgba(8,68,99,0.15)" stroke="#084463" strokeWidth="1.5" />
                        {sorted.map(([dim], i) => {
                          const a = (Math.PI * 2 * i) / sorted.length - Math.PI / 2
                          return <text key={dim} x={70 + 58 * Math.cos(a)} y={70 + 58 * Math.sin(a) + 3} textAnchor="middle" fontSize="7" fill="#647488">{DIM_LABELS[dim]?.slice(0, 3) || dim}</text>
                        })}
                      </svg>
                    </div>
                  )}
                  {isInterest && top3 && (
                    <div className="mt-4 p-3 rounded-lg" style={{ background: "#F8FAFC" }}>
                      <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#647488" }}>Holland Code: {top3}</p>
                      <p className="text-[10px] mb-2" style={{ color: "#6BB9D4" }}>
                        {top3.split("").map((c, i) => {
                          const meaning = HOLLAND_MEANING[c] || c
                          return <span key={c}>{i > 0 ? ' · ' : ''}{meaning.split(' — ')[0]}</span>
                        })}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {top3.split("").flatMap(c => (HOLLAND_JOBS[c] || []).slice(0, 2)).map((job, i) => (
                          <span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>{job}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths (top 2) + Weaknesses (bottom 1) analysis */}
                  <div className="mt-4 p-3 rounded-lg" style={{ background: "#F8FAFC" }}>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: "#647488" }}>📖 Analisis{isPro ? " Pro" : ""}</p>
                    {isPro && (
                      <p className="text-[9px] text-text-secondary/50 mb-2">Berdasarkan {r.module === 'personality' ? '120' : r.module === 'interest' ? '60' : '40'} soal — lebih banyak data, hasil lebih stabil.</p>
                    )}
                    {sorted.slice(0, 2).map(([dim, val]) => {
                      const desc = DIM_DESC[dim]
                      if (!desc) return null
                      const highT = max * 0.65
                      const lowT = max * 0.4
                      const level = val > highT ? "high" : val < lowT ? "low" : null
                      const emoji = DIM_EMOJI[dim] || "•"
                      return level ? (
                        <div key={dim} className="mb-2 last:mb-0">
                          <p className="text-xs font-semibold mb-0.5" style={{ color: "#1E2938" }}>{emoji} {DIM_LABELS[dim] || dim} — {level === "high" ? "💪 Kekuatan" : "🌱 Area Tumbuh"}</p>
                          <p className="text-[11px] leading-relaxed" style={{ color: "#647488" }}>{desc[level]}</p>
                        </div>
                      ) : null
                    })}
                    {sorted.length > 0 && (() => {
                      const last = sorted[sorted.length - 1]
                      const [dim, val] = last
                      const desc = DIM_DESC[dim]
                      const lowT = max * 0.4
                      if (!desc || val > lowT) return null
                      const emoji = DIM_EMOJI[dim] || "•"
                      return (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs font-semibold mb-0.5" style={{ color: "#1E2938" }}>{emoji} {DIM_LABELS[dim] || dim} — 🌱 Bisa Dikembangkan</p>
                          <p className="text-[11px] leading-relaxed" style={{ color: "#647488" }}>{desc.low}</p>
                        </div>
                      )
                    })()}
                    {sorted.every(([, val]) => val >= max * 0.4 && val <= max * 0.65) && (
                      <p className="text-[11px] leading-relaxed" style={{ color: "#647488" }}>Profilmu cukup seimbang di semua dimensi. Ini membuatmu fleksibel dalam berbagai situasi.</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-bold mb-3 flex items-center gap-1.5" style={{ color: "#1E2938" }}>📈 Apa Selanjutnya?</h3>

            {!isPro && (
            <div className="p-4 rounded-xl border-2 mb-3" style={{ background: "#FFFFFF", borderColor: "#084463" }}>
              <div className="flex items-center gap-2 mb-2"><Crown size={16} style={{ color: "#FFC64F" }} /><span className="text-xs font-bold" style={{ color: "#084463" }}>Versi Pro</span></div>
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#647488" }}>Tes 340 soal standar internasional dengan laporan komprehensif, analisis per dimensi, rekomendasi karir, PDF export. Bonus: 1 sesi konsultasi gratis.</p>
              <button onClick={() => router.push("/bisik/upgrade")} className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background: "#084463", color: "#FFFFFF" }}>Lihat Paket Pro →</button>
            </div>
            )}

            <div className="p-4 rounded-xl border border-dashed" style={{ background: "rgba(255,198,79,0.03)", borderColor: "#FFC64F" }}>
              <div className="flex items-center gap-2 mb-2"><Sparkles size={16} style={{ color: "#FFC64F" }} /><span className="text-xs font-bold" style={{ color: "#1E2938" }}>Konsultasi dengan Psikolog</span></div>
              <p className="text-[11px] leading-relaxed mb-3" style={{ color: "#647488" }}>Mau hasilmu dibacakan langsung oleh psikolog profesional? Booking sesi 1-on-1 via chat.</p>
              <div className="flex gap-2 mb-3">
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>30 menit · Rp 50K</span>
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>60 menit · Rp 90K</span>
              </div>
              <button onClick={() => router.push("/tes-arah-hidup/konsultasi")} className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-2" style={{ borderColor: "#FFC64F", color: "#084463", background: "transparent" }}>Pilih Psikolog →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HasilTesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}><div className="w-8 h-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[#084463]" /></div>}>
      <HasilContent />
    </Suspense>
  )
}
