import CeritaDetailPage, { MOCK_STORIES } from "./page-client";

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return Object.keys(MOCK_STORIES).map((slug) => ({ slug }));
}

export default CeritaDetailPage;
