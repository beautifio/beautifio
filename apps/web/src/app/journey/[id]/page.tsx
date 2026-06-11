"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles, CheckCircle2, Circle, BookOpen, Heart,
  Zap, Users, Target, Flame, ArrowLeft, RotateCcw,
} from "lucide-react";
import { Button, Card, Skeleton, BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  getActiveJourney, getBigWins, getTodayActivities,
  getTodayReflection, getJourneyProgress, getTimeline,
  completeActivity, completeSmallWin, saveDailyReflection,
  updateBigWin, failBigWin, generateAndInsertActivities,
  getSpiritualPreferences,
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
import { FailureModal } from "@/features/journey/failure-modal";

const DIMENSION_LABELS: Record<string, { label: string; emoji: string }> = {
  spiritual: { label: "Spiritual", emoji: "🕊️" },
  physical: { label: "Fisik", emoji: "💪" },
  knowledge: { label: "Pengetahuan", emoji: "📚" },
  social: { label: "Sosial", emoji: "👥" },
  character: { label: "Karakter", emoji: "⭐" },
  dream_skill: { label: "Skill Mimpi", emoji: "🎯" },
};

export default function JourneyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [bigWins, setBigWins] = useState<BigWin[]>([]);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [reflection, setReflection] = useState<JourneyDailyReflection | null>(null);
  const [timeline, setTimeline] = useState<GrowthTimelineEvent[]>([]);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [spiritualPref, setSpiritualPref] = useState<SpiritualPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReflection, setShowReflection] = useState(false);
  const [failureBigWin, setFailureBigWin] = useState<BigWin | null>(null);
  const [navTab, setNavTab] = useState("home");
  const [sectionTab, setSectionTab] = useState<"today" | "wins" | "timeline">("today");

  const loadData = useCallback(async () => {
    if (!user || !id) return;
    const j = await getActiveJourney(user.id);
    if (!j || j.id !== id) {
      const allJourneys = await import("@/lib/journey-queries").then(
        (m) => m.getAllJourneys
      );
      const journeys = await allJourneys(user.id);
      const found = journeys.find((j: DreamJourney) => j.id === id);
      if (!found) {
        router.push("/journey");
        return;
      }
      setJourney(found);
      return;
    }
    setJourney(j);

    const [bw, acts, ref, prog, tl, sp] = await Promise.all([
      getBigWins(id),
      getTodayActivities(user.id),
      getTodayReflection(user.id),
      getJourneyProgress(user.id, id),
      getTimeline(user.id, id),
      getSpiritualPreferences(user.id),
    ]);

    if (acts.length === 0) {
      const generated = await generateAndInsertActivities(j, sp, undefined);
      setActivities(generated);
    } else {
      setActivities(acts);
    }

    setBigWins(bw);
    setReflection(ref);
    setProgress(prog);
    setTimeline(tl);
    setSpiritualPref(sp);
    setLoading(false);
  }, [user, id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCompleteActivity = async (activityId: string) => {
    await completeActivity(activityId);
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? { ...a, is_completed: true, completed_at: new Date().toISOString() }
          : a
      )
    );

    const completedAll = activities.every(
      (a) => a.id === activityId || a.is_completed
    );
    if (completedAll) {
      setShowReflection(true);
    }
  };

  const handleSaveReflection = async (data: {
    learned: string;
    grateful: string;
    improve: string;
    mood: string;
  }) => {
    if (!user || !journey) return;
    await saveDailyReflection(user.id, journey.id, data);
    setShowReflection(false);
    const updated = await getTodayReflection(user.id);
    setReflection(updated);
  };

  const handleCompleteSmallWin = async (
    smallWinId: string,
    reflection?: string
  ) => {
    await completeSmallWin(smallWinId, reflection);
    const bw = await getBigWins(id);
    setBigWins(bw);
  };

  const handleFailBigWin = async (bigWinId: string) => {
    await failBigWin(bigWinId);
    const bw = await getBigWins(id);
    setBigWins(bw);
    setFailureBigWin(null);
  };

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

  const progressPercent =
    progress && progress.big_wins_total > 0
      ? Math.round((progress.big_wins_completed / progress.big_wins_total) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/journey")} className="p-2 -ml-2 hover:bg-muted rounded-xl">
            <ArrowLeft size={20} className="text-text-secondary" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">{journey.emoji}</span>
            <div>
              <h1 className="text-lg font-bold text-text-primary">{journey.title}</h1>
              <p className="text-xs text-text-secondary">Perjalanan Mimpiku</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Current Focus */}
        {currentBigWin && (
          <Card className="p-4 mb-6 border-accent/30 bg-accent/5">
            <div className="flex items-start gap-3">
              <Target size={18} className="text-accent mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-accent font-medium uppercase tracking-wide">Big Win Saat Ini</p>
                <p className="text-sm font-bold text-text-primary mt-0.5">{currentBigWin.title}</p>
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
                  {activities.filter((a) => a.is_completed).length}/{activities.length}
                </span>
              </div>

              <div className="space-y-2">
                {activities.map((a) => {
                  const dim = DIMENSION_LABELS[a.dimension] || {
                    label: a.dimension,
                    emoji: "📌",
                  };
                  return (
                    <DailyActivityCard
                      key={a.id}
                      activity={a}
                      dimensionLabel={dim.label}
                      dimensionEmoji={dim.emoji}
                      onComplete={handleCompleteActivity}
                    />
                  );
                })}
              </div>
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

            <div className="mt-6">
              <h3 className="text-sm font-bold text-text-primary mb-3">Streak</h3>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Flame size={24} className="text-accent" />
                  <div>
                    <p className="text-lg font-bold text-text-primary">
                      {progress?.completed_activities_today || 0} / {progress?.total_activities_today || 6}
                    </p>
                    <p className="text-xs text-text-secondary">aktivitas selesai hari ini</p>
                  </div>
                </div>
              </Card>
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

            {bigWins.map((bw) => (
              <BigWinCard
                key={bw.id}
                bigWin={bw}
                onCompleteSmallWin={handleCompleteSmallWin}
                onFail={() => setFailureBigWin(bw)}
              />
            ))}
          </div>
        )}

        {/* Tab: Timeline */}
        {sectionTab === "timeline" && (
          <div>
            <h2 className="text-base font-bold text-text-primary mb-4">Riwayat Perjalanan</h2>
            <JourneyTimeline events={timeline} />
          </div>
        )}
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={navTab} onTabChange={(id) => { setNavTab(id); router.push(navRoute(id)); }} />

      {showReflection && (
        <ReflectionModal
          onSave={handleSaveReflection}
          onClose={() => setShowReflection(false)}
        />
      )}

      {failureBigWin && (
        <FailureModal
          bigWin={failureBigWin}
          onConfirm={() => handleFailBigWin(failureBigWin.id)}
          onClose={() => setFailureBigWin(null)}
        />
      )}
    </div>
  );
}
