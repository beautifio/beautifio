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
  const searchTopic = topic.toLowerCase().trim();

  // Find existing pending request with same topic or overlapping keywords
  const { data: existing } = await supabase
    .from("content_requests")
    .select("id, request_count, keywords")
    .eq("status", "pending")
    .or(`topic.ilike.${searchTopic},topic.ilike.${searchTopic.replace(/\s+/g, "-")}`);

  const match = existing?.find((r) => {
    const rKeywords = (r.keywords || []) as string[];
    return rKeywords.some((k) => keywords.some((kw) => kw.toLowerCase() === k.toLowerCase()));
  }) || existing?.[0];

  if (match) {
    await supabase
      .from("content_requests")
      .update({
        request_count: (match.request_count || 0) + 1,
        keywords: [...new Set([...(match.keywords || []), ...keywords])],
      })
      .eq("id", match.id);
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
