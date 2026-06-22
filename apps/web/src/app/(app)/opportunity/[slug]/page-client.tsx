"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, MapPin, Building2, ExternalLink,
  Users, User, GraduationCap, Briefcase, DollarSign, Sparkles, Heart, Gamepad2, Trophy, Bookmark,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { OPP_CATEGORIES } from "@beautifio/utils";
import { createClient } from "@/lib/supabase/client";
import { ProtectedAction } from "@/components/ProtectedAction";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";

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

export default function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [opp, setOpp] = useState<DBOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("opportunities")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        setOpp(data);
        setLoading(false);
      });
  }, [slug]);

  const cat = useMemo(() => OPP_CATEGORIES.find((c) => c.value === opp?.category), [opp]);
  const Icon = cat ? catIcons[cat.value] : Briefcase;

  const ecosystemGroups = useMemo(() => {
    if (!opp) return [];

    const relatedStories: EcosystemItem[] = [
      { id: `os-story-${slug}`, type: "story" as const, title: "Cerita Inspiratif", subtitle: "Temukan cerita yang sesuai dengan minatmu", href: "/cerita" },
    ];

    const groups: { title: string; items: EcosystemItem[] }[] = [];
    groups.push({ title: "Cerita Terkait", items: relatedStories });
    groups.push({ title: "Circle Terkait", items: [{ id: `oc-${slug}`, type: "circle" as const, title: "Gabung Circle", subtitle: "Diskusikan peluang ini dengan komunitas", href: "/circle" }] });
    return groups;
  }, [opp, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-text-secondary">Memuat...</p>
      </div>
    );
  }

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

  const deadlineDate = new Date(opp.deadline);
  const daysLeft = Math.max(0, Math.ceil(
    (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
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
                  {formatDeadline(opp.deadline)}
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
            <p className="text-sm text-text-primary leading-relaxed">{opp.description || "Tidak ada deskripsi."}</p>
          </section>

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
            {opp.url ? (
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-13 text-sm font-medium rounded-xl bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
              >
                <ExternalLink size={16} />
                Daftar Sekarang
              </a>
            ) : (
              <ProtectedAction label="Masuk untuk Mendaftar">
                <button className="flex-1 h-13 text-sm font-medium rounded-xl bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
                  <ExternalLink size={16} />
                  Daftar Sekarang
                </button>
              </ProtectedAction>
            )}
          </div>
          <EcosystemLinks groups={ecosystemGroups} />
        </div>
      </div>
    </div>
  );
}
