import { ALL_QUOTES, QUOTE_CATEGORIES } from "./quotes-data";
import type { Quote } from "./quotes-data";

const STORAGE_KEY = "beautifio_saved_quotes";
const TODAY_KEY = "beautifio_daily_quote";
const SEEN_KEY = "beautifio_seen_quotes";

export function getDailyQuote(): Quote {
  const today = new Date().toISOString().split("T")[0];
  try {
    const cached = localStorage.getItem(TODAY_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === today) return parsed.quote;
    }
  } catch (e) {
    console.error("getDailyQuote: cache read failed", e);
  }

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const quote = ALL_QUOTES[dayOfYear % ALL_QUOTES.length];

  try {
    localStorage.setItem(TODAY_KEY, JSON.stringify({ date: today, quote }));
  } catch (e) {
    console.error("getDailyQuote: cache write failed", e);
  }
  return quote;
}

export function getRandomQuote(seen: string[] = []): Quote {
  const unseen = ALL_QUOTES.filter((q) => !seen.includes(q.id));
  if (unseen.length === 0) {
    const idx = Math.floor(Math.random() * ALL_QUOTES.length);
    return ALL_QUOTES[idx];
  }
  const idx = Math.floor(Math.random() * unseen.length);
  return unseen[idx];
}

export function getQuoteById(id: string): Quote | undefined {
  return ALL_QUOTES.find((q) => q.id === id);
}

export function getQuotesByCategory(category: string): Quote[] {
  return ALL_QUOTES.filter((q) => q.category === category);
}

export function getSavedQuoteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("getSavedQuoteIds: parse failed", e);
  }
  return [];
}

export function toggleSavedQuote(id: string): boolean {
  const saved = getSavedQuoteIds();
  const idx = saved.indexOf(id);
  if (idx >= 0) {
    saved.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return false;
  }
  saved.push(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return true;
}

export function isQuoteSaved(id: string): boolean {
  return getSavedQuoteIds().includes(id);
}

export function getSavedQuotes(): Quote[] {
  const ids = getSavedQuoteIds();
  return ALL_QUOTES.filter((q) => ids.includes(q.id));
}

export function getSeenQuoteIds(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("getSeenQuoteIds: parse failed", e);
  }
  return [];
}

export function markQuoteSeen(id: string) {
  const seen = getSeenQuoteIds();
  if (!seen.includes(id)) {
    seen.push(id);
    // prune when seen exceeds total quotes
    if (seen.length > ALL_QUOTES.length) {
      seen.splice(0, Math.floor(ALL_QUOTES.length / 2));
    }
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  }
}

export function getCategoryLabel(slug: string): string {
  return QUOTE_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function getCategoryEmoji(slug: string): string {
  return QUOTE_CATEGORIES.find((c) => c.slug === slug)?.emoji ?? "📌";
}
