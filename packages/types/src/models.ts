import type { Json } from "./database";

export type UserRole = "user" | "mentor" | "admin" | "redaksi" | "superadmin";
export type UserStatus = "active" | "suspended" | "banned";
export type GoalCategory = "karir" | "pendidikan" | "skill" | "bisnis";
export type GoalStatus = "active" | "completed" | "archived";
export type CircleStatus = "active" | "full" | "inactive";
export type MemberRole = "member" | "co-host" | "mentor";
export type MessageType = "text" | "image" | "system" | "chat" | "weekly_post" | "announcement" | "question";
export type MilestoneStatus = "locked" | "available" | "in_progress" | "completed";
export type OppCategory = "beasiswa" | "magang" | "pekerjaan" | "turnamen" | "kompetisi" | "relawan" | "pendanaan" | "program-kreator";
export type NotifType = "message" | "mentor_reply" | "milestone" | "opportunity" | "system";
export type StoryResourceType = "roadmap" | "circle" | "product";
export type RoadmapResourceType = "circle" | "mentor" | "opportunity" | "product";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  category: string;
  tags: string[];
}

export interface Profile { id: string; email: string; full_name: string; role: UserRole; avatar_url?: string; bio?: string; city?: string; status: UserStatus; created_at: string; }
export interface Goal { id: string; user_id: string; goal_name: string; goal_category: GoalCategory; target_date?: string; status: GoalStatus; progress: number; created_at: string; }
export interface Circle { id: string; name: string; description?: string; goal_category: string; mentor_id?: string; cover_url?: string; capacity: number; member_count: number; status: CircleStatus; template_slug?: string; created_by?: string; created_at: string; }
export interface CircleMember { id: string; circle_id: string; user_id: string; role: MemberRole; joined_at: string; left_at?: string; }
export interface Message { id: string; circle_id: string; sender_id?: string; parent_id?: string; message: string; message_type: MessageType; is_pinned: boolean; attachment_url?: string; created_at: string; }
export interface CircleSession { id: string; circle_id: string; title: string; description?: string; scheduled_at: string; meet_url?: string; notes?: string; recording_url?: string; created_by?: string; created_at: string; }
export interface CircleMentorQA { id: string; circle_id: string; question_text: string; asked_by?: string; answer_text?: string; answered_by?: string; is_answered: boolean; is_pinned: boolean; created_at: string; answered_at?: string; }
export interface CircleSessionRsvp { id: string; session_id: string; user_id: string; status: string; created_at: string; }
export interface Milestone { id: string; user_id: string; goal_id: string; title: string; description?: string; order_index: number; status: MilestoneStatus; completed_at?: string; created_at: string; }
export interface Opportunity { id: string; title: string; category: OppCategory; organization: string; description?: string; location?: string; deadline: string; url?: string; is_featured: boolean; is_active: boolean; created_at: string; }
export interface StoryCategory { id: string; name: string; slug: string; icon?: string; description?: string; }
export interface Story { id: string; slug: string; title: string; cover_image?: string; author_id?: string; author_name: string; author_avatar?: string; content: string; category_id: string; category?: StoryCategory; reading_time: number; like_count: number; save_count: number; comment_count: number; is_published: boolean; published_at?: string; created_at: string; is_liked?: boolean; is_saved?: boolean; }
export interface StoryComment { id: string; story_id: string; user_id: string; parent_id?: string; content: string; created_at: string; author_name?: string; author_avatar?: string; replies?: StoryComment[]; }
export interface StoryRecommendation { id: string; story_id: string; resource_type: StoryResourceType; resource_id: string; resource_name: string; resource_description?: string; resource_image?: string; }

export interface RoadmapTemplate {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  color?: string;
  estimated_duration?: string;
  total_milestones: number;
  cover_image?: string;
  created_at: string;
  milestones?: RoadmapTemplateMilestone[];
  recommendations?: RoadmapTemplateRecommendation[];
}

export interface RoadmapTemplateMilestone {
  id: string;
  template_id: string;
  title: string;
  description?: string;
  order_index: number;
  tasks: RoadmapTask[];
  estimated_days?: number;
  created_at: string;
}

export interface RoadmapTask {
  title: string;
  done?: boolean;
}

export interface RoadmapTemplateRecommendation {
  id: string;
  template_id: string;
  milestone_id?: string;
  resource_type: RoadmapResourceType;
  resource_id: string;
  resource_name: string;
  resource_description?: string;
  resource_image?: string;
}

export interface DiscoveryOption {
  value: string;
  label: string;
  emoji: string;
}

export interface DiscoveryQuestion {
  id: string;
  question: string;
  subtitle: string;
  icon: string;
  options: DiscoveryOption[];
  multi?: boolean;
  max?: number;
}

export interface DiscoveryAnswer {
  questionId: string;
  question: string;
  answers: string[];
  answerLabels: string[];
}

export interface DiscoveryResult {
  mainGoal: string;
  mainGoalEmoji: string;
  topInterests: string[];
  recommendedRoadmapSlugs: string[];
  recommendedCircleIds: string[];
}

export interface MentorBadge {
  type: "education" | "certification" | "experience" | "achievement";
  label: string;
  icon?: string;
}

export interface MentorProfile {
  id: string;
  slug: string;
  name: string;
  initials: string;
  avatar?: string;
  expertise: string;
  bio: string;
  company?: string;
  position?: string;
  yearsExperience: number;
  badges: MentorBadge[];
  circleIds: string[];
  storySlugs: string[];
  roadmapSlugs: string[];
  isAvailable: boolean;
  sessionCount: number;
  menteeCount: number;
  rating: number;
}

export type Mood = "sangat_bahagia" | "bahagia" | "biasa" | "sedih" | "sangat_sedih";

export interface Journal {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description?: string;
  cover_image?: string;
  goal_category?: string;
  roadmap_slug?: string;
  is_public: boolean;
  entry_count: number;
  follower_count: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
  entries?: JournalEntry[];
  milestones?: JournalMilestone[];
  author_name?: string;
  author_initials?: string;
  author_avatar?: string;
}

export interface JournalEntry {
  id: string;
  journal_id: string;
  title?: string;
  content: string;
  mood?: Mood;
  day_number: number;
  milestone_id?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalMilestone {
  id: string;
  journal_id: string;
  title: string;
  description?: string;
  is_achieved: boolean;
  achieved_at?: string;
  created_at: string;
}

export type VoucherType = "free_drink" | "bogof" | "discount" | "free_addon" | "buy1get1" | "discount_pct" | "discount_nominal" | "free_product" | "bogo";
export type DealPlatform = "tokopedia" | "shopee" | "tiktok" | "website";
export type AchievementTrigger = "discovery_complete" | "roadmap_milestones" | "circle_days" | "mentor_program" | "journal_entries" | "story_posted";
export type RewardType = "voucher" | "discount" | "special_benefit";
export type VoucherStatus = "active" | "redeemed" | "expired";
export type DiscountType = "percentage" | "nominal" | "free";

export interface FamiliaMerchant {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  merchant_code: string;
  daily_pin: string;
  monthly_quota: number;
  voucher_types: VoucherType[];
  is_active: boolean;
  total_vouchers: number;
  total_redeemed: number;
  total_expired: number;
  max_per_user?: number;
  claim_start?: string | null;
  claim_end?: string | null;
  redeem_hours?: number;
  redeem_minutes?: number;
  code_prefix?: string | null;
  city?: string | null;
  free_product_name?: string | null;
  discount_type?: "pct" | "nominal" | null;
  discount_value?: number | null;
  promo_buy?: number | null;
  promo_get?: number | null;
  report_token?: string | null;
  created_at: string;
}

export interface FamiliaAffiliateDeal {
  id: string;
  title: string;
  slug: string;
  description?: string;
  image_url?: string;
  category: string;
  partner_name: string;
  partner_url: string;
  platform: DealPlatform;
  goal_category?: string;
  is_featured: boolean;
  click_count: number;
  is_active: boolean;
  hot_deal_order?: number | null;
  hot_deal_expires?: string | null;
  partners?: PartnerInfo[] | null;
  created_at: string;
}

export interface PartnerInfo {
  name: string;
  url: string;
  description?: string;
  image_url?: string;
}

export interface FamiliaAchievementReward {
  id: string;
  title: string;
  description?: string;
  trigger_type: AchievementTrigger;
  trigger_value: number;
  reward_type: RewardType;
  reward_description?: string;
  reward_merchant_id?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
}

export interface FamiliaVoucherSession {
  id: string;
  user_id: string;
  merchant_id: string;
  voucher_code: string;
  status: VoucherStatus;
  pin_required: string;
  activated_at: string;
  expires_at: string;
  redeemed_at?: string;
  created_at: string;
  merchant?: FamiliaMerchant;
}

export interface FamiliaEventBenefit {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  event_date?: string;
  discount_type: DiscountType;
  discount_value: string;
  code?: string;
  is_active: boolean;
  created_at: string;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  circleId: string;
  circleName: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  slots: number;
  registered: number;
}

/* ─── Roadmap 3.0 Types ─── */

export interface RoadmapV3 {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  duration: string;
  category: string;
  dream: RoadmapDream;
  dailyWins: RoadmapDailyWinCategory[];
  smallWins: RoadmapSmallWinCategory[];
  bigWins: RoadmapBigWin[];
  blueprint: RoadmapBlueprint;
  lifePillars: LifePillar[];
  alternativeFutures: AlternativeFuture[];
  agePath: AgePathStage[];
  timeline: TimelinePhase[];
  realityCheck: RealityCheck;
  alternativePaths: AlternativePath[];
  masterclassLessons: MasterclassLesson[];
}

export interface LifePillar {
  name: string;
  emoji: string;
  description: string;
  habits: string[];
}

export interface AlternativeFuture {
  title: string;
  description: string;
  skills: string[];
}

export interface RoadmapDream {
  title: string;
  description: string;
  whyMatters: string;
  estimatedJourney: string;
  careerPossibilities: string[];
  successExamples: string[];
}

export interface RoadmapDailyWinCategory {
  category: string;
  emoji: string;
  habits: RoadmapDailyHabit[];
}

export interface RoadmapDailyHabit {
  id: string;
  title: string;
  description?: string;
  icon: string;
}

export interface RoadmapSmallWinCategory {
  category: string;
  emoji: string;
  skills: RoadmapSkill[];
}

export interface RoadmapSkill {
  id: string;
  name: string;
  description: string;
  levels: SkillLevel[];
}

export interface SkillLevel {
  label: string;
  target: string;
  description: string;
}

export interface RoadmapBigWin {
  id: string;
  title: string;
  description: string;
  order: number;
  isEssential: boolean;
  stage: "beginner" | "intermediate" | "advanced" | "professional";
}

export interface RoadmapBlueprint {
  skills: string[];
  habits: string[];
  mindset: string[];
  tools: string[];
  commonMistakes: string[];
  successFactors: string[];
}

export interface DailyReflection {
  id: string;
  roadmapSlug: string;
  date: string;
  learned: string;
  improved: string;
  tomorrow: string;
  challenge: string;
  grateful: string;
}

export interface AgePathStage {
  ageRange: string;
  title: string;
  description: string;
  milestones: string[];
}

export interface TimelinePhase {
  period: string;
  title: string;
  description: string;
  keyActions: string[];
}

export interface RealityCheck {
  hardTruths: string[];
  silverLinings: string[];
  transferableSkills: string[];
}

export interface AlternativePath {
  scenario: string;
  steps: AlternativePathStep[];
}

export interface AlternativePathStep {
  transition: string;
  role: string;
  description: string;
}

export interface MasterclassLesson {
  person: string;
  role: string;
  lesson: string;
  story: string;
  keyInsight: string;
  actionItem: string;
}

export interface LearningVaultItem {
  id: string;
  roadmapSlug: string;
  type: "story" | "article" | "video" | "note" | "mentor_insight";
  title: string;
  url?: string;
  notes?: string;
  savedAt: string;
}
