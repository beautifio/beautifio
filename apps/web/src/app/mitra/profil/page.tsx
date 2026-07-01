"use client"

import { useState, useEffect } from "react"
import { Loader2, Save } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { supabase } from "@/lib/supabase/client"

export default function MitraProfil() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [specialization, setSpec] = useState("")
  const [credentials, setCred] = useState("")
  const [experienceYears, setExp] = useState(0)
  const [bankName, setBank] = useState("")
  const [accountNumber, setAcc] = useState("")
  const [accountHolder, setHolder] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase || !user) return
    Promise.all([
      supabase.from("psychologists").select("*").eq("user_id", user.id).single(),
      supabase.from("users").select("role").eq("id", user.id).single(),
    ]).then(([r1]) => {
      const d = r1.data
      if (d) { setName(d.full_name || ""); setSpec((d.specialization || []).join(", ")); setCred(d.credentials || ""); setExp(d.experience_years || 0) }
      setLoading(false)
    })
  }, [user])

  const save = async () => {
    if (!supabase || !user) return
    setSaving(true)
    await supabase.from("psychologists").upsert({
      user_id: user.id, full_name: name,
      specialization: specialization.split(",").map(s => s.trim()).filter(Boolean),
      credentials, experience_years: experienceYears,
    }, { onConflict: "user_id" })
    setSaving(false)
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <p className="text-xs font-semibold" style={{ color: "#647488" }}>👤 Info Profil</p>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nama lengkap" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
        <input value={specialization} onChange={e => setSpec(e.target.value)} placeholder="Spesialisasi (pisah koma)" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
        <input value={credentials} onChange={e => setCred(e.target.value)} placeholder="Kredensial (S.Psi, M.Psi)" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
        <input type="number" value={experienceYears} onChange={e => setExp(Number(e.target.value))} placeholder="Pengalaman (tahun)" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
      </div>

      <div className="p-4 rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <p className="text-xs font-semibold" style={{ color: "#647488" }}>🏦 Rekening Pencairan</p>
        <input value={bankName} onChange={e => setBank(e.target.value)} placeholder="Nama Bank" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
        <input value={accountNumber} onChange={e => setAcc(e.target.value)} placeholder="Nomor Rekening" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
        <input value={accountHolder} onChange={e => setHolder(e.target.value)} placeholder="Atas Nama" className="w-full px-3 py-2 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
      </div>

      <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "#084463" }}>
        <Save size={14} />{saving ? "Menyimpan..." : "Simpan Profil"}
      </button>
    </div>
  )
}
