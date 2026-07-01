"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Crown, Loader2, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Plan {
  id: string; name: string; duration_type: string; tier: string;
  price_idr: number; original_price_idr: number | null;
  features: string[]; display_order: number;
}

const P = "#084463"; const SF = "#FFC64F"; const IC = "#6BB9D4";
const GR = "#22C55E"; const DS = "#1E2938"; const SL = "#647488";
const BD = "#E2E8F0"; const CL = "#F8FAFC"; const WH = "#FFFFFF";

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [tier, setTier] = useState<"pro" | "ultimate">("pro");
  const [duration, setDuration] = useState<"monthly" | "yearly">("monthly");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState<any>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  useEffect(() => {
    fetch("/api/subscription/plans")
      .then(r => r.json()).then(d => setPlans(d.plans || [])).finally(() => setLoading(false));
  }, []);

  const plan = plans.find(p => p.tier === tier && p.duration_type === duration);
  const fp = (v: number) => `Rp ${v.toLocaleString("id-ID")}`;
  const saving = plan?.original_price_idr ? Math.round((1 - plan.price_idr / plan.original_price_idr) * 100) : 0;

  const finalPrice = voucherData?.final_price ?? plan?.price_idr ?? 0;
  const voucherDiscount = voucherData?.discount_amount ?? 0;

  const applyVoucher = async () => {
    if (!voucherCode.trim() || !plan) return;
    setVoucherLoading(true);
    const res = await fetch("/api/subscription/voucher", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: voucherCode.trim(), tier, base_price: plan.price_idr }),
    });
    const json = await res.json();
    if (!res.ok) { setVoucherData({ error: json.error }); setVoucherLoading(false); return; }
    setVoucherData(json);
    setVoucherLoading(false);
  };

  const handlePay = async () => {
    if (!plan || !user) return;
    setPayLoading(true);
    const res = await fetch("/api/payment/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: plan.id, voucher_code: voucherData?.code || undefined }),
    });
    const json = await res.json();
    if (!res.ok) { alert(json.error || "Gagal"); setPayLoading(false); return; }
    if (json.payment_url) window.location.href = json.payment_url;
    else router.push("/bisik");
  };

  const features = tier === "ultimate"
    ? ["Unlimited chat","Unlimited main Tebak","Unlimited journey","Unlimited circle","Diskon event 20%","Badge Ultimate eksklusif","Semua benefit Pro"]
    : ["30 chat per minggu (+ top-up)","15x main Tebak/hari","Nama anonim custom","Chat gak expired 24 jam","Circle unlimited","Diskon event 10%","Badge Pro eksklusif"];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: CL }}>
      <div className="w-8 h-8 animate-spin rounded-full border-2 border-neutral-300" style={{ borderTopColor: P }} /></div>;
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: CL }}>
      {/* Header */}
      <div className="pt-8 pb-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${IC} 0%, ${P} 100%)` }}>
        <button onClick={() => router.back()} className="absolute left-4 top-8 text-sm cursor-pointer" style={{ color: "rgba(255,255,255,0.7)" }}><ArrowLeft size={16} /></button>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(255,255,255,0.15)" }}>
          <Crown size={22} style={{ color: SF }} />
        </div>
        <h1 className="text-lg font-bold" style={{ color: WH, fontFamily: "Poppins, sans-serif" }}>Upgrade Akunmu</h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>Lebih banyak ngobrol. Lebih bebas berekspresi.</p>
      </div>

      {/* Tier switch */}
      <div className="px-4 max-w-sm mx-auto -mt-8 relative z-10 mb-3">
        <div className="flex rounded-2xl p-1" style={{ background: WH, boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          {(["pro","ultimate"] as const).map(t => (
            <button key={t} onClick={() => setTier(t)}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              style={{ background: tier === t ? P : "transparent", color: tier === t ? WH : SL }}>
              {t === "ultimate" ? <Star size={12} /> : <Crown size={12} />}
              {t === "ultimate" ? "Ultimate" : "Pro"}
            </button>
          ))}
        </div>
      </div>

      {/* Duration pills */}
      <div className="flex justify-center gap-2 mb-4">
        {(["monthly","yearly"] as const).map(d => (
          <button key={d} onClick={() => setDuration(d)}
            className="px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border"
            style={{
              background: duration === d ? P : WH,
              color: duration === d ? WH : SL,
              borderColor: duration === d ? "transparent" : IC,
            }}>
            {d === "monthly" ? "Bulanan" : "Tahunan"}
          </button>
        ))}
      </div>

      {/* Hero Price */}
      {plan && (
        <div className="px-4 max-w-sm mx-auto text-center mb-4">
          <div className="py-6 px-4 rounded-2xl" style={{ background: WH, border: `1px solid ${IC}`, boxShadow: `0 1px 8px rgba(8,68,99,0.06)` }}>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: P }}>
              {tier === "ultimate" ? "💎 Ultimate" : "👑 Pro"} {duration === "monthly" ? "Bulanan" : "Tahunan"}
            </p>
            {plan.original_price_idr && (
              <p className="text-sm line-through mb-1" style={{ color: SL }}>{fp(plan.original_price_idr)}</p>
            )}
            <p className="text-4xl font-extrabold" style={{ color: DS, fontFamily: "Poppins, sans-serif" }}>{fp(plan.price_idr)}</p>
            <p className="text-xs mt-0.5" style={{ color: SL }}>/ {duration === "yearly" ? "tahun" : "bulan"}</p>
            {saving > 0 && (
              <p className="text-xs mt-2 font-semibold" style={{ color: GR }}>
                Hemat {saving}% · +PPN 11%
              </p>
            )}
            {duration === "yearly" && (
              <p className="text-[10px] mt-0.5" style={{ color: SL }}>
                Setara {fp(Math.round(plan.price_idr / 12))}/bln
              </p>
            )}

            {/* Voucher */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: BD }}>
              <div className="flex gap-1.5">
                <input value={voucherCode} onChange={e => { setVoucherCode(e.target.value); setVoucherData(null); }}
                  placeholder="Kode voucher" className="flex-1 px-3 py-2 rounded-lg text-xs border outline-none text-center uppercase tracking-wider"
                  style={{ borderColor: voucherData?.error ? "#EF4444" : BD, color: DS }} />
                <button onClick={applyVoucher} disabled={voucherLoading || !voucherCode.trim()}
                  className="px-3 py-2 rounded-lg text-[11px] font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: `rgba(107,185,212,0.1)`, color: P }}>
                  {voucherLoading ? "..." : "Pakai"}
                </button>
              </div>
              {voucherData?.error && (
                <p className="text-[10px] mt-1 text-center" style={{ color: "#EF4444" }}>{voucherData.error}</p>
              )}
              {voucherData?.discount_amount > 0 && (
                <div className="mt-2 text-center">
                  <p className="text-[10px]" style={{ color: GR }}>
                    Diskon voucher: -{fp(voucherData.discount_amount)}
                  </p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: DS }}>
                    {fp(voucherData.final_price)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feature list */}
      <div className="px-4 max-w-sm mx-auto mb-4">
        <div className="space-y-1.5 flex flex-col items-center">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs py-1.5" style={{ color: DS }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `rgba(8,68,99,0.06)` }}>
                <Check size={10} style={{ color: P }} />
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 left-0 right-0 px-4 py-3" style={{ background: `linear-gradient(0deg, ${CL} 60%, transparent)` }}>
        <div className="max-w-sm mx-auto">
          <button onClick={handlePay} disabled={payLoading || !plan}
            className="w-full py-3 rounded-2xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ background: SF, color: DS }}>
            {payLoading ? <Loader2 size={16} className="animate-spin" /> : (tier === "ultimate" ? <Star size={16} /> : <Crown size={16} />)}
            {payLoading ? "Memproses..." : `Bayar ${fp(finalPrice)}`}
          </button>
          <p className="text-[10px] text-center mt-2" style={{ color: SL }}>Aktif segera setelah pembayaran</p>
        </div>
      </div>
    </div>
  );
}
