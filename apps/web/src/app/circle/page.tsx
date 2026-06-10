"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, ChevronRight, Plus, Home, BookOpen, MapPin, Compass, User } from "lucide-react";
import { Card, Badge, Avatar } from "@beautifio/ui";
import { BottomNavigation } from "@beautifio/ui";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profile", label: "Profil", icon: User },
];

const myCircles = [
  { id: "1", name: "Tech Founders", tag: "Kewirausahaan", members: 8, maxMembers: 12, desc: "Bagi kamu yang ingin membangun startup teknologi dari nol.", hasMentor: true, lastActive: "2 jam lalu" },
  { id: "2", name: "Creative Lab", tag: "Kreatif", members: 6, maxMembers: 12, desc: "Ruang berkarya untuk desainer, penulis, dan content creator.", hasMentor: false, lastActive: "5 jam lalu" },
];

const exploreCircles = [
  { id: "3", name: "Future Leaders", tag: "Kepemimpinan", members: 10, maxMembers: 12, desc: "Kaderisasi kepemimpinan muda untuk perubahan sosial.", hasMentor: true },
  { id: "4", name: "Green Warriors", tag: "Lingkungan", members: 5, maxMembers: 12, desc: "Komunitas peduli lingkungan dengan aksi nyata.", hasMentor: false },
  { id: "5", name: "Data Science ID", tag: "Teknologi", members: 9, maxMembers: 12, desc: "Diskusi dan project bareng seputar data science & AI.", hasMentor: true },
  { id: "6", name: "Content Creator Hub", tag: "Kreatif", members: 7, maxMembers: 12, desc: "Tips, kolaborasi, dan tumbuh bareng sebagai creator.", hasMentor: false },
];

export default function CircleListPage() {
  const [activeTab, setActiveTab] = useState("circle");
  const [search, setSearch] = useState("");

  const filteredExplore = useMemo(
    () =>
      exploreCircles.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.tag.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto px-6 pt-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Circle</h1>
            <p className="text-sm text-text-secondary mt-1">
              Temukan dan bergabung dengan komunitas
            </p>
          </div>
          <button className="w-10 h-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
            <Plus size={20} />
          </button>
        </div>

        {myCircles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
              Circle Saya
            </h2>
            <div className="space-y-3">
              {myCircles.map((c) => (
                <Link key={c.id} href={`/circle/${c.id}`}>
                  <Card padding="md" className="hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.name.split(" ").map((w) => w[0]).join("")} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary truncate">{c.name}</h3>
                          {c.hasMentor && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">
                              Mentor
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
                            {c.tag}
                          </Badge>
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
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
            Jelajahi Circle
          </h2>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari circle..."
              className="w-full h-10 pl-9 pr-4 rounded-sm border border-border bg-surface text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="space-y-3">
            {filteredExplore.map((c) => (
              <Link key={c.id} href={`/circle/${c.id}`}>
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
            ))}
          </div>

          {filteredExplore.length === 0 && (
            <div className="text-center py-12">
              <Users size={32} className="mx-auto text-text-secondary/30 mb-3" />
              <p className="text-sm text-text-secondary">Tidak ada circle ditemukan</p>
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
