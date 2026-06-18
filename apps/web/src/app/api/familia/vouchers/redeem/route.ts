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
    const { session_id, pin } = body;

    if (!session_id || !pin) {
      return NextResponse.json(
        { error: "Missing session_id or pin" },
        { status: 400 }
      );
    }

    // find the session
    const { data: session } = await supabase
      .from("familia_voucher_sessions")
      .select("*, merchant:familia_merchants(id, name, daily_pin)")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Voucher session not found" }, { status: 404 });
    }

    if (session.status !== "active") {
      await supabase.from("familia_redemption_log").insert({
        user_id: user.id,
        merchant_id: session.merchant_id,
        voucher_code: session.voucher_code,
        pin_entered: pin,
        status: session.status === "expired" ? "expired" : "duplicate",
      });

      return NextResponse.json(
        { error: `Voucher sudah ${session.status === "expired" ? "kedaluwarsa" : "digunakan"}` },
        { status: 400 }
      );
    }

    // check expiry
    if (new Date(session.expires_at) < new Date()) {
      await supabase
        .from("familia_voucher_sessions")
        .update({ status: "expired" })
        .eq("id", session_id);

      await supabase.from("familia_redemption_log").insert({
        user_id: user.id,
        merchant_id: session.merchant_id,
        voucher_code: session.voucher_code,
        pin_entered: pin,
        status: "expired",
      });

      return NextResponse.json(
        { error: "Voucher sudah kedaluwarsa" },
        { status: 400 }
      );
    }

    // validate PIN
    const merchantPin = (session.merchant as any)?.daily_pin;
    if (pin !== merchantPin) {
      await supabase.from("familia_redemption_log").insert({
        user_id: user.id,
        merchant_id: session.merchant_id,
        voucher_code: session.voucher_code,
        pin_entered: pin,
        status: "invalid_pin",
      });

      return NextResponse.json({ error: "PIN salah" }, { status: 400 });
    }

    // success — mark as redeemed
    const now = new Date().toISOString();

    await supabase
      .from("familia_voucher_sessions")
      .update({ status: "redeemed", redeemed_at: now })
      .eq("id", session_id);

    await supabase.from("familia_redemption_log").insert({
      user_id: user.id,
      merchant_id: session.merchant_id,
      voucher_code: session.voucher_code,
      pin_entered: pin,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      data: {
        merchant_name: (session.merchant as any)?.name,
        voucher_code: session.voucher_code,
      },
    });
  } catch (error) {
    console.error("POST /api/familia/vouchers/redeem:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
