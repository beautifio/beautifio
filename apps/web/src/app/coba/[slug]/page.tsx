"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronRight, Clock, X } from "lucide-react";
import { Button } from "@beautifio/ui";
import { getDreamTemplate, getBenchmarkForTemplate, determineUserPhase, TEMPLATE_TO_BENCHMARK_SLUG, generateDailyActivities, ACTIVITY_DETAILS } from "@beautifio/utils";
import { DailyActivityCard } from "@/features/journey/daily-activity-card";
import { getGuestJourney, saveGuestJourney, getCurrentDay, isTrialExpired, todayStr } from "@/lib/guest-journey";
import type { DreamJourney, DailyActivity, DailyActivityDimension } from "@beautifio/types";

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

export default function CobaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [guestData, setGuestData] = useState<ReturnType<typeof getGuestJourney>>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [showRegisterSheet, setShowRegisterSheet] = useState(false);
  const [day2Dismissed, setDay2Dismissed] = useState(false);
  const day1PromptFired = useRef(false);
  const initialLoadRef = useRef(false);
  const prevCompletedRef = useRef(0);

  useEffect(() => {
    const data = getGuestJourney();
    if (!data || data.templateSlug !== slug) {
      router.replace("/");
      return;
    }
    setGuestData(data);
  }, [slug, router]);

  useEffect(() => {
    if (!guestData) return;

    const template = getDreamTemplate(slug);
    if (!template) {
      router.replace("/");
      return;
    }

    const dateStr = todayStr();
    const day = getCurrentDay(guestData.startDate);

    if (day > 3) {
      setReady(true);
      return;
    }

    const mockJourney = {
      id: `guest-${slug}`,
      template_slug: slug,
      user_id: "guest",
      category: template.category,
      title: template.title,
      emoji: template.emoji,
      slug: "",
      status: "active" as const,
      user_age: guestData.userAge,
      started_at: guestData.startDate,
      ended_at: null,
      created_at: "",
      updated_at: "",
    } as DreamJourney;

    const generated = generateDailyActivities({ journey: mockJourney, spiritualPref: null, date: dateStr });

    const completedTitles = guestData.completedActivities[dateStr] || [];
    const notes = guestData.activityNotes[dateStr] || {};

    const merged: DailyActivity[] = generated.map((act, i) => ({
      ...act,
      id: `guest-${act.dimension}-${dateStr}`,
      is_completed: completedTitles.includes(act.title),
      notes: notes[act.title] || null,
    }));

    setActivities(merged.sort((a, b) => (DIMENSION_ORDER[a.dimension] ?? 99) - (DIMENSION_ORDER[b.dimension] ?? 99)));
    setReady(true);
  }, [guestData, slug, router]);

  const day = guestData ? getCurrentDay(guestData.startDate) : 1;

  // Day 1 trigger: show sheet when completing 3rd activity
  useEffect(() => {
    if (day !== 1 || day < 1) return;
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      return;
    }
    const completed = activities.filter((a) => a.is_completed).length;
    if (completed === 3 && prevCompletedRef.current < 3 && !day1PromptFired.current) {
      day1PromptFired.current = true;
      setShowRegisterSheet(true);
    }
    prevCompletedRef.current = completed;
  }, [activities, day]);

  const handleToggleComplete = useCallback((activityId: string) => {
    setActivities((prev) => {
      const next = prev.map((a) =>
        a.id === activityId
          ? { ...a, is_completed: !a.is_completed, completed_at: !a.is_completed ? new Date().toISOString() : null }
          : a
      );

      const dateStr = todayStr();
      const data = getGuestJourney();
      if (data) {
        const completed = next.filter((a) => a.is_completed).map((a) => a.title);
        saveGuestJourney({
          ...data,
          completedActivities: { ...data.completedActivities, [dateStr]: completed },
        });
      }

      return next;
    });
  }, []);

  const handleSaveNote = useCallback((activityId: string, note: string) => {
    setActivities((prev) => {
      const next = prev.map((a) => (a.id === activityId ? { ...a, notes: note } : a));
      const dateStr = todayStr();
      const data = getGuestJourney();
      if (data) {
        const act = next.find((a) => a.id === activityId);
        if (act) {
          saveGuestJourney({
            ...data,
            activityNotes: {
              ...data.activityNotes,
              [dateStr]: { ...(data.activityNotes[dateStr] || {}), [act.title]: note },
            },
          });
        }
      }
      return next;
    });
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const expired = guestData ? isTrialExpired(guestData.startDate) : false;
  const completedCount = activities.filter((a) => a.is_completed).length;
  const template = getDreamTemplate(slug);
  const benchmarkSlug = TEMPLATE_TO_BENCHMARK_SLUG[slug];
  const phaseInfo = guestData && benchmarkSlug ? determineUserPhase(benchmarkSlug, guestData.userAge) : null;

  if (expired) {
    return (
      <div className="min-h-screen bg-bg flex flex-col">
        <div className="max-w-content mx-auto px-5 pt-6 pb-24 flex flex-col items-center justify-center flex-1 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
            <Clock size={36} className="text-accent" />
          </div>
          <p className="text-lg font-bold text-text-primary">Trial 3 Harimu Selesai</p>
          <p className="text-sm text-text-secondary max-w-xs">
            Daftar gratis untuk melanjutkan perjalananmu dan menyimpan semua progres.
          </p>
          <div className="pt-4 w-full max-w-xs space-y-3">
            <Button variant="primary" size="lg" className="w-full" onClick={() => router.push(`/register?mimpi=${encodeURIComponent(benchmarkSlug || slug)}`)}>
              Daftar Gratis
            </Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => router.push("/")}>
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-5">
        <button onClick={() => router.push("/")} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              Hari ke-{day} dari 3
            </span>
          </div>
          <span className="text-xs text-text-secondary">
            {completedCount}/{activities.length} selesai
          </span>
        </div>

        {template && (
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{template.emoji}</span>
              <div>
                <p className="text-base font-bold text-text-primary">{template.title}</p>
                <p className="text-xs text-text-secondary">{template.duration}</p>
              </div>
            </div>
          </div>
        )}

        {phaseInfo?.phase && (
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary/50 uppercase tracking-wide">Fase Saat Ini</p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                phaseInfo.status === "behind_schedule"
                  ? "bg-destructive/10 text-destructive"
                  : phaseInfo.status === "ahead_of_schedule"
                    ? "bg-success/10 text-success"
                    : "bg-primary/10 text-primary"
              }`}>
                {phaseInfo.status === "behind_schedule" ? "Tertinggal"
                  : phaseInfo.status === "ahead_of_schedule" ? "Di Depan"
                  : "On Track"}
              </span>
            </div>
            <p className="text-sm font-bold text-text-primary">
              Fase {phaseInfo.phase.phase_number}: {phaseInfo.phase.phase_name}
            </p>
            <p className="text-xs text-text-secondary">
              Usia {phaseInfo.phase.age_min}–{phaseInfo.phase.age_max} tahun
            </p>
            {phaseInfo.phase.big_win_title && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-text-secondary/50">🎯 Target Besar</p>
                <p className="text-sm text-text-primary mt-0.5">{phaseInfo.phase.big_win_title}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-primary">Aktivitas Hari Ini</p>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${activities.length > 0 ? (completedCount / activities.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {activities.map((activity) => (
            <DailyActivityCard
              key={activity.id}
              activity={activity}
              dimensionLabel={DIMENSION_LABELS[activity.dimension]?.label || activity.dimension}
              dimensionEmoji={DIMENSION_LABELS[activity.dimension]?.emoji || "📌"}
              onComplete={handleToggleComplete}
              onSaveNote={handleSaveNote}
              isExpanded={expandedIds.has(activity.id)}
              onToggleExpand={handleToggleExpand}
            />
          ))}
        </div>

        {/* Day-specific CTA */}
        {day < 3 && (
          <div className="bg-accent/5 rounded-2xl border border-accent/15 p-5 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <p className="text-sm font-semibold text-text-primary">
                {day === 2 ? "Kamu sudah 2 hari!" : "Daftar Gratis"}
              </p>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              {day === 2
                ? "Simpan progres 2 harimu dengan membuat akun gratis."
                : "Coba gratis 3 hari. Daftar untuk menyimpan progres-mu selamanya."}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => router.push(`/register?mimpi=${encodeURIComponent(benchmarkSlug || slug)}`)}
            >
              Daftar Sekarang <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </div>

      {/* Day 2 banner */}
      {day === 2 && !day2Dismissed && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-accent/10 border-b border-accent/20 px-5 py-3">
          <div className="max-w-content mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-accent shrink-0" />
              <p className="text-xs text-text-primary font-medium">
                Kamu sudah 2 hari! Simpan progresmu.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => router.push(`/register?mimpi=${encodeURIComponent(benchmarkSlug || slug)}`)}
                className="text-xs font-semibold text-accent underline whitespace-nowrap"
              >
                Daftar
              </button>
              <button onClick={() => setDay2Dismissed(true)} className="p-1 text-text-secondary hover:text-text-primary">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day 1 bottom sheet: triggered after 3rd activity completion */}
      {showRegisterSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowRegisterSheet(false)}>
          <div
            className="w-full max-w-content bg-surface rounded-t-xl p-6 pb-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto" />
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} className="text-accent" />
              </div>
              <p className="text-base font-bold text-text-primary">Perjalananmu berjalan dengan baik!</p>
              <p className="text-sm text-text-secondary mt-1">
                Daftar gratis untuk menyimpan progress-mu.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <Button variant="primary" size="lg" className="w-full" onClick={() => router.push(`/register?mimpi=${encodeURIComponent(benchmarkSlug || slug)}`)}>
                Daftar Sekarang
              </Button>
              <Button variant="secondary" size="lg" className="w-full" onClick={() => setShowRegisterSheet(false)}>
                Lanjutkan dulu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
