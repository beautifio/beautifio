import { supabase } from "@/lib/supabase/client";
import type {
  DreamJourney,
  BigWin,
  SmallWin,
  DailyActivity,
  JourneyDailyReflection,
  SpiritualPreferences,
  GrowthTimelineEvent,
  JourneyProgress,
  DreamTemplate,
} from "@beautifio/types";
import { generateDailyActivities, getAgeGroupedContent } from "@beautifio/utils";

function db() {
  if (!supabase) throw new Error("Supabase client not initialized");
  return supabase;
}

/* ─── Dream Journey ─── */

export async function getActiveJourney(
  userId: string
): Promise<DreamJourney | null> {
  const { data } = await db()
    .from("dream_journeys")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  return data;
}

export async function getAllJourneys(
  userId: string,
  limit = 20
): Promise<DreamJourney[]> {
  const { data } = await db()
    .from("dream_journeys")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function createJourney(
  userId: string,
  templateSlug: string,
  title: string,
  emoji: string,
  category: string,
  userAge?: number | null
): Promise<DreamJourney | null> {
  const { data: journey, error } = await db()
    .from("dream_journeys")
    .insert({
      user_id: userId,
      template_slug: templateSlug,
      title,
      emoji,
      category,
      user_age: userAge ?? null,
    })
    .select()
    .single();

  if (error || !journey) return null;

  let bigWinsData: any[] = [];
  let smallWinsData: any[] = [];

  const ageContent = userAge ? getAgeGroupedContent(templateSlug, userAge) : null;

  if (ageContent && ageContent.bigWins.length > 0) {
    bigWinsData = ageContent.bigWins;
    smallWinsData = ageContent.smallWins;
  } else {
    const { data: template } = await db()
      .from("dream_templates")
      .select("big_wins, small_wins")
      .eq("slug", templateSlug)
      .maybeSingle<{ big_wins: any[]; small_wins: any[] }>();

    if (template) {
      bigWinsData = template.big_wins.sort((a, b) => a.order - b.order);
      smallWinsData = template.small_wins;
    }
  }

  // Batch insert all big wins
  if (bigWinsData.length > 0) {
    const { data: insertedBigWins } = await db()
      .from("big_wins")
      .insert(
        bigWinsData.map((bw, i) => ({
          journey_id: journey.id,
          title: bw.title,
          description: bw.description,
          why_it_matters: bw.why_it_matters || "",
          alternative_path: bw.alternative_path || "",
          order_index: bw.order ?? i,
        }))
      )
      .select();

    if (insertedBigWins) {
      const bigWinTitleToId = new Map(
        insertedBigWins.map((bw: any) => [bw.title, bw.id])
      );

      const allSmallWins = smallWinsData
        .map((sw: any) => {
          const bid = bigWinTitleToId.get(sw.big_win_title);
          if (!bid) return null;
          return {
            big_win_id: bid,
            title: sw.title,
            description: sw.description,
            order_index: sw.order,
          };
        })
        .filter((x: any): x is NonNullable<typeof x> => x != null);

      if (allSmallWins.length > 0) {
        await db().from("small_wins").insert(allSmallWins);
      }
    }
  }

  const activities = generateDailyActivities({
    journey,
    spiritualPref: null,
  });
  if (activities.length > 0) {
    await db().from("daily_activities").insert(activities);
  }

  return journey;
}

/* ─── Big Wins ─── */

export async function getBigWins(journeyId: string): Promise<BigWin[]> {
  const { data } = await db()
    .from("big_wins")
    .select("*, small_wins(*)")
    .eq("journey_id", journeyId)
    .order("order_index");
  return data || [];
}

export async function updateBigWin(
  id: string,
  updates: Partial<BigWin>
): Promise<void> {
  await db().from("big_wins").update(updates).eq("id", id);
}

export async function completeBigWin(id: string): Promise<void> {
  await db()
    .from("big_wins")
    .update({ is_completed: true, completed_at: new Date().toISOString() })
    .eq("id", id);
}

export async function failBigWin(
  id: string,
  lessonsLearned?: string
): Promise<void> {
  await db()
    .from("big_wins")
    .update({ is_failed: true, is_completed: false })
    .eq("id", id);
}

export async function saveBigWinReflection(
  bigWinId: string,
  reflection: {
    most_memorable_moment: string;
    who_helped: string;
    biggest_lesson: string;
    next_steps: string;
  }
): Promise<void> {
  await db().from("big_win_reflections").insert({
    big_win_id: bigWinId,
    ...reflection,
  });
}

/* ─── Small Wins ─── */

export async function completeSmallWin(
  id: string,
  reflection?: string
): Promise<void> {
  const now = new Date().toISOString();
  const updates: any = {
    is_completed: true,
    completed_at: now,
  };
  if (reflection) updates.reflection = reflection;

  await db().from("small_wins").update(updates).eq("id", id);
}

/* ─── Daily Activities ─── */

export async function getTodayActivities(
  userId: string
): Promise<DailyActivity[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await db()
    .from("daily_activities")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", today)
    .order("dimension");
  return data || [];
}

export async function getActivitiesForDate(
  userId: string,
  date: string
): Promise<DailyActivity[]> {
  const { data } = await db()
    .from("daily_activities")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", date)
    .order("dimension");
  return data || [];
}

export async function completeActivity(id: string): Promise<void> {
  await db()
    .from("daily_activities")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function saveActivityNote(
  id: string,
  notes: string
): Promise<void> {
  await db()
    .from("daily_activities")
    .update({ notes })
    .eq("id", id);
}

export async function saveSmallWinReflection(
  id: string,
  reflection: string
): Promise<void> {
  await db()
    .from("small_wins")
    .update({ reflection })
    .eq("id", id);
}

export async function generateAndInsertActivities(
  journey: DreamJourney,
  spiritualPref?: SpiritualPreferences | null,
  date?: string
): Promise<DailyActivity[]> {
  const activities = generateDailyActivities({ journey, spiritualPref, date });
  const { data } = await db()
    .from("daily_activities")
    .insert(activities)
    .select();
  return data || [];
}

/* ─── Daily Reflections ─── */

export async function getTodayReflection(
  userId: string
): Promise<JourneyDailyReflection | null> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await db()
    .from("daily_reflections")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();
  return data;
}

export async function saveDailyReflection(
  userId: string,
  journeyId: string,
  reflection: { learned: string; grateful: string; improve: string; mood: string }
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const existing = await getTodayReflection(userId);

  if (existing) {
    await db()
      .from("daily_reflections")
      .update(reflection)
      .eq("id", existing.id);
  } else {
    await db().from("daily_reflections").insert({
      user_id: userId,
      journey_id: journeyId,
      date: today,
      ...reflection,
    });
  }
}

/* ─── Spiritual Preferences ─── */

export async function getSpiritualPreferences(
  userId: string
): Promise<SpiritualPreferences | null> {
  const { data } = await db()
    .from("spiritual_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function saveSpiritualPreferences(
  userId: string,
  prefs: Omit<SpiritualPreferences, "user_id" | "updated_at">
): Promise<void> {
  const existing = await getSpiritualPreferences(userId);
  if (existing) {
    await db()
      .from("spiritual_preferences")
      .update({ ...prefs, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  } else {
    await db().from("spiritual_preferences").insert({
      user_id: userId,
      ...prefs,
    });
  }
}

/* ─── Timeline ─── */

export async function getTimeline(
  userId: string,
  journeyId?: string,
  limit = 20
): Promise<GrowthTimelineEvent[]> {
  let query = db()
    .from("growth_timeline_events")
    .select("*")
    .eq("user_id", userId)
    .order("event_date", { ascending: false })
    .limit(limit);

  if (journeyId) {
    query = query.eq("journey_id", journeyId);
  }

  const { data } = await query;
  return data || [];
}

export async function addTimelineEvent(
  event: Omit<GrowthTimelineEvent, "id" | "created_at">
): Promise<void> {
  await db().from("growth_timeline_events").insert(event);
}

/* ─── Journey Progress (derived) ─── */

export async function getJourneyProgress(
  userId: string,
  journeyId: string
): Promise<JourneyProgress> {
  const [allBigWins, todayActivities, todayReflection] = await Promise.all([
    getBigWins(journeyId),
    getTodayActivities(userId),
    getTodayReflection(userId),
  ]);

  const currentBigWin =
    allBigWins.find((bw) => !bw.is_completed && !bw.is_failed) || null;
  const currentSmallWin = currentBigWin?.small_wins?.find(
    (sw) => !sw.is_completed
  ) || null;

  const completedToday = todayActivities.filter((a) => a.is_completed).length;
  const bigWinsCompleted = allBigWins.filter((bw) => bw.is_completed).length;
  const smallWins = allBigWins.flatMap((bw) => bw.small_wins || []);
  const smallWinsCompleted = smallWins.filter((sw) => sw.is_completed).length;

  return {
    current_big_win: currentBigWin,
    current_small_win: currentSmallWin,
    today_activities: todayActivities,
    today_reflection: todayReflection,
    completed_activities_today: completedToday,
    total_activities_today: todayActivities.length,
    streak: 0,
    big_wins_completed: bigWinsCompleted,
    big_wins_total: allBigWins.length,
    small_wins_completed: smallWinsCompleted,
    small_wins_total: smallWins.length,
  };
}
