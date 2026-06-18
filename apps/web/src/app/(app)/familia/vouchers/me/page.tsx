"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Gift, Ticket } from "lucide-react";

import { VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS } from "@beautifio/utils";

type Tab = "active" | "history";

interface VoucherItem {
  id: string;
  user_id: string;
  merchant_id: string;
  voucher_code: string;
  status: string;
  pin_required: string;
  activated_at: string;
  expires_at: string;
  redeemed_at?: string;
  created_at: string;
  merchant: { id: string; name: string; category: string; logo_url?: string } | null;
}

function Countdown({ expiresAt }: { expiresAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(diff);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const m = Math.floor(remaining / 60);
  const s = remaining % 60;

  if (remaining === 0) return <span className="text-red-500 font-mono">00:00</span>;

  return (
    <span className={`font-mono ${remaining < 60 ? "text-red-500" : "text-amber-600"}`}>
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

export default function MyVouchersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [active, setActive] = useState<VoucherItem[]>([]);
  const [history, setHistory] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [activeRes, historyRes] = await Promise.all([
          fetch("/api/familia/vouchers/active"),
          fetch("/api/familia/vouchers/history"),
        ]);
        if (activeRes.ok) {
          const { data } = await activeRes.json();
          setActive(data || []);
        }
        if (historyRes.ok) {
          const { data } = await historyRes.json();
          setHistory(data || []);
        }
      } catch (e) {
        console.error("Failed to load vouchers", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRedeem = async (sessionId: string) => {
    setRedeeming(sessionId);
    try {
      const res = await fetch("/api/familia/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, pin: "0000" }),
      });
      if (res.ok) {
        setActive((prev) => prev.filter((v) => v.id !== sessionId));
        const json = await res.json();
        setHistory((prev) => [
          {
            id: sessionId,
            user_id: "",
            merchant_id: "",
            voucher_code: json.data?.voucher_code || "",
            status: "redeemed",
            pin_required: "",
            activated_at: "",
            expires_at: "",
            redeemed_at: new Date().toISOString(),
            created_at: "",
            merchant: active.find((v) => v.id === sessionId)?.merchant || null,
          },
          ...prev,
        ]);
      }
    } catch (e) {
      console.error("Redeem failed", e);
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/familia/vouchers")} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all active:scale-90 mb-4">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Voucherku</h1>
        <p className="text-xs text-gray-500 mb-4">Kelola voucher aktif & riwayat</p>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 mb-5">
          {[
            { key: "active" as Tab, label: "Aktif", count: active.length },
            { key: "history" as Tab, label: "Riwayat", count: history.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {tab === "active" && (
          <div className="space-y-3">
            {active.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Tidak ada voucher aktif</p>
                <p className="text-xs text-gray-400 mt-1">Klaim voucher dari merchant di Voucher Center</p>
              </div>
            )}
            {active.map((v) => (
              <div key={v.id} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-amber-200 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{v.merchant?.name || "Merchant"}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{v.voucher_code}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3" />
                    <Countdown expiresAt={v.expires_at} />
                  </div>
                </div>
                <button
                  onClick={() => handleRedeem(v.id)}
                  disabled={redeeming === v.id}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {redeeming === v.id ? "Memproses..." : "Gunakan Voucher"}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-2">
            {history.length === 0 && (
              <div className="text-center py-12">
                <Ticket className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Belum ada riwayat</p>
              </div>
            )}
            {history.map((v) => (
              <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  v.status === "redeemed" ? "bg-green-100" : "bg-red-100"
                }`}>
                  {v.status === "redeemed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{v.merchant?.name || "Merchant"}</p>
                  <p className="text-[10px] text-gray-400">{v.voucher_code}</p>
                </div>
                <span className={`text-[10px] font-medium ${
                  v.status === "redeemed" ? "text-green-600" : "text-red-400"
                }`}>
                  {v.status === "redeemed" ? "Berhasil" : "Kadaluwarsa"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
