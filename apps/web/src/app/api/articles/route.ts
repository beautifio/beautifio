import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Published articles for the Inspirasi list. Prisma-backed replacement for the
// browser Supabase read in (app)/inspirasi/page.tsx (migration off Supabase).
export async function GET() {
  try {
    const articles = await prisma.articles.findMany({
      where: { is_published: true },
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ articles });
  } catch (e: any) {
    return NextResponse.json({ articles: [], error: e?.message ?? String(e) }, { status: 500 });
  }
}
