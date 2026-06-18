"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass, ArrowRight,
  Settings, LogOut, LogIn, User, UserPlus,
  BookOpen, BookHeart, History,
  ChevronRight, BookMarked, Shield, Sparkles,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardContent, Avatar,
  Button, Skeleton,
} from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import type { DreamJourney, JourneyProgress, DailyActivity } from "@beautifio/types";
import type { LifeTimelineEntry, DimensionSummary } from "@/lib/journey-queries";
import { journeyUrl } from "@/lib/journey-queries";
import { getLifeEngineData, DIMENSION_LABELS, ALL_DIMENSIONS, calculateLevel } from "@/lib/life-engine";
import type { LifeEngineResult } from "@/lib/life-engine";


function ProfileHero({ journey }: { journey: DreamJourney | null }) {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="bg-gradient-to-b from-bg to-surface">
      <div className="max-w-content mx-auto">
        <div className="relative pt-8 pb-6 px-6">
          <div className="flex flex-col items-center">
            <Avatar initials={initials} size="xl" />
            <h1 className="text-xl font-bold text-text-primary mt-4">{displayName}</h1>
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneyIdentity({ journey, progress }: { journey: DreamJourney | null; progress: JourneyProgress | null }) {
  const router = useRouter();

  if (!journey) {
    return (
      <div className="px-6">
        <Card padding="lg" className="border-accent/20 bg-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-accent" />
              <CardTitle>Mulai Perjalananmu</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Pilih mimpi dan mulai perjalanan menuju masa depan yang kamu inginkan.
            </p>
            <Button variant="accent" size="sm" onClick={() => router.push("/journey")}>
              Mulai Sekarang <ArrowRight size={14} />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6">
      <Card padding="lg" className="border-accent/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-accent" />
              <CardTitle>Siapa Aku?</CardTitle>
            </div>
            <button
              onClick={() => router.push(journeyUrl(journey))}
              className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer"
            >
              Buka Perjalanan
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{journey.emoji}</span>
            <div>
              <p className="text-sm font-bold text-text-primary">{journey.title}</p>
              <p className="text-xs text-text-secondary">Ini adalah mimpiku</p>
            </div>
          </div>
          {progress?.current_big_win && (
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-[11px] font-semibold text-accent uppercase tracking-wide">Sedang Dalam Perjalanan</p>
              <p className="text-sm text-text-primary mt-1">🏆 {progress.current_big_win.title}</p>
              {progress.current_big_win.description && (
                <p className="text-xs text-text-secondary mt-0.5">{progress.current_big_win.description}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RadarChart({ data }: { data: Record<string, number> }) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 20;
  const sides = ALL_DIMENSIONS.length;
  const maxVal = Math.max(...Object.values(data), 1);

  const angleStep = (2 * Math.PI) / sides;

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map((level) => {
        const r = radius * level;
        const points = ALL_DIMENSIONS.map((_, i) => {
          const a = angleStep * i - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        );
      })}

      {ALL_DIMENSIONS.map((_, i) => {
        const a = angleStep * i - Math.PI / 2;
        const x2 = cx + radius * Math.cos(a);
        const y2 = cy + radius * Math.sin(a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        );
      })}

      <polygon
        points={ALL_DIMENSIONS
          .map((dim, i) => {
            const a = angleStep * i - Math.PI / 2;
            const val = data[dim] || 0;
            const r = radius * (val / maxVal);
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          })
          .join(" ")}
        fill="rgba(255, 94, 91, 0.15)"
        stroke="#FF5E5B"
        strokeWidth={2}
      />

      {ALL_DIMENSIONS.map((dim, i) => {
        const a = angleStep * i - Math.PI / 2;
        const labelRadius = radius + 18;
        const x = cx + labelRadius * Math.cos(a);
        const y = cy + labelRadius * Math.sin(a);
        const info = DIMENSION_LABELS[dim];
        return (
          <text
            key={dim}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fill="#6B7280"
            fontWeight={500}
          >
            {info.emoji}
          </text>
        );
      })}

      {ALL_DIMENSIONS.map((dim, i) => {
        const a = angleStep * i - Math.PI / 2;
        const labelRadius = radius + 32;
        const x = cx + labelRadius * Math.cos(a);
        const y = cy + labelRadius * Math.sin(a);
        const info = DIMENSION_LABELS[dim];
        return (
          <text
            key={`label-${dim}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={8}
            fill="#9CA3AF"
          >
            {info.label}
          </text>
        );
      })}
    </svg>
  );
}

function LifeEngineWidget({ userId }: { userId: string }) {
  const [data, setData] = useState<LifeEngineResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await getLifeEngineData(userId);
        setData(result);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="px-6">
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <CardTitle>Life Engine</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-48 rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasPoints = data && data.totalPoints > 0;
  const growthInfo = data?.growthZone ? DIMENSION_LABELS[data.growthZone] : null;

  return (
    <div className="px-6">
      <Card padding="lg" style={hasPoints ? { background: "linear-gradient(135deg, #FFF7F3 0%, #FFFFFF 100%)" } : undefined}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: "#FF5E5B" }} />
              <CardTitle>Life Engine</CardTitle>
            </div>
            {data && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: "#FFF0EF" }}>
                <span className="text-xs font-bold" style={{ color: "#FF5E5B" }}>Level {data.level}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasPoints ? (
            <div className="text-center py-6">
              <Sparkles size={32} className="mx-auto mb-3" style={{ color: "#FFB627" }} />
              <p className="text-sm font-semibold text-text-primary">
                Life Engine-mu masih kosong
              </p>
              <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                Mulai selesaikan aktivitas harian untuk lihat Life Engine-mu tumbuh! 🌱
              </p>
            </div>
          ) : (
            <>
              <RadarChart
                data={Object.fromEntries(
                  Object.entries(data.capitals).map(([dim, cap]) => [dim, cap.total_points])
                )}
              />

              <div className="mt-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {ALL_DIMENSIONS.map((dim) => {
                    const info = DIMENSION_LABELS[dim];
                    const cap = data.capitals[dim];
                    return (
                      <div
                        key={dim}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium"
                        style={{ background: `${info.color}12`, color: info.color }}
                      >
                        <span>{info.emoji}</span>
                        <span>{cap.total_points}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {growthInfo && (
                <div className="mt-4 p-3 rounded-xl" style={{ background: "#FFF0EF", border: "1px solid #FFE4E2" }}>
                  <p className="text-xs font-semibold" style={{ color: "#FF5E5B" }}>
                    🎯 Growth Zone: {growthInfo.label}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#D94A47" }}>
                    Capital ini paling butuh perhatian sekarang.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LifeTimeline({ entries }: { entries: LifeTimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="px-6">
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookHeart size={18} className="text-primary" />
              <CardTitle>Cerita Perjalananku</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-text-secondary">Belum ada cerita</p>
              <p className="text-xs text-text-secondary/60 mt-1">
                Mulai perjalananmu dan setiap langkah akan tercatat di sini
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6">
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookHeart size={18} className="text-primary" />
            <CardTitle>Cerita Perjalananku</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-5">
              {entries.map((entry, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative z-10 flex items-center justify-center w-4 h-4 mt-0.5">
                    <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary/50">
                      {formatDate(entry.date)}
                    </p>
                    <p className="text-sm font-medium text-text-primary mt-0.5">
                      {entry.emoji} {entry.title}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StoryLink() {
  return (
    <div className="px-6">
      <Link href="/profil/story">
        <div className="bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <History size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Ceritaku</p>
            <p className="text-xs text-text-secondary/60">Timeline, review mingguan & bulanan</p>
          </div>
          <ChevronRight size={16} className="text-text-secondary/40 flex-shrink-0" />
        </div>
      </Link>
    </div>
  );
}

function SettingsSection() {
  const { signOut } = useAuth();

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
            { icon: User, label: "Edit Profil" },
            { icon: BookOpen, label: "Kebijakan Privasi" },
            { icon: LogOut, label: "Keluar", danger: true, action: async () => { await signOut(); window.location.href = "/"; } },
          ].map((item, i) => {
            const Icon = item.icon;
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
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminPanelSection() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          console.warn("AdminPanelSection: /api/auth/me returned", res.status);
          return;
        }
        const body = await res.json();
        console.log("AdminPanelSection: role data.role =", body?.data?.role, "| full body =", JSON.stringify(body));
        setRole(body?.data?.role || null);
      } catch (e) {
        console.warn("AdminPanelSection: fetch failed", e);
      }
    })();
  }, []);

  if (!role || !["superadmin", "admin", "redaksi"].includes(role)) return null;

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
            onClick={() => router.push("/admin/familia")}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-amber-100 hover:bg-amber-200 transition-colors text-left cursor-pointer border border-amber-200"
          >
            <Shield size={16} className="text-amber-700" />
            <span className="text-sm font-semibold text-amber-800 flex-1">Buka Admin Panel</span>
            <ChevronRight size={16} className="text-amber-500" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
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
  );
}

function ReadingStats({ user }: { user: any }) {
  const [stats, setStats] = useState<{ total_read: number; total_minutes: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { getUserArticleStats } = await import("@/lib/article-queries");
        const data = await getUserArticleStats(user.id);
        setStats(data);
      } catch {
        // silent
      }
    })();
  }, [user]);

  if (!stats || stats.total_read === 0) return null;

  return (
    <div className="px-6">
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: "#FFF0EF" }}>
        <BookMarked size={14} style={{ color: "#D94040" }} />
        <span className="text-xs" style={{ color: "#D94040" }}>
          {stats.total_read} artikel dibaca · {stats.total_minutes} menit total waktu membaca
        </span>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileScreen() {

  const { user, isLoading } = useAuth();
  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous";

  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [timeline, setTimeline] = useState<LifeTimelineEntry[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const { getActiveJourney, getJourneyProgress, getLifeTimeline } = await import("@/lib/journey-queries");
      const j = await getActiveJourney(user.id);
      setJourney(j);
      const tl = await getLifeTimeline(user.id);
      setTimeline(tl);
      if (j) {
        const p = await getJourneyProgress(user.id, j.id);
        setProgress(p);
      }
    } catch {
      setDataError("Koneksi sedang bermasalah. Periksa internetmu, ya.");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

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
    );
  }

  if (!user) return <LoginPrompt />;

  if (dataError) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto flex flex-col items-center justify-center text-center">
        <p className="text-destructive font-medium mb-4">{dataError}</p>
        <Button variant="primary" size="sm" onClick={loadProfileData}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (dataLoading) {
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
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto pb-24 space-y-5">
        <ProfileHero journey={journey} />
        {isAnonymous && (
          <div className="px-6">
            <Card padding="lg" className="border-[#FFB627] bg-[#FFF7E6]">
              <CardContent>
                <p className="text-sm font-semibold text-[#92400E] mb-1">
                  🕐 Akun Tamu
                </p>
                <p className="text-xs text-[#92400E]/70 mb-3">
                  Data tersimpan sementara di browser ini.
                  Daftar untuk menyimpan selamanya dan akses dari mana saja.
                </p>
                <Link href="/register?upgrade=true">
                  <Button variant="primary" size="sm">
                    <UserPlus size={14} /> Daftar Sekarang
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
        <JourneyIdentity journey={journey} progress={progress} />
        <ReadingStats user={user} />
        <LifeEngineWidget userId={user.id} />
        <StoryLink />
        <LifeTimeline entries={timeline} />
        <AdminPanelSection />
        <SettingsSection />
      </div>
    </div>
  );
}
