"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Gift, Ticket, ShoppingBag, Calendar, Trophy, ChevronRight,
  Star, Zap, Users, Sparkles, ExternalLink, Clock, ShieldCheck,
  Heart, Home, BookHeart, MapPin, BookOpen, User,
} from "lucide-react";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@beautifio/ui";

import {
  FAMILIA_MERCHANTS, FAMILIA_AFFILIATE_DEALS, FAMILIA_ACHIEVEMENT_REWARDS,
  FAMILIA_EVENT_BENEFITS, FAMILIA_CATEGORIES, VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS,
} from "@beautifio/utils";
import { VoucherClaimModal } from "@/features/familia/components/VoucherClaimModal";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import type { FamiliaMerchant } from "@beautifio/types";

export default function FamiliaPage() {
  const router = useRouter();

  const [selectedMerchant, setSelectedMerchant] = useState<FamiliaMerchant | null>(null);
  const [showClaim, setShowClaim] = useState(false);
  const [dealCategory, setDealCategory] = useState("all");

  const featuredDeals = FAMILIA_AFFILIATE_DEALS.filter((d) => d.is_featured);
  const filteredDeals = dealCategory === "all"
    ? FAMILIA_AFFILIATE_DEALS.slice(0, 4)
    : FAMILIA_AFFILIATE_DEALS.filter((d) => d.category === dealCategory).slice(0, 4);
  const events = FAMILIA_EVENT_BENEFITS;
  const achievements = FAMILIA_ACHIEVEMENT_REWARDS;

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Goals Terkait", items: [{ id: "fg-goals", type: "goal" as const, title: "Lihat Goals Aktifmu", subtitle: "Selesaikan goals untuk buka reward", href: "/profil" }] },
    { title: "Roadmap Terkait", items: [{ id: "fg-roadmap", type: "roadmap" as const, title: "Lihat Roadmap", subtitle: "Progress roadmap membuka achievement", href: "/roadmap" }] },
    { title: "Cerita Inspiratif", items: [{ id: "fg-story", type: "story" as const, title: "Jelajahi Cerita", subtitle: "Inspirasi dari anggota Familia", href: "/cerita" }] },
  ];

  const dealCategories = useMemo(() => {
    const cats = new Set(FAMILIA_AFFILIATE_DEALS.map((d) => d.category));
    return [{ key: "all", label: "Semua" }, ...Array.from(cats).map((c) => ({ key: c, label: c }))];
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      <div className="max-w-content mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 pt-12 pb-8 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold">Beautifio Familia</h1>
              <p className="text-sm text-white/80 mt-1">Keuntungan menjadi bagian dari keluarga Beautifio</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-6">
            {[
              { icon: Ticket, label: "Voucher", value: `${FAMILIA_MERCHANTS.length} Merchant`, href: "/familia/vouchers" },
              { icon: ShoppingBag, label: "Deals", value: `${FAMILIA_AFFILIATE_DEALS.length} Penawaran`, href: "/familia/deals" },
              { icon: Trophy, label: "Rewards", value: `${achievements.length} Pencapaian`, href: "/familia/rewards" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/15 backdrop-blur-sm hover:bg-white/25 transition-all cursor-pointer active:scale-95"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium text-white/90">{item.label}</span>
                <span className="text-[9px] text-white/70">{item.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 space-y-6 mt-6">
          {/* Featured Benefits */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Featured Benefits
              </h2>
              <button onClick={() => router.push("/familia/vouchers")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
                Lihat Semua
              </button>
            </div>
            <div className="space-y-3">
              {FAMILIA_MERCHANTS.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMerchant(m); setShowClaim(true); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-white border border-amber-100 hover:border-amber-300 hover:shadow-sm transition-all text-left cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {m.voucher_types.slice(0, 3).map((vt) => (
                        <span key={vt} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {VOUCHER_TYPE_EMOJIS[vt]} {VOUCHER_TYPE_LABELS[vt]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                </button>
              ))}
            </div>
          </section>

          {/* Affiliate Deals */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-500" />
                Affiliate Deals
              </h2>
              <button onClick={() => router.push("/familia/deals")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
                Lihat Semua
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
              {dealCategories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setDealCategory(cat.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    dealCategory === cat.key
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filteredDeals.map((deal) => (
                <a
                  key={deal.id}
                  href={deal.partner_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-amber-200 transition-all group"
                >
                  {deal.image_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="accent" className="text-[9px] px-1 py-0">{deal.platform}</Badge>
                      {deal.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{deal.title}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{deal.partner_name}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-amber-600">
                      <span>Lihat Penawaran</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* Event Benefits */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Event Benefits
              </h2>
            </div>
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{ev.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="accent" className="text-[10px]">{ev.discount_value}</Badge>
                      {ev.code && <span className="text-[10px] font-mono text-purple-600 font-bold">Kode: {ev.code}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Achievement Rewards */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-500" />
                Achievement Rewards
              </h2>
              <button onClick={() => router.push("/familia/rewards")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
                Lihat Semua
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.map((ar) => (
                <div key={ar.id} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${ar.color || "from-emerald-500 to-teal-500"} flex items-center justify-center`}>
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{ar.title}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">{ar.description}</p>
                  <p className="text-[10px] font-medium text-emerald-600 mt-1.5">{ar.reward_description}</p>
                </div>
              ))}
            </div>
          </section>

          <EcosystemLinks groups={ecosystemGroups} />
        </div>
      </div>

      <VoucherClaimModal merchant={selectedMerchant} open={showClaim} onClose={() => { setShowClaim(false); setSelectedMerchant(null); }} />

    </div>
  );
}
