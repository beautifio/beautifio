"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, ExternalLink, Clock, Trophy } from "lucide-react";

import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";

interface EventBenefit {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  registration_url?: string;
  category: string;
  partner_name?: string;
  is_active: boolean;
}

export default function EventPage() {
  const router = useRouter();

  const [events, setEvents] = useState<EventBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievementCount, setAchievementCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/familia/events");
        if (res.ok) {
          const { data } = await res.json();
          setEvents(data || []);
        }

        const achRes = await fetch("/api/familia/achievements/progress");
        if (achRes.ok) {
          const { data } = await achRes.json();
          setAchievementCount((data || []).filter((a: any) => a.is_completed).length);
        }
      } catch (e) {
        console.error("Failed to load events", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "je-voucher", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/voucher" },
      { id: "je-belanja", type: "familia-deal" as const, title: "Belanja", subtitle: "Penawaran spesial dari partner", href: "/belanja" },
      { id: "je-roadmap", type: "roadmap" as const, title: "Kembangkan Skill", subtitle: "Ikuti roadmap untuk capai goals", href: "/roadmap" },
    ]},
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  const isUpcoming = (dateStr: string) => new Date(dateStr) > new Date();

  const upcoming = events.filter((e) => isUpcoming(e.event_date));
  const past = events.filter((e) => !isUpcoming(e.event_date));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
        <div className="max-w-content mx-auto px-6 pt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          ))}
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
            <h1 className="text-xl font-bold text-gray-900">Event</h1>
            <p className="text-xs text-gray-500 mt-0.5">Workshop, seminar & career expo</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
            <Calendar className="w-4 h-4" />
            <span>{events.length} Event</span>
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

        {upcoming.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3">Akan Datang</h2>
            <div className="space-y-3">
              {upcoming.map((event) => (
                <div key={event.id} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-purple-200 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                      {event.partner_name && (
                        <p className="text-[10px] text-gray-500 mt-0.5">by {event.partner_name}</p>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                      {event.category}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(event.event_date)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  {event.registration_url && (
                    <a
                      href={event.registration_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      Daftar Sekarang
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Event Sebelumnya</h2>
            <div className="space-y-2">
              {past.map((event) => (
                <div key={event.id} className="p-3 rounded-xl bg-white border border-gray-100 opacity-75">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900">{event.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(event.event_date)}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Selesai</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Belum ada event tersedia</p>
            <p className="text-xs text-gray-400 mt-1">Nantikan event menarik lainnya</p>
          </div>
        )}
        <EcosystemLinks groups={ecosystemGroups} />
        <div className="h-4" />
      </div>
    </div>
  );
}
