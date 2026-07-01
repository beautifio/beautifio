"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search, Users, MapPin, User,
  GraduationCap, Briefcase, Trophy, Heart, DollarSign, Sparkles, Gamepad2, ArrowRight,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { OPP_CATEGORIES } from "@beautifio/utils";
import { createClient } from "@/lib/supabase/client";

type DBOpportunity = {
  id: string;
  slug: string;
  title: string;
  category: string;
  organization: string;
  description: string | null;
  deadline: string;
  url: string | null;
  location: string | null;
  is_featured: boolean;
};

const catIcons: Record<string, typeof GraduationCap> = {
  beasiswa: GraduationCap, magang: Briefcase, pekerjaan: Briefcase,
  turnamen: Gamepad2, kompetisi: Trophy, relawan: Heart,
  pendanaan: DollarSign, "program-kreator": Sparkles,
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function OpportunityListPage() {
  const [opportunities, setOpportunities] = useState<DBOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let query = supabase
      .from("opportunities")
      .select("*")
      .eq("is_active", true)
      .order("deadline", { ascending: true })
      .limit(50);

    if (activeCat) {
      query = query.eq("category", activeCat);
    }

    query.then(({ data, error }) => {
      if (error) { setError("Gagal memuat peluang"); setLoading(false); return }
      setOpportunities(data ?? []);
      setLoading(false);
    })
  }, [activeCat]);

  const filtered = useMemo(() => {
    if (!search) return opportunities;
    const q = search.toLowerCase();
    return opportunities.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q)
    );
  }, [opportunities, search]);

  const featured = useMemo(() => filtered.filter((o) => o.is_featured), [filtered]);
  const regular = useMemo(() => filtered.filter((o) => !o.is_featured), [filtered]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Peluang</h1>
            <p className="text-sm text-text-secondary mt-1">Beasiswa, magang, kompetisi, dan lainnya</p>
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
              activeCat === null
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface text-text-secondary border border-border hover:border-primary/30 hover:text-text-primary hover:bg-muted/30"
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
                  activeCat === cat.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-surface text-text-secondary border border-border hover:border-primary/30 hover:text-text-primary hover:bg-muted/30"
                }`}
              >
                {Icon && <Icon size={14} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#084463", borderTopColor: "transparent" }} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Search size={28} className="text-text-secondary/40" />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {search ? "Tidak ada peluang ditemukan" : "Belum ada peluang di kategori ini"}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {search ? "Coba ubah kata kunci pencarian" : "Coba pilih kategori lain"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {featured.length > 0 && (
              <section>
                <h3 className="text-sm font-bold text-text-primary mb-3">Pilihan</h3>
                <div className="space-y-3">
                  {featured.map((opp, i) => (
                    <div key={opp.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                      <OpportunityCard opp={opp} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-sm font-bold text-text-primary mb-3">
                {featured.length > 0 ? "Lainnya" : "Semua Peluang"}
              </h3>
              <div className="space-y-3">
                {regular.map((opp, i) => (
                  <div key={opp.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                    <OpportunityCard opp={opp} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opp }: { opp: DBOpportunity }) {
  const cat = OPP_CATEGORIES.find((c) => c.value === opp.category);
  const Icon = cat ? catIcons[cat.value] : Briefcase;
  const deadlineDate = new Date(opp.deadline);
  const isUrgent = deadlineDate.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;

  return (
    <Link href={`/opportunity/${opp.slug}`}>
      <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group active:scale-[0.98]">
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
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <ArrowRight size={16} className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all" />
          <span className={`text-[10px] ${isUrgent ? "text-accent font-medium" : "text-text-secondary"}`}>
            {formatDeadline(opp.deadline)}
          </span>
        </div>
      </div>
    </Link>
  );
}
