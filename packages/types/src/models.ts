import type { Json } from "./database";

export type UserRole = "user" | "mentor" | "admin";
export type UserStatus = "active" | "suspended" | "banned";
export type GoalCategory = "karir" | "pendidikan" | "skill" | "bisnis";
export type GoalStatus = "active" | "completed" | "archived";
export type CircleStatus = "active" | "full" | "inactive";
export type MemberRole = "member" | "co-host";
export type MessageType = "text" | "image" | "system";
export type MilestoneStatus = "locked" | "available" | "in_progress" | "completed";
export type OppCategory = "beasiswa" | "magang" | "kompetisi" | "workshop";
export type NotifType = "message" | "mentor_reply" | "milestone" | "opportunity" | "system";
export type StoryResourceType = "roadmap" | "circle" | "product";
export type RoadmapResourceType = "circle" | "mentor" | "opportunity";

export interface Profile { id: string; email: string; full_name: string; role: UserRole; avatar_url?: string; bio?: string; city?: string; status: UserStatus; created_at: string; }
export interface Goal { id: string; user_id: string; goal_name: string; goal_category: GoalCategory; target_date?: string; status: GoalStatus; progress: number; created_at: string; }
export interface Circle { id: string; name: string; description?: string; goal_category: GoalCategory; mentor_id?: string; cover_url?: string; capacity: number; member_count: number; status: CircleStatus; created_at: string; }
export interface CircleMember { id: string; circle_id: string; user_id: string; role: MemberRole; joined_at: string; left_at?: string; }
export interface Message { id: string; circle_id: string; sender_id: string; parent_id?: string; message: string; message_type: MessageType; is_pinned: boolean; created_at: string; }
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
