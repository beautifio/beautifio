import type {
  UserLifeProfile,
  LifeCapital,
  GrowthZone,
  LifeStage,
  PivotResult,
  GrowthZoneRecommendation,
  DailyWinSuggestion,
  GrowthWin,
  LifeLevelInfo,
} from "@beautifio/types";
import { STAGE_INFO, ZONE_INFO, SPIRITUAL_PRACTICES, DEFAULT_LIFE_CAPITAL } from "./life-engine-seed";
import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";

const STORAGE_KEY = "beautifio_life_profile";

/* ──────────────────────────────────────────
   USER PROFILE MANAGER
   ────────────────────────────────────────── */

function createDefaultProfile(): UserLifeProfile {
  const now = new Date().toISOString();
  return {
    currentStage: "smp",
    currentZone: "comfort",
    currentDreamSlug: null,
    previousDreams: [],
    lifeCapital: { ...DEFAULT_LIFE_CAPITAL },
    spiritualPreference: "other",
    growthWins: [],
    failureReflections: [],
    onboardingCompleted: false,
    updatedAt: now,
    capitalTrends: {
      knowledge: { weekly: 0, monthly: 0, history: [] },
      skill: { weekly: 0, monthly: 0, history: [] },
      health: { weekly: 0, monthly: 0, history: [] },
      relationship: { weekly: 0, monthly: 0, history: [] },
      character: { weekly: 0, monthly: 0, history: [] },
      spiritual: { weekly: 0, monthly: 0, history: [] },
    },
    missions: [],
    completedMissions: [],
    unlocks: [],
    resilienceScore: 0,
    failureRecoveryCount: 0,
    weeklyActivityLog: {},
  };
}

export function getLifeProfile(): UserLifeProfile {
  if (typeof window === "undefined") return createDefaultProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    return JSON.parse(raw) as UserLifeProfile;
  } catch {
    return createDefaultProfile();
  }
}

export function saveLifeProfile(profile: UserLifeProfile): void {
  if (typeof window === "undefined") return;
  profile.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function updateLifeProfile(updates: Partial<UserLifeProfile>): UserLifeProfile {
  const profile = getLifeProfile();
  const updated = { ...profile, ...updates, updatedAt: new Date().toISOString() };
  saveLifeProfile(updated);
  return updated;
}

/* ──────────────────────────────────────────
   GROWTH ZONE DETECTOR
   ────────────────────────────────────────── */

function clampCapital(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function detectGrowthZone(
  streak: number,
  completionRate7Day: number,
  hasRecentReflection: boolean,
  vaultItemCount: number,
): GrowthZone {
  if (streak >= 21 && completionRate7Day >= 0.8 && hasRecentReflection && vaultItemCount >= 5) {
    return "growth";
  }
  if (streak >= 7 && completionRate7Day >= 0.5 && vaultItemCount >= 2) {
    return "learning";
  }
  if (streak >= 1 || completionRate7Day > 0) {
    return "fear";
  }
  return "comfort";
}

export function updateZone(): GrowthZone {
  const streak = getRoadmapStreak();
  const completionRate = getRoadmapCompletionRate();
  const hasRecentReflection = getRecentReflectionStatus();
  const vaultItemCount = getTotalVaultItems();

  const zone = detectGrowthZone(streak, completionRate, hasRecentReflection, vaultItemCount);
  const profile = getLifeProfile();
  if (zone !== profile.currentZone) {
    updateLifeProfile({ currentZone: zone });
  }
  return zone;
}

/* ──────────────────────────────────────────
   DAILY WINS SUGGESTION ENGINE
   ────────────────────────────────────────── */

export function generateDailyWins(
  stage: LifeStage,
  zone: GrowthZone,
  dreamSlug: string | null,
): GrowthZoneRecommendation {
  const profile = getLifeProfile();
  const zoneInfo = ZONE_INFO[zone];

  const zoneTasks: Record<GrowthZone, string[]> = {
    comfort: [
      "Bangun 15 menit lebih awal",
      "Jalan kaki 5 menit di luar",
      "Baca 1 halaman buku",
      "Tulis 1 hal yang ingin kamu capai",
    ],
    fear: [
      "Lakukan 1 hal yang kamu tunda",
      "Lari 500 meter — semampumu",
      "Tulis 1 ketakutanmu hari ini",
      "Bilang 'ya' pada tantangan kecil",
    ],
    learning: [
      "Olahraga 20 menit",
      "Baca 10 halaman buku",
      "Praktik skill 30 menit",
      "Tulis refleksi belajar hari ini",
    ],
    growth: [
      "Latihan intensitas tinggi 30 menit",
      "Selesaikan 1 bab buku lanjutan",
      "Ajarkan 1 hal ke orang lain",
      "Tantang dirimu dengan level baru",
    ],
  };

  const dreamHabits = dreamSlug
    ? (ROADMAP_V3_SEED[dreamSlug]?.dailyWins ?? []).flatMap((c) =>
        c.habits.slice(0, 1).map((h) => h.title),
      )
    : [];

  const spirPractices = SPIRITUAL_PRACTICES[profile.spiritualPreference]?.examples ?? [
    "Refleksi diri 5 menit",
    "Tulis 3 hal syukur hari ini",
  ];

  const dailyWins: DailyWinSuggestion[] = [
    {
      category: "physical",
      emoji: "💪",
      tasks: dreamHabits.length >= 2 ? dreamHabits.slice(0, 2) : zoneTasks[zone].slice(0, 2),
    },
    {
      category: "mental",
      emoji: "🧠",
      tasks: zoneTasks[zone].slice(1, 3),
    },
    {
      category: "spiritual",
      emoji: "🕊️",
      tasks: spirPractices.slice(0, 2),
    },
    {
      category: "knowledge",
      emoji: "📚",
      tasks: dreamHabits.length > 2
        ? [dreamHabits[2]]
        : ["Baca 1 artikel tentang bidang impianmu"],
    },
    {
      category: "character",
      emoji: "⭐",
      tasks: ["Lakukan 1 kebaikan tanpa pamrih", "Evaluasi hari ini: apa yang bisa lebih baik?"],
    },
  ];

  const weeklyFocusByZone: Record<GrowthZone, string> = {
    comfort: "Ambil satu langkah kecil setiap hari",
    fear: "Hadapi satu ketakutan setiap hari",
    learning: "Konsisten dan catat progresmu",
    growth: "Tantang dirimu dengan level lebih tinggi",
  };

  return {
    zone,
    stage,
    dreamSlug,
    dailyWins,
    weeklyFocus: weeklyFocusByZone[zone],
    monthlyGoal: getMonthlyGoal(stage),
  };
}

function getMonthlyGoal(stage: LifeStage): string {
  const goals: Record<LifeStage, string> = {
    sd: "Coba 1 aktivitas baru yang menyenangkan",
    smp: "Temukan 1 bidang yang kamu minati",
    sma: "Dalami bidang pilihanmu",
    university: "Mulai bangun portofolio nyata",
    "early-career": "Kuasai satu skill utama di industrimu",
    professional: "Pimpin proyek atau tim",
    mastery: "Mentori 1 orang dan berbagi ilmu",
  };
  return goals[stage] || "Eksplorasi minat baru";
}

/* ──────────────────────────────────────────
   PIVOT ENGINE
   ────────────────────────────────────────── */

export function executePivot(newDreamSlug: string): PivotResult {
  const profile = getLifeProfile();
  const oldDreamSlug = profile.currentDreamSlug;

  if (!oldDreamSlug) {
    updateLifeProfile({ currentDreamSlug: newDreamSlug });
    return {
      oldDreamSlug: "(none)",
      newDreamSlug,
      preservedCapital: profile.lifeCapital,
      newPath: newDreamSlug,
      transferableSkills: ["Kedisiplinan", "Kemauan belajar", "Konsistensi"],
    };
  }

  const previousDreams = profile.previousDreams.includes(oldDreamSlug)
    ? profile.previousDreams
    : [...profile.previousDreams, oldDreamSlug];

  const newCapital: LifeCapital = {
    knowledge: clampCapital(profile.lifeCapital.knowledge + 10),
    skill: clampCapital(profile.lifeCapital.skill + 15),
    health: profile.lifeCapital.health,
    relationship: clampCapital(profile.lifeCapital.relationship + 5),
    character: clampCapital(profile.lifeCapital.character + 10),
    spiritual: clampCapital(profile.lifeCapital.spiritual + 5),
  };

  updateLifeProfile({
    currentDreamSlug: newDreamSlug,
    previousDreams,
    lifeCapital: newCapital,
  });

  return {
    oldDreamSlug,
    newDreamSlug,
    preservedCapital: newCapital,
    newPath: newDreamSlug,
    transferableSkills: getTransferableSkills(),
  };
}

function getTransferableSkills(): string[] {
  return [
    "Kedisiplinan dan konsistensi",
    "Kemampuan belajar mandiri",
    "Manajemen waktu",
    "Problem solving",
    "Komunikasi dan empati",
    "Adaptabilitas dan resiliensi",
  ];
}

export function getAllGrowthWins(): GrowthWin[] {
  return getLifeProfile().growthWins;
}

/* ──────────────────────────────────────────
   HELPERS (read from existing localStorage)
   ────────────────────────────────────────── */

function getRoadmapStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("beautifio_roadmap_dailywins_streak");
    return raw ? (JSON.parse(raw).currentStreak ?? 0) : 0;
  } catch {
    return 0;
  }
}

function getRoadmapCompletionRate(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("beautifio_roadmap_dailywins_streak");
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (!data?.last7Days) return 0;
    const done = data.last7Days.filter((d: boolean) => d).length;
    return done / 7;
  } catch {
    return 0;
  }
}

function getRecentReflectionStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem("beautifio_roadmap_reflections");
    if (!raw) return false;
    const refs = JSON.parse(raw);
    if (!Array.isArray(refs) || refs.length === 0) return false;
    const latest = new Date(refs[refs.length - 1].date);
    const now = new Date();
    const diffDays = (now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 3;
  } catch {
    return false;
  }
}

function getTotalVaultItems(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("beautifio_roadmap_vault");
    if (!raw) return 0;
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items.length : 0;
  } catch {
    return 0;
  }
}

/* ══════════════════════════════════════════
   PHASE 15.2 — LIFE CAPITAL ECONOMY
   ══════════════════════════════════════════ */

/* ──────────────────────────────────────────
   LIFE LEVEL SYSTEM
   ────────────────────────────────────────── */

export const LIFE_LEVELS: LifeLevelInfo[] = [
  { level: "seed", label: "Seed", emoji: "🌱", minCapital: 0, maxCapital: 99, description: "Kamu baru memulai perjalanan pertumbuhan. Setiap langkah kecil adalah awal dari sesuatu yang besar." },
  { level: "explorer", label: "Explorer", emoji: "🔍", minCapital: 100, maxCapital: 249, description: "Kamu mulai menjelajahi potensi dirimu. Rasa ingin tahu adalah kompas terbaik." },
  { level: "builder", label: "Builder", emoji: "🏗️", minCapital: 250, maxCapital: 399, description: "Kamu membangun fondasi kehidupan yang kuat. Konsistensi adalah superpower-mu." },
  { level: "achiever", label: "Achiever", emoji: "🏆", minCapital: 400, maxCapital: 549, description: "Kamu mencapai hal-hal yang berarti. Tapi ingat — ini bukan akhir, ini panggung berikutnya." },
  { level: "leader", label: "Leader", emoji: "👑", minCapital: 550, maxCapital: 699, description: "Kamu memimpin dengan contoh. Orang-orang di sekitarmu terinspirasi oleh perjalananmu." },
  { level: "mentor", label: "Mentor", emoji: "🌟", minCapital: 700, maxCapital: 849, description: "Sekarang giliranmu untuk membimbing. Wariskan apa yang telah kamu pelajari." },
  { level: "legacy", label: "Legacy", emoji: "💎", minCapital: 850, maxCapital: 600, description: "Kamu telah mencapai tingkat pertumbuhan yang langka. Hidupmu adalah legacy yang menginspirasi generasi." },
];

export function getLifeLevel(totalCapital: number): LifeLevelInfo {
  for (const l of LIFE_LEVELS) {
    if (totalCapital >= l.minCapital && totalCapital <= l.maxCapital) return l;
  }
  return LIFE_LEVELS[LIFE_LEVELS.length - 1];
}

export function getLifeLevelProgress(totalCapital: number): { current: LifeLevelInfo; next: LifeLevelInfo | null; progress: number } {
  const current = getLifeLevel(totalCapital);
  const idx = LIFE_LEVELS.indexOf(current);
  const next = idx < LIFE_LEVELS.length - 1 ? LIFE_LEVELS[idx + 1] : null;
  const range = next ? next.minCapital - current.minCapital : 1;
  const progress = next ? Math.min(100, Math.round(((totalCapital - current.minCapital) / range) * 100)) : 100;
  return { current, next, progress };
}

export function getStrongestCapital(): keyof LifeCapital {
  const capital = getLifeProfile().lifeCapital;
  return (Object.entries(capital) as [keyof LifeCapital, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

export function getWeakestCapital(): keyof LifeCapital {
  const capital = getLifeProfile().lifeCapital;
  return (Object.entries(capital) as [keyof LifeCapital, number][]).sort((a, b) => a[1] - b[1])[0][0];
}

export function getCapitalGap(): number {
  const capital = getLifeProfile().lifeCapital;
  const vals = Object.values(capital);
  return Math.max(...vals) - Math.min(...vals);
}

/* ──────────────────────────────────────────
   TREND CALCULATOR
   ────────────────────────────────────────── */

export function getCapitalOverview(): {
  total: number;
  average: number;
  level: LifeLevelInfo;
  levelProgress: number;
  nextLevel: LifeLevelInfo | null;
  trends: Record<keyof LifeCapital, { value: number; weekly: number; monthly: number }>;
  strongest: keyof LifeCapital;
  weakest: keyof LifeCapital;
  gap: number;
} {
  const profile = getLifeProfile();
  const capital = profile.lifeCapital;
  const total = Object.values(capital).reduce((a, b) => a + b, 0);
  const average = Math.round(total / 6);
  const { current, next, progress } = getLifeLevelProgress(total);

  const trends = {} as Record<keyof LifeCapital, { value: number; weekly: number; monthly: number }>;
  for (const key of Object.keys(capital) as (keyof LifeCapital)[]) {
    trends[key] = {
      value: capital[key],
      weekly: profile.capitalTrends[key]?.weekly ?? 0,
      monthly: profile.capitalTrends[key]?.monthly ?? 0,
    };
  }

  return {
    total,
    average,
    level: current,
    levelProgress: progress,
    nextLevel: next,
    trends,
    strongest: getStrongestCapital(),
    weakest: getWeakestCapital(),
    gap: getCapitalGap(),
  };
}
