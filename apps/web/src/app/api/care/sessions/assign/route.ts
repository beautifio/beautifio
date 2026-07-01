import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { session_id } = await request.json();
  if (!session_id) return NextResponse.json({ error: "session_id required" }, { status: 400 });

  const { data: session } = await supabase.from("care_chat_sessions")
    .select("id, category, user_id, user_name, officer_id, status").eq("id", session_id).single();
  if (!session || session.status === "active") return NextResponse.json({ assigned: false, message: "Already assigned" });

  // Find volunteer with lowest workload in this category
  const { data: officers } = await supabase.from("care_officers")
    .select("id, user_id, name, category_id").eq("is_active", true).order("created_at");

  let bestOfficer: any = null;
  let lowestLoad = Infinity;

  for (const o of officers || []) {
    const { count } = await supabase.from("care_chat_sessions")
      .select("*", { count: "exact", head: true })
      .eq("officer_id", o.user_id).eq("status", "active");
    if ((count || 0) < lowestLoad) {
      lowestLoad = count || 0;
      bestOfficer = o;
    }
  }

  if (!bestOfficer) return NextResponse.json({ assigned: false, message: "No volunteer available" });

  // Assign
  await supabase.from("care_chat_sessions").update({
    officer_id: bestOfficer.user_id,
    status: "active",
    updated_at: new Date().toISOString(),
  }).eq("id", session_id);

  // System message
  await supabase.from("care_chat_messages").insert({
    session_id, sender_role: "system",
    content: `Kamu terhubung dengan Kak ${bestOfficer.name}. Ceritakan apa yang ingin kamu konsultasikan.`,
  });

  // Notify volunteer
  await supabase.from("notifications").insert({
    user_id: bestOfficer.user_id, type: "care_new_session",
    title: "Sesi konsultasi baru",
    body: `${session.user_name || "Seseorang"} butuh bantuan di kategori ${session.category}`,
    data: { session_id, link_url: `/admin/care/chat/${session_id}` },
  });

  return NextResponse.json({ assigned: true, officer_name: bestOfficer.name });
}
