"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase?.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") return
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError("Password minimal 8 karakter"); return }
    if (password !== confirm) { setError("Password tidak cocok"); return }
    setLoading(true)
    const { error: err } = await supabase!.auth.updateUser({ password })
    if (err) { setError("Gagal: " + (err.message || "coba lagi")); setLoading(false); return }
    setSuccess(true)
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="text-center px-6 max-w-sm">
        <ShieldCheck size={48} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
        <h1 className="text-lg font-bold mb-2" style={{ color: "#1E2938" }}>Password Berhasil Diubah!</h1>
        <p className="text-sm" style={{ color: "#647488" }}>Silakan login dengan password barumu.</p>
        <Link href="/login" className="mt-6 inline-block px-8 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#084463" }}>Masuk</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F8FAFC" }}>
      <div className="w-full max-w-sm">
        <Link href="/login" className="flex items-center gap-1 text-sm mb-6" style={{ color: "#647488" }}><ArrowLeft size={16} /> Kembali</Link>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Atur Password Baru</h1>
        <p className="text-xs mb-6" style={{ color: "#647488" }}>Masukkan password baru untuk akunmu</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password baru" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#647488" }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Konfirmasi password" className="w-full px-4 py-3 rounded-xl border text-sm outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 cursor-pointer" style={{ background: "#084463" }}>{loading ? "Menyimpan..." : "Simpan Password Baru"}</button>
        </form>
      </div>
    </div>
  )
}
