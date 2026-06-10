"use client";

import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Heart, Bookmark, Share2, Clock, MessageSquare, BookOpen,
  MapPin, Users, Package,
} from "lucide-react";
import { Badge, Avatar } from "@beautifio/ui";
import { STORY_CATEGORIES } from "@beautifio/utils";
import type { Story, StoryRecommendation } from "@beautifio/types";
import { CommentSection } from "@/features/cerita/components/CommentSection";
import { ProtectedAction } from "@/components/ProtectedAction";

const cats = STORY_CATEGORIES;

export const MOCK_STORIES: Record<string, Story> = {
  "cara-belajar-efektif-di-era-digital": {
    id: "s1", slug: "cara-belajar-efektif-di-era-digital",
    title: "Cara Belajar Efektif di Era Digital",
    cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    author_name: "Rina Amalia",
    content: "<p>Belajar di era digital penuh tantangan dan peluang. Dengan platform online, AI, dan sumber daya tak terbatas, cara belajar harus beradaptasi.</p><h2>1. Teknik Pomodoro</h2><p>Fokus 25 menit, istirahat 5 menit. Ulangi 4 kali lalu istirahat panjang. Terbukti meningkatkan produktivitas hingga 40%.</p><h2>2. AI sebagai Tutor</h2><p>Gunakan ChatGPT atau Gemini untuk menjelaskan konsep sulit dengan analogi sederhana.</p><h2>3. Mind Mapping</h2><p>Visualisasikan hubungan antar topik. Otak lebih mudah mengingat informasi yang terstruktur.</p><h2>4. Belajar Bareng</h2><p>Gabung circle atau forum diskusi. Diskusi memperkuat pemahaman dan membuka perspektif baru.</p>",
    category_id: cats[0].id, category: cats[0], reading_time: 5, like_count: 42, save_count: 28, comment_count: 7, is_published: true, published_at: "2026-06-01T08:00:00Z", created_at: "2026-06-01T08:00:00Z",
  },
  "panduan-membangun-karir-di-teknologi": {
    id: "s4", slug: "panduan-membangun-karir-di-teknologi",
    title: "Panduan Membangun Karir di Industri Teknologi",
    cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    author_name: "Dimas Pratama",
    content: "<p>Industri teknologi terus berkembang. Ini panduan lengkap memulai karir di dunia tech.</p><h2>1. Pilih Jalur</h2><p>Frontend, Backend, Data Science, DevOps, atau PM? Tentukan fokus sejak awal.</p><h2>2. Portofolio</h2><p>Buat proyek nyata. Kontribusi open source. Website portofolio pribadi yang menampilkan karya terbaikmu.</p><h2>3. Networking</h2><p>Hadiri meetup, ikuti hackathon, gabung komunitas Discord atau Telegram. Koneksi membuka banyak pintu.</p><h2>4. Sertifikasi</h2><p>AWS, Google Cloud, atau Meta Certified. Sertifikasi meningkatkan kredibilitas dan daya saing.</p>",
    category_id: cats[1].id, category: cats[1], reading_time: 6, like_count: 56, save_count: 44, comment_count: 15, is_published: true, published_at: "2026-06-05T09:00:00Z", created_at: "2026-06-05T09:00:00Z",
  },
  "pengenalan-ai-untuk-pemula": {
    id: "s19", slug: "pengenalan-ai-untuk-pemula",
    title: "Pengenalan Artificial Intelligence untuk Pemula",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    author_name: "Pak Anton",
    content: "<p>AI bukan lagi fiksi ilmiah. Ini sudah jadi bagian hidup kita sehari-hari.</p><h2>Apa itu AI?</h2><p>Kecerdasan buatan yang memungkinkan mesin belajar dari data dan membuat keputusan.</p><h2>Machine Learning</h2><p>AI yang belajar dari data tanpa diprogram eksplisit. Contoh: rekomendasi Netflix, spam filter.</p><h2>Deep Learning</h2><p>Subset ML menggunakan neural network. Dipakai di ChatGPT, mobil otonom, dan voice assistant.</p><h2>Mulai Belajar</h2><p>CS50 AI (Harvard), Fast.ai, Google AI. Semua gratis dan bisa diakses online kapan saja.</p>",
    category_id: cats[8].id, category: cats[8], reading_time: 6, like_count: 61, save_count: 47, comment_count: 18, is_published: true, published_at: "2026-06-01T06:00:00Z", created_at: "2026-06-01T06:00:00Z",
  },
  "ide-bisnis-online-modal-kecil": {
    id: "s7", slug: "ide-bisnis-online-modal-kecil",
    title: "7 Ide Bisnis Online Modal Kecil untuk Mahasiswa",
    cover_image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
    author_name: "Andini Putri",
    content: "<p>Pengen punya penghasilan sendiri tapi modal terbatas? Coba ide-ide berikut.</p><h2>1. Dropshipping</h2><p>Jual tanpa stok barang. Modal utama untuk iklan dan promosi.</p><h2>2. Jasa Desain</h2><p>Modal laptop dan skill. Tawarkan jasa desain logo, poster, konten medsos.</p><h2>3. Content Creator</h2><p>Monetisasi hobi. TikTok, YouTube, atau IG bisa jadi sumber penghasilan.</p><h2>4. Affiliate Marketing</h2><p>Promosikan produk orang lain, dapatkan komisi. Tanpa modal sama sekali.</p>",
    category_id: cats[2].id, category: cats[2], reading_time: 6, like_count: 48, save_count: 33, comment_count: 11, is_published: true, published_at: "2026-06-08T07:00:00Z", created_at: "2026-06-08T07:00:00Z",
  },
  "membangun-personal-branding-gen-z": {
    id: "s6", slug: "membangun-personal-branding-gen-z",
    title: "Membangun Personal Branding untuk Gen Z",
    cover_image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80",
    author_name: "Andini Putri",
    content: "<p>Personal branding bukan cuma untuk selebritas. Gen Z perlu membangun personal brand sejak dini.</p><h2>1. Tentukan Niche</h2><p>Apa keahlian utamamu? Fokus pada satu bidang yang kamu kuasai dan sukai.</p><h2>2. Konsisten di Media Sosial</h2><p>LinkedIn untuk profesional, Instagram untuk visual, Twitter/X untuk opini dan wawasan.</p><h2>3. Bagikan Pengetahuan</h2><p>Buat konten edukatif, tutorial, atau opini. Tunjukkan bahwa kamu paham bidangmu.</p><h>4. Bangun Jaringan</h><p>Interaksi dengan profesional lain, komentar insightful, dan hadiri event industri.</p>",
    category_id: cats[1].id, category: cats[1], reading_time: 5, like_count: 44, save_count: 31, comment_count: 11, is_published: true, published_at: "2026-06-10T08:00:00Z", created_at: "2026-06-10T08:00:00Z",
  },
  "panduan-lengkap-content-creator": {
    id: "s15", slug: "panduan-lengkap-content-creator",
    title: "Panduan Lengkap Memulai Jadi Content Creator",
    cover_image: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80",
    author_name: "Maya Sari",
    content: "<p>Content creator adalah profesi impian banyak anak muda. Ini panduan memulainya.</p><h2>1. Tentukan Niche</h2><p>Apa yang kamu kuasai? Teknologi, fashion, makanan, edukasi? Fokus pada satu niche.</p><h2>2. Pilih Platform</h2><p>TikTok untuk video pendek, YouTube untuk konten panjang, IG untuk foto/Reels.</p><h2>3. Konsistensi</h2><p>Buat jadwal posting dan patuhi. Algoritma menyukai kreator yang konsisten.</p><h2>4. Interaksi</h2><p>Balas komentar, buat polling, minta pendapat. Bangun komunitas, bukan hanya audiens.</p>",
    category_id: cats[6].id, category: cats[6], reading_time: 5, like_count: 39, save_count: 30, comment_count: 9, is_published: true, published_at: "2026-06-02T13:00:00Z", created_at: "2026-06-02T13:00:00Z",
  },
};

const MOCK_RECOMMENDATIONS: Record<string, StoryRecommendation[]> = {
  "pengenalan-ai-untuk-pemula": [
    { id: "r1", story_id: "s19", resource_type: "roadmap", resource_id: "1", resource_name: "Roadmap Belajar AI", resource_description: "Panduan langkah demi langkah belajar AI dari nol hingga mahir." },
    { id: "r2", story_id: "s19", resource_type: "circle", resource_id: "3", resource_name: "Data Science ID Circle", resource_description: "Komunitas belajar data science dan AI untuk pemula." },
    { id: "r1-p1", story_id: "s19", resource_type: "product", resource_id: "p11", resource_name: "Laptop", resource_description: "Laptop ringan dan bertenaga untuk coding dan produktivitas." },
  ],
  "panduan-membangun-karir-di-teknologi": [
    { id: "r3", story_id: "s4", resource_type: "circle", resource_id: "1", resource_name: "Tech Founders Circle", resource_description: "Diskusi dan kolaborasi untuk para tech enthusiast." },
    { id: "r3-p1", story_id: "s4", resource_type: "product", resource_id: "p12", resource_name: "Mechanical Keyboard", resource_description: "Keyboard mekanikal yang nyaman untuk coding seharian." },
    { id: "r3-p2", story_id: "s4", resource_type: "product", resource_id: "p18", resource_name: "LinkedIn Premium", resource_description: "Fitur premium untuk networking dan pencarian kerja." },
  ],
  "cara-belajar-efektif-di-era-digital": [
    { id: "r4", story_id: "s1", resource_type: "product", resource_id: "p10", resource_name: "Skill Academy Subscription", resource_description: "Platform kursus online dengan ribuan materi dan sertifikat resmi." },
    { id: "r4-p1", story_id: "s1", resource_type: "product", resource_id: "p16", resource_name: "Notion Plus", resource_description: "All-in-one workspace untuk organisasi belajar." },
  ],
  "panduan-lengkap-content-creator": [
    { id: "r5", story_id: "s15", resource_type: "circle", resource_id: "2", resource_name: "Creative Lab Circle", resource_description: "Ruang berkarya untuk desainer, penulis, dan content creator." },
    { id: "r5-p1", story_id: "s15", resource_type: "product", resource_id: "p4", resource_name: "Microphone", resource_description: "Mikrofon kondensor USB untuk podcast dan content creation." },
    { id: "r5-p2", story_id: "s15", resource_type: "product", resource_id: "p5", resource_name: "Ring Light", resource_description: "Cahaya cincin LED dengan tripod untuk pencahayaan konten." },
    { id: "r5-p3", story_id: "s15", resource_type: "product", resource_id: "p6", resource_name: "Camera", resource_description: "Kamera mirrorless untuk fotografi dan videografi." },
  ],
  "strategi-konten-viral-tiktok-2026": [
    { id: "r6", story_id: "s16", resource_type: "roadmap", resource_id: "2", resource_name: "Roadmap Jadi Content Creator", resource_description: "Panduan step-by-step dari 0 hingga 10.000 followers." },
    { id: "r6-p1", story_id: "s16", resource_type: "product", resource_id: "p17", resource_name: "Canva Pro", resource_description: "Tools desain grafis premium dengan template tak terbatas." },
  ],
  "membangun-personal-branding-gen-z": [
    { id: "r7", story_id: "s6", resource_type: "product", resource_id: "p17", resource_name: "Canva Pro", resource_description: "Tools desain grafis untuk membuat konten visual yang menarik." },
    { id: "r7-p1", story_id: "s6", resource_type: "product", resource_id: "p18", resource_name: "LinkedIn Premium", resource_description: "Fitur premium untuk membangun personal branding." },
  ],
  "ide-bisnis-online-modal-kecil": [
    { id: "r8", story_id: "s7", resource_type: "product", resource_id: "p16", resource_name: "Notion Plus", resource_description: "All-in-one workspace untuk organisasi belajar dan bisnis." },
    { id: "r8-p1", story_id: "s7", resource_type: "product", resource_id: "p17", resource_name: "Canva Pro", resource_description: "Buat desain produk dan konten promosi dengan mudah." },
  ],
};

function RecommendedSection({ recommendations }: { recommendations: StoryRecommendation[] }) {
  if (recommendations.length === 0) return null;

  const config = {
    roadmap: { icon: MapPin, label: "Roadmap", color: "text-accent", bg: "bg-accent/10" },
    circle: { icon: Users, label: "Circle", color: "text-secondary", bg: "bg-secondary/10" },
    product: { icon: Package, label: "Produk", color: "text-primary", bg: "bg-primary/10" },
  } as const;

  return (
    <section>
      <h3 className="text-base font-bold text-text-primary mb-3">Rekomendasi</h3>
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const c = config[rec.resource_type];
          const Icon = c.icon;
          return (
            <div key={rec.id} className="flex items-center gap-3 p-4 rounded-sm border border-border hover:border-secondary/30 transition-all cursor-pointer group">
              <div className={`w-10 h-10 rounded-sm ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={c.color} />
              </div>
              <div className="flex-1 min-w-0">
                <Badge variant={rec.resource_type === "roadmap" ? "accent" : rec.resource_type === "circle" ? "secondary" : "default"} className="mb-1">{c.label}</Badge>
                <h4 className="text-sm font-semibold text-text-primary truncate">{rec.resource_name}</h4>
                {rec.resource_description && <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{rec.resource_description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function CeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const story = MOCK_STORIES[slug];
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.like_count ?? 0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const recommendations = useMemo(() => MOCK_RECOMMENDATIONS[slug] ?? [], [slug]);

  const publishedDate = story?.published_at
    ? new Date(story.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  if (!story) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={40} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-primary">Cerita tidak ditemukan</p>
          <button onClick={() => router.push("/cerita")} className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer">Kembali ke Cerita</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        {story.cover_image && (
          <div className="relative aspect-[16/9]">
            <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button onClick={() => router.push("/cerita")} className="absolute top-4 left-4 w-8 h-8 rounded-sm bg-black/30 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
              <ArrowLeft size={18} className="text-white" />
            </button>
          </div>
        )}

        <article className="px-6 pt-5 pb-24">
          {!story.cover_image && (
            <button onClick={() => router.push("/cerita")} className="w-8 h-8 rounded-sm bg-surface border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors mb-4">
              <ArrowLeft size={18} className="text-text-secondary" />
            </button>
          )}

          <Badge variant="secondary" className="mb-2">
            {story.category?.name ?? "General"}
          </Badge>

          <h1 className="text-xl font-bold text-text-primary leading-tight">{story.title}</h1>

          <div className="flex items-center gap-3 mt-3">
            <Avatar initials={story.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)} size="sm" />
            <div>
              <span className="text-sm font-semibold text-text-primary">{story.author_name}</span>
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <span>{publishedDate}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={11} />{story.reading_time} menit</span>
              </div>
            </div>
          </div>

          <div
            className="mt-6 prose prose-sm max-w-none text-text-primary leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-text-primary [&_p]:text-sm [&_p]:mb-4 [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          <div className="flex items-center gap-3 mt-8 py-4 border-y border-border">
            <button
              onClick={() => { setIsLiked(!isLiked); setLikeCount((c) => isLiked ? c - 1 : c + 1); }}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-sm border text-sm font-medium transition-all cursor-pointer ${isLiked ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"}`}
            >
              <Heart size={16} className={isLiked ? "fill-destructive text-destructive" : ""} />
              {likeCount}
            </button>

            <ProtectedAction label="Masuk untuk Menyimpan Cerita">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`flex items-center gap-1.5 h-9 px-4 rounded-sm border text-sm font-medium transition-all cursor-pointer ${isSaved ? "bg-accent/10 border-accent/30 text-accent-foreground" : "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"}`}
              >
                <Bookmark size={16} className={isSaved ? "fill-accent text-accent" : ""} />
                {isSaved ? "Tersimpan" : "Simpan"}
              </button>
            </ProtectedAction>

            <div className="relative">
              <button
                onClick={async () => {
                  if (navigator.share) {
                    await navigator.share({ title: story.title, url: window.location.href });
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    setShowShareTooltip(true);
                    setTimeout(() => setShowShareTooltip(false), 2000);
                  }
                }}
                className="flex items-center gap-1.5 h-9 px-4 rounded-sm border border-border bg-surface text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-text-primary transition-all cursor-pointer"
              >
                <Share2 size={16} /> Bagikan
              </button>
              {showShareTooltip && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[10px] px-2 py-1 rounded-sm whitespace-nowrap">Link tersalin!</div>
              )}
            </div>
          </div>

          <div className="mt-8"><RecommendedSection recommendations={recommendations} /></div>
          <div className="mt-8"><CommentSection storyId={story.id} /></div>
        </article>
      </div>
    </div>
  );
}
