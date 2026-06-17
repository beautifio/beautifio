import { supabase } from "@/lib/supabase/client";

export async function createContentRequest(params: {
  topic: string;
  keywords: string[];
  actionType: string;
  journeyTemplateSlug?: string;
  activityTitle?: string;
}): Promise<void> {
  if (!supabase) return;

  const { topic, keywords, actionType, journeyTemplateSlug, activityTitle } = params;

  const existing = await supabase
    .from("content_requests")
    .select("id, request_count")
    .eq("topic", topic)
    .eq("status", "pending")
    .maybeSingle();

  if (existing?.data) {
    await supabase
      .from("content_requests")
      .update({ request_count: existing.data.request_count + 1 });
  } else {
    await supabase.from("content_requests").insert({
      topic,
      keywords,
      action_type: actionType,
      journey_template_slug: journeyTemplateSlug || null,
      activity_title: activityTitle || null,
    });
  }
}
