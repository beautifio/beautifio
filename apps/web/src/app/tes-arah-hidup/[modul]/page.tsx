"use client"

import { useState, useEffect, Suspense } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const MODULE_META: Record<string, { title: string; liteTitle: string; max: number; lite: number; total: number }> = {
  personality: { title: "Kepribadian (IPIP-NEO-120)", liteTitle: "Kepribadian (Mini-IPIP)", max: 5, lite: 20, total: 120 },
  interest: { title: "Minat Karir (O*NET-60)", liteTitle: "Minat Karir (O*NET-20)", max: 5, lite: 20, total: 60 },
  values: { title: "Nilai Hidup (PVQ-40)", liteTitle: "Nilai Hidup (PVQ-20)", max: 5, lite: 20, total: 40 },
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

  useEffect(() => {
    if (!authLoading && !user) { router.replace("/login"); return }
    if (!supabase || !user) return

    // Check Pro status for full test access
    supabase.from("user_subscriptions").select("id").eq("user_id", user.id).eq("status", "active").maybeSingle()
      .then(({ data }) => { setIsPro(!!data) })

    supabase.from("test_arah_hidup_questions").select("*")
      .eq("module", modul).order("sort_order")
      .then(({ data }) => {
        if (!isLite && !isPro) {
          router.replace("/tes-arah-hidup"); return
        }
        if (isLite && data?.length) {
          const grouped: Record<string, any[]> = {}
          data.forEach((q: any) => { if (!grouped[q.dimension]) grouped[q.dimension] = []; grouped[q.dimension].push(q) })
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
          setQuestions(data || [])
        }
        // Restore saved answers
        const saved = localStorage.getItem(`tes-${modul}`)
        if (saved) { try { setAnswers(JSON.parse(saved)); } catch {} }
        setLoading(false)
      })
  }, [modul, user, authLoading, isLite, isPro])

  const meta = MODULE_META[modul]
  const q = questions[current]
  const total = questions.length || 1
  const maxVal = meta?.max || 5

  // Auto-save every question answered
  const saveAnswer = (idx: number, val: number) => {
    const next = { ...answers, [idx]: val }
    setAnswers(next)
    localStorage.setItem(`tes-${modul}`, JSON.stringify(next))
  }

  const handleSubmit = async () => {
    if (!supabase || !user) return
    setSubmitting(true)

    const scores: Record<string, { total: number; count: number }> = {}
    questions.forEach((q, i) => {
      const d = q.dimension
      if (!scores[d]) scores[d] = { total: 0, count: 0 }
      let val = answers[i] || 3
      if (q.is_reverse) val = maxVal + 1 - val
      scores[d].total += val
      scores[d].count += 1
    })

    const finalScores: Record<string, number> = {}
    Object.entries(scores).forEach(([dim, data]) => {
      finalScores[dim] = modul === "interest"
        ? data.total
        : Math.round((data.total / (data.count || 1)) * 10) / 10
    })

    if (!supabase || !user) { alert("Koneksi terputus. Coba login ulang."); setSubmitting(false); return }
    const { error: insertErr } = await supabase.from("user_test_results").insert({
      user_id: user.id, module: modul,
      answers: answers,
      scores: finalScores,
    })
    if (insertErr) { alert("Gagal menyimpan: " + (insertErr.message || "coba lagi")); setSubmitting(false); return }
    localStorage.removeItem(`tes-${modul}`)
    router.push(`/tes-arah-hidup/hasil?module=${modul}`)
  }

  const goNext = () => { if (current < total - 1) setCurrent(c => c + 1) }
  const goPrev = () => { if (current > 0) setCurrent(c => c - 1) }

  // Countdown: show remaining
  const answered = Object.keys(answers).length
  const progression = ((current + 1) / total) * 100

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} />
    </div>
  )

  if (!meta) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <p className="text-sm" style={{ color: "#647488" }}>Modul tidak ditemukan</p>
    </div>
  )

  return (
    <div className="min-h-screen pb-24 flex flex-col" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto w-full px-5 pt-6 pb-4">
        <button onClick={() => router.push("/tes-arah-hidup")} className="flex items-center gap-1 text-sm cursor-pointer mb-4" style={{ color: "#647488" }}><ArrowLeft size={16} /> Kembali</button>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold" style={{ color: "#1E2938" }}>{isLite ? meta.liteTitle : meta.title}</h2>
            <p className="text-[10px]" style={{ color: "#647488" }}>{answered} dari {total} soal dijawab</p>
          </div>
          <span className="text-xs" style={{ color: "#647488" }}>{current + 1}/{total}</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: "#E2E8F0" }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${progression}%`, background: "#084463" }} />
        </div>
      </div>

      {q && (
      <div className="max-w-content mx-auto w-full flex-1 flex flex-col">
        <div className="flex-1 flex items-center px-5">
            <p className="text-base font-medium leading-relaxed" style={{ color: "#1E2938" }}>{current + 1}. {q.question_text}</p>
          </div>

          <div className="space-y-2 pb-4">
            {[1,2,3,4,5].map(val => (
              <button key={val} onClick={() => saveAnswer(current, val)}
                className={`w-full py-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer ${answers[current] === val ? "border-[#084463] bg-[#084463]/5 text-[#084463]" : "border-[#E2E8F0] bg-white text-[#647488]"}`}>
                {modul === "personality" ? ["Sangat Tidak Setuju","Tidak Setuju","Netral","Setuju","Sangat Setuju"][val-1]
                  : modul === "interest" ? ["Sangat Tidak Suka","Tidak Suka","Netral","Suka","Sangat Suka"][val-1]
                  : ["Tidak Seperti Saya","Sedikit Mirip","Agak Mirip","Mirip","Sangat Mirip","Sangat Sekali Mirip"].slice(0,5)[val-1]}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pb-6">
            <button onClick={goPrev} disabled={current === 0} className="flex-1 py-3 rounded-xl text-sm font-semibold border cursor-pointer disabled:opacity-30" style={{ borderColor: "#E2E8F0", color: "#647488" }}>← Sebelumnya</button>
            {current < total - 1 ? (
              <button onClick={goNext} className="flex-1 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white" style={{ background: "#084463" }}>Selanjutnya →</button>
            ) : (
              <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50" style={{ background: "#FFC64F", color: "#084463" }}>
                {submitting ? "Menyimpan..." : "Lihat Hasil ✨"}
              </button>
            )}
          </div>
        </div>
      )}
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
