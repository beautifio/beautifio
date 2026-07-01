import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ confirmed: false, message: "Unauthorized" }, { status: 401 });

  const { invoice_id, sub_id, ref_id } = await request.json();

  // Handle consultation payment first (check before subscription)
  const { data: consSession } = await supabase.from("consultation_sessions")
    .select("id, status, payment_reference").eq("id", sub_id || ref_id || "").eq("user_id", user.id).maybeSingle();
  if (consSession) {
    if (consSession.status === "scheduled" || consSession.status === "active") return NextResponse.json({ confirmed: true, message: "Sudah aktif" });
    if (consSession.status === "pending_payment") {
      // Verify payment via Doku
      if (consSession.payment_reference) {
        const dokuRes = await fetch("https://api.doku.com/checkout/v1/payment/" + consSession.payment_reference, {
          headers: { "Client-Id": process.env.DOKU_CLIENT_ID || "", "Request-Id": crypto.randomUUID(), "Request-Timestamp": new Date().toISOString() },
        }).catch(() => null);
        if (!dokuRes?.ok) return NextResponse.json({ confirmed: false, message: "Pembayaran belum terverifikasi. Silakan menunggu." });
      }

      const { data: fullSession } = await supabase.from("consultation_sessions")
        .select("*, psychologist:psychologists(full_name)").eq("id", consSession.id).single();
      await supabase.from("consultation_sessions").update({ status: "scheduled" }).eq("id", consSession.id);

      // Create care chat bridge
      const psyName = (fullSession?.psychologist as any)?.full_name || "Psikolog";
      const { data: careSession } = await supabase.from("care_chat_sessions").insert({
        user_id: user.id, category: "psikologi",
        user_name: user.email || "User",
        status: "active", officer_id: fullSession?.psychologist_id,
      }).select("id").single();

      if (careSession) {
        await supabase.from("care_chat_messages").insert({
          session_id: careSession.id, sender_role: "system",
          content: `Konsultasi dengan ${psyName} telah dijadwalkan. Silakan tunggu psikolog memulai sesi.`,
        });
        await supabase.from("consultation_sessions").update({ payment_reference: careSession.id }).eq("id", consSession.id);
      }

      await supabase.from("notifications").insert({
        user_id: user.id, type: "care_new_session",
        title: "Konsultasi terjadwal!", body: `${psyName} akan segera menghubungimu.`,
        data: { session_id: consSession.id, link_url: "/care/chat" },
      });
      return NextResponse.json({ confirmed: true });
    }
    return NextResponse.json({ confirmed: false, message: "Status tidak valid" });
  }

  // Handle subscription confirmation
  if (sub_id) {
    const { data: sub } = await supabase.from("user_subscriptions")
      .select("id, status, payment_ref, created_at, plan_id, expires_at").eq("id", sub_id).eq("user_id", user.id).single();

    if (!sub) return NextResponse.json({ confirmed: false, message: "Subscription tidak ditemukan" });
    if (sub.status === "active") return NextResponse.json({ confirmed: true, message: "Sudah aktif" });
    if (sub.status !== "pending") return NextResponse.json({ confirmed: false, message: "Status tidak valid" });

    // Verify payment was initiated: must have payment_ref and be created within 2 hours
    if (!sub.payment_ref) return NextResponse.json({ confirmed: false, message: "Pembayaran belum dimulai" });
    const created = new Date(sub.created_at).getTime();
    if (Date.now() - created > 7200000) {
      return NextResponse.json({ confirmed: false, message: "Sesi pembayaran expired. Silakan coba lagi." });
    }

    // Verify payment via Doku callback status — Doku webhook is the source of truth
    // This endpoint is a polling fallback ONLY if Doku webhook arrives late
    const dokuRes = await fetch("https://api.doku.com/checkout/v1/payment/" + sub.payment_ref, {
      headers: { "Client-Id": process.env.DOKU_CLIENT_ID || "", "Request-Id": crypto.randomUUID(), "Request-Timestamp": new Date().toISOString() },
    }).catch(() => null);

    if (!dokuRes?.ok) {
      return NextResponse.json({ confirmed: false, message: "Pembayaran belum terverifikasi. Silakan menunggu." });
    }

    const j = await dokuRes.json();
    const dokuOk = j?.transaction?.status === "SUCCESS" || j?.response?.order?.invoice_number === sub.payment_ref;

    if (!dokuOk) return NextResponse.json({ confirmed: false, message: "Pembayaran belum selesai. Silakan selesaikan pembayaran terlebih dahulu." });

    await supabase.from("user_subscriptions").update({
      status: "active", started_at: new Date().toISOString(),
    }).eq("id", sub.id);

    const { data: plan } = await supabase.from("subscription_plans")
      .select("name").eq("id", sub.plan_id).single();
    const expiryStr = new Date(sub.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    await supabase.from("notifications").insert({
      user_id: user.id, type: "subscription_active",
      title: "Subscription aktif!",
      body: `Langganan ${plan?.name || "Pro"} sudah aktif sampai ${expiryStr}. Selamat menikmati!`,
      data: { sub_id: sub.id },
    });

    return NextResponse.json({ confirmed: true });
  }

  // Handle event registration confirmation
  if (!invoice_id) return NextResponse.json({ confirmed: false, message: "Missing invoice" }, { status: 400 });

  const { data: reg } = await supabase.from("event_registrations")
    .select("id, status, event:familia_event_benefits(title)")
    .eq("user_id", user.id)
    .or(`invoice_id.eq.${invoice_id},payment_proof_url.eq.${invoice_id}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!reg) return NextResponse.json({ confirmed: false, message: "Pendaftaran tidak ditemukan" });

  // Already confirmed — no-op, return success (fixes race condition)
  if (reg.status === "confirmed") {
    return NextResponse.json({ confirmed: true, message: "Sudah dikonfirmasi" });
  }

  if (reg.status !== "pending") {
    return NextResponse.json({ confirmed: false, message: "Status pendaftaran tidak valid" });
  }

  await supabase.from("event_registrations").update({
    status: "confirmed",
    updated_at: new Date().toISOString(),
  }).eq("id", reg.id);

  await supabase.from("notifications").insert({
    user_id: user.id,
    type: "event_confirmed",
    title: "Pembayaran berhasil!",
    body: `Pendaftaranmu untuk "${(reg.event as any)?.title || "Event"}" telah dikonfirmasi. Cek tiketmu di Eventku.`,
    data: { reg_id: reg.id },
  });

  return NextResponse.json({ confirmed: true });
}
