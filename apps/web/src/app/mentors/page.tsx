"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, GraduationCap, Home, BookOpen, MapPin, Compass, User, ArrowRight } from "lucide-react";
import { Badge, Avatar, BottomNavigation } from "@beautifio/ui";
import { MOCK_MENTORS } from "@beautifio/utils";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "discover", label: "Temukan", icon: Compass },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

export default function MentorListPage() {
  const [activeTab, setActiveTab] = useState("profil");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(
    () => {
      if (!search) return MOCK_MENTORS;
      const q = search.toLowerCase();
      return MOCK_MENTORS.filter(
        (m) => m.name.toLowerCase().includes(q) || m.expertise.toLowerCase().includes(q)
      );
    },
    [search]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Mentor</h1>
            <p className="text-sm text-text-secondary mt-1">Dapatkan bimbingan dari ahlinya</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari mentor..."
            className="w-full h-10 pl-9 pr-4 rounded-sm border border-border bg-surface text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((mentor) => (
            <Link key={mentor.id} href={`/mentors/${mentor.slug}`}>
              <div className="p-4 rounded-sm border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <Avatar initials={mentor.initials} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text-primary">{mentor.name}</h3>
                      {mentor.isAvailable && (
                        <div className="w-2 h-2 rounded-full bg-success" title="Tersedia" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{mentor.expertise}</p>
                    {mentor.company && (
                      <p className="text-[11px] text-text-secondary mt-0.5">{mentor.position} di {mentor.company}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="accent" className="text-[10px] px-1.5 py-0 leading-none">
                        ⭐ {mentor.rating}
                      </Badge>
                      <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
                        {mentor.menteeCount} mentee
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">
                        {mentor.sessionCount} sesi
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap size={36} className="mx-auto text-text-secondary/30 mb-3" />
            <p className="text-sm text-text-secondary">Tidak ada mentor ditemukan</p>
          </div>
        )}
      </div>

      <BottomNavigation
        items={tabs}
        activeTab={activeTab}
        onTabChange={(id) => { setActiveTab(id); if (id === "home") router.push("/"); else router.push(`/${id}`); }}
      />
    </div>
  );
}
