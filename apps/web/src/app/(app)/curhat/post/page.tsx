"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, PenLine, User, Eye, EyeOff, Send, Sparkles, Shield,
} from "lucide-react";
import { Button } from "@beautifio/ui";

import { ANON_CATEGORIES, POSTING_MODES } from "@/lib/inspirasi-data";
import type { PostingMode } from "@/lib/inspirasi-data";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { isSensitiveCategory, getResourcesForCategory } from "@/lib/safe-space-data";
import { RuangAmanSheet } from "@/features/bantuan/RuangAmanSheet";

export default function PostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [postingMode, setPostingMode] = useState<PostingMode>("anonymous");
  const [category, setCategory] = useState(ANON_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [nickname, setNickname] = useState("");
  const [unifiedName, setUnifiedName] = useState("");

  // Fetch unified anonymous name from users table
  useEffect(() => {
    if (!user || !supabase) return
    supabase
      .from("users")
      .select("bisik_custom_name, bisik_anonymous_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        const name = data?.bisik_custom_name || data?.bisik_anonymous_name || ""
        setUnifiedName(name)
        setNickname(name)
      })
  }, [user, supabase])
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showResources, setShowResources] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [showBantuan, setShowBantuan] = useState(false);
  const [responseMode, setResponseMode] = useState<"story" | "polling">("story");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  const doInsert = async (status: string) => {
    if (!supabase) { setError("Koneksi database tidak tersedia."); return; }
    const fullContent = content.trim();
    const { data: inserted, error: insertErr } = await supabase
      .from("curhat_posts")
      .insert({
        user_id: user?.id,
        title: title.trim(),
        nickname: postingMode === "public" ? "" : postingMode === "nickname" ? nickname.trim() : unifiedName,
        content: fullContent,
        category: category,
        is_anonymous: postingMode !== "public",
        status: status,
        response_mode: responseMode,
        flag_reason: status === "flagged" ? "auto-flagged: sensitive content" : "",
      })
      .select("id")
      .single();

    if (insertErr) throw insertErr;

    if (responseMode === "polling" && inserted) {
      const validOptions = pollOptions.filter((o) => o.trim()).map((o) => o.trim());
      if (validOptions.length >= 2) {
        const { error: pollErr } = await supabase
          .from("curhat_polls")
          .insert({ curhat_id: inserted.id, options: validOptions });
        if (pollErr) throw pollErr;
      }
    }

    setSubmitted(true);
    setTimeout(() => router.push("/curhat"), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (!user?.id) {
      setError("Tunggu sebentar, sedang menyiapkan sesi...");
      return;
    }
    if (responseMode === "polling") {
      const valid = pollOptions.filter((o) => o.trim());
      if (valid.length < 2) {
        setError("Minimal 2 opsi polling diperlukan.");
        return;
      }
    }
    setSubmitting(true);
    setError("");

    const sensitive = isSensitiveCategory(category) || isSensitiveCategory(title + " " + content);

    try {
      if (sensitive) {
        const matched = getResourcesForCategory("bullying");
        setResources(matched);
        setPendingSubmit(true);
        setShowResources(true);
        setSubmitting(false);
        return;
      }
      await doInsert("visible");
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim curhat. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendAnyway = async () => {
    if (!user?.id) {
      setError("Tunggu sebentar, sedang menyiapkan sesi...");
      return;
    }
    setSubmitting(true);
    try {
      await doInsert("flagged");
      setShowResources(false);
    } catch (err: any) {
      setError(err?.message || "Gagal mengirim curhat. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (showResources) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pb-20">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Shield className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Kami Peduli dengan Kamu
          </h2>
          <p className="text-gray-500 text-center mb-6 max-w-sm">
            Kami mendeteksi bahwa ceritamu mungkin berkaitan dengan topik sensitif.
            Berikut beberapa sumber bantuan yang mungkin berguna:
          </p>
          <div className="space-y-3 w-full max-w-md mb-8">
            {resources.map((r: any) => (
              <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">{r.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{r.description}</p>
              </div>
            ))}
            <button
              onClick={() => setShowBantuan(true)}
              className="w-full py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              📞 Hubungi Lembaga Bantuan
            </button>
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-800 font-medium">
                ☎️ Butuh bantuan segera? Hubungi hotline Kesehatan Mental Kemenkes: <strong>119 (ekstensi 8)</strong>
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSendAnyway} disabled={submitting} className="px-6 py-2.5 bg-[#084463] text-white rounded-full text-sm font-medium">
              {submitting ? "Mengirim..." : "Kirim Tetap"}
            </Button>
            <Link href="/curhat" className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
              Kembali
            </Link>
          </div>
        </div>

        <RuangAmanSheet
          open={showBantuan}
          onClose={() => setShowBantuan(false)}
        />
      </>
    );
  }

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <Link
            href="/curhat"
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

          {/* Response Mode Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Curhat
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResponseMode("story")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  responseMode === "story"
                    ? "border-[#084463] bg-[#084463]/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className={`p-2 rounded-full ${responseMode === "story" ? "bg-[#084463] text-white" : "bg-gray-100 text-gray-500"}`}>
                  💬
                </span>
                <span className={`text-sm font-medium ${responseMode === "story" ? "text-[#084463]" : "text-gray-700"}`}>
                  Cerita
                </span>
                <span className="text-xs text-gray-400 text-center leading-tight">
                  Dapat dukungan + komentar
                </span>
              </button>
              <button
                type="button"
                onClick={() => setResponseMode("polling")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  responseMode === "polling"
                    ? "border-[#084463] bg-[#084463]/5"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <span className={`p-2 rounded-full ${responseMode === "polling" ? "bg-[#084463] text-white" : "bg-gray-100 text-gray-500"}`}>
                  📊
                </span>
                <span className={`text-sm font-medium ${responseMode === "polling" ? "text-[#084463]" : "text-gray-700"}`}>
                  Polling
                </span>
                <span className="text-xs text-gray-400 text-center leading-tight">
                  Minta pendapat dengan voting
                </span>
              </button>
            </div>
          </div>

          {/* Poll Options — show only when polling mode */}
          {responseMode === "polling" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Opsi Polling (min. 2)
              </label>
              <div className="space-y-3">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-6 shrink-0">{i + 1}.</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...pollOptions];
                        next[i] = e.target.value;
                        setPollOptions(next);
                      }}
                      placeholder={`Opsi ${i + 1}`}
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#084463] focus:border-transparent"
                      required={i < 2}
                    />
                    {i >= 2 && pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="text-sm text-[#084463] font-medium hover:underline"
                  >
                    + Tambah opsi
                  </button>
                )}
              </div>
            </div>
          )}

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

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}
          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#084463] hover:bg-[#084463]/90 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Mengirim..." : "Kirim Curhat"}
          </Button>
        </form>
      </div>
    </div>
  );
}
