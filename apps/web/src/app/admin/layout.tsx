"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Gift, ShoppingBag, Trophy, FileText,
  Users, Quote, MessageCircle, HeartHandshake,
  FileSpreadsheet, BookOpen, Briefcase, Menu, X,
  LayoutDashboard, Shield, Image, Radio, CreditCard,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "superadmin"] },
  { href: "/admin/merchants", label: "Merchants", icon: Gift, roles: ["admin", "superadmin"] },
  { href: "/admin/deals", label: "Deals", icon: ShoppingBag, roles: ["admin", "superadmin"] },
  { href: "/admin/rewards", label: "Rewards", icon: Trophy, roles: ["admin", "superadmin"] },
  { href: "/admin/redemption-log", label: "Redemption Log", icon: FileText, roles: ["admin", "superadmin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["superadmin"] },
  { href: "/admin/curhat", label: "Curhat", icon: MessageCircle, roles: ["admin", "superadmin", "redaksi"] },
  { href: "/admin/care", label: "Care Tickets", icon: HeartHandshake, roles: ["admin", "superadmin"] },
  { href: "/admin/konten/posts", label: "Inspirasi", icon: FileSpreadsheet, roles: ["redaksi", "superadmin"] },
  { href: "/admin/konten/stories", label: "Stories", icon: BookOpen, roles: ["redaksi", "superadmin"] },
  { href: "/admin/konten/quotes", label: "Quotes", icon: Quote, roles: ["redaksi", "superadmin"] },
  { href: "/admin/konten/hero", label: "Media Manager", icon: Image, roles: ["redaksi", "superadmin"] },
  { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase, roles: ["superadmin"] },
  { href: "/admin/bisik", label: "Bisik", icon: Radio, roles: ["admin", "superadmin"] },
  { href: "/admin/subscriptions", label: "Subscription", icon: CreditCard, roles: ["admin", "superadmin"] },
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

  useEffect(() => {
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
  }, []);

  const visibleItems = navItems.filter((item) => role && item.roles.includes(role));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <aside className="w-64 bg-white border-r border-gray-200 p-4 hidden lg:block">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:relative lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-7 w-auto" />
            ) : (
              <>
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-gray-900">Admin Panel</span>
              </>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {visibleItems.map((item) => {
            const active = item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: '#E2E8F0', margin: '8px 0' }} />

        {/* Profile */}
        <div
          onClick={() => { router.push('/profil'); setSidebarOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8,
            cursor: 'pointer', margin: '0 8px',
          }}
          className="hover:bg-gray-50 transition-colors"
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#084463', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}>
            {userName?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 500, color: '#1E2938',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {userName || 'Admin'}
            </div>
            <div style={{ fontSize: 11, color: '#647488' }}>{role}</div>
          </div>
        </div>

        {/* Keluar */}
        <div style={{ padding: '4px 8px 12px' }}>
          <button
            onClick={async () => {
              if (!confirm('Yakin mau keluar?')) return;
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase?.auth.signOut();
              router.push('/');
            }}
            style={{
              width: '100%', padding: '10px 12px',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', borderRadius: 8,
              cursor: 'pointer', color: '#DC2626', fontSize: 13, fontWeight: 500,
              textAlign: 'left',
            }}
            className="hover:bg-red-50 transition-colors"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 w-auto" />
          ) : (
            <span className="text-sm font-bold text-gray-900">Admin Panel</span>
          )}
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
