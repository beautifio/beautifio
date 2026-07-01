"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Ticket, Clock, CheckCircle2, XCircle, Shield, Copy } from "lucide-react";

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

  if (remaining === 0) return <span className="font-mono" style={{ color: "#EF4444" }}>00:00</span>;

  return (
    <span className="font-mono font-bold" style={{ color: remaining < 60 ? "#EF4444" : "#084463" }}>
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

  useEffect(() => { setPin(""); }, [voucher.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl" style={{ background: "#FFFFFF" }}>
        <button onClick={onCancel} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>✕</button>

        <h2 className="text-lg font-bold text-center mb-1" style={{ color: "#1E2938" }}>Masukkan PIN</h2>
        <p className="text-xs text-center" style={{ color: "#647488" }}>{voucher.merchant?.name}</p>
        <p className="text-xs text-center mt-1 font-mono font-bold" style={{ color: "#647488" }}>Kode: {voucher.voucher_code}</p>

        <input
          type="text" inputMode="numeric" maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="4 digit"
          className="mt-4 w-32 mx-auto block text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl border font-mono font-bold focus:outline-none"
          style={{ background: "#F8FAFC", borderColor: "#E2E8F0", color: "#1E2938" }}
        />
        {error && <p className="text-xs text-center mt-2" style={{ color: "#EF4444" }}>{error}</p>}

        <button onClick={() => onConfirm(voucher.id, pin)} disabled={pin.length < 4 || redeeming}
          className="mt-5 w-full py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          style={{ background: "#084463", color: "#FFFFFF" }}>
          {redeeming ? "Memverifikasi..." : "Pakai Voucher"}
        </button>
      </div>
    </div>
  );
}

export default function VoucherMePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("active");
  const [active, setActive] = useState<VoucherItem[]>([]);
  const [history, setHistory] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemVoucher, setRedeemVoucher] = useState<VoucherItem | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
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
      // console.error("Failed to load vouchers", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem(sessionId: string, pin: string) {
    setRedeeming(true);
    setRedeemError("");
    try {
      const res = await fetch("/api/familia/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, pin }),
      });
      if (!res.ok) {
        const json = await res.json();
        setRedeemError(json.error || "PIN salah");
        setRedeeming(false);
        return;
      }
      setRedeemVoucher(null);
      loadData();
    } catch {
      setRedeemError("Gagal verifikasi PIN");
    }
    setRedeeming(false);
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    }).catch(() => {});
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="h-4 w-48 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
              <div className="h-3 w-32 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        {/* Back */}
        <button onClick={() => router.push("/voucher")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft size={16} style={{ color: "#647488" }} />
        </button>

        <h1 className="text-xl font-bold mb-4" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Voucherku</h1>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
          {[
            { key: "active" as Tab, label: "Aktif", count: active.length },
            { key: "history" as Tab, label: "Riwayat", count: history.length },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: tab === t.key ? "#FFFFFF" : "transparent",
                color: tab === t.key ? "#1E2938" : "#647488",
                boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Active tab */}
        {tab === "active" && (
          <div className="space-y-3">
            {active.length === 0 ? (
              <div className="text-center py-16">
                <Ticket size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
                <p className="text-sm font-medium" style={{ color: "#647488" }}>Belum ada voucher aktif</p>
                <p className="text-xs mt-1" style={{ color: "#647488" }}>Klaim voucher dari halaman Voucher</p>
              </div>
            ) : (
              active.map((v) => (
                <div key={v.id} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold"
                      style={{ color: "#22C55E" }}>
                      <CheckCircle2 size={14} /> Aktif
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-mono">
                      <Clock size={12} />
                      <Countdown expiresAt={v.expires_at} />
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {v.merchant?.logo_url ? (
                      <img src={v.merchant.logo_url} alt="" className="w-6 h-6 rounded object-cover" loading="lazy" />
                    ) : null}
                    <div className="text-sm font-semibold" style={{ color: "#1E2938" }}>
                      {v.merchant?.name || "Merchant"}
                      <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: "#F8FAFC", color: "#647488", border: "1px solid #E2E8F0" }}>
                        {v.merchant?.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-mono font-bold tracking-wider"
                      style={{ color: "#084463" }}>{v.voucher_code}</span>
                    <button onClick={() => handleCopy(v.voucher_code)}
                      className="text-[10px] px-2 py-0.5 rounded font-medium transition-all cursor-pointer"
                      style={{
                        background: copied === v.voucher_code ? "#22C55E" : "#084463",
                        color: "#FFFFFF",
                      }}>
                      <Copy size={10} className="inline mr-1" />
                      {copied === v.voucher_code ? "Tersalin" : "Salin"}
                    </button>
                  </div>

                  <p className="text-[10px] mt-1.5" style={{ color: "#647488" }}>
                    Berlaku s/d {formatDate(v.expires_at)}
                  </p>

                  <button onClick={() => setRedeemVoucher(v)}
                    className="mt-3 w-full py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                    style={{ background: "#22C55E", color: "#FFFFFF" }}>
                    <Shield size={12} className="inline mr-1" /> Pakai Voucher
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-16">
                <Ticket size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
                <p className="text-sm font-medium" style={{ color: "#647488" }}>Belum ada riwayat</p>
              </div>
            ) : (
              history.map((v) => {
                const isRedeemed = v.status === "redeemed";
                return (
                  <div key={v.id} className="p-4 rounded-xl border" style={{
                    background: "#FFFFFF",
                    borderColor: "#E2E8F0",
                    opacity: isRedeemed ? 1 : 0.7,
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold"
                        style={{ color: isRedeemed ? "#22C55E" : "#EF4444" }}>
                        {isRedeemed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {isRedeemed ? "Terpakai" : "Hangus"}
                      </span>
                      <span className="text-[10px]" style={{ color: "#647488" }}>
                        {formatDate(v.redeemed_at || v.expires_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.merchant?.logo_url ? (
                        <img src={v.merchant.logo_url} alt="" className="w-5 h-5 rounded object-cover" loading="lazy" />
                      ) : null}
                      <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>{v.merchant?.name || "Merchant"}</p>
                    </div>
                    <p className="text-xs font-mono mt-1" style={{ color: "#647488" }}>{v.voucher_code}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {redeemVoucher && (
        <PinModal
          voucher={redeemVoucher}
          onConfirm={handleRedeem}
          onCancel={() => { setRedeemVoucher(null); setRedeemError(""); }}
          redeeming={redeeming}
          error={redeemError}
        />
      )}
    </div>
  );
}
