import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { merchant_id } = body;

    if (!merchant_id) {
      return NextResponse.json({ error: "Missing merchant_id" }, { status: 400 });
    }

    // verify merchant exists and is active
    const { data: merchant } = await supabase
      .from("familia_merchants")
      .select("id, name, daily_pin, monthly_quota, total_vouchers, total_redeemed")
      .eq("id", merchant_id)
      .eq("is_active", true)
      .single();

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found or inactive" }, { status: 404 });
    }

    // check daily anti-fraud: one redemption per user per merchant per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { count: todayRedemptions } = await supabase
      .from("familia_redemption_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("merchant_id", merchant_id)
      .gte("redeemed_at", todayStart.toISOString())
      .lte("redeemed_at", todayEnd.toISOString());

    if (todayRedemptions && todayRedemptions > 0) {
      return NextResponse.json(
        { error: "Kamu sudah klaim voucher dari merchant ini hari ini" },
        { status: 429 }
      );
    }

    // generate voucher code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "VCH-";
    for (let i = 0; i < 5; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }

    // create session (15 min expiry)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { data: session, error: insertError } = await supabase
      .from("familia_voucher_sessions")
      .insert({
        user_id: user.id,
        merchant_id,
        voucher_code: code,
        status: "active",
        pin_required: merchant.daily_pin,
        activated_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create voucher session:", insertError);
      return NextResponse.json({ error: "Failed to create voucher" }, { status: 500 });
    }

    // update merchant counters
    await supabase
      .from("familia_merchants")
      .update({
        total_vouchers: (merchant.total_vouchers || 0) + 1,
      })
      .eq("id", merchant_id);

    return NextResponse.json({
      success: true,
      data: {
        id: session.id,
        voucher_code: session.voucher_code,
        expires_at: session.expires_at,
        merchant_name: merchant.name,
      },
    });
  } catch (error) {
    console.error("POST /api/familia/vouchers/claim:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
