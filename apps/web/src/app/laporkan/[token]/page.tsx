"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Shield, TrendingUp, Eye, MousePointerClick, Ticket, CheckCircle2, XCircle } from "lucide-react";

export default function LaporanPage() {
  const params = useParams();
  const token = params.token as string;
  const [step, setStep] = useState<"loading" | "pin" | "report">("loading");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/laporkan/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); setStep("pin"); return; }
        setMerchantName(d.name);
        setStep("pin");
      })
      .catch(() => setError("Gagal memuat"));
  }, [token]);

  async function handleVerify() {
    if (pin.length !== 4) { setError("PIN harus 4 digit"); return; }
    setError("");
    try {
      const res = await fetch(`/api/laporkan/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error); return; }
      setData(json);
      setStep("report");
    } catch { setError("Gagal verifikasi"); }
  }

  if (step === "loading") {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="w-8 h-8 border-2 border-[#084463] border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  if (step === "pin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F8FAFC" }}>
        <div className="w-full max-w-sm p-6 rounded-2xl shadow-lg" style={{ background: "#FFFFFF" }}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(8,68,99,0.1)" }}>
              <Shield size={24} style={{ color: "#084463" }} />
            </div>
            <h1 className="text-lg font-bold" style={{ color: "#1E2938" }}>Laporan Merchant</h1>
            <p className="text-sm mt-1" style={{ color: "#647488" }}>{merchantName || "—"}</p>
          </div>

          <input
            type="text" inputMode="numeric" maxLength={4}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setError(""); }}
            placeholder="4 digit PIN"
            className="w-32 mx-auto block text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl border font-mono font-bold focus:outline-none mb-1"
            style={{ background: "#F8FAFC", borderColor: error ? "#EF4444" : "#E2E8F0", color: "#1E2938" }}
          />
          {error && <p className="text-xs text-center mb-3" style={{ color: "#EF4444" }}>{error}</p>}

          <button onClick={handleVerify} disabled={pin.length !== 4}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 mt-4"
            style={{ background: "#084463", color: "#FFFFFF" }}>
            🔓 Buka Laporan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#1E2938" }}>📊 {data.name}</h1>
          <p className="text-xs" style={{ color: "#647488" }}>{data.category}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Dilihat", value: data.stats.total_views, icon: Eye },
            { label: "Diklik", value: data.stats.total_clicks, icon: MousePointerClick },
            { label: "Diklaim", value: data.stats.total_claims, icon: Ticket },
            { label: "Dipakai", value: data.stats.total_redeemed, icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={14} style={{ color: "#647488" }} />
                <span className="text-xs" style={{ color: "#647488" }}>{s.label}</span>
              </div>
              <span className="text-2xl font-bold" style={{ color: "#1E2938" }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} style={{ color: "#084463" }} />
            <span className="text-sm font-semibold" style={{ color: "#1E2938" }}>Konversi</span>
          </div>
          {[
            { label: "Dilihat", value: data.stats.total_views, pct: 100 },
            { label: "Diklik", value: data.stats.total_clicks, pct: data.stats.total_views > 0 ? Math.round(data.stats.total_clicks / data.stats.total_views * 100) : 0 },
            { label: "Diklaim", value: data.stats.total_claims, pct: data.stats.total_views > 0 ? Math.round(data.stats.total_claims / data.stats.total_views * 100) : 0 },
            { label: "Dipakai", value: data.stats.total_redeemed, pct: data.stats.total_views > 0 ? Math.round(data.stats.total_redeemed / data.stats.total_views * 100) : 0 },
          ].map((f) => (
            <div key={f.label} className="space-y-1 mb-2">
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: "#647488" }}>{f.label}</span>
                <span style={{ color: "#1E2938" }}>{f.value} ({f.pct}%)</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "#E2E8F0" }}>
                <div className="h-2 rounded-full" style={{ width: `${f.pct}%`, background: "#084463" }} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold mb-3" style={{ color: "#1E2938" }}>👤 Klaim Terbaru</p>
          <div className="space-y-2">
            {data.claims.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
                <span className="text-xs font-mono font-bold" style={{ color: "#084463" }}>{c.voucher_code}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${c.status === "redeemed" ? "bg-green-100 text-green-700" : c.status === "expired" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                  {c.status === "redeemed" ? "✅ Dipakai" : c.status === "expired" ? "❌ Hangus" : "🎫 Aktif"}
                </span>
                <span className="text-[10px]" style={{ color: "#647488" }}>
                  {new Date(c.activated_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
