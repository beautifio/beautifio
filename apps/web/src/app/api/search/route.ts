import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const supabase = await createClient();

  const [articlesRes, circlesRes, oppsRes] = await Promise.allSettled([
    supabase.from("articles").select("id, slug, title, cover_image, category, author_type")
      .eq("is_published", true).ilike("title", `%${q}%`).limit(5),
    supabase.from("circle_submissions").select("id, name, description")
      .eq("status", "approved").ilike("name", `%${q}%`).limit(5),
    supabase.from("opportunities").select("id, title, organization, category")
      .eq("is_active", true).ilike("title", `%${q}%`).limit(5),
  ]);

  const results: { type: string; items: any[] }[] = [];

  if (articlesRes.status === "fulfilled" && articlesRes.value.data?.length) {
    results.push({ type: "articles", items: articlesRes.value.data.map((a: any) => ({
      id: a.id, slug: a.slug, title: a.title, image: a.cover_image,
      subtitle: a.category || "Artikel", href: `/inspirasi/${a.slug}`,
    })) });
  }

  if (circlesRes.status === "fulfilled" && circlesRes.value.data?.length) {
    results.push({ type: "circles", items: circlesRes.value.data.map((c: any) => ({
      id: c.id, title: c.name, subtitle: c.description?.slice(0, 80) || "Circle",
      href: `/circle/${c.id}`,
    })) });
  }

  if (oppsRes.status === "fulfilled" && oppsRes.value.data?.length) {
    results.push({ type: "opportunities", items: oppsRes.value.data.map((o: any) => ({
      id: o.id, title: o.title, subtitle: o.organization || o.category || "Peluang",
      href: `/opportunity/${o.id}`,
    })) });
  }

  return NextResponse.json({ results });
}
