"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Gift, Ticket, ShieldCheck } from "lucide-react";
import { BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { FAMILIA_MERCHANTS, FAMILIA_CATEGORIES, VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS, getVoucherSessions } from "@beautifio/utils";
import { VoucherClaimModal } from "@/features/familia/components/VoucherClaimModal";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import type { FamiliaMerchant } from "@beautifio/types";

export default function VouchersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const [category, setCategory] = useState("all");
  const [selectedMerchant, setSelectedMerchant] = useState<FamiliaMerchant | null>(null);
  const [showClaim, setShowClaim] = useState(false);

  const filtered = category === "all"
    ? FAMILIA_MERCHANTS
    : FAMILIA_MERCHANTS.filter((m) => m.category === category);

  const sessions = getVoucherSessions();
  const activeSessions = sessions.filter((s) => s.status === "active");

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "jv-deals", type: "familia-deal" as const, title: "Affiliate Deals", subtitle: "Penawaran spesial dari partner", href: "/familia/deals" },
      { id: "jv-rewards", type: "familia-reward" as const, title: "Achievement Rewards", subtitle: "Dapatkan reward dari aktivitasmu", href: "/familia/rewards" },
      { id: "jv-roadmap", type: "roadmap" as const, title: "Roadmap Terkait", subtitle: "Kembangkan skillmu", href: "/roadmap" },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/familia")} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all active:scale-90 mb-4">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Voucher Center</h1>
            <p className="text-xs text-gray-500 mt-0.5">Klaim voucher dari merchant partner</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
            <Ticket className="w-4 h-4" />
            <span>{FAMILIA_MERCHANTS.length} Merchant</span>
          </div>
        </div>

        {activeSessions.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-green-800">Voucher Aktif</p>
              <p className="text-[10px] text-green-600">Kamu memiliki {activeSessions.length} voucher aktif</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-3 mt-4 scrollbar-none">
          {FAMILIA_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                category === cat.key
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
              }`}
            >
              <span className="mr-1">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 mt-2">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => { setSelectedMerchant(m); setShowClaim(true); }}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-amber-300 hover:shadow-sm transition-all text-left cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{m.category}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  {m.voucher_types.map((vt) => (
                    <span key={vt} className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                      {VOUCHER_TYPE_EMOJIS[vt]} {VOUCHER_TYPE_LABELS[vt]}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                  <span>Kuota: {m.total_vouchers - m.total_redeemed}/{m.total_vouchers}</span>
                  <span>Terpakai: {m.total_redeemed}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-semibold text-amber-600">Klaim</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <EcosystemLinks groups={ecosystemGroups} />

      <VoucherClaimModal merchant={selectedMerchant} open={showClaim} onClose={() => { setShowClaim(false); setSelectedMerchant(null); }} />

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
