import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

const SECRET_KEY = process.env.DOKU_SECRET_KEY || "";

function verifySignature(body: Record<string, unknown>, headers: Headers): boolean {
  const signature = headers.get("x-signature");
  const timestamp = headers.get("x-timestamp");
  if (!signature || !timestamp) return false;

  const bodyStr = JSON.stringify(body);
  const bodyHash = crypto.createHash("sha256").update(bodyStr).digest("hex").toLowerCase();
  const stringToSign = `POST:/api/payment/callback:${bodyHash}:${timestamp}`;
  const computed = crypto.createHmac("sha512", SECRET_KEY).update(stringToSign).digest("base64");

  return signature === computed;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (SECRET_KEY) {
      const valid = verifySignature(body as Record<string, unknown>, request.headers);
      if (!valid) {
        return NextResponse.json({ responseCode: "4015600", responseMessage: "Invalid signature" }, { status: 401 });
      }
    }

    const invoiceNumber =
      body.originalPartnerReferenceNo ||
      body.order?.invoice_number ||
      body.response?.order?.invoice_number ||
      body.transaction?.invoice_number;

    if (!invoiceNumber) {
      console.warn("Doku callback: missing invoice, acknowledging");
      return NextResponse.json({ responseCode: "2005600", responseMessage: "Acknowledged" });
    }

    const statusCode =
      body.latestTransactionStatus ||
      body.transaction?.status ||
      body.response?.transaction?.status ||
      body.result;

    const supabase = await createClient();
    const isSuccess = statusCode === "00" || statusCode === "SUCCESS" || statusCode === "success";

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

    // Check subscription payments
    const { data: sub } = await supabase.from("user_subscriptions")
      .select("id, status, user_id, plan:subscription_plans(name)")
      .eq("payment_ref", invoiceNumber)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (sub) {
      if (isSuccess && sub.status === "pending") {
        await supabase.from("user_subscriptions").update({
          status: "active", started_at: new Date().toISOString(),
        }).eq("id", sub.id);

        // Count voucher if present in payment_ref
        if (invoiceNumber.includes("|voucher:")) {
          const voucherId = invoiceNumber.split("|voucher:")[1];
          if (voucherId) {
            await supabase.rpc("increment_subscription_voucher_count", { p_voucher_id: voucherId });
          }
        }

        await supabase.from("notifications").insert({
          user_id: sub.user_id, type: "subscription_active",
          title: "Subscription aktif!",
          body: `Langganan ${(sub.plan as any)?.name || "kamu"} sudah aktif.`,
          data: { sub_id: sub.id },
        });
      }
      return NextResponse.json({ responseCode: "2005600", responseMessage: "Success" });
    }

    // Check consultation payments
    const { data: consSession } = await supabase.from("consultation_sessions")
      .select("id, status, user_id").eq("payment_reference", invoiceNumber)
      .order("created_at", { ascending: false }).limit(1).single();

    if (consSession) {
      if (isSuccess && consSession.status === "pending_payment") {
        await supabase.from("consultation_sessions").update({ status: "scheduled" }).eq("id", consSession.id);
        await supabase.from("notifications").insert({
          user_id: consSession.user_id, type: "care_new_session",
          title: "Konsultasi terjadwal!", body: "Psikolog akan segera menghubungimu.",
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
