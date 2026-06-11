import type {
  UserLifeProfile,
  LifeCapital,
  GrowthZone,
  LifeStage,
  SpiritualPreference,
  PivotResult,
  CapitalChange,
  GrowthZoneRecommendation,
  DailyWinSuggestion,
  GrowthWin,
  FailureReflection,
} from "@beautifio/types";
import { STAGE_INFO, ZONE_INFO, SPIRITUAL_PRACTICES, DEFAULT_LIFE_CAPITAL } from "./life-engine-seed";
import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";
import { getAlternativeFutures } from "./roadmap-life-pillars-seed";

const STORAGE_KEY = "beautifio_life_profile";

/* ──────────────────────────────────────────
   USER PROFILE MANAGER
   ────────────────────────────────────────── */

function createDefaultProfile(): UserLifeProfile {
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
    updatedAt: new Date().toISOString(),
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

export function isOnboardingComplete(): boolean {
  return getLifeProfile().onboardingCompleted;
}

export function completeOnboarding(
  stage: LifeStage,
  dreamSlug: string | null,
  zone: GrowthZone,
  spiritualPref: SpiritualPreference,
): UserLifeProfile {
  return updateLifeProfile({
    currentStage: stage,
    currentDreamSlug: dreamSlug,
    currentZone: zone,
    spiritualPreference: spiritualPref,
    onboardingCompleted: true,
  });
}

/* ──────────────────────────────────────────
   LIFE CAPITAL CALCULATOR
   ────────────────────────────────────────── */

function clampCapital(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

export function calculateCapitalChange(
  dailyHabitsDone: number,
  dailyHabitsTotal: number,
  streak: number,
  reflectionsThisWeek: number,
  vaultItemsAddedToday: number,
  masterclassReadToday: number,
): CapitalChange {
  const completionRate = dailyHabitsTotal > 0 ? dailyHabitsDone / dailyHabitsTotal : 0;
  const streakBonus = Math.min(streak, 30) / 30;
  const reflectionBonus = Math.min(reflectionsThisWeek, 7) / 7;
  const learningBonus = Math.min(vaultItemsAddedToday + masterclassReadToday, 3) / 3;

  const base = completionRate * 3 + streakBonus * 2 + reflectionBonus * 1 + learningBonus * 1;

  return {
    knowledge: Math.round(base * 1.5 + (masterclassReadToday > 0 ? 2 : 0)),
    skill: Math.round(base * 1.5 + (dailyHabitsDone > 0 ? 1 : 0)),
    health: Math.round(base * (completionRate > 0.5 ? 2 : 0.5)),
    relationship: Math.round(base * 0.5 + reflectionBonus * 2),
    character: Math.round(base + streakBonus * 3),
    spiritual: Math.round(reflectionBonus * 4 + (streak > 7 ? 2 : 0)),
  };
}

export function applyCapitalDecay(daysSinceLastUpdate: number): CapitalChange {
  if (daysSinceLastUpdate <= 1) {
    return { knowledge: 0, skill: 0, health: 0, relationship: 0, character: 0, spiritual: 0 };
  }
  const decay = Math.min(daysSinceLastUpdate - 1, 14);
  return {
    knowledge: -decay,
    skill: -decay,
    health: -Math.round(decay * 1.5),
    relationship: -decay,
    character: -Math.round(decay * 0.5),
    spiritual: -Math.round(decay * 0.5),
  };
}

export function applyCapitalChanges(changes: CapitalChange): LifeCapital {
  const profile = getLifeProfile();
  const capital = profile.lifeCapital;
  const newCapital: LifeCapital = {
    knowledge: clampCapital(capital.knowledge + changes.knowledge),
    skill: clampCapital(capital.skill + changes.skill),
    health: clampCapital(capital.health + changes.health),
    relationship: clampCapital(capital.relationship + changes.relationship),
    character: clampCapital(capital.character + changes.character),
    spiritual: clampCapital(capital.spiritual + changes.spiritual),
  };
  updateLifeProfile({ lifeCapital: newCapital });
  return newCapital;
}

/* ──────────────────────────────────────────
   GROWTH ZONE DETECTOR
   ────────────────────────────────────────── */

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

/* ──────────────────────────────────────────
   FAILURE RECOVERY
   ────────────────────────────────────────── */

export function recordFailure(milestoneTitle: string, dreamSlug: string): FailureReflection {
  const profile = getLifeProfile();

  const growthWin: GrowthWin = {
    id: `gw-${Date.now()}`,
    title: "Bangkit dari kegagalan",
    description: `Kamu gagal menyelesaikan "${milestoneTitle}" — dan itu tidak masalah. Kamu belajar sesuatu yang berharga.`,
    unlockedAt: new Date().toISOString(),
    category: "character",
  };

  const futures = getAlternativeFutures(dreamSlug);
  const pivotPaths = futures.length > 0
    ? futures.slice(0, 4).map((f) => f.title)
    : ["Pertimbangkan jalur lain yang masih terkait"];

  const failure: FailureReflection = {
    id: `fr-${Date.now()}`,
    dreamSlug,
    milestoneTitle,
    dateFailed: new Date().toISOString(),
    lessonsLearned: [
      "Kegagalan adalah data — kamu sekarang tahu apa yang belum berhasil",
      "Proses lebih penting dari hasil — kamu tetap bertumbuh",
      "Setiap 'tidak' membawamu lebih dekat ke 'ya' yang tepat",
      "Kamu lebih kuat dari yang kamu kira — buktinya kamu masih di sini",
    ],
    growthWinsUnlocked: [growthWin],
    pivotPaths,
  };

  updateLifeProfile({
    growthWins: [...profile.growthWins, growthWin],
    failureReflections: [...profile.failureReflections, failure],
    lifeCapital: {
      ...profile.lifeCapital,
      character: clampCapital(profile.lifeCapital.character + 5),
      knowledge: clampCapital(profile.lifeCapital.knowledge + 3),
    },
  });

  return failure;
}

/* ──────────────────────────────────────────
   GROWTH WIN SYSTEM
   ────────────────────────────────────────── */

export function unlockGrowthWin(title: string, description: string, category: keyof LifeCapital): GrowthWin {
  const profile = getLifeProfile();
  const win: GrowthWin = {
    id: `gw-${Date.now()}`,
    title,
    description,
    unlockedAt: new Date().toISOString(),
    category,
  };

  updateLifeProfile({
    growthWins: [...profile.growthWins, win],
    lifeCapital: {
      ...profile.lifeCapital,
      [category]: clampCapital(profile.lifeCapital[category] + 10),
    },
  });

  return win;
}

export function getAllGrowthWins(): GrowthWin[] {
  return getLifeProfile().growthWins;
}

/* ──────────────────────────────────────────
   STAGE PROGRESSION
   ────────────────────────────────────────── */

export function getStageProgression(currentStage: LifeStage): {
  previous: LifeStage | null;
  current: LifeStage;
  next: LifeStage | null;
} {
  const stages: LifeStage[] = ["sd", "smp", "sma", "university", "early-career", "professional", "mastery"];
  const idx = stages.indexOf(currentStage);
  return {
    previous: idx > 0 ? stages[idx - 1] : null,
    current: currentStage,
    next: idx < stages.length - 1 ? stages[idx + 1] : null,
  };
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
