"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Ticket, Users } from "lucide-react";

import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";

interface EventBenefit {
  id: string; slug: string; title: string; description: string;
  event_date: string; location: string; registration_url?: string;
  category: string; partner_name?: string; is_active: boolean;
  is_free?: boolean; image_url?: string;
  price?: number; quota?: number; total_registrations?: number;
  discount_type?: string; discount_value?: string; code?: string;
}

function Countdown({ date }: { date: string }) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) { setLeft(""); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      if (d > 0) setLeft(`${d} hari ${h} jam`);
      else { const m = Math.floor((diff % 3600000) / 60000); setLeft(`${h} jam ${m} mnt`); }
    };
    tick(); const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [date]);
  return left ? <span className="text-xs font-mono font-bold" style={{ color: "#084463" }}>⏱ {left}</span> : null;
}

function getEventLabel(e: EventBenefit): string {
  if (e.discount_type) return `🏷 Diskon ${String(e.discount_value || "").replace("%", "")}${e.discount_type === "percentage" ? "%" : ""}`;
  if (e.is_free !== false) return "🆓 Gratis";
  return `💰 Rp ${(e.price || 0).toLocaleString("id-ID")}`;
}

export default function EventPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementCount, setAchievementCount] = useState(0);
  const [filterCat, setFilterCat] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [myEventsCount, setMyEventsCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/familia/events");
        if (res.ok) { const { data } = await res.json(); setEvents(data || []); }
        const achRes = await fetch("/api/familia/achievements/progress");
        if (achRes.ok) { const { data } = await achRes.json(); setAchievementCount((data || []).filter((a: any) => a.is_completed).length); }
        // Load my registration count
        try {
          const myRes = await fetch("/api/events/my-registrations");
          if (myRes.ok) { const { data } = await myRes.json(); setMyEventsCount(data?.length || 0); }
        } catch {}
      } catch {
      } finally { setLoading(false); }
    })();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(events.map(e => e.category));
    return [{ key: "all", label: "Semua", emoji: "✨" }, ...Array.from(cats).map(c => ({ key: c, label: c, emoji: "" }))];
  }, [events]);

  const filtered = filterCat === "all" ? events : events.filter(e => e.category === filterCat);

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "je-voucher", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/voucher" },
      { id: "je-belanja", type: "familia-deal" as const, title: "Belanja", subtitle: "Penawaran spesial dari partner", href: "/belanja" },
      { id: "je-roadmap", type: "roadmap" as const, title: "Kembangkan Skill", subtitle: "Ikuti roadmap untuk capai goals", href: "/roadmap" },
    ]},
  ];

  const formatDateShort = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-xl border space-y-3" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl animate-pulse" style={{ background: "#E2E8F0" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 rounded animate-pulse" style={{ background: "#E2E8F0" }} />
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
        <button onClick={() => router.push("/")} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-90 mb-4"
          style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <ArrowLeft size={16} style={{ color: "#647488" }} />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>Event</h1>
            <p className="text-xs mt-0.5" style={{ color: "#647488" }}>Workshop, seminar & career expo</p>
          </div>
          <button onClick={() => router.push("/event/me")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{ background: "#6BB9D4", color: "#FFFFFF" }}>
            <Ticket size={14} /> Eventku{myEventsCount > 0 ? ` (${myEventsCount})` : ""}
          </button>
        </div>

        {achievementCount > 0 && (
          <button onClick={() => router.push("/profil")}
            className="w-full mb-4 p-2.5 rounded-xl flex items-start gap-2 text-left cursor-pointer transition-all"
            style={{ background: "rgba(255,198,79,0.08)", border: "1px solid rgba(255,198,79,0.25)" }}>
            <span style={{ color: "#FFC64F", flexShrink: 0, marginTop: 1 }}>🏆</span>
            <div><p className="text-xs font-semibold" style={{ color: "#1E2938" }}>{achievementCount} pencapaian terbuka</p><p className="text-[10px]" style={{ color: "#647488" }}>Lihat di Profil →</p></div>
          </button>
        )}

        {/* Filter chips */}
        <div className="relative mt-5">
          <style>{`.evt-scroll::-webkit-scrollbar{display:none}.evt-scroll{-ms-overflow-style:none;scrollbar-width:none}`}</style>
          <div className="evt-scroll flex gap-2 overflow-x-auto pb-3">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setFilterCat(cat.key)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer"
              style={{
                background: filterCat === cat.key ? "#084463" : "#FFFFFF",
                color: filterCat === cat.key ? "#FFFFFF" : "#647488",
                borderColor: filterCat === cat.key ? "#084463" : "#E2E8F0",
              }}>
              {cat.emoji && <span className="mr-1">{cat.emoji}</span>}{cat.label}
            </button>
          ))}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, #F8FAFC)" }} />
        </div>

        <div className="space-y-3 mt-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={40} style={{ color: "#E2E8F0", margin: "0 auto 12px" }} />
              <p className="text-sm font-medium" style={{ color: "#647488" }}>Belum ada event</p>
            </div>
          ) : (
            filtered.map((event) => {
              const isUpcoming = new Date(event.event_date) > new Date();
              const isExpanded = expandedId === event.id;
              return (
                <div key={event.id}>
                  <Link href={`/event/${event.slug}`}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all cursor-pointer hover:shadow-sm"
                    style={{
                      background: "#FFFFFF", border: "1px solid #E2E8F0",
                      borderBottomLeftRadius: isExpanded ? 0 : "12px", borderBottomRightRadius: isExpanded ? 0 : "12px",
                      opacity: isUpcoming ? 1 : 0.65,
                    }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: event.image_url ? "transparent" : "rgba(8,68,99,0.08)" }}>
                      {event.image_url ? (
                        <img src={event.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Calendar size={20} style={{ color: "#084463" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1E2938" }}>{event.title}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full border flex-shrink-0"
                          style={{ background: "rgba(8,68,99,0.06)", color: "#084463", borderColor: "rgba(8,68,99,0.15)" }}>
                          {event.category}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 font-medium" style={{ color: isUpcoming ? "#22C55E" : "#647488" }}>{getEventLabel(event)}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: "#647488" }}>
                        <span><Calendar size={10} className="inline mr-0.5" />{formatDateShort(event.event_date)}</span>
                        {event.location && <span><MapPin size={10} className="inline mr-0.5" />{event.location}</span>}
                        {isUpcoming && <Countdown date={event.event_date} />}
                      </div>
                    </div>
                    <span className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: "#084463", color: "#FFFFFF" }}>Lihat</span>
                  </Link>

                  <button onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] transition-all cursor-pointer rounded-b-xl"
                    style={{ background: "#F8FAFC", color: "#647488", border: "1px solid #E2E8F0", borderTop: "none", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px" }}>
                    {isExpanded ? "▲ Sembunyikan" : "▼ Selengkapnya"}
                  </button>

                  {isExpanded && (
                    <div className="p-4 text-xs space-y-2 rounded-b-xl" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderTop: "none", color: "#647488" }}>
                      {event.description && <p className="text-xs leading-relaxed">{event.description}</p>}
                      {event.partner_name && <p>🤝 {event.partner_name}</p>}
                      {event.quota && <p><Users size={10} className="inline mr-1" />Kuota: {event.quota} peserta</p>}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <EcosystemLinks groups={ecosystemGroups} />
        <div className="h-4" />
      </div>
    </div>
  );
}
