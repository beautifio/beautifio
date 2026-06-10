import { supabase } from "./client";

function requireClient() {
  if (!supabase) throw new Error("Supabase client not initialized.");
  return supabase;
}

export async function signUp(email: string, password: string, name: string) {
  const client = requireClient();
  return client.auth.signUp({ email, password, options: { data: { full_name: name } } });
}

export async function signIn(email: string, password: string) {
  const client = requireClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  const client = requireClient();
  return client.auth.signInWithOAuth({ provider: "google" });
}

export async function signOut() {
  const client = requireClient();
  return client.auth.signOut();
}

export async function saveOnboardingData(userId: string, data: { status: string; interests: string[]; goals: string[] }) {
  const client = requireClient();
  return client.from("users").upsert({ id: userId, status: data.status, interests: data.interests, goals: data.goals, onboarding_completed: true });
}

export async function getGoals(userId: string) {
  const client = requireClient();
  return client.from("user_goals").select("*").eq("user_id", userId).order("created_at", { ascending: false });
}

export async function createGoal(goal: { user_id: string; goal_name: string; goal_category: string; target_date?: string }) {
  const client = requireClient();
  return client.from("user_goals").insert(goal).select().single();
}

export async function getMyCircles(userId: string) {
  const client = requireClient();
  return client.from("circle_members").select("circle_id, circles(*)").eq("user_id", userId).is("left_at", null);
}

export async function getRecommendedCircles() {
  const client = requireClient();
  return client.from("circles").select("*").eq("status", "active").order("member_count", { ascending: false });
}

export async function joinCircle(circleId: string, userId: string) {
  const client = requireClient();
  return client.from("circle_members").insert({ circle_id: circleId, user_id: userId });
}

export async function sendMessage(message: { circle_id: string; sender_id: string; message: string }) {
  const client = requireClient();
  return client.from("messages").insert(message).select().single();
}

export async function getMilestones(goalId: string) {
  const client = requireClient();
  return client.from("milestones").select("*").eq("goal_id", goalId).order("order_index", { ascending: true });
}

export async function completeMilestone(milestoneId: string) {
  const client = requireClient();
  return client.from("milestones").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", milestoneId);
}

export async function getOpportunities(filters?: { category?: string }) {
  const client = requireClient();
  let query = client.from("opportunities").select("*").eq("is_active", true).order("deadline", { ascending: true });
  if (filters?.category) query = query.eq("category", filters.category);
  return query;
}

export async function saveOpportunity(userId: string, opportunityId: string) {
  const client = requireClient();
  return client.from("saved_opportunities").insert({ user_id: userId, opportunity_id: opportunityId });
}

// === CERITA (STORIES) ===

export async function getStoryCategories() {
  const client = requireClient();
  return client.from("story_categories").select("*").order("name", { ascending: true });
}

export async function getStories(filters?: { category_slug?: string; userId?: string }) {
  const client = requireClient();
  let query = client
    .from("stories")
    .select("*, story_categories(*)")
    .eq("is_published", true)
    .is("deleted_at", null)
    .order("published_at", { ascending: false });

  if (filters?.category_slug) {
    query = query.eq("story_categories.slug", filters.category_slug);
  }

  return query;
}

export async function getStoryBySlug(slug: string) {
  const client = requireClient();
  return client
    .from("stories")
    .select("*, story_categories(*)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
}

export async function getStoryRecommendations(storyId: string) {
  const client = requireClient();
  return client.from("story_recommendations").select("*").eq("story_id", storyId);
}

export async function getStoryComments(storyId: string) {
  const client = requireClient();
  return client
    .from("story_comments")
    .select("*")
    .eq("story_id", storyId)
    .is("parent_id", null)
    .order("created_at", { ascending: true });
}

export async function getStoryCommentReplies(commentId: string) {
  const client = requireClient();
  return client.from("story_comments").select("*").eq("parent_id", commentId).order("created_at", { ascending: true });
}

export async function likeStory(storyId: string, userId: string) {
  const client = requireClient();
  return client.from("story_likes").insert({ story_id: storyId, user_id: userId });
}

export async function unlikeStory(storyId: string, userId: string) {
  const client = requireClient();
  return client.from("story_likes").delete().eq("story_id", storyId).eq("user_id", userId);
}

export async function saveStory(storyId: string, userId: string) {
  const client = requireClient();
  return client.from("story_saves").insert({ story_id: storyId, user_id: userId });
}

export async function unsaveStory(storyId: string, userId: string) {
  const client = requireClient();
  return client.from("story_saves").delete().eq("story_id", storyId).eq("user_id", userId);
}

export async function checkStoryLike(storyId: string, userId: string) {
  const client = requireClient();
  return client.from("story_likes").select("id").eq("story_id", storyId).eq("user_id", userId).maybeSingle();
}

export async function checkStorySave(storyId: string, userId: string) {
  const client = requireClient();
  return client.from("story_saves").select("id").eq("story_id", storyId).eq("user_id", userId).maybeSingle();
}

export async function addComment(storyId: string, userId: string, content: string, parentId?: string) {
  const client = requireClient();
  return client.from("story_comments").insert({ story_id: storyId, user_id: userId, content, parent_id: parentId || null }).select().single();
}
