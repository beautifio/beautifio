"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
}

interface NavCard {
  emoji: string;
  title: string;
  desc: string;
  href: string;
  group: string;
}

const NAV_CARDS: NavCard[] = [
  { emoji: "📝", title: "Inspirasi Posts", desc: "Kelola artikel inspirasi", href: "/admin/konten/posts", group: "Konten" },
  { emoji: "📖", title: "Stories", desc: "Kelola cerita pengguna", href: "/admin/konten/stories", group: "Konten" },
  { emoji: "💬", title: "Quotes", desc: "Kelola quotes harian", href: "/admin/konten/quotes", group: "Konten" },
  { emoji: "🖼️", title: "Hero Landing", desc: "Upload gambar hero", href: "/admin/konten/hero", group: "Konten" },
  { emoji: "👥", title: "Users", desc: "Manajemen pengguna", href: "/admin/users", group: "Komunitas" },
  { emoji: "🗣️", title: "Curhat", desc: "Moderasi curhat", href: "/admin/curhat", group: "Komunitas" },
  { emoji: "🎫", title: "Care Tickets", desc: "Tiket bantuan", href: "/admin/care", group: "Komunitas" },
  { emoji: "🏪", title: "Merchants", desc: "Kelola merchant", href: "/admin/merchants", group: "Familia" },
  { emoji: "🏷️", title: "Deals", desc: "Kelola deals", href: "/admin/deals", group: "Familia" },
  { emoji: "🏆", title: "Rewards", desc: "Kelola rewards", href: "/admin/rewards", group: "Familia" },
  { emoji: "📋", title: "Redemption Log", desc: "Riwayat redeem", href: "/admin/redemption-log", group: "Familia" },
  { emoji: "💼", title: "Opportunities", desc: "Kelola peluang", href: "/admin/opportunities", group: "Lainnya" },
  { emoji: "📡", title: "Bisik", desc: "Moderasi kartu & topik", href: "/admin/bisik", group: "Komunitas" },
  { emoji: "💳", title: "Subscription", desc: "Kelola plan & subscriber", href: "/admin/subscriptions", group: "Lainnya" },
];

const GROUP_ORDER = ["Konten", "Komunitas", "Familia", "Lainnya"];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("dream_journeys").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("curhat_posts").select("*", { count: "exact", head: true }).eq("status", "visible"),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("familia_voucher_sessions").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("opportunities").select("*", { count: "exact", head: true }),
      supabase.from("bisik_cards").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("bisik_chats").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("user_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
    ])
      .then(([users, journeys, curhat, articles, vouchers, opportunities, bisikCards, bisikChats, subs]) => {
        setStats([
          { label: "Total Users", value: users.count ?? 0, icon: "👥" },
          { label: "Journey Aktif", value: journeys.count ?? 0, icon: "🎯" },
          { label: "Curhat Posts", value: curhat.count ?? 0, icon: "🗣️" },
          { label: "Artikel Terbit", value: articles.count ?? 0, icon: "📝" },
          { label: "Bisik Aktif", value: bisikCards.count ?? 0, icon: "📡" },
          { label: "Chat Aktif", value: bisikChats.count ?? 0, icon: "💬" },
          { label: "Subscriber", value: subs.count ?? 0, icon: "💳" },
          { label: "Voucher Aktif", value: vouchers.count ?? 0, icon: "🎫" },
          { label: "Opportunities", value: opportunities.count ?? 0, icon: "💼" },
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: NAV_CARDS.filter((c) => c.group === group),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ringkasan</p>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-white border border-gray-200">
                <p className="text-xl">{s.icon}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Grid */}
      {grouped.map(({ group, items }) => (
        <div key={group}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{group}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((card) => (
              <button
                key={card.href}
                onClick={() => router.push(card.href)}
                className="p-4 rounded-xl bg-white border border-gray-200 text-left transition-all hover:border-amber-200 hover:shadow-sm cursor-pointer"
              >
                <p className="text-lg">{card.emoji}</p>
                <p className="text-sm font-semibold text-gray-900 mt-1.5">{card.title}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
