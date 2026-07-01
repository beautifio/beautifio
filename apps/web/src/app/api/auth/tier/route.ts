import { NextResponse } from "next/server"
import { getUserTier } from "@/lib/tier"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) return NextResponse.json({ tier: "reguler" })
  const tier = await getUserTier(auth.user.id)
  return NextResponse.json({ tier })
}
