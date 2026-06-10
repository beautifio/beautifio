"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Home, Users, MapPin, User, Compass } from "lucide-react";
import { BottomNavigation } from "@beautifio/ui";
import { STORY_CATEGORIES } from "@beautifio/utils";
import type { Story, StoryCategory } from "@beautifio/types";
import { StoryCard } from "@/features/cerita/components/StoryCard";
import { CategoryBar } from "@/features/cerita/components/CategoryBar";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "discover", label: "Temukan", icon: Compass },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

const cats = STORY_CATEGORIES;

const MOCK_STORIES: Story[] = [
  // Education (3)
  { id: "s1", slug: "cara-belajar-efektif-di-era-digital", title: "Cara Belajar Efektif di Era Digital", cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", author_name: "Rina Amalia", content: "Belajar di era digital penuh tantangan dan peluang. Dengan platform online, AI, dan sumber daya tak terbatas, cara belajar harus beradaptasi. Gunakan teknik Pomodoro, manfaatkan AI sebagai tutor, buat mind map, dan gabung komunitas belajar.", category_id: cats[0].id, category: cats[0] as StoryCategory, reading_time: 5, like_count: 42, save_count: 28, comment_count: 7, is_published: true, published_at: "2026-06-01T08:00:00Z", created_at: "2026-06-01T08:00:00Z" },
  { id: "s2", slug: "rekomendasi-beasiswa-2026", title: "Rekomendasi Beasiswa 2026 untuk Pelajar Indonesia", cover_image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80", author_name: "Budi Santoso", content: "Tahun 2026 membuka banyak kesempatan beasiswa. LPDP, Erasmus Mundus, dan Beasiswa Unggulan adalah beberapa yang wajib kamu coba. Siapkan esai kuat, jaga IPK minimal 3.5.", category_id: cats[0].id, category: cats[0] as StoryCategory, reading_time: 4, like_count: 38, save_count: 35, comment_count: 12, is_published: true, published_at: "2026-06-03T10:00:00Z", created_at: "2026-06-03T10:00:00Z" },
  { id: "s3", slug: "tips-memilih-jurusan-kuliah", title: "Tips Memilih Jurusan Kuliah yang Tepat", cover_image: "https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80", author_name: "Sari Indah", content: "Memilih jurusan kuliah adalah keputusan besar. Kenali minat dan bakat, riset prospek karir, konsultasi dengan alumni, dan coba kursus online sebelum memutuskan.", category_id: cats[0].id, category: cats[0] as StoryCategory, reading_time: 5, like_count: 33, save_count: 24, comment_count: 9, is_published: true, published_at: "2026-06-06T09:00:00Z", created_at: "2026-06-06T09:00:00Z" },
  // Career (3)
  { id: "s4", slug: "panduan-membangun-karir-di-teknologi", title: "Panduan Membangun Karir di Industri Teknologi", cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", author_name: "Dimas Pratama", content: "Industri teknologi terus berkembang. Pilih jalur karir, bangun portofolio, networking, dan ambil sertifikasi. Frontend, Backend, Data Science, atau DevOps? Tentukan fokus sejak awal.", category_id: cats[1].id, category: cats[1] as StoryCategory, reading_time: 6, like_count: 56, save_count: 44, comment_count: 15, is_published: true, published_at: "2026-06-05T09:00:00Z", created_at: "2026-06-05T09:00:00Z" },
  { id: "s5", slug: "tips-lolos-wawancara-kerja", title: "Cara Lolos Wawancara Kerja di Perusahaan Impian", cover_image: "https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80", author_name: "Sari Indah", content: "Wawancara kerja bisa dipersiapkan. Riset perusahaan, gunakan metode STAR, jaga kontak mata, dan kirim follow-up email. Persiapan matang adalah kunci sukses.", category_id: cats[1].id, category: cats[1] as StoryCategory, reading_time: 4, like_count: 31, save_count: 22, comment_count: 9, is_published: true, published_at: "2026-06-07T11:00:00Z", created_at: "2026-06-07T11:00:00Z" },
  { id: "s6", slug: "membangun-personal-branding-gen-z", title: "Membangun Personal Branding untuk Gen Z", cover_image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80", author_name: "Andini Putri", content: "Personal branding penting. Tentukan niche, konsisten di media sosial, bagikan pengetahuan, dan bangun jaringan. LinkedIn untuk profesional, Instagram untuk visual.", category_id: cats[1].id, category: cats[1] as StoryCategory, reading_time: 5, like_count: 44, save_count: 31, comment_count: 11, is_published: true, published_at: "2026-06-10T08:00:00Z", created_at: "2026-06-10T08:00:00Z" },
  // Business (2)
  { id: "s7", slug: "ide-bisnis-online-modal-kecil", title: "7 Ide Bisnis Online Modal Kecil untuk Mahasiswa", cover_image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80", author_name: "Andini Putri", content: "Pengen punya penghasilan sendiri? Coba dropshipping, jasa desain, content creator, affiliate marketing, jasa admin remote, thrifting, atau les online. Modal kecil, potensi besar.", category_id: cats[2].id, category: cats[2] as StoryCategory, reading_time: 6, like_count: 48, save_count: 33, comment_count: 11, is_published: true, published_at: "2026-06-08T07:00:00Z", created_at: "2026-06-08T07:00:00Z" },
  { id: "s8", slug: "cara-membuat-business-plan", title: "Cara Membuat Business Plan Sederhana untuk Pemula", cover_image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80", author_name: "Pak Rudi", content: "Business plan adalah peta jalan bisnis. Executive summary, analisis pasar, strategi marketing, dan proyeksi keuangan. Tidak perlu rumit, yang penting jelas dan terstruktur.", category_id: cats[2].id, category: cats[2] as StoryCategory, reading_time: 5, like_count: 24, save_count: 18, comment_count: 6, is_published: true, published_at: "2026-06-10T06:00:00Z", created_at: "2026-06-10T06:00:00Z" },
  // Sports (2)
  { id: "s9", slug: "panduan-olahraga-pemula-tanpa-cedera", title: "Panduan Olahraga untuk Pemula Tanpa Cedera", cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", author_name: "Fajar Hidayat", content: "Mulai olahraga dengan benar. Mulai ringan, lakukan pemanasan, konsisten 3-4 kali seminggu, dan dengarkan tubuh. Jangan memaksakan diri.", category_id: cats[3].id, category: cats[3] as StoryCategory, reading_time: 4, like_count: 29, save_count: 17, comment_count: 5, is_published: true, published_at: "2026-06-09T14:00:00Z", created_at: "2026-06-09T14:00:00Z" },
  { id: "s10", slug: "gerakan-olahraga-simpel-di-rumah", title: "5 Gerakan Olahraga Simpel yang Bisa Dilakukan di Rumah", cover_image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80", author_name: "Gita Permata", content: "Malas ke gym? Squat, push-up, plank, lunges, dan jumping jacks. Semua bisa dilakukan di kamar kos tanpa alat. Konsisten 15 menit sehari.", category_id: cats[3].id, category: cats[3] as StoryCategory, reading_time: 4, like_count: 21, save_count: 15, comment_count: 4, is_published: true, published_at: "2026-06-12T08:00:00Z", created_at: "2026-06-12T08:00:00Z" },
  // Music (2)
  { id: "s11", slug: "belajar-gitar-otodidak-30-hari", title: "Belajar Gitar Otodidak dalam 30 Hari", cover_image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80", author_name: "Kevin Alexander", content: "Program 30 hari: minggu 1 kenali gitar dan chord dasar, minggu 2 transisi chord, minggu 3 strumming patterns, minggu 4 mainkan lagu utuh. Konsisten latihan 20 menit per hari.", category_id: cats[4].id, category: cats[4] as StoryCategory, reading_time: 5, like_count: 36, save_count: 25, comment_count: 8, is_published: true, published_at: "2026-06-06T12:00:00Z", created_at: "2026-06-06T12:00:00Z" },
  { id: "s12", slug: "rekomendasi-daw-gratis-produksi-musik", title: "Rekomendasi DAW Gratis untuk Produksi Musik Pemula", cover_image: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80", author_name: "Linda Kusuma", content: "GarageBand, Cakewalk, LMMS, dan BandLab adalah DAW gratis untuk memulai produksi musik. Masing-masing punya kelebihan. Pilih sesuai OS dan kebutuhan.", category_id: cats[4].id, category: cats[4] as StoryCategory, reading_time: 4, like_count: 19, save_count: 14, comment_count: 3, is_published: true, published_at: "2026-06-11T15:00:00Z", created_at: "2026-06-11T15:00:00Z" },
  // Gaming (2)
  { id: "s13", slug: "tips-meningkatkan-aim-game-fps", title: "Tips Meningkatkan Aim di Game FPS", cover_image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", author_name: "Rizky Ferdian", content: "Atur sensitivity rendah, latihan aim trainer 15 menit sebelum main, hafalkan maps, dan komunikasi tim yang jelas. Konsistensi latihan adalah kunci.", category_id: cats[5].id, category: cats[5] as StoryCategory, reading_time: 4, like_count: 45, save_count: 20, comment_count: 10, is_published: true, published_at: "2026-06-04T16:00:00Z", created_at: "2026-06-04T16:00:00Z" },
  { id: "s14", slug: "game-mobile-ringan-semua-hp", title: "Rekomendasi Game Mobile Ringan untuk Semua HP", cover_image: "https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800&q=80", author_name: "Teguh Wicaksono", content: "HP spek rendah bukan halangan. Stardew Valley, Alto Odyssey, 8 Ball Pool, Mini Metro, dan Soul Knight. Semua under 200 MB dan seru dimainkan.", category_id: cats[5].id, category: cats[5] as StoryCategory, reading_time: 4, like_count: 28, save_count: 16, comment_count: 7, is_published: true, published_at: "2026-06-13T10:00:00Z", created_at: "2026-06-13T10:00:00Z" },
  // Creator (2)
  { id: "s15", slug: "panduan-lengkap-content-creator", title: "Panduan Lengkap Memulai Jadi Content Creator", cover_image: "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80", author_name: "Maya Sari", content: "Tentukan niche, pilih platform, konsisten upload, dan interaksi dengan audiens. TikTok untuk video pendek, YouTube untuk konten panjang, IG untuk Reels.", category_id: cats[6].id, category: cats[6] as StoryCategory, reading_time: 5, like_count: 39, save_count: 30, comment_count: 9, is_published: true, published_at: "2026-06-02T13:00:00Z", created_at: "2026-06-02T13:00:00Z" },
  { id: "s16", slug: "strategi-konten-viral-tiktok-2026", title: "Strategi Konten Viral di TikTok 2026", cover_image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80", author_name: "Nando Prabowo", content: "Hook 3 detik pertama, gunakan tren audio, durasi 15-30 detik, caption dengan CTA, dan posting di jam prime. Viral bukan cuma keberuntungan.", category_id: cats[6].id, category: cats[6] as StoryCategory, reading_time: 4, like_count: 52, save_count: 38, comment_count: 14, is_published: true, published_at: "2026-06-08T17:00:00Z", created_at: "2026-06-08T17:00:00Z" },
  // Beauty (2)
  { id: "s17", slug: "skincare-routine-kulit-berminyak", title: "Skincare Routine Sederhana untuk Kulit Berminyak", cover_image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80", author_name: "Citra Dewi", content: "Cleanser dengan salicylic acid, toner tanpa alkohol, moisturizer oil-free, sunscreen SPF 30+, dan clay mask 1-2 kali seminggu. Sederhana tapi efektif.", category_id: cats[7].id, category: cats[7] as StoryCategory, reading_time: 5, like_count: 44, save_count: 32, comment_count: 13, is_published: true, published_at: "2026-06-05T10:00:00Z", created_at: "2026-06-05T10:00:00Z" },
  { id: "s18", slug: "tutorial-makeup-natural-sehari-hari", title: "Tutorial Makeup Natural untuk Sehari-hari", cover_image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80", author_name: "Indah Wulandari", content: "Primer ringan, BB Cream, maskara+brow gel, cream blush warna peach, lip tint natural, dan setting spray. Makeup natural bikin segar tanpa menor.", category_id: cats[7].id, category: cats[7] as StoryCategory, reading_time: 5, like_count: 33, save_count: 26, comment_count: 8, is_published: true, published_at: "2026-06-14T09:00:00Z", created_at: "2026-06-14T09:00:00Z" },
  // Technology (2)
  { id: "s19", slug: "pengenalan-ai-untuk-pemula", title: "Pengenalan Artificial Intelligence untuk Pemula", cover_image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80", author_name: "Pak Anton", content: "AI adalah simulasi kecerdasan manusia oleh mesin. Machine Learning belajar dari data, Deep Learning menggunakan neural network. Mulai belajar dari CS50 AI atau Fast.ai.", category_id: cats[8].id, category: cats[8] as StoryCategory, reading_time: 6, like_count: 61, save_count: 47, comment_count: 18, is_published: true, published_at: "2026-06-01T06:00:00Z", created_at: "2026-06-01T06:00:00Z" },
  { id: "s20", slug: "rekomendasi-gadget-mahasiswa-2026", title: "Rekomendasi Gadget Terbaik untuk Mahasiswa 2026", cover_image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80", author_name: "Bella Safira", content: "MacBook Air M4 atau ThinkPad untuk laptop, iPad Air untuk tablet, smartphone dengan baterai 5000mAh+, dan aksesoris pendukung seperti mouse ergonomis dan TWS.", category_id: cats[8].id, category: cats[8] as StoryCategory, reading_time: 4, like_count: 37, save_count: 29, comment_count: 10, is_published: true, published_at: "2026-06-09T08:00:00Z", created_at: "2026-06-09T08:00:00Z" },
];

export default function CeritaPage() {
  const [activeTab, setActiveTab] = useState("cerita");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const filteredStories = useMemo(
    () =>
      selectedCategory
        ? MOCK_STORIES.filter((s) => s.category?.slug === selectedCategory)
        : MOCK_STORIES,
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Cerita</h1>
          <p className="text-sm text-text-secondary mt-1">
            Inspirasi dan wawasan untuk masa depanmu
          </p>
        </div>

        <section className="mb-6">
          <CategoryBar selected={selectedCategory} onSelect={setSelectedCategory} />
        </section>
        
        <section>
          {filteredStories.length > 0 ? (
            <div className="space-y-4">
              {filteredStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <BookOpen size={28} className="text-text-secondary/40" />
              </div>
              <p className="text-sm font-semibold text-text-primary">Tidak ada cerita ditemukan</p>
              <p className="text-xs text-text-secondary mt-1">Coba pilih kategori lain</p>
            </div>
          )}
        </section>
      </div>

      <BottomNavigation items={tabs} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); if (id === "home") router.push("/"); else router.push(`/${id}`); }} />
    </div>
  );
}
