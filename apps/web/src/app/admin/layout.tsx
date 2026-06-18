"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Gift, ShoppingBag, Trophy, FileText,
  Users, Quote, MessageCircle, HeartHandshake,
  FileSpreadsheet, BookOpen, Briefcase, Menu, X,
  LayoutDashboard, Shield,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
};

const navItems: NavItem[] = [
  { href: "/admin/familia", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "superadmin"] },
  { href: "/admin/familia/merchants", label: "Merchants", icon: Gift, roles: ["admin", "superadmin"] },
  { href: "/admin/familia/deals", label: "Deals", icon: ShoppingBag, roles: ["admin", "superadmin"] },
  { href: "/admin/familia/rewards", label: "Rewards", icon: Trophy, roles: ["admin", "superadmin"] },
  { href: "/admin/familia/redemption-log", label: "Redemption Log", icon: FileText, roles: ["admin", "superadmin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["superadmin"] },
  { href: "/admin/curhat", label: "Curhat", icon: MessageCircle, roles: ["admin", "superadmin", "redaksi"] },
  { href: "/admin/care", label: "Care Tickets", icon: HeartHandshake, roles: ["admin", "superadmin"] },
  { href: "/admin/konten/posts", label: "Inspirasi", icon: FileSpreadsheet, roles: ["redaksi", "superadmin"] },
  { href: "/admin/konten/stories", label: "Stories", icon: BookOpen, roles: ["redaksi", "superadmin"] },
  { href: "/admin/konten/quotes", label: "Quotes", icon: Quote, roles: ["redaksi", "superadmin"] },
  { href: "/admin/opportunities", label: "Opportunities", icon: Briefcase, roles: ["superadmin"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const { data: profile } = await res.json();
        const userRole = profile?.role || "user";
        setRole(userRole);
        if (userRole === "user" || userRole === "mentor") {
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-gray-900">Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-64px)]">
          {visibleItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
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
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="cursor-pointer">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-bold text-gray-900">Admin Panel</span>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
