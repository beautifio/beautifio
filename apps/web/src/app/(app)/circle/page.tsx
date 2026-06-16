"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Search, Users, ChevronRight, Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, Badge, Avatar, Button } from "@beautifio/ui";
import { CIRCLE_CATEGORIES } from "@beautifio/utils";
import { useAuth } from "@/hooks/use-auth";
import type { Circle } from "@beautifio/types";

export default function CircleListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [exploreCircles, setExploreCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadCircles = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const [
        { getMyCircles: getMy, getRecommendedCircles: getRec },
      ] = await Promise.all([
        import("@/lib/supabase/queries"),
      ]);
      const [my, explore] = await Promise.all([
        getMy(user.id),
        getRec(user.id),
      ]);
      setMyCircles(my);
      setExploreCircles(explore);
    } catch (e) {
      console.error("Failed to load circles", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadCircles(); }, [loadCircles]);

  const handleJoin = async (circleId: string) => {
    if (!user || joining) return;
    setJoining(circleId);
    try {
      const { joinCircle } = await import("@/lib/supabase/queries");
      await joinCircle(circleId, user.id);
      // Move from explore to my circles
      const joined = exploreCircles.find((c) => c.id === circleId);
      if (joined) {
        setExploreCircles((prev) => prev.filter((c) => c.id !== circleId));
        setMyCircles((prev) => [...prev, { ...joined, member_count: joined.member_count + 1 }]);
      }
    } catch (e: any) {
      alert(e.message || "Gagal bergabung");
    } finally {
      setJoining(null);
    }
  };

  const filteredExplore = useMemo(() => {
    let items = exploreCircles;
    if (selectedCategory) {
      items = items.filter((c) => c.goal_category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.goal_category.toLowerCase().includes(q)
      );
    }
    return items;
  }, [exploreCircles, search, selectedCategory]);

  const getCategoryMeta = (cat: string) =>
    CIRCLE_CATEGORIES.find((c) => c.value === cat);

  if (!user) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-text-secondary/40" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Masuk dulu yuk</h2>
          <p className="text-sm text-text-secondary mt-1 mb-6">Lihat dan gabung circle setelah login</p>
          <Button variant="primary" onClick={() => router.push("/login")}>Masuk</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

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
              Circle Saya ({myCircles.length})
            </h2>
            <div className="space-y-3">
              {myCircles.map((c, i) => {
                const meta = getCategoryMeta(c.goal_category);
                return (
                  <div key={c.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                    <Link href={`/circle/${c.id}`}>
                      <Card padding="md" className="hover:border-primary/30 transition-all cursor-pointer group active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                          <Avatar initials={c.name.split(" ").map((w) => w[0]).join("")} size="lg" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-text-primary truncate">{c.name}</h3>
                              {c.template_slug && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Mimpi</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {meta && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">{meta.label}</Badge>
                              )}
                              <span className="text-xs text-text-secondary">{c.member_count}/{c.capacity} anggota</span>
                            </div>
                            <p className="text-xs text-text-secondary mt-1.5 line-clamp-1">{c.description}</p>
                          </div>
                          <ChevronRight size={16} className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                );
              })}
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
            {filteredExplore.map((c, i) => {
              const meta = getCategoryMeta(c.goal_category);
              return (
                <div key={c.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 60}ms` }}>
                  <Card padding="md" className="hover:border-secondary/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.name.split(" ").map((w) => w[0]).join("")} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-text-primary truncate">{c.name}</h3>
                          {c.template_slug && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Mimpi</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {meta && (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">{meta.label}</Badge>
                          )}
                          <span className="text-xs text-text-secondary">{c.member_count}/{c.capacity} anggota</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1.5 line-clamp-1">{c.description}</p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={joining === c.id}
                        onClick={(e) => {
                          e.preventDefault();
                          handleJoin(c.id);
                        }}
                      >
                        Gabung
                      </Button>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {filteredExplore.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-text-secondary/40" />
              </div>
              <p className="text-sm font-semibold text-text-primary">Tidak ada circle ditemukan</p>
              <p className="text-xs text-text-secondary mt-1">Coba pilih kategori lain</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
