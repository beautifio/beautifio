"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, ExternalLink, Star, TrendingUp, Trophy } from "lucide-react";
import { Badge } from "@beautifio/ui";

import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import type { FamiliaAffiliateDeal } from "@beautifio/types";

const PLATFORM_COLORS: Record<string, string> = {
  tokopedia: "bg-green-100 text-green-700 border-green-200",
  shopee: "bg-orange-100 text-orange-700 border-orange-200",
  tiktok: "bg-black text-white border-black",
  website: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function BelanjaPage() {
  const router = useRouter();

  const [deals, setDeals] = useState<FamiliaAffiliateDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [achievementCount, setAchievementCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/familia/deals");
        if (res.ok) {
          const { data } = await res.json();
          setDeals(data || []);
        }

        const achRes = await fetch("/api/familia/achievements/progress");
        if (achRes.ok) {
          const { data } = await achRes.json();
          setAchievementCount((data || []).filter((a: any) => a.is_completed).length);
        }
      } catch (e) {
        console.error("Failed to load deals", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(deals.map((d) => d.category));
    return [{ key: "all", label: "Semua", emoji: "✨" }, ...Array.from(cats).map((c) => ({ key: c, label: c, emoji: "" }))];
  }, [deals]);

  const filtered = category === "all"
    ? deals
    : deals.filter((d) => d.category === category);

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "jd-vouchers", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/voucher" },
      { id: "jd-rewards", type: "familia-reward" as const, title: "Event", subtitle: "Workshop & career expo diskon", href: "/event" },
      { id: "jd-roadmap", type: "roadmap" as const, title: "Kembangkan Skill", subtitle: "Ikuti roadmap untuk capai goals", href: "/roadmap" },
    ]},
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/")} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all active:scale-90 mb-4">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Belanja</h1>
            <p className="text-xs text-gray-500 mt-0.5">Penawaran spesial dari partner</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            <span>{deals.length} Deals</span>
          </div>
        </div>

        {achievementCount > 0 && (
          <a href="/profil" className="mb-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-start gap-2">
            <Trophy className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">🏆 {achievementCount} pencapaian sudah terbuka</p>
              <p className="text-[10px] text-amber-600">Lihat di Profilmu →</p>
            </div>
          </a>
        )}

        <div className="flex gap-2 overflow-x-auto pb-3 mt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                category === cat.key
                  ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}
            >
              {cat.emoji && <span className="mr-1">{cat.emoji}</span>}
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-2">
          {filtered.map((deal) => (
            <a
              key={deal.id}
              href={`/api/familia/deals/${deal.id}/click`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
            >
              {deal.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${PLATFORM_COLORS[deal.platform] || "bg-gray-100 text-gray-600"}`}>
                    {deal.platform}
                  </span>
                  {deal.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                </div>
                <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{deal.title}</p>
                <p className="text-[10px] text-gray-500 mt-1">{deal.partner_name}</p>
                {deal.description && (
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{deal.description}</p>
                )}
                <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-blue-600">
                  <ShoppingBag className="w-3 h-3" />
                  <span>Lihat Penawaran</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          ))}
        </div>

        <EcosystemLinks groups={ecosystemGroups} />
        <div className="h-4" />
      </div>
    </div>
  );
}
