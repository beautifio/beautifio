"use client"

import { useState } from "react"
import VoucherStatsTab from "./VoucherStatsTab"
import RedemptionLogTab from "./RedemptionLogTab"

const TABS = [
  { key: "stats", label: "📊 Laporan" },
  { key: "log", label: "📋 Redemption Log" },
]

export default function VoucherPage() {
  const [tab, setTab] = useState("stats")

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${tab === t.key ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "stats" ? <VoucherStatsTab /> : <RedemptionLogTab />}
    </div>
  )
}
