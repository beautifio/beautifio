"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, MapPin, Star, Calendar, CheckCircle, Heart, Package } from "lucide-react";
import { Badge, Avatar } from "@beautifio/ui";
import { ProtectedAction } from "@/components/ProtectedAction";
import {
  MOCK_MENTORS, ROADMAP_TEMPLATES, STORY_CATEGORIES, MOCK_PRODUCTS,
} from "@beautifio/utils";
import type { Story, MentorSession } from "@beautifio/types";
import { MentorBadge } from "@/features/mentor/components/MentorBadge";
import { MentorStoryCard } from "@/features/mentor/components/MentorStoryCard";
import { MentorSessionCard } from "@/features/mentor/components/MentorSessionCard";

const MOCK_STORIES: Record<string, Story> = {
  "ide-bisnis-online-modal-kecil": {
    id: "s7", slug: "ide-bisnis-online-modal-kecil",
    title: "7 Ide Bisnis Online Modal Kecil untuk Mahasiswa",
    category_id: STORY_CATEGORIES[2].id, category: STORY_CATEGORIES[2],
    reading_time: 6, content: "", like_count: 48, save_count: 33, comment_count: 11,
    author_name: "Pak Rudi", is_published: true,
    published_at: "2026-06-08T07:00:00Z", created_at: "2026-06-08T07:00:00Z",
  },
  "pengenalan-ai-untuk-pemula": {
    id: "s19", slug: "pengenalan-ai-untuk-pemula",
    title: "Pengenalan Artificial Intelligence untuk Pemula",
    category_id: STORY_CATEGORIES[8].id, category: STORY_CATEGORIES[8],
    reading_time: 6, content: "", like_count: 61, save_count: 47, comment_count: 18,
    author_name: "Pak Anton", is_published: true,
    published_at: "2026-06-01T06:00:00Z", created_at: "2026-06-01T06:00:00Z",
  },
  "panduan-olahraga-pemula-tanpa-cedera": {
    id: "s9", slug: "panduan-olahraga-pemula-tanpa-cedera",
    title: "Panduan Olahraga untuk Pemula Tanpa Cedera",
    category_id: STORY_CATEGORIES[3].id, category: STORY_CATEGORIES[3],
    reading_time: 4, content: "", like_count: 29, save_count: 17, comment_count: 5,
    author_name: "Fajar Hidayat", is_published: true,
    published_at: "2026-06-09T14:00:00Z", created_at: "2026-06-09T14:00:00Z",
  },
  "belajar-gitar-otodidak-30-hari": {
    id: "s11", slug: "belajar-gitar-otodidak-30-hari",
    title: "Belajar Gitar Otodidak dalam 30 Hari",
    category_id: STORY_CATEGORIES[4].id, category: STORY_CATEGORIES[4],
    reading_time: 5, content: "", like_count: 36, save_count: 25, comment_count: 8,
    author_name: "Kevin Alexander", is_published: true,
    published_at: "2026-06-06T12:00:00Z", created_at: "2026-06-06T12:00:00Z",
  },
};

const MOCK_SESSIONS: Record<string, MentorSession[]> = {
  "pak-rudi": [
    { id: "ms1", mentorId: "m1", circleId: "1", circleName: "Tech Founders", title: "Bootcamp: MVP Development", description: "Sesi intensif 2 jam membangun MVP dengan no-code tools.", date: "15 Juni 2026", time: "19:00 - 21:00 WIB", status: "upcoming", slots: 12, registered: 8 },
    { id: "ms2", mentorId: "m1", circleId: "1", circleName: "Tech Founders", title: "Fireside Chat: Dari Ide ke Investasi", description: "Mendengar pengalaman founder yang berhasil raise seed funding.", date: "22 Juni 2026", time: "16:00 - 17:30 WIB", status: "upcoming", slots: 20, registered: 14 },
  ],
  "fajar-hidayat": [
    { id: "ms3", mentorId: "m4", circleId: "7", circleName: "Sports Arena", title: "Lari Pagi Bareng Komunitas", description: "Lari 5K santai keliling kota. Semua level diterima.", date: "14 Juni 2026", time: "06:00 - 08:00 WIB", status: "upcoming", slots: 20, registered: 15 },
    { id: "ms4", mentorId: "m4", circleId: "7", circleName: "Sports Arena", title: "Futsal Cup Antar Circle", description: "Turnamen futsal antar circle di Beautifio.", date: "21 Juni 2026", time: "09:00 - 15:00 WIB", status: "upcoming", slots: 8, registered: 6 },
  ],
  "kevin-alexander": [
    { id: "ms5", mentorId: "m5", circleId: "8", circleName: "Music Collective", title: "Open Mic Night", description: "Tampilkan bakat musikmu di open mic malam minggu.", date: "13 Juni 2026", time: "19:00 - 22:00 WIB", status: "upcoming", slots: 10, registered: 7 },
  ],
  "bu-sari": [
    { id: "ms6", mentorId: "m2", circleId: "11", circleName: "Study Hub", title: "Try Out SNBT 2026", description: "Simulasi ujian SNBT gratis dengan soal prediksi.", date: "20 Juni 2026", time: "08:00 - 12:00 WIB", status: "upcoming", slots: 25, registered: 20 },
  ],
  "pak-budi": [
    { id: "ms7", mentorId: "m6", circleId: "12", circleName: "Career Boost", title: "CV & Interview Workshop", description: "Sesi coaching CV dan simulasi interview bersama HR.", date: "18 Juni 2026", time: "14:00 - 17:00 WIB", status: "upcoming", slots: 15, registered: 10 },
  ],
  "pak-anton": [
    { id: "ms8", mentorId: "m3", circleId: "5", circleName: "Data Science ID", title: "Workshop: Python untuk Data Science", description: "Belajar dasar Python untuk data science dan machine learning.", date: "25 Juni 2026", time: "10:00 - 12:00 WIB", status: "upcoming", slots: 15, registered: 12 },
  ],
};

const circleNames: Record<string, string> = {
  "1": "Tech Founders", "3": "Future Leaders", "5": "Data Science ID",
  "7": "Sports Arena", "8": "Music Collective", "11": "Study Hub", "12": "Career Boost",
};

export default function MentorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  const mentor = useMemo(() => MOCK_MENTORS.find((m) => m.slug === slug), [slug]);
  const stories = useMemo(
    () => mentor?.storySlugs.map((s) => MOCK_STORIES[s]).filter(Boolean) ?? [],
    [mentor]
  );
  const sessions = useMemo(() => MOCK_SESSIONS[slug] ?? [], [slug]);
  const roadmaps = useMemo(
    () => ROADMAP_TEMPLATES.filter((t) => mentor?.roadmapSlugs.includes(t.slug)),
    [mentor]
  );

  if (!mentor) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <Users size={40} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-primary">Mentor tidak ditemukan</p>
          <button onClick={() => router.back()} className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer">Kembali</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        <div className="bg-gradient-to-br from-primary to-secondary px-6 pt-12 pb-8">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90 mb-4">
            <ArrowLeft size={18} className="text-white" />
          </button>

          <div className="flex items-start gap-4">
            <Avatar initials={mentor.initials} size="xl" />
            <div className="flex-1 min-w-0 text-white">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{mentor.name}</h1>
                {mentor.isAvailable && (
                  <div className="flex items-center gap-1 text-[10px] bg-success/30 px-1.5 py-0.5 rounded-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    Tersedia
                  </div>
                )}
                <ProtectedAction onAction={() => setIsFollowing(!isFollowing)}>
                  <button
                    className={`ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isFollowing
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-white/80 hover:bg-white/20"
                    }`}
                  >
                    <Heart size={13} className={isFollowing ? "fill-white" : ""} />
                    {isFollowing ? "Mengikuti" : "Ikuti"}
                  </button>
                </ProtectedAction>
              </div>
              <p className="text-sm text-white/80 mt-0.5">{mentor.expertise}</p>
              {mentor.company && (
                <p className="text-xs text-white/60 mt-0.5">{mentor.position} di {mentor.company}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none bg-white/20 text-white border-white/20">
                  ⭐ {mentor.rating}
                </Badge>
                <span className="text-xs text-white/70">{mentor.yearsExperience} tahun pengalaman</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-6 pb-24 space-y-8">
          <section>
            <p className="text-sm text-text-primary leading-relaxed">{mentor.bio}</p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-text-primary mb-3">Sertifikasi & Prestasi</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.badges.map((badge, i) => (
                <MentorBadge key={i} badge={badge} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-text-primary mb-3">Statistik</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: "Mentee", value: mentor.menteeCount },
                { icon: Calendar, label: "Sesi", value: mentor.sessionCount },
                { icon: Star, label: "Rating", value: mentor.rating },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="text-center p-4 rounded-xl bg-surface border border-border">
                    <Icon size={16} className="mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold text-text-primary">{s.value}</p>
                    <p className="text-[10px] text-text-secondary">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {mentor.circleIds.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-3">Circle Bimbingan</h3>
              <div className="space-y-2">
                {mentor.circleIds.map((cid) => (
                  <Link key={cid} href={`/circle/${cid}`}>
                    <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 transition-all">
                      <Users size={16} className="text-secondary flex-shrink-0" />
                      <span className="text-sm font-medium text-text-primary">{circleNames[cid]}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {roadmaps.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-3">Roadmap Terkait</h3>
              <div className="flex flex-wrap gap-2">
                {roadmaps.map((r) => (
                  <Link key={r.slug} href={`/roadmap/${r.slug}`}>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r ${r.color}`}>
                      {r.title}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {stories.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-text-primary">Cerita dari Mentor</h3>
                <Link href="/cerita" className="text-xs font-medium text-secondary hover:underline">Lihat Semua</Link>
              </div>
              <div className="space-y-2">
                {stories.map((story) => (
                  <MentorStoryCard
                    key={story.slug}
                    slug={story.slug}
                    title={story.title}
                    readingTime={story.reading_time}
                    category={story.category?.name}
                  />
                ))}
              </div>
            </section>
          )}

          {sessions.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-primary mb-3">Sesi Mendatang</h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <MentorSessionCard key={session.id} session={session} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="text-sm font-bold text-text-primary mb-3">Produk Rekomendasi</h3>
            <div className="space-y-3">
              {(() => {
                const productIds = mentor?.roadmapSlugs.flatMap((slug) => {
                  const map: Record<string, string[]> = {
                    programmer: ["p11", "p12", "p20"],
                    runner: ["p1", "p2", "p3"],
                    musician: ["p14", "p15", "p19"],
                    "content-creator": ["p4", "p5", "p6"],
                    entrepreneur: ["p16", "p17", "p11"],
                    "digital-marketer": ["p18", "p17", "p11"],
                    "beauty-creator": ["p7", "p8", "p9"],
                    "football-player": ["p1", "p2", "p3"],
                    golfer: ["p1", "p2", "p14"],
                    doctor: ["p11", "p16", "p20"],
                  };
                  return map[slug] ?? [];
                }) ?? [];
                const uniqueIds = [...new Set(productIds)];
                const products = uniqueIds
                  .map((id) => MOCK_PRODUCTS.find((p) => p.id === id))
                  .filter(Boolean);

                if (products.length === 0) {
                  return <p className="text-xs text-text-secondary">Belum ada rekomendasi produk.</p>;
                }

                return products.map((product) => (
                  <div
                    key={product!.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-secondary/30 hover:bg-muted/30 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-text-primary truncate">{product!.name}</h4>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{product!.description}</p>
                      <p className="text-xs font-semibold text-accent mt-0.5">{product!.price}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
