"use client";

import { useState, useEffect } from "react";
import { Sunrise, Sun, CloudSun, Moon, Heart, RefreshCw } from "lucide-react";
import {
  getDailyQuote,
  getRandomQuote,
  getSeenQuoteIds,
  markQuoteSeen,
  toggleSavedQuote,
  isQuoteSaved,
  getCategoryLabel,
  getCategoryEmoji,
} from "@/lib/quotes-utils";
import type { Quote } from "@/lib/quotes-data";

function timeGreeting(): { text: string; icon: React.ReactNode } {
  const h = new Date().getHours();
  if (h < 11) return { text: "Selamat Pagi", icon: <Sunrise size={20} /> };
  if (h < 15) return { text: "Selamat Siang", icon: <Sun size={20} /> };
  if (h < 18) return { text: "Selamat Sore", icon: <CloudSun size={20} /> };
  return { text: "Selamat Malam", icon: <Moon size={20} /> };
}

export function QuoteCard({ userName }: { userName: string }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const q = getDailyQuote();
    setQuote(q);
    setSaved(isQuoteSaved(q.id));
  }, []);

  function handleShuffle() {
    const seen = getSeenQuoteIds();
    if (quote) seen.push(quote.id);
    const q = getRandomQuote(seen);
    setQuote(q);
    markQuoteSeen(q.id);
    setSaved(isQuoteSaved(q.id));
  }

  function handleSave() {
    if (!quote) return;
    const nowSaved = toggleSavedQuote(quote.id);
    setSaved(nowSaved);
  }

  if (!quote) {
    const greeting = timeGreeting();
    return (
      <div className="rounded-2xl p-5" style={{ background: '#FFF8E7', borderLeft: '4px solid #FFC64F' }}>
        <div className="flex items-center gap-2 text-amber-700 mb-3">
          {greeting.icon}
          <span className="text-sm font-semibold">{greeting.text}, {userName}.</span>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-amber-100 rounded w-3/4" />
          <div className="h-4 bg-amber-100 rounded w-1/2" />
          <div className="h-3 bg-amber-50 rounded w-1/3 mt-4" />
        </div>
      </div>
    );
  }

  const greeting = timeGreeting();

  return (
    <div className="rounded-2xl p-5" style={{ background: '#FFF8E7', borderLeft: '4px solid #FFC64F' }}>
      <div className="flex items-center gap-2 text-amber-700 mb-3">
        {greeting.icon}
        <span className="text-sm font-semibold">{greeting.text}, {userName}.</span>
      </div>

      <div className="mb-1">
        <span className="text-xs text-amber-500 font-medium">
          {getCategoryEmoji(quote.category)} {getCategoryLabel(quote.category)}
        </span>
      </div>

      <blockquote className="text-base font-medium text-text-primary leading-relaxed mb-3">
        &ldquo;{quote.text}&rdquo;
      </blockquote>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-text-primary">— {quote.author}</p>
          <p className="text-xs text-text-secondary">{quote.title}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className={`p-2 rounded-xl transition-all ${
              saved ? "bg-red-100 text-red-500" : "bg-white/70 text-gray-400 hover:text-red-400 hover:bg-red-50"
            }`}
            aria-label={saved ? "Hapus dari tersimpan" : "Simpan quote"}
          >
            <Heart size={16} className={saved ? "fill-red-500" : ""} />
          </button>
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-white/70 text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
            aria-label="Ganti quote"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
