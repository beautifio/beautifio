"use client";

import { useState, useEffect } from "react";
import { Sunrise, Sun, CloudSun, Moon, Heart, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Horizon } from "@/components/landing/Horizon";

type DBQuote = {
  id: string;
  content: string;
  author: string;
  category: string;
};

const CAT_EMOJI: Record<string, string> = {
  mimpi: "✨",
  karir: "💼",
  mental_health: "💜",
  perempuan: "👩",
  pendidikan: "📚",
  komunitas: "🤝",
};

const CAT_LABEL: Record<string, string> = {
  mimpi: "Mimpi",
  karir: "Karir",
  mental_health: "Mental Health",
  perempuan: "Perempuan",
  pendidikan: "Pendidikan",
  komunitas: "Komunitas",
};

type Daypart = "pagi" | "siang" | "sore" | "malam";

function timeGreeting(): { text: string; icon: React.ReactNode; part: Daypart } {
  const h = new Date().getHours();
  if (h >= 4 && h < 11) return { text: "Selamat Pagi", icon: <Sunrise size={18} />, part: "pagi" };
  if (h >= 11 && h < 15) return { text: "Selamat Siang", icon: <Sun size={18} />, part: "siang" };
  if (h >= 15 && h < 18) return { text: "Selamat Sore", icon: <CloudSun size={18} />, part: "sore" };
  return { text: "Selamat Malam", icon: <Moon size={18} />, part: "malam" };
}

/* The greeting panel's sky follows the time of day. */
const SKY: Record<Daypart, string> = {
  pagi: "linear-gradient(170deg, #0A4D70 0%, #1F6F97 48%, #C99A7E 82%, #F2C28C 100%)",
  siang: "linear-gradient(170deg, #0E5A80 0%, #1F6F97 55%, #5FAACB 100%)",
  sore: "linear-gradient(170deg, #06304B 0%, #3D5F80 52%, #B87563 84%, #E8A070 100%)",
  malam: "linear-gradient(170deg, #03182A 0%, #052338 55%, #084463 100%)",
};

function GreetingPanel({
  part,
  children,
}: {
  part: Daypart;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label="Sapaan hari ini"
      className="on-dark grain relative overflow-hidden rounded-2xl text-white shadow-lg ring-1 ring-inset ring-white/10"
      style={{ background: SKY[part] }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[92px] opacity-90">
        <Horizon mode="still" showStars={part === "malam"} showTrail={false} />
      </div>
      <div className="relative z-10 p-5 pb-[84px]">{children}</div>
    </section>
  );
}

function dayOfYear(): number {
  const now = Date.now();
  const start = new Date(new Date().getFullYear(), 0, 1).getTime();
  return Math.floor((now - start) / 86400000);
}

function safeGetSavedQuotes(): string[] {
  try { return JSON.parse(localStorage.getItem("savedQuotes") || "[]"); }
  catch { return []; }
}

export function QuoteCard({ userName }: { userName: string }) {
  const [quote, setQuote] = useState<DBQuote | null>(null);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase
      .from("quotes")
      .select("id, content, author, category")
      .eq("is_active", true)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const idx = dayOfYear() % data.length;
        const q = data[idx];
        setQuote(q);
        setSaved(safeGetSavedQuotes().includes(q.id));
      }, () => setErr(true));
  }, []);

  function handleShuffle() {
    if (!supabase) return;

    supabase
      .from("quotes")
      .select("id, content, author, category")
      .eq("is_active", true)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const random = data[Math.floor(Math.random() * data.length)];
        setQuote(random);
        setSaved(safeGetSavedQuotes().includes(random.id));
      }, () => {});
  }

  function handleSave() {
    if (!quote) return;
    const savedIds = safeGetSavedQuotes();
    const idx = savedIds.indexOf(quote.id);
    if (idx > -1) {
      savedIds.splice(idx, 1);
      setSaved(false);
    } else {
      savedIds.push(quote.id);
      setSaved(true);
    }
    localStorage.setItem("savedQuotes", JSON.stringify(savedIds));
  }

  if (!quote) {
    const greeting = timeGreeting();
    return (
      <GreetingPanel part={greeting.part}>
        <p className="flex items-center gap-2 font-display text-[17px] font-semibold">
          <span className="text-fajar-glow">{greeting.icon}</span>
          {greeting.text}, {userName}.
        </p>
        <div className="mt-4 animate-pulse space-y-2.5">
          <div className="h-4 w-3/4 rounded bg-white/15" />
          <div className="h-4 w-1/2 rounded bg-white/15" />
          <div className="mt-4 h-3 w-1/3 rounded bg-white/10" />
        </div>
      </GreetingPanel>
    );
  }

  const greeting = timeGreeting();

  return (
    <GreetingPanel part={greeting.part}>
      <p className="flex items-center gap-2 font-display text-[17px] font-semibold">
        <span className="text-fajar-glow">{greeting.icon}</span>
        {greeting.text}, {userName}.
      </p>

      <p className="mt-3 text-xs font-medium text-white/60">
        {CAT_EMOJI[quote.category] || "💬"} {CAT_LABEL[quote.category] || quote.category}
      </p>

      <blockquote className="mt-1.5 text-[17px] font-medium leading-relaxed text-white">
        &ldquo;{quote.content}&rdquo;
      </blockquote>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-white/80">{quote.author}</p>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={handleSave}
            className={`flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-inset backdrop-blur transition-colors cursor-pointer ${
              saved ? "bg-white text-danger ring-white" : "bg-white/10 text-white/80 ring-white/15 hover:bg-white/20"
            }`}
            aria-label={saved ? "Hapus dari tersimpan" : "Simpan quote"}
            aria-pressed={saved}
          >
            <Heart size={16} className={saved ? "fill-danger" : ""} />
          </button>
          <button
            onClick={handleShuffle}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 backdrop-blur transition-colors hover:bg-white/20 cursor-pointer"
            aria-label="Ganti quote"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </GreetingPanel>
  );
}
