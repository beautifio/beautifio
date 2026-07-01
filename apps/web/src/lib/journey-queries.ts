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
  WeeklyReview,
  MonthlyReview,
} from "@beautifio/types";
import { generateDailyActivities, getAgeGroupedContent, buildDreamTemplates } from "@beautifio/utils";

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

export async function archiveJourney(journeyId: string) {
  const { error } = await db()
    .from("dream_journeys")
    .update({ status: "archived", ended_at: new Date().toISOString() })
    .eq("id", journeyId);
  if (error) throw error;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function generateJourneySlug(templateSlug: string, title: string): string {
  const base = slugify(title);
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}

export function journeyUrl(journey: { slug?: string | null; id: string; template_slug: string }): string {
  const slug = journey.slug || `${slugify(journey.template_slug)}-${journey.id.slice(0, 6)}`;
  return `/journey/${slug}`;
}

export async function getJourneyBySlug(
  userId: string,
  slug: string
): Promise<DreamJourney | null> {
  const { data } = await db()
    .from("dream_journeys")
    .select("*")
    .eq("user_id", userId)
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function createJourney(
  userId: string,
  templateSlug: string,
  title: string,
  emoji: string,
  category: string,
  userAge?: number | null
): Promise<DreamJourney | null> {
  // Ensure dream_templates has the template — auto-seed if missing
  const { count, error: countErr } = await db()
    .from("dream_templates")
    .select("*", { count: "exact", head: true })
    .eq("slug", templateSlug);
  if (countErr) {}
  if ((count ?? 0) === 0) {
    const templates = buildDreamTemplates();
    const tpl = templates[templateSlug];
    if (tpl) {
      const { error: seedErr } = await db().from("dream_templates").insert({
        slug: tpl.slug,
        title: tpl.title,
        emoji: tpl.emoji,
        color: tpl.color,
        category: tpl.category,
        duration: tpl.duration,
        description: tpl.description,
        why_matters: tpl.why_matters,
        career_options: tpl.career_options,
        success_examples: tpl.success_examples,
        big_wins: tpl.big_wins as any,
        small_wins: tpl.small_wins as any,
        daily_activities: tpl.daily_activities as any,
        alternative_futures: tpl.alternative_futures as any,
        min_age: tpl.min_age ?? 0,
        max_age: tpl.max_age ?? 99,
      });
      if (seedErr) {}
    }
  }

  const slug = generateJourneySlug(templateSlug, title);
  const { data: journey, error } = await db()
    .from("dream_journeys")
    .insert({
      user_id: userId,
      template_slug: templateSlug,
      slug,
      title,
      emoji,
      category,
      user_age: userAge ?? null,
    })
    .select()
    .single();

  if (error || !journey) {
    // console.error("createJourney: dream_journeys insert failed", { error, userId, templateSlug });
    return null;
  }

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

  // Filter out generic dream-selection big wins (user already chose their dream)
  const filteredBigWins = bigWinsData.filter((bw) => {
    const lower = (bw.title || "").toLowerCase();
    const generic = ["menentukan", "memilih", "tentukan", "pilih"];
    return !generic.some((g) => lower.includes(g));
  });

  // Batch insert all big wins
  if (filteredBigWins.length > 0) {
    const { data: insertedBigWins, error: bwError } = await db()
      .from("big_wins")
      .insert(
        filteredBigWins.map((bw, i) => ({
          journey_id: journey.id,
          title: bw.title,
          description: bw.description,
          why_it_matters: bw.why_it_matters || "",
          alternative_path: bw.alternative_path || "",
          order_index: bw.order ?? i,
        }))
      )
      .select();

    if (bwError) {
      // console.error("createJourney: big_wins insert failed", bwError);
    } else if (insertedBigWins) {
      // Auto-complete the first big win — user already chose their dream
      await db()
        .from("big_wins")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", insertedBigWins[0].id);
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
        const { error: swError } = await db().from("small_wins").insert(allSmallWins);
        if (swError) {}
      }
    }
  }

  const activities = generateDailyActivities({
    journey,
    spiritualPref: null,
  });
  if (activities.length > 0) {
    const { error: actError } = await db().from("daily_activities").insert(activities);
    if (actError) {}
  }

  // Determine & save current phase
  if (userAge) {
    try {
      const { data: phaseResult } = await db().rpc("determine_current_phase", {
        p_user_age: userAge,
        p_template_slug: templateSlug,
      });

      if (phaseResult && phaseResult.length > 0) {
        const phase = phaseResult[0];

        const { data: existingStatus } = await db()
          .from("user_phase_status")
          .select("id")
          .eq("journey_id", journey.id)
          .eq("dream_phase_id", phase.phase_id)
          .maybeSingle();

        if (!existingStatus) {
          await db().from("user_phase_status").insert({
            user_id: userId,
            journey_id: journey.id,
            dream_phase_id: phase.phase_id,
            status: phase.behind_schedule_signal
              ? "behind"
              : "in_progress",
          });
        }
      }
    } catch (e) {
      // console.error("createJourney: phase detection failed", e);
    }
  }

  return journey;
}

/* ─── Phases ─── */

export async function getActivePhaseWithBenchmarks(
  journeyId: string,
  userId: string
): Promise<{
  phase: any;
  smallWins: any[];
  status: string;
} | null> {
  const { data: ups } = await db()
    .from("user_phase_status")
    .select("*, dream_phases(*)")
    .eq("journey_id", journeyId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ups) return null;

  const { data: sw } = await db()
    .from("small_win_templates")
    .select("*")
    .eq("phase_id", ups.dream_phase_id)
    .order("sort_order");

  return {
    phase: ups.dream_phases,
    smallWins: sw || [],
    status: ups.status,
  };
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

export async function unfailBigWin(id: string): Promise<void> {
  await db()
    .from("big_wins")
    .update({ is_failed: false, is_completed: false })
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
  userId: string,
  journeyId?: string
): Promise<DailyActivity[]> {
  const today = new Date().toISOString().split("T")[0];
  let query = db()
    .from("daily_activities")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", today);

  if (journeyId) {
    query = query.eq("journey_id", journeyId);
  }

  const { data } = await query.order("dimension");
  return data || [];
}

export async function getActivitiesForDate(
  userId: string,
  date: string,
  journeyId?: string
): Promise<DailyActivity[]> {
  let query = db()
    .from("daily_activities")
    .select("*")
    .eq("user_id", userId)
    .eq("activity_date", date);

  if (journeyId) {
    query = query.eq("journey_id", journeyId);
  }

  const { data } = await query.order("dimension");
  return data || [];
}

export async function completeActivity(id: string): Promise<void> {
  const { data: activity } = await db()
    .from("daily_activities")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("dimension, user_id, journey_id")
    .single();

  if (activity?.dimension) {
    await db().from("life_capital_points").insert({
      user_id: activity.user_id,
      dimension: activity.dimension,
      points: 10,
      source_type: "daily_activity",
      source_id: id,
      journey_id: activity.journey_id,
    });
  }
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
  const dateStr = date || new Date().toISOString().split("T")[0];

  await db()
    .from("daily_activities")
    .delete()
    .eq("journey_id", journey.id)
    .eq("activity_date", dateStr);

  const activities = generateDailyActivities({ journey, spiritualPref, date });
  const { data } = await db()
    .from("daily_activities")
    .insert(activities)
    .select();
  return data || [];
}

/* ─── Daily Reflections ─── */

export async function getJourneyReflections(
  userId: string,
  journeyId: string
): Promise<JourneyDailyReflection[]> {
  const { data } = await db()
    .from("daily_reflections")
    .select("*")
    .eq("user_id", userId)
    .eq("journey_id", journeyId)
    .order("date", { ascending: false });
  return data || [];
}

/* ─── Weekly Reviews ─── */

export async function getWeeklyReview(
  userId: string,
  weekStart: string
): Promise<WeeklyReview | null> {
  const { data } = await db()
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();
  return data;
}

export async function getLatestWeeklyReview(
  userId: string
): Promise<WeeklyReview | null> {
  const { data } = await db()
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function saveWeeklyReview(
  userId: string,
  journeyId: string | null,
  weekStart: string,
  review: { proud: string; difficult: string; improve: string }
): Promise<void> {
  const existing = await getWeeklyReview(userId, weekStart);
  if (existing) {
    await db().from("weekly_reviews").update(review).eq("id", existing.id);
  } else {
    await db().from("weekly_reviews").insert({
      user_id: userId,
      journey_id: journeyId,
      week_start: weekStart,
      ...review,
    });
  }
}

/* ─── Monthly Reviews ─── */

export async function getMonthlyReview(
  userId: string,
  month: string
): Promise<MonthlyReview | null> {
  const { data } = await db()
    .from("monthly_reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .maybeSingle();
  return data;
}

export async function getLatestMonthlyReview(
  userId: string
): Promise<MonthlyReview | null> {
  const { data } = await db()
    .from("monthly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function saveMonthlyReview(
  userId: string,
  journeyId: string | null,
  month: string,
  review: { changed: string; learned: string; grateful: string; focus_next: string }
): Promise<void> {
  const existing = await getMonthlyReview(userId, month);
  if (existing) {
    await db().from("monthly_reviews").update(review).eq("id", existing.id);
  } else {
    await db().from("monthly_reviews").insert({
      user_id: userId,
      journey_id: journeyId,
      month,
      ...review,
    });
  }
}

export async function getTodayReflection(
  userId: string,
  journeyId?: string
): Promise<JourneyDailyReflection | null> {
  const today = new Date().toISOString().split("T")[0];
  let query = db()
    .from("daily_reflections")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today);

  if (journeyId) {
    query = query.eq("journey_id", journeyId);
  }

  const { data } = await query.maybeSingle();
  return data;
}

export async function saveDailyReflection(
  userId: string,
  journeyId: string,
  reflection: { learned: string; grateful: string; improve: string; mood: string }
): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  const existing = await getTodayReflection(userId, journeyId);

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

export type LifeTimelineEntry = {
  date: string;
  type: "journey_started" | "big_win_completed" | "small_win_completed" | "reflection_written" | "activity_completed";
  title: string;
  description: string;
  emoji: string;
  journeyTitle?: string;
  journeyEmoji?: string;
};

export async function getLifeTimeline(userId: string, journeyId?: string): Promise<LifeTimelineEntry[]> {
  const entries: LifeTimelineEntry[] = [];

  const journeys = await db()
    .from("dream_journeys")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (journeys.data) {
    for (const j of journeys.data) {
      if (journeyId && j.id !== journeyId) continue;
      entries.push({
        date: j.created_at,
        type: "journey_started",
        title: `Memulai perjalanan ${j.title}`,
        description: j.description || j.title,
        emoji: j.emoji || "🌟",
        journeyTitle: j.title,
        journeyEmoji: j.emoji,
      });

      const bigWins = await getBigWins(j.id);
      for (const bw of bigWins) {
        if (bw.completed_at) {
          entries.push({
            date: bw.completed_at,
            type: "big_win_completed",
            title: `Menyelesaikan Big Win: ${bw.title}`,
            description: bw.why_it_matters || bw.description || "",
            emoji: "🏆",
            journeyTitle: j.title,
            journeyEmoji: j.emoji,
          });
        }
        for (const sw of bw.small_wins || []) {
          if (sw.completed_at) {
            entries.push({
              date: sw.completed_at,
              type: "small_win_completed",
              title: `Menyelesaikan Small Win: ${sw.title}`,
              description: sw.reflection || sw.description || "",
              emoji: "✅",
              journeyTitle: j.title,
              journeyEmoji: j.emoji,
            });
          }
        }
      }
    }
  }

  const reflections = await db()
    .from("daily_reflections")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (reflections.data) {
    for (const r of reflections.data) {
      if (journeyId && r.journey_id !== journeyId) continue;
      const preview = r.learned?.slice(0, 80);
      entries.push({
        date: r.date,
        type: "reflection_written",
        title: `Menulis refleksi`,
        description: preview ? `"${preview}${r.learned.length > 80 ? "…" : ""}"` : "",
        emoji: "📖",
      });
    }
  }

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return entries;
}

export type DimensionSummary = {
  dimension: string;
  label: string;
  emoji: string;
  completed: number;
  total: number;
};

/* ─── Story Timeline ─── */

export type StoryEntry = {
  date: string;
  type: "dream_chosen" | "big_win" | "small_win" | "reflection" | "review_weekly" | "review_monthly";
  title: string;
  description?: string;
  mood?: string;
  learned?: string;
  grateful?: string;
  improve?: string;
};

export async function getStoryEntries(userId: string): Promise<StoryEntry[]> {
  const entries: StoryEntry[] = [];

  const { data: journeys } = await db()
    .from("dream_journeys")
    .select("id, title, emoji, template_slug, started_at")
    .eq("user_id", userId);

  if (journeys) {
    for (const j of journeys) {
      entries.push({
        date: j.started_at?.split("T")[0] || "",
        type: "dream_chosen",
        title: `Memilih mimpi: ${j.title}`,
        description: `Memulai perjalanan menjadi ${j.title}`,
      });

      const { data: bw } = await db()
        .from("big_wins")
        .select("id, title, completed_at")
        .eq("journey_id", j.id)
        .not("completed_at", "is", null);

      if (bw) {
        for (const b of bw) {
          entries.push({
            date: b.completed_at?.split("T")[0] || "",
            type: "big_win",
            title: `Mencapai Big Win: ${b.title}`,
          });

          const { data: sw } = await db()
            .from("small_wins")
            .select("title, completed_at, reflection")
            .eq("big_win_id", b.id)
            .not("completed_at", "is", null);

          if (sw) {
            for (const s of sw) {
              entries.push({
                date: s.completed_at?.split("T")[0] || "",
                type: "small_win",
                title: `Menyelesaikan: ${s.title}`,
                description: s.reflection || undefined,
              });
            }
          }
        }
      }
    }
  }

  const { data: reflections } = await db()
    .from("daily_reflections")
    .select("date, learned, grateful, improve, mood")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (reflections) {
    for (const r of reflections) {
      entries.push({
        date: r.date,
        type: "reflection",
        title: r.learned ? `"${r.learned.slice(0, 100)}${r.learned.length > 100 ? "…" : ""}"` : "Menulis refleksi",
        learned: r.learned || undefined,
        grateful: r.grateful || undefined,
        improve: r.improve || undefined,
        mood: r.mood || undefined,
      });
    }
  }

  const { data: weekly } = await db()
    .from("weekly_reviews")
    .select("week_start, proud")
    .eq("user_id", userId)
    .order("week_start", { ascending: false });

  if (weekly) {
    for (const w of weekly) {
      entries.push({
        date: w.week_start,
        type: "review_weekly",
        title: "Review Mingguan",
        description: w.proud ? `Bangga: ${w.proud.slice(0, 100)}` : undefined,
      });
    }
  }

  const { data: monthly } = await db()
    .from("monthly_reviews")
    .select("month, learned")
    .eq("user_id", userId)
    .order("month", { ascending: false });

  if (monthly) {
    for (const m of monthly) {
      entries.push({
        date: m.month,
        type: "review_monthly",
        title: "Review Bulanan",
        description: m.learned ? `Belajar: ${m.learned.slice(0, 100)}` : undefined,
      });
    }
  }

  entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return entries;
}

export async function getActivitySummary(userId: string): Promise<DimensionSummary[]> {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data } = await db()
    .from("daily_activities")
    .select("dimension, is_completed")
    .eq("user_id", userId)
    .gte("activity_date", thirtyDaysAgo)
    .lte("activity_date", today);

  if (!data) return [];

  const DIMENSION_INFO: Record<string, { label: string; emoji: string }> = {
    spiritual: { label: "Spiritual", emoji: "🕊️" },
    physical: { label: "Fisik", emoji: "💪" },
    knowledge: { label: "Pengetahuan", emoji: "📚" },
    social: { label: "Sosial", emoji: "👥" },
    character: { label: "Karakter", emoji: "⭐" },
    dream_skill: { label: "Skill Mimpi", emoji: "🎯" },
  };

  const groups = new Map<string, { completed: number; total: number }>();
  for (const a of data) {
    const g = groups.get(a.dimension) || { completed: 0, total: 0 };
    g.total++;
    if (a.is_completed) g.completed++;
    groups.set(a.dimension, g);
  }

  return Array.from(groups.entries())
    .map(([dimension, counts]) => ({
      dimension,
      ...(DIMENSION_INFO[dimension] || { label: dimension, emoji: "📌" }),
      ...counts,
    }))
    .sort((a, b) => b.total - a.total);
}

/* ─── Streak ─── */

async function calculateStreak(
  userId: string,
  journeyId: string
): Promise<number> {
  const { data } = await db()
    .from("daily_activities")
    .select("activity_date, is_completed")
    .eq("user_id", userId)
    .eq("journey_id", journeyId)
    .eq("is_completed", true)
    .order("activity_date", { ascending: false });

  if (!data || data.length === 0) return 0;

  const activeDays = new Set(data.map((r) => r.activity_date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (activeDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

/* ─── Journey Progress (derived) ─── */

export async function getJourneyProgress(
  userId: string,
  journeyId: string
): Promise<JourneyProgress> {
  const [allBigWins, todayActivities, todayReflection, streak] = await Promise.all([
    getBigWins(journeyId),
    getTodayActivities(userId, journeyId),
    getTodayReflection(userId, journeyId),
    calculateStreak(userId, journeyId),
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
    streak,
    big_wins_completed: bigWinsCompleted,
    big_wins_total: allBigWins.length,
    small_wins_completed: smallWinsCompleted,
    small_wins_total: smallWins.length,
  };
}

/* ─── Calendar History ─── */

export type CalendarDayInfo = {
  date: string;
  has_activity: boolean;
  has_reflection: boolean;
  has_milestone: boolean;
};

export async function getMonthActivities(
  userId: string,
  year: number,
  month: number
): Promise<CalendarDayInfo[]> {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(year, month, 0);
  const end = endDate.toISOString().split("T")[0];

  const [activities, reflections, milestones] = await Promise.all([
    db()
      .from("daily_activities")
      .select("activity_date")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .gte("activity_date", start)
      .lte("activity_date", end),
    db()
      .from("daily_reflections")
      .select("date")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end),
    db()
      .from("growth_timeline_events")
      .select("event_date")
      .eq("user_id", userId)
      .in("event_type", ["small_win_completed", "big_win_completed"])
      .gte("event_date", start)
      .lte("event_date", end),
  ]);

  const activityDates = new Set((activities.data || []).map((r) => r.activity_date));
  const reflectionDates = new Set((reflections.data || []).map((r) => r.date));
  const milestoneDates = new Set((milestones.data || []).map((r) => r.event_date));

  const days: CalendarDayInfo[] = [];
  const totalDays = endDate.getDate();
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      date: dateStr,
      has_activity: activityDates.has(dateStr),
      has_reflection: reflectionDates.has(dateStr),
      has_milestone: milestoneDates.has(dateStr),
    });
  }

  return days;
}
