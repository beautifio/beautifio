import JournalDetailPage from "./page-client";
import { MOCK_JOURNALS, getStoredJournals } from "@beautifio/utils";

export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = MOCK_JOURNALS.map((j) => ({ slug: j.slug }));
  return slugs;
}

export default JournalDetailPage;
