"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export function ProtectedAction({
  children,
  label,
  onAction,
  className,
}: {
  children: React.ReactNode;
  label?: string;
  onAction?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleClick = () => {
    if (user) {
      onAction?.();
    } else {
      setShowPrompt(true);
    }
  };

  return (
    <div className={className}>
      <div onClick={handleClick} className="contents cursor-pointer">
        {children}
      </div>

      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
          onClick={() => setShowPrompt(false)}
        >
          <div
            className="w-full max-w-[390px] bg-surface rounded-t-xl sm:rounded-xl p-6 pb-8 animate-in slide-in-from-bottom"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-5" />
            <h3 className="text-base font-bold text-text-primary text-center">
              {label || "Masuk untuk Melanjutkan"}
            </h3>
            <p className="text-sm text-text-secondary text-center mt-2">
              Fitur ini membutuhkan akun. Masuk atau daftar untuk melanjutkan.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => router.push("/login")}
                className="w-full h-11 rounded-sm bg-primary text-primary-foreground text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-colors"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push("/register")}
                className="w-full h-11 rounded-sm border border-border bg-surface text-sm font-medium text-text-primary cursor-pointer hover:border-primary/30 transition-colors"
              >
                Daftar Akun Baru
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="w-full h-11 text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
