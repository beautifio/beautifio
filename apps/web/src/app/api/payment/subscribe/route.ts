import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutPayment } from "@/lib/doku/checkout";
import crypto from "crypto";

const CLIENT_ID = process.env.DOKU_CLIENT_ID || "";
const SECRET_KEY = process.env.DOKU_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan_id, voucher_code, amount: customAmount, sub_type, ref_id } = await request.json();

  // Handle consultation payment
  if (plan_id === "custom" && ref_id) {
    // Validate the consultation session exists and belongs to user
    const { data: consSess } = await supabase.from("consultation_sessions")
      .select("id, net_price, voucher_code").eq("id", ref_id).eq("user_id", user.id).single();
    if (!consSess) return NextResponse.json({ error: "Sesi tidak ditemukan" }, { status: 404 });

    let finalAmount = consSess.net_price || customAmount;
    let appliedVoucher: any = null;

    // Server-side voucher validation
    if (voucher_code?.trim()) {
      const { data: v } = await supabase.from("consultation_vouchers")
        .select("*").eq("code", voucher_code.trim().toUpperCase()).eq("is_active", true).single();
      if (!v) return NextResponse.json({ error: "Voucher tidak valid" }, { status: 400 });
      const now = new Date();
      if (v.valid_until && new Date(v.valid_until + "T23:59:59.999Z") < now) return NextResponse.json({ error: "Voucher kadaluarsa" }, { status: 400 });
      if (v.max_uses && v.used_count >= v.max_uses) return NextResponse.json({ error: "Kuota habis" }, { status: 400 });

      let discount = 0;
      if (v.discount_type === "percentage") discount = Math.round(finalAmount * (v.discount_value / 100));
      else discount = v.discount_value;
      finalAmount = Math.max(0, finalAmount - discount);
      appliedVoucher = v;

      // Update session with voucher
      await supabase.from("consultation_sessions").update({ voucher_code: v.code, net_price: finalAmount }).eq("id", ref_id);
    }

    const invoiceId = `CONS-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    await supabase.from("consultation_sessions").update({ payment_reference: invoiceId }).eq("id", ref_id).eq("user_id", user.id);

    if (appliedVoucher) {
      await supabase.from("consultation_vouchers").update({
        used_count: (appliedVoucher.used_count || 0) + 1,
      }).eq("id", appliedVoucher.id);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const { paymentUrl, error } = await createCheckoutPayment({
      clientId: CLIENT_ID, secretKey: SECRET_KEY,
      request: {
        amount: finalAmount, invoiceNumber: invoiceId,
        customer: { id: user.id, name: user.email || "", email: user.email || "" },
        callbackUrl: `${appUrl}/payment/return?sub=${ref_id}&type=consultation`,
        lineItems: [{ name: "Konsultasi Psikolog", price: finalAmount, quantity: 1, category: "consultation" }],
      },
      notificationUrl: `${appUrl}/api/payment/callback`,
    });
    if (error) return NextResponse.json({ error }, { status: 500 });
    return NextResponse.json({ payment_url: paymentUrl });
  }

  if (!plan_id) return NextResponse.json({ error: "Plan wajib" }, { status: 400 });

  const { data: plan } = await supabase.from("subscription_plans")
    .select("*").eq("id", plan_id).eq("is_active", true).single();
  if (!plan) return NextResponse.json({ error: "Plan tidak ditemukan" }, { status: 404 });

  // Check existing active subscription
  const { data: existingSub } = await supabase.from("user_subscriptions")
    .select("id").eq("user_id", user.id).eq("status", "active").maybeSingle();
  if (existingSub) return NextResponse.json({ error: "Kamu sudah punya subscription aktif" }, { status: 409 });

  let finalAmount = plan.price_idr || 0;
  let appliedVoucher: any = null;

  // Validate & apply voucher
  if (voucher_code?.trim()) {
    const { data: voucher } = await supabase.from("subscription_vouchers")
      .select("*").eq("code", voucher_code.trim().toUpperCase()).eq("is_active", true).single();

    if (!voucher) return NextResponse.json({ error: "Voucher tidak valid" }, { status: 400 });

    // Check expiry
    if (voucher.valid_until && new Date(voucher.valid_until + "T23:59:59.999Z") < new Date())
      return NextResponse.json({ error: "Voucher sudah kadaluarsa" }, { status: 400 });
    if (voucher.valid_from && new Date(voucher.valid_from) > new Date())
      return NextResponse.json({ error: "Voucher belum berlaku" }, { status: 400 });

    // Check quota
    if (voucher.max_uses && voucher.used_count >= voucher.max_uses)
      return NextResponse.json({ error: "Kuota voucher habis" }, { status: 400 });

    // Check min tier
    if (voucher.min_tier && plan.tier !== voucher.min_tier)
      return NextResponse.json({ error: `Voucher hanya untuk ${voucher.min_tier === "ultimate" ? "Ultimate" : "Pro"}` }, { status: 400 });

    // Apply discount
    let discountAmount = 0;
    if (voucher.discount_type === "percentage") {
      discountAmount = Math.round(finalAmount * (Number(voucher.discount_value) / 100));
    } else {
      discountAmount = Number(voucher.discount_value);
    }
    finalAmount = Math.max(0, finalAmount - discountAmount);
    appliedVoucher = voucher;
  }
  const invoiceId = `SUB-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  // Create subscription as pending first
  const durationDays = plan.duration_type === "yearly" ? 365 : plan.duration_type === "monthly" ? 30 : plan.duration_type === "quarterly" ? 90 : 30;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const { data: sub, error: subErr } = await supabase.from("user_subscriptions").insert({
    user_id: user.id, plan_id: plan.id, status: "pending",
    started_at: now.toISOString(), expires_at: expiresAt.toISOString(),
    payment_ref: invoiceId,
  }).select().single();
  if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 });

  // Increment voucher used count
  if (appliedVoucher) {
    await supabase.from("subscription_vouchers").update({
      used_count: (appliedVoucher.used_count || 0) + 1,
    }).eq("id", appliedVoucher.id);
  }

  // If amount is 0 (free), activate immediately
  if (finalAmount === 0) {
    await supabase.from("user_subscriptions").update({ status: "active" }).eq("id", sub.id);
    return NextResponse.json({ payment_url: null, sub_id: sub.id });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const callbackUrl = `${appUrl}/payment/return?sub=${sub.id}`;
  const notificationUrl = `${appUrl}/api/payment/callback`;

  const { paymentUrl, error } = await createCheckoutPayment({
    clientId: CLIENT_ID, secretKey: SECRET_KEY,
    request: {
      amount: finalAmount, invoiceNumber: invoiceId,
      customer: { id: user.id, name: user.email || "", email: user.email || "" },
      callbackUrl,
      lineItems: [{ name: plan.name, price: finalAmount, quantity: 1, category: "subscription" }],
    },
    notificationUrl,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ payment_url: paymentUrl, sub_id: sub.id });
}
