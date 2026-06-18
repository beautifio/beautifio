import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: merchants } = await supabase
      .from("familia_merchants")
      .select("id, name, daily_pin, merchant_code")
      .limit(5);

    const { data: active } = await supabase
      .from("familia_voucher_sessions")
      .select("id, status, voucher_code, merchant:familia_merchants(id, name, daily_pin)")
      .eq("user_id", user.id)
      .eq("status", "active");

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      merchants: merchants || [],
      activeVouchers: active || [],
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { action, merchant_id, session_id, pin } = await request.json();

    if (action === "claim" && merchant_id) {
      const { data, error } = await supabase
        .rpc("claim_voucher", { p_merchant_id: merchant_id });

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ data });
    }

    if (action === "redeem" && session_id && pin) {
      const { data: session } = await supabase
        .from("familia_voucher_sessions")
        .select("*, merchant:familia_merchants(id, name, daily_pin)")
        .eq("id", session_id)
        .eq("user_id", user.id)
        .single();

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const merchantPin = (session.merchant as any)?.daily_pin;
      const pinMatch = pin === merchantPin;

      return NextResponse.json({
        pinCorrect: pinMatch,
        enteredPin: pin,
        expectedPin: merchantPin,
        merchantName: (session.merchant as any)?.name,
        status: session.status,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
