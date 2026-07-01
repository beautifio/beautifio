import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { by } = await request.json(); // "officer" or "user"

  const { data: session } = await supabase.from("care_chat_sessions")
    .select("id, user_id, officer_id, status").eq("id", id).single();
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (session.status === "closed") return NextResponse.json({ error: "Already closed" }, { status: 400 });

  // Only the assigned officer or the session user can close
  const isOfficer = user.id === session.officer_id;
  const isUser = user.id === session.user_id;
  if (!isOfficer && !isUser) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await supabase.from("care_chat_sessions").update({
    status: "closed", closed_at: new Date().toISOString(), closed_by: by || "officer", updated_at: new Date().toISOString(),
  }).eq("id", id);

  // Notify the other party
  const notifyUserId = isOfficer ? session.user_id : session.officer_id;
  if (notifyUserId) {
    const closerName = by === "officer" ? "Petugas Care" : "Pengguna";
    await supabase.from("notifications").insert({
      user_id: notifyUserId, type: "care_closed",
      title: "Sesi konsultasi selesai",
      body: `${closerName} telah mengakhiri sesi konsultasi. Terima kasih telah menggunakan Beautifio Care.`,
      data: { session_id: id },
    });
  }

  return NextResponse.json({ success: true });
}
