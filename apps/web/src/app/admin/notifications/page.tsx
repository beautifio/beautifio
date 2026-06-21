"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Bell, Send, History, Info } from "lucide-react"

const NOTIF_TYPES = [
  { value: "event", label: "🗓️ Event Baru" },
  { value: "promo", label: "🎉 Promo / Voucher" },
  { value: "recommendation", label: "⭐ Rekomendasi Produk" },
]

export default function AdminNotificationsPage() {
  const [type, setType] = useState("event")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    if (!supabase) return
    const { data } = await supabase
      .from("broadcast_logs")
      .select("*, admin:admin_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(20)
    if (data) setLogs(data)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !title.trim() || !body.trim()) return
    setSending(true)
    setResult(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")
      const { data, error } = await supabase.rpc("send_broadcast_notification", {
        p_type: type,
        p_title: title.trim(),
        p_body: body.trim(),
        p_link_url: linkUrl.trim() || null,
        p_admin_id: user.id,
      })
      if (error) throw error
      const res = data as any
      setResult({ ok: true, msg: `Berhasil! Notifikasi terkirim ke ${res.recipient_count} user.` })
      setTitle("")
      setBody("")
      setLinkUrl("")
      loadLogs()
    } catch (e: any) {
      setResult({ ok: false, msg: e.message || "Gagal mengirim" })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      {/* Form */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Send size={16} /> Kirim Broadcast
        </h2>
        <form onSubmit={handleSend} className="space-y-4 bg-white rounded-xl border border-gray-200 p-5">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Tipe Notifikasi</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-amber-500"
            >
              {NOTIF_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Event Baru: Webinar Growth Mindset"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-amber-500 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Isi Pesan</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Deskripsi notifikasi..."
              rows={3}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-amber-500 placeholder:text-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Link URL <span className="text-gray-300">(opsional)</span>
            </label>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://beautifio-web.vercel.app/..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-amber-500 placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={sending || !title.trim() || !body.trim()}
            className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            {sending ? "Mengirim..." : "Kirim ke Semua User"}
          </button>

          {result && (
            <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
              result.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              <Info size={14} className="mt-0.5 shrink-0" />
              <span>{result.msg}</span>
            </div>
          )}
        </form>
      </section>

      {/* Riwayat */}
      <section>
        <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History size={16} /> Riwayat Broadcast
        </h2>
        <div className="space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada broadcast</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {NOTIF_TYPES.find((t) => t.value === log.type)?.label || log.type}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.created_at).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{log.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{log.body}</p>
                    {log.link_url && (
                      <p className="text-[10px] text-blue-500 mt-1 truncate">{log.link_url}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-medium text-gray-700">{log.recipient_count} user</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{log.admin?.full_name || "Admin"}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
