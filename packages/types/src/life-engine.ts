export type LifeStage =
  | "sd"
  | "smp"
  | "sma"
  | "university"
  | "early-career"
  | "professional"
  | "mastery";

export type GrowthZone = "comfort" | "fear" | "learning" | "growth";

export type SpiritualPreference =
  | "islam"
  | "kristen"
  | "katholik"
  | "hindu"
  | "buddha"
  | "konghucu"
  | "agnostic"
  | "other";

export interface LifeCapital {
  knowledge: number;
  skill: number;
  health: number;
  relationship: number;
  character: number;
  spiritual: number;
}

export interface GrowthWin {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  category: keyof LifeCapital;
}

export interface FailureReflection {
  id: string;
  dreamSlug: string;
  milestoneTitle: string;
  dateFailed: string;
  lessonsLearned: string[];
  growthWinsUnlocked: GrowthWin[];
  pivotPaths: string[];
}

export interface UserLifeProfile {
  currentStage: LifeStage;
  currentZone: GrowthZone;
  currentDreamSlug: string | null;
  previousDreams: string[];
  lifeCapital: LifeCapital;
  spiritualPreference: SpiritualPreference;
  growthWins: GrowthWin[];
  failureReflections: FailureReflection[];
  onboardingCompleted: boolean;
  updatedAt: string;
}

export interface StageInfo {
  stage: LifeStage;
  label: string;
  emoji: string;
  ageRange: string;
  description: string;
}

export interface ZoneInfo {
  zone: GrowthZone;
  label: string;
  emoji: string;
  description: string;
  encouragement: string;
}

export interface CapitalChange {
  knowledge: number;
  skill: number;
  health: number;
  relationship: number;
  character: number;
  spiritual: number;
}

export interface PivotResult {
  oldDreamSlug: string;
  newDreamSlug: string;
  preservedCapital: LifeCapital;
  newPath: string;
  transferableSkills: string[];
}

export interface DailyWinSuggestion {
  category: string;
  emoji: string;
  tasks: string[];
}

export interface GrowthZoneRecommendation {
  zone: GrowthZone;
  stage: LifeStage;
  dreamSlug: string | null;
  dailyWins: DailyWinSuggestion[];
  weeklyFocus: string;
  monthlyGoal: string;
}
