"use client"

import { useState, useEffect } from "react"
import { Loader2, Download, TrendingUp, DollarSign, Users, Clock } from "lucide-react"

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"]

export default function KeuanganPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    const url = month ? `/api/admin/keuangan?tahun=${year}&bulan=${month}` : `/api/admin/keuangan?tahun=${year}`
    fetch(url).then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [year, month])

  const f = (v: number) => `Rp ${(v || 0).toLocaleString("id-ID")}`

  const barMax = data ? Math.max(...data.monthly.map((m: any) => m.bruto), 1) : 1

  const exportCSV = () => {
    if (!data?.transactions) return
    const csv = ["Tanggal,Tipe,Invoice,Nett,PPN,Bruto,Doku Fee,PPh,Nett Final"].concat(
      data.transactions.map((t: any) => `${new Date(t.date).toLocaleDateString("id-ID")},${t.type},${t.invoice||""},${t.nett},${t.ppn},${t.bruto},${t.doku},${t.pph},${t.nettFinal}`)
    ).join("\n")
    const blob = new Blob(["\uFEFF"+csv], { type: "text/csv" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `keuangan-${year}${month ? "-"+month : ""}.csv`; a.click()
  }

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>

  return (
    <div className="space-y-4 max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>💰 Laporan Keuangan</h1>
        <div className="flex gap-2">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }}>
            {[2025,2026,2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month || ""} onChange={e => setMonth(e.target.value ? Number(e.target.value) : null)} className="px-3 py-1.5 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }}>
            <option value="">Semua Bulan</option>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg cursor-pointer border" style={{ borderColor: "#E2E8F0", color: "#647488" }}><Download size={12} /> CSV</button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#647488" }}>📊 Pendapatan Bulanan — {year}</p>
        <div className="flex items-end gap-1 h-40">
          {data?.monthly?.map((m: any, i: number) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px]" style={{ color: "#647488" }}>{m.bruto > 0 ? (m.bruto / 1000).toFixed(0) + "K" : ""}</span>
              <div className="w-full rounded-t" style={{ height: `${Math.max(4, (m.bruto / barMax) * 150)}px`, background: `${["#084463","#6BB9D4","#FFC64F"][i%3]}` }} />
              <span className="text-[9px]" style={{ color: "#647488" }}>{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Pendapatan Bruto", value: f(data?.summary?.bruto), icon: DollarSign, color: "#084463" },
          { label: "Doku Fee", value: f(data?.summary?.doku), icon: TrendingUp, color: "#EF4444" },
          { label: "PPN 11%", value: f(data?.summary?.ppn), icon: Clock, color: "#F59E0B" },
          { label: "PPh", value: f(data?.summary?.pph), icon: Clock, color: "#647488" },
          { label: "Platform Fee", value: f(data?.summary?.platformFee), icon: Users, color: "#6BB9D4" },
          { label: "Nett Beautifio", value: f(data?.summary?.nett), icon: DollarSign, color: "#22C55E" },
        ].map((c, i) => (
          <div key={i} className="p-3 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <p className="text-[10px] mb-1" style={{ color: "#647488" }}>{c.label}</p>
            <p className="text-sm font-bold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Piutang */}
      <div className="p-3 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "#647488" }}>👩‍⚕️ Piutang Mitra</p>
        <p className="text-sm font-bold mb-2" style={{ color: "#EEEE44" }}>{f(data?.summary?.piutang)}</p>
        {data?.piutang?.map((p: any) => (
          <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b last:border-b-0" style={{ borderColor: "#E2E8F0" }}>
            <span style={{ color: "#1E2938" }}>{p.name}</span>
            <span className="text-[10px]" style={{ color: "#647488" }}>{p.sessions} sesi · {f(p.bagian)}</span>
          </div>
        ))}
      </div>

      {/* Rincian */}
      <div className="space-y-2">
        <p className="text-xs font-semibold" style={{ color: "#647488" }}>📊 Rincian per Sumber</p>
        {["subscription","event","consultation"].map(k => {
          const d = data?.bySource?.[k]
          if (!d?.count) return null
          return (
            <div key={k} className="p-3 rounded-xl border text-xs" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <p className="font-semibold mb-1" style={{ color: "#1E2938" }}>{k === "subscription" ? "📦 Subscription" : k === "event" ? "🎫 Event" : "💬 Konsultasi"} — {d.count} transaksi</p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5" style={{ color: "#647488" }}>
                <span>Bruto: {f(d.bruto)}</span><span>Doku: {f(d.doku)}</span><span>PPN: {f(d.ppn)}</span>
                {k === "consultation" && <><span>Platform Fee: {f(d.platformFee)}</span></>}
                <span>PPh: {f(d.pph)}</span><span className="font-semibold" style={{ color: "#22C55E" }}>Nett: {f(d.nett)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Transactions */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
        <table className="w-full text-xs">
          <thead><tr style={{ background: "#F8FAFC", color: "#647488" }}>{["Tanggal","Tipe","Nett","PPN","Bruto","Doku","PPh","Nett Final"].map(h => <th key={h} className="text-left py-2 px-2 font-semibold">{h}</th>)}</tr></thead>
          <tbody>
            {data?.transactions?.map((t: any, i: number) => (
              <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                <td className="py-2 px-2">{new Date(t.date).toLocaleDateString("id-ID", { day:"numeric", month:"short" })}</td>
                <td className="py-2 px-2">{t.type}</td>
                <td className="py-2 px-2">{f(t.nett)}</td>
                <td className="py-2 px-2">{f(t.ppn)}</td>
                <td className="py-2 px-2 font-semibold" style={{ color: "#084463" }}>{f(t.bruto)}</td>
                <td className="py-2 px-2" style={{ color: "#EF4444" }}>{f(t.doku)}</td>
                <td className="py-2 px-2">{f(t.pph)}</td>
                <td className="py-2 px-2 font-semibold" style={{ color: "#22C55E" }}>{f(t.nettFinal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
