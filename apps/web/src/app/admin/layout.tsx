"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Gift, ShoppingBag, Trophy, FileText,
  Users, Quote, MessageCircle, HeartHandshake,
  FileSpreadsheet, BookOpen, Briefcase, Menu, X, ChevronDown,
  LayoutDashboard, Shield, Image, Radio, CreditCard, Bell, Megaphone, BarChart3, CalendarDays,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
};

type NavGroup = {
  label: string;
  icon: React.ElementType;
  roles: string[];
  items: NavItem[];
};

const standaloneItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "superadmin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["superadmin"] },
  { href: "/admin/bisik", label: "Bisik", icon: Radio, roles: ["admin", "superadmin"] },
  { href: "/admin/ads", label: "Ad Banners", icon: Megaphone, roles: ["admin", "superadmin"] },
  { href: "/admin/subscriptions", label: "Subscription", icon: CreditCard, roles: ["admin", "superadmin"] },
  { href: "/admin/keuangan", label: "Keuangan", icon: BarChart3, roles: ["admin", "superadmin"] },
  { href: "/admin/mitra", label: "Mitra", icon: Users, roles: ["admin", "superadmin"] },
  { href: "/admin/notifications", label: "Notifikasi", icon: Bell, roles: ["admin", "superadmin", "redaksi"] },
];

const navGroups: NavGroup[] = [
  {
    label: "Familia",
    icon: Gift,
    roles: ["admin", "superadmin"],
    items: [
      { href: "/admin/merchants", label: "Merchant", icon: Gift, roles: ["admin", "superadmin"] },
      { href: "/admin/deals", label: "Deals", icon: ShoppingBag, roles: ["admin", "superadmin"] },
      { href: "/admin/rewards", label: "Rewards", icon: Trophy, roles: ["admin", "superadmin"] },
      { href: "/admin/redemption-log", label: "Redemption Log", icon: FileText, roles: ["admin", "superadmin"] },
      { href: "/admin/familia/stats", label: "Laporan Voucher", icon: BarChart3, roles: ["admin", "superadmin"] },
    ],
  },
  {
    label: "Konten",
    icon: FileSpreadsheet,
    roles: ["redaksi", "superadmin"],
    items: [
      { href: "/admin/konten/posts", label: "Inspirasi", icon: FileSpreadsheet, roles: ["redaksi", "superadmin"] },
      { href: "/admin/settings/bible", label: "Panduan Konten", icon: BookOpen, roles: ["redaksi", "superadmin"] },
      { href: "/admin/konten/stories", label: "Stories", icon: BookOpen, roles: ["redaksi", "superadmin"] },
      { href: "/admin/konten/quotes", label: "Quotes", icon: Quote, roles: ["redaksi", "superadmin"] },
      { href: "/admin/konten/hero", label: "Media Manager", icon: Image, roles: ["redaksi", "superadmin"] },
      { href: "/admin/forums", label: "Forums", icon: MessageCircle, roles: ["admin", "superadmin"] },
    ],
  },
  {
    label: "Komunitas",
    icon: Users,
    roles: ["admin", "superadmin", "redaksi"],
    items: [
      { href: "/admin/curhat", label: "Curhat", icon: MessageCircle, roles: ["admin", "superadmin", "redaksi"] },
      { href: "/admin/care", label: "Beautifio Care", icon: HeartHandshake, roles: ["admin", "superadmin"] },
      { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase, roles: ["superadmin"] },
      { href: "/admin/events", label: "Events", icon: CalendarDays, roles: ["admin", "superadmin", "redaksi"] },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Track which groups are expanded (default: both expanded)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    Familia: true,
    Konten: true,
    Komunitas: true,
  });

  useEffect(() => {
    let onLogoUpdate: ((e: Event) => void) | null = null;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const { data: profile } = await res.json();
        setRole(profile?.role || "user");
        setUserName(profile?.full_name || "");
        setUserEmail(profile?.email || "");
        const { data: logoData } = await supabase!.from("app_settings").select("value").eq("key", "logo_url").single();
        if (logoData?.value) setLogoUrl(logoData.value);

        onLogoUpdate = (e: Event) => {
          const url = (e as CustomEvent).detail as string;
          if (url) setLogoUrl(url);
        };
        window.addEventListener("logo-updated", onLogoUpdate);

        if (profile?.role === "user" || profile?.role === "mentor" || !profile?.role) {
          router.replace("/");
          return;
        }
      } catch {
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      if (onLogoUpdate) window.removeEventListener("logo-updated", onLogoUpdate);
    };
  }, []);

  const visibleStandalone = standaloneItems.filter((item) => role && item.roles.includes(role));
  const visibleGroups = navGroups.filter((group) => role && group.roles.includes(role));

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    );
  }

  if (!role || role === "user" || role === "mentor") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside style={{ background: '#084463' }} className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-7 w-auto brightness-0 invert" />
            ) : (
              <>
                <Shield className="w-5 h-5" style={{ color: '#FFC64F' }} />
                <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Admin Panel</span>
              </>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden cursor-pointer">
            <X className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
        </div>

        <nav className="p-3 space-y-0.5 overflow-y-auto flex-1">
          {/* Standalone items first */}
          {visibleStandalone.map((item) => {
            const active = isActive(item.href);
            return (
              <a key={item.href} href={item.href}
                style={{ background: active ? 'rgba(255,255,255,0.15)' : 'transparent', color: active ? '#FFFFFF' : 'rgba(255,255,255,0.6)' }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/10">
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}

          {/* Groups */}
          {visibleGroups.map((group) => {
            const isExpanded = expanded[group.label] ?? true;
            const hasActiveChild = group.items.some((item) => isActive(item.href));
            return (
              <div key={group.label}>
                <button
                  onClick={() => setExpanded((prev) => ({ ...prev, [group.label]: !isExpanded }))}
                  style={{
                    color: hasActiveChild ? '#FFC64F' : 'rgba(255,255,255,0.5)',
                    background: hasActiveChild ? 'rgba(255,198,79,0.1)' : 'transparent',
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all hover:bg-white/10 cursor-pointer">
                  <group.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="mt-0.5">
                    {group.items
                      .filter((item) => role && item.roles.includes(role))
                      .map((item) => {
                        const active = isActive(item.href);
                        return (
                          <a key={item.href} href={item.href}
                            style={{ background: active ? 'rgba(255,255,255,0.12)' : 'transparent', color: active ? '#FFFFFF' : 'rgba(255,255,255,0.45)' }}
                            className="flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg text-[11px] font-medium transition-all hover:bg-white/10">
                            <span>{item.label}</span>
                          </a>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 12px' }} />

        <div onClick={() => { router.push('/profil'); setSidebarOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', margin: '0 8px' }}
          className="hover:bg-white/10 transition-colors">
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
            {userName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName || 'Admin'}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{role}</div>
          </div>
        </div>

        <div style={{ padding: '4px 8px 12px' }}>
          <button onClick={async () => {
            if (!confirm('Yakin mau keluar?')) return;
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            await supabase?.auth.signOut();
            router.push('/');
          }}
          style={{ width: '100%', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#FCA5A5', fontSize: 13, fontWeight: 500, textAlign: 'left' }}
          className="hover:bg-white/10 transition-colors">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-w-0">
        <div style={{ background: '#084463' }} className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
            <Menu className="w-5 h-5" style={{ color: '#FFFFFF' }} />
          </button>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 w-auto brightness-0 invert" />
          ) : (
            <span className="text-sm font-bold" style={{ color: '#FFFFFF' }}>Admin Panel</span>
          )}
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
