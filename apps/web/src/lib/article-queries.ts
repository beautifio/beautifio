import { supabase } from "@/lib/supabase/client";

function db() {
  if (!supabase) throw new Error("Supabase client not initialized");
  return supabase;
}

export async function getArticleRead(
  userId: string,
  articleId: string,
  activityId: string
): Promise<{
  id: string;
  is_completed: boolean;
  scroll_percentage: number;
  time_spent_seconds: number;
} | null> {
  const { data } = await db()
    .from("article_reads")
    .select("id, is_completed, scroll_percentage, time_spent_seconds")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .eq("activity_id", activityId)
    .maybeSingle();
  return data;
}

export async function hasCompletedReadForActivity(
  userId: string,
  activityId: string,
  articleId?: string
): Promise<boolean> {
  if (articleId) {
    const { data } = await db()
      .from("article_reads")
      .select("id")
      .eq("user_id", userId)
      .eq("article_id", articleId)
      .eq("is_completed", true)
      .maybeSingle();
    if (data) return true;
  }
  const { data } = await db()
    .from("article_reads")
    .select("id")
    .eq("user_id", userId)
    .eq("activity_id", activityId)
    .eq("is_completed", true)
    .maybeSingle();
  return !!data;
}

export async function upsertArticleRead(params: {
  user_id: string;
  article_id: string;
  activity_id: string;
  journey_id?: string;
  started_at: string;
}): Promise<string | null> {
  const { data } = await db()
    .from("article_reads")
    .upsert(
      {
        user_id: params.user_id,
        article_id: params.article_id,
        activity_id: params.activity_id,
        journey_id: params.journey_id,
        started_at: params.started_at,
      },
      {
        onConflict: "user_id, article_id, activity_id",
        ignoreDuplicates: false,
      }
    )
    .select("id")
    .single();

  return data?.id ?? null;
}

export async function updateArticleReadProgress(
  readId: string,
  updates: {
    scroll_percentage?: number;
    time_spent_seconds?: number;
    is_completed?: boolean;
    completed_at?: string | null;
  }
): Promise<void> {
  await db().from("article_reads").update(updates).eq("id", readId);
}

export async function getPendingJourneyArticleIds(
  userId: string
): Promise<string[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await db()
    .from("daily_activities")
    .select("article_id")
    .eq("user_id", userId)
    .eq("is_completed", false)
    .not("article_id", "is", null)
    .eq("activity_date", today);

  return (data || []).map((r) => r.article_id).filter(Boolean) as string[];
}

export async function getUserArticleStats(
  userId: string
): Promise<{ total_read: number; total_minutes: number }> {
  const { data } = await db()
    .from("article_reads")
    .select("time_spent_seconds")
    .eq("user_id", userId)
    .eq("is_completed", true);

  const total_read = data?.length ?? 0;
  const total_seconds = (data || []).reduce(
    (sum, r) => sum + (r.time_spent_seconds || 0),
    0
  );
  const total_minutes = Math.round(total_seconds / 60);

  return { total_read, total_minutes };
}

export async function getArticleIdsInUserJourney(
  userId: string
): Promise<string[]> {
  const { data } = await db()
    .from("daily_activities")
    .select("article_id")
    .eq("user_id", userId)
    .not("article_id", "is", null);

  return (data || []).map((r) => r.article_id).filter(Boolean) as string[];
}
