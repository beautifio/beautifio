"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const MODULE_META: Record<string, { title: string; liteTitle: string; max: number; lite: number; total: number }> = {
  personality: { title: "Kepribadian (120 soal)", liteTitle: "Kepribadian (20 soal)", max: 5, lite: 20, total: 120 },
  interest: { title: "Minat Karir (60 soal)", liteTitle: "Minat Karir (30 soal)", max: 5, lite: 30, total: 60 },
  values: { title: "Nilai Hidup (40 soal)", liteTitle: "Nilai Hidup (40 soal)", max: 6, lite: 40, total: 40 },
}

function QuizContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isLite = searchParams.get("lite") === "true"
  const modul = params.modul as string
  const { user, isLoading: authLoading } = useAuth()
  const [questions, setQuestions] = useState<any[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const storageKeyRef = useRef(`tes-${modul}-${isLite ? 'lite' : 'pro'}`)

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!supabase || !user) return

    // Check Pro status FIRST, then fetch questions
    supabase.from("user_subscriptions").select("id").eq("user_id", user.id).eq("status", "active")
      .gt("expires_at", new Date().toISOString()).maybeSingle()
      .then(({ data }) => {
        const pro = !!data
        setIsPro(pro)
        if (!isLite && !pro) {
          router.replace("/tes-arah-hidup"); return
        }
        // Now fetch questions
        supabase!.from("test_arah_hidup_questions").select("*")
          .eq("module", modul).order("sort_order")
          .then(({ data: qData }) => {
            if (isLite && qData?.length) {
              const grouped: Record<string, any[]> = {}
              qData.forEach((q: any) => { if (!grouped[q.dimension]) grouped[q.dimension] = []; grouped[q.dimension].push(q) })
              const dims = Object.keys(grouped)
              const limit = meta?.lite || 20
              const picked: any[] = []
              for (let i = 0; picked.length < limit; i++) {
                for (const dim of dims) {
                  if (grouped[dim]?.[i] && picked.length < limit) picked.push(grouped[dim][i])
                }
              }
              setQuestions(picked.sort((a: any, b: any) => a.sort_order - b.sort_order))
            } else {
              setQuestions(qData || [])
            }
            const saved = localStorage.getItem(storageKeyRef.current)
            if (saved) { try { setAnswers(JSON.parse(saved)); } catch {} }
            setLoading(false)
          })
      })
  }, [modul, user, authLoading, isLite])

  const meta = MODULE_META[modul]
  const q = questions[current]
  const total = questions.length || 1
  const maxVal = meta?.max || 5

  // Auto-save every question answered
  const saveAnswer = (idx: number, val: number) => {
    const next = { ...answers, [idx]: val }
    setAnswers(next)
    localStorage.setItem(storageKeyRef.current, JSON.stringify(next))
  }

  const handleSubmit = async () => {
    // Check unanswered — require at least 80%
    const unanswered = questions.filter((_, i) => answers[i] === undefined).length;
    const answeredPct = Math.round(((total - unanswered) / total) * 100)
    if (answeredPct < 80 && !confirm(`Kamu baru menjawab ${answeredPct}% soal (${total - unanswered}/${total}). Hasil mungkin kurang akurat. Tetap lanjutkan?`)) return;

    if (!supabase || !user) return
    setSubmitting(true)

    const scores: Record<string, { total: number; count: number }> = {}
    // Map interest dimensions to A2/E2/C2 for display consistency
    const dimMap: Record<string, string> = { A: 'A2', E: 'E2', C: 'C2' }
    questions.forEach((q, i) => {
      let d = q.dimension
      if (modul === 'interest' && dimMap[d]) d = dimMap[d]
      if (!scores[d]) scores[d] = { total: 0, count: 0 }
      let val = answers[i] !== undefined ? answers[i] : undefined
      if (val === undefined) return // Skip unanswered — don't give neutral score
      if (q.is_reverse) val = maxVal + 1 - val
      scores[d].total += val
      scores[d].count += 1
    })

    const finalScores: Record<string, number> = {}
    Object.entries(scores).forEach(([dim, data]) => {
      finalScores[dim] = Math.round((data.total / (data.count || 1)) * 10) / 10
    })

    const { error: insertErr } = await supabase.from("user_test_results").insert({
      user_id: user.id, module: modul,
      answers: answers,
      scores: finalScores,
      is_pro: !isLite,
    })
    if (insertErr) { alert("Gagal menyimpan: " + (insertErr.message || "coba lagi")); setSubmitting(false); return }
    localStorage.removeItem(storageKeyRef.current)
    router.push(`/tes-arah-hidup/hasil?module=${modul}`)
  }

  const goNext = () => { 
    if (answers[current] === undefined) { alert("Pilih jawaban dulu ya sebelum lanjut."); return }
    if (current < total - 1) { setCurrent(c => c + 1); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100) }
  }
  const goPrev = () => { if (current > 0) { setCurrent(c => c - 1); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100) } }

  // Countdown: show remaining
  const answered = Object.keys(answers).length
  const progression = (answered / total) * 100

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} />
    </div>
  )

  if (!meta || total === 0) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <p className="text-sm" style={{ color: "#647488" }}>Modul tidak ditemukan atau soal belum tersedia</p>
    </div>
  )

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto w-full px-5 pt-6 pb-4">
        <button onClick={() => router.push("/tes-arah-hidup")} className="flex items-center gap-1 text-sm cursor-pointer mb-4" style={{ color: "#647488" }}><ArrowLeft size={16} /> Kembali</button>
          <p className="text-[9px] text-text-secondary/40 mb-2 leading-relaxed">⚠️ Eksplorasi Diri — bukan tes psikologi. Instrumen belum tervalidasi. Bukan untuk diagnosis atau asesmen klinis.</p>
        {!isLite && total < (meta?.total || 20) && (
          <p className="text-[9px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mb-2">⚠️ Soal versi lengkap belum tersedia. Kamu mengerjakan {total} dari {meta?.total} soal.</p>
        )}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1E2938" }}>{isLite ? meta.liteTitle : meta.title}</h2>
            <p className="text-[10px]" style={{ color: "#647488" }}>{answered} dari {total} soal dijawab{total - answered > 0 ? ` · ${total - answered} belum` : ' · ✅ Lengkap'} </p>
          </div>
          <span className="text-xs" style={{ color: "#647488" }}>{current + 1}/{total}</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "#E2E8F0" }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${progression}%`, background: progression >= 100 ? "#22C55E" : "#084463" }} />
        </div>
        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-2">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === current ? "w-4 bg-primary" : answers[i] !== undefined ? "bg-success" : "bg-border"
              }`} />
          ))}
        </div>
      </div>

      {q && (
      <div className="max-w-content mx-auto w-full flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-200" key={q.id || current}>
        <div className="flex-1 flex items-center px-5">
            <p className="text-base font-medium leading-relaxed" style={{ color: "#1E2938" }}>{current + 1}. {q.question_text}</p>
          </div>

          <div className="space-y-2 pb-4">
            {(modul === "values" ? [1,2,3,4,5,6] : [1,2,3,4,5]).map(val => (
              <button key={val} onClick={() => saveAnswer(current, val)}
                className={`w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer flex items-center gap-3 px-4 ${
                  answers[current] === val 
                    ? "border-primary bg-primary/5 text-primary shadow-[0_0_0_2px_rgba(8,68,99,0.15)] scale-[1.01]" 
                    : "border-border bg-white text-text-secondary hover:border-primary/30"
                }`}>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] ${
                  answers[current] === val ? "border-primary bg-primary text-white" : "border-border"
                }`}>
                  {answers[current] === val ? "✓" : val}
                </span>
                {modul === "personality" ? ["Sangat Tidak Setuju","Tidak Setuju","Netral","Setuju","Sangat Setuju"][val-1]
                  : modul === "interest" ? ["Sangat Tidak Suka","Tidak Suka","Netral","Suka","Sangat Suka"][val-1]
                  : ["Tidak Seperti Saya","Sedikit Mirip","Agak Mirip","Cukup Mirip","Mirip","Sangat Mirip"][val-1]}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pb-6">
            <button onClick={goPrev} disabled={current === 0} className="flex-1 py-3 rounded-xl text-sm font-semibold border cursor-pointer disabled:opacity-30" style={{ borderColor: "#E2E8F0", color: "#647488" }}>← Sebelumnya</button>
            {current < total - 1 ? (
              <button onClick={goNext} disabled={answers[current] === undefined} className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white disabled:opacity-30" style={{ background: "#084463" }}>Selanjutnya →</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: "#FFC64F", color: "#084463" }}>
                {submitting ? "Menyimpan..." : "Lihat Hasil ✨"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating progress chip */}
      <div className="fixed bottom-20 right-4 z-30 px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-lg">
        ✅ {answered}/{total}
      </div>
    </div>
  )
}

export default function TesModulPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>}>
      <QuizContent />
    </Suspense>
  )
}
