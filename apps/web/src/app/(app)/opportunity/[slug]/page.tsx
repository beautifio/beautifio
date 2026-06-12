import OpportunityDetailPage from "./page-client";
import { MOCK_OPPORTUNITIES } from "@beautifio/utils";

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return MOCK_OPPORTUNITIES.map((o) => ({ slug: o.slug }));
}

export default OpportunityDetailPage;
