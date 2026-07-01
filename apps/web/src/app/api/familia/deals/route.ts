import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      const { data, error } = await supabase
        .from("familia_affiliate_deals")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("familia_affiliate_deals")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/familia/deals:", error);
      return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/familia/deals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin" && admin.role !== "redaksi")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { data, error } = await supabase.from("familia_affiliate_deals").insert({
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
      description: body.description || "",
      image_url: body.image_url || "",
      category: body.category || "umum",
      partner_name: body.partner_name,
      partner_url: body.partner_url,
      platform: body.platform || "website",
      goal_category: body.goal_category || null,
      is_featured: body.is_featured ?? false,
      is_active: body.is_active ?? true,
      hot_deal_order: body.hot_deal_order ? parseInt(body.hot_deal_order) : null,
      hot_deal_expires: body.hot_deal_expires || null,
      partners: body.partners || [],
    }).select().single();

    if (error) {
      console.error("POST /api/familia/deals:", error);
      return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/familia/deals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
