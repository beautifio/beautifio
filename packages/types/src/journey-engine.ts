/* ─── Journey Engine Types ─── */

export interface MatchResult {
  contentId: string;
  contentType: 'article' | 'curhat' | 'circle' | 'mentor' | 'roadmap' | 'journal';
  slug: string;
  title: string;
  source?: string;
  excerpt?: string;
  relevanceScore: number;
}

export interface ContentRequest {
  id: string;
  topic: string;
  keywords: string[];
  actionType: string;
  contentType: string;
  journeyTemplateSlug: string | null;
  activityTitle: string | null;
  status: 'pending' | 'in_progress' | 'published' | 'rejected';
  requestCount: number;
  createdAt: string;
}

export interface ContentSource {
  actionType: string;
  contentType: string;
  matchFields: string[];
  priority: number;
  match: (keywords: string[], excludeIds: string[], context?: any) => Promise<MatchResult | null>;
  completionCheck: (userId: string, contentId: string) => Promise<boolean>;
}

export interface EngineConfig {
  maxResultsPerSource: number;
  dedupScope: 'journey' | 'activity';
  defaultKeywords: string[];
}
