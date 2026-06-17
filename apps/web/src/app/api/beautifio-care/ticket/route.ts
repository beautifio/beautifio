import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { category, story, form_data, partner_type } = body;

    if (!category) {
      return NextResponse.json({ error: "Missing category" }, { status: 400 });
    }

    const { error } = await supabase.from("beautifio_care_tickets").insert({
      user_id: user.id,
      category,
      story: story || null,
      form_data: form_data || null,
      partner_type: partner_type || null,
      status: "pending",
    });

    if (error) {
      console.error("Error inserting ticket:", error);
      return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
