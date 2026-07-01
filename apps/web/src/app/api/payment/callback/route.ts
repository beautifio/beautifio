import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyNotificationSignature } from "@/lib/doku/checkout";

const SECRET_KEY = process.env.DOKU_SECRET_KEY || "";

export async function POST(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ responseCode: "4005600", responseMessage: "Invalid body" }, { status: 400 });
    }

    // Signature validation — ALWAYS verify if SECRET_KEY is configured
    const sigHeader = request.headers.get("x-signature");
    const tsHeader = request.headers.get("x-timestamp");

    if (SECRET_KEY) {
      if (!sigHeader || !tsHeader) {
        console.warn("Doku callback: missing signature headers");
        return NextResponse.json({ responseCode: "4015600", responseMessage: "Missing signature" }, { status: 401 });
      }
      const valid = verifyNotificationSignature(
        body,
        { "x-signature": sigHeader, "x-timestamp": tsHeader, "x-partner-id": request.headers.get("x-partner-id") || undefined },
        "/api/payment/callback",
        SECRET_KEY
      );
      if (!valid) {
        console.warn("Doku callback: invalid signature");
        return NextResponse.json({ responseCode: "4015600", responseMessage: "Invalid signature" }, { status: 401 });
      }
    }

    // Extract invoice number — Doku sends it in various formats
    const invoiceNumber =
      body.originalPartnerReferenceNo ||
      body.order?.invoice_number ||
      body.response?.order?.invoice_number ||
      body.transaction?.invoice_number ||
      body.originalExternalId ||
      body.partnerReferenceNo;

    if (!invoiceNumber) {
      console.warn("Doku callback: missing invoice");
      return NextResponse.json({ responseCode: "2005600", responseMessage: "Acknowledged" });
    }

    const statusCode =
      body.latestTransactionStatus ||
      body.transaction?.status ||
      body.response?.transaction?.status ||
      body.result ||
      body.transactionStatus;

    const supabase = await createClient();
    const isSuccess = statusCode === "00" || statusCode === "SUCCESS" || statusCode === "success";

    console.log("Doku callback:", { invoiceNumber, statusCode, isSuccess });

    // Check event registrations first
    const { data: reg } = await supabase.from("event_registrations")
      .select("id, status, user_id, event:familia_event_benefits(title)")
      .or(`invoice_id.eq.${invoiceNumber},payment_proof_url.eq.${invoiceNumber}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (reg) {
      let regStatus = reg.status;
      if (isSuccess) regStatus = "confirmed";
      else if (statusCode === "05" || statusCode === "CANCELLED" || statusCode === "CANCELED" || statusCode === "FAILED" || statusCode === "06") regStatus = "rejected";

      if (regStatus !== reg.status) {
        await supabase.from("event_registrations").update({
          status: regStatus, updated_at: new Date().toISOString(),
        }).eq("id", reg.id);

        if (regStatus === "confirmed") {
          await supabase.from("notifications").insert({
            user_id: reg.user_id, type: "event_confirmed",
            title: "Pembayaran berhasil!",
            body: `Pendaftaranmu untuk "${(reg.event as any)?.title || "Event"}" telah dikonfirmasi.`,
            data: { reg_id: reg.id },
          });
        }
      }
      return NextResponse.json({ responseCode: "2005600", responseMessage: "Success" });
    }

    // Check subscription payments — match by payment_ref
    const { data: sub } = await supabase.from("user_subscriptions")
      .select("id, status, user_id, expires_at, plan:subscription_plans(name)")
      .or(`payment_ref.eq.${invoiceNumber},payment_ref.ilike.%${invoiceNumber}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (sub) {
      if (isSuccess && sub.status === "pending") {
        await supabase.from("user_subscriptions").update({
          status: "active", started_at: new Date().toISOString(),
        }).eq("id", sub.id);

        if (typeof invoiceNumber === "string" && invoiceNumber.includes("|voucher:")) {
          const voucherId = invoiceNumber.split("|voucher:")[1];
          if (voucherId) {
            await supabase.rpc("increment_subscription_voucher_count", { p_voucher_id: voucherId });
          }
        }

        const expiryStr = sub.expires_at ? new Date(sub.expires_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "";
        await supabase.from("notifications").insert({
          user_id: sub.user_id, type: "subscription_active",
          title: "Subscription aktif!",
          body: `Langganan ${(sub.plan as any)?.name || "Pro"} sudah aktif${expiryStr ? " sampai " + expiryStr : ""}. Selamat menikmati!`,
          data: { sub_id: sub.id },
        });
      }
      return NextResponse.json({ responseCode: "2005600", responseMessage: "Success" });
    }

    // Check consultation payments
    const { data: consSession } = await supabase.from("consultation_sessions")
      .select("id, status, user_id, psychologist:psychologists(full_name)").or(`payment_reference.eq.${invoiceNumber},payment_reference.ilike.%${invoiceNumber}%`)
      .order("created_at", { ascending: false }).limit(1).single();

    if (consSession) {
      if (isSuccess && consSession.status === "pending_payment") {
        const psyName = (consSession.psychologist as any)?.full_name || "Psikolog";
        await supabase.from("consultation_sessions").update({ status: "scheduled" }).eq("id", consSession.id);
        await supabase.from("notifications").insert({
          user_id: consSession.user_id, type: "care_new_session",
          title: "Konsultasi terjadwal!", body: `${psyName} akan segera menghubungimu.`,
          data: { session_id: consSession.id, link_url: "/care/chat" },
        });
      }
      return NextResponse.json({ responseCode: "2005600", responseMessage: "Success" });
    }

    console.warn(`Doku callback: no match for invoice=${invoiceNumber}`);
    return NextResponse.json({ responseCode: "2005600", responseMessage: "No match" });

  } catch (e) {
    console.error("Doku callback error:", e);
    return NextResponse.json({ responseCode: "2005600", responseMessage: "Internal — acknowledged" });
  }
}
