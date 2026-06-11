"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, BookHeart, Users, Heart, BookOpen, PenLine, Calendar,
  Clock, MapPin, MoreHorizontal, Globe, Lock,
} from "lucide-react";
import { Badge, Button, BottomNavigation } from "@beautifio/ui";
import { getJournalBySlug, getAllEntries, getAllMilestones, JOURNAL_CATEGORIES, MOCK_MENTORS, MOCK_OPPORTUNITIES } from "@beautifio/utils";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import { JournalTimeline } from "@/features/journal/components/JournalTimeline";
import { JournalMilestoneList } from "@/features/journal/components/JournalMilestoneList";
import { JournalEntryForm } from "@/features/journal/components/JournalEntryForm";
import { NAV_TABS, navRoute } from "@/lib/navigation";

export default function JournalDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("roadmap");
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);

  const journal = useMemo(() => getJournalBySlug(slug), [slug]);
  const entries = useMemo(() => getAllEntries(slug), [slug]);
  const milestones = useMemo(() => getAllMilestones(slug), [slug]);

  const catInfo = JOURNAL_CATEGORIES.find((c) => c.value === journal?.goal_category);

  const ecosystemGroups = useMemo(() => {
    if (!journal) return [];
    const goal = journal.goal_category ?? "";
    const catLabel = catInfo?.label ?? "";

    const relatedStories: EcosystemItem[] = [
      { id: "js-all", type: "story" as const, title: "Jelajahi Cerita Inspiratif", subtitle: "Temukan cerita sesuai minatmu", href: "/cerita" },
    ];

    const relatedCircles: EcosystemItem[] = [
      { id: "jc-all", type: "circle" as const, title: "Gabung Circle", subtitle: "Diskusi dan kolaborasi dengan sesama pejalan", href: "/circle" },
    ];

    const relatedMentors: EcosystemItem[] = MOCK_MENTORS
      .filter((m) => m.roadmapSlugs?.includes(journal.roadmap_slug ?? "") || m.expertise.toLowerCase().includes(goal))
      .slice(0, 2)
      .map((m) => ({ id: m.id, type: "mentor" as const, title: m.name, subtitle: m.expertise, href: `/mentors/${m.slug}` }));

    const groups: { title: string; items: EcosystemItem[] }[] = [];
    groups.push({ title: "Cerita Terkait", items: relatedStories });
    groups.push({ title: "Circle Terkait", items: relatedCircles });
    if (relatedMentors.length) groups.push({ title: "Mentor Terkait", items: relatedMentors });
    return groups;
  }, [journal, catInfo]);

  const displayedEntries = showAllEntries ? entries : entries.slice(0, 5);
  const nextDay = entries.length > 0 ? Math.max(...entries.map((e) => e.day_number)) + 1 : 1;

  if (!journal) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <BookHeart size={40} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-primary">Jurnal tidak ditemukan</p>
          <button onClick={() => router.push("/jurnal")} className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer">
            Kembali ke Jurnal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto pb-24">
        {/* Header */}
        <div className="relative h-48 overflow-hidden">
          {journal.cover_image ? (
            <img src={journal.cover_image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <button
            onClick={() => router.push("/jurnal")}
            className="absolute top-6 left-6 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1.5">
              {catInfo && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-[10px]">
                  {catInfo.emoji} {catInfo.label}
                </Badge>
              )}
              <Badge variant="default" className="bg-white/10 text-white border-white/10 text-[10px]">
                {journal.is_public ? <Globe size={10} /> : <Lock size={10} />}
                <span className="ml-1">{journal.is_public ? "Publik" : "Pribadi"}</span>
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-white">{journal.title}</h1>
            {journal.author_name && (
              <p className="text-xs text-white/70 mt-1">oleh {journal.author_name}</p>
            )}
          </div>
        </div>

        <div className="px-6 pt-5 space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1"><BookOpen size={14} />{journal.entry_count} entri</span>
            <span className="flex items-center gap-1"><Users size={14} />{journal.follower_count} pengikut</span>
            <span className="flex items-center gap-1"><Heart size={14} />{journal.reaction_count} reaksi</span>
            <span className="flex items-center gap-1"><Calendar size={14} />{new Date(journal.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>

          {/* Description */}
          {journal.description && (
            <p className="text-sm text-text-secondary leading-relaxed">{journal.description}</p>
          )}

          {/* New Entry Button */}
          <Button onClick={() => setShowNewEntry(!showNewEntry)} className="w-full" variant={showNewEntry ? "secondary" : "primary"}>
            <PenLine size={14} />
            <span>{showNewEntry ? "Batal" : `Tulis Entri Hari ke-${nextDay}`}</span>
          </Button>

          {/* New Entry Form */}
          {showNewEntry && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <JournalEntryForm
                journalSlug={slug}
                dayNumber={nextDay}
                onClose={() => setShowNewEntry(false)}
              />
            </div>
          )}

          {/* Roadmap Integration */}
          {journal.roadmap_slug && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-secondary">Terhubung dengan Roadmap</p>
                  <p className="text-sm font-semibold text-text-primary mt-0.5 capitalize">
                    {journal.roadmap_slug.replace(/-/g, " ")}
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/roadmap/${journal.roadmap_slug}`)}
                  size="sm"
                  variant="secondary"
                >
                  <MapPin size={12} />
                  <span>Lihat</span>
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-text-secondary">
                <Clock size={11} />
                <span>{entries.length} entri · {milestones.filter((m) => m.is_achieved).length}/{milestones.length} milestone</span>
              </div>
            </div>
          )}

          {/* Milestones */}
          <JournalMilestoneList milestones={milestones} />

          {/* Timeline */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-text-primary">Timeline Perjalanan</h3>
              {entries.length > 5 && (
                <button
                  onClick={() => setShowAllEntries(!showAllEntries)}
                  className="text-xs font-medium text-primary hover:underline cursor-pointer"
                >
                  {showAllEntries ? "Tampilkan sedikit" : `Lihat semua (${entries.length})`}
                </button>
              )}
            </div>
            <JournalTimeline entries={displayedEntries} />
          </div>

          <EcosystemLinks groups={ecosystemGroups} />
        </div>
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
