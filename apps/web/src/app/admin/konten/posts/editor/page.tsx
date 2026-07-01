"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CMSLayout } from "@/features/cms/CMSLayout"
import { ArticleEditor } from "@/features/cms/ArticleEditor"

export default function EditorPage() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me").then(async r => {
      if (!r.ok) { router.replace("/login"); return }
      const { data } = await r.json()
      if (!["superadmin", "admin", "redaksi"].includes(data?.role)) { router.replace("/"); return }
      setAuthorized(true)
    }).catch(() => router.replace("/login"))
  }, [])

  if (!authorized) return (
    <div className="h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#084463", borderTopColor: "transparent" }} />
    </div>
  )

  return (
    <CMSLayout title="Mengenal Diri Sendiri: Perjalanan Menuju Kesadaran Diri">
      <ArticleEditor />
    </CMSLayout>
  )
}
