"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Calendar, MapPin, Building2, ExternalLink,
  CheckCircle, ChevronRight, Users, User, GraduationCap, Briefcase, DollarSign, Sparkles, Heart, Gamepad2, Trophy, Bookmark,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { MOCK_OPPORTUNITIES, OPP_CATEGORIES, MOCK_MENTORS, ROADMAP_TEMPLATES } from "@beautifio/utils";
import { ProtectedAction } from "@/components/ProtectedAction";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";

const catIcons: Record<string, typeof GraduationCap> = {
  beasiswa: GraduationCap, magang: Briefcase, pekerjaan: Briefcase,
  turnamen: Gamepad2, kompetisi: Trophy, relawan: Heart,
  pendanaan: DollarSign, "program-kreator": Sparkles,
};



export default function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

  const opp = useMemo(() => MOCK_OPPORTUNITIES.find((o) => o.slug === slug), [slug]);
  const cat = useMemo(() => OPP_CATEGORIES.find((c) => c.value === opp?.category), [opp]);
  const Icon = cat ? catIcons[cat.value] : Briefcase;

  const ecosystemGroups = useMemo(() => {
    if (!opp) return [];
    const tags = opp.tags ?? [];
    const tagStr = tags.join(" ").toLowerCase();

    const relatedStories: EcosystemItem[] = [
      { id: `os-story-${slug}`, type: "story" as const, title: "Cerita Inspiratif", subtitle: "Temukan cerita yang sesuai dengan minatmu", href: "/cerita" },
    ];

    const relatedRoadmaps: EcosystemItem[] = ROADMAP_TEMPLATES
      .filter((r) => tagStr.includes(r.category) || tags.some((t) => r.title.toLowerCase().includes(t.toLowerCase())))
      .slice(0, 2)
      .map((r) => ({ id: `or-${r.slug}`, type: "roadmap" as const, title: r.title, subtitle: r.description, href: `/roadmap/${r.slug}` }));

    const relatedMentors: EcosystemItem[] = MOCK_MENTORS
      .filter((m) => tags.some((t) => m.expertise.toLowerCase().includes(t.toLowerCase())) || m.roadmapSlugs?.some((rs) => tags.includes(rs)))
      .slice(0, 2)
      .map((m) => ({ id: m.id, type: "mentor" as const, title: m.name, subtitle: m.expertise, href: `/mentors/${m.slug}` }));

    const groups: { title: string; items: EcosystemItem[] }[] = [];
    groups.push({ title: "Cerita Terkait", items: relatedStories });
    if (relatedRoadmaps.length) groups.push({ title: "Roadmap Terkait", items: relatedRoadmaps });
    if (relatedMentors.length) groups.push({ title: "Mentor Terkait", items: relatedMentors });
    groups.push({ title: "Circle Terkait", items: [{ id: `oc-${slug}`, type: "circle" as const, title: "Gabung Circle", subtitle: "Diskusikan peluang ini dengan komunitas", href: "/circle" }] });
    return groups;
  }, [opp, slug]);

  if (!opp) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Building2 size={40} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-primary">Peluang tidak ditemukan</p>
          <button onClick={() => router.back()} className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer">Kembali</button>
        </div>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil(
    (new Date(opp.deadline.replace(/(\d+) (\w+) (\d+)/, (_, d, m, y) => {
      const months: Record<string, string> = { Jan: "0", Feb: "1", Mar: "2", Apr: "3", Mei: "4", Jun: "5", Jul: "6", Agu: "7", Sep: "8", Okt: "9", Nov: "10", Des: "11" };
      return `${y}-${months[m]}-${d}`;
    })).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  ));

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        <div className="bg-gradient-to-br from-primary to-secondary px-6 pt-12 pb-8">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90 mb-4">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
              {Icon && <Icon size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              {cat && <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-[10px] px-1.5 py-0 leading-none mb-1">{cat.label}</Badge>}
              <h1 className="text-lg font-bold leading-tight">{opp.title}</h1>
              <p className="text-sm text-white/80 mt-0.5">{opp.organization}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 pb-24 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-surface border border-border">
              <Calendar size={16} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-text-secondary">Tenggat</p>
                <p className={`text-xs font-semibold ${daysLeft <= 7 ? "text-accent" : "text-text-primary"}`}>
                  {opp.deadline}
                </p>
                <p className="text-[10px] text-text-secondary">{daysLeft} hari lagi</p>
              </div>
            </div>
            {opp.location && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-surface border border-border">
                <MapPin size={16} className="text-secondary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-text-secondary">Lokasi</p>
                  <p className="text-xs font-semibold text-text-primary">{opp.location}</p>
                </div>
              </div>
            )}
          </div>

          <section>
            <h3 className="text-sm font-bold text-text-primary mb-2">Deskripsi</h3>
            <p className="text-sm text-text-primary leading-relaxed">{opp.description}</p>
          </section>

          {opp.benefit && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-2">Benefit</h3>
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <DollarSign size={16} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-primary">{opp.benefit}</p>
              </div>
            </section>
          )}

          {opp.eligibility && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-2">Persyaratan</h3>
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-surface border border-border">
                <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-text-primary">{opp.eligibility}</p>
              </div>
            </section>
          )}

          {opp.tags && opp.tags.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {opp.tags.map((t) => (
                  <Badge key={t} variant="default" className="text-[11px] px-2 py-0.5">{t}</Badge>
                ))}
              </div>
            </section>
          )}

          <div className="pt-4 flex gap-3">
            <ProtectedAction onAction={() => setIsSaved(!isSaved)}>
              <button
                className={`w-12 h-12 rounded-xl border flex items-center justify-center cursor-pointer transition-all flex-shrink-0 active:scale-[0.97] ${
                  isSaved
                    ? "bg-accent/10 border-accent/30 text-accent"
                    : "bg-surface border-border text-text-secondary hover:border-primary/30"
                }`}
              >
                <Bookmark size={18} className={isSaved ? "fill-accent" : ""} />
              </button>
            </ProtectedAction>
            <ProtectedAction label="Masuk untuk Mendaftar">
              <button className="flex-1 h-13 text-sm font-medium rounded-xl bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
                <ExternalLink size={16} />
                Daftar Sekarang
              </button>
            </ProtectedAction>
          </div>
          <EcosystemLinks groups={ecosystemGroups} />
        </div>
      </div>

    </div>
  );
}
