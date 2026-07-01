"use client"

import { useEffect, useState, useCallback } from "react"

interface Stats {
  total_views: number
  total_clicks: number
  total_claims: number
  total_redeemed: number
  total_expired: number
  merchants: MerchantStats[]
  claims: ClaimRow[]
}

interface MerchantStats {
  id: string
  name: string
  category: string
  views: number
  clicks: number
  claims: number
  redeemed: number
  expired: number
}

interface ClaimRow {
  user_email: string
  voucher_code: string
  merchant_name: string
  claimed_at: string
  status: string
}

export default function VoucherStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/familia/stats")
      if (res.ok) {
        const json = await res.json()
        setStats(json.data)
      }
    } catch (e) {
      console.error("Failed to load stats", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const downloadCSV = useCallback(() => {
    if (!stats) return
    const rows: string[] = []
    rows.push("Beautifio — Laporan Voucher")
    rows.push(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`)
    rows.push("")
    rows.push("Ringkasan")
    rows.push(`Dilihat,${stats.total_views}`)
    rows.push(`Diklik,${stats.total_clicks}`)
    rows.push(`Diklaim,${stats.total_claims}`)
    rows.push(`Dipakai,${stats.total_redeemed}`)
    rows.push("")
    rows.push("Per Merchant")
    rows.push("Nama,Kategori,Views,Clicks,Claims,Redeemed,Expired")
    stats.merchants.forEach(m => {
      rows.push(`"${m.name}",${m.category},${m.views},${m.clicks},${m.claims},${m.redeemed},${m.expired}`)
    })
    rows.push("")
    rows.push("Daftar Pengklaim")
    rows.push("User,Kode,Merchant,Tanggal,Status")
    stats.claims.forEach(c => {
      rows.push(`${c.user_email},"${c.voucher_code}","${c.merchant_name}",${c.claimed_at},${c.status}`)
    })
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `laporan-voucher-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }, [stats])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div className="p-6"><p style={{ color: "#647488" }}>Gagal memuat data.</p></div>
  }

  return (
    <div className="p-6 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: "#1E2938" }}>📊 Laporan Voucher</h1>
        <button onClick={downloadCSV} disabled={!stats}
          className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50"
          style={{ background: "#084463", color: "#FFFFFF" }}>
          📥 Download CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Dilihat", value: stats.total_views, emoji: "👁" },
          { label: "Diklik", value: stats.total_clicks, emoji: "👆" },
          { label: "Diklaim", value: stats.total_claims, emoji: "🎫" },
          { label: "Dipakai", value: stats.total_redeemed, emoji: "✅" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <p className="text-xs" style={{ color: "#647488" }}>{s.emoji} {s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "#1E2938" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Conversion funnel */}
      <div className="p-4 rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
        <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>📈 Conversion Funnel</p>
        {[
          { label: "Dilihat", value: stats.total_views, pct: 100 },
          { label: "Diklik", value: stats.total_clicks, pct: stats.total_views > 0 ? Math.round(stats.total_clicks / stats.total_views * 100) : 0 },
          { label: "Diklaim", value: stats.total_claims, pct: stats.total_views > 0 ? Math.round(stats.total_claims / stats.total_views * 100) : 0 },
          { label: "Dipakai", value: stats.total_redeemed, pct: stats.total_views > 0 ? Math.round(stats.total_redeemed / stats.total_views * 100) : 0 },
        ].map((f) => (
          <div key={f.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "#647488" }}>{f.label}</span>
              <span style={{ color: "#1E2938" }}>{f.value} ({f.pct}%)</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: "#E2E8F0" }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${f.pct}%`, background: "#084463" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Per merchant */}
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>🏪 Per Merchant</p>
        {stats.merchants.map((m) => (
          <div key={m.id} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>{m.name}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#F8FAFC", color: "#647488", border: "1px solid #E2E8F0" }}>{m.category}</span>
              </div>
              <span className="text-xs" style={{ color: "#22C55E" }}>
                {m.views > 0 ? Math.round(m.redeemed / m.views * 100 * 10) / 10 : 0}% conversion
              </span>
            </div>
            <div className="flex gap-4 text-xs" style={{ color: "#647488" }}>
              <span>👁 {m.views}</span>
              <span>👆 {m.clicks}</span>
              <span>🎫 {m.claims}</span>
              <span>✅ {m.redeemed}</span>
              <span>❌ {m.expired}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Claims table */}
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>👤 Pengguna yang Mengklaim</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", color: "#647488" }}>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Kode</th>
                <th className="text-left p-2">Merchant</th>
                <th className="text-left p-2">Tanggal</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.claims.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                  <td className="p-2" style={{ color: "#1E2938" }}>{c.user_email}</td>
                  <td className="p-2 font-mono" style={{ color: "#084463" }}>{c.voucher_code}</td>
                  <td className="p-2" style={{ color: "#647488" }}>{c.merchant_name}</td>
                  <td className="p-2" style={{ color: "#647488" }}>{new Date(c.claimed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="p-2"><span className="px-1.5 py-0.5 rounded text-[10px]" style={{
                    background: c.status === "redeemed" ? "rgba(34,197,94,0.1)" : c.status === "expired" ? "rgba(239,68,68,0.1)" : "rgba(8,68,99,0.1)",
                    color: c.status === "redeemed" ? "#22C55E" : c.status === "expired" ? "#EF4444" : "#084463",
                  }}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
