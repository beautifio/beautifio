import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function checkAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: admin } = await supabase.from("users").select("role").eq("id", user.id).single();
  return admin?.role === "admin" || admin?.role === "superadmin" || admin?.role === "redaksi";
}

export async function GET() {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = await supabase.from("familia_event_benefits").select("*").order("event_date", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!(await checkAdmin(supabase))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const { error } = await supabase.from("familia_event_benefits").insert({
    title: body.title, slug: body.slug, description: body.description,
    event_date: body.event_date, location: body.location,
    registration_url: body.registration_url, category: body.category,
    partner_name: body.partner_name, is_active: body.is_active,
    is_free: body.is_free, image_url: body.image_url,
    price: body.price, payment_url: body.payment_url,
    quota: body.quota, registration_deadline: body.registration_deadline,
    discount_type: body.discount_type, discount_value: body.discount_value, code: body.code,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
