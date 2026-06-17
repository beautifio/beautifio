"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Shield, Clock, Send,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { isSensitiveCategory, getResourcesForCategory } from "@/lib/safe-space-data";
import { checkProfanity } from "@/lib/profanity";
import { PusatBantuanSheet } from "@/features/bantuan/PusatBantuanSheet";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

function renderContent(text: string) {
  const paragraphs = text.split("\n\n");
  return paragraphs.map((para, i) => (
    <p key={i} className="mb-3 text-gray-700 leading-relaxed">{para}</p>
  ));
}

interface CurhatDetail {
  id: string;
  title: string;
  nickname: string;
  content: string;
  category: string;
  support_count: number;
  created_at: string;
  response_mode: string;
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
}

export default function CurhatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [item, setItem] = useState<CurhatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [supportType, setSupportType] = useState<string | null>(null);
  const [supportCount, setSupportCount] = useState(0);
  const [supressing, setSuppressing] = useState(false);
  const [resources, setResources] = useState<any[]>([]);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [profanityWarn, setProfanityWarn] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const [pollData, setPollData] = useState<{ id: string; options: string[] } | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [showBantuan, setShowBantuan] = useState(false);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("curhat_posts")
        .select("id, title, nickname, content, category, support_count, created_at, response_mode")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        setItem(data as CurhatDetail);
        setSupportCount(data.support_count || 0);
      }
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!item) return;
    const sensitive = isSensitiveCategory(item.category) ||
      isSensitiveCategory(item.title + " " + item.content);
    if (sensitive) {
      setResources(getResourcesForCategory("bullying"));
      setShowBantuan(true);
    }
  }, [item]);

  useEffect(() => {
    if (!supabase || !item || item.response_mode !== "polling") return;
    (async () => {
      const { data: poll } = await supabase
        .from("curhat_polls")
        .select("id, options")
        .eq("curhat_id", item.id)
        .maybeSingle();
      if (!poll) return;
      setPollData(poll);
      const counts = new Array(poll.options.length).fill(0);
      const { data: votes } = await supabase
        .from("curhat_poll_votes")
        .select("selected_option, user_id")
        .eq("poll_id", poll.id);
      if (votes) {
        for (const v of votes) {
          counts[v.selected_option]++;
          if (v.user_id === user?.id) setUserVote(v.selected_option);
        }
      }
      setPollVotes(counts);
    })();
  }, [item, user?.id]);

  useEffect(() => {
    if (!supabase || !id) return;
    const sub = supabase
      .channel("comments-" + id)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "curhat_comments",
          filter: `curhat_id=eq.${id}`,
        },
        (payload) => {
          const c = payload.new as Comment;
          setComments((prev) => [...prev, c]);
        },
      )
      .subscribe();

    (async () => {
      const { data } = await supabase
        .from("curhat_comments")
        .select("id, user_id, content, created_at, parent_id")
        .eq("curhat_id", id)
        .eq("status", "visible")
        .order("created_at", { ascending: true });
      if (data) setComments(data);
    })();

    return () => { supabase?.removeChannel(sub); };
  }, [id]);

  const handleSupport = useCallback(async (type: string) => {
    if (!user?.id || supportType || supressing || !supabase || !item) return;
    setSuppressing(true);
    try {
      await supabase
        .from("curhat_support")
        .insert({ curhat_id: item.id, user_id: user.id, support_type: type });
      await supabase.rpc("increment_support_count", { p_curhat_id: item.id });
      setSupportType(type);
      setSupportCount((c) => c + 1);
    } catch {
      // already supported
    } finally {
      setSuppressing(false);
    }
  }, [user?.id, supportType, supressing, item]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newComment.trim();
    if (!text || !user?.id || !supabase) return;

    const { hasProfanity } = checkProfanity(text);
    if (hasProfanity) {
      setProfanityWarn("Hindari kata kasar ya, jaga komunitas tetap positif");
      return;
    }
    setProfanityWarn("");
    setCommentSubmitting(true);
    setCommentError("");

    const insertPayload: Record<string, any> = { curhat_id: id, user_id: user.id, content: text };
    if (replyToId) insertPayload.parent_id = replyToId;

    const { error } = await supabase
      .from("curhat_comments")
      .insert(insertPayload);

    if (error) {
      setCommentError(error.message);
    } else {
      setNewComment("");
      setReplyToId(null);
    }
    setCommentSubmitting(false);
  };

  const handleVote = async (optionIndex: number) => {
    if (!user?.id || !pollData || voteSubmitting || userVote !== null || !supabase) return;
    setVoteSubmitting(true);
    try {
      await supabase.from("curhat_poll_votes").insert({
        poll_id: pollData.id, user_id: user.id, selected_option: optionIndex,
      });
      setUserVote(optionIndex);
      setPollVotes((prev) => {
        const next = [...prev];
        next[optionIndex]++;
        return next;
      });
    } catch {
      // already voted
    } finally {
      setVoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <Shield className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Curhat Tidak Ditemukan
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Curhat ini mungkin sudah dihapus atau tidak tersedia.
        </p>
        <Link
          href="/curhat"
          className="px-6 py-2.5 bg-[#084463] text-white rounded-full text-sm font-medium hover:bg-[#084463]/90 transition-colors"
        >
          Kembali ke Curhat
        </Link>
      </div>
    );
  }

  const initials = (item.nickname || "Anonymous").slice(0, 2).toUpperCase();
  const displayName = item.nickname || "Anonymous";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.push("/curhat")}
            className="p-1.5 -ml-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-gray-900 truncate">
            {item.title || "Curhat"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge className="bg-purple-100 text-purple-700 text-xs">
            {item.category}
          </Badge>
          {item.response_mode === "polling" && (
            <Badge className="bg-blue-100 text-blue-700 text-xs">📊 Polling</Badge>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(item.created_at)}
          </span>
        </div>

        {item.title && (
          <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
            {item.title}
          </h1>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-semibold text-white">
            {initials}
          </div>
          <span className="text-sm text-gray-700">{displayName}</span>
        </div>

        <div className="mb-6">
          {renderContent(item.content)}
        </div>

        {resources.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-800">Kami Peduli dengan Kamu</h3>
            </div>
            <p className="text-xs text-amber-700 mb-3">
              Konten ini mungkin berkaitan dengan topik sensitif. Berikut beberapa sumber bantuan:
            </p>
            <div className="space-y-2">
              {resources.slice(0, 2).map((r: any) => (
                <div key={r.id} className="bg-white p-3 rounded-lg border border-amber-100">
                  <h4 className="text-xs font-semibold text-gray-900">{r.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-amber-800 font-medium mt-3">
              ☎️ Hotline Kesehatan Mental Kemenkes: <strong>119 (ekstensi 8)</strong>
            </p>
          </div>
        )}

        {/* Poll Section */}
        {item.response_mode === "polling" && pollData && (
          <div className="mb-6 p-4 rounded-xl bg-white border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 Hasil Polling</h3>
            <div className="space-y-3">
              {pollData.options.map((opt, i) => {
                const total = pollVotes.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((pollVotes[i] / total) * 100) : 0;
                return (
                  <button
                    key={i}
                    onClick={() => handleVote(i)}
                    disabled={userVote !== null || !user?.id}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      userVote === i
                        ? "border-[#084463] bg-[#084463]/5"
                        : "border-gray-200 hover:border-gray-300"
                    } disabled:opacity-80`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{opt}</span>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: userVote === i ? "#084463" : "#A0A0A0" }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 mt-1 block">{pollVotes[i]} suara</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">
              {pollVotes.reduce((a, b) => a + b, 0)} suara
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 py-4 border-t border-gray-100">
          {[
            { type: "hug", label: "🤗", text: "Peluk" },
            { type: "relate", label: "🙋", text: "Aku juga" },
            { type: "strength", label: "💪", text: "Semangat" },
            { type: "love", label: "❤️", text: "Sayang" },
            { type: "warm", label: "🫂", text: "Hangat" },
            { type: "solid", label: "🤝", text: "Solidaritas" },
            { type: "sad", label: "😢", text: "Turut sedih" },
            { type: "pray", label: "🙏", text: "Doa" },
            { type: "inspire", label: "✨", text: "Inspirasi" },
          ].map((s) => (
            <button
              key={s.type}
              onClick={() => handleSupport(s.type)}
              disabled={!user?.id || !!supportType}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                supportType === s.type
                  ? "bg-purple-100 text-purple-700 ring-2 ring-purple-300"
                  : "text-gray-500 hover:bg-gray-100"
              } disabled:opacity-50`}
            >
              <span className="text-base">{s.label}</span>
              <span>{s.text}</span>
            </button>
          ))}
          <span className="text-sm text-gray-400 w-full text-center mt-1">{supportCount} dukungan</span>
        </div>

        {/* Comments Section (only for story mode) */}
        {item.response_mode !== "polling" && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              💬 Komentar ({comments.length})
            </h3>

            <div className="space-y-3 mb-4">
              {comments.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  Belum ada komentar. Jadilah yang pertama berbagi cerita.
                </p>
              )}
              {(() => {
                const topComments = comments.filter((c) => !c.parent_id);
                const childMap = new Map<string, Comment[]>();
                for (const c of comments) {
                  if (c.parent_id) {
                    const arr = childMap.get(c.parent_id) || [];
                    arr.push(c);
                    childMap.set(c.parent_id, arr);
                  }
                }
                return topComments.map((c) => {
                  const children = childMap.get(c.id) || [];
                  return (
                    <div key={c.id}>
                      <div className="bg-white p-3 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                            AN
                          </div>
                          <span className="text-xs text-gray-400">ANON · {timeAgo(c.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{c.content}</p>
                        {user?.id && (
                          <button
                            onClick={() => setReplyToId(replyToId === c.id ? null : c.id)}
                            className="text-xs text-gray-400 hover:text-[#084463] mt-1 transition-colors"
                          >
                            {replyToId === c.id ? "Batal balas" : "Balas"}
                          </button>
                        )}
                      </div>
                      {replyToId === c.id && (
                        <div className="ml-6 mt-2 mb-2">
                          <form onSubmit={handleCommentSubmit} className="flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => {
                                setNewComment(e.target.value);
                                if (profanityWarn) {
                                  const { hasProfanity } = checkProfanity(e.target.value);
                                  if (!hasProfanity) setProfanityWarn("");
                                }
                              }}
                              placeholder="Tulis balasan..."
                              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#084463] focus:border-transparent"
                              disabled={commentSubmitting}
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={commentSubmitting || !newComment.trim()}
                              className="px-4 py-2 bg-[#084463] text-white rounded-xl text-sm font-medium hover:bg-[#084463]/90 disabled:opacity-50 flex items-center gap-1"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      )}
                      {children.map((child) => (
                        <div key={child.id} className="ml-6 mt-2">
                          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                                AN
                              </div>
                              <span className="text-xs text-gray-400">ANON · {timeAgo(child.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-700">{child.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                });
              })()}
            </div>

            {user?.id && !replyToId && (
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    if (profanityWarn) {
                      const { hasProfanity } = checkProfanity(e.target.value);
                      if (!hasProfanity) setProfanityWarn("");
                    }
                  }}
                  placeholder="Tulis komentar..."
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#084463] focus:border-transparent"
                  disabled={commentSubmitting}
                />
                <button
                  type="submit"
                  disabled={commentSubmitting || !newComment.trim()}
                  className="px-4 py-2.5 bg-[#084463] text-white rounded-xl text-sm font-medium hover:bg-[#084463]/90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
            {!user?.id && (
              <p className="text-xs text-gray-400 text-center">
                <Link href="/login" className="text-[#084463] font-medium">Masuk</Link> untuk berkomentar
              </p>
            )}

            {profanityWarn && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {profanityWarn}
              </p>
            )}
            {commentError && (
              <p className="text-xs text-red-500 mt-2">{commentError}</p>
            )}
          </div>
        )}

        {/* Bantuan Button */}
        <div className="mt-4">
          <button
            onClick={() => setShowBantuan(true)}
            className="w-full py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            🆘 Butuh Bantuan?
          </button>
        </div>
      </div>

      <PusatBantuanSheet
        open={showBantuan}
        onClose={() => setShowBantuan(false)}
        initialTab={resources.length > 0 ? "darurat" : "bantuan"}
        storyCategory={item?.category}
      />
    </div>
  );
}
