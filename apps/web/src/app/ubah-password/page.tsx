"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function UbahPasswordPage() {
  const router = useRouter()
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (newPw.length < 8) { setError("Password baru minimal 8 karakter"); return }
    if (newPw !== confirm) { setError("Password baru tidak cocok"); return }

    setLoading(true)
    const { data: session } = await supabase!.auth.getSession()
    const email = session?.session?.user?.email
    if (!email) { setError("Sesi tidak valid. Silakan login ulang."); setLoading(false); return }

    const { error: signInErr } = await supabase!.auth.signInWithPassword({ email, password: currentPw })
    if (signInErr) { setError("Password saat ini salah"); setLoading(false); return }

    const { error: updateErr } = await supabase!.auth.updateUser({ password: newPw })
    if (updateErr) { setError("Gagal: " + (updateErr.message || "coba lagi")); setLoading(false); return }

    setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen py-12 px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-md mx-auto text-center">
        <ShieldCheck size={48} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
        <h1 className="text-lg font-bold mb-2" style={{ color: "#1E2938" }}>Password Berhasil Diubah!</h1>
        <p className="text-sm mb-6" style={{ color: "#647488" }}>Password akunmu sudah diperbarui.</p>
        <button onClick={() => router.push("/profil")} className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>Kembali ke Profil</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-12 px-6" style={{ background: "#F8FAFC" }}>
      <div className="max-w-sm mx-auto">
        <Link href="/profil" className="flex items-center gap-1 text-sm mb-6" style={{ color: "#647488" }}><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Ubah Password</h1>
        <p className="text-xs mb-6" style={{ color: "#647488" }}>Masukkan password saat ini dan password baru</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input type={show ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Password saat ini" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          </div>
          <div className="relative">
            <input type={show ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Password baru" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "#647488" }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Konfirmasi password baru" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 cursor-pointer" style={{ background: "#084463" }}>{loading ? "Menyimpan..." : "Simpan Password Baru"}</button>
        </form>
      </div>
    </div>
  )
}
