"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLanding() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) { router.replace("/login"); return; }
        const { data: profile } = await res.json();
        const role = profile?.role;
        if (role === "redaksi") router.replace("/admin/konten/posts");
        else if (role === "admin" || role === "superadmin") router.replace("/admin/familia");
        else router.replace("/");
      } catch {
        router.replace("/login");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
