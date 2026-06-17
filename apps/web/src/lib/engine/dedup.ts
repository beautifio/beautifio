import { supabase } from "@/lib/supabase/client";

export async function getExcludedContentIds(
  journeyId: string,
  contentType: string,
): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("content_suggestions")
    .select("content_id")
    .eq("content_type", contentType)
    .eq("journey_id", journeyId);

  return data?.map((d) => d.content_id) || [];
}

export async function recordSuggestion(
  contentId: string,
  contentType: string,
  journeyId: string,
  activityId: string,
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("content_suggestions").insert({
      content_id: contentId,
      content_type: contentType,
      journey_id: journeyId,
      activity_id: activityId,
    });
  } catch {
    // duplicate — already suggested, skip
  }
}
