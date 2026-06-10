"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  UserPlus,
  Check,
  Plus,
  Sparkles,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Avatar, Badge, Card } from "@beautifio/ui";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const circleData: Record<string, {
  id: string;
  name: string;
  tag: string;
  desc: string;
  members: { id: string; name: string; initials: string; role: string; isMentor?: boolean }[];
  memberCount: number;
  maxMembers: number;
  hasMentor: boolean;
  mentor?: { name: string; initials: string; expertise: string };
  coverColor: string;
}> = {
  "1": {
    id: "1",
    name: "Tech Founders",
    tag: "Kewirausahaan",
    desc: "Bagi kamu yang ingin membangun startup teknologi dari nol. Diskusi, sharing session, dan kolaborasi project bareng.",
    memberCount: 8,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Pak Rudi", initials: "RR", expertise: "Tech Entrepreneur, 10+ years" },
    coverColor: "from-primary to-secondary",
    members: [
      { id: "u1", name: "Andini Putri", initials: "AP", role: "Co-Host" },
      { id: "u2", name: "Budi Santoso", initials: "BS", role: "Member", isMentor: true },
      { id: "u3", name: "Citra Dewi", initials: "CD", role: "Member" },
      { id: "u4", name: "Dimas Prakoso", initials: "DP", role: "Member" },
      { id: "u5", name: "Eka Fitria", initials: "EF", role: "Member" },
      { id: "u6", name: "Fajar Hidayat", initials: "FH", role: "Member" },
      { id: "u7", name: "Gita Permata", initials: "GP", role: "Member" },
      { id: "u8", name: "Hadi Prasetyo", initials: "HP", role: "Member" },
    ],
  },
  "2": {
    id: "2",
    name: "Creative Lab",
    tag: "Kreatif",
    desc: "Ruang berkarya untuk desainer, penulis, dan content creator. Kolaborasi project kreatif dan portofolio building.",
    memberCount: 6,
    maxMembers: 12,
    hasMentor: false,
    coverColor: "from-secondary to-accent",
    members: [
      { id: "u1", name: "Andini Putri", initials: "AP", role: "Member" },
      { id: "u9", name: "Indah Wulandari", initials: "IW", role: "Co-Host" },
      { id: "u10", name: "Joko Susilo", initials: "JS", role: "Member" },
      { id: "u11", name: "Kiki Amalia", initials: "KA", role: "Member" },
      { id: "u12", name: "Luki Pratama", initials: "LP", role: "Member" },
      { id: "u13", name: "Maya Sari", initials: "MS", role: "Member" },
    ],
  },
  "3": {
    id: "3",
    name: "Future Leaders",
    tag: "Kepemimpinan",
    desc: "Kaderisasi kepemimpinan muda untuk perubahan sosial.Program pengembangan diri dan soft skills.",
    memberCount: 10,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Bu Sari", initials: "SS", expertise: "Leadership Coach, HR Director" },
    coverColor: "from-accent to-primary",
    members: [
      { id: "u1", name: "Andini Putri", initials: "AP", role: "Member" },
      { id: "u14", name: "Nina Rahmawati", initials: "NR", role: "Co-Host", isMentor: true },
      { id: "u15", name: "Oki Sanjaya", initials: "OS", role: "Member" },
      { id: "u16", name: "Putu Adi", initials: "PA", role: "Member" },
      { id: "u17", name: "Qori Halimah", initials: "QH", role: "Member" },
      { id: "u18", name: "Rizky Ferdian", initials: "RF", role: "Member" },
      { id: "u19", name: "Sari Melati", initials: "SM", role: "Member" },
      { id: "u20", name: "Teguh Wicaksono", initials: "TW", role: "Member" },
      { id: "u21", name: "Umi Kalsum", initials: "UK", role: "Member" },
      { id: "u22", name: "Vino Mahendra", initials: "VM", role: "Member" },
    ],
  },
  "4": {
    id: "4",
    name: "Green Warriors",
    tag: "Lingkungan",
    desc: "Komunitas peduli lingkungan dengan aksi nyata. Tree planting, waste management, dan edukasi lingkungan.",
    memberCount: 5,
    maxMembers: 12,
    hasMentor: false,
    coverColor: "from-green-600 to-emerald-400",
    members: [
      { id: "u23", name: "Widi Astuti", initials: "WA", role: "Co-Host" },
      { id: "u24", name: "Xaverius Dwi", initials: "XD", role: "Member" },
      { id: "u25", name: "Yuni Safitri", initials: "YS", role: "Member" },
      { id: "u26", name: "Zaki Maulana", initials: "ZM", role: "Member" },
      { id: "u27", name: "Aditya Pratama", initials: "AP", role: "Member" },
    ],
  },
  "5": {
    id: "5",
    name: "Data Science ID",
    tag: "Teknologi",
    desc: "Diskusi dan project bareng seputar data science & AI. Belajar Python, ML, dan Data Visualization.",
    memberCount: 9,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Pak Anton", initials: "AA", expertise: "Data Scientist, PhD candidate" },
    coverColor: "from-blue-600 to-cyan-400",
    members: [
      { id: "u28", name: "Bella Safira", initials: "BS", role: "Co-Host" },
      { id: "u29", name: "Cahyo Nugroho", initials: "CN", role: "Member", isMentor: true },
      { id: "u30", name: "Dian Permata", initials: "DP", role: "Member" },
      { id: "u31", name: "Evan Kurniawan", initials: "EK", role: "Member" },
      { id: "u32", name: "Fitri Handayani", initials: "FH", role: "Member" },
      { id: "u33", name: "Gilang Ramadan", initials: "GR", role: "Member" },
      { id: "u34", name: "Hana Latifah", initials: "HL", role: "Member" },
      { id: "u35", name: "Irfan Mauludi", initials: "IM", role: "Member" },
      { id: "u36", name: "Jasmine Azzahra", initials: "JA", role: "Member" },
    ],
  },
  "6": {
    id: "6",
    name: "Content Creator Hub",
    tag: "Kreatif",
    desc: "Tips, kolaborasi, dan tumbuh bareng sebagai creator. YouTube, TikTok, IG, dan platform lainnya.",
    memberCount: 7,
    maxMembers: 12,
    hasMentor: false,
    coverColor: "from-pink-500 to-orange-400",
    members: [
      { id: "u37", name: "Kevin Alexander", initials: "KA", role: "Co-Host" },
      { id: "u38", name: "Linda Kusuma", initials: "LK", role: "Member" },
      { id: "u39", name: "Mona Lisa", initials: "ML", role: "Member" },
      { id: "u40", name: "Nando Prabowo", initials: "NP", role: "Member" },
      { id: "u41", name: "Olivia Tan", initials: "OT", role: "Member" },
      { id: "u42", name: "Panji Saputra", initials: "PS", role: "Member" },
      { id: "u43", name: "Rara Kirana", initials: "RK", role: "Member" },
    ],
  },
};

const MOCK_MESSAGES: Record<string, {
  id: string; senderId: string; senderName: string; senderInitials: string; text: string; time: string; isToday?: boolean;
}[]> = {
  "1": [
    { id: "m1", senderId: "u2", senderName: "Budi Santoso", senderInitials: "BS", text: "Halo semua! Ada yang udah pernah ikut hackathon?", time: "09:32", isToday: true },
    { id: "m2", senderId: "u1", senderName: "Andini Putri", senderInitials: "AP", text: "Aku pernah ikut Hackathon Kemendikbud tahun lalu, seru banget!", time: "09:35", isToday: true },
    { id: "m3", senderId: "u3", senderName: "Citra Dewi", senderInitials: "CD", text: "Wah, sharing dong pengalamannya!", time: "09:36", isToday: true },
    { id: "m4", senderId: "u2", senderName: "Budi Santoso", senderInitials: "BS", text: "Nah itu, mungkin kita bisa bikin tim buat ikut hackathon bulan depan?", time: "09:38", isToday: true },
    { id: "m5", senderId: "u1", senderName: "Andini Putri", senderInitials: "AP", text: "Setuju! Aku kenal beberapa teman yang mungkin juga tertarik", time: "09:40", isToday: true },
    { id: "m6", senderId: "u4", senderName: "Dimas Prakoso", senderInitials: "DP", text: "Gue in! udah cari partner nih", time: "09:42", isToday: true },
  ],
};

const MOCK_QUESTIONS: Record<string, { id: string; user: string; initials: string; title: string; content: string; answers: number; time: string }[]> = {
  "1": [
    { id: "q1", user: "Citra Dewi", initials: "CD", title: "Gimana cara validasi ide startup?", content: "Aku punya ide aplikasi buat UMKM, tapi bingung gimana cara validasi sebelum bikin produk. Ada yang punya pengalaman?", answers: 3, time: "2 hari lalu" },
    { id: "q2", user: "Eka Fitria", initials: "EF", title: "Rekomendasi platform no-code?", content: "Mau coba bikin MVP tanpa coding. Ada rekomendasi platform yang beginner-friendly?", answers: 1, time: "5 hari lalu" },
    { id: "q3", user: "Fajar Hidayat", initials: "FH", title: "Cari co-founder teknis", content: "Aku dari bisnis, butuh co-founder yang懂 tech. Ada yang interested diskusi?", answers: 2, time: "1 minggu lalu" },
  ],
  "2": [
    { id: "q4", user: "Indah Wulandari", initials: "IW", title: "Tips mulai portfolio sebagai desainer", content: "Baru lulus DKV, mau bangun portfolio dari nol. Mulai dari mana ya?", answers: 0, time: "3 hari lalu" },
  ],
};

const MOCK_SESSIONS: Record<string, { id: string; title: string; desc: string; date: string; time: string; status: string; mentor: string; slots: number }[]> = {
  "1": [
    { id: "s1", title: "Bootcamp: MVP Development", desc: "Sesi intensif 2 jam membangun MVP dengan no-code tools. Peserta akan praktek langsung membuat landing page dan prototipe.", date: "15 Juni 2026", time: "19:00 - 21:00 WIB", status: "upcoming", mentor: "Pak Rudi", slots: 8 },
    { id: "s2", title: "Fireside Chat: Dari Ide ke Investasi", desc: "Mendengar pengalaman founder yang berhasil raise seed funding.", date: "22 Juni 2026", time: "16:00 - 17:30 WIB", status: "upcoming", mentor: "Pak Rudi", slots: 12 },
  ],
  "2": [
    { id: "s3", title: "Workshop: Canva untuk Pemula", desc: "Belajar desain grafis dengan Canva dari dasar.", date: "10 Juni 2026", time: "14:00 - 16:00 WIB", status: "completed", mentor: "Eksternal", slots: 0 },
  ],
};

// ─── Current User ────────────────────────────────────────────────────────────

const CURRENT_USER = { id: "u1", name: "Andini Putri", initials: "AP" };

// ─── Tabs ────────────────────────────────────────────────────────────────────

const tabs = [
  { id: "chat", label: "Chat" },
  { id: "mentor", label: "Mentor" },
  { id: "members", label: "Anggota" },
  { id: "sessions", label: "Sesi" },
];

// ─── Chat Bubble ─────────────────────────────────────────────────────────────

function ChatBubble({ msg, isOwn }: { msg: typeof MOCK_MESSAGES["1"][0]; isOwn: boolean }) {
  return (
    <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
      {!isOwn && (
          <div className="mt-0.5 flex-shrink-0"><Avatar initials={msg.senderInitials} size="sm" /></div>
      )}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        {!isOwn && (
          <span className="text-[10px] font-medium text-text-secondary mb-0.5 px-1">
            {msg.senderName}
          </span>
        )}
        <div
          className={`rounded-sm px-3 py-2 text-sm leading-relaxed ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : "bg-surface border border-border text-text-primary"
          }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-text-secondary mt-0.5 px-1">{msg.time}</span>
      </div>
    </div>
  );
}

// ─── Mentor Questions ────────────────────────────────────────────────────────

function QuestionCard({ q }: { q: typeof MOCK_QUESTIONS["1"][0] }) {
  return (
    <Card padding="md">
      <div className="flex gap-3">
        <div className="flex-shrink-0"><Avatar initials={q.initials} size="sm" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">{q.user}</span>
            <span className="text-[10px] text-text-secondary">{q.time}</span>
          </div>
          <h4 className="text-sm font-bold text-text-primary mt-1">{q.title}</h4>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{q.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">
              <MessageSquare size={10} className="mr-1 inline" />
              {q.answers} jawaban
            </Badge>
            <button className="text-[10px] text-primary font-medium hover:underline cursor-pointer">
              Baca selengkapnya
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Session Card ────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: typeof MOCK_SESSIONS["1"][0] }) {
  const isUpcoming = session.status === "upcoming";
  return (
    <Card padding="md" className={isUpcoming ? "border-primary/20" : "opacity-70"}>
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 ${
            isUpcoming ? "bg-primary/10 text-primary" : "bg-surface text-text-secondary"
          }`}
        >
          {isUpcoming ? <Calendar size={18} /> : <BookOpen size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-text-primary">{session.title}</h4>
            {isUpcoming && <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Baru</Badge>}
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{session.desc}</p>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1"><Calendar size={12} />{session.date}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{session.time}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">
              <GraduationCap size={10} className="mr-1 inline" />
              {session.mentor}
            </Badge>
            {isUpcoming && (
              <span className="text-[10px] text-text-secondary">{session.slots} slot tersedia</span>
            )}
          </div>
          {isUpcoming && (
            <button className="mt-3 w-full h-9 text-sm font-medium rounded-sm bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
              Daftar Sesi
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const circle = circleData[id];
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState(MOCK_MESSAGES[id] ?? []);
  const [input, setInput] = useState("");
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [showAskForm, setShowAskForm] = useState(false);
  const [joinedCircles, setJoinedCircles] = useState<Set<string>>(new Set(["1", "2"]));
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const channel = client
      .channel(`circle-${id}-messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `circle_id=eq.${id}`,
        },
        (payload) => {
          const msg = payload.new as Record<string, string>;
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              senderId: msg.sender_id,
              senderName: msg.sender_name ?? "User",
              senderInitials: msg.sender_initials ?? "U",
              text: msg.message,
              time: new Date(msg.created_at ?? Date.now()).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              isToday: true,
            },
          ]);
        }
      )
      .subscribe();
    return () => { client.removeChannel(channel); };
  }, [id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!circle) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-secondary">Circle tidak ditemukan</p>
      </div>
    );
  }

  const isJoined = joinedCircles.has(id);
  const isFull = circle.memberCount >= circle.maxMembers;
  const filteredMembers = circle.members.filter((m) => m.id !== CURRENT_USER.id);

  const handleSend = () => {
    if (!input.trim()) return;
    const msg = {
      id: `m${Date.now()}`,
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.name,
      senderInitials: CURRENT_USER.initials,
      text: input.trim(),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      isToday: true,
    };
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  const handleJoin = () => {
    const next = new Set(joinedCircles);
    next.add(id);
    setJoinedCircles(next);
  };

  const handleAskMentor = () => {
    if (!questionTitle.trim() || !questionContent.trim()) return;
    setShowAskForm(false);
    setQuestionTitle("");
    setQuestionContent("");
  };

  // ─── Header ─────────────────────────────────────────────────────────────

  const header = (
    <div
      className={`bg-gradient-to-r ${circle.coverColor} px-6 pt-12 pb-8 text-white`}
    >
      <button
        onClick={() => router.push("/circle")}
        className="w-8 h-8 rounded-sm bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors mb-4"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{circle.name}</h1>
          <p className="text-sm text-white/80 mt-1">{circle.desc}</p>
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-white/20 text-white border-white/20">
              {circle.tag}
            </Badge>
            <span className="text-xs text-white/70">{circle.memberCount}/{circle.maxMembers} anggota</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {circle.members.slice(0, 5).map((m) => (
            <div key={m.id} className="w-7 h-7 rounded-full bg-white/30 border-2 border-white/0 flex items-center justify-center text-[10px] font-bold text-white">
              {m.initials}
            </div>
          ))}
          {circle.memberCount > 5 && (
            <div className="w-7 h-7 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-[10px] font-medium text-white">
              +{circle.memberCount - 5}
            </div>
          )}
        </div>

        {!isJoined ? (
          <button
            onClick={handleJoin}
            disabled={isFull}
            className="h-9 px-4 rounded-sm bg-white text-primary text-sm font-bold cursor-pointer hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <UserPlus size={16} />
            {isFull ? "Penuh" : "Gabung"}
          </button>
        ) : (
          <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
            <Check size={12} className="mr-1" /> Anggota
          </Badge>
        )}
      </div>

      {circle.hasMentor && circle.mentor && (
        <div className="mt-4 p-3 rounded-sm bg-white/10 backdrop-blur-sm flex items-center gap-3">
          <Avatar initials={circle.mentor.initials} size="md" />
          <div>
            <p className="text-xs font-bold">Mentor: {circle.mentor.name}</p>
            <p className="text-[10px] text-white/70 mt-0.5">{circle.mentor.expertise}</p>
          </div>
          <Sparkles size={16} className="text-accent ml-auto" />
        </div>
      )}
    </div>
  );

  // ─── Tabs ───────────────────────────────────────────────────────────────

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
          {tab.id === "chat" && messages.length > 0 && (
            <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0 leading-none">
              {messages.length}
            </span>
          )}
          {tab.id === "members" && (
            <span className="ml-1.5 text-[10px] text-text-secondary">
              {circle.memberCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  // ─── Chat Tab ───────────────────────────────────────────────────────────

  const chatTab = (
    <div className="flex flex-col h-[calc(100vh-320px)]">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} isOwn={msg.senderId === CURRENT_USER.id} />
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
    </div>
  );

  // ─── Mentor Tab ─────────────────────────────────────────────────────────

  const mentorTab = (
    <div className="px-6 py-4 space-y-4">
      {circle.hasMentor ? (
        <>
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
              <input
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="Judul pertanyaan..."
                className="w-full h-10 px-3 rounded-sm border border-border bg-bg text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder="Detail pertanyaan..."
                rows={3}
                className="w-full mt-2 px-3 py-2 rounded-sm border border-border bg-bg text-sm text-text-primary outline-none placeholder:text-text-secondary/50 focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowAskForm(false)}
                  className="h-8 px-3 rounded-sm text-xs font-medium text-text-secondary border border-border cursor-pointer hover:bg-surface transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleAskMentor}
                  disabled={!questionTitle.trim() || !questionContent.trim()}
                  className="h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Kirim
                </button>
              </div>
            </Card>
          )}

          {(MOCK_QUESTIONS[id] ?? []).length > 0 ? (
            (MOCK_QUESTIONS[id] ?? []).map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare size={28} className="mx-auto text-text-secondary/30 mb-2" />
              <p className="text-xs text-text-secondary">Belum ada pertanyaan</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <GraduationCap size={36} className="mx-auto text-text-secondary/30 mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Belum Ada Mentor</h3>
          <p className="text-xs text-text-secondary mt-1">Circle ini belum memiliki mentor. Pantau terus untuk pembaruan.</p>
        </div>
      )}
    </div>
  );

  // ─── Members Tab ────────────────────────────────────────────────────────

  const membersTab = (
    <div className="px-6 py-4 space-y-1">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-secondary">
          {circle.memberCount} dari {circle.maxMembers} anggota
        </p>
        <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(circle.memberCount / circle.maxMembers) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-0.5">
        {circle.members.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 p-2.5 rounded-sm hover:bg-surface/50 transition-colors"
          >
            <Avatar initials={m.initials} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary">
                  {m.name}
                  {m.id === CURRENT_USER.id && (
                    <span className="text-text-secondary font-normal"> (Kamu)</span>
                  )}
                </span>
                {m.role === "Co-Host" && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 leading-none">Co-Host</Badge>
                )}
                {m.isMentor && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none bg-accent text-accent-foreground">Mentor</Badge>
                )}
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500" title="Online" />
          </div>
        ))}
      </div>

      {circle.maxMembers - circle.memberCount > 0 && (
        <div className="mt-4 p-3 rounded-sm border border-dashed border-border text-center">
          <p className="text-xs text-text-secondary">
            {circle.maxMembers - circle.memberCount} slot tersedia
          </p>
        </div>
      )}
    </div>
  );

  // ─── Sessions Tab ───────────────────────────────────────────────────────

  const circleSessions = MOCK_SESSIONS[id] ?? [];
  const upcomingSessions = circleSessions.filter((s) => s.status === "upcoming");
  const pastSessions = circleSessions.filter((s) => s.status === "completed" || s.status === "cancelled");

  const sessionsTab = (
    <div className="px-6 py-4 space-y-4">
      {upcomingSessions.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-text-primary mb-3">Sesi Mendatang</h3>
          <div className="space-y-3">
            {upcomingSessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {pastSessions.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-text-primary mb-3">Sesi Sebelumnya</h3>
          <div className="space-y-3">
            {pastSessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        </section>
      )}

      {circleSessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar size={36} className="mx-auto text-text-secondary/30 mb-3" />
          <h3 className="text-sm font-bold text-text-primary">Belum Ada Sesi</h3>
          <p className="text-xs text-text-secondary mt-1">Pantau terus untuk sesi mendatang dari mentor.</p>
        </div>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto">
        {header}
        {tabBar}

        {activeTab === "chat" && chatTab}
        {activeTab === "mentor" && mentorTab}
        {activeTab === "members" && membersTab}
        {activeTab === "sessions" && sessionsTab}
      </div>
    </div>
  );
}
