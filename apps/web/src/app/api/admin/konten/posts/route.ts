import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

type Supabase = ReturnType<typeof createRouteClient>;

async function checkRole(supabase: Supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!admin || !["redaksi", "superadmin"].includes(admin.role)) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient(request);
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("GET /api/admin/konten/posts:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteClient(request);
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json({ error: "title and content required" }, { status: 400 });
    }

    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);

    const { data, error } = await supabase
      .from("articles")
      .insert({
        slug,
        type: "story",
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || "",
        category: body.category || "artikel",
        cover_image: body.cover_image || "",
        author: body.author_name || user.email || "",
        initials: (body.author_name || user.email || "").charAt(0).toUpperCase(),
        source: "redaksi",
        is_published: body.status === "published",
        read_time_minutes: body.read_time_minutes || 5,
        meta_title: body.meta_title || "",
        meta_description: body.meta_description || "",
        og_image: body.og_image || "",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("POST /api/admin/konten/posts:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
