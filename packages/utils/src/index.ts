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
  isOnboardingComplete, completeOnboarding,
  calculateCapitalChange, applyCapitalDecay, applyCapitalChanges,
  detectGrowthZone, updateZone,
  generateDailyWins, executePivot,
  recordFailure, unlockGrowthWin, getAllGrowthWins,
  getStageProgression,
} from "./life-engine";

