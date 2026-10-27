import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Global search. Prisma-backed (migration off Supabase).
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const [articlesRes, circlesRes, oppsRes] = await Promise.allSettled([
    prisma.articles.findMany({
      where: {
        is_published: true,
        OR: [{ title: { contains: q, mode: "insensitive" } }, { tags: { has: q } }],
      },
      select: { id: true, slug: true, title: true, cover_image: true, category: true },
      take: 5,
    }),
    prisma.circle_submissions.findMany({
      where: { status: "approved", name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, description: true },
      take: 5,
    }),
    prisma.opportunities.findMany({
      where: { is_active: true, title: { contains: q, mode: "insensitive" } },
      select: { id: true, title: true, organization: true, category: true },
      take: 5,
    }),
  ]);

  const results: { type: string; items: any[] }[] = [];

  if (articlesRes.status === "fulfilled" && articlesRes.value.length) {
    results.push({ type: "articles", items: articlesRes.value.map((a) => ({
      id: a.id, slug: a.slug, title: a.title, image: a.cover_image,
      subtitle: a.category || "Artikel", href: `/inspirasi/${a.slug}`,
    })) });
  }

  if (circlesRes.status === "fulfilled" && circlesRes.value.length) {
    results.push({ type: "circles", items: circlesRes.value.map((c) => ({
      id: c.id, title: c.name, subtitle: c.description?.slice(0, 80) || "Circle",
      href: `/circle/${c.id}`,
    })) });
  }

  if (oppsRes.status === "fulfilled" && oppsRes.value.length) {
    results.push({ type: "opportunities", items: oppsRes.value.map((o) => ({
      id: o.id, title: o.title, subtitle: o.organization || o.category || "Peluang",
      href: `/opportunity/${o.id}`,
    })) });
  }

  return NextResponse.json({ results });
}
