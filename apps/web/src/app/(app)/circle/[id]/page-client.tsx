"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Send, MessageSquare, Calendar, Clock, Check,
  Plus, BookOpen, Package,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Avatar, Badge, Card, Button } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import type { Circle, Message, CircleSession, CircleMentorQA } from "@beautifio/types";

const tabs = [
  { id: "chat", label: "Obrolan" },
  { id: "mentor", label: "Mentor" },
  { id: "sessions", label: "Sesi" },
  { id: "members", label: "Anggota" },
];

const GRADIENTS = [
  "from-primary to-secondary", "from-secondary to-accent", "from-accent to-primary",
  "from-blue-600 to-cyan-400", "from-pink-500 to-orange-400", "from-orange-500 to-red-500",
  "from-purple-600 to-pink-500", "from-green-600 to-teal-400", "from-rose-500 to-pink-400",
  "from-blue-500 to-indigo-600",
];

function getGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function ChatBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${isOwn ? "bg-primary text-primary-foreground" : "bg-surface border border-border text-text-primary"}`}>
          {msg.message}
        </div>
        <span className="text-[10px] text-text-secondary mt-0.5 px-1">
          {new Date(msg.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

function QuestionCard({ q, currentUserId }: { q: CircleMentorQA; currentUserId?: string }) {
  return (
    <Card padding="md">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {q.is_answered ? "Terjawab" : "Belum dijawab"}
            </span>
            <span className="text-[10px] text-text-secondary">
              {new Date(q.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
          <h4 className="text-sm font-bold text-text-primary mt-1">{q.question_text}</h4>
          {q.answer_text && (
            <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-semibold text-primary">Jawaban Mentor:</p>
              <p className="text-xs text-text-secondary mt-1">{q.answer_text}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            {q.is_answered ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Terjawab</Badge>
            ) : (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none bg-yellow-100 text-yellow-800">Menunggu</Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function SessionCard({
  session, isRegistered, onRsvp, registering,
}: {
  session: CircleSession; isRegistered: boolean; onRsvp: () => void; registering: boolean;
}) {
  const isUpcoming = new Date(session.scheduled_at) > new Date();
  return (
    <Card padding="md" className={isUpcoming ? "border-primary/20" : "opacity-70"}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isUpcoming ? "bg-primary/10 text-primary" : "bg-surface text-text-secondary"}`}>
          {isUpcoming ? <Calendar size={18} /> : <BookOpen size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-text-primary">{session.title}</h4>
          {session.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{session.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1">
              <Calendar size={12} />{new Date(session.scheduled_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />{new Date(session.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {session.meet_url && isUpcoming && (
            <a href={session.meet_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-primary font-medium hover:underline">
              Link Meet
            </a>
          )}
          {isUpcoming && (
            isRegistered ? (
              <Badge variant="secondary" className="mt-2 text-[10px] px-1.5 py-0 leading-none">
                <Check size={10} className="mr-1 inline" /> Terdaftar
              </Badge>
            ) : (
              <Button variant="primary" size="sm" className="mt-2" loading={registering} onClick={onRsvp}>
                Daftar Sesi
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
}

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<CircleSession[]>([]);
  const [qaList, setQaList] = useState<CircleMentorQA[]>([]);
  const [myRsvpSessionIds, setMyRsvpSessionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [input, setInput] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [showAskForm, setShowAskForm] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [asking, setAsking] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    if (!user || !id) { setLoading(false); return; }
    try {
      const q = await import("@/lib/supabase/queries");
      const [c, msgs, membs, sess, qa, rsvpIds] = await Promise.all([
        q.getCircleById(id).catch(() => null),
        q.getMessages(id),
        q.getCircleMembers(id).catch(() => []),
        q.getSessions(id).catch(() => []),
        q.getMentorQA(id).catch(() => []),
        q.getMyRsvps(user.id).catch(() => new Set<string>()),
      ]);
      setCircle(c);
      setMessages(msgs);
      setMembers(membs);
      setSessions(sess);
      setQaList(qa);
      setMyRsvpSessionIds(rsvpIds);
      setIsMember(membs.some((m: any) => m.user_id === user.id));
    } catch (e) {
      console.error("Failed to load circle", e);
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime messages
  useEffect(() => {
    const sb = supabase;
    if (!sb || !id) return;
    const channel = sb
      .channel(`circle-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `circle_id=eq.${id}` }, (payload) => {
        setMessages((prev) => prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { sb.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || sendingMsg) return;
    setSendingMsg(true);
    try {
      const { sendMessage } = await import("@/lib/supabase/queries");
      const msg = await sendMessage({ circle_id: id, sender_id: user.id, message: input.trim() });
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleAskMentor = async () => {
    if (!questionText.trim() || !user || asking) return;
    setAsking(true);
    try {
      const { askMentor } = await import("@/lib/supabase/queries");
      const qa = await askMentor(id, user.id, questionText.trim());
      setQaList((prev) => [qa, ...prev]);
      setShowAskForm(false);
      setQuestionText("");
    } catch (e) {
      console.error("Failed to ask mentor", e);
    } finally {
      setAsking(false);
    }
  };

  const handleRsvp = async (sessionId: string) => {
    if (!user || registering) return;
    setRegistering(sessionId);
    try {
      const { rsvpSession } = await import("@/lib/supabase/queries");
      await rsvpSession(sessionId, user.id);
      setMyRsvpSessionIds((prev) => new Set(prev).add(sessionId));
    } catch (e) {
      console.error("Failed to RSVP", e);
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-content px-6">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-8 bg-muted rounded-lg w-1/3" />
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Package size={28} className="text-text-secondary/40" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Circle tidak ditemukan</h2>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/circle")}>Kembali</Button>
        </div>
      </div>
    );
  }

  const gradient = getGradient(circle.id);
  const upcomingSessions = sessions.filter((s) => new Date(s.scheduled_at) > new Date());
  const pastSessions = sessions.filter((s) => new Date(s.scheduled_at) <= new Date());

  const header = (
    <div className={`bg-gradient-to-r ${gradient} px-6 pt-12 pb-8 text-white`}>
      <button
        onClick={() => router.push("/circle")}
        className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all active:scale-90 mb-4"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{circle.name}</h1>
          <p className="text-sm text-white/80 mt-1">{circle.description}</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-white/70">{circle.member_count}/{circle.capacity} anggota</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((m) => (
            <div key={m.id} className="w-7 h-7 rounded-full bg-white/30 border-2 border-white/0 flex items-center justify-center text-[10px] font-bold text-white">
              {(m.users?.full_name || "?").charAt(0)}
            </div>
          ))}
          {members.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-[10px] font-medium text-white">
              +{members.length - 5}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabBar = (
    <div className="flex border-b border-border bg-surface px-6 sticky top-0 z-10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab.label}
          {tab.id === "members" && members.length > 0 && (
            <span className="ml-1.5 text-[10px] text-text-secondary">{members.length}</span>
          )}
        </button>
      ))}
    </div>
  );

  const chatTab = (
    <div className="flex flex-col h-[calc(100vh-320px)]">
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="px-6 py-3 border-t border-border bg-surface">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Tulis pesan..."
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-bg text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          <Button
            variant="primary"
            size="sm"
            loading={sendingMsg}
            disabled={!input.trim() || !user}
            onClick={handleSend}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );

  const mentorTab = (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Tanya Mentor</h3>
        <button
          onClick={() => setShowAskForm(!showAskForm)}
          className="flex items-center gap-1 text-xs font-medium text-primary cursor-pointer hover:underline"
        >
          <Plus size={14} />
          Ajukan Pertanyaan
        </button>
      </div>

      {showAskForm && (
        <Card padding="md" className="border-primary/20">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Tulis pertanyaan untuk mentor..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setShowAskForm(false)}
              className="h-8 px-3 rounded-lg text-xs font-medium text-text-secondary border border-border cursor-pointer hover:bg-surface transition-colors"
            >
              Batal
            </button>
            <Button variant="primary" size="sm" loading={asking} disabled={!questionText.trim() || !user} onClick={handleAskMentor}>
              Kirim
            </Button>
          </div>
        </Card>
      )}

      {qaList.length > 0 ? (
        qaList.map((q) => <QuestionCard key={q.id} q={q} currentUserId={user?.id} />)
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
            <MessageSquare size={24} className="text-text-secondary/40" />
          </div>
          <p className="text-sm font-semibold text-text-primary">Belum ada pertanyaan</p>
          <p className="text-xs text-text-secondary mt-1">Jadilah yang pertama bertanya</p>
        </div>
      )}
    </div>
  );

  const sessionsTab = (
    <div className="px-6 py-4 space-y-4">
      {upcomingSessions.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-text-primary mb-3">Sesi Mendatang</h3>
          <div className="space-y-3">
            {upcomingSessions.map((s) => (
              <SessionCard
                key={s.id} session={s}
                isRegistered={myRsvpSessionIds.has(s.id)}
                onRsvp={() => handleRsvp(s.id)}
                registering={registering === s.id}
              />
            ))}
          </div>
        </section>
      )}

      {pastSessions.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-text-primary mb-3">Sesi Sebelumnya</h3>
          <div className="space-y-3">
            {pastSessions.map((s) => (
              <SessionCard
                key={s.id} session={s}
                isRegistered={false}
                onRsvp={() => {}}
                registering={false}
              />
            ))}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={36} className="mx-auto text-text-secondary/30 mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Belum Ada Sesi</h3>
          <p className="text-xs text-text-secondary mt-1">Pantau terus untuk sesi mendatang.</p>
        </div>
      )}
    </div>
  );

  const membersTab = (
    <div className="px-6 py-4 space-y-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-secondary">{members.length} dari {circle.capacity} anggota</p>
        <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(members.length / circle.capacity) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-0.5">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface/50 transition-colors">
            <Avatar initials={(m.users?.full_name || "?").charAt(0)} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">
                  {m.users?.full_name || "User"}
                  {m.user_id === user?.id && <span className="text-text-secondary font-normal"> (Kamu)</span>}
                </span>
                {m.role === "co-host" && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Co-Host</Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        {header}
        {tabBar}
        {activeTab === "chat" && chatTab}
        {activeTab === "mentor" && mentorTab}
        {activeTab === "sessions" && sessionsTab}
        {activeTab === "members" && membersTab}
      </div>
    </div>
  );
}
