"use client"

import { useState, useEffect } from 'react'
import { BarChart3, Clock, Star, TrendingUp, Users } from 'lucide-react'

const CATEGORY_EMOJI: Record<string, string> = { psikologi: '🧠', agama: '🕌', umum: '📞', bisnis: '💼' }

export default function CareReportsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/care/reports")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  if (!data) return <p className="p-6 text-sm text-text-secondary">Gagal memuat laporan</p>

  const { summary, byCategory, agentStats } = data

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-content mx-auto px-4 py-6 space-y-4">
        <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <BarChart3 size={20} className="text-primary" /> Laporan Care
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-2">
          <Card icon={<TrendingUp size={16} />} label="Total Case" value={summary.totalMonth} color="#084463" />
          <Card icon={<Users size={16} />} label="Resolved" value={summary.resolvedMonth} color="#22C55E" />
          <Card icon={<Clock size={16} />} label="Avg Response" value={`${summary.avgResponse}m`} color="#6BB9D4" />
          <Card icon={<Star size={16} />} label="Avg Rating" value={`${summary.avgRating} ⭐`} color="#FFC64F" />
        </div>

        {/* By Category */}
        <div>
          <h2 className="text-sm font-bold text-text-primary mb-2">Per Kategori</h2>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Kategori</th>
                  <th className="text-center px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Total</th>
                  <th className="text-center px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Resolved</th>
                  <th className="text-center px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {byCategory?.map((c: any) => (
                  <tr key={c.category}>
                    <td className="px-3 py-2 text-xs font-medium text-text-primary">{CATEGORY_EMOJI[c.category] || '📌'} {c.category}</td>
                    <td className="text-center px-2 py-2 text-xs font-bold text-text-primary">{c.total}</td>
                    <td className="text-center px-2 py-2 text-xs text-text-secondary">{c.resolved}</td>
                    <td className="text-center px-2 py-2 text-xs font-medium text-success">{c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* By Agent */}
        <div>
          <h2 className="text-sm font-bold text-text-primary mb-2">Per Agent</h2>
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Agent</th>
                  <th className="text-center px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Total</th>
                  <th className="text-center px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agentStats?.map((a: any) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 text-xs font-medium text-text-primary">
                      {a.name} {a.isAI ? <span className="text-[9px] text-amber-500 ml-1">(AI)</span> : null}
                    </td>
                    <td className="text-center px-2 py-2 text-xs font-bold text-text-primary">{a.total}</td>
                    <td className="text-center px-2 py-2 text-xs text-text-secondary">{a.resolved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="rounded-2xl bg-primary/5 border border-primary/10 p-4 text-center">
          <p className="text-xs text-text-secondary">
            Avg Resolution Time: <strong className="text-text-primary">{summary.avgResolution} jam</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

function Card({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-3 text-center">
      <div className="flex justify-center mb-1" style={{ color }}>{icon}</div>
      <p className="text-lg font-bold font-display" style={{ color }}>{value}</p>
      <p className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary">{label}</p>
    </div>
  )
}
