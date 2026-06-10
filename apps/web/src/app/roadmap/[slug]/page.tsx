import RoadmapDetailPage from "./page-client";
import { ROADMAP_TEMPLATES } from "@beautifio/utils";

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return ROADMAP_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export default RoadmapDetailPage;
