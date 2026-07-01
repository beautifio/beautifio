"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Flame } from "lucide-react";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import type { FamiliaAffiliateDeal, PartnerInfo } from "@beautifio/types";

const PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  tokopedia: { bg: "rgba(34,197,94,0.1)", text: "#166534" },
  shopee: { bg: "rgba(249,115,22,0.1)", text: "#9A3412" },
  tiktok: { bg: "rgba(0,0,0,0.1)", text: "#1E2938" },
  website: { bg: "rgba(8,68,99,0.1)", text: "#084463" },
};

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [deal, setDeal] = useState<FamiliaAffiliateDeal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/familia/deals?slug=${slug}`)
      .then(r => r.json())
      .then(d => setDeal(d.data || null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePartnerClick = (partner: PartnerInfo) => {
    // Track partner click via the click API
    if (deal) {
      fetch(`/api/familia/deals/${deal.id}/click`, { method: "POST" }).catch(() => {});
    }
    window.open(partner.url, "_blank");
  };

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "dd-vouchers", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/voucher" },
      { id: "dd-back", type: "roadmap" as const, title: "Belanja", subtitle: "Lihat semua deal & rekomendasi", href: "/belanja" },
    ]},
  ];

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          <div className="h-8 w-20 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
          <div className="aspect-[16/9] rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
          {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />)}
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "#1E2938" }}>Deal tidak ditemukan</p>
          <button onClick={() => router.push("/belanja")} className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer" style={{ background: "#084463" }}>← Kembali ke Belanja</button>
        </div>
      </div>
    );
  }

  const partners = deal.partners?.length
    ? deal.partners
    : [{ name: deal.partner_name, url: deal.partner_url, description: deal.description, image_url: deal.image_url }];

  const coverImg = partners[0]?.image_url;

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/belanja")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft size={16} style={{ color: "#647488" }} />
        </button>

        {/* Cover Image */}
        {coverImg && (
          <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4">
            <img src={coverImg} alt={deal.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Title + meta */}
        <h1 className="text-lg font-bold mb-1" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>{deal.title}</h1>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#F8FAFC", color: "#647488", border: "1px solid #E2E8F0" }}>{deal.category}</span>
          {deal.is_featured && <Flame size={14} style={{ color: "#EF4444" }} />}
          <span className="text-[10px]" style={{ color: "#647488" }}>👁 {deal.click_count || 0}x dilihat</span>
        </div>

        {/* Article description */}
        {deal.description && (
          <p className="text-sm mb-5" style={{ color: "#647488", lineHeight: 1.7 }}>{deal.description}</p>
        )}

        {/* Partner list */}
        <div className="space-y-3 mb-8">
          <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>Beli di Marketplace:</p>
          {partners.map((p, i) => (
            <button key={i} onClick={() => handlePartnerClick(p)}
              className="w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer hover:shadow-sm hover:border-[#FFC64F]"
              style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                style={{ background: "#084463", color: "#FFFFFF" }}>{i + 1}</div>
              {p.image_url && (
                <img src={p.image_url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{p.name}</p>
                {p.description && <p className="text-xs mt-1" style={{ color: "#647488", lineHeight: 1.7 }}>{p.description}</p>}
                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium" style={{ color: "#6BB9D4" }}>
                  <ExternalLink size={10} /> Beli Sekarang
                </span>
              </div>
            </button>
          ))}
        </div>

        <EcosystemLinks groups={ecosystemGroups} />
      </div>
    </div>
  );
}
