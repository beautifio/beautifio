"use client";

import { useState, useMemo } from "react";
import { BookOpen, Home, Users, MapPin, Compass, User } from "lucide-react";
import { BottomNavigation } from "@beautifio/ui";
import { STORY_CATEGORIES } from "@beautifio/utils";
import type { Story } from "@beautifio/types";
import { StoryCard } from "@/features/cerita/components/StoryCard";
import { CategoryBar } from "@/features/cerita/components/CategoryBar";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profile", label: "Profil", icon: User },
];

const MOCK_STORIES: Story[] = [
  {
    id: "1",
    slug: "cara-belajar-efektif-di-era-digital",
    title: "Cara Belajar Efektif di Era Digital",
    cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    author_id: "u1",
    author_name: "Rina Amalia",
    content: "Belajar di era digital membawa banyak tantangan dan peluang. Dengan hadirnya berbagai platform pembelajaran online, AI, dan sumber daya tak terbatas, cara kita belajar harus beradaptasi. Gunakan Teknik Pomodoro untuk fokus, manfaatkan AI sebagai tutor pribadi, buat peta konsep, dan bergabung dengan komunitas belajar.",
    category: "education",
    reading_time: 5,
    like_count: 42,
    save_count: 28,
    comment_count: 7,
    is_published: true,
    published_at: "2026-06-01T08:00:00Z",
    created_at: "2026-06-01T08:00:00Z",
  },
  {
    id: "2",
    slug: "panduan-membangun-karir-di-tech-industry",
    title: "Panduan Membangun Karir di Tech Industry",
    cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    author_id: "u2",
    author_name: "Dimas Pratama",
    content: "Industri teknologi terus berkembang pesat. Berikut panduan lengkap untuk memulai dan membangun karir di dunia tech. Pilih jalur karirmu, bangun portofolio, networking, dan ambil sertifikasi untuk menambah kredibilitas.",
    category: "career",
    reading_time: 6,
    like_count: 56,
    save_count: 44,
    comment_count: 15,
    is_published: true,
    published_at: "2026-06-05T09:00:00Z",
    created_at: "2026-06-05T09:00:00Z",
  },
  {
    id: "3",
    slug: "pengenalan-artificial-intelligence-untuk-pemula",
    title: "Pengenalan Artificial Intelligence untuk Pemula",
    cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    author_id: "u3",
    author_name: "Pak Anton",
    content: "AI bukan lagi masa depan — ini sudah hadir. Yuk pahami dasar-dasarnya. Artificial Intelligence adalah simulasi kecerdasan manusia oleh mesin. Termasuk machine learning dan deep learning.",
    category: "technology",
    reading_time: 6,
    like_count: 61,
    save_count: 47,
    comment_count: 18,
    is_published: true,
    published_at: "2026-06-01T06:00:00Z",
    created_at: "2026-06-01T06:00:00Z",
  },
  {
    id: "4",
    slug: "ide-bisnis-online-modal-kecil",
    title: "Ide Bisnis Online Modal Kecil untuk Mahasiswa",
    cover_image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80",
    author_id: "u4",
    author_name: "Andini Putri",
    content: "Memulai bisnis tidak perlu modal besar. Dropshipping, jasa desain grafis, content creator, dan affiliate marketing adalah beberapa ide bisnis online yang cocok untuk mahasiswa.",
    category: "business",
    reading_time: 5,
    like_count: 48,
    save_count: 33,
    comment_count: 11,
    is_published: true,
    published_at: "2026-06-08T07:00:00Z",
    created_at: "2026-06-08T07:00:00Z",
  },
  {
    id: "5",
    slug: "tips-meningkatkan-skill-di-game-fps",
    title: "Tips Meningkatkan Skill di Game FPS",
    cover_image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    author_id: "u5",
    author_name: "Rizky Ferdian",
    content: "Mau jadi pemain FPS yang lebih baik? Atur sensitivity mouse, latihan aim dengan aim trainer, pelajari maps, dan komunikasi tim yang jelas.",
    category: "gaming",
    reading_time: 4,
    like_count: 45,
    save_count: 20,
    comment_count: 10,
    is_published: true,
    published_at: "2026-06-04T16:00:00Z",
    created_at: "2026-06-04T16:00:00Z",
  },
  {
    id: "6",
    slug: "skincare-routine-untuk-remaja",
    title: "Skincare Routine Sederhana untuk Remaja",
    cover_image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
    author_id: "u6",
    author_name: "Citra Dewi",
    content: "Merawat kulit tidak perlu ribet dan mahal. Cukup dengan cleanser, moisturizer, dan sunscreen. Jangan lupa ganti sarung bantal dan minum air putih yang cukup.",
    category: "beauty",
    reading_time: 4,
    like_count: 44,
    save_count: 32,
    comment_count: 13,
    is_published: true,
    published_at: "2026-06-05T10:00:00Z",
    created_at: "2026-06-05T10:00:00Z",
  },
  {
    id: "7",
    slug: "panduan-mulai-jadi-content-creator",
    title: "Panduan Lengkap Mulai Jadi Content Creator",
    cover_image: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80",
    author_id: "u7",
    author_name: "Maya Sari",
    content: "Content creator adalah salah satu profesi paling populer. Tentukan niche, pilih platform, konsisten upload, dan interaksi dengan audiens.",
    category: "creator",
    reading_time: 5,
    like_count: 39,
    save_count: 30,
    comment_count: 9,
    is_published: true,
    published_at: "2026-06-02T13:00:00Z",
    created_at: "2026-06-02T13:00:00Z",
  },
  {
    id: "8",
    slug: "belajar-gitar-otodidak-dari-nol",
    title: "Belajar Gitar Otodidak dari Nol dalam 30 Hari",
    cover_image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
    author_id: "u8",
    author_name: "Kevin Alexander",
    content: "Ikuti panduan 30 hari ini! Minggu 1 kenali gitar dan chord dasar. Minggu 2 latihan chord transisi. Minggu 3 pelajari strumming patterns. Minggu 4 mainkan lagu utuh.",
    category: "music",
    reading_time: 5,
    like_count: 36,
    save_count: 25,
    comment_count: 8,
    is_published: true,
    published_at: "2026-06-06T12:00:00Z",
    created_at: "2026-06-06T12:00:00Z",
  },
  {
    id: "9",
    slug: "tips-mulai-olahraga-untuk-pemula",
    title: "Tips Mulai Olahraga untuk Pemula Tanpa Cedera",
    cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    author_id: "u9",
    author_name: "Fajar Hidayat",
    content: "Mulai olahraga itu mudah jika dilakukan dengan benar. Mulai dari yang ringan, lakukan pemanasan dan pendinginan, atur jadwal konsisten, dan dengarkan tubuhmu.",
    category: "sports",
    reading_time: 3,
    like_count: 29,
    save_count: 17,
    comment_count: 5,
    is_published: true,
    published_at: "2026-06-09T14:00:00Z",
    created_at: "2026-06-09T14:00:00Z",
  },
  {
    id: "10",
    slug: "rekomendasi-gadget-untuk-mahasiswa-2026",
    title: "Rekomendasi Gadget untuk Mahasiswa 2026",
    cover_image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    author_id: "u10",
    author_name: "Bella Safira",
    content: "Memilih gadget yang tepat sangat penting untuk menunjang perkuliahan. Rekomendasi laptop, tablet, smartphone, dan aksesoris untuk mahasiswa.",
    category: "technology",
    reading_time: 4,
    like_count: 37,
    save_count: 29,
    comment_count: 10,
    is_published: true,
    published_at: "2026-06-09T08:00:00Z",
    created_at: "2026-06-09T08:00:00Z",
  },
];

export default function CeritaPage() {
  const [activeTab, setActiveTab] = useState("cerita");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredStories = useMemo(
    () =>
      selectedCategory
        ? MOCK_STORIES.filter((s) => s.category === selectedCategory)
        : MOCK_STORIES,
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto px-6 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Cerita</h1>
          <p className="text-sm text-text-secondary mt-1">
            Inspirasi dan wawasan untuk masa depanmu
          </p>
        </div>

        <section className="mb-6">
          <CategoryBar
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </section>

        <section>
          {filteredStories.length > 0 ? (
            <div className="space-y-5">
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen size={36} className="mx-auto text-text-secondary/30 mb-3" />
              <p className="text-sm font-medium text-text-primary">
                Tidak ada cerita ditemukan
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Coba pilih kategori lain
              </p>
            </div>
          )}
        </section>
      </div>

      <BottomNavigation
        items={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
