export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: { id: string; email: string; full_name: string; role: "user" | "mentor" | "admin"; avatar_url: string | null; bio: string | null; city: string | null; status: "active" | "suspended" | "banned"; is_verified: boolean; last_active_at: string | null; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: { id: string; email: string; full_name: string; role?: "user" | "mentor" | "admin"; avatar_url?: string | null; bio?: string | null; city?: string | null; status?: "active" | "suspended" | "banned"; is_verified?: boolean; last_active_at?: string | null };
        Update: { email?: string; full_name?: string; avatar_url?: string | null; bio?: string | null; city?: string | null; status?: "active" | "suspended" | "banned"; last_active_at?: string | null };
      };
      story_categories: {
        Row: { id: string; name: string; slug: string; icon: string | null; description: string | null; created_at: string };
        Insert: { id?: string; name: string; slug: string; icon?: string | null; description?: string | null };
        Update: { name?: string; slug?: string; icon?: string | null; description?: string | null };
      };
      stories: {
        Row: { id: string; slug: string; title: string; cover_image: string | null; author_id: string | null; author_name: string; author_avatar: string | null; content: string; category_id: string; reading_time: number; like_count: number; save_count: number; comment_count: number; is_published: boolean; published_at: string | null; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: { id?: string; slug: string; title: string; cover_image?: string | null; author_id?: string | null; author_name: string; author_avatar?: string | null; content: string; category_id: string; reading_time: number; like_count?: number; save_count?: number; comment_count?: number; is_published?: boolean; published_at?: string | null };
        Update: { slug?: string; title?: string; cover_image?: string | null; content?: string; category_id?: string; reading_time?: number; like_count?: number; save_count?: number; comment_count?: number; is_published?: boolean; published_at?: string | null };
      };
      story_likes: { Row: { id: string; story_id: string; user_id: string; created_at: string }; Insert: { id?: string; story_id: string; user_id: string }; Update: Record<string, never> };
      story_saves: { Row: { id: string; story_id: string; user_id: string; created_at: string }; Insert: { id?: string; story_id: string; user_id: string }; Update: Record<string, never> };
      story_comments: { Row: { id: string; story_id: string; user_id: string; parent_id: string | null; content: string; created_at: string; updated_at: string }; Insert: { id?: string; story_id: string; user_id: string; parent_id?: string | null; content: string }; Update: { content?: string } };
      story_recommendations: { Row: { id: string; story_id: string; resource_type: "roadmap" | "circle" | "product"; resource_id: string; resource_name: string; resource_description: string | null; resource_image: string | null; created_at: string }; Insert: { id?: string; story_id: string; resource_type: "roadmap" | "circle" | "product"; resource_id: string; resource_name: string; resource_description?: string | null; resource_image?: string | null }; Update: Record<string, never> };
      roadmap_templates: {
        Row: { id: string; slug: string; title: string; description: string; category: string; icon: string | null; color: string | null; estimated_duration: string | null; total_milestones: number; cover_image: string | null; created_at: string };
        Insert: { id?: string; slug: string; title: string; description: string; category: string; icon?: string | null; color?: string | null; estimated_duration?: string | null; total_milestones?: number; cover_image?: string | null };
        Update: { slug?: string; title?: string; description?: string; category?: string; icon?: string | null; color?: string | null; estimated_duration?: string | null; total_milestones?: number; cover_image?: string | null };
      };
      roadmap_template_milestones: {
        Row: { id: string; template_id: string; title: string; description: string | null; order_index: number; tasks: Json; estimated_days: number | null; created_at: string };
        Insert: { id?: string; template_id: string; title: string; description?: string | null; order_index: number; tasks?: Json; estimated_days?: number | null };
        Update: { title?: string; description?: string | null; order_index?: number; tasks?: Json; estimated_days?: number | null };
      };
      roadmap_template_recommendations: {
        Row: { id: string; template_id: string; milestone_id: string | null; resource_type: "circle" | "mentor" | "opportunity"; resource_id: string; resource_name: string; resource_description: string | null; resource_image: string | null; created_at: string };
        Insert: { id?: string; template_id: string; milestone_id?: string | null; resource_type: "circle" | "mentor" | "opportunity"; resource_id: string; resource_name: string; resource_description?: string | null; resource_image?: string | null };
        Update: Record<string, never>;
      };
      journals: {
        Row: { id: string; user_id: string; title: string; slug: string; description: string | null; cover_image: string | null; goal_category: string | null; roadmap_slug: string | null; is_public: boolean; entry_count: number; follower_count: number; reaction_count: number; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: { id?: string; user_id: string; title: string; slug: string; description?: string | null; cover_image?: string | null; goal_category?: string | null; roadmap_slug?: string | null; is_public?: boolean; entry_count?: number; follower_count?: number; reaction_count?: number };
        Update: { title?: string; description?: string | null; cover_image?: string | null; goal_category?: string | null; roadmap_slug?: string | null; is_public?: boolean };
      };
      journal_entries: {
        Row: { id: string; journal_id: string; title: string | null; content: string; mood: "sangat_bahagia" | "bahagia" | "biasa" | "sedih" | "sangat_sedih" | null; day_number: number; milestone_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; journal_id: string; title?: string | null; content: string; mood?: "sangat_bahagia" | "bahagia" | "biasa" | "sedih" | "sangat_sedih" | null; day_number?: number; milestone_id?: string | null };
        Update: { title?: string | null; content?: string; mood?: "sangat_bahagia" | "bahagia" | "biasa" | "sedih" | "sangat_sedih" | null; milestone_id?: string | null };
      };
      journal_milestones: {
        Row: { id: string; journal_id: string; title: string; description: string | null; is_achieved: boolean; achieved_at: string | null; created_at: string };
        Insert: { id?: string; journal_id: string; title: string; description?: string | null; is_achieved?: boolean; achieved_at?: string | null };
        Update: { title?: string; description?: string | null; is_achieved?: boolean; achieved_at?: string | null };
      };
      journal_followers: { Row: { id: string; journal_id: string; user_id: string; created_at: string }; Insert: { id?: string; journal_id: string; user_id: string }; Update: Record<string, never> };
      journal_reactions: { Row: { id: string; journal_id: string; user_id: string; emoji: string; created_at: string }; Insert: { id?: string; journal_id: string; user_id: string; emoji: string }; Update: Record<string, never> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "user" | "mentor" | "admin";
      user_status: "active" | "suspended" | "banned";
      goal_category: "karir" | "pendidikan" | "skill" | "bisnis";
      goal_status: "active" | "completed" | "archived";
      circle_status: "active" | "full" | "inactive";
      member_role: "member" | "co-host";
      message_type: "text" | "image" | "system";
      milestone_status: "locked" | "available" | "in_progress" | "completed";
      opp_category: "beasiswa" | "magang" | "pekerjaan" | "turnamen" | "kompetisi" | "relawan" | "pendanaan" | "program-kreator";
      notif_type: "message" | "mentor_reply" | "milestone" | "opportunity" | "system";
    };
  };
}
