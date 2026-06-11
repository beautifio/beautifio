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
  CapitalSourceType,
  CapitalSource,
  CapitalMission,
  CapitalMissionStatus,
  CapitalBalanceTip,
  CapitalTrend,
  LifeLevelInfo,
  UnlockRequirement,
  UnlockableFeature,
} from "@beautifio/types";
import { STAGE_INFO, ZONE_INFO, SPIRITUAL_PRACTICES, DEFAULT_LIFE_CAPITAL } from "./life-engine-seed";
import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";
import { getAlternativeFutures } from "./roadmap-life-pillars-seed";

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

/* ──────────────────────────────────────────
   CAPITAL SOURCES
   ────────────────────────────────────────── */

export const CAPITAL_SOURCES: CapitalSource[] = [
  { source: "read_story", label: "Baca cerita", emoji: "📖", capitalKey: "knowledge", points: 2 },
  { source: "complete_lesson", label: "Selesaikan pelajaran roadmap", emoji: "✅", capitalKey: "knowledge", points: 3 },
  { source: "vault_add", label: "Simpan ke Learning Vault", emoji: "📦", capitalKey: "knowledge", points: 1 },
  { source: "masterclass_read", label: "Baca masterclass", emoji: "🎓", capitalKey: "knowledge", points: 4 },
  { source: "write_reflection", label: "Tulis refleksi", emoji: "✍️", capitalKey: "knowledge", points: 2 },
  { source: "daily_win_complete", label: "Selesaikan Daily Win", emoji: "☀️", capitalKey: "skill", points: 2 },
  { source: "small_win_complete", label: "Capai Small Win", emoji: "⚡", capitalKey: "skill", points: 4 },
  { source: "milestone_achieve", label: "Capai milestone", emoji: "🏁", capitalKey: "skill", points: 6 },
  { source: "practice_log", label: "Catat praktik", emoji: "📝", capitalKey: "skill", points: 2 },
  { source: "physical_activity", label: "Aktivitas fisik", emoji: "🏃", capitalKey: "health", points: 3 },
  { source: "recovery_habit", label: "Kebiasaan pemulihan", emoji: "🛌", capitalKey: "health", points: 2 },
  { source: "sleep_track", label: "Lacak tidur", emoji: "😴", capitalKey: "health", points: 2 },
  { source: "healthy_routine", label: "Rutinitas sehat", emoji: "🥗", capitalKey: "health", points: 2 },
  { source: "circle_participate", label: "Partisipasi circle", emoji: "👥", capitalKey: "relationship", points: 3 },
  { source: "circle_help", label: "Bantu anggota circle", emoji: "🤝", capitalKey: "relationship", points: 4 },
  { source: "mentor_interact", label: "Interaksi mentor", emoji: "🎯", capitalKey: "relationship", points: 3 },
  { source: "event_attend", label: "Hadiri event", emoji: "📅", capitalKey: "relationship", points: 3 },
  { source: "streak_milestone", label: "Capai streak", emoji: "🔥", capitalKey: "character", points: 3 },
  { source: "difficult_goal", label: "Selesaikan goal sulit", emoji: "🎯", capitalKey: "character", points: 5 },
  { source: "return_after_failure", label: "Kembali setelah gagal", emoji: "💪", capitalKey: "character", points: 6 },
  { source: "help_others", label: "Bantu orang lain", emoji: "❤️", capitalKey: "character", points: 3 },
  { source: "gratitude_journal", label: "Jurnal syukur", emoji: "🙏", capitalKey: "spiritual", points: 3 },
  { source: "purpose_exercise", label: "Latihan purpose", emoji: "🎯", capitalKey: "spiritual", points: 3 },
  { source: "faith_practice", label: "Praktik keyakinan", emoji: "🕊️", capitalKey: "spiritual", points: 2 },
  { source: "consistency", label: "Konsistensi harian", emoji: "📊", capitalKey: "character", points: 2 },
];

export function earnCapital(sourceType: CapitalSourceType): LifeCapital {
  const source = CAPITAL_SOURCES.find((s) => s.source === sourceType);
  if (!source) return { knowledge: 0, skill: 0, health: 0, relationship: 0, character: 0, spiritual: 0 };

  const profile = getLifeProfile();
  const capital = profile.lifeCapital;
  const change: CapitalChange = { knowledge: 0, skill: 0, health: 0, relationship: 0, character: 0, spiritual: 0 };
  change[source.capitalKey] = source.points;

  const newCapital: LifeCapital = {
    knowledge: clampCapital(capital.knowledge + change.knowledge),
    skill: clampCapital(capital.skill + change.skill),
    health: clampCapital(capital.health + change.health),
    relationship: clampCapital(capital.relationship + change.relationship),
    character: clampCapital(capital.character + change.character),
    spiritual: clampCapital(capital.spiritual + change.spiritual),
  };

  const trends = { ...profile.capitalTrends };
  const sourceKey = sourceType;
  const today = new Date().toISOString().slice(0, 10);
  const log = { ...profile.weeklyActivityLog };
  log[`${today}_${sourceKey}`] = (log[`${today}_${sourceKey}`] || 0) + 1;

  for (const key of Object.keys(newCapital) as (keyof LifeCapital)[]) {
    const oldVal = capital[key];
    const diff = newCapital[key] - oldVal;
    if (diff !== 0) {
      trends[key] = {
        weekly: trends[key].weekly + diff,
        monthly: trends[key].monthly + diff,
        history: [...trends[key].history.slice(-89), diff],
      };
    }
  }

  unlockLifeCapital(newCapital);

  updateLifeProfile({ lifeCapital: newCapital, capitalTrends: trends, weeklyActivityLog: log });
  return newCapital;
}

export function earnMultipleCapital(sources: CapitalSourceType[]): LifeCapital {
  let total: CapitalChange = { knowledge: 0, skill: 0, health: 0, relationship: 0, character: 0, spiritual: 0 };
  for (const s of sources) {
    const src = CAPITAL_SOURCES.find((cs) => cs.source === s);
    if (src) total[src.capitalKey] += src.points;
  }
  const profile = getLifeProfile();
  const newCapital: LifeCapital = {
    knowledge: clampCapital(profile.lifeCapital.knowledge + total.knowledge),
    skill: clampCapital(profile.lifeCapital.skill + total.skill),
    health: clampCapital(profile.lifeCapital.health + total.health),
    relationship: clampCapital(profile.lifeCapital.relationship + total.relationship),
    character: clampCapital(profile.lifeCapital.character + total.character),
    spiritual: clampCapital(profile.lifeCapital.spiritual + total.spiritual),
  };

  const trends = { ...profile.capitalTrends };
  for (const key of Object.keys(newCapital) as (keyof LifeCapital)[]) {
    const diff = newCapital[key] - profile.lifeCapital[key];
    if (diff !== 0) {
      trends[key] = {
        weekly: trends[key].weekly + diff,
        monthly: trends[key].monthly + diff,
        history: [...trends[key].history.slice(-89), diff],
      };
    }
  }

  unlockLifeCapital(newCapital);
  updateLifeProfile({ lifeCapital: newCapital, capitalTrends: trends });
  return newCapital;
}

/* ──────────────────────────────────────────
   BALANCE ENGINE
   ────────────────────────────────────────── */

export function getCapitalBalanceTips(): CapitalBalanceTip[] {
  const profile = getLifeProfile();
  const capital = profile.lifeCapital;

  const sorted = (Object.entries(capital) as [keyof LifeCapital, number][])
    .sort((a, b) => a[1] - b[1]);

  const tips: Record<keyof LifeCapital, { tip: string; missionTitle: string }> = {
    knowledge: { tip: "Baca cerita atau artikel baru hari ini.", missionTitle: "Baca 3 artikel dalam seminggu" },
    skill: { tip: "Praktik skill selama 20 menit setiap hari.", missionTitle: "Praktik skill 5 hari berturut-turut" },
    health: { tip: "Fokus pada aktivitas fisik dan istirahat cukup.", missionTitle: "Olahraga 30 menit selama 5 hari" },
    relationship: { tip: "Luangkan waktu untuk terhubung dengan orang lain.", missionTitle: "Bantu 1 anggota circle minggu ini" },
    character: { tip: "Konsistensi adalah kunci. Jangan lewatkan streak.", missionTitle: "Pertahankan streak selama 7 hari" },
    spiritual: { tip: "Luangkan waktu untuk refleksi dan bersyukur.", missionTitle: "Tulis jurnal syukur setiap hari selama 5 hari" },
  };

  return sorted.map(([key, value]) => ({
    capitalKey: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    emoji: CAPITAL_SOURCES.find((s) => s.capitalKey === key)?.emoji ?? "📊",
    value,
    tip: tips[key].tip,
    missionTitle: tips[key].missionTitle,
  }));
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
   CAPITAL MISSIONS
   ────────────────────────────────────────── */

export function generateDailyMissions(): CapitalMission[] {
  const profile = getLifeProfile();
  const balanceTips = getCapitalBalanceTips();
  const weakest = balanceTips[0];

  const missions: CapitalMission[] = [];
  const now = new Date().toISOString();

  missions.push({
    id: `cap-mission-${Date.now()}-1`,
    capitalKey: weakest.capitalKey,
    title: `Tingkatkan ${weakest.label}`,
    description: weakest.missionTitle,
    emoji: weakest.emoji,
    points: 5,
    progress: 0,
    target: 100,
    status: "active",
    createdAt: now,
  });

  if (profile.currentDreamSlug) {
    missions.push({
      id: `cap-mission-${Date.now()}-2`,
      capitalKey: "skill",
      title: "Progress Dream",
      description: `Selesaikan 1 daily habit untuk ${profile.currentDreamSlug}`,
      emoji: "🎯",
      points: 3,
      progress: 0,
      target: 100,
      status: "active",
      createdAt: now,
    });
  }

  const allCaps: [keyof LifeCapital, string, string][] = [
    ["knowledge", "Baca & Simpan", "Baca 1 cerita dan simpan 1 catatan ke vault"],
    ["relationship", "Sosial", "Interaksi dengan 1 circle atau mentor"],
    ["spiritual", "Refleksi", "Tulis jurnal syukur atau praktik spiritual"],
    ["health", "Sehat", "Lakukan 1 aktivitas fisik"],
    ["character", "Konsisten", "Selesaikan streak hari ini"],
  ];

  for (const [key, title, desc] of allCaps) {
    if (!missions.some((m) => m.capitalKey === key)) {
      missions.push({
        id: `cap-mission-${Date.now()}-${key}`,
        capitalKey: key,
        title,
        description: desc,
        emoji: CAPITAL_SOURCES.find((s) => s.capitalKey === key)?.emoji ?? "📊",
        points: 2,
        progress: 0,
        target: 100,
        status: "active",
        createdAt: now,
      });
    }
  }

  return missions.slice(0, 4);
}

export function completeMission(missionId: string): void {
  const profile = getLifeProfile();
  const mission = profile.missions.find((m) => m.id === missionId);
  if (!mission) return;

  const updatedMissions = profile.missions.map((m) =>
    m.id === missionId ? { ...m, status: "completed" as CapitalMissionStatus, completedAt: new Date().toISOString(), progress: 100 } : m,
  );

  const completedMissions = [...profile.completedMissions, missionId];

  earnCapital(getCapitalKeyForMission(mission.capitalKey));

  updateLifeProfile({
    missions: updatedMissions,
    completedMissions,
  });
}

function getCapitalKeyForMission(capitalKey: keyof LifeCapital): CapitalSourceType {
  const map: Record<keyof LifeCapital, CapitalSourceType> = {
    knowledge: "read_story",
    skill: "daily_win_complete",
    health: "physical_activity",
    relationship: "circle_participate",
    character: "consistency",
    spiritual: "gratitude_journal",
  };
  return map[capitalKey];
}

/* ──────────────────────────────────────────
   UNLOCK SYSTEM
   ────────────────────────────────────────── */

export const UNLOCK_REQUIREMENTS: UnlockRequirement[] = [
  { feature: "advanced_roadmaps", label: "Advanced Roadmaps", description: "Akses roadmap tingkat lanjut", emoji: "🗺️", requirements: { knowledge: 50 }, unlocked: false },
  { feature: "community_leader", label: "Community Leader", description: "Jalur kepemimpinan komunitas", emoji: "👑", requirements: { relationship: 50 }, unlocked: false },
  { feature: "ambassador_program", label: "Ambassador Program", description: "Program duta Beautifio", emoji: "🌟", requirements: { character: 70 }, unlocked: false },
  { feature: "mentor_access", label: "Mentor Access", description: "Akses penuh ke mentor", emoji: "🎯", requirements: { knowledge: 40, character: 40 }, unlocked: false },
  { feature: "circle_create", label: "Buat Circle", description: "Bisa membuat circle sendiri", emoji: "🔄", requirements: { relationship: 30, character: 25 }, unlocked: false },
  { feature: "event_host", label: "Host Event", description: "Bisa mengadakan event", emoji: "📅", requirements: { relationship: 45, character: 35 }, unlocked: false },
  { feature: "familia_gym_discount", label: "Gym Partner Discount", description: "Diskon mitra gym", emoji: "💪", requirements: { health: 60 }, unlocked: false },
  { feature: "familia_scholarship", label: "Scholarship Opportunities", description: "Akses informasi beasiswa", emoji: "🎓", requirements: { knowledge: 80 }, unlocked: false },
  { feature: "familia_premium_deals", label: "Premium Deals", description: "Penawaran premium Familia", emoji: "💎", requirements: { skill: 50, health: 40 }, unlocked: false },
  { feature: "familia_vip_rewards", label: "VIP Rewards", description: "Rewards eksklusif VIP", emoji: "🏆", requirements: { character: 60, spiritual: 50 }, unlocked: false },
];

export function unlockLifeCapital(capital: LifeCapital): UnlockableFeature[] {
  const profile = getLifeProfile();
  const newUnlocks: UnlockableFeature[] = [];

  for (const req of UNLOCK_REQUIREMENTS) {
    if (profile.unlocks.includes(req.feature)) continue;
    const meetsReqs = (Object.entries(req.requirements) as [keyof LifeCapital, number][]).every(
      ([key, val]) => capital[key] >= val,
    );
    if (meetsReqs) {
      newUnlocks.push(req.feature);
    }
  }

  if (newUnlocks.length > 0) {
    updateLifeProfile({ unlocks: [...profile.unlocks, ...newUnlocks] });
  }

  return newUnlocks;
}

export function getUnlockedFeatures(): UnlockableFeature[] {
  return getLifeProfile().unlocks;
}

export function getAvailableUnlocks(): UnlockRequirement[] {
  const profile = getLifeProfile();
  return UNLOCK_REQUIREMENTS.filter((req) => !profile.unlocks.includes(req.feature))
    .map((req) => ({
      ...req,
      unlocked: (Object.entries(req.requirements) as [keyof LifeCapital, number][]).every(
        ([key, val]) => profile.lifeCapital[key] >= val,
      ),
    }));
}

/* ──────────────────────────────────────────
   FAILURE REWARD SYSTEM
   ────────────────────────────────────────── */

export function rewardAfterFailure(): { characterGain: number; resilienceScore: number; growthWin: GrowthWin } {
  const profile = getLifeProfile();

  const characterGain = 6 + Math.floor(profile.failureRecoveryCount / 3) * 2;
  const newResilience = profile.resilienceScore + 5;

  const growthWin: GrowthWin = {
    id: `gw-failure-${Date.now()}`,
    title: `Bangkit kembali #${profile.failureRecoveryCount + 1}`,
    description: "Kegagalan bukan akhir — ini adalah bahan bakar untuk tumbuh lebih kuat.",
    unlockedAt: new Date().toISOString(),
    category: "character",
  };

  const capital = profile.lifeCapital;
  const newCapital: LifeCapital = {
    ...capital,
    character: clampCapital(capital.character + characterGain),
    knowledge: clampCapital(capital.knowledge + 3),
  };

  updateLifeProfile({
    lifeCapital: newCapital,
    resilienceScore: newResilience,
    failureRecoveryCount: profile.failureRecoveryCount + 1,
    growthWins: [...profile.growthWins, growthWin],
  });

  return { characterGain, resilienceScore: newResilience, growthWin };
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
