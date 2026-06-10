"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, Clock, Heart, MessageSquare, Flag, Shield,
  Users, Sparkles, BookOpen, PenLine, Quote,
  Home, MapPin, User,
} from "lucide-react";
import { BottomNavigation, Badge, Card } from "@beautifio/ui";
import { STORY_CATEGORIES } from "@beautifio/utils";
import { NAV_TABS, navRoute } from "@/lib/navigation";

type ContentType = "all" | "story" | "anonymous" | "journal" | "mentor" | "community";

interface InspirasiItem {
  id: string;
  slug: string;
  type: ContentType;
  title: string;
  content: string;
  author: string;
  initials?: string;
  cover_image?: string;
  category: string;
  reading_time: number;
  like_count: number;
  comment_count: number;
  is_reported?: boolean;
  mentor_title?: string;
  community_name?: string;
}

const CONTENT_TABS: { id: ContentType; label: string; icon: typeof BookHeart }[] = [
  { id: "all", label: "Semua", icon: Sparkles },
  { id: "story", label: "Story", icon: BookOpen },
  { id: "anonymous", label: "Anonymous Story", icon: PenLine },
  { id: "journal", label: "Journal", icon: BookHeart },
  { id: "mentor", label: "Mentor Story", icon: Quote },
  { id: "community", label: "Community Story", icon: Users },
];

const DATA: InspirasiItem[] = [
  // --- STORY ---
  { id: "s1", slug: "cara-belajar-efektif", type: "story", title: "Cara Belajar Efektif di Era Digital", content: "Belajar di era digital penuh tantangan dan peluang. Gunakan teknik Pomodoro, manfaatkan AI sebagai tutor, buat mind map, dan gabung komunitas belajar.", author: "Rina Amalia", initials: "RA", category: "Edukasi", reading_time: 5, like_count: 42, comment_count: 7, cover_image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80" },
  { id: "s2", slug: "panduan-karir-teknologi", type: "story", title: "Panduan Membangun Karir di Industri Teknologi", content: "Pilih jalur karir, bangun portofolio, networking, dan ambil sertifikasi. Frontend, Backend, Data Science, atau DevOps?", author: "Dimas Pratama", initials: "DP", category: "Karir", reading_time: 6, like_count: 56, comment_count: 15, cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" },
  { id: "s3", slug: "ide-bisnis-online", type: "story", title: "7 Ide Bisnis Online Modal Kecil untuk Mahasiswa", content: "Dropshipping, jasa desain, content creator, affiliate marketing, jasa admin remote, thrifting, atau les online.", author: "Andini Putri", initials: "AP", category: "Bisnis", reading_time: 6, like_count: 48, comment_count: 11, cover_image: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=80" },
  // --- ANONYMOUS STORY ---
  { id: "a1", slug: "anonym-1", type: "anonymous", title: "Aku Baru Tahu Kalau Selama Ini Salah Jurusan", content: "Semester 3 dan baru sadar kalau jurusan ini bukan untukku. Rasanya campur aduk antara takut, kecewa, tapi juga lega karena akhirnya jujur sama diri sendiri.", author: "Anonim", category: "Pendidikan", reading_time: 4, like_count: 127, comment_count: 34 },
  { id: "a2", slug: "anonym-2", type: "anonymous", title: "Tips Bertahan Hidup dari Anak Rantau", content: "Dari belajar masak mi instan yang benar sampai cara mengatur uang bulanan. Semua kuliah di sini ternyata bikin dewasa.", author: "Anonim", category: "Kehidupan", reading_time: 3, like_count: 89, comment_count: 21 },
  { id: "a3", slug: "anonym-3", type: "anonymous", title: "Pengalaman Gagal Wawancara 5 Kali Berturut-turut", content: "Rasanya pengen menyerah. Tapi setelah evaluasi, aku sadar apa yang kurang. Sekarang udah kerja di perusahaan impian.", author: "Anonim", category: "Karir", reading_time: 5, like_count: 204, comment_count: 56 },
  // --- JOURNAL ---
  { id: "j1", slug: "journal-1", type: "journal", title: "Refleksi Mingguan: Progress Belajar React", content: "Minggu ini berhasil menyelesaikan 3 modul React. Masih struggle sama hooks, tapi makin paham konsep state management.", author: "Rina Amalia", initials: "RA", category: "Teknologi", reading_time: 2, like_count: 15, comment_count: 4 },
  { id: "j2", slug: "journal-2", type: "journal", title: "30 Hari Challenge Menulis: Hari ke-15", content: "Setengah jalan! Konsisten menulis 500 kata per hari. Topik hari ini: 'Apa yang akan kamu katakan ke dirimu 5 tahun lalu?'", author: "Sari Indah", initials: "SI", category: "Kreator", reading_time: 3, like_count: 28, comment_count: 7 },
  { id: "j3", slug: "journal-3", type: "journal", title: "Catatan Perjalanan: Belajar dari Kegagalan", content: "Gagal itu bukan akhir. Dari setiap kegagalan, aku belajar sesuatu yang tidak akan diajarkan di sekolah.", author: "Budi Santoso", initials: "BS", category: "Pengembangan Diri", reading_time: 4, like_count: 67, comment_count: 12 },
  // --- MENTOR STORY ---
  { id: "m1", slug: "mentor-1", type: "mentor", title: "Dari Tukang Servis HP Jadi Tech Lead", content: "Perjalanan 10 tahun dari bocah yang suka bongkar HP hingga memimpin tim engineering di startup unicorn. Kuncinya: rasa ingin tahu.", author: "Pak Anton", initials: "PA", mentor_title: "Lead Data Scientist, TechCorp AI", category: "Karir", reading_time: 7, like_count: 312, comment_count: 48 },
  { id: "m2", slug: "mentor-2", type: "mentor", title: "Tips Membangun Startup dari Nol", content: "Founder 2 startup yang sukses diakuisisi berbagi pengalaman: dari ide, mencari co-founder, hingga fundraising.", author: "Pak Rudi", initials: "RR", mentor_title: "CEO & Founder, TechStart Indonesia", category: "Bisnis", reading_time: 8, like_count: 245, comment_count: 39 },
  { id: "m3", slug: "mentor-3", type: "mentor", title: "Perjalanan Jadi Dokter Spesialis Bedah", content: "15 tahun pendidikan dan praktik. Bukan jalan yang mudah, tapi setiap langkah terasa berarti.", author: "Dr. Rudi Hartono", initials: "RH", mentor_title: "Dokter Spesialis Bedah, RS Pusat Nasional", category: "Pendidikan", reading_time: 6, like_count: 178, comment_count: 27 },
  // --- COMMUNITY STORY ---
  { id: "c1", slug: "community-1", type: "community", title: "Tech Founders Sukses Gelar Hackathon Internal", content: "Circle Tech Founders baru saja menyelesaikan hackathon 48 jam. 6 tim berkompetisi, 3 prototipe produk jadi.", author: "Circle Tech Founders", community_name: "Tech Founders", category: "Teknologi", reading_time: 3, like_count: 73, comment_count: 14 },
  { id: "c2", slug: "community-2", type: "community", title: "Creative Lab Kolaborasi dengan Brand Lokal", content: "Anggota Creative Lab mendapat kesempatan mengerjakan proyek desain untuk brand fashion lokal.", author: "Circle Creative Lab", community_name: "Creative Lab", category: "Kreator", reading_time: 2, like_count: 54, comment_count: 8 },
  { id: "c3", slug: "community-3", type: "community", title: "Green Warriors Aksi Bersih Pantai di Anyer", content: "60 anggota berpartisipasi dalam aksi bersih pantai. Terkumpul 200kg sampah dalam satu hari.", author: "Circle Green Warriors", community_name: "Green Warriors", category: "Lingkungan", reading_time: 2, like_count: 91, comment_count: 19 },
  { id: "c4", slug: "community-4", type: "community", title: "Future Leaders Gelar Seminar Kepemimpinan", content: "Seminar dihadiri 200 peserta dari berbagai universitas. Topik: 'Memimpin di Era Digital'.", author: "Circle Future Leaders", community_name: "Future Leaders", category: "Kepemimpinan", reading_time: 3, like_count: 66, comment_count: 11 },
];

function ContentTypeBar({
  selected,
  onSelect,
}: {
  selected: ContentType;
  onSelect: (t: ContentType) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {CONTENT_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = selected === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`flex items-center gap-1.5 flex-shrink-0 h-9 px-4 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-surface border border-border text-text-secondary hover:border-primary/30 hover:text-text-primary"
            }`}
          >
            <Icon size={13} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function SafeReportButton({ item }: { item: InspirasiItem }) {
  const [reported, setReported] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setReported(true);
        setTimeout(() => setReported(false), 2000);
      }}
      className="flex items-center gap-1 text-[10px] text-text-secondary hover:text-destructive transition-colors cursor-pointer"
      title="Laporkan konten ini"
    >
      {reported ? (
        <>
          <Shield size={11} className="text-success" />
          <span className="text-success">Terlapor</span>
        </>
      ) : (
        <>
          <Flag size={11} />
          <span>Laporkan</span>
        </>
      )}
    </button>
  );
}

function InspirasiCard({ item }: { item: InspirasiItem }) {
  const router = useRouter();
  const typeConfig = CONTENT_TABS.find((t) => t.id === item.type)!;
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => router.push(`/inspirasi/${item.slug}`)}
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      {item.cover_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={item.cover_image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant={item.type === "mentor" ? "default" : "secondary"} className="flex items-center gap-1">
            <TypeIcon size={10} />
            {typeConfig.label}
          </Badge>
          <Badge variant="accent" className="text-[10px] px-1.5 py-0">
            {item.category}
          </Badge>
        </div>

        <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">
          {item.content}
        </p>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-text-secondary">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {item.reading_time} mnt
          </span>
          <span className="flex items-center gap-1">
            <Heart size={11} />
            {item.like_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare size={11} />
            {item.comment_count}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {item.type === "anonymous" ? (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <PenLine size={12} className="text-text-secondary" />
              </div>
            ) : item.initials ? (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-[8px] font-bold text-white">
                {item.initials}
              </div>
            ) : null}
            <div>
              <span className="text-[11px] font-medium text-text-primary">
                {item.author}
              </span>
              {item.mentor_title && (
                <p className="text-[9px] text-text-secondary">{item.mentor_title}</p>
              )}
              {item.community_name && (
                <p className="text-[9px] text-text-secondary">{item.community_name}</p>
              )}
            </div>
          </div>
          <SafeReportButton item={item} />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ type }: { type: ContentType }) {
  const t = CONTENT_TABS.find((c) => c.id === type)!;
  const Icon = t.icon;
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-secondary/40" />
      </div>
      <p className="text-sm font-semibold text-text-primary">Tidak ada {t.label.toLowerCase()} ditemukan</p>
      <p className="text-xs text-text-secondary mt-1">Coba pilih kategori atau filter lain</p>
    </div>
  );
}

export default function InspirasiPage() {
  const [activeTab, setActiveTab] = useState("inspirasi");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [category, setCategory] = useState<string | null>(null);

  const items = useMemo(() => {
    let result = DATA;
    if (contentType !== "all") {
      result = result.filter((d) => d.type === contentType);
    }
    if (category) {
      result = result.filter((d) => d.category === category);
    }
    return result;
  }, [contentType, category]);

  const categories = useMemo(() => {
    const cats = new Set(DATA.map((d) => d.category));
    return Array.from(cats).sort();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary">Inspirasi</h1>
          <p className="text-sm text-text-secondary mt-1">
            Temukan cerita, journal, dan pengalaman inspiratif
          </p>
        </div>

        {/* Content type tabs */}
        <section className="mb-4">
          <ContentTypeBar selected={contentType} onSelect={setContentType} />
        </section>

        {/* Category filter */}
        {contentType !== "all" && (
          <section className="mb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                onClick={() => setCategory(null)}
                className={`flex-shrink-0 h-8 px-3 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  category === null
                    ? "bg-primary/10 text-primary"
                    : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat === category ? null : cat)}
                  className={`flex-shrink-0 h-8 px-3 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    category === cat
                      ? "bg-primary/10 text-primary"
                      : "bg-surface border border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Content list */}
        <section className="space-y-4">
          {items.length > 0 ? (
            items.map((item, i) => (
              <div
                key={item.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <InspirasiCard item={item} />
              </div>
            ))
          ) : (
            <EmptyState type={contentType} />
          )}
        </section>
      </div>

      <BottomNavigation
        items={NAV_TABS}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          window.location.href = navRoute(id);
        }}
      />
    </div>
  );
}
