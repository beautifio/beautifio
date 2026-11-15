import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "@/lib/auth/server-auth";

// GET is public → Prisma. POST (admin) uses our own bf_session JWT
// (custom auth, Stage 3 landed).
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      const data = await prisma.familia_affiliate_deals.findFirst({
        where: { slug, is_active: true },
      });
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data });
    }

    const data = await prisma.familia_affiliate_deals.findMany({
      where: { is_active: true },
      orderBy: [{ is_featured: "desc" }, { created_at: "desc" }],
    });
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/familia/deals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getServerUser();
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
