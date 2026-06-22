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

const CATEGORY_LABELS: Record<string, string> = {
  "mind-body": "Mind & Body",
  "glow-glowup": "Glow & Glow Up",
  "levelup-career": "Level Up & Career",
  "relationship": "Relationship",
  "creative-space": "Creative Space",
  "tech-gaming": "Tech & Gaming",
};

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient(request);
    const user = await checkRole(supabase);
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const includeTrash = request.nextUrl.searchParams.get("trash") === "1";

    let query = supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!includeTrash) {
      query = query.is("deleted_at", null);
    } else {
      query = query.not("deleted_at", "is", null);
    }

    const { data, error } = await query;

    if (error) throw error;

    const enriched = (data || []).map((a: any) => ({
      ...a,
      category_label: a.category_id ? (CATEGORY_LABELS[a.category_id] || a.category) : a.category,
    }));

    return NextResponse.json({ data: enriched });
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
    const isScheduled = body.scheduled_at && new Date(body.scheduled_at) > new Date();

    const categoryId = body.category_id || "mind-body";
    const categoryLabel = CATEGORY_LABELS[categoryId] || categoryId;

    const insertData: any = {
      slug,
      type: "story",
      title: body.title,
      content: body.content,
      excerpt: body.excerpt || "",
      category: categoryLabel,
      category_id: categoryId,
      cover_image: body.cover_image || "",
      author: body.author_name || user.email || "",
      initials: (body.author_name || user.email || "").charAt(0).toUpperCase(),
      source: body.author_type || "redaksi",
      is_published: body.status === "published" || false,
      scheduled_at: isScheduled ? body.scheduled_at : null,
      read_time_minutes: body.read_time_minutes || 5,
      meta_title: body.meta_title || "",
      meta_description: body.meta_description || "",
      og_image: body.og_image || "",
      author_type: body.author_type || "redaksi",
      architecture: body.architecture || null,
      review_status: body.review_status || "ready",
      disclaimer_type: body.disclaimer_type || "none",
      disclaimer_custom: body.disclaimer_custom || null,
      author_credentials: body.author_credentials || null,
      author_anon_name: body.author_anon_name || null,
      series_id: body.series_id || null,
    };

    const { data, error } = await supabase
      .from("articles")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("POST /api/admin/konten/posts:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
