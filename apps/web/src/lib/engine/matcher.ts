import { supabase } from "@/lib/supabase/client";
import { matchArticle } from "./sources/articles";
import { matchCurhatToComment, matchCurhatToSupport } from "./sources/curhats";
import { matchCircle } from "./sources/circles";
import { getExcludedContentIds, recordSuggestion } from "./dedup";
import { createContentRequest } from "./requester";
import type { MatchResult } from "./sources/articles";

export type ActionType =
  | "read_article" | "comment_curhat" | "support_curhat"
  | "write_curhat" | "write_journal" | "join_circle"
  | "view_roadmap" | "view_mentor" | "do_exercise" | "manual";

export interface EngineContext {
  userId: string;
  journeyId: string;
  templateSlug?: string;
}

export interface MatchOutput {
  found: boolean;
  result?: MatchResult;
  requested?: boolean;
}

const SOURCE_MAP: Record<string, (keywords: string[], excludeIds: string[], ctx?: EngineContext) => Promise<MatchResult | null>> = {
  read_article: async (keywords, excludeIds) => matchArticle(keywords, excludeIds),
  comment_curhat: async (keywords, excludeIds, ctx) => matchCurhatToComment(keywords, excludeIds, ctx?.userId),
  support_curhat: async (keywords, excludeIds) => matchCurhatToSupport(keywords, excludeIds),
  join_circle: async (keywords, excludeIds) => matchCircle(keywords, excludeIds),
};

export async function matchContent(
  actionType: ActionType,
  keywords: string[],
  activityId: string,
  activityTitle: string,
  ctx: EngineContext,
): Promise<MatchOutput> {
  const matcher = SOURCE_MAP[actionType];
  if (!matcher) {
    return { found: false };
  }

  const excludeIds = await getExcludedContentIds(ctx.journeyId, actionType);

  const result = await matcher(keywords, excludeIds, ctx);

  if (result) {
    await recordSuggestion(result.contentId, result.contentType, ctx.journeyId, activityId);

    if (supabase) {
      await supabase
        .from("daily_activities")
        .update({
          matched_content_id: result.contentId,
          matched_content_type: result.contentType,
          matched_slug: result.slug,
          matched_title: result.title,
        })
        .eq("id", activityId);
    }

    return { found: true, result };
  }

  await createContentRequest({
    topic: keywords[0] || activityTitle,
    keywords,
    actionType,
    journeyTemplateSlug: ctx.templateSlug,
    activityTitle,
  });

  return { found: false, requested: true };
}
