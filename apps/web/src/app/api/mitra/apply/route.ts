import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (!body.role || !body.full_name) return NextResponse.json({ error: "Nama dan role wajib" }, { status: 400 });

  const { error } = await supabase.from("mitra_applications").insert({
    user_id: user.id, role: body.role, status: "pending_review",
    full_name: body.full_name, email: body.email || user.email, phone: body.phone,
    motivation: body.motivation, category: body.category,
    specialization: body.specialization || [], credentials: body.credentials,
    experience_years: body.experience_years || 0,
    bank_name: body.bank_name, account_number: body.account_number, account_holder: body.account_holder,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
