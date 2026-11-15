import { NextResponse } from "next/server"
import { getUserTier } from "@/lib/tier"
import { getServerUser } from "@/lib/auth/server-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getServerUser()
  if (!user) return NextResponse.json({ tier: "reguler" })
  const tier = await getUserTier(user.id)
  return NextResponse.json({ tier })
}
