import CircleDetailPage from "./page-client";

export const dynamicParams = false;
export const dynamic = 'force-static';

export async function generateStaticParams() {
  return Array.from({ length: 12 }, (_, i) => ({ id: String(i + 1) }));
}

export default CircleDetailPage;
