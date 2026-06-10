// === ENUMS ===
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

// === MODELS ===
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  city?: string;
  status: UserStatus;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  goal_name: string;
  goal_category: GoalCategory;
  target_date?: string;
  status: GoalStatus;
  progress: number;
  created_at: string;
}

export interface Circle {
  id: string;
  name: string;
  description?: string;
  goal_category: GoalCategory;
  mentor_id?: string;
  cover_url?: string;
  capacity: number;
  member_count: number;
  status: CircleStatus;
  created_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
}

export interface Message {
  id: string;
  circle_id: string;
  sender_id: string;
  parent_id?: string;
  message: string;
  message_type: MessageType;
  is_pinned: boolean;
  created_at: string;
}

export interface Milestone {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  description?: string;
  order_index: number;
  status: MilestoneStatus;
  completed_at?: string;
}

export interface Opportunity {
  id: string;
  title: string;
  category: OppCategory;
  organization: string;
  description?: string;
  deadline: string;
  url?: string;
  is_featured: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotifType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}
