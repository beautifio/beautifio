"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, Ticket, ShieldCheck, Trophy, MapPin, UserRound, CalendarDays, Tag } from "lucide-react";

import { FAMILIA_CATEGORIES, VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS, getVoucherDetailLabel } from "@beautifio/utils";
import { VoucherClaimModal } from "@/features/familia/components/VoucherClaimModal";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import type { FamiliaMerchant, FamiliaVoucherSession } from "@beautifio/types";

export default function VoucherPage() {
  const router = useRouter();

  const [merchants, setMerchants] = useState<FamiliaMerchant[]>([]);
  const [activeSessions, setActiveSessions] = useState<FamiliaVoucherSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState<FamiliaMerchant | null>(null);
  const [showClaim, setShowClaim] = useState(false);
  const [achievementCount, setAchievementCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refreshMerchants = async () => {
    try {
      const res = await fetch("/api/familia/merchants");
      if (res.ok) {
        const { data } = await res.json();
        setMerchants(data || []);
      }
    } catch {}
  };

  useEffect(() => {
    (async () => {
      try {
        const [merchRes, sessionRes] = await Promise.all([
          fetch("/api/familia/merchants"),
          fetch("/api/familia/vouchers/active"),
        ]);
        if (merchRes.ok) {
          const { data } = await merchRes.json();
          setMerchants(data || []);
          // Track views: all merchants seen on first load
          (data || []).forEach((m: any) => {
            fetch("/api/familia/vouchers/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ merchant_id: m.id, event: "view" }),
            }).catch(() => {});
          });
        }
        if (sessionRes.ok) {
          const { data } = await sessionRes.json();
          setActiveSessions(data || []);
        }

        const achRes = await fetch("/api/familia/achievements/progress");
        if (achRes.ok) {
          const { data } = await achRes.json();
          setAchievementCount((data || []).filter((a: any) => a.is_completed).length);
        }
      } catch (e) {
        // console.error("Failed to load vouchers data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = category === "all"
    ? merchants
    : merchants.filter((m) => m.category === category);

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "jv-me", type: "familia-voucher" as const, title: "Voucherku", subtitle: "Lihat voucher aktif & riwayat", href: "/voucher/me" },
      { id: "jv-belanja", type: "familia-deal" as const, title: "Belanja", subtitle: "Penawaran spesial dari partner", href: "/belanja" },
      { id: "jv-event", type: "familia-reward" as const, title: "Event", subtitle: "Workshop & career expo diskon", href: "/event" },
      { id: "jv-roadmap", type: "roadmap" as const, title: "Kembangkan Skill", subtitle: "Ikuti roadmap untuk capai goals", href: "/roadmap" },
    ]},
  ];

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
                  <div className="h-3 w-48 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        {/* Back + Header */}
        <button onClick={() => router.push("/")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft className="w-4 h-4" style={{ color: "#647488" }} />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Voucher</h1>
            <p className="text-xs mt-0.5" style={{ color: "#647488" }}>Klaim voucher dari merchant partner</p>
          </div>
          <button onClick={() => router.push("/voucher/me")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{ background: "#6BB9D4", color: "#FFFFFF" }}>
            <Ticket size={14} /> Voucherku
          </button>
        </div>

        {/* Status banners */}
        <div className="flex gap-3 mt-4">
          {activeSessions.length > 0 && (
            <button onClick={() => router.push("/voucher/me")}
              className="flex-1 p-3 rounded-xl flex items-start gap-2 text-left cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <ShieldCheck size={16} style={{ color: "#22C55E", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{activeSessions.length} Voucher Aktif</p>
                <p className="text-[10px]" style={{ color: "#647488" }}>Lihat & pakai →</p>
              </div>
            </button>
          )}
          {achievementCount > 0 && (
            <button onClick={() => router.push("/profil")}
              className="flex-1 p-3 rounded-xl flex items-start gap-2 text-left cursor-pointer transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,198,79,0.08)", border: "1px solid rgba(255,198,79,0.25)" }}>
              <Trophy size={16} style={{ color: "#FFC64F", flexShrink: 0, marginTop: 1 }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{achievementCount} Pencapaian</p>
                <p className="text-[10px]" style={{ color: "#647488" }}>Lihat di Profil →</p>
              </div>
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="relative mt-5">
          <style>{`.filter-scroll::-webkit-scrollbar{display:none}.filter-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
          <div className="filter-scroll flex gap-2 overflow-x-auto pb-3">
            {FAMILIA_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer"
              style={{
                background: category === cat.key ? "#084463" : "#FFFFFF",
                color: category === cat.key ? "#FFFFFF" : "#647488",
                borderColor: category === cat.key ? "#084463" : "#E2E8F0",
                boxShadow: category === cat.key ? "0 1px 3px rgba(8,68,99,0.2)" : "none",
              }}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, #F8FAFC)" }} />
        </div>

        {/* Merchant cards */}
        <div className="space-y-3 mt-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Ticket size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
              <p className="text-sm font-medium" style={{ color: "#647488" }}>Belum ada merchant di kategori ini</p>
              <p className="text-xs mt-1" style={{ color: "#647488" }}>Coba pilih kategori lain</p>
            </div>
          ) : (
            filtered.map((m) => {
              const remaining = (m.monthly_quota ?? 50) - (m.total_vouchers ?? 0);
              const isFull = remaining <= 0;
              const pctLeft = (m.monthly_quota ?? 50) > 0 ? remaining / (m.monthly_quota ?? 50) : 0;
              const stockLabel = isFull ? "Habis" : pctLeft <= 0.05 ? `🔥 Sisa ${remaining}!` : pctLeft <= 0.2 ? `⚠️ Sisa ${remaining}` : `Sisa ${remaining}`;
              const stockColor = isFull ? "#647488" : pctLeft <= 0.05 ? "#EF4444" : pctLeft <= 0.2 ? "#FFC64F" : "#647488";
              const isExpanded = expandedId === m.id;
              const totalMins = ((m.redeem_hours ?? 24) * 60 + (m.redeem_minutes ?? 0));
              const durText = totalMins >= 60
                ? `${Math.floor(totalMins / 60)}j` + (totalMins % 60 > 0 ? ` ${totalMins % 60}m` : "")
                : `${totalMins}m`;
              return (
                <div key={m.id}>
                  <button
                    onClick={() => { if (!isFull) { setSelectedMerchant(m); setShowClaim(true); fetch("/api/familia/vouchers/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merchant_id: m.id, event: "click" }) }).catch(() => {}); } }}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all cursor-pointer"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderBottomLeftRadius: isExpanded ? 0 : "12px",
                      borderBottomRightRadius: isExpanded ? 0 : "12px",
                      opacity: isFull ? 0.55 : 1,
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: m.logo_url ? "#F8FAFC" : "rgba(255,198,79,0.10)" }}>
                      {m.logo_url ? (
                        <img src={m.logo_url} alt={m.name} className="w-full h-full object-contain p-1" loading="lazy" />
                      ) : (
                        <Gift size={20} style={{ color: "#FFC64F" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1E2938" }}>{m.name}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0"
                          style={{ background: "rgba(255,198,79,0.08)", color: "#1E2938", borderColor: "rgba(255,198,79,0.25)" }}>
                          {m.category}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: "#084463" }}>{getVoucherDetailLabel(m)}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: "#647488" }}>
                        <span style={{ color: stockColor }}>{stockLabel}</span>
                        <span>Berakhir {durText}</span>
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: isFull ? "#E2E8F0" : "#084463", color: isFull ? "#647488" : "#FFFFFF" }}>
                      {isFull ? "Habis" : "Klaim"}
                    </span>
                  </button>

                  {/* Detail toggle */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : m.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] transition-all cursor-pointer rounded-b-xl"
                    style={{
                      background: "#F8FAFC",
                      color: "#647488",
                      border: "1px solid #E2E8F0",
                      borderTop: "none",
                      borderBottomLeftRadius: "12px",
                      borderBottomRightRadius: "12px",
                    }}>
                    {isExpanded ? "▲ Sembunyikan" : "▼ Selengkapnya"}
                  </button>

                  {isExpanded && (
                    <div className="p-4 text-xs space-y-2 rounded-b-xl" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderTop: "none", color: "#647488" }}>
                      {m.description && <p>{m.description}</p>}
                      {m.city && m.city !== "Semua Kota" && <p className="flex items-center gap-1.5"><MapPin size={14} />{m.city}</p>}
                      <p className="flex items-center gap-1.5"><UserRound size={14} />Maks {m.max_per_user ?? 1}x per user</p>
                      {(m.claim_start || m.claim_end) && (
                        <p className="flex items-center gap-1.5"><CalendarDays size={14} />Klaim: {m.claim_start ? new Date(m.claim_start).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "?"} — {m.claim_end ? new Date(m.claim_end).toLocaleDateString("id-ID", { day: "numeric", month: "short" }) : "?"}</p>
                      )}
                      {m.code_prefix && <p className="flex items-center gap-1.5"><Tag size={14} />Kode voucher: {m.code_prefix}</p>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <EcosystemLinks groups={ecosystemGroups} />
      </div>

      <VoucherClaimModal merchant={selectedMerchant} open={showClaim} onClose={() => { setShowClaim(false); setSelectedMerchant(null); refreshMerchants(); }} />
    </div>
  );
}
