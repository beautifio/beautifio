import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "superadmin"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data } = await supabase.from("mitra_applications").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ applications: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (!profile || !["admin", "superadmin"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { app_id, action, admin_notes } = body;
  if (!app_id || !action) return NextResponse.json({ error: "app_id and action required" }, { status: 400 });

  const { data: app } = await supabase.from("mitra_applications").select("*").eq("id", app_id).single();
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    const newRole = app.role === "psychologist" ? "psychologist" : "care_volunteer";
    await supabase.from("users").update({ role: newRole }).eq("id", app.user_id);
    if (app.role === "psychologist") {
      await supabase.from("psychologists").upsert({
        user_id: app.user_id, full_name: app.full_name, specialization: app.specialization || [],
        credentials: app.credentials, experience_years: app.experience_years || 0,
        is_verified: true, is_active: true,
      }, { onConflict: "user_id" });
    } else {
      await supabase.from("care_officers").insert({
        user_id: app.user_id, name: app.full_name, is_active: true,
      });
    }
    const roleLabel = app.role === "psychologist" ? "Psikolog" : "Volunteer Care";
    await supabase.from("mitra_applications").update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", app_id);
    await supabase.from("notifications").insert({ user_id: app.user_id, type: "info", title: "Pendaftaran diterima!", body: `Selamat! Kamu diterima sebagai ${roleLabel} Beautifio.`, data: { link_url: "/mitra" } });
  } else {
    await supabase.from("mitra_applications").update({ status: "rejected", admin_notes, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", app_id);
    await supabase.from("notifications").insert({ user_id: app.user_id, type: "info", title: "Pendaftaran ditinjau", body: admin_notes || "Maaf, pendaftaran kamu belum diterima. Silakan coba lagi atau hubungi admin." });
  }

  return NextResponse.json({ success: true });
}
