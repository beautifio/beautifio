"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target, Trophy, MessageCircle, Briefcase, BookOpen, ArrowRight,
  Sparkles, CheckCircle2, Circle, ChevronRight, Zap, Users, MapPin,
  Clock, Heart, Star, Ticket, ShoppingBag, GraduationCap, Flame,
  Sun, Moon, Sunrise, BookHeart, Gift, Calendar, Compass, Quote,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar, BottomNavigation, ProgressBar } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { useMemo, useState, useEffect } from "react";
import { FAMILIA_EVENT_BENEFITS, FAMILIA_MERCHANTS, FAMILIA_ACHIEVEMENT_REWARDS, getVoucherSessions, getLifeProfile, ZONE_INFO, STAGE_INFO, updateZone, generateDailyWins } from "@beautifio/utils";
import type { GrowthZoneRecommendation } from "@beautifio/types";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";
import { useAuth } from "@/hooks/use-auth";

const goals = [
  { id: "1", name: "Jadi Frontend Developer", category: "Karir", progress: 62, milestones: { done: 5, total: 8 } },
  { id: "2", name: "Toefl 600+", category: "Skill", progress: 30, milestones: { done: 2, total: 6 } },
];

const activities = [
  { id: "1", name: "Rina Amalia", initials: "RA", role: "Mentor", message: "Jangan lupa selesaikan milestone React minggu ini ya!", time: "2 jam lalu", circle: "Tech Founders" },
  { id: "2", name: "Dimas Pratama", initials: "DP", role: "Anggota", message: "Ada yang udah coba challenge algoritma kemarin?", time: "5 jam lalu", circle: "Tech Founders" },
  { id: "3", name: "Sari Indah", initials: "SI", role: "Anggota", message: "Gua nemu beasiswa menarik nih, cek opportunity hub!", time: "1 hari lalu", circle: "Creative Lab" },
];

const featuredStories = [
  { id: "s19", slug: "pengenalan-ai-untuk-pemula", title: "Pengenalan Artificial Intelligence untuk Pemula", author: "Pak Anton", likes: 61, readingTime: 6, category: "Teknologi", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80" },
  { id: "s4", slug: "panduan-membangun-karir-di-teknologi", title: "Panduan Membangun Karir di Industri Teknologi", author: "Dimas Pratama", likes: 56, readingTime: 6, category: "Karir", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" },
  { id: "s16", slug: "strategi-konten-viral-tiktok-2026", title: "Strategi Konten Viral di TikTok 2026", author: "Nando Prabowo", likes: 52, readingTime: 4, category: "Kreator", image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80" },
  { id: "s7", slug: "ide-bisnis-online-modal-kecil", title: "7 Ide Bisnis Online Modal Kecil untuk Mahasiswa", author: "Andini Putri", likes: 48, readingTime: 6, category: "Bisnis", image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80" },
];

const mentors = [
  { name: "Pak Rudi", initials: "RR", expertise: "Tech Entrepreneur", insight: "Fokus pada 1 skill dulu, jangan serba bisa di awal." },
  { name: "Bu Sari", initials: "SS", expertise: "Leadership Coach", insight: "Konsistensi > Intensitas. Lebih baik 30 menit tiap hari daripada 5 jam seminggu sekali." },
  { name: "Pak Anton", initials: "AA", expertise: "Data Scientist", insight: "AI bukan pengganti manusia, tapi alat. Yang bisa AI dan domain expertise akan jadi raja." },
];

/* ─── COMPONENTS ─── */

function WelcomeHero({ userName = "Sobat" }: { userName?: string }) {
  const router = useRouter();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";
  const GreetIcon = hour < 12 ? Sunrise : hour < 17 ? Sun : Moon;
  const message = "Setiap langkah kecil membawamu lebih dekat ke impianmu. Hari ini adalah kesempatan baru untuk tumbuh.";
  const profile = getLifeProfile();
  const zoneInfo = profile?.onboardingCompleted ? ZONE_INFO[profile.currentZone] : null;
  const stageInfo = profile?.onboardingCompleted ? STAGE_INFO[profile.currentStage] : null;
  const capAvg = profile?.onboardingCompleted ? Math.round(Object.values(profile.lifeCapital).reduce((a, b) => a + b, 0) / 6) : 0;
  const displayName = userName || "Sobat";
  const initials = displayName.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary px-6 pt-8 pb-7 text-white">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Avatar initials={initials} size="lg" />
            <div>
              <h1 className="text-lg font-bold leading-tight">{greeting}, {displayName}!</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {profile?.onboardingCompleted ? (
                  <>
                    <span>{zoneInfo?.emoji}</span>
                    <span className="text-[11px] text-white/80">{zoneInfo?.label} · {stageInfo?.emoji} {stageInfo?.label}</span>
                  </>
                ) : (
                  <>
                    <Flame size={12} className="text-orange-200" />
                    <span className="text-[11px] text-white/80">12 hari streak · Level Gold</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => router.push("/life")} className="relative p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-all cursor-pointer active:scale-90">
            <Sparkles size={18} />
            {profile?.onboardingCompleted && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-300 rounded-full" />
            )}
          </button>
        </div>

        <div className="mt-4 flex items-start gap-2 bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
          <Quote size={14} className="text-white/60 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-white/90 leading-relaxed">{message}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          {profile?.onboardingCompleted ? (
            <>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">{capAvg}%</p>
                <p className="text-[10px] text-white/70">Life Capital</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">{stageInfo?.emoji}</p>
                <p className="text-[10px] text-white/70">{stageInfo?.label}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">{profile.currentDreamSlug ? "🎯" : "💭"}</p>
                <p className="text-[10px] text-white/70">{profile.currentDreamSlug ? "Dream" : "Explore"}</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">62%</p>
                <p className="text-[10px] text-white/70">Progress Goal</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">5</p>
                <p className="text-[10px] text-white/70">Milestone</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                <p className="text-lg font-bold">3</p>
                <p className="text-[10px] text-white/70">Circle Aktif</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LifeEngineCard() {
  const router = useRouter();
  const profile = getLifeProfile();
  const [zone, setZone] = useState(profile.currentZone);
  const [rec, setRec] = useState<GrowthZoneRecommendation | null>(null);

  useEffect(() => {
    if (profile.onboardingCompleted) {
      const currentZone = updateZone();
      setZone(currentZone);
      setRec(generateDailyWins(profile.currentStage, currentZone, profile.currentDreamSlug));
    }
  }, []);

  if (!profile.onboardingCompleted) {
    return (
      <button onClick={() => router.push("/life/start")}
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 hover:from-primary/15 hover:to-secondary/15 transition-all text-left cursor-pointer active:scale-[0.98]"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          <Compass size={24} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary">Mulai Life Engine</p>
          <p className="text-[10px] text-text-secondary mt-0.5">Cari tahu tahap hidup, zona pertumbuhan, dan life capital-mu</p>
        </div>
        <ArrowRight size={16} className="text-text-secondary/30 flex-shrink-0" />
      </button>
    );
  }

  const zoneInfo = ZONE_INFO[zone];
  const stageInfo = STAGE_INFO[profile.currentStage];
  const capital = profile.lifeCapital;
  const avg = Math.round(Object.values(capital).reduce((a, b) => a + b, 0) / 6);

  return (
    <button onClick={() => router.push("/life")}
      className="w-full p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 hover:from-primary/10 hover:to-secondary/10 transition-all text-left cursor-pointer active:scale-[0.98]"
    >
      {/* Today's Zone */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          zone === "growth" ? "bg-purple-100" : zone === "learning" ? "bg-green-100" : zone === "fear" ? "bg-amber-100" : "bg-blue-100"
        }`}>
          <Compass size={20} className={
            zone === "growth" ? "text-purple-600" : zone === "learning" ? "text-green-600" : zone === "fear" ? "text-amber-600" : "text-blue-600"
          } />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{zoneInfo?.emoji}</span>
            <span className="text-sm font-bold text-text-primary">{zoneInfo?.label}</span>
            <span className="text-[9px] text-text-secondary">· {stageInfo?.emoji} {stageInfo?.label}</span>
          </div>
          <p className="text-[10px] text-text-secondary">{profile.currentDreamSlug ? "Dream aktif · " : ""}Life Capital {avg}%</p>
        </div>
        <ChevronRight size={16} className="text-text-secondary/30" />
      </div>

      {/* Life Capital mini bars */}
      <div className="grid grid-cols-6 gap-1 mb-3">
        {Object.entries(capital).map(([key, val]) => (
          <div key={key} className="text-center">
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full bg-primary/60 rounded-full" style={{ width: `${val}%` }} />
            </div>
            <p className="text-[7px] text-text-secondary mt-0.5 uppercase tracking-wider">{key.slice(0, 3)}</p>
          </div>
        ))}
      </div>

      {/* Recommended Action */}
      {rec && (
        <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Target size={12} className="text-accent" />
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">Recommended Action</span>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">{rec.weeklyFocus}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            {rec.dailyWins.slice(0, 3).map((dw, i) => (
              <span key={i} className="text-[18px]" title={dw.category}>{dw.emoji}</span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

function StoriesForYou() {
  const router = useRouter();
  const [heroIdx, setHeroIdx] = useState(0);
  const hero = featuredStories[heroIdx];
  const rest = featuredStories.filter((_, i) => i !== heroIdx);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <BookHeart size={16} className="text-rose-500" />
          Cerita Untukmu
        </h2>
        <button onClick={() => router.push("/cerita")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
          Lihat Semua
        </button>
      </div>

      {/* Hero Story */}
      <Link href={`/cerita/${hero.slug}`} className="block relative rounded-2xl overflow-hidden aspect-[2/1] mb-3 group cursor-pointer">
        <img src={hero.image} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge variant="secondary" className="bg-white/20 text-white border-white/20 text-[10px] mb-1.5">{hero.category}</Badge>
          <h3 className="text-sm font-bold text-white leading-snug">{hero.title}</h3>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/70">
            <span>{hero.author}</span>
            <span className="flex items-center gap-1"><Heart size={10} />{hero.likes}</span>
            <span>{hero.readingTime} mnt</span>
          </div>
        </div>
      </Link>

      {/* Story dots indicator */}
      <div className="flex justify-center gap-1.5 mb-3">
        {featuredStories.map((_, i) => (
          <button key={i} onClick={() => setHeroIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${i === heroIdx ? "w-5 bg-primary" : "bg-border"}`} />
        ))}
      </div>

      {/* Rest of stories */}
      <div className="space-y-2">
        {rest.slice(0, 2).map((story) => (
          <Link key={story.id} href={`/cerita/${story.slug}`} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-primary/20 hover:bg-muted/30 transition-all group">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <img src={story.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 leading-none mb-1">{story.category}</Badge>
              <p className="text-xs font-semibold text-text-primary leading-snug line-clamp-2">{story.title}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary">
                <span>{story.author}</span>
                <span>·</span>
                <span>{story.readingTime} mnt</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContinueYourJourney() {
  const router = useRouter();
  const goal = goals[0];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Compass size={16} className="text-accent" />
          Lanjutkan Perjalanan
        </h2>
        <button onClick={() => router.push("/roadmap")} className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer">
          Buka Roadmap
        </button>
      </div>

      {/* Active Goal */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/5 to-secondary/5 border border-accent/10 mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-accent" />
            <span className="text-xs font-semibold text-text-primary">{goal.name}</span>
          </div>
          <Badge variant="accent" className="text-[10px]">{goal.category}</Badge>
        </div>
        <ProgressBar value={goal.progress} size="sm" variant="accent" showLabel />
        <div className="flex items-center justify-between mt-2 text-[10px] text-text-secondary">
          <span>{goal.milestones.done} dari {goal.milestones.total} milestone selesai</span>
          <div className="flex items-center gap-1">
            <Trophy size={12} className="text-accent" />
            <span className="text-xs font-semibold text-accent">{goal.progress}%</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button onClick={() => router.push("/jurnal/buat")} className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all text-left cursor-pointer">
          <BookOpen size={16} className="text-primary" />
          <span className="text-[11px] font-medium text-text-primary">Catat Jurnal</span>
        </button>
        <button onClick={() => router.push("/discover")} className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-secondary/5 border border-secondary/10 hover:bg-secondary/10 transition-all text-left cursor-pointer">
          <Sparkles size={16} className="text-secondary" />
          <span className="text-[11px] font-medium text-text-primary">Ikut Discovery</span>
        </button>
      </div>
    </section>
  );
}

function CircleActivityHome() {
  const router = useRouter();
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Users size={16} className="text-secondary" />
          Aktivitas Circle
        </h2>
        <button onClick={() => router.push("/circle")} className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
          Lihat Semua
        </button>
      </div>
      <div className="space-y-2">
        {activities.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-surface border border-border hover:bg-muted/30 transition-all cursor-pointer">
            <Avatar initials={item.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-primary">{item.name}</span>
                <Badge variant="default" className="text-[9px] px-1 py-0 leading-none">{item.role}</Badge>
                <span className="text-[10px] text-text-secondary ml-auto flex-shrink-0">{item.time}</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{item.message}</p>
              <span className="text-[10px] text-secondary font-medium mt-1 inline-block">#{item.circle}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MentorInsights() {
  const router = useRouter();
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Star size={16} className="text-amber-500" />
          Mentor Insights
        </h2>
        <button onClick={() => router.push("/mentors")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
          Lihat Mentor
        </button>
      </div>
      <div className="space-y-2">
        {mentors.slice(0, 2).map((m, i) => (
          <div key={i} className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <div className="flex items-center gap-3 mb-2">
              <Avatar initials={m.initials} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary">{m.name}</p>
                <p className="text-[10px] text-text-secondary">{m.expertise}</p>
              </div>
              <button onClick={() => router.push(`/mentors/${m.name.toLowerCase().replace(/\s+/g, "-")}`)} className="text-[10px] font-medium text-amber-600 hover:underline cursor-pointer">
                Ikuti
              </button>
            </div>
            <div className="flex items-start gap-2">
              <Quote size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-secondary leading-relaxed italic">"{m.insight}"</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FamiliaHub() {
  const router = useRouter();
  const sessions = getVoucherSessions();
  const activeVouchers = sessions.filter((s) => s.status === "active").length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Gift size={16} className="text-amber-500" />
          Beautifio Familia
        </h2>
        <button onClick={() => router.push("/familia")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
          Lihat Semua
        </button>
      </div>

      {activeVouchers > 0 && (
        <div className="mb-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Ticket size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-green-800">{activeVouchers} Voucher Aktif</p>
            <p className="text-[10px] text-green-600">Segera gunakan sebelum kedaluwarsa</p>
          </div>
          <button onClick={() => router.push("/familia/vouchers")} className="ml-auto text-[10px] font-medium text-green-700 hover:underline cursor-pointer">Klaim</button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => router.push("/familia/vouchers")} className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-amber-50 border border-amber-100 hover:border-amber-300 hover:bg-amber-100/50 transition-all cursor-pointer active:scale-95">
          <Ticket size={18} className="text-amber-600" />
          <span className="text-[10px] font-medium text-amber-700">Voucher</span>
          <span className="text-[9px] text-amber-500">{FAMILIA_MERCHANTS.length} Merchant</span>
        </button>
        <button onClick={() => router.push("/familia/deals")} className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-blue-50 border border-blue-100 hover:border-blue-300 hover:bg-blue-100/50 transition-all cursor-pointer active:scale-95">
          <ShoppingBag size={18} className="text-blue-600" />
          <span className="text-[10px] font-medium text-blue-700">Deals</span>
          <span className="text-[9px] text-blue-500">Penawaran</span>
        </button>
        <button onClick={() => router.push("/familia/rewards")} className="flex flex-col items-center gap-1.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/50 transition-all cursor-pointer active:scale-95">
          <Trophy size={18} className="text-emerald-600" />
          <span className="text-[10px] font-medium text-emerald-700">Rewards</span>
          <span className="text-[9px] text-emerald-500">{FAMILIA_ACHIEVEMENT_REWARDS.length} Reward</span>
        </button>
      </div>
    </section>
  );
}

function UpcomingEvents() {
  const router = useRouter();
  const events = FAMILIA_EVENT_BENEFITS;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Calendar size={16} className="text-purple-500" />
          Event Mendatang
        </h2>
        <button onClick={() => router.push("/circle")} className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-2">
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-900/20">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">{ev.title}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{ev.description}</p>
              {ev.code && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="accent" className="text-[9px]">{ev.discount_value}</Badge>
                  <span className="text-[9px] font-mono text-purple-600 font-semibold">Kode: {ev.code}</span>
                </div>
              )}
            </div>
            <ChevronRight size={14} className="text-text-secondary/30 flex-shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── MAIN ─── */

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();
  const { user } = useAuth();

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Sobat";

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Ekosistem", items: [
      { id: "h-opp", type: "opportunity", title: "Peluang Menarik", subtitle: "Beasiswa, magang, dan lowongan", href: "/opportunity" },
      { id: "h-circle", type: "circle", title: "Gabung Circle", subtitle: "Temukan komunitas yang sesuai", href: "/circle" },
      { id: "h-mentor", type: "mentor", title: "Temui Mentor", subtitle: "Dapatkan bimbingan dari ahli", href: "/mentors" },
    ]},
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-5 pb-24 space-y-7">
        <WelcomeHero userName={userName} />
        <LifeEngineCard />
        <StoriesForYou />
        <ContinueYourJourney />
        <CircleActivityHome />
        <MentorInsights />
        <FamiliaHub />
        <UpcomingEvents />
        <EcosystemLinks groups={ecosystemGroups} />
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
