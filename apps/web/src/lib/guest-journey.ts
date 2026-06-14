export interface GuestJourneyData {
  templateSlug: string;
  userAge: number;
  onboardingAnswers: Record<string, string>;
  startDate: string;
  completedActivities: Record<string, string[]>;
  activityNotes: Record<string, Record<string, string>>;
}

const STORAGE_KEY = "beautifio_guest_journey";

export function getGuestJourney(): GuestJourneyData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GuestJourneyData;
  } catch {
    return null;
  }
}

export function saveGuestJourney(data: GuestJourneyData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearGuestJourney(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentDay(startDate: string): number {
  const start = new Date(startDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
  return Math.min(Math.max(diff, 1), 3);
}

export function isTrialExpired(startDate: string): boolean {
  return getCurrentDay(startDate) > 3;
}

export function getDaysRemaining(startDate: string): number {
  return Math.max(0, 3 - getCurrentDay(startDate));
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export async function migrateGuestToDB(
  userId: string,
  guestData: GuestJourneyData
): Promise<{ slug: string } | null> {
  const { getDreamTemplate } = await import("@beautifio/utils");
  const template = getDreamTemplate(guestData.templateSlug);
  if (!template) return null;

  const { createJourney } = await import("@/lib/journey-queries");
  const journey = await createJourney(
    userId,
    guestData.templateSlug,
    template.title,
    template.emoji,
    template.category,
    guestData.userAge
  );
  if (!journey) return null;

  const { supabase } = await import("@/lib/supabase/client");
  if (supabase) {
    // Onboarding questions
    if (Object.keys(guestData.onboardingAnswers).length > 0) {
      await supabase
        .from("users")
        .update({ onboarding_data: guestData.onboardingAnswers as any })
        .eq("id", userId);
    }

    // Mark completed activities by matching title + date
    for (const [date, titles] of Object.entries(guestData.completedActivities)) {
      if (titles.length === 0) continue;
      await supabase
        .from("daily_activities")
        .update({ is_completed: true, completed_at: new Date().toISOString() })
        .eq("journey_id", journey.id)
        .eq("activity_date", date)
        .in("title", titles);
    }
  }

  return { slug: journey.slug || `${journey.id.slice(0, 8)}` };
}
