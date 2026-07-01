"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Star, Send, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

const VOLUNTEER_CATS = ["psikologi", "agama", "umum"]

export default function DaftarMitraPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [step, setStep] = useState<"choose" | "form">("choose")
  const [role, setRole] = useState<"volunteer" | "psychologist" | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [specInput, setSpecInput] = useState("")
  const [specs, setSpecs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { if (!authLoading && !user) router.replace("/login") }, [user, authLoading])

  const addSpec = () => { if (specInput.trim()) { setSpecs([...specs, specInput.trim()]); setSpecInput("") } }

  const handleSubmit = async () => {
    if (!user || !role) return
    if (!form.full_name) { setError("Nama wajib diisi"); return }
    if (!form.phone) { setError("Nomor WA wajib diisi"); return }
    if (role === "psychologist" && !form.credentials) { setError("Kredensial wajib diisi"); return }
    if (role === "volunteer" && (!form.motivation || form.motivation.length < 50)) { setError("Motivasi minimal 50 karakter"); return }
    setSaving(true)
    const body: any = {
      role, full_name: form.full_name, email: form.email || user.email,
      phone: form.phone, category: form.category, specialization: specs,
      credentials: form.credentials, experience_years: form.experience ? parseInt(form.experience) : 0,
      motivation: form.motivation,
      bank_name: form.bank_name, account_number: form.account_number, account_holder: form.account_holder,
    }
    const res = await fetch("/api/mitra/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (!res.ok) { setError((await res.json()).error || "Gagal"); setSaving(false); return }
    router.push("/daftar-mitra/sukses")
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-5 pt-6">
        <button onClick={() => step === "form" ? setStep("choose") : router.back()} className="flex items-center gap-1 text-sm cursor-pointer mb-4" style={{ color: "#647488" }}><ArrowLeft size={16} /> Kembali</button>

        {step === "choose" ? (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(8,68,99,0.08)" }}><Heart size={28} style={{ color: "#084463" }} /></div>
              <h1 className="text-xl font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Bergabung sebagai Mitra</h1>
              <p className="text-xs mt-1" style={{ color: "#647488" }}>Pilih peran yang sesuai denganmu</p>
            </div>
            <div className="space-y-3">
              <button onClick={() => { setRole("volunteer"); setStep("form") }} className="w-full p-4 rounded-xl border-2 text-left cursor-pointer transition-all" style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.03)" }}>
                <div className="flex items-center gap-3"><Heart size={20} style={{ color: "#22C55E" }} /><span className="text-sm font-bold" style={{ color: "#1E2938" }}>Volunteer Care</span></div>
                <p className="text-xs mt-1 ml-9" style={{ color: "#647488" }}>Dampingi sesama perempuan dalam konsultasi ringan. Sukarela, tidak berbayar.</p>
              </button>
              <button onClick={() => { setRole("psychologist"); setStep("form") }} className="w-full p-4 rounded-xl border-2 text-left cursor-pointer transition-all" style={{ borderColor: "#FFC64F", background: "rgba(255,198,79,0.03)" }}>
                <div className="flex items-center gap-3"><Star size={20} style={{ color: "#FFC64F" }} /><span className="text-sm font-bold" style={{ color: "#1E2938" }}>Psikolog Profesional</span></div>
                <p className="text-xs mt-1 ml-9" style={{ color: "#647488" }}>Baca hasil tes & konsultasi berbayar. Berbagi hasil dengan platform.</p>
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3 max-w-md">
            <h2 className="text-sm font-bold" style={{ color: "#1E2938" }}>{role === "volunteer" ? "💚 Daftar Volunteer" : "👩‍⚕️ Daftar Psikolog"}</h2>
            <div className="space-y-2">
              <input value={form.full_name || ""} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Nama lengkap *" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
              <input value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Nomor WhatsApp *" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
              {role === "volunteer" && (
                <>
                  <select value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }}>
                    <option value="">Pilih kategori</option>
                    {VOLUNTEER_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <textarea value={form.motivation || ""} onChange={e => setForm(f => ({ ...f, motivation: e.target.value }))} placeholder="Kenapa ingin jadi volunteer? (min 50 karakter) *" rows={3} className="w-full px-3 py-2 text-xs rounded-lg border resize-none" style={{ borderColor: "#E2E8F0" }} />
                </>
              )}
              {role === "psychologist" && (
                <>
                  <div className="flex gap-2">
                    <input value={specInput} onChange={e => setSpecInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSpec())} placeholder="Spesialisasi (enter untuk tambah)" className="flex-1 px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                    <button onClick={addSpec} className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>Tambah</button>
                  </div>
                  {specs.length > 0 && <div className="flex flex-wrap gap-1">{specs.map((s, i) => <span key={i} className="text-[10px] px-2 py-1 rounded-full" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>{s}</span>)}</div>}
                  <input value={form.credentials || ""} onChange={e => setForm(f => ({ ...f, credentials: e.target.value }))} placeholder="Kredensial (S.Psi, M.Psi) *" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={form.experience || ""} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} type="number" placeholder="Pengalaman (tahun)" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={form.bank_name || ""} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="Nama Bank *" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={form.account_number || ""} onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} placeholder="Nomor Rekening *" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <input value={form.account_holder || ""} onChange={e => setForm(f => ({ ...f, account_holder: e.target.value }))} placeholder="Atas Nama *" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                </>
              )}
            </div>
            {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
            <button onClick={handleSubmit} disabled={saving} className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "#084463" }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}{saving ? "Mengirim..." : "Kirim Pendaftaran"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
