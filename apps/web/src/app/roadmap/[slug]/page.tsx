import RoadmapDetailPage from "./page-client";
import { ROADMAP_TEMPLATES, ROADMAP_V3_SEED } from "@beautifio/utils";

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  const v3Slugs = Object.keys(ROADMAP_V3_SEED).map((slug) => ({ slug }));
  const v1Slugs = ROADMAP_TEMPLATES.map((t) => ({ slug: t.slug }));
  const all = new Map<string, { slug: string }>();
  for (const s of [...v3Slugs, ...v1Slugs]) all.set(s.slug, s);
  return Array.from(all.values());
}

export default RoadmapDetailPage;
