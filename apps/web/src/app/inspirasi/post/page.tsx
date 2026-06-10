"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, PenLine, User, Eye, EyeOff, Send, Sparkles,
} from "lucide-react";
import { Button } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { BottomNavigation } from "@beautifio/ui";
import { ANON_CATEGORIES, POSTING_MODES, saveItem } from "@/lib/inspirasi-data";
import type { PostingMode } from "@/lib/inspirasi-data";

export default function PostPage() {
  const router = useRouter();
  const [postingMode, setPostingMode] = useState<PostingMode>("anonymous");
  const [category, setCategory] = useState(ANON_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);

    let author: string;
    let initials: string;
    if (postingMode === "anonymous") {
      author = "Anonymous";
      initials = "AN";
    } else if (postingMode === "nickname") {
      author = nickname.trim() || "Anonymous";
      initials = (nickname.trim() || "An").slice(0, 2).toUpperCase();
    } else {
      author = "User";
      initials = "US";
    }

    const item = {
      id: "post_" + Date.now(),
      slug: slug || "curhat-" + Date.now(),
      type: "anonymous" as const,
      title: title.trim(),
      content: content.trim().slice(0, 150) + (content.trim().length > 150 ? "..." : ""),
      full_content: content.trim(),
      author,
      initials,
      category,
      reading_time: Math.max(1, Math.ceil(content.trim().length / 400)),
      like_count: 0,
      comment_count: 0,
      save_count: 0,
      related_slugs: [],
      postingMode,
      moderationStatus: "pending" as const,
      nickname: postingMode === "nickname" ? nickname.trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    saveItem(item);
    setSubmitted(true);
    setTimeout(() => {
      router.push("/inspirasi");
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-20 h-20 rounded-full bg-[#084463]/10 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-[#084463]" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Curhat Terkirim!
        </h2>
        <p className="text-gray-500 text-center mb-2">
          Ceritamu akan ditampilkan setelah dimoderasi.
        </p>
        <p className="text-sm text-gray-400">Mengarahkan kembali...</p>
        <BottomNavigation items={NAV_TABS} activeTab="inspirasi" onTabChange={(id) => { router.push(navRoute(id)); }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link
            href="/inspirasi"
            className="p-1.5 -ml-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-sm font-medium text-gray-900">Tulis Curhat</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tulis Curhat</h1>
          <p className="text-gray-500 text-sm mt-1">Bagikan ceritamu secara anonim</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Posting Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Mode Posting
            </label>
            <div className="grid grid-cols-3 gap-3">
              {POSTING_MODES.map((mode) => {
                const isActive = mode.key === postingMode;
                let Icon = EyeOff;
                if (mode.key === "nickname") Icon = User;
                if (mode.key === "public") Icon = Eye;
                return (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setPostingMode(mode.key)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-[#084463] bg-[#084463]/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${isActive ? "bg-[#084463] text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-sm font-medium ${isActive ? "text-[#084463]" : "text-gray-700"}`}>
                      {mode.label}
                    </span>
                    <span className="text-xs text-gray-400 text-center leading-tight">
                      {mode.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Kategori
            </label>
            <div className="flex overflow-x-auto gap-2 pb-2">
              {ANON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    category === cat
                      ? "bg-[#084463] text-white"
                      : "bg-white border border-gray-200 text-gray-700 hover:border-[#084463] hover:text-[#084463]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Judul curhat
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul curhat"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#084463] focus:border-transparent"
              required
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Cerita
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis ceritamu di sini..."
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#084463] focus:border-transparent resize-y min-h-[200px]"
              rows={8}
              required
            />
          </div>

          {/* Nickname Input */}
          {postingMode === "nickname" && (
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nama samaran
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Tulis nama samaranmu"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#084463] focus:border-transparent"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-3 bg-[#084463] hover:bg-[#084463]/90 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Kirim Curhat
          </Button>
        </form>
      </div>

      <BottomNavigation items={NAV_TABS} activeTab="inspirasi" onTabChange={(id) => { router.push(navRoute(id)); }} />
    </div>
  );
}
