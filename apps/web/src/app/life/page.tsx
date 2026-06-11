"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Heart, Target, Trophy, Sparkles, TrendingUp,
  RefreshCw, Quote, ChevronRight, Settings, Lock, Unlock,
  ArrowUp, ArrowDown, CheckCircle2, Flame, Eye, EyeOff,
  Smile, Frown, Meh,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import {
  getLifeProfile, isOnboardingComplete, updateZone,
  generateDailyWins, ZONE_INFO, STAGE_INFO,
  getAllGrowthWins, ROADMAP_V3_SEED,
  getLifeLevelProgress,
  getCapitalOverview, getCapitalBalanceTips,
  generateDailyMissions, completeMission,
  getAvailableUnlocks, CAPITAL_SOURCES,
  earnCapital, getDreamCompanionVoice,
  generateWeeklyReport,
} from "@beautifio/utils";
import type { LifeCapital, GrowthWin, CapitalMission, CapitalBalanceTip } from "@beautifio/types";

const CAPITAL_CONFIG: { key: keyof LifeCapital; label: string; emoji: string; color: string }[] = [
  { key: "knowledge", label: "Pengetahuan", emoji: "📚", color: "from-blue-500 to-blue-600" },
  { key: "skill", label: "Skill", emoji: "⚡", color: "from-amber-500 to-orange-500" },
  { key: "health", label: "Kesehatan", emoji: "💪", color: "from-green-500 to-emerald-600" },
  { key: "relationship", label: "Relasi", emoji: "👥", color: "from-pink-500 to-rose-500" },
  { key: "character", label: "Karakter", emoji: "⭐", color: "from-purple-500 to-violet-600" },
  { key: "spiritual", label: "Spiritual", emoji: "🕊️", color: "from-indigo-500 to-blue-600" },
];

const CELEBRATIONS = ["🎉 Hebat!", "🔥 Mantap!", "🌟 Keren!", "💪 Kuat!", "👏 Bagus!"];

function randomCelebration(): string {
  return CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Selamat Pagi";
  if (h < 17) return "Selamat Siang";
  return "Selamat Malam";
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStreakData(): { current: number; today: boolean; last7: boolean[] } {
  if (typeof window === "undefined") return { current: 0, today: false, last7: [] };
  try {
    const raw = localStorage.getItem("beautifio_roadmap_dailywins_streak");
    if (!raw) return { current: 0, today: false, last7: [] };
    const data = JSON.parse(raw);
    return {
      current: data.currentStreak ?? 0,
      today: data.last7?.[data.last7.length - 1] ?? false,
      last7: data.last7 ?? [],
    };
  } catch {
    return { current: 0, today: false, last7: [] };
  }
}

function detectStruggle(): { struggling: boolean; daysInactive: number } {
  if (typeof window === "undefined") return { struggling: false, daysInactive: 0 };
  const streak = getStreakData();
  if (streak.current === 0 && streak.last7.every((d) => !d) && streak.last7.length > 0) {
    return { struggling: true, daysInactive: streak.last7.length };
  }
  return { struggling: false, daysInactive: 0 };
}

function getTodayActions(dreamSlug: string | null, stage: string, zone: string): { emoji: string; text: string }[] {
  const dreamActions: Record<string, string[]> = {
    "football-player": ["Latihan passing 20 menit", "Minum 2 liter air", "Tonton 1 video analisis pertandingan"],
    doctor: ["Pelajari 1 topik biologi", "Kerjakan 10 soal", "Tidur sebelum jam 22.00"],
    entrepreneur: ["Baca 1 artikel bisnis", "Catat 1 ide usaha", "Hubungi 1 orang baru"],
    programmer: ["Kerjakan 1 tantangan coding", "Baca dokumentasi 15 menit", "Bangun 1 fitur kecil"],
    musician: ["Latihan instrument 20 menit", "Dengar 1 lagu baru, analisis strukturnya", "Rekam progres latihan"],
    "content-creator": ["Riset 1 ide konten", "Buat draft konten", "Interaksi dengan 1 kreator lain"],
    "digital-marketer": ["Analisis 1 kampanye", "Pelajari 1 tools marketing baru", "Buat konten promosi"],
    runner: ["Lari 2km", "Stretching 10 menit", "Catat waktu lari"],
    athlete: ["Latihan fisik 30 menit", "Minum cukup & istirahat", "Review target mingguan"],
    "beauty-creator": ["Praktik 1 teknik makeup/skincare", "Foto hasil karya", "Riset tren terbaru"],
    golfer: ["Latihan ayunan 20 menit", "Pelajari 1 teknik baru", "Rekam progres swing"],
  };
  const stageActions: Record<string, string[]> = {
    sd: ["Baca buku 15 menit", "Bantu orang tua", "Main di luar 30 menit"],
    smp: ["Belajar mapel favorit", "Baca artikel inspiratif", "Catat 1 hal yang dipelajari"],
    sma: ["Kerjakan soal latihan", "Diskusi dengan teman", "Review catatan hari ini"],
    university: ["Kerjakan tugas kuliah", "Baca jurnal/artikel", "Networking dengan teman"],
    "early-career": ["Kembangkan 1 skill kerja", "Update portfolio/CV", "Belajar dari rekan kerja"],
    professional: ["Selesaikan 1 prioritas kerja", "Mentoring junior", "Baca tren industri"],
    mastery: ["Bagikan 1 insight ke orang lain", "Eksplorasi ide baru", "Refleksi perjalanan karir"],
  };
  const zoneActions: Record<string, string[]> = {
    comfort: ["Coba 1 hal baru hari ini", "Jalan kaki 5 menit", "Tulis 1 target kecil"],
    fear: ["Lakukan 1 hal yang ditunda", "Bilang afirmasi positif", "Ajak teman diskusi"],
    learning: ["Praktik skill 20 menit", "Catat progres belajar", "Rayakan 1 kemenangan kecil"],
    growth: ["Ajarkan ke orang lain", "Tantang diri dengan level baru", "Review pencapaian minggu ini"],
  };

  const actions: { emoji: string; text: string }[] = [];

  if (dreamSlug && dreamActions[dreamSlug]) {
    actions.push({ emoji: "⭐", text: dreamActions[dreamSlug][0] });
    actions.push({ emoji: "🔥", text: dreamActions[dreamSlug][1] });
    actions.push({ emoji: "💪", text: dreamActions[dreamSlug][2] });
  } else {
    const zoneAct = zoneActions[zone] ?? ["Coba 1 hal baru hari ini", "Catat progres", "Refleksi sebentar"];
    actions.push({ emoji: "🎯", text: zoneAct[0] });
    actions.push({ emoji: "📝", text: zoneAct[1] });
    actions.push({ emoji: "🌟", text: zoneAct[2] });
  }

  return actions;
}

export const dynamic = "force-dynamic";

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span className={`flex items-center gap-0.5 text-[9px] font-bold ${value > 0 ? "text-success" : "text-destructive"}`}>
      {value > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(value)}
    </span>
  );
}

function LifeLevelCard({ total }: { total: number }) {
  const { current, next, progress } = getLifeLevelProgress(total);
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{current.emoji}</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Perjalanan Hidupku</p>
          <h2 className="text-lg font-bold text-text-primary">{current.label}</h2>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-primary">{total}</p>
          <p className="text-[9px] text-text-secondary">poin total</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">{current.emoji}</span>
        <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        {next && <span className="text-xs text-text-secondary">{next.emoji}</span>}
      </div>
      {next && (
        <p className="text-[10px] text-text-secondary mt-1.5 text-center">
          {progress}% menuju {next.label} ({next.minCapital - total} poin lagi)
        </p>
      )}
      <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">{current.description}</p>
    </div>
  );
}

function CapitalBarSimple({ value, weekly, label, emoji, color }: {
  value: number; weekly: number; label: string; emoji: string; color: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{emoji}</span>
          <span className="text-[11px] font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendBadge value={weekly} />
          <span className="text-xs font-bold text-text-primary">{value}</span>
        </div>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MissionCard({ mission, onComplete }: { mission: CapitalMission; onComplete: (id: string) => void }) {
  const [celebrate, setCelebrate] = useState(false);
  const [celebrationText, setCelebrationText] = useState("");

  const handleComplete = () => {
    const text = randomCelebration();
    setCelebrationText(text);
    setCelebrate(true);
    onComplete(mission.id);
    setTimeout(() => setCelebrate(false), 2000);
  };

  return (
    <div className={`p-3 rounded-xl border transition-all ${mission.status === "completed" ? "border-success/30 bg-success/5" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{mission.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${mission.status === "completed" ? "text-success line-through" : "text-text-primary"}`}>
            {mission.title}
          </p>
          <p className="text-[10px] text-text-secondary">{mission.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {mission.status === "active" && (
            <button onClick={handleComplete}
              className="w-7 h-7 rounded-lg bg-accent/10 hover:bg-accent/20 flex items-center justify-center cursor-pointer transition-colors"
            >
              <CheckCircle2 size={14} className="text-accent" />
            </button>
          )}
          {mission.status === "completed" && <CheckCircle2 size={14} className="text-success" />}
        </div>
      </div>
      {celebrate && (
        <div className="mt-2 text-xs font-bold text-success animate-bounce">
          {celebrationText} Kamu meningkatkan {mission.capitalKey === "knowledge" ? "Pengetahuan" : mission.capitalKey === "skill" ? "Skill" : mission.capitalKey === "health" ? "Kesehatan" : mission.capitalKey === "relationship" ? "Relasi" : mission.capitalKey === "character" ? "Karakter" : "Spiritual"} +{mission.points}
        </div>
      )}
    </div>
  );
}

function BalanceCard({ tips, strongest, weakest }: {
  tips: CapitalBalanceTip[]; strongest: string; weakest: string;
}) {
  const strongCfg = CAPITAL_CONFIG.find((c) => c.key === strongest);
  const weakCfg = CAPITAL_CONFIG.find((c) => c.key === weakest);
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50/80 to-rose-50/80 dark:from-amber-900/10 dark:to-rose-900/10 border border-amber-200/50">
      <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-amber-600" />
        Area yang Perlu Diperkuat
      </h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5">
          <p className="text-[9px] text-text-secondary">Terkuat</p>
          <p className="text-xs font-bold text-text-primary">{strongCfg?.emoji} {strongCfg?.label}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5">
          <p className="text-[9px] text-text-secondary">Perlu Ditingkatkan</p>
          <p className="text-xs font-bold text-text-primary">{weakCfg?.emoji} {weakCfg?.label}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {tips.slice(0, 2).map((tip) => (
          <div key={tip.capitalKey} className="flex items-start gap-2 p-2 rounded-lg bg-white/40 dark:bg-white/5">
            <span className="text-base">{tip.emoji}</span>
            <div>
              <p className="text-[10px] font-semibold text-text-primary capitalize">{tip.label}: {tip.value}</p>
              <p className="text-[9px] text-text-secondary">{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION 5 — Emotional Weekly Summary
   ══════════════════════════════════════════ */

function WeeklySummary() {
  const report = useMemo(() => generateWeeklyReport(), []);

  if (!report) {
    return (
      <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200/50">
        <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-purple-500" />
          Catatan Minggu Ini
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          "Minggu ini kamu tidak menyerah. Kamu tetap berjalan meskipun progresmu kecil. Itulah cara mimpi besar dibangun."
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200/50">
      <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-purple-500" />
        Catatan Minggu Ini
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed mb-3 italic">
        "{report.summary}"
      </p>
      <div className="space-y-2">
        {report.wins.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-success flex items-center gap-1">
              <span>🏆</span> Kemenangan
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {report.wins.slice(0, 3).map((w, i) => (
                <Badge key={i} variant="success" className="text-[9px]">
                  {w.emoji} {w.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {report.challenges.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-amber-600 flex items-center gap-1">
              <span>💡</span> Pelajaran
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {report.challenges.slice(0, 2).map((c, i) => (
                <Badge key={i} variant="warning" className="text-[9px]">
                  {c.emoji} {c.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-3 p-2.5 rounded-lg bg-white/40 dark:bg-white/5">
        <p className="text-[10px] font-semibold text-text-primary">Fokus Minggu Depan</p>
        <p className="text-[10px] text-text-secondary mt-0.5">
          {report.suggestedImprovements[0] ?? "Teruslah melangkah, satu langkah setiap hari."}
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   SECTION 6 — Struggle Detection
   ══════════════════════════════════════════ */

function StruggleBanner({ zone }: { zone: string }) {
  const struggle = useMemo(() => detectStruggle(), []);

  if (!struggle.struggling) return null;

  const easyActions: Record<string, { emoji: string; text: string }> = {
    comfort: { emoji: "🪴", text: "Buka jendela, hirup udara segar 1 menit" },
    fear: { emoji: "📝", text: "Tulis 1 hal kecil yang kamu syukuri hari ini" },
    learning: { emoji: "📖", text: "Baca 1 paragraf dari buku atau artikel" },
    growth: { emoji: "👋", text: "Kirim pesan ke 1 teman, 'Hai, apa kabar?'" },
  };

  const action = easyActions[zone] ?? { emoji: "☕", text: "Minum air putih, istirahat 5 menit" };

  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-rose-50/80 to-amber-50/80 dark:from-rose-900/10 dark:to-amber-900/10 border border-rose-200/50">
      <p className="text-sm font-semibold text-text-primary mb-1">Tidak apa-apa.</p>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">
        Setiap orang pernah berhenti sejenak. Yang penting bukan seberapa cepat kamu berjalan, tetapi apakah kamu mau melanjutkan perjalanan.
      </p>
      <div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-border">
        <p className="text-[10px] font-semibold text-text-primary">Coba ini dulu:</p>
        <p className="text-[11px] text-text-secondary mt-0.5">{action.emoji} {action.text}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════ */

export default function LifeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const profile = useMemo(() => getLifeProfile(), []);
  const [zone, setZone] = useState(profile.currentZone);
  const [overview, setOverview] = useState(() => getCapitalOverview());
  const [balanceTips, setBalanceTips] = useState(() => getCapitalBalanceTips());
  const [missions, setMissions] = useState<CapitalMission[]>([]);
  const [unlocks] = useState(() => getAvailableUnlocks());
  const [showDetail, setShowDetail] = useState(false);
  const [mood, setMood] = useState<"good" | "okay" | "tough" | null>(null);
  const growthWins = useMemo(() => getAllGrowthWins(), []);
  const streak = useMemo(() => getStreakData(), []);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace("/life/start");
      return;
    }
    const currentZone = updateZone();
    setZone(currentZone);
    setOverview(getCapitalOverview());
    setBalanceTips(getCapitalBalanceTips());
    setMissions(generateDailyMissions());
  }, []);

  const dreamTitle = profile.currentDreamSlug
    ? ROADMAP_V3_SEED[profile.currentDreamSlug]?.title ?? profile.currentDreamSlug
    : null;

  const companionVoice = useMemo(() => getDreamCompanionVoice(profile.currentDreamSlug), [profile.currentDreamSlug]);
  const todayActions = useMemo(() => getTodayActions(profile.currentDreamSlug, profile.currentStage, zone), [profile.currentDreamSlug, profile.currentStage, zone]);

  const refreshAll = useCallback(() => {
    setOverview(getCapitalOverview());
    setBalanceTips(getCapitalBalanceTips());
    setMissions(generateDailyMissions());
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-5">

        {/* ════════════════════════════════════
           SECTION 2 — Hero Section
           ════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                {getGreeting()} 👋
              </h1>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                {companionVoice}
              </p>
            </div>
            <button onClick={() => router.push("/life/start")}
              className="p-2 rounded-xl bg-muted hover:bg-muted/70 transition-all cursor-pointer flex-shrink-0"
              title="Pengaturan"
            >
              <Settings size={16} className="text-text-secondary" />
            </button>
          </div>

          {dreamTitle && (
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-xs text-text-secondary">
                Hari ini kamu selangkah lebih dekat menjadi{" "}
                <span className="font-bold text-accent">{dreamTitle}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
              <p className="text-lg font-bold text-primary">{streak.current}</p>
              <p className="text-[9px] text-text-secondary">🔥 Streak</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-center">
              <p className="text-lg font-bold text-accent">{overview.average}%</p>
              <p className="text-[9px] text-text-secondary">📊 Progres</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 text-center">
              <p className="text-lg font-bold text-amber-600">
                {streak.today ? "✅" : "⭕"}
              </p>
              <p className="text-[9px] text-text-secondary">Hari Ini</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <p className="text-[10px] text-text-secondary">Apa kabar hari ini?</p>
            <button onClick={() => setMood("good")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${mood === "good" ? "bg-success/20 scale-110" : "hover:bg-muted"}`}
            >
              <Smile size={18} className={mood === "good" ? "text-success" : "text-text-secondary/50"} />
            </button>
            <button onClick={() => setMood("okay")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${mood === "okay" ? "bg-amber-100 scale-110" : "hover:bg-muted"}`}
            >
              <Meh size={18} className={mood === "okay" ? "text-amber-500" : "text-text-secondary/50"} />
            </button>
            <button onClick={() => setMood("tough")}
              className={`p-2 rounded-lg transition-all cursor-pointer ${mood === "tough" ? "bg-rose-100 scale-110" : "hover:bg-muted"}`}
            >
              <Frown size={18} className={mood === "tough" ? "text-rose-500" : "text-text-secondary/50"} />
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════
           SECTION 6 — Struggle Banner
           ════════════════════════════════════ */}
        <StruggleBanner zone={zone} />

        {/* ════════════════════════════════════
           SECTION 3 — Today's Actions
           ════════════════════════════════════ */}
        <div>
          <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <span>🎯</span> 3 Hal Penting Hari Ini
          </h2>
          <div className="space-y-2">
            {todayActions.map((action, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                <span className="text-lg">{action.emoji}</span>
                <p className="text-xs font-medium text-text-primary">{action.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════
           SECTION 4 — Micro Celebration Zone
           ════════════════════════════════════ */}
        {missions.some((m) => m.status === "completed") && (
          <div className="rounded-2xl p-4 bg-gradient-to-r from-success/10 to-accent/10 border border-success/20 text-center">
            <p className="text-lg">🎉</p>
            <p className="text-sm font-bold text-success">Hebat!</p>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Kamu menyelesaikan {missions.filter((m) => m.status === "completed").length} misi hari ini. Terus berger maju!
            </p>
          </div>
        )}

        {/* ════════════════════════════════════
           Kondisiku Saat Ini — Zone Card
           ════════════════════════════════════ */}
        <ZoneCard zone={zone} />

        {/* ════════════════════════════════════
           SECTION 5 — Emotional Weekly Summary
           ════════════════════════════════════ */}
        <WeeklySummary />

        {/* ════════════════════════════════════
           Perkembangan Diriku — Simple Capitals
           ════════════════════════════════════ */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                <CardTitle>Perkembangan Diriku</CardTitle>
              </div>
              {!showDetail && (
                <button onClick={() => setShowDetail(true)}
                  className="text-[10px] font-semibold text-accent hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Eye size={12} /> Lihat Detail
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {CAPITAL_CONFIG.slice(0, showDetail ? 6 : 3).map((cfg) => (
              <CapitalBarSimple
                key={cfg.key}
                value={overview.trends[cfg.key].value}
                weekly={overview.trends[cfg.key].weekly}
                label={cfg.label}
                emoji={cfg.emoji}
                color={cfg.color}
              />
            ))}
            {showDetail && (
              <button onClick={() => setShowDetail(false)}
                className="w-full text-center text-[10px] font-semibold text-text-secondary hover:text-text-primary cursor-pointer pt-2 flex items-center justify-center gap-1"
              >
                <EyeOff size={12} /> Sembunyikan Detail
              </button>
            )}
          </CardContent>
        </Card>

        {/* Area yang Perlu Diperkuat */}
        <BalanceCard tips={balanceTips} strongest={overview.strongest} weakest={overview.weakest} />

        {/* ════════════════════════════════════
           Misi Minggu Ini
           ════════════════════════════════════ */}
        <div id="missions">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Target size={14} className="text-accent" />
              Misi Minggu Ini
            </h3>
            <Badge variant="accent" className="text-[9px]">{missions.filter((m) => m.status === "active").length} aktif</Badge>
          </div>
          <div className="space-y-2">
            {missions.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-4">Belum ada misi. Mulai aktivitas untuk mendapatkan misi!</p>
            ) : (
              missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onComplete={(id) => {
                    completeMission(id);
                    setMissions(generateDailyMissions());
                    setOverview(getCapitalOverview());
                    setBalanceTips(getCapitalBalanceTips());
                  }}
                />
              ))
            )}
          </div>
        </div>

        {/* ════════════════════════════════════
           Kemenangan Kecilku
           ════════════════════════════════════ */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-success" />
              <CardTitle>Kemenangan Kecilku</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <GrowthWinsList wins={growthWins} />
          </CardContent>
        </Card>

        {/* Langkah Berikutnya — Dream section */}
        {dreamTitle && (
          <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Langkah Berikutnya</p>
                <p className="text-sm font-bold text-text-primary truncate">{dreamTitle}</p>
              </div>
              <button onClick={() => router.push(`/roadmap/${profile.currentDreamSlug}`)}
                className="text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                Buka
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        <button onClick={() => router.push("/life/start")}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Konfigurasi</p>
              <p className="text-[10px] text-text-secondary">Ubah tahap hidup, zona, atau preferensi</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-secondary/30" />
        </button>
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}

/* ─── Sub-components ─── */

function ZoneCard({ zone }: { zone: string }) {
  const info = ZONE_INFO[zone];
  if (!info) return null;
  return (
    <div className={`rounded-2xl p-5 border ${
      zone === "comfort" ? "bg-blue-50/50 border-blue-100" :
      zone === "fear" ? "bg-amber-50/50 border-amber-100" :
      zone === "learning" ? "bg-green-50/50 border-green-100" :
      "bg-purple-50/50 border-purple-100"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{info.emoji}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Kondisiku Saat Ini</p>
          <h2 className="text-lg font-bold text-text-primary">{info.friendlyLabel}</h2>
          <p className="text-[10px] text-text-secondary/60">({info.label})</p>
        </div>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{info.friendlyDescription}</p>
      <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-white/60 dark:bg-white/5">
        <Quote size={14} className="text-text-secondary/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed italic">{info.encouragement}</p>
      </div>
    </div>
  );
}

function GrowthWinsList({ wins }: { wins: GrowthWin[] }) {
  const categoryEmoji: Record<string, string> = {
    knowledge: "📚", skill: "⚡", health: "💪",
    relationship: "👥", character: "⭐", spiritual: "🕊️",
  };
  return (
    <div className="space-y-2">
      {wins.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
          <Sparkles size={20} className="mx-auto text-text-secondary/30 mb-2" />
          <p className="text-xs text-text-secondary">Kemenangan kecil akan muncul saat kamu melewati tantangan. Setiap langkah berarti!</p>
        </div>
      ) : (
        wins.slice(0, 5).map((win) => (
          <div key={win.id} className="flex items-start gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Trophy size={14} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">{win.title}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{win.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="text-[8px]">
                  {categoryEmoji[win.category] || "🏆"} {win.category}
                </Badge>
                <span className="text-[9px] text-text-secondary">
                  {new Date(win.unlockedAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}