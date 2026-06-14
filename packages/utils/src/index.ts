export { formatDate, formatDeadline, timeUntil } from "./formatters";
export { isValidEmail, isValidPassword, isUrl } from "./validators";
export {
  GOAL_CATEGORIES, OPP_CATEGORIES, CIRCLE_STATUS, CIRCLE_CATEGORIES,
  STORY_CATEGORIES, ROADMAP_TEMPLATES, MOCK_MENTORS, MOCK_OPPORTUNITIES,
  MOCK_PRODUCTS,
  DISCOVERY_QUESTIONS, DISCOVERY_GOAL_LABELS,
  INTEREST_TO_ROADMAP, INSPIRATION_TO_ROADMAP,
  INSPIRATION_TO_CIRCLES, INTEREST_TO_CIRCLES,
} from "./constants";

export type { MentorConstant, OpportunityConstant, ProductConstant } from "./constants";

export {
  ROADMAP_CATEGORIES, ROADMAP_TEMPLATE_CATEGORIES,
  ROADMAP_SEED_MILESTONES, ROADMAP_SEED_RECOMMENDATIONS,
} from "./roadmap-seed";

export {
  MOOD_OPTIONS, JOURNAL_CATEGORIES,
  MOCK_JOURNALS, MOCK_JOURNAL_ENTRIES, MOCK_JOURNAL_MILESTONES,
  getStoredJournals, saveJournal, getAllJournals, getJournalBySlug,
  storeJournalEntry, getAllEntries,
  storeJournalMilestone, getAllMilestones,
  generateSlug,
} from "./journal-seed";

export type { Mood } from "@beautifio/types";

export {
  FAMILIA_MERCHANTS, FAMILIA_AFFILIATE_DEALS,
  FAMILIA_ACHIEVEMENT_REWARDS, FAMILIA_EVENT_BENEFITS,
  VOUCHER_TYPE_LABELS, VOUCHER_TYPE_EMOJIS, FAMILIA_CATEGORIES,
  getVoucherSessions, saveVoucherSession, updateVoucherSession,
  getActiveVoucherForMerchant, hasRedeemedToday, recordRedemption,
  generateVoucherCode,
} from "./familia-seed";

export {
  ROADMAP_V3_SEED, getRoadmapV3,
  getStoredReflections, saveReflection,
  getVaultItems, saveVaultItem, removeVaultItem,
  toggleDailyHabit, getDoneHabits, getStreak, updateStreak,
} from "./roadmap-v3-seed";
export { getLifePillars, getAlternativeFutures } from "./roadmap-life-pillars-seed";
export { STAGE_INFO, ZONE_INFO, SPIRITUAL_PRACTICES, DEFAULT_LIFE_CAPITAL } from "./life-engine-seed";
export {
  getLifeProfile, saveLifeProfile, updateLifeProfile,
  detectGrowthZone, updateZone,
  generateDailyWins, executePivot,
  getAllGrowthWins,
  LIFE_LEVELS, getLifeLevel, getLifeLevelProgress,
  getStrongestCapital, getWeakestCapital, getCapitalGap,
  getCapitalOverview,
} from "./life-engine";
export { DREAM_TEMPLATES, getDreamTemplate, getAllDreamTemplates, buildDreamTemplates } from "./dream-templates";
export { generateDailyActivities, ACTIVITY_DETAILS, getActivitiesForDimension } from "./daily-activity-generator";
export type { GenerateDailyOptions, ActivityDetail } from "./daily-activity-generator";
export {
  getAgeGroup, getAgeGroupLabel, getAgeRangeLabel,
  getStageForAge, getAgeGroupedContent,
  getAlternativeFuturesForTemplate, getDreamMeaning, getCareerOptions,
} from "./age-journey-engine";
export type { AgeGroup, AgeGroupedBigWin, AgeGroupedSmallWin } from "./age-journey-engine";

export {
  generateDailyCoachFocus, generateInsights, analyzeZone,
  getCapitalAdvice, navigateDream, matchOpportunities,
  generateMotivation,
  generateFailureCoach, generatePivotCoach,
  analyzeReflection,
} from "./ai-coach";
export type {
  DailyCoachFocus, PersonalizedInsight,
  ZoneAnalysis, CapitalAdvice, DreamNavigation,
  MotivationMessage, OpportunityMatch,
  FailureCoachResponse, PivotCoachAnalysis, ReflectionInsight,
  CoachFocusArea,
} from "./ai-coach";

export {
  JM_ECOSYSTEMS, getJmEcosystem, getJmEcosystemByTitle, getJmEcosystemByTemplateSlug,
} from "./journey-mapper-ecosystems";
export type { JmEcosystem } from "./journey-mapper-types";
export {
  JM_HARD_SKILLS, JM_SOFT_SKILLS,
  getJmHardSkill, getJmSoftSkill, getJmHardSkillsByCategory, resolveJmSkillCodes,
} from "./journey-mapper-skills";
export type { JmHardSkill, JmSoftSkill } from "./journey-mapper-types";
export {
  JM_PROFESSIONS, getJmProfession, getJmProfessionsByEcosystem,
} from "./journey-mapper-professions";
export type { JmProfession } from "./journey-mapper-types";
export {
  JM_BENCHMARKS, getJmBenchmarks,
} from "./journey-mapper-benchmarks";
export type { JmBenchmark } from "./journey-mapper-types";
export {
  JM_OPPORTUNITIES, getJmOpportunities,
} from "./journey-mapper-opportunities";
export type { JmOpportunity } from "./journey-mapper-types";
export {
  getJmCareerPaths, getJmPersonalizedPaths,
  getJmEncouragement, getJmTransferableSkills,
} from "./journey-mapper";
export type { JmCareerPath } from "./journey-mapper-types";

