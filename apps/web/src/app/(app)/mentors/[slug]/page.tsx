import MentorProfilePage from "./page-client";
import { MOCK_MENTORS } from "@beautifio/utils";

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return MOCK_MENTORS.map((m) => ({ slug: m.slug }));
}

export default MentorProfilePage;
