import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { merchant_id } = body;
    if (!merchant_id) return NextResponse.json({ error: "Missing merchant_id" }, { status: 400 });

    // Fetch merchant with rules
    const { data: merchant } = await supabase
      .from("familia_merchants")
      .select("id, name, daily_pin, monthly_quota, total_vouchers, total_redeemed, max_per_user, claim_start, claim_end, redeem_hours, redeem_minutes, code_prefix")
      .eq("id", merchant_id)
      .eq("is_active", true)
      .single();

    if (!merchant) return NextResponse.json({ error: "Merchant not found or inactive" }, { status: 404 });

    // Check claim period
    const now = new Date();
    if (merchant.claim_start && now < new Date(merchant.claim_start)) {
      return NextResponse.json({ error: "Masa klaim belum dimulai" }, { status: 400 });
    }
    if (merchant.claim_end && now > new Date(merchant.claim_end)) {
      return NextResponse.json({ error: "Masa klaim sudah berakhir" }, { status: 400 });
    }

    // Check quota
    const totalClaimed = (merchant.total_vouchers || 0);
    if (totalClaimed >= (merchant.monthly_quota || 50)) {
      return NextResponse.json({ error: "Kuota voucher sudah habis" }, { status: 400 });
    }

    // Check max per user
    const maxPerUser = merchant.max_per_user ?? 1;
    const { count: userClaims } = await supabase
      .from("familia_voucher_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("merchant_id", merchant_id);

    if (userClaims && userClaims >= maxPerUser) {
      return NextResponse.json({ error: `Kamu sudah klaim maksimal ${maxPerUser}x untuk merchant ini` }, { status: 429 });
    }

    // Check daily anti-fraud
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const { count: todayRedemptions } = await supabase
      .from("familia_redemption_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("merchant_id", merchant_id)
      .gte("redeemed_at", todayStart.toISOString())
      .lte("redeemed_at", todayEnd.toISOString());

    if (todayRedemptions && todayRedemptions > 0) {
      return NextResponse.json({ error: "Kamu sudah klaim voucher dari merchant ini hari ini" }, { status: 429 });
    }

    // Generate voucher code
    const prefix = merchant.code_prefix?.toUpperCase() || "VCH";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = `${prefix}-`;
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];

    // Set expiry based on redeem_hours + redeem_minutes
    const totalMinutes = (merchant.redeem_hours ?? 24) * 60 + (merchant.redeem_minutes ?? 0);
    const expiresAt = new Date(Date.now() + totalMinutes * 60 * 1000).toISOString();

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

    // Update merchant counters
    await supabase.from("familia_merchants").update({
      total_vouchers: (merchant.total_vouchers || 0) + 1,
    }).eq("id", merchant_id);

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
