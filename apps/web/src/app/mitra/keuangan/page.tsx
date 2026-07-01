"use client"

import { useState, useEffect } from "react"
import { Loader2, DollarSign, TrendingUp, Download } from "lucide-react"

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

export default function MitraKeuangan() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()

  useEffect(() => {
    fetch(`/api/mitra/keuangan?tahun=${year}`).then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const f = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`
  const barMax = data ? Math.max(...(data.monthly || []).map((m: any) => m.bruto), 1) : 1

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#647488" }}>📊 Pendapatan Bulanan — {year}</p>
        <div className="flex items-end gap-1 h-32">
          {(data?.monthly || []).map((m: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[8px]" style={{ color: "#647488" }}>{m.bruto > 0 ? (m.bruto/1000).toFixed(0)+"K" : ""}</span>
              <div className="w-full rounded-t" style={{ height: `${Math.max(4, (m.bruto/barMax)*120)}px`, background: i%2?"#FFC64F":"#084463" }} />
              <span className="text-[8px]" style={{ color: "#647488" }}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label:"Bruto", value: f(data?.summary?.bruto), color:"#084463" },
          { label:"Doku Fee", value: f(data?.summary?.doku), color:"#EF4444" },
          { label:"PPN 11%", value: f(data?.summary?.ppn), color:"#F59E0B" },
          { label:"Platform Fee", value: f(data?.summary?.platformFee), color:"#6BB9D4" },
          { label:"Sesi Selesai", value: data?.summary?.totalSessions||0, color:"#647488" },
          { label:"Nett Mitra", value: f(data?.summary?.nett), color:"#22C55E" },
        ].map((c,i) => (
          <div key={i} className="p-3 rounded-xl border" style={{ background:"#FFFFFF", borderColor:"#E2E8F0" }}>
            <p className="text-[10px] mb-0.5" style={{ color:"#647488" }}>{c.label}</p>
            <p className="text-sm font-bold" style={{ color:c.color }}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
