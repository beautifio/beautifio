"use client"

import { useState, useEffect } from "react"

const STATUS_COLORS: Record<string, string> = { success: "bg-green-100 text-green-700", invalid_pin: "bg-red-100 text-red-700", expired: "bg-yellow-100 text-yellow-700", duplicate: "bg-gray-100 text-gray-700" }
const STATUS_LABELS: Record<string, string> = { success: "Berhasil", invalid_pin: "PIN Salah", expired: "Kadaluwarsa", duplicate: "Duplikat" }

export default function RedemptionLogTab() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [stats, setStats] = useState<any>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const url = statusFilter ? `/api/admin/familia/redemption-log?status=${statusFilter}` : "/api/admin/familia/redemption-log"
      const [logRes, statsRes] = await Promise.all([fetch(url), fetch("/api/admin/familia/stats")])
      if (logRes.ok) setLogs(((await logRes.json()).data || []))
      if (statsRes.ok) setStats((await statsRes.json()).data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchLogs() }, [statusFilter])

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Redemption Log</h1>
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[{label:"Hari Ini",key:"redemptions_today"},{label:"Minggu Ini",key:"redemptions_week"},{label:"Bulan Ini",key:"redemptions_month"}].map(s=>(
            <div key={s.key} className="p-3 rounded-xl bg-white border border-gray-200 text-center">
              <p className="text-[10px] text-gray-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-900">{stats[s.key]}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto">
        {[{key:"",label:"Semua"},{key:"success",label:"Berhasil"},{key:"invalid_pin",label:"PIN Salah"},{key:"expired",label:"Expired"},{key:"duplicate",label:"Duplikat"}].map(f=>(
          <button key={f.key} onClick={()=>setStatusFilter(f.key)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${statusFilter===f.key?"bg-amber-500 text-white border-amber-500":"bg-white text-gray-600 border-gray-200 hover:border-amber-300"}`}>{f.label}</button>
        ))}
      </div>
      {loading ? <div className="space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse"/>)}</div>
      : logs.length===0 ? <p className="text-sm text-gray-500 text-center py-8">Belum ada data</p>
      : <div className="space-y-2">{logs.map(log=>(
          <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-900">{log.merchant?.name||"Unknown"}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[log.status]||"bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[log.status]||log.status}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                <span className="font-mono">{log.voucher_code}</span>
                <span>{new Date(log.redeemed_at).toLocaleString("id-ID")}</span>
                {log.status==="invalid_pin"&&<span className="text-red-400">PIN: {log.pin_entered}</span>}
              </div>
            </div>
          </div>
        ))}</div>}
    </div>
  )
}
