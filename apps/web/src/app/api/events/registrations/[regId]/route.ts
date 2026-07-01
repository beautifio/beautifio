import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin" || admin?.role === "redaksi";
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ regId: string }> }) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { regId } = await params;
  const body = await request.json();
  const { status } = body;
  if (!status || !["confirmed", "cancelled", "rejected", "pending"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { error } = await supabase.from("event_registrations").update({
    status, updated_at: new Date().toISOString(),
  }).eq("id", regId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create notification for the user
  const { data: reg } = await supabase.from("event_registrations")
    .select("user_id, event:familia_event_benefits(title)").eq("id", regId).single();
  if (reg) {
    const statusLabel = status === "confirmed" ? "dikonfirmasi" : status === "rejected" ? "ditolak" : "diubah";
    await supabase.from("notifications").insert({
      user_id: reg.user_id,
      type: `event_${status}`,
      title: `Pendaftaran ${statusLabel}`,
      body: `Pendaftaranmu untuk "${(reg.event as any)?.title || "Event"}" telah ${statusLabel} oleh admin.`,
      data: { reg_id: regId, event_title: (reg.event as any)?.title },
    });
  }

  return NextResponse.json({ success: true });
}
