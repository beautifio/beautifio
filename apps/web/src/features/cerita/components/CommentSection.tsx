"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Avatar, Card } from "@beautifio/ui";
import type { StoryComment } from "@beautifio/types";

const MOCK_COMMENTS: Record<string, StoryComment[]> = {};

export function CommentSection({ storyId }: { storyId: string }) {
  const [comments, setComments] = useState<StoryComment[]>(MOCK_COMMENTS[storyId] ?? []);
  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newComment: StoryComment = {
      id: `c${Date.now()}`,
      story_id: storyId,
      user_id: "u1",
      parent_id: undefined,
      content: input.trim(),
      created_at: new Date().toISOString(),
      author_name: "Andini Putri",
      author_avatar: undefined,
      replies: [],
    };
    setComments((prev) => [newComment, ...prev]);
    setInput("");
  };

  const handleReply = (parentId: string) => {
    if (!replyInput.trim()) return;
    const reply: StoryComment = {
      id: `r${Date.now()}`,
      story_id: storyId,
      user_id: "u1",
      parent_id: parentId,
      content: replyInput.trim(),
      created_at: new Date().toISOString(),
      author_name: "Andini Putri",
    };
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
    setReplyInput("");
    setReplyTo(null);
  };

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={18} className="text-primary" />
        <h3 className="text-base font-bold text-text-primary">
          Komentar ({comments.length})
        </h3>
      </div>

      <div className="flex gap-2 mb-6">
        <Avatar initials="AP" size="sm" />
        <div className="flex-1 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Tulis komentar..."
            className="flex-1 h-10 px-3 rounded-sm border border-border bg-bg text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyInput={replyInput}
            setReplyInput={setReplyInput}
            onReply={handleReply}
          />
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare size={28} className="mx-auto text-text-secondary/30 mb-2" />
            <p className="text-xs text-text-secondary">
              Belum ada komentar. Jadilah yang pertama!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  replyTo,
  setReplyTo,
  replyInput,
  setReplyInput,
  onReply,
}: {
  comment: StoryComment;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyInput: string;
  setReplyInput: (v: string) => void;
  onReply: (parentId: string) => void;
}) {
  const timeAgo = getTimeAgo(comment.created_at);

  return (
    <div className="flex gap-3">
      <Avatar
        initials={(comment.author_name ?? "??")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">
            {comment.author_name ?? "User"}
          </span>
          <span className="text-[10px] text-text-secondary">{timeAgo}</span>
        </div>
        <p className="text-sm text-text-primary mt-0.5 leading-relaxed">
          {comment.content}
        </p>
        <button
          onClick={() =>
            setReplyTo(replyTo === comment.id ? null : comment.id)
          }
          className="text-[11px] font-medium text-secondary hover:text-secondary/80 transition-colors mt-1 cursor-pointer"
        >
          Balas
        </button>

        {replyTo === comment.id && (
          <div className="flex gap-2 mt-2">
            <input
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onReply(comment.id);
              }}
              placeholder="Tulis balasan..."
              className="flex-1 h-8 px-3 rounded-sm border border-border bg-bg text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
              autoFocus
            />
            <button
              onClick={() => onReply(comment.id)}
              disabled={!replyInput.trim()}
              className="h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Kirim
            </button>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ml-2 space-y-3 pl-3 border-l-2 border-border">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar
                  initials={(reply.author_name ?? "??")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                  size="sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">
                      {reply.author_name ?? "User"}
                    </span>
                    <span className="text-[10px] text-text-secondary">
                      {getTimeAgo(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-text-primary mt-0.5 leading-relaxed">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins}m lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}h lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}
