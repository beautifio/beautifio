"use client"

import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function DaftarSuksesPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="text-center px-6 max-w-sm">
        <CheckCircle size={56} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
        <h1 className="text-lg font-bold mb-2" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Pendaftaran Terkirim!</h1>
        <p className="text-sm leading-relaxed" style={{ color: "#647488" }}>Pendaftaran kamu sedang ditinjau oleh tim kami. Kami akan menghubungi kamu dalam 1-3 hari kerja.</p>
        <button onClick={() => router.push("/")} className="mt-6 flex items-center justify-center gap-2 mx-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>
          Kembali ke Beranda <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
