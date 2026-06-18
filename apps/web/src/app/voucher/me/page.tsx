"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Ticket, Trophy, X, AlertCircle } from "lucide-react";

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

function PinModal({
  voucher,
  onConfirm,
  onCancel,
  redeeming,
  error,
}: {
  voucher: VoucherItem;
  onConfirm: (sessionId: string, pin: string) => void;
  onCancel: () => void;
  redeeming: boolean;
  error: string;
}) {
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPin("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [voucher.id]);

  const handleSubmit = () => {
    if (pin.length < 4) return;
    onConfirm(voucher.id, pin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl">
        <button onClick={onCancel} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-all">
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
          <Ticket className="w-6 h-6 text-amber-600" />
        </div>

        <h2 className="text-lg font-bold text-gray-900 text-center">Gunakan Voucher</h2>
        <p className="text-xs text-gray-500 text-center mt-1">{voucher.merchant?.name || "Merchant"}</p>

        <div className="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-[10px] text-gray-500 font-medium">Kode Voucher</p>
          <p className="text-sm font-mono font-bold text-gray-900 mt-0.5">{voucher.voucher_code}</p>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-700 leading-relaxed">
              Minta PIN harian dari kasir/{voucher.merchant?.name || "merchant"}, lalu masukkan di bawah ini untuk menukarkan voucher.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-[10px] text-gray-500 font-medium block mb-1">PIN Harian</label>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
              setPin(v);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="****"
            className="w-full text-center text-2xl font-mono font-bold tracking-[0.5em] px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all placeholder:text-gray-200"
            disabled={redeeming}
          />
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} disabled={redeeming} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 cursor-pointer">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length < 4 || redeeming}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 cursor-pointer"
          >
            {redeeming ? "Memproses..." : "Konfirmasi"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyVouchersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [active, setActive] = useState<VoucherItem[]>([]);
  const [history, setHistory] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [achievementCount, setAchievementCount] = useState(0);
  const [pinModalVoucher, setPinModalVoucher] = useState<VoucherItem | null>(null);
  const [redeemError, setRedeemError] = useState("");

  const fetchData = async () => {
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

      const achRes = await fetch("/api/familia/achievements/progress");
      if (achRes.ok) {
        const { data } = await achRes.json();
        setAchievementCount((data || []).filter((a: any) => a.is_completed).length);
      }
    } catch (e) {
      console.error("Failed to load vouchers", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRedeem = async (sessionId: string, pin: string) => {
    setRedeeming(sessionId);
    setRedeemError("");
    try {
      const res = await fetch("/api/familia/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, pin }),
      });
      const json = await res.json();
      if (res.ok) {
        setPinModalVoucher(null);
        setActive((prev) => prev.filter((v) => v.id !== sessionId));
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
      } else {
        setRedeemError(json.error || "Gagal menukarkan voucher");
      }
    } catch (e) {
      setRedeemError("Terjadi kesalahan jaringan");
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
        <button onClick={() => router.push("/voucher")} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all active:scale-90 mb-4">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-1">Voucherku</h1>
        <p className="text-xs text-gray-500 mb-4">Kelola voucher aktif & riwayat</p>

        {achievementCount > 0 && (
          <a href="/profil" className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-start gap-2">
            <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">🏆 {achievementCount} pencapaian sudah terbuka</p>
              <p className="text-[10px] text-amber-600">Lihat di Profilmu →</p>
            </div>
          </a>
        )}

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
                <p className="text-xs text-gray-400 mt-1">Klaim voucher dari merchant di Voucher</p>
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
                  onClick={() => setPinModalVoucher(v)}
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

      {pinModalVoucher && (
        <PinModal
          voucher={pinModalVoucher}
          onConfirm={handleRedeem}
          onCancel={() => { setPinModalVoucher(null); setRedeemError(""); }}
          redeeming={redeeming === pinModalVoucher.id}
          error={redeemError}
        />
      )}

      {redeemError && !pinModalVoucher && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 shadow-lg text-xs text-red-700">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>{redeemError}</span>
          <button onClick={() => setRedeemError("")} className="ml-2 cursor-pointer">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
