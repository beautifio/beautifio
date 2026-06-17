export { matchContent } from "./matcher";
export { matchArticle } from "./sources/articles";
export { matchCurhatToComment, matchCurhatToSupport } from "./sources/curhats";
export { matchCircle } from "./sources/circles";
export { getExcludedContentIds, recordSuggestion } from "./dedup";
export { createContentRequest } from "./requester";
export { registerSource, getRegisteredSources, isActionTypeRegistered } from "./register";
export type { ActionType, EngineContext, MatchOutput } from "./matcher";
export type { MatchResult } from "./sources/articles";
