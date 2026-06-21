"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type Variant = "no-journey" | "landing";

export function GuestCTA({ variant = "no-journey" }: { variant?: Variant }) {
  const router = useRouter();

  if (variant === "landing") {
    return (
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl border border-accent/20 p-5 text-center">
        <p className="text-sm text-text-secondary mb-4">
          Mulai perjalananmu dan temukan siapa dirimu yang sebenarnya.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.push("/welcome")}
            className="px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/80 transition-all"
          >
            Mulai Perjalanan
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-xl bg-surface text-text-primary text-sm font-semibold border border-border hover:bg-muted transition-all"
          >
            Masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10 p-5 text-center">
      <p className="text-sm text-text-secondary mb-1">Kamu belum memulai perjalanan</p>
      <p className="text-xs text-text-secondary/60 italic mb-4">
        &ldquo;Mulailah dengan satu langkah kecil.&rdquo; — Lao Tzu
      </p>
      <button
        onClick={() => router.push("/discover")}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/80 transition-all"
      >
        <Sparkles size={16} />
        Temukan Mimpiku
      </button>
    </div>
  );
}
