import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutPayment } from "@/lib/doku/checkout";
import crypto from "crypto";

const CLIENT_ID = process.env.DOKU_CLIENT_ID || "";
const SECRET_KEY = process.env.DOKU_SECRET_KEY || "";

function validateEmail(email: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { event_id, whatsapp, name, email, promo_code, validate_promo } = await request.json();

  // Validate-only mode — skip auth validation, only need event + promo
  if (validate_promo) {
    if (!event_id) return NextResponse.json({ error: "Event wajib" }, { status: 400 });
    if (!promo_code?.trim()) return NextResponse.json({ error: "Masukkan kode promo" }, { status: 400 });

    const { data: promoEvent } = await supabase.from("familia_event_benefits")
      .select("price, discount_type, discount_value, code").eq("id", event_id).single();
    if (!promoEvent) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });
    if (!promoEvent.discount_type) return NextResponse.json({ error: "Event ini tidak memiliki diskon" }, { status: 400 });
    if (promoEvent.code && promo_code.trim().toUpperCase() !== promoEvent.code.trim().toUpperCase()) {
      return NextResponse.json({ error: "Kode promo tidak valid" }, { status: 400 });
    }

    const baseAmount = promoEvent.price || 0;
    let finalAmount = baseAmount;
    if (promoEvent.discount_type === "percentage") {
      finalAmount = baseAmount - baseAmount * (Number(promoEvent.discount_value) / 100);
    } else if (promoEvent.discount_type === "nominal") {
      finalAmount = baseAmount - Number(promoEvent.discount_value);
    } else if (promoEvent.discount_type === "free") {
      finalAmount = 0;
    }
    finalAmount = Math.max(0, Math.round(finalAmount));
    return NextResponse.json({ final_price: finalAmount, original_price: baseAmount, discount_type: promoEvent.discount_type, discount_value: Number(promoEvent.discount_value) });
  }

  // Normal registration flow
  if (!event_id || !name?.trim() || !email?.trim()) return NextResponse.json({ error: "Nama, email, dan event wajib" }, { status: 400 });
  if (!validateEmail(email.trim())) return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });

  const { data: event } = await supabase.from("familia_event_benefits")
    .select("id, title, slug, price, is_free, is_active, quota, registration_deadline, discount_type, discount_value, code").eq("id", event_id).single();
  if (!event || !event.is_active) return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 });

  // Check deadline
  if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
    return NextResponse.json({ error: "Batas pendaftaran sudah lewat" }, { status: 400 });
  }

  // Check quota
  if (event.quota) {
    const { count } = await supabase.from("event_registrations")
      .select("*", { count: "exact", head: true }).eq("event_id", event_id)
      .in("status", ["pending", "confirmed"]);
    if (count && count >= event.quota) return NextResponse.json({ error: "Kuota sudah penuh" }, { status: 400 });
  }

  // Calculate final price with discount
  const baseAmount = event.price || 0;
  let finalAmount = baseAmount;

  if (event.discount_type && event.discount_value && baseAmount > 0) {
    const promoValid = event.code ? promo_code?.trim().toUpperCase() === event.code.trim().toUpperCase() : true;
    if (promoValid) {
      if (event.discount_type === "percentage") {
        finalAmount = baseAmount - baseAmount * (Number(event.discount_value) / 100);
      } else if (event.discount_type === "nominal") {
        finalAmount = baseAmount - Number(event.discount_value);
      } else if (event.discount_type === "free") {
        finalAmount = 0;
      }
      finalAmount = Math.max(0, Math.round(finalAmount));
    } else if (promo_code?.trim()) {
      return NextResponse.json({ error: "Kode promo tidak valid" }, { status: 400 });
    }
  }

  // Handle existing registrations — allow retry for pending AND rejected
  const { data: existing } = await supabase.from("event_registrations")
    .select("id, status").eq("event_id", event_id).eq("user_id", user.id).maybeSingle();

  if (existing) {
    if (existing.status === "pending" || existing.status === "rejected") {
      await supabase.from("event_registrations").delete().eq("id", existing.id);
    } else {
      return NextResponse.json({ error: "Sudah terdaftar" }, { status: 409 });
    }
  }

  const invoiceId = `EVT-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = whatsapp?.trim() || null;
  const trimmedPromo = promo_code?.trim() || null;

  const isFree = event.is_free !== false || finalAmount === 0;
  const initialStatus = isFree ? "confirmed" : "pending";

  const { data: reg, error: regErr } = await supabase.from("event_registrations").insert({
    event_id, user_id: user.id, whatsapp: trimmedPhone, name: trimmedName, email: trimmedEmail,
    status: initialStatus, invoice_id: invoiceId, promo_code: trimmedPromo,
  }).select().single();
  if (regErr) return NextResponse.json({ error: regErr.message }, { status: 500 });

  // Auto-confirm free registrations
  if (isFree) {
    await supabase.from("notifications").insert({
      user_id: user.id, type: "event_confirmed",
      title: "Pendaftaran berhasil!", body: `Kamu terdaftar di "${event.title}".`,
      data: { reg_id: reg.id, event_title: event.title },
    });
    return NextResponse.json({ payment_url: null, reg_id: reg.id, confirmed: true });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const callbackUrl = `${appUrl}/payment/return?order_id=${invoiceId}`;
  const notificationUrl = `${appUrl}/api/payment/callback`;

  const { paymentUrl, error } = await createCheckoutPayment({
    clientId: CLIENT_ID,
    secretKey: SECRET_KEY,
    request: {
      amount: Math.round(finalAmount),
      invoiceNumber: invoiceId,
      customer: { id: user.id, name: trimmedName, email: trimmedEmail, phone: trimmedPhone || "" },
      callbackUrl,
      lineItems: [{ name: event.title, price: Math.round(finalAmount), quantity: 1, category: "ticketing" }],
    },
    notificationUrl,
  });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ payment_url: paymentUrl, reg_id: reg.id });
}
