"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Settings, LogOut, LogIn, User, UserPlus,
  BookOpen, Shield, Bell, ChevronRight,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, Button, Skeleton } from "@beautifio/ui"
import { useAuth } from "@/hooks/use-auth"
import { useIdentity } from "@/hooks/use-identity"
import { IdentityHero } from "@/components/profile/IdentityHero"
import { DiscCard, TesAHCard, JourneyCard, LifeEngineCard } from "@/components/profile/cards/DimensionCards"
import { ActivityRow, TimelineCompact } from "@/components/profile/ActivityAndTimeline"

// --- Settings & Admin sections kept from old page ---

function SettingsSection() {
  const { signOut } = useAuth()
  const router = useRouter()

  return (
    <div className="px-6">
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-text-secondary" />
            <CardTitle>Pengaturan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { icon: User, label: "Edit Profil", action: () => router.push("/profil/edit") },
            { icon: Shield, label: "Ubah Password", action: () => router.push("/ubah-password") },
            { icon: Bell, label: "Notifikasi", action: () => router.push("/profil/notifikasi") },
            { icon: BookOpen, label: "Kebijakan Privasi", action: () => router.push("/profil/kebijakan") },
            { icon: LogOut, label: "Keluar", danger: true, action: async () => { await signOut(); window.location.href = "/" } },
          ].map((item, i) => {
            const Icon = item.icon
            return (
              <button
                key={i}
                onClick={item.action}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/30 transition-colors text-left cursor-pointer ${i < 2 ? "border-b border-border" : ""}`}
              >
                <Icon size={16} className={item.danger ? "text-destructive" : "text-text-secondary"} />
                <span className={`text-sm flex-1 ${item.danger ? "text-destructive font-medium" : "text-text-primary"}`}>{item.label}</span>
                <ChevronRight size={16} className="text-text-secondary/30" />
              </button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

function AdminPanelSection() {
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) return
        const body = await res.json()
        setRole(body?.data?.role || null)
      } catch { /* silent */ }
    })()
  }, [])

  if (!role || !["superadmin", "admin", "redaksi"].includes(role)) return null

  return (
    <div className="px-6">
      <Card padding="lg" className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-amber-600" />
            <CardTitle>Admin Panel</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => router.push("/admin")}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 transition-colors text-left cursor-pointer border border-amber-200"
          >
            <Shield size={16} className="text-amber-700" />
            <span className="text-sm font-semibold text-amber-800 flex-1">Buka Admin Panel</span>
            <ChevronRight size={16} className="text-amber-500" />
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6 min-h-screen bg-bg">
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <User size={36} className="text-primary/40" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">Mulai Perjalananmu</h2>
      <p className="text-sm text-text-secondary text-center mb-8 max-w-xs">
        Masuk untuk melihat perjalanan hidupmu, melacak progres mimpimu, dan terhubung dengan pendukungmu.
      </p>
      <Link href="/login" className="w-full max-w-xs">
        <Button variant="primary" size="lg" className="w-full">
          <LogIn size={16} /> Masuk
        </Button>
      </Link>
      <p className="text-xs text-text-secondary mt-4">
        Belum punya akun?{" "}
        <Link href="/register" className="text-secondary font-semibold hover:underline">Daftar</Link>
      </p>
    </div>
  )
}

// --- Main Page ---

export default function ProfileScreen() {
  const { user, isLoading } = useAuth()
  const { data, loading: identityLoading, error: identityError } = useIdentity()
  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous"

  // Auth loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
          <div className="flex flex-col items-center pt-4 pb-6">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="w-36 h-6 mb-2" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!user && !isLoading) return <LoginPrompt />

  // Identity loading
  if (identityLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
          <div className="flex flex-col items-center pt-4 pb-6">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="w-36 h-6 mb-2" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (identityError) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto flex flex-col items-center justify-center text-center">
        <p className="text-destructive font-medium mb-4">{identityError}</p>
        <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto pb-24 space-y-5">
        {data ? (
          <>
            <IdentityHero {...data} />

            {isAnonymous && (
              <div className="px-6">
                <Card padding="lg" className="border-accent bg-accent/5">
                  <CardContent>
                    <p className="text-sm font-semibold text-primary mb-1">🕐 Akun Tamu</p>
                    <p className="text-xs text-text-secondary mb-3">
                      Data tersimpan sementara di browser ini. Daftar untuk menyimpan selamanya dan akses dari mana saja.
                    </p>
                    <Link href="/register?upgrade=true">
                      <Button variant="primary" size="sm"><UserPlus size={14} /> Daftar Sekarang</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="px-6">
              <h3 className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: "#647488" }}>Dimensi Diri</h3>
              <div className="grid grid-cols-2 gap-2">
                <DiscCard disc={data.disc} />
                <TesAHCard tesAh={data.tesAh} />
                <JourneyCard journey={data.journey} />
                <LifeEngineCard lifeEngine={data.lifeEngine} />
              </div>
            </div>

            <ActivityRow activity={data.activity} />
            <TimelineCompact timeline={data.timeline} />
            <AdminPanelSection />
            <SettingsSection />
          </>
        ) : (
          <>
            {isAnonymous && (
              <div className="px-6 pt-6">
                <Card padding="lg" className="border-accent bg-accent/5">
                  <CardContent>
                    <p className="text-sm font-semibold text-primary mb-1">🕐 Akun Tamu</p>
                    <p className="text-xs text-text-secondary mb-3">Data tersimpan sementara di browser ini.</p>
                    <Link href="/register?upgrade=true">
                      <Button variant="primary" size="sm"><UserPlus size={14} /> Daftar Sekarang</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
            <AdminPanelSection />
            <SettingsSection />
          </>
        )}
      </div>
    </div>
  )
}
