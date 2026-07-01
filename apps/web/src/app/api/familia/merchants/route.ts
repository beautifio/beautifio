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
    const reportToken = Array.from({ length: 16 }, () => Math.random().toString(36)[2]).join("");
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
      max_per_user: body.max_per_user ?? 1,
      claim_start: body.claim_start || null,
      claim_end: body.claim_end || null,
      redeem_hours: body.redeem_hours ?? 24,
      redeem_minutes: body.redeem_minutes ?? 0,
      code_prefix: body.code_prefix || null,
      city: body.city || null,
      free_product_name: body.free_product_name || null,
      discount_value: body.discount_value || null,
      promo_buy: body.promo_buy || null,
      promo_get: body.promo_get || null,
      report_token: reportToken,
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
