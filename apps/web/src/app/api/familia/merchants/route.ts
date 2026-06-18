import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("familia_merchants")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("GET /api/familia/merchants:", error);
      return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/familia/merchants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
    if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { data, error } = await supabase.from("familia_merchants").insert({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
      category: body.category || "makanan",
      description: body.description || "",
      merchant_code: body.merchant_code,
      daily_pin: body.daily_pin || "0000",
      monthly_quota: body.monthly_quota || 30,
      voucher_types: body.voucher_types || [],
      is_active: body.is_active ?? true,
    }).select().single();

    if (error) {
      console.error("POST /api/familia/merchants:", error);
      return NextResponse.json({ error: "Failed to create merchant" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST /api/familia/merchants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
