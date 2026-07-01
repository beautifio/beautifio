import { supabase } from "./client";
import type { Circle, CircleMember, Message, CircleSession, CircleMentorQA, CircleSessionRsvp } from "@beautifio/types";
import { TEMPLATE_TO_BENCHMARK_SLUG } from "@beautifio/utils";

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

export async function signInWithGoogle(redirectTo?: string) {
  const client = requireClient();
  const url = redirectTo || (typeof window !== "undefined" ? window.location.href : undefined);
  return client.auth.signInWithOAuth({
    provider: "google",
    options: url ? { redirectTo: url } : undefined,
  });
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

// === CIRCLE QUERIES ===

export async function getMyCircles(userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_members")
    .select("circle_id, circles(*)")
    .eq("user_id", userId)
    .is("left_at", null);
  if (error) throw error;
  return (data || []).map((r: any) => r.circles) as Circle[];
}

export async function getRecommendedCircles(userId: string, templateSlug?: string) {
  const client = requireClient();
  // Get circles user is NOT a member of
  const { data: memberCircleIds } = await client
    .from("circle_members")
    .select("circle_id")
    .eq("user_id", userId)
    .is("left_at", null);

  const excludeIds = (memberCircleIds || []).map((r: any) => r.circle_id);

  let query = client
    .from("circles")
    .select("*")
    .eq("status", "active");

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  if (templateSlug) {
    query = query.eq("template_slug", templateSlug);
  }

  const { data, error } = await query.order("member_count", { ascending: false }).limit(10);
  if (error) throw error;
  return (data || []) as Circle[];
}

export async function getCirclesByTemplate(templateSlug: string) {
  const client = requireClient();
  const benchmarkSlug = TEMPLATE_TO_BENCHMARK_SLUG[templateSlug];
  const slugs = benchmarkSlug ? [templateSlug, benchmarkSlug] : [templateSlug];
  const { data, error } = await client
    .from("circles")
    .select("*")
    .eq("status", "active")
    .in("template_slug", slugs)
    .order("member_count", { ascending: false })
    .limit(5);
  if (error) throw error;
  return (data || []) as Circle[];
}

export async function getCircleById(circleId: string) {
  const client = requireClient();
  const { data, error } = await client.from("circles").select("*").eq("id", circleId).single();
  if (error) throw error;
  return data as Circle;
}

export async function joinCircle(circleId: string, userId: string) {
  const client = requireClient();
  // Check if already a member
  const { data: existing } = await client
    .from("circle_members")
    .select("id")
    .eq("circle_id", circleId)
    .eq("user_id", userId)
    .is("left_at", null)
    .maybeSingle();
  if (existing) return existing as CircleMember;
  // Check capacity
  const { data: circle } = await client.from("circles").select("capacity, member_count").eq("id", circleId).single();
  if (circle && circle.member_count >= circle.capacity) {
    throw new Error("Circle is full");
  }
  // Check tier limit
  const { count: joinedCount } = await client.from("circle_members")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId).is("left_at", null);
  let tier = "reguler";
  const { data: sub } = await client.from("user_subscriptions")
    .select("plan_id").eq("user_id", userId).eq("status", "active")
    .gt("expires_at", new Date().toISOString()).maybeSingle();
  if (sub?.plan_id) {
    const { data: plan } = await client.from("subscription_plans").select("tier").eq("id", sub.plan_id).single();
    tier = plan?.tier || "reguler";
  }
  const maxCircles = tier === "ultimate" ? 999 : tier === "pro" ? 999 : 3;
  if ((joinedCount ?? 0) >= maxCircles) {
    throw new Error(`Batas circle tercapai (${maxCircles}). Upgrade ke Pro untuk unlimited circle.`);
  }
  const { data, error } = await client
    .from("circle_members")
    .insert({ circle_id: circleId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  // Increment member count
  await client.rpc("increment_circle_member_count", { circle_id: circleId });
  return data as CircleMember;
}

export async function leaveCircle(circleId: string, userId: string) {
  const client = requireClient();
  const { error } = await client
    .from("circle_members")
    .update({ left_at: new Date().toISOString() })
    .eq("circle_id", circleId)
    .eq("user_id", userId)
    .is("left_at", null);
  if (error) throw error;
}

export async function sendMessage(msg: {
  circle_id: string;
  sender_id: string;
  message: string;
  message_type?: "chat" | "weekly_post" | "announcement" | "question";
}) {
  const client = requireClient();
  const { data, error } = await client
    .from("messages")
    .insert({ ...msg, message_type: msg.message_type || "chat" })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

export async function getMessages(
  circleId: string,
  options?: { limit?: number; before?: string }
) {
  const client = requireClient();
  let query = client
    .from("messages")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false })
    .limit(options?.limit || 50);

  if (options?.before) {
    query = query.lt("created_at", options.before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).reverse() as Message[];
}

export async function getCircleMembers(circleId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_members")
    .select("id, circle_id, user_id, role, joined_at, users(id, full_name, avatar_url)")
    .eq("circle_id", circleId)
    .is("left_at", null)
    .order("role", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getSessions(circleId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_sessions")
    .select("*")
    .eq("circle_id", circleId)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data || []) as CircleSession[];
}

export async function getMentorQA(circleId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_mentor_qa")
    .select("*")
    .eq("circle_id", circleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as CircleMentorQA[];
}

export async function askMentor(circleId: string, userId: string, questionText: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_mentor_qa")
    .insert({ circle_id: circleId, asked_by: userId, question_text: questionText })
    .select()
    .single();
  if (error) throw error;
  return data as CircleMentorQA;
}

export async function answerQuestion(qaId: string, mentorId: string, answerText: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_mentor_qa")
    .update({
      answer_text: answerText,
      answered_by: mentorId,
      is_answered: true,
      answered_at: new Date().toISOString(),
    })
    .eq("id", qaId)
    .select()
    .single();
  if (error) throw error;
  return data as CircleMentorQA;
}

export async function rsvpSession(sessionId: string, userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_session_rsvp")
    .insert({ session_id: sessionId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data as CircleSessionRsvp;
}

export async function getMyRsvps(userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("circle_session_rsvp")
    .select("session_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data || []).map((r: any) => r.session_id));
}

export async function sendAttachment(msg: {
  circle_id: string;
  sender_id: string;
  message: string;
  attachment_url: string;
}) {
  const client = requireClient();
  const { data, error } = await client
    .from("messages")
    .insert({ ...msg, message_type: "image" })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}

export async function reportAttachment(messageId: string, circleId: string, reporterId: string, reason?: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("attachment_reports")
    .insert({ message_id: messageId, circle_id: circleId, reporter_id: reporterId, reason: reason || "" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReportStatus(messageId: string, circleId: string) {
  const client = requireClient();
  const { data, error } = await client
    .rpc("get_report_count", { p_message_id: messageId, p_circle_id: circleId });
  if (error) return { report_count: 0, member_count: 0, threshold: 0, should_hide: false };
  return data?.[0] || { report_count: 0, member_count: 0, threshold: 0, should_hide: false };
}

export async function checkBanStatus(circleId: string, userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .rpc("is_user_banned", { p_circle_id: circleId, p_user_id: userId });
  if (error || !data || data.length === 0) return null;
  return data[0] as { is_banned: boolean; ban_reason: string; expires_at: string | null; is_permanent: boolean };
}

export async function autoBanMember(circleId: string, userId: string) {
  const client = requireClient();
  await client.rpc("auto_ban_member", { p_circle_id: circleId, p_user_id: userId });
}

export async function getMemberViolationCount(circleId: string, userId: string) {
  const client = requireClient();
  const { data, error } = await client
    .from("attachment_reports")
    .select("id, messages!inner(sender_id)", { count: "exact", head: true })
    .eq("circle_id", circleId)
    .eq("messages.sender_id", userId);
  if (error) return 0;
  return data?.length || 0;
}

export async function uploadAttachment(file: File, userId: string, circleId: string) {
  const client = requireClient();
  const ext = file.name.split(".").pop();
  const filePath = `circles/${circleId}/${userId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await client.storage
    .from("circle-attachments")
    .upload(filePath, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data: urlData } = client.storage.from("circle-attachments").getPublicUrl(filePath);
  return urlData?.publicUrl || "";
}

export async function hideAttachment(messageId: string) {
  const client = requireClient();
  await client
    .from("messages")
    .update({ attachment_url: null })
    .eq("id", messageId);
}

export async function createCircle(data: {
  name: string;
  description?: string;
  goal_category: string;
  template_slug?: string;
  capacity?: number;
}) {
  const client = requireClient();
  const { data: circle, error } = await client
    .from("circles")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return circle as Circle;
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

// === ROADMAP TEMPLATES ===
export async function getRoadmapTemplates() {
  const client = requireClient();
  return client.from("roadmap_templates").select("*").order("title", { ascending: true });
}

export async function getRoadmapTemplateBySlug(slug: string) {
  const client = requireClient();
  return client.from("roadmap_templates").select("*").eq("slug", slug).single();
}

export async function getRoadmapTemplateMilestones(templateId: string) {
  const client = requireClient();
  return client.from("roadmap_template_milestones").select("*").eq("template_id", templateId).order("order_index", { ascending: true });
}

export async function getRoadmapTemplateRecommendations(templateId: string, milestoneId?: string) {
  const client = requireClient();
  let query = client.from("roadmap_template_recommendations").select("*").eq("template_id", templateId);
  if (milestoneId) query = query.eq("milestone_id", milestoneId);
  return query;
}
