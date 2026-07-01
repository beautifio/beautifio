import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from("familia_merchants")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/familia/merchants/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("familia_merchants")
      .update({
        name: body.name,
        slug: body.slug,
        category: body.category,
        description: body.description,
        merchant_code: body.merchant_code,
        daily_pin: body.daily_pin,
        monthly_quota: body.monthly_quota,
        voucher_types: body.voucher_types,
        is_active: body.is_active,
        logo_url: body.logo_url,
        cover_url: body.cover_url,
        max_per_user: body.max_per_user,
        claim_start: body.claim_start,
        claim_end: body.claim_end,
        redeem_hours: body.redeem_hours,
        redeem_minutes: body.redeem_minutes,
        code_prefix: body.code_prefix,
        city: body.city,
        free_product_name: body.free_product_name,
        discount_value: body.discount_value,
        promo_buy: body.promo_buy,
        promo_get: body.promo_get,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("PUT /api/familia/merchants/[id]:", error);
      return NextResponse.json({ error: "Failed to update merchant" }, { status: 500 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT /api/familia/merchants/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!(await checkAdmin(supabase))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { error } = await supabase.from("familia_merchants").delete().eq("id", id);

    if (error) {
      console.error("DELETE /api/familia/merchants/[id]:", error);
      return NextResponse.json({ error: "Failed to delete merchant" }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/familia/merchants/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
