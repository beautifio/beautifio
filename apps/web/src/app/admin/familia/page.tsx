"use client";

import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/familia/stats");
        if (res.ok) {
          const { data } = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}</div>;
  }

  if (!stats) return <p className="text-sm text-gray-500">Gagal memuat statistik</p>;

  const cards = [
    { label: "Merchant Aktif", value: stats.merchants },
    { label: "Total Voucher Sessions", value: stats.total_voucher_sessions },
    { label: "Redemption Hari Ini", value: stats.redemptions_today },
    { label: "Redemption Minggu Ini", value: stats.redemptions_week },
    { label: "Redemption Bulan Ini", value: stats.redemptions_month },
    { label: "Deals Aktif", value: stats.active_deals },
    { label: "Rewards Aktif", value: stats.active_rewards },
    { label: "Achievement Completed", value: stats.achievements_completed },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="p-4 rounded-xl bg-white border border-gray-200">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      {stats.top_merchants?.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Top Merchants (Bulan Ini)</h3>
          <div className="space-y-2">
            {stats.top_merchants.map((m: any, i: number) => (
              <div key={m.merchantId} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-semibold text-gray-900 flex-1">{m.name || "Unknown"}</span>
                <span className="text-sm font-bold text-amber-600">{m.count} redemption</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
