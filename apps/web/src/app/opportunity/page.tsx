"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Home, BookOpen, Users, MapPin, Compass, User,
  GraduationCap, Briefcase, Trophy, Heart, DollarSign, Sparkles, Gamepad2, ArrowRight,
} from "lucide-react";
import { Badge, BottomNavigation } from "@beautifio/ui";
import { OPP_CATEGORIES, MOCK_OPPORTUNITIES } from "@beautifio/utils";
import type { OpportunityConstant } from "@beautifio/utils";

const catIcons: Record<string, typeof GraduationCap> = {
  beasiswa: GraduationCap, magang: Briefcase, pekerjaan: Briefcase,
  turnamen: Gamepad2, kompetisi: Trophy, relawan: Heart,
  pendanaan: DollarSign, "program-kreator": Sparkles,
};

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "discover", label: "Temukan", icon: Compass },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

export default function OpportunityListPage() {
  const [activeTab, setActiveTab] = useState("profil");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    let items: (OpportunityConstant & { deadlineDate: Date })[] = MOCK_OPPORTUNITIES.map((o) => ({
      ...o, deadlineDate: new Date(o.deadline.replace(/(\d+) (\w+) (\d+)/, (_, d, m, y) => {
        const months: Record<string, string> = { Jan: "0", Feb: "1", Mar: "2", Apr: "3", Mei: "4", Jun: "5", Jul: "6", Agu: "7", Sep: "8", Okt: "9", Nov: "10", Des: "11" };
        return `${y}-${months[m]}-${d}`;
      })),
    }));
    if (activeCat) items = items.filter((o) => o.category === activeCat);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((o) => o.title.toLowerCase().includes(q) || o.organization.toLowerCase().includes(q));
    }
    items.sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime());
    return items;
  }, [activeCat, search]);

  const featured = useMemo(() => filtered.filter((o) => o.isFeatured), [filtered]);
  const regular = useMemo(() => filtered.filter((o) => !o.isFeatured), [filtered]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Peluang</h1>
            <p className="text-sm text-text-secondary mt-1">Beasiswa, magang, pekerjaan, dan lainnya</p>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari peluang..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveCat(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeCat === null ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface text-text-secondary border border-border hover:border-primary/30 hover:text-text-primary hover:bg-muted/30"
            }`}
          >
            Semua
          </button>
          {OPP_CATEGORIES.map((cat) => {
            const Icon = catIcons[cat.value];
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCat(activeCat === cat.value ? null : cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeCat === cat.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-surface text-text-secondary border border-border hover:border-primary/30 hover:text-text-primary hover:bg-muted/30"
                }`}
              >
                {Icon && <Icon size={14} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {featured.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-3">Pilihan</h3>
              <div className="space-y-3">
                {featured.map((opp) => (
                  <OpportunityCard key={opp.id} opp={opp} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-bold text-text-primary mb-3">
              {featured.length > 0 ? "Lainnya" : "Semua Peluang"}
            </h3>
            <div className="space-y-3">
              {regular.map((opp) => (
                <OpportunityCard key={opp.id} opp={opp} />
              ))}
            </div>
          </section>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search size={36} className="mx-auto text-text-secondary/30 mb-3" />
            <p className="text-sm text-text-secondary">Tidak ada peluang ditemukan</p>
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

function OpportunityCard({ opp }: { opp: OpportunityConstant & { deadlineDate: Date } }) {
  const cat = OPP_CATEGORIES.find((c) => c.value === opp.category);
  const Icon = cat ? catIcons[cat.value] : Briefcase;
  const isUrgent = opp.deadlineDate.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;

  return (
    <Link href={`/opportunity/${opp.slug}`}>
      <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group">
        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
          {Icon && <Icon size={18} className="text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {cat && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">{cat.label}</Badge>}
            {isUrgent && <Badge variant="accent" className="text-[10px] px-1.5 py-0 leading-none">Segera</Badge>}
          </div>
          <h4 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{opp.title}</h4>
          <p className="text-xs text-text-secondary mt-0.5">{opp.organization}</p>
          {opp.location && <p className="text-[11px] text-text-secondary mt-0.5">{opp.location}</p>}
          {opp.tags && opp.tags.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {opp.tags.slice(0, 3).map((t) => (
                <Badge key={t} variant="default" className="text-[10px] px-1.5 py-0 leading-none">{t}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <ArrowRight size={16} className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
          <span className={`text-[10px] ${isUrgent ? "text-accent font-medium" : "text-text-secondary"}`}>
            {opp.deadline}
          </span>
        </div>
      </div>
    </Link>
  );
}
