"use client";

import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  Clock,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { Badge, Avatar } from "@beautifio/ui";
import { STORY_CATEGORIES } from "@beautifio/utils";
import type { Story, StoryRecommendation } from "@beautifio/types";
import { CommentSection } from "@/features/cerita/components/CommentSection";
import { RecommendedSection } from "@/features/cerita/components/RecommendedSection";

const categoryLabels: Record<string, string> = {
  education: "Edukasi",
  career: "Karir",
  business: "Bisnis",
  sports: "Olahraga",
  music: "Musik",
  gaming: "Gaming",
  creator: "Kreator",
  beauty: "Kecantikan",
  technology: "Teknologi",
};

const MOCK_STORIES: Record<string, Story> = {
  "cara-belajar-efektif-di-era-digital": {
    id: "1",
    slug: "cara-belajar-efektif-di-era-digital",
    title: "Cara Belajar Efektif di Era Digital",
    cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    author_id: "u1",
    author_name: "Rina Amalia",
    content: `
      <p>Belajar di era digital membawa banyak tantangan dan peluang. Dengan hadirnya berbagai platform pembelajaran online, AI, dan sumber daya tak terbatas, cara kita belajar harus beradaptasi.</p>
      <h2>1. Gunakan Teknik Pomodoro</h2>
      <p>Teknik Pomodoro membantu kamu fokus selama 25 menit, lalu istirahat 5 menit. Ulangi siklus ini 4 kali, lalu ambil istirahat lebih panjang.</p>
      <h2>2. Manfaatkan AI sebagai Tutor Pribadi</h2>
      <p>Gunakan ChatGPT atau Google Gemini untuk menjelaskan konsep yang sulit. Minta mereka memberikan analogi, contoh, atau latihan soal.</p>
      <h2>3. Buat Peta Konsep</h2>
      <p>Visualisasikan hubungan antar topik menggunakan mind map. Ini membantu otak memahami struktur pengetahuan secara keseluruhan.</p>
      <h2>4. Bergabung dengan Komunitas Belajar</h2>
      <p>Belajar sendiri itu membosankan. Cari circle atau forum diskusi yang sesuai dengan bidang yang kamu pelajari. Dengan teman belajar yang tepat, proses belajar jadi lebih menyenangkan dan efektif.</p>
      <p>Mulai sekarang juga! Pilih satu teknik dan praktikkan hari ini. Konsistensi adalah kunci utama keberhasilan belajar.</p>
    `,
    category: "education",
    reading_time: 5,
    like_count: 42,
    save_count: 28,
    comment_count: 7,
    is_published: true,
    published_at: "2026-06-01T08:00:00Z",
    created_at: "2026-06-01T08:00:00Z",
  },
  "panduan-membangun-karir-di-tech-industry": {
    id: "2",
    slug: "panduan-membangun-karir-di-tech-industry",
    title: "Panduan Membangun Karir di Tech Industry",
    cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    author_id: "u2",
    author_name: "Dimas Pratama",
    content: `
      <p>Industri teknologi terus berkembang pesat. Berikut panduan lengkap untuk memulai dan membangun karir di dunia tech.</p>
      <h2>1. Pilih Jalur Karir</h2>
      <p>Frontend, Backend, Data Science, DevOps, atau Product Management? Tentukan minatmu dan fokus pada satu jalur terlebih dahulu.</p>
      <h2>2. Bangun Portofolio</h2>
      <p>Buat proyek nyata. Kontribusi ke open source. Buat personal website yang menampilkan karyamu. Portofolio yang kuat bisa lebih berharga daripada ijazah.</p>
      <h2>3. Networking</h2>
      <p>Hadiri meetup tech, ikuti hackathon, gabung komunitas Discord atau Telegram. Koneksi bisa membuka pintu kesempatan yang tidak terduga.</p>
      <h2>4. Sertifikasi</h2>
      <p>Ambil sertifikasi AWS, Google Cloud, atau Meta untuk menambah kredibilitas dan nilai jualmu di pasar kerja.</p>
    `,
    category: "career",
    reading_time: 6,
    like_count: 56,
    save_count: 44,
    comment_count: 15,
    is_published: true,
    published_at: "2026-06-05T09:00:00Z",
    created_at: "2026-06-05T09:00:00Z",
  },
  "pengenalan-artificial-intelligence-untuk-pemula": {
    id: "3",
    slug: "pengenalan-artificial-intelligence-untuk-pemula",
    title: "Pengenalan Artificial Intelligence untuk Pemula",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    author_id: "u3",
    author_name: "Pak Anton",
    content: `
      <p>AI bukan lagi masa depan — ini sudah hadir. Yuk pahami dasar-dasarnya.</p>
      <h2>Apa itu AI?</h2>
      <p>Artificial Intelligence adalah simulasi kecerdasan manusia oleh mesin. Termasuk di dalamnya machine learning dan deep learning.</p>
      <h2>Machine Learning</h2>
      <p>AI yang bisa belajar dari data tanpa diprogram secara eksplisit. Contoh: rekomendasi Netflix, filter spam email.</p>
      <h2>Deep Learning</h2>
      <p>Subset dari ML yang menggunakan neural network. Digunakan di ChatGPT, self-driving cars, dan voice assistants.</p>
      <h2>Belajar dari Mana?</h2>
      <p>Mulai dari kursus gratis: CS50 AI dari Harvard, Fast.ai, atau Google AI. Semuanya bisa diakses online dan gratis.</p>
    `,
    category: "technology",
    reading_time: 6,
    like_count: 61,
    save_count: 47,
    comment_count: 18,
    is_published: true,
    published_at: "2026-06-01T06:00:00Z",
    created_at: "2026-06-01T06:00:00Z",
  },
  "ide-bisnis-online-modal-kecil": {
    id: "4",
    slug: "ide-bisnis-online-modal-kecil",
    title: "Ide Bisnis Online Modal Kecil untuk Mahasiswa",
    cover_image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
    author_id: "u4",
    author_name: "Andini Putri",
    content: `
      <p>Memulai bisnis tidak perlu modal besar. Berikut ide bisnis online yang cocok untuk mahasiswa.</p>
      <h2>1. Dropshipping</h2>
      <p>Jual produk tanpa stok barang. Kamu hanya perlu toko online dan supplier yang terpercaya. Modal utama hanya untuk promosi.</p>
      <h2>2. Jasa Desain Grafis</h2>
      <p>Modal laptop dan skill desain. Tawarkan jasa pembuatan logo, poster, atau konten media sosial.</p>
      <h2>3. Content Creator</h2>
      <p>Monetisasi hobi membuat konten di TikTok, YouTube, atau Instagram.</p>
      <h2>4. Affiliate Marketing</h2>
      <p>Promosikan produk orang lain dan dapatkan komisi dari setiap penjualan. Cocok untuk pemula tanpa modal.</p>
    `,
    category: "business",
    reading_time: 5,
    like_count: 48,
    save_count: 33,
    comment_count: 11,
    is_published: true,
    published_at: "2026-06-08T07:00:00Z",
    created_at: "2026-06-08T07:00:00Z",
  },
};

const MOCK_RECOMMENDATIONS: Record<string, StoryRecommendation[]> = {
  "pengenalan-artificial-intelligence-untuk-pemula": [
    {
      id: "r1",
      story_id: "3",
      resource_type: "roadmap",
      resource_id: "1",
      resource_name: "Roadmap Belajar AI",
      resource_description: "Panduan langkah demi langkah belajar AI dari nol hingga mahir.",
    },
  ],
  "panduan-membangun-karir-di-tech-industry": [
    {
      id: "r2",
      story_id: "2",
      resource_type: "circle",
      resource_id: "1",
      resource_name: "Tech Founders Circle",
      resource_description: "Diskusi dan kolaborasi untuk para tech enthusiast.",
    },
  ],
  "cara-belajar-efektif-di-era-digital": [
    {
      id: "r3",
      story_id: "1",
      resource_type: "product",
      resource_id: "1",
      resource_name: "Skill Academy",
      resource_description: "Platform kursus online dengan sertifikat resmi.",
    },
  ],
};

export default function CeritaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const story = MOCK_STORIES[slug];
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(story?.like_count ?? 0);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const recommendations = useMemo(
    () => MOCK_RECOMMENDATIONS[slug] ?? [],
    [slug]
  );

  const handleLike = () => {
    if (isLiked) {
      setLikeCount((c) => c - 1);
    } else {
      setLikeCount((c) => c + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: story?.title,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  if (!story) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={40} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-medium text-text-primary">
            Cerita tidak ditemukan
          </p>
          <button
            onClick={() => router.push("/cerita")}
            className="mt-3 text-xs font-medium text-primary hover:underline cursor-pointer"
          >
            Kembali ke Cerita
          </button>
        </div>
      </div>
    );
  }

  const publishedDate = story.published_at
    ? new Date(story.published_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto">
        {story.cover_image && (
          <div className="relative aspect-[16/9]">
            <img
              src={story.cover_image}
              alt={story.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={() => router.push("/cerita")}
              className="absolute top-4 left-4 w-8 h-8 rounded-sm bg-black/30 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
          </div>
        )}

        <article className="px-6 pt-5 pb-24">
          {!story.cover_image && (
            <button
              onClick={() => router.push("/cerita")}
              className="w-8 h-8 rounded-sm bg-surface border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors mb-4"
            >
              <ArrowLeft size={18} className="text-text-secondary" />
            </button>
          )}

          <Badge variant="secondary" className="mb-2">
            {categoryLabels[story.category] || story.category}
          </Badge>

          <h1 className="text-xl font-bold text-text-primary leading-tight">
            {story.title}
          </h1>

          <div className="flex items-center gap-3 mt-3">
            <Avatar initials={story.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)} size="sm" />
            <div>
              <span className="text-sm font-semibold text-text-primary">
                {story.author_name}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                <span>{publishedDate}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {story.reading_time} menit
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-6 prose prose-sm max-w-none text-text-primary leading-relaxed [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-text-primary [&_p]:text-sm [&_p]:mb-4 [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: story.content }}
          />

          <div className="flex items-center gap-3 mt-8 py-4 border-y border-border">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-sm border text-sm font-medium transition-all cursor-pointer ${
                isLiked
                  ? "bg-destructive/10 border-destructive/30 text-destructive"
                  : "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
              }`}
            >
              <Heart
                size={16}
                className={isLiked ? "fill-destructive text-destructive" : ""}
              />
              {likeCount}
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-sm border text-sm font-medium transition-all cursor-pointer ${
                isSaved
                  ? "bg-accent/10 border-accent/30 text-accent-foreground"
                  : "bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
              }`}
            >
              <Bookmark
                size={16}
                className={isSaved ? "fill-accent text-accent" : ""}
              />
              {isSaved ? "Tersimpan" : "Simpan"}
            </button>

            <div className="relative">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 h-9 px-4 rounded-sm border border-border bg-surface text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-text-primary transition-all cursor-pointer"
              >
                <Share2 size={16} />
                Bagikan
              </button>
              {showShareTooltip && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[10px] px-2 py-1 rounded-sm whitespace-nowrap">
                  Link tersalin!
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <RecommendedSection recommendations={recommendations} />
          </div>

          <div className="mt-8">
            <CommentSection storyId={story.id} />
          </div>
        </article>
      </div>
    </div>
  );
}
