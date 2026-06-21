"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Check, X, Loader2, MessageCircle, Users } from "lucide-react"
import Link from "next/link"

interface Submission {
  id: string
  user_id: string
  name: string
  description: string
  goal_category: string
  capacity: number
  status: string
  created_at: string
  users?: { id: string; email?: string; full_name?: string }
}

export default function AdminForumsPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const load = async () => {
    if (!supabase) return
    const { data } = await supabase
      .from("circle_submissions")
      .select("*, users(id, full_name)")
      .order("created_at", { ascending: false })
    if (data) setSubmissions(data as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id: string) => {
    setProcessing(id)
    const { data: me } = await supabase!.rpc("approve_circle_submission", {
      submission_id: id,
      admin_id: (await supabase!.auth.getUser()).data.user?.id,
    })
    if (me) {
      setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "approved" } : s))
    }
    setProcessing(null)
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    await supabase!.rpc("reject_circle_submission", {
      submission_id: id,
      admin_id: (await supabase!.auth.getUser()).data.user?.id,
    })
    setSubmissions((prev) => prev.map((s) => s.id === id ? { ...s, status: "rejected" } : s))
    setProcessing(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const pending = submissions.filter((s) => s.status === "pending")

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Pengajuan Forum</h1>
          <p className="text-xs text-gray-500 mt-1">{pending.length} menunggu persetujuan</p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Belum ada pengajuan forum</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">{s.name}</h3>
                    {s.status === "pending" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">Pending</span>
                    )}
                    {s.status === "approved" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Disetujui</span>
                    )}
                    {s.status === "rejected" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Ditolak</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{s.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={10} /> {s.capacity} anggota
                    </span>
                    <span>{s.goal_category}</span>
                    <span>oleh {s.users?.full_name || "User"}</span>
                    <span>{new Date(s.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                {s.status === "pending" && (
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => handleApprove(s.id)}
                      disabled={processing === s.id}
                      className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                    >
                      {processing === s.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    </button>
                    <button
                      onClick={() => handleReject(s.id)}
                      disabled={processing === s.id}
                      className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/circle"
          className="text-xs text-[#084463] font-medium hover:underline"
        >
          Lihat semua circle &rarr;
        </Link>
      </div>
    </div>
  )
}
