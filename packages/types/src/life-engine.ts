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

export type LifeLevel = "seed" | "explorer" | "builder" | "achiever" | "leader" | "mentor" | "legacy";

export type CapitalSourceType =
  | "read_story"
  | "complete_lesson"
  | "vault_add"
  | "masterclass_read"
  | "write_reflection"
  | "daily_win_complete"
  | "small_win_complete"
  | "milestone_achieve"
  | "practice_log"
  | "physical_activity"
  | "recovery_habit"
  | "sleep_track"
  | "healthy_routine"
  | "circle_participate"
  | "circle_help"
  | "mentor_interact"
  | "event_attend"
  | "streak_milestone"
  | "difficult_goal"
  | "return_after_failure"
  | "help_others"
  | "gratitude_journal"
  | "purpose_exercise"
  | "faith_practice"
  | "consistency";

export type CapitalMissionStatus = "active" | "completed" | "expired";

export type UnlockableFeature =
  | "advanced_roadmaps"
  | "community_leader"
  | "ambassador_program"
  | "mentor_access"
  | "circle_create"
  | "event_host"
  | "familia_gym_discount"
  | "familia_scholarship"
  | "familia_premium_deals"
  | "familia_vip_rewards";

export interface LifeCapital {
  knowledge: number;
  skill: number;
  health: number;
  relationship: number;
  character: number;
  spiritual: number;
}

export interface CapitalTrend {
  weekly: number;
  monthly: number;
  history: number[];
}

export interface CapitalSource {
  source: CapitalSourceType;
  label: string;
  emoji: string;
  capitalKey: keyof LifeCapital;
  points: number;
}

export interface CapitalMission {
  id: string;
  capitalKey: keyof LifeCapital;
  title: string;
  description: string;
  emoji: string;
  points: number;
  progress: number;
  target: number;
  status: CapitalMissionStatus;
  createdAt: string;
  completedAt?: string;
}

export interface LifeLevelInfo {
  level: LifeLevel;
  label: string;
  emoji: string;
  minCapital: number;
  maxCapital: number;
  description: string;
}

export interface UnlockRequirement {
  feature: UnlockableFeature;
  label: string;
  description: string;
  emoji: string;
  requirements: Partial<LifeCapital>;
  unlocked: boolean;
}

export interface CapitalBalanceTip {
  capitalKey: keyof LifeCapital;
  label: string;
  emoji: string;
  value: number;
  tip: string;
  missionTitle: string;
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
  // Phase 15.2 additions
  capitalTrends: Record<keyof LifeCapital, CapitalTrend>;
  missions: CapitalMission[];
  completedMissions: string[];
  unlocks: UnlockableFeature[];
  resilienceScore: number;
  failureRecoveryCount: number;
  weeklyActivityLog: Record<string, number>;
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
