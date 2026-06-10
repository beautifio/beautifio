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
import { ProtectedAction } from "@/components/ProtectedAction";

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
  "7": {
    id: "7",
    name: "Sports Arena",
    tag: "Olahraga",
    desc: "Komunitas olahraga dan kebugaran untuk atlet muda dan pecinta fitness. Lari, gym, basket, futsal, dan berbagai cabang olahraga.",
    memberCount: 11,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Fajar Hidayat", initials: "FH", expertise: "Personal Trainer & Atlet Nasional" },
    coverColor: "from-orange-500 to-red-500",
    members: [
      { id: "u1", name: "Andini Putri", initials: "AP", role: "Member" },
      { id: "u44", name: "Rizky Pratama", initials: "RP", role: "Co-Host" },
      { id: "u45", name: "Sinta Wahyuni", initials: "SW", role: "Member" },
      { id: "u46", name: "Tommy Gunawan", initials: "TG", role: "Member" },
      { id: "u47", name: "Ujang Komarudin", initials: "UK", role: "Member" },
      { id: "u48", name: "Vera Anggraini", initials: "VA", role: "Member" },
      { id: "u49", name: "Wawan Setiawan", initials: "WS", role: "Member" },
      { id: "u50", name: "Xena Mariana", initials: "XM", role: "Member" },
      { id: "u51", name: "Yoga Prasetya", initials: "YP", role: "Member" },
      { id: "u52", name: "Zara Amelia", initials: "ZA", role: "Member" },
      { id: "u53", name: "Adi Nugroho", initials: "AN", role: "Member" },
    ],
  },
  "8": {
    id: "8",
    name: "Music Collective",
    tag: "Musik",
    desc: "Berkarya, kolaborasi, dan tumbuh bareng sesama musisi dan pecinta musik. Dari teori hingga produksi dan performa.",
    memberCount: 8,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Kevin Alexander", initials: "KA", expertise: "Produser Musik & Gitaris Profesional" },
    coverColor: "from-purple-600 to-pink-500",
    members: [
      { id: "u54", name: "Bella Sakina", initials: "BS", role: "Co-Host" },
      { id: "u55", name: "Citra Lestari", initials: "CL", role: "Member" },
      { id: "u56", name: "Dani Permana", initials: "DP", role: "Member" },
      { id: "u57", name: "Erik Tohir", initials: "ET", role: "Member" },
      { id: "u58", name: "Fina Kurnia", initials: "FK", role: "Member" },
      { id: "u59", name: "Gilang Pratama", initials: "GP", role: "Member" },
      { id: "u60", name: "Hana Sofiana", initials: "HS", role: "Member" },
      { id: "u61", name: "Irfan Maulana", initials: "IM", role: "Member" },
    ],
  },
  "9": {
    id: "9",
    name: "Game Dev Guild",
    tag: "Gaming",
    desc: "Komunitas developer game dan esports. Diskusi tentang game design, programming, art, dan kompetisi esports.",
    memberCount: 10,
    maxMembers: 12,
    hasMentor: false,
    coverColor: "from-green-600 to-teal-400",
    members: [
      { id: "u62", name: "Joko Susanto", initials: "JS", role: "Co-Host" },
      { id: "u63", name: "Kiki Rizki", initials: "KR", role: "Member" },
      { id: "u64", name: "Lia Marlina", initials: "LM", role: "Member" },
      { id: "u65", name: "Miko Wardana", initials: "MW", role: "Member" },
      { id: "u66", name: "Nina Safitri", initials: "NS", role: "Member" },
      { id: "u67", name: "Oscar Pradana", initials: "OP", role: "Member" },
      { id: "u68", name: "Putri Aulia", initials: "PA", role: "Member" },
      { id: "u69", name: "Qory Febrina", initials: "QF", role: "Member" },
      { id: "u70", name: "Rangga Wiraguna", initials: "RW", role: "Member" },
      { id: "u71", name: "Siska Dewi", initials: "SD", role: "Member" },
    ],
  },
  "10": {
    id: "10",
    name: "Beauty Circle",
    tag: "Kecantikan",
    desc: "Sharing tips skincare, makeup, dan tren kecantikan terkini. Review produk, tutorial, dan diskusi rutin.",
    memberCount: 9,
    maxMembers: 12,
    hasMentor: false,
    coverColor: "from-rose-500 to-pink-400",
    members: [
      { id: "u72", name: "Tasya Kirana", initials: "TK", role: "Co-Host" },
      { id: "u73", name: "Ulan Sari", initials: "US", role: "Member" },
      { id: "u74", name: "Vivi Mariana", initials: "VM", role: "Member" },
      { id: "u75", name: "Wida Ningsih", initials: "WN", role: "Member" },
      { id: "u76", name: "Yuni Astuti", initials: "YA", role: "Member" },
      { id: "u77", name: "Zahra Aulia", initials: "ZA", role: "Member" },
      { id: "u78", name: "Ayu Permatasari", initials: "AP", role: "Member" },
      { id: "u79", name: "Bunga Citra", initials: "BC", role: "Member" },
      { id: "u80", name: "Cinta Laura", initials: "CL", role: "Member" },
    ],
  },
  "11": {
    id: "11",
    name: "Study Hub",
    tag: "Pendidikan",
    desc: "Belajar bareng, diskusi akademik, dan persiapan ujian masuk. Grup belajar intensif untuk SNBT, UTBK, dan ujian internasional.",
    memberCount: 12,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Bu Sari", initials: "SS", expertise: "Guru & Konsultan Pendidikan" },
    coverColor: "from-blue-500 to-indigo-600",
    members: [
      { id: "u81", name: "Dinda Permata", initials: "DP", role: "Co-Host" },
      { id: "u82", name: "Endah Lestari", initials: "EL", role: "Member", isMentor: true },
      { id: "u83", name: "Farhan Hidayat", initials: "FH", role: "Member" },
      { id: "u84", name: "Gita Puspita", initials: "GP", role: "Member" },
      { id: "u85", name: "Hendra Gunawan", initials: "HG", role: "Member" },
      { id: "u86", name: "Intan Permata", initials: "IP", role: "Member" },
      { id: "u87", name: "Juli Arifin", initials: "JA", role: "Member" },
      { id: "u88", name: "Kartika Sari", initials: "KS", role: "Member" },
      { id: "u89", name: "Lukman Hakim", initials: "LH", role: "Member" },
      { id: "u90", name: "Mira Yuliana", initials: "MY", role: "Member" },
      { id: "u91", name: "Nanda Putra", initials: "NP", role: "Member" },
      { id: "u92", name: "Ocha Ramadhani", initials: "OR", role: "Member" },
    ],
  },
  "12": {
    id: "12",
    name: "Career Boost",
    tag: "Karir",
    desc: "Persiapan karir, coaching CV, simulasi interview, dan networking profesional. Dapatkan bimbingan dari praktisi HR.",
    memberCount: 6,
    maxMembers: 12,
    hasMentor: true,
    mentor: { name: "Pak Budi", initials: "BB", expertise: "HR Director 15+ tahun" },
    coverColor: "from-primary to-secondary",
    members: [
      { id: "u93", name: "Rina Marlina", initials: "RM", role: "Co-Host" },
      { id: "u94", name: "Sabarudin", initials: "SA", role: "Member" },
      { id: "u95", name: "Tari Lestari", initials: "TL", role: "Member" },
      { id: "u96", name: "Umar Khayam", initials: "UK", role: "Member" },
      { id: "u97", name: "Vina Panduwinata", initials: "VP", role: "Member" },
      { id: "u98", name: "Willy Salim", initials: "WS", role: "Member" },
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
  "7": [
    { id: "m7", senderId: "u44", senderName: "Rizky Pratama", senderInitials: "RP", text: "Ada yang mau ikut lari pagi bareng akhir pekan ini?", time: "08:15", isToday: true },
    { id: "m8", senderId: "u1", senderName: "Andini Putri", senderInitials: "AP", text: "Aku mau! Biasanya lari di GBK, kamu di mana?", time: "08:18", isToday: true },
    { id: "m9", senderId: "u46", senderName: "Tommy Gunawan", senderInitials: "TG", text: "Gw join! Siapa tau bisa sekalian latihan sprint", time: "08:20", isToday: true },
  ],
  "8": [
    { id: "m10", senderId: "u54", senderName: "Bella Sakina", senderInitials: "BS", text: "Weekend ini ada open mic di kafe, siapa mau perform?", time: "10:30", isToday: true },
    { id: "m11", senderId: "u56", senderName: "Dani Permana", senderInitials: "DP", text: "Gue mau! Lagi siapin original song nih", time: "10:35", isToday: true },
    { id: "m12", senderId: "u58", senderName: "Fina Kurnia", senderInitials: "FK", text: "Seru! Aku bisa main keyboard kalo butuh additional", time: "10:40", isToday: true },
  ],
  "9": [
    { id: "m13", senderId: "u62", senderName: "Joko Susanto", senderInitials: "JS", text: "Ada yang tertarik bikin game jam bareng bulan depan?", time: "14:00", isToday: true },
    { id: "m14", senderId: "u65", senderName: "Miko Wardana", senderInitials: "MW", text: "Gue in! Udah punya konsep game puzzle edukasi", time: "14:05", isToday: true },
    { id: "m15", senderId: "u63", senderName: "Kiki Rizki", senderInitials: "KR", text: "Aku bisa bantu dari sisi art dan animasi", time: "14:10", isToday: true },
  ],
  "10": [
    { id: "m16", senderId: "u72", senderName: "Tasya Kirana", senderInitials: "TK", text: "Rekomendasi sunscreen buat kulit berminyak dong!", time: "11:20", isToday: true },
    { id: "m17", senderId: "u76", senderName: "Yuni Astuti", senderInitials: "YA", text: "Aku pake Skin Aqua UV, ringan dan nggak lengket", time: "11:25", isToday: true },
    { id: "m18", senderId: "u77", senderName: "Zahra Aulia", senderInitials: "ZA", text: "Setuju! Atau coba Azarine oil-free sunscreen", time: "11:30", isToday: true },
  ],
  "11": [
    { id: "m19", senderId: "u81", senderName: "Dinda Permata", senderInitials: "DP", text: "Ada yang udah daftar SNBT? Yuk sharing pengalaman!", time: "19:00", isToday: true },
    { id: "m20", senderId: "u83", senderName: "Farhan Hidayat", senderInitials: "FH", text: "Baru daftar kemarin. Yang paling susah itu soal penalaran matematika", time: "19:05", isToday: true },
    { id: "m21", senderId: "u85", senderName: "Hendra Gunawan", senderInitials: "HG", text: "Bikin grup belajar yuk, lesehan di perpus bareng", time: "19:10", isToday: true },
  ],
  "12": [
    { id: "m22", senderId: "u93", senderName: "Rina Marlina", senderInitials: "RM", text: "Siapa yang mau ikut simulasi interview besok?", time: "15:00", isToday: true },
    { id: "m23", senderId: "u95", senderName: "Tari Lestari", senderInitials: "TL", text: "Aku mau! Sekalian minta feedback CV aku dong", time: "15:05", isToday: true },
    { id: "m24", senderId: "u94", senderName: "Sabarudin", senderInitials: "SA", text: "Count me in! Butuh banget latihan interview bahasa Inggris", time: "15:10", isToday: true },
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
  "7": [
    { id: "q5", user: "Vera Anggraini", initials: "VA", title: "Cara mulai lari untuk pemula?", content: "Saya belum pernah lari rutin. Mulai dari jarak berapa dan seberapa sering?", answers: 2, time: "1 hari lalu" },
  ],
  "8": [
    { id: "q6", user: "Erik Tohir", initials: "ET", title: "Rekomendasi DAW gratis untuk produksi musik?", content: "Mau mulai produksi musik sendiri tapi budget terbatas. Ada rekomendasi DAW?", answers: 1, time: "2 hari lalu" },
  ],
  "10": [
    { id: "q7", user: "Wida Ningsih", initials: "WN", title: "Skincare routine untuk kulit kombinasi?", content: "Kulit aku T-zone berminyak tapi pipi kering. Produk apa yang cocok?", answers: 3, time: "4 hari lalu" },
  ],
  "11": [
    { id: "q8", user: "Gita Puspita", initials: "GP", title: "Tips lolos SNBT 2026?", content: "Bingung cara belajar efektif buat SNBT. Ada tips dari kakak kelas?", answers: 2, time: "5 hari lalu" },
  ],
  "12": [
    { id: "q9", user: "Tari Lestari", initials: "TL", title: "CV gap year gimana cara jelasinnya?", content: "Aku gap setahun abis lulus. Gimana cara ngejelasin di CV biar tetap profesional?", answers: 0, time: "2 hari lalu" },
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
  "7": [
    { id: "s4", title: "Lari Pagi Bareng Komunitas", desc: "Lari 5K santai keliling kota. Semua level diterima, dari pemula sampai mahir.", date: "14 Juni 2026", time: "06:00 - 08:00 WIB", status: "upcoming", mentor: "Fajar Hidayat", slots: 20 },
    { id: "s5", title: "Futsal Cup Antar Circle", desc: "Turnamen futsal antar circle di Beautifio. Bawa tim terbaikmu!", date: "21 Juni 2026", time: "09:00 - 15:00 WIB", status: "upcoming", mentor: "Fajar Hidayat", slots: 8 },
  ],
  "8": [
    { id: "s6", title: "Open Mic Night", desc: "Tampilkan bakat musikmu di open mic malam minggu. Solo, duo, atau band.", date: "13 Juni 2026", time: "19:00 - 22:00 WIB", status: "upcoming", mentor: "Kevin Alexander", slots: 10 },
  ],
  "11": [
    { id: "s7", title: "Try Out SNBT 2026", desc: "Simulasi ujian SNBT gratis dengan soal-soal prediksi terbaru.", date: "20 Juni 2026", time: "08:00 - 12:00 WIB", status: "upcoming", mentor: "Bu Sari", slots: 25 },
  ],
  "12": [
    { id: "s8", title: "CV & Interview Workshop", desc: "Sesi coaching CV dan simulasi interview bersama HR profesional.", date: "18 Juni 2026", time: "14:00 - 17:00 WIB", status: "upcoming", mentor: "Pak Budi", slots: 15 },
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
            <ProtectedAction label="Masuk untuk Mendaftar Sesi">
              <button className="mt-3 w-full h-9 text-sm font-medium rounded-sm bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                Daftar Sesi
              </button>
            </ProtectedAction>
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
          <ProtectedAction label="Masuk untuk Bergabung Circle">
            <button
              onClick={handleJoin}
              disabled={isFull}
              className="h-9 px-4 rounded-sm bg-white text-primary text-sm font-bold cursor-pointer hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <UserPlus size={16} />
              {isFull ? "Penuh" : "Gabung"}
            </button>
          </ProtectedAction>
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
          <ProtectedAction label="Masuk untuk Mengirim Pesan">
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-sm bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </ProtectedAction>
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
                <ProtectedAction label="Masuk untuk Bertanya ke Mentor">
                  <button
                    onClick={handleAskMentor}
                    disabled={!questionTitle.trim() || !questionContent.trim()}
                    className="h-8 px-3 rounded-sm bg-primary text-primary-foreground text-xs font-medium cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Kirim
                  </button>
                </ProtectedAction>
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
