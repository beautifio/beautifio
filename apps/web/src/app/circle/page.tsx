"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, ChevronRight, Plus, Home, BookOpen, MapPin, Compass, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, Badge, Avatar } from "@beautifio/ui";
import { BottomNavigation } from "@beautifio/ui";
import { CIRCLE_CATEGORIES } from "@beautifio/utils";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "discover", label: "Temukan", icon: Compass },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

interface CircleItem {
  id: string; name: string; tag: string; category: string; members: number; maxMembers: number;
  desc: string; hasMentor: boolean; lastActive?: string;
}

const myCircles: CircleItem[] = [
  { id: "1", name: "Tech Founders", tag: "Bisnis", category: "business", members: 8, maxMembers: 12, desc: "Bagi kamu yang ingin membangun startup teknologi dari nol.", hasMentor: true, lastActive: "2 jam lalu" },
  { id: "2", name: "Creative Lab", tag: "Kreatif", category: "creator", members: 6, maxMembers: 12, desc: "Ruang berkarya untuk desainer, penulis, dan content creator.", hasMentor: false, lastActive: "5 jam lalu" },
];

const exploreCircles: CircleItem[] = [
  { id: "5", name: "Data Science ID", tag: "Teknologi", category: "technology", members: 9, maxMembers: 12, desc: "Diskusi dan project bareng seputar data science & AI.", hasMentor: true },
  { id: "6", name: "Content Creator Hub", tag: "Kreator", category: "creator", members: 7, maxMembers: 12, desc: "Tips, kolaborasi, dan tumbuh bareng sebagai creator.", hasMentor: false },
  { id: "3", name: "Future Leaders", tag: "Karir", category: "career", members: 10, maxMembers: 12, desc: "Kaderisasi kepemimpinan muda untuk pengembangan karir.", hasMentor: true },
  { id: "7", name: "Sports Arena", tag: "Olahraga", category: "sports", members: 11, maxMembers: 12, desc: "Komunitas olahraga dan kebugaran untuk atlet muda dan pecinta fitness.", hasMentor: true },
  { id: "8", name: "Music Collective", tag: "Musik", category: "music", members: 8, maxMembers: 12, desc: "Berkarya, kolaborasi, dan tumbuh bareng sesama musisi dan pecinta musik.", hasMentor: true },
  { id: "9", name: "Game Dev Guild", tag: "Gaming", category: "gaming", members: 10, maxMembers: 12, desc: "Komunitas developer game dan esports. Diskusi, develop, dan kompetisi.", hasMentor: false },
  { id: "10", name: "Beauty Circle", tag: "Kecantikan", category: "beauty", members: 9, maxMembers: 12, desc: "Sharing tips skincare, makeup, dan tren kecantikan terkini.", hasMentor: false },
  { id: "11", name: "Study Hub", tag: "Pendidikan", category: "education", members: 12, maxMembers: 12, desc: "Belajar bareng, diskusi akademik, dan persiapan ujian masuk. Penuh!", hasMentor: true },
  { id: "12", name: "Career Boost", tag: "Karir", category: "career", members: 6, maxMembers: 12, desc: "Persiapan karir, coaching CV, dan networking profesional.", hasMentor: true },
  { id: "4", name: "Green Warriors", tag: "Lingkungan", category: "sports", members: 5, maxMembers: 12, desc: "Aksi nyata peduli lingkungan. Tree planting dan waste management.", hasMentor: false },
];

export default function CircleListPage() {
  const [activeTab, setActiveTab] = useState("circle");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const filteredExplore = useMemo(
    () => {
      let items = exploreCircles;
      if (selectedCategory) {
        items = items.filter((c) => c.category === selectedCategory);
      }
      if (search) {
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.tag.toLowerCase().includes(search.toLowerCase())
        );
      }
      return items;
    },
    [search, selectedCategory]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Circle</h1>
            <p className="text-sm text-text-secondary mt-1">
              Temukan dan bergabung dengan komunitas
            </p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 active:scale-[0.97] transition-all">
            <Plus size={20} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              !selectedCategory
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
            }`}
          >
            Semua
          </button>
          {CIRCLE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {myCircles.length > 0 && !selectedCategory && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
              Circle Saya
            </h2>
            <div className="space-y-3">
              {myCircles.map((c, i) => (
                <div key={c.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                  <Link href={`/circle/${c.id}`}>
                  <Card padding="md" className="hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.name.split(" ").map((w) => w[0]).join("")} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary truncate">{c.name}</h3>
                          {c.hasMentor && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Mentor</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">{c.tag}</Badge>
                          <span className="text-xs text-text-secondary">{c.members}/{c.maxMembers} anggota</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1.5 line-clamp-1">{c.desc}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <ChevronRight size={16} className="text-text-secondary group-hover:text-primary transition-colors" />
                        <span className="text-[10px] text-text-secondary">{c.lastActive}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
            {selectedCategory
              ? `${CIRCLE_CATEGORIES.find((c) => c.value === selectedCategory)?.emoji ?? ""} ${CIRCLE_CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? ""}`
              : "Jelajahi Circle"}
          </h2>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari circle..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-surface text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="space-y-3">
            {filteredExplore.map((c, i) => (
              <div key={c.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                <Link href={`/circle/${c.id}`}>
                <Card padding="md" className="hover:border-secondary/30 transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Avatar initials={c.name.split(" ").map((w) => w[0]).join("")} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-text-primary truncate">{c.name}</h3>
                        {c.hasMentor && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Mentor</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">{c.tag}</Badge>
                        <span className="text-xs text-text-secondary">{c.members}/{c.maxMembers} anggota</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-1">{c.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-text-secondary group-hover:text-secondary transition-colors flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            </div>
          ))}
          </div>

          {filteredExplore.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-text-secondary/30 mb-3" />
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Users size={28} className="text-text-secondary/40" />
                </div>
                <p className="text-sm font-semibold text-text-primary">Tidak ada circle ditemukan</p>
                <p className="text-xs text-text-secondary mt-1">Coba pilih kategori lain</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <BottomNavigation
        items={tabs}
        activeTab={activeTab}
        onTabChange={(id) => { setActiveTab(id); if (id === "home") router.push("/"); else router.push(`/${id}`); }}
      />
    </div>
  );
}
