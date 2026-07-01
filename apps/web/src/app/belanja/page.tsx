"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Trophy, Flame, Clock, ChevronLeft, ChevronRight } from "lucide-react";

import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import type { FamiliaAffiliateDeal } from "@beautifio/types";

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  tokopedia: { bg: "rgba(34,197,94,0.1)", text: "#166534" },
  shopee: { bg: "rgba(249,115,22,0.1)", text: "#9A3412" },
  tiktok: { bg: "rgba(0,0,0,0.1)", text: "#1E2938" },
  website: { bg: "rgba(8,68,99,0.1)", text: "#084463" },
};

function CountdownTimer({ expires }: { expires: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expires).getTime() - Date.now();
      if (diff <= 0) { setLeft("Berakhir"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${h}j ${m}m ${s}d`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expires]);
  return <span className="text-xs font-mono font-bold" style={{ color: left === "Berakhir" ? "#EF4444" : "#084463" }}>{left}</span>;
}

export default function BelanjaPage() {
  const router = useRouter();

  const [deals, setDeals] = useState<FamiliaAffiliateDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [achievementCount, setAchievementCount] = useState(0);
  const [hotIndex, setHotIndex] = useState(0);

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
      } catch (e) { // console.error("Failed to load deals", e);
      } finally { setLoading(false); }
    })();
  }, []);

  const featured = deals.filter((d) => d.hot_deal_order != null).sort((a, b) => (a.hot_deal_order ?? 99) - (b.hot_deal_order ?? 99));
  const categories = useMemo(() => {
    const cats = new Set(deals.map((d) => d.category));
    return [{ key: "all", label: "Semua", emoji: "✨" }, ...Array.from(cats).map((c) => ({ key: c, label: c, emoji: "" }))];
  }, [deals]);
  const filtered = category === "all" ? deals : deals.filter((d) => d.category === category);

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "jd-vouchers", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/voucher" },
      { id: "jd-rewards", type: "familia-reward" as const, title: "Event", subtitle: "Workshop & career expo diskon", href: "/event" },
      { id: "jd-roadmap", type: "roadmap" as const, title: "Kembangkan Skill", subtitle: "Ikuti roadmap untuk capai goals", href: "/roadmap" },
    ]},
  ];

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
                <div className="aspect-[4/3] animate-pulse" style={{ background: "#E2E8F0" }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-20 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
                  <div className="h-4 w-full rounded animate-pulse" style={{ background: "#E2E8F0" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft size={16} style={{ color: "#647488" }} />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Belanja</h1>
            <p className="text-xs mt-0.5" style={{ color: "#647488" }}>Penawaran spesial dari partner</p>
          </div>
          <span className="text-xs font-medium" style={{ color: "#6BB9D4" }}>
            <TrendingUp size={14} className="inline mr-1" />{deals.length} Deals
          </span>
        </div>

        {achievementCount > 0 && (
          <button onClick={() => router.push("/profil")}
            className="w-full mb-4 p-2.5 rounded-xl flex items-start gap-2 text-left cursor-pointer transition-all"
            style={{ background: "rgba(255,198,79,0.08)", border: "1px solid rgba(255,198,79,0.25)" }}>
            <Trophy size={16} style={{ color: "#FFC64F", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>🏆 {achievementCount} pencapaian terbuka</p>
              <p className="text-[10px]" style={{ color: "#647488" }}>Lihat di Profil →</p>
            </div>
          </button>
        )}

        {/* Hot Deals Carousel */}
        {featured.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Flame size={14} style={{ color: "#EF4444" }} />
              <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>Hot Deals</span>
              {featured.length > 1 && <span className="text-[10px] ml-auto" style={{ color: "#647488" }}>{hotIndex + 1} / {featured.length}</span>}
            </div>
            <div className="relative rounded-xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
              <Link href={`/belanja/${featured[hotIndex].slug}`} className="block w-full text-left cursor-pointer">
                {(featured[hotIndex].partners?.[0]?.image_url || featured[hotIndex].image_url) && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={featured[hotIndex].partners?.[0]?.image_url || featured[hotIndex].image_url} alt={featured[hotIndex].title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold line-clamp-1" style={{ color: "#1E2938" }}>{featured[hotIndex].title}</span>
                    <span className="text-[10px] ml-auto flex items-center gap-1" style={{ color: "#647488" }}>
                      <Clock size={10} />
                      {featured[hotIndex].hot_deal_expires
                        ? <CountdownTimer expires={featured[hotIndex].hot_deal_expires} />
                        : <span className="text-xs" style={{ color: "#22C55E" }}>Selalu Tersedia</span>}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#647488" }}>{(featured[hotIndex].partners || []).map(p => p.name).join(" · ")}</p>
                </div>
              </Link>

              {featured.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setHotIndex((p) => (p - 1 + featured.length) % featured.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <ChevronLeft size={16} style={{ color: "#1E2938" }} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setHotIndex((p) => (p + 1) % featured.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.9)", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
                    <ChevronRight size={16} style={{ color: "#1E2938" }} />
                  </button>
                </>
              )}
              {featured.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 pb-3">
                  {featured.map((_, i) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setHotIndex(i); }}
                      className="rounded-full transition-all cursor-pointer"
                      style={{ background: i === hotIndex ? "#084463" : "#E2E8F0", width: i === hotIndex ? 16 : 8, height: 8 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-1">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setCategory(cat.key)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer"
              style={{ background: category === cat.key ? "#084463" : "#FFFFFF", color: category === cat.key ? "#FFFFFF" : "#647488", borderColor: category === cat.key ? "#084463" : "#E2E8F0" }}>
              {cat.emoji && <span className="mr-1">{cat.emoji}</span>}{cat.label}
            </button>
          ))}
        </div>

        {/* Deal grid */}
        <div className="grid grid-cols-2 gap-3 mt-1">
          {filtered.map((deal) => {
            const firstPartner = deal.partners?.[0];
            const img = firstPartner?.image_url || deal.image_url;
            return (
              <Link key={deal.id} href={`/belanja/${deal.slug}`}
                className="block text-left rounded-xl border overflow-hidden transition-all hover:shadow-md cursor-pointer"
                style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
                {img ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={img} alt={deal.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] flex items-center justify-center" style={{ background: "#F8FAFC" }}>
                    <span className="text-2xl">📦</span>
                  </div>
                )}
                <div className="p-2.5">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {deal.is_featured && <Flame size={12} style={{ color: "#EF4444" }} />}
                    {(deal.partners || []).slice(0, 2).map((p, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: "#F8FAFC", color: "#647488", border: "1px solid #E2E8F0" }}>{p.name}</span>
                    ))}
                    {deal.hot_deal_order != null && <span className="text-[9px] text-red-400 ml-auto">🔥</span>}
                  </div>
                  <p className="text-xs font-semibold line-clamp-2 leading-snug" style={{ color: "#1E2938" }}>{deal.title}</p>
                  <p className="text-[10px] mt-1" style={{ color: "#647488" }}>{deal.category}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <EcosystemLinks groups={ecosystemGroups} />
        <div className="h-4" />
      </div>
    </div>
  );
}
