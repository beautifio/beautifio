export type DreamJourneyStatus = "active" | "completed" | "pivoted";

export type DailyActivityDimension =
  | "spiritual"
  | "physical"
  | "knowledge"
  | "social"
  | "character"
  | "dream_skill";

export type TimelineEventType =
  | "activity_completed"
  | "reflection_written"
  | "small_win_completed"
  | "big_win_completed"
  | "big_win_failed"
  | "journey_pivoted"
  | "circle_joined"
  | "mentor_interaction";

export type SpiritualBelief =
  | "islam"
  | "kristen"
  | "katholik"
  | "hindu"
  | "buddha"
  | "konghucu"
  | "agnostic"
  | "other";

/* ─── Dream Template ─── */

export interface DreamTemplate {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  category: string;
  duration: string;
  description: string;
  why_matters: string;
  career_options: string[];
  success_examples: { name: string; role: string; story: string }[];
  big_wins: DreamTemplateBigWin[];
  small_wins: DreamTemplateSmallWin[];
  daily_activities: DreamTemplateDaily | null;
  alternative_futures: DreamTemplateAlternativeFuture[];
  min_age?: number;
  max_age?: number;
}

export interface DreamTemplateBigWin {
  title: string;
  description: string;
  why_it_matters: string;
  alternative_path: string;
  order: number;
}

export interface DreamTemplateSmallWin {
  big_win_title: string;
  title: string;
  description: string;
  order: number;
}

export interface DreamTemplateDaily {
  spiritual: string[];
  physical: string[];
  knowledge: string[];
  social: string[];
  character: string[];
  dream_skill: string[];
}

export interface DreamTemplateAlternativeFuture {
  title: string;
  description: string;
  skills: string[];
}

/* ─── Dream Journey ─── */

export interface DreamJourney {
  id: string;
  slug: string;
  user_id: string;
  template_slug: string;
  title: string;
  emoji: string;
  category: string;
  status: DreamJourneyStatus;
  user_age: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PreviousDream {
  id: string;
  user_id: string;
  dream_journey_id: string | null;
  title: string;
  emoji: string;
  category: string;
  pivot_reason: string;
  transferable_skills: string[];
  lessons_learned: string;
  alternative_path: string;
  started_at: string;
  ended_at: string;
}

/* ─── Big Wins ─── */

export interface BigWin {
  id: string;
  journey_id: string;
  title: string;
  description: string;
  why_it_matters: string;
  alternative_path: string;
  order_index: number;
  is_completed: boolean;
  is_failed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  small_wins?: SmallWin[];
}

export interface BigWinReflection {
  id: string;
  big_win_id: string;
  most_memorable_moment: string;
  who_helped: string;
  biggest_lesson: string;
  next_steps: string;
}

/* ─── Small Wins ─── */

export interface SmallWin {
  id: string;
  big_win_id: string;
  title: string;
  description: string;
  is_completed: boolean;
  completed_at: string | null;
  notes: string;
  reflection: string;
  evidence_url: string;
  order_index: number;
}

export interface SmallWinReflection {
  id: string;
  small_win_id: string;
  content: string;
}

/* ─── Daily Activities ─── */

export type ActivityType = 'general' | 'knowledge' | 'physical' | 'social' | 'spiritual' | 'character' | 'dream_skill';

export type ActionType =
  | 'read_article' | 'comment_curhat' | 'support_curhat'
  | 'write_curhat' | 'write_journal' | 'join_circle'
  | 'view_roadmap' | 'view_mentor' | 'do_exercise' | 'manual';

export interface DailyActivity {
  id: string;
  journey_id: string;
  user_id: string;
  title: string;
  description: string;
  dimension: DailyActivityDimension;
  is_completed: boolean;
  completed_at: string | null;
  activity_date: string;
  is_custom: boolean;
  is_journey_activity: boolean;
  notes: string | null;
  article_id: string | null;
  activity_type: ActivityType;
  estimated_minutes: number | null;
  action_type: ActionType;
  match_keywords: string[];
  matched_content_id: string | null;
  matched_content_type: string | null;
  matched_slug: string | null;
  matched_title: string | null;
}

/* ─── Article Read Tracking ─── */

export interface ArticleRead {
  id: string;
  user_id: string;
  article_id: string;
  activity_id: string | null;
  journey_id: string | null;
  started_at: string;
  completed_at: string | null;
  scroll_percentage: number;
  time_spent_seconds: number;
  is_completed: boolean;
}

/* ─── Daily Reflections ─── */

export interface JourneyDailyReflection {
  id: string;
  user_id: string;
  journey_id: string;
  date: string;
  learned: string;
  grateful: string;
  improve: string;
  mood: string;
}

/* ─── Spiritual Preferences ─── */

export interface SpiritualPreferences {
  user_id: string;
  belief: SpiritualBelief;
  selected_practices: string[];
  custom_practices: string[];
}

/* ─── Growth Timeline ─── */

export interface GrowthTimelineEvent {
  id: string;
  user_id: string;
  journey_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  metadata: Record<string, unknown> | null;
  event_date: string;
}

/* ─── Weekly & Monthly Reviews ─── */

export interface WeeklyReview {
  id: string;
  user_id: string;
  journey_id: string | null;
  week_start: string;
  proud: string | null;
  difficult: string | null;
  improve: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyReview {
  id: string;
  user_id: string;
  journey_id: string | null;
  month: string;
  changed: string | null;
  learned: string | null;
  grateful: string | null;
  focus_next: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryEntry {
  date: string;
  type: "dream_chosen" | "big_win" | "small_win" | "reflection" | "review";
  title: string;
  description?: string;
  mood?: string;
}

/* ─── Journey Progress (derived) ─── */

export interface JourneyProgress {
  current_big_win: BigWin | null;
  current_small_win: SmallWin | null;
  today_activities: DailyActivity[];
  today_reflection: JourneyDailyReflection | null;
  completed_activities_today: number;
  total_activities_today: number;
  streak: number;
  big_wins_completed: number;
  big_wins_total: number;
  small_wins_completed: number;
  small_wins_total: number;
}

/* ─── Benchmark Phase System ─── */

export type UserPhaseStatus = "not_started" | "in_progress" | "completed" | "ahead";

export interface DreamPhase {
  id: string;
  dream_template_slug: string;
  phase_number: number;
  phase_name: string;
  age_min: number | null;
  age_max: number | null;
  big_win_title: string;
  big_win_description: string | null;
  industry_benchmark: string | null;
  over_achievement: string | null;
  behind_schedule_signal: string | null;
  sort_order: number;
  small_wins: DreamPhaseSmallWin[];
}

export interface DreamPhaseSmallWin {
  id: string;
  phase_id: string;
  title: string;
  description: string | null;
  target_value: string | null;
  target_unit: string | null;
  how_to_measure: string | null;
  sort_order: number;
}

export interface UserPhaseStatusRecord {
  id: string;
  user_id: string;
  journey_id: string;
  dream_phase_id: string;
  status: UserPhaseStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingQuestion {
  id: string;
  label: string;
  type: "single_select";
  options: string[];
  purpose: string;
}

export interface PhaseDetectionResult {
  current_phase: DreamPhase | null;
  status: "on_track" | "behind_schedule" | "ahead_of_schedule";
  message: string;
  all_phases: DreamPhase[];
}
