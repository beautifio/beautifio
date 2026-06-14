"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles, BookOpen, Heart,
  Target, ArrowLeft, MapPin,
} from "lucide-react";
import { Button, Card, Skeleton } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import {
  getActiveJourney, getJourneyBySlug, journeyUrl, getBigWins,
  getJourneyProgress, getTimeline,
  completeActivity, completeSmallWin, saveDailyReflection,
  updateBigWin, completeBigWin, failBigWin, unfailBigWin, saveBigWinReflection,
  generateAndInsertActivities, getSpiritualPreferences,
  saveActivityNote, getJourneyReflections, getActivePhaseWithBenchmarks,
} from "@/lib/journey-queries";
import type {
  DreamJourney, BigWin, SmallWin, DailyActivity,
  JourneyDailyReflection, JourneyProgress, GrowthTimelineEvent,
  SpiritualPreferences,
} from "@beautifio/types";
import { DailyActivityCard } from "@/features/journey/daily-activity-card";
import { BigWinCard } from "@/features/journey/big-win-card";
import { ReflectionModal } from "@/features/journey/reflection-modal";
import { JourneyTimeline } from "@/features/journey/journey-timeline";
import { JourneyStory } from "@/features/journey/journey-story";
import { FailureModal } from "@/features/journey/failure-modal";
import { BigWinCelebration } from "@/features/journey/big-win-celebration";
import type { DreamTemplate } from "@beautifio/types";
import {
  getAgeGroup, getAgeGroupLabel, getAgeRangeLabel,
  getAlternativeFuturesForTemplate, getDreamMeaning,
} from "@beautifio/utils";

const DIMENSION_LABELS: Record<string, { label: string; emoji: string }> = {
  spiritual: { label: "Spiritual", emoji: "🕊️" },
  physical: { label: "Fisik", emoji: "💪" },
  knowledge: { label: "Pengetahuan", emoji: "📚" },
  social: { label: "Sosial", emoji: "👥" },
  character: { label: "Karakter", emoji: "⭐" },
  dream_skill: { label: "Skill Mimpi", emoji: "🎯" },
};

const DIMENSION_ORDER: Record<string, number> = {
  character: 0,
  dream_skill: 1,
  knowledge: 2,
  physical: 3,
  social: 4,
  spiritual: 5,
};

const ESTIMATED_MINUTES: Record<string, number> = {
  character: 5,
  dream_skill: 20,
  knowledge: 15,
  physical: 15,
  social: 10,
  spiritual: 10,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function JourneyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [bigWins, setBigWins] = useState<BigWin[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [reflection, setReflection] = useState<JourneyDailyReflection | null>(null);
  const [timeline, setTimeline] = useState<GrowthTimelineEvent[]>([]);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [spiritualPref, setSpiritualPref] = useState<SpiritualPreferences | null>(null);
  const [allReflections, setAllReflections] = useState<JourneyDailyReflection[]>([]);
  const [templateInfo, setTemplateInfo] = useState<DreamTemplate | null>(null);
  const [alternativeFutures, setAlternativeFutures] = useState<{ title: string; description: string; skills: string[] }[]>([]);
  const [dreamMeaning, setDreamMeaning] = useState("");
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [activePhase, setActivePhase] = useState<{ phase: any; smallWins: any[]; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReflection, setShowReflection] = useState(false);
  const [failureBigWin, setFailureBigWin] = useState<BigWin | null>(null);
  const [celebrationBigWin, setCelebrationBigWin] = useState<BigWin | null>(null);
  const [showAllBigWins, setShowAllBigWins] = useState(false);
  const [sectionTab, setSectionTab] = useState<"today" | "wins" | "timeline" | "story">("today");
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedActivityId((prev) => (prev === id ? null : id));
  }, []);

  const loadData = useCallback(async () => {
    if (!user || !slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setActivities([]);
    setReflection(null);
    setProgress(null);
    try {
      let j: DreamJourney | null = null;
      if (UUID_RE.test(slug)) {
        const { getAllJourneys } = await import("@/lib/journey-queries");
        const journeys = await getAllJourneys(user.id);
        const found = journeys.find((j: DreamJourney) => j.id === slug);
        if (found) {
          j = found;
          router.replace(journeyUrl(found));
        }
      } else {
        j = await getJourneyBySlug(user.id, slug);
        if (!j) {
          j = await getActiveJourney(user.id);
          if (j) router.replace(journeyUrl(j));
        }
      }
      if (!j) {
        setLoading(false);
        router.push("/journey");
        return;
      }
      setJourney(j);

      const [bw, prog, tl, sp, refl, ph] = await Promise.all([
        getBigWins(j.id),
        getJourneyProgress(user.id, j.id),
        getTimeline(user.id, j.id),
        getSpiritualPreferences(user.id),
        getJourneyReflections(user.id, j.id),
        getActivePhaseWithBenchmarks(j.id, user.id),
      ]);
      setActivePhase(ph);

      const { getDreamTemplate, getActivitiesForDimension: validatePool } = await import("@beautifio/utils");

      let loadedActivities = prog.today_activities.filter(
        (a) => a.journey_id === j.id
      );

      // Safety filter: validate activities against expected template pool
      if (loadedActivities.length > 0) {
        const template = getDreamTemplate(j.template_slug);
        if (template) {
          const hasMismatch = loadedActivities.some((a) => {
            const pool = validatePool(a.dimension, template, sp, j.category);
            return !pool.some((t: string) => t.toLowerCase().trim() === a.title.toLowerCase().trim());
          });
          if (hasMismatch) {
            console.warn("Data leak detected: regenerating activities for journey", j.id);
            await generateAndInsertActivities(j, sp, undefined);
            loadedActivities = [];
          }
        }
      }

      if (loadedActivities.length > 0) {
        setActivities(loadedActivities);
      } else {
        const generated = await generateAndInsertActivities(j, sp, undefined);
        setActivities(generated);
      }

      setBigWins(bw);
      setReflection(
        prog.today_reflection?.journey_id === j.id
          ? prog.today_reflection
          : null
      );
      setProgress(prog);
      setTimeline(tl);
      setSpiritualPref(sp);
      setAllReflections(refl);
      const tInfo = getDreamTemplate(j.template_slug) || null;
      setTemplateInfo(tInfo);

      const meaning = getDreamMeaning(j.template_slug);
      setDreamMeaning(meaning);
      const futures = getAlternativeFuturesForTemplate(j.template_slug);
      setAlternativeFutures(futures);
      if (j.user_age) {
        const group = getAgeGroup(j.user_age);
        if (group) setAgeGroup(getAgeGroupLabel(group));
      }
    } catch (e) {
      console.error("Failed to load journey:", e);
      setError("Koneksi sedang bermasalah. Periksa internetmu, ya.");
    } finally {
      setLoading(false);
    }
  }, [user, slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteActivity = async (activityId: string) => {
    await completeActivity(activityId);
    setActivities((prev) => {
      const next = prev.map((a) =>
        a.id === activityId
          ? { ...a, is_completed: true, completed_at: new Date().toISOString() }
          : a
      );
      const completedAll = next.every((a) => a.is_completed);
      if (completedAll) {
        setShowReflection(true);
      }
      return next;
    });
  };

  const handleSaveNote = async (activityId: string, notes: string) => {
    await saveActivityNote(activityId, notes);
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, notes } : a))
    );
  };

  const handleSaveReflection = async (data: {
    learned: string;
    grateful: string;
    improve: string;
    mood: string;
  }) => {
    if (!user || !journey) return;
    await saveDailyReflection(user.id, journey.id, data);
    setReflection({
      id: "",
      user_id: user.id,
      journey_id: journey.id,
      date: new Date().toISOString().split("T")[0],
      ...data,
    });
    setShowReflection(false);
  };

  const handleCompleteSmallWin = async (
    smallWinId: string,
    reflection?: string
  ) => {
    setBigWins((prev) =>
      prev.map((bw) => ({
        ...bw,
        small_wins: bw.small_wins?.map((sw) =>
          sw.id === smallWinId
            ? { ...sw, is_completed: true, completed_at: new Date().toISOString() }
            : sw
        ),
      }))
    );

    await completeSmallWin(smallWinId, reflection);
    const updated = await getBigWins(journey!.id);
    setBigWins(updated);

    const justCompleted = updated.find(
      (bw) =>
        !bw.is_completed &&
        !bw.is_failed &&
        (bw.small_wins || []).length > 0 &&
        (bw.small_wins || []).every((sw) => sw.is_completed)
    );
    if (justCompleted) {
      await completeBigWin(justCompleted.id);
      const final = await getBigWins(journey!.id);
      setBigWins(final);
      setCelebrationBigWin(justCompleted);
    }
  };

  const handleSaveCelebration = async (reflection: {
    most_memorable_moment: string;
    who_helped: string;
    biggest_lesson: string;
    next_steps: string;
  }) => {
    if (!celebrationBigWin) return;
    await saveBigWinReflection(celebrationBigWin.id, reflection);
    setCelebrationBigWin(null);
  };

  const handleFailBigWin = async (bigWinId: string) => {
    await failBigWin(bigWinId);
    const bw = await getBigWins(journey!.id);
    setBigWins(bw);
    setFailureBigWin(null);
  };

  const handleUndoFailBigWin = async (bigWinId: string) => {
    await unfailBigWin(bigWinId);
    const bw = await getBigWins(journey!.id);
    setBigWins(bw);
  };

  const displayActivities = useMemo(() => {
    const seenTitles = new Set<string>();
    return [...activities]
      .sort(
        (a, b) =>
          (DIMENSION_ORDER[a.dimension] ?? 99) -
          (DIMENSION_ORDER[b.dimension] ?? 99)
      )
      .filter((a) => {
        const key = a.title.toLowerCase().trim();
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
        return true;
      })
      .slice(0, 7);
  }, [activities]);

  const progressPercent =
    bigWins.length > 0
      ? Math.round(
          (bigWins.filter((bw) => bw.is_completed).length / bigWins.length) *
            100
        )
      : 0;

  if (error) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto flex flex-col items-center justify-center text-center">
        <p className="text-destructive font-medium mb-4">{error}</p>
        <Button variant="primary" size="sm" onClick={() => { setError(null); setLoading(true); loadData(); }}>
          Coba Lagi
        </Button>
        <p className="text-xs text-text-secondary/50 mt-3 max-w-xs">
          Masih bermasalah? Coba tutup dan buka kembali aplikasi.
        </p>
      </div>
    );
  }

  if (loading || !journey) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-32 w-full mb-4 rounded-xl" />
        <Skeleton className="h-48 w-full mb-4 rounded-xl" />
      </div>
    );
  }

  const currentBigWin = progress?.current_big_win;
  const currentSmallWin = progress?.current_small_win;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.push("/journey")} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <span className="text-3xl">{journey.emoji}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-text-primary">{journey.title}</h1>
            <div className="mt-2">
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%`, backgroundColor: "#FF5E5B" }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-text-secondary">
                  Pencapaian: {bigWins.filter((bw) => bw.is_completed).length}/{bigWins.length}
                </span>
                <span className="text-[11px] text-text-secondary">
                  Hari ini: {displayActivities.filter((a) => a.is_completed).length}/{displayActivities.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dream Context — always visible */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-accent/5 to-primary/5 border border-accent/10">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-xs font-semibold text-accent uppercase tracking-wide">Mengapa Mimpi Ini?</p>
              <p className="text-sm text-text-primary mt-1 leading-relaxed">
                {templateInfo?.description || journey.title}
              </p>
            </div>
          </div>
          {dreamMeaning && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Heart size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Makna Mimpi Ini</p>
                <p className="text-sm text-text-primary mt-1 leading-relaxed">
                  {dreamMeaning}
                </p>
              </div>
            </div>
          )}
          {ageGroup && (
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-text-secondary">
              <span className="px-2 py-0.5 rounded-full bg-muted">{ageGroup}</span>
              {journey.user_age && <span>Usia {journey.user_age} tahun</span>}
            </div>
          )}
        </div>

        {/* Active Phase */}
        {activePhase && (
          <Card className="p-4 mb-4 border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                    Fase Saat Ini
                  </p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      activePhase.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : activePhase.status === "behind"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {activePhase.status === "completed"
                      ? "✓ Selesai"
                      : activePhase.status === "behind"
                      ? "⚠️ Tertinggal"
                      : "📌 On Track"}
                  </span>
                </div>
                <p className="text-base font-bold text-text-primary mt-0.5">
                  {activePhase.phase.title}
                </p>
                {activePhase.phase.description && (
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {activePhase.phase.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-[11px] text-text-secondary">
                  <span className="px-2 py-0.5 rounded-full bg-muted">
                    Usia {activePhase.phase.age_min}–{activePhase.phase.age_max} tahun
                  </span>
                  {activePhase.phase.benchmark_time_years && (
                    <span>⏱ {activePhase.phase.benchmark_time_years} tahun</span>
                  )}
                </div>
                {activePhase.smallWins.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide mb-1.5">
                      Target Fase Ini
                    </p>
                    <div className="space-y-1">
                      {activePhase.smallWins.map((sw: any) => (
                        <div
                          key={sw.id}
                          className="flex items-center gap-2 text-[11px] text-text-secondary"
                        >
                          <span className="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
                          <span>{sw.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Current Focus */}
        {currentBigWin && (
          <Card className="p-4 mb-6 border" style={{ borderColor: "#FFF0EF" }}>
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#FF5E5B] mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[#FF5E5B] font-semibold uppercase tracking-wide">Big Win Saat Ini</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{currentBigWin.title}</p>
                {(() => {
                  const sw = currentBigWin.small_wins || [];
                  const completed = sw.filter((s) => s.is_completed).length;
                  if (sw.length === 0) return null;
                  const pct = Math.round((completed / sw.length) * 100);
                  return (
                    <div className="mt-2">
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: "#FF5E5B" }}
                        />
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1">
                        {completed} dari {sw.length} langkah selesai
                      </p>
                    </div>
                  );
                })()}
                {currentBigWin.why_it_matters && (
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    💡 <span className="font-medium">Kenapa ini penting?</span> {currentBigWin.why_it_matters}
                  </p>
                )}
                {currentSmallWin && (
                  <p className="text-xs text-text-secondary mt-1">
                    🎯 Fokus: {currentSmallWin.title}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setSectionTab("today")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              sectionTab === "today"
                ? "bg-bg text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setSectionTab("wins")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              sectionTab === "wins"
                ? "bg-bg text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Pencapaian
          </button>
          <button
            onClick={() => setSectionTab("story")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              sectionTab === "story"
                ? "bg-bg text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Cerita
          </button>
          <button
            onClick={() => setSectionTab("timeline")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              sectionTab === "timeline"
                ? "bg-bg text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Riwayat
          </button>
        </div>

        {/* Tab: Today */}
        {sectionTab === "today" && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-text-primary">
                  Aktivitas Hari Ini
                </h2>
                <span className="text-xs text-text-secondary">
                  {displayActivities.filter((a) => a.is_completed).length}/{displayActivities.length}
                </span>
              </div>

              <p className="text-[10px] text-text-secondary/50 mb-3 leading-relaxed">
                6 area pengembangan: ⭐ Karakter → 🎯 Skill Mimpi → 📚 Pengetahuan → 💪 Fisik → 👥 Sosial → 🕊 Spiritual
              </p>

              {(progress?.streak ?? 0) >= 2 && (
                <p className="text-sm font-semibold mb-3" style={{ color: "#FFB627" }}>
                  🔥 {progress?.streak} hari berturut-turut
                </p>
              )}

              {(() => {
                const grouped = new Map<string, typeof displayActivities>();
                const orderedDimensions = Object.keys(DIMENSION_ORDER);

                for (const a of displayActivities) {
                  const key = a.dimension;
                  if (!grouped.has(key)) grouped.set(key, []);
                  grouped.get(key)!.push(a);
                }

                return orderedDimensions
                  .filter((dim) => grouped.has(dim))
                  .map((dim) => {
                    const items = grouped.get(dim)!;
                    const dimInfo = DIMENSION_LABELS[dim] || {
                      label: dim,
                      emoji: "📌",
                    };
                    const uncompleted = items.filter((a) => !a.is_completed);
                    const completed = items.filter((a) => a.is_completed);

                    return (
                      <div key={dim}>
                        <p className="text-[11px] uppercase text-text-secondary/60 font-semibold tracking-wide mt-4 mb-2">
                          {dimInfo.emoji} {dimInfo.label}
                        </p>
                        <div className="space-y-1.5">
                          {[...uncompleted, ...completed].map((a) => (
                            <DailyActivityCard
                              key={a.id}
                              activity={a}
                              dimensionLabel={dimInfo.label}
                              dimensionEmoji={dimInfo.emoji}
                              onComplete={handleCompleteActivity}
                              onSaveNote={handleSaveNote}
                              estimatedMinutes={ESTIMATED_MINUTES[a.dimension]}
                              isExpanded={expandedActivityId === a.id}
                              onToggleExpand={handleToggleExpand}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  });
              })()}
            </div>

            {reflection && (
              <Card className="p-4 mb-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">Refleksi Hari Ini</h3>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p><span className="text-text-primary font-medium">Dipetik:</span> {reflection.learned}</p>
                  <p><span className="text-text-primary font-medium">Disyukuri:</span> {reflection.grateful}</p>
                </div>
              </Card>
            )}

            {!reflection && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setShowReflection(true)}
              >
                <BookOpen size={14} /> Tulis Refleksi Hari Ini
              </Button>
            )}

            <div className="mt-4 text-center">
              <p className="text-xs text-text-secondary">
                Aktivitas hari ini: {displayActivities.filter((a) => a.is_completed).length} dari {displayActivities.length} selesai
              </p>
            </div>
          </div>
        )}

        {/* Tab: Wins */}
        {sectionTab === "wins" && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-text-primary mb-1">Big Wins</h2>
            <p className="text-xs text-text-secondary mb-4 -mt-2">
              {progress?.big_wins_completed}/{progress?.big_wins_total} selesai
            </p>

            {(showAllBigWins ? bigWins : (() => {
              const sorted = [...bigWins].sort((a, b) => a.order_index - b.order_index);
              const firstIncomplete = sorted.findIndex((bw) => !bw.is_completed && !bw.is_failed);
              const start = firstIncomplete === -1 ? Math.max(0, sorted.length - 3) : firstIncomplete;
              return sorted.slice(start, start + 3);
            })()).map((bw) => (
              <BigWinCard
                key={bw.id}
                bigWin={bw}
                onCompleteSmallWin={handleCompleteSmallWin}
                onFail={() => setFailureBigWin(bw)}
                onUndoFail={() => handleUndoFailBigWin(bw.id)}
              />
            ))}

            {bigWins.length > 3 && !showAllBigWins && (
              <button
                onClick={() => setShowAllBigWins(true)}
                className="w-full py-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer text-center"
              >
                Lihat Semua Langkah ({bigWins.length} langkah)
              </button>
            )}

            {showAllBigWins && (
              <button
                onClick={() => setShowAllBigWins(false)}
                className="w-full py-3 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-center"
              >
                Lihat Lebih Sedikit
              </button>
            )}
          </div>
        )}

        {/* Tab: Story */}
        {sectionTab === "story" && (
          <div>
            <h2 className="text-base font-bold text-text-primary mb-4">Cerita Perjalananku</h2>
            <JourneyStory reflections={allReflections} />
          </div>
        )}

        {/* Tab: Timeline */}
        {sectionTab === "timeline" && (
          <div>
            <h2 className="text-base font-bold text-text-primary mb-4">Riwayat Perjalanan</h2>
            <JourneyTimeline events={timeline} />
          </div>
        )}

        {/* Alternative Futures shown in FailureModal only */}
      </div>

      {showReflection && (
        <ReflectionModal
          onSave={handleSaveReflection}
          onClose={() => setShowReflection(false)}
        />
      )}

      {failureBigWin && (
        <FailureModal
          bigWin={failureBigWin}
          dreamSlug={journey!.template_slug}
          developedSkills={bigWins
            .flatMap((bw) => bw.small_wins || [])
            .filter((sw) => sw.is_completed)
            .map((sw) => sw.title)}
          onConfirm={() => handleFailBigWin(failureBigWin.id)}
          onClose={() => setFailureBigWin(null)}
        />
      )}

      {celebrationBigWin && (
        <BigWinCelebration
          bigWin={celebrationBigWin}
          onSave={handleSaveCelebration}
          onClose={() => setCelebrationBigWin(null)}
        />
      )}
    </div>
  );
}
