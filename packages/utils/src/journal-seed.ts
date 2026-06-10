import type { Journal, JournalEntry, JournalMilestone } from "@beautifio/types";

export const MOOD_OPTIONS = [
  { value: "sangat_bahagia", label: "Sangat Bahagia", emoji: "🌟" },
  { value: "bahagia", label: "Bahagia", emoji: "😊" },
  { value: "biasa", label: "Biasa", emoji: "😐" },
  { value: "sedih", label: "Sedih", emoji: "😢" },
  { value: "sangat_sedih", label: "Sangat Sedih", emoji: "😭" },
] as const;

export const JOURNAL_CATEGORIES = [
  { value: "karir", label: "Karir", emoji: "💼" },
  { value: "pendidikan", label: "Pendidikan", emoji: "📚" },
  { value: "skill", label: "Skill", emoji: "💪" },
  { value: "bisnis", label: "Bisnis", emoji: "📈" },
  { value: "kesehatan", label: "Kesehatan", emoji: "🏃" },
  { value: "personal", label: "Personal", emoji: "🧠" },
] as const;

export const MOCK_JOURNALS: Journal[] = [
  {
    id: "jrnl-1",
    user_id: "u1",
    title: "Road to Medical School",
    slug: "road-to-medical-school",
    description: "Perjalanan saya mempersiapkan diri masuk fakultas kedokteran. Dari belajar biologi, kimia, hingga mengikuti try out.",
    cover_image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80",
    goal_category: "pendidikan",
    roadmap_slug: "doctor",
    is_public: true,
    entry_count: 12,
    follower_count: 45,
    reaction_count: 128,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
    author_name: "Andini Putri",
    author_initials: "AP",
  },
  {
    id: "jrnl-2",
    user_id: "u2",
    title: "My Running Journey",
    slug: "my-running-journey",
    description: "Dari tidak bisa lari 1km sampai finis half marathon. Catatan latihan, nutrisi, dan mental journey.",
    cover_image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    goal_category: "kesehatan",
    roadmap_slug: "runner",
    is_public: true,
    entry_count: 28,
    follower_count: 67,
    reaction_count: 234,
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-06-11T00:00:00Z",
    author_name: "Budi Santoso",
    author_initials: "BS",
  },
  {
    id: "jrnl-3",
    user_id: "u3",
    title: "Learning Coding From Zero",
    slug: "learning-coding-from-zero",
    description: "Dokumentasi belajar coding dari nol. Target jadi full-stack developer dalam 1 tahun.",
    cover_image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80",
    goal_category: "skill",
    roadmap_slug: "programmer",
    is_public: true,
    entry_count: 45,
    follower_count: 89,
    reaction_count: 345,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-06-11T00:00:00Z",
    author_name: "Citra Dewi",
    author_initials: "CD",
  },
  {
    id: "jrnl-4",
    user_id: "u4",
    title: "Building a Business",
    slug: "building-a-business",
    description: "Perjalanan membangun startup dari ide hingga pendanaan pertama. Setiap pelajaran dan kegagalan dicatat di sini.",
    cover_image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80",
    goal_category: "bisnis",
    roadmap_slug: "entrepreneur",
    is_public: true,
    entry_count: 18,
    follower_count: 34,
    reaction_count: 156,
    created_at: "2026-04-01T00:00:00Z",
    updated_at: "2026-06-09T00:00:00Z",
    author_name: "Dimas Pratama",
    author_initials: "DP",
  },
  {
    id: "jrnl-5",
    user_id: "u5",
    title: "Becoming a Content Creator",
    slug: "becoming-a-content-creator",
    description: "Dari 0 followers sampai monetisasi. Tips, tools, dan strategi konten yang saya pakai.",
    cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
    goal_category: "karir",
    roadmap_slug: "content-creator",
    is_public: false,
    entry_count: 32,
    follower_count: 12,
    reaction_count: 89,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-06-10T00:00:00Z",
    author_name: "Rina Wijaya",
    author_initials: "RW",
  },
];

export const MOCK_JOURNAL_ENTRIES: Record<string, JournalEntry[]> = {
  "road-to-medical-school": [
    { id: "je-1", journal_id: "jrnl-1", title: "Hari Pertama: Mulai Belajar", content: "Hari ini saya mulai belajar biologi untuk persiapan masuk kedokteran. Saya buat jadwal belajar: pagi baca materi, siang latihan soal, malam review. Target belajar 6 jam sehari.", mood: "bahagia", day_number: 1, created_at: "2026-03-01T08:00:00Z", updated_at: "2026-03-01T08:00:00Z" },
    { id: "je-2", journal_id: "jrnl-1", title: "Try Out Pertama", content: "Ikut try out online hari ini. Skor masih 520, target minimal 600. Perlu banyak belajar kimia organik dan fisika. Semangat!", mood: "biasa", day_number: 7, created_at: "2026-03-07T10:00:00Z", updated_at: "2026-03-07T10:00:00Z" },
    { id: "je-3", journal_id: "jrnl-1", title: "Belajar Kelompok", content: "Bergabung dengan grup belajar. Ternyata belajar bareng lebih menyenangkan. Kita bahas soal-soal UTUL UGM dan SIMAK UI.", mood: "bahagia", day_number: 15, created_at: "2026-03-15T14:00:00Z", updated_at: "2026-03-15T14:00:00Z" },
    { id: "je-4", journal_id: "jrnl-1", title: "Progress Signifikan", content: "Setelah sebulan belajar, skor try out naik jadi 560. Masih kurang 40 poin tapi progressnya bagus. Tetap konsisten!", mood: "sangat_bahagia", day_number: 30, created_at: "2026-03-30T09:00:00Z", updated_at: "2026-03-30T09:00:00Z" },
    { id: "je-5", journal_id: "jrnl-1", title: "Hampir Menyerah", content: "Hari ini rasanya sangat berat. Materi fisika sulit dipahami. Rasanya ingin berhenti. Tapi saya ingat mimpi jadi dokter. Istirahat dulu, besok lanjut lagi.", mood: "sedih", day_number: 45, created_at: "2026-04-14T20:00:00Z", updated_at: "2026-04-14T20:00:00Z" },
    { id: "je-6", journal_id: "jrnl-1", title: "Bangkit Lagi", content: "Setelah istirahat 2 hari, saya merasa lebih baik. Saya coba pendekatan belajar baru: video animasi untuk fisika. Ternyata lebih mudah dipahami!", mood: "bahagia", day_number: 48, created_at: "2026-04-17T10:00:00Z", updated_at: "2026-04-17T10:00:00Z" },
    { id: "je-7", journal_id: "jrnl-1", title: "Try Out Bulan Kedua", content: "Skor naik jadi 580! Hampir mencapai target. Tinggal 20 poin lagi. Saya yakin bisa tembus 600 bulan depan.", mood: "sangat_bahagia", day_number: 60, created_at: "2026-04-30T11:00:00Z", updated_at: "2026-04-30T11:00:00Z" },
    { id: "je-8", journal_id: "jrnl-1", title: "Belajar Biologi Sel", content: "Hari ini fokus belajar biologi sel. Materi yang cukup rumit tapi saya buat mind map untuk mempermudah. Suka banget sama biologi!", mood: "bahagia", day_number: 75, created_at: "2026-05-15T09:00:00Z", updated_at: "2026-05-15T09:00:00Z" },
    { id: "je-9", journal_id: "jrnl-1", title: "Target Tercapai!", content: "SKOR 605! Akhirnya tembus juga target 600+. Rasanya pengen nangis bahagia. Perjuangan 3 bulan tidak sia-sia. Lanjut ke target berikutnya: 650!", mood: "sangat_bahagia", day_number: 90, created_at: "2026-05-30T12:00:00Z", updated_at: "2026-05-30T12:00:00Z" },
    { id: "je-10", journal_id: "jrnl-1", title: "Persiapan Ujian Mandiri", content: "Sekarang fokus persiapan ujian mandiri PTN. Soal-soal lebih bervariasi. Saya beli buku bank soal terbaru.", mood: "biasa", day_number: 100, created_at: "2026-06-09T08:00:00Z", updated_at: "2026-06-09T08:00:00Z" },
  ],
  "my-running-journey": [
    { id: "je-11", journal_id: "jrnl-2", title: "Lari Pertama: 500m", content: "Hari pertama lari. Saya cuma bisa lari 500m sebelum kehabisan napas. Jauh dari target 5K. Tapi harus mulai dari suatu tempat.", mood: "biasa", day_number: 1, created_at: "2026-01-15T06:00:00Z", updated_at: "2026-01-15T06:00:00Z" },
    { id: "je-12", journal_id: "jrnl-2", title: "1km! Ada Progress", content: "Hari ini berhasil lari 1km non-stop! Meskipun lambat, tapi ini progress besar dari 500m. Rasanya lega banget.", mood: "bahagia", day_number: 14, created_at: "2026-01-28T06:30:00Z", updated_at: "2026-01-28T06:30:00Z" },
    { id: "je-13", journal_id: "jrnl-2", title: "5K Pertama!", content: "TIDAK NYANGKA! Selesai lari 5km dalam 35 menit. Awalnya saya pikir tidak akan bisa. Ternyata tubuh saya mampu lebih dari yang saya kira.", mood: "sangat_bahagia", day_number: 60, created_at: "2026-03-15T07:00:00Z", updated_at: "2026-03-15T07:00:00Z" },
    { id: "je-14", journal_id: "jrnl-2", title: "Injury", content: "Dapat cedera shin splints karena terlalu memaksa. Harus istirahat seminggu. Ini pelajaran penting: jangan lupakan recovery.", mood: "sangat_sedih", day_number: 75, created_at: "2026-03-30T08:00:00Z", updated_at: "2026-03-30T08:00:00Z" },
    { id: "je-15", journal_id: "jrnl-2", title: "Comeback", content: "Setelah istirahat dan stretching rutin, hari ini lari lagi. Hanya 3km tapi rasanya luar biasa. Rindu banget lari!", mood: "bahagia", day_number: 85, created_at: "2026-04-10T06:00:00Z", updated_at: "2026-04-10T06:00:00Z" },
    { id: "je-16", journal_id: "jrnl-2", title: "Half Marathon! 21K!", content: "FINISH! Half marathon pertama saya! Waktu 2 jam 15 menit. Air mata jatuh di garis finish. Perjalanan 4 bulan terbayar lunas.", mood: "sangat_bahagia", day_number: 120, created_at: "2026-05-15T10:00:00Z", updated_at: "2026-05-15T10:00:00Z" },
    { id: "je-17", journal_id: "jrnl-2", title: "Target Baru: Marathon", content: "Setelah sukses half marathon, target berikutnya marathon penuh (42km). Mulai program latihan 16 minggu minggu depan!", mood: "bahagia", day_number: 130, created_at: "2026-05-25T09:00:00Z", updated_at: "2026-05-25T09:00:00Z" },
  ],
  "learning-coding-from-zero": [
    { id: "je-18", journal_id: "jrnl-3", title: "Halo, Dunia!", content: "Hari pertama belajar JavaScript. Mulai dari console.log('Hello World'). Sederhana tapi ini awal dari perjalanan panjang.", mood: "bahagia", day_number: 1, created_at: "2026-02-01T09:00:00Z", updated_at: "2026-02-01T09:00:00Z" },
    { id: "je-19", journal_id: "jrnl-3", title: "Struggle dengan Array", content: "Array methods bikin pusing. Map, filter, reduce konsepnya masih abstrak. Tapi saya tonton video tutorial ulang sampai paham.", mood: "sedih", day_number: 10, created_at: "2026-02-10T10:00:00Z", updated_at: "2026-02-10T10:00:00Z" },
    { id: "je-20", journal_id: "jrnl-3", title: "AHA Moment!", content: "Setelah 3 hari perjuangan, akhirnya paham juga konsep closure! Rasanya puas banget. Coding itu seperti puzzle, menantang tapi seru!", mood: "sangat_bahagia", day_number: 25, created_at: "2026-02-25T15:00:00Z", updated_at: "2026-02-25T15:00:00Z" },
    { id: "je-21", journal_id: "jrnl-3", title: "Project Pertama: Todo App", content: "Selesai bikin todo app sederhana pakai vanilla JS. Tidak ada yang istimewa, tapi ini project pertama saya. Bangga!", mood: "bahagia", day_number: 40, created_at: "2026-03-12T16:00:00Z", updated_at: "2026-03-12T16:00:00Z" },
    { id: "je-22", journal_id: "jrnl-3", title: "Mulai React", content: "Mulai belajar React. Konsep komponen dan state management agak membingungkan. Tapi saya suka bagaimana React membuat UI lebih terstruktur.", mood: "biasa", day_number: 60, created_at: "2026-04-01T10:00:00Z", updated_at: "2026-04-01T10:00:00Z" },
    { id: "je-23", journal_id: "jrnl-3", title: "React Click!", content: "Akhirnya paham hooks! useState, useEffect, useContext. Bikin project cuaca app pakai API. Hidup lebih berwarna dengan React!", mood: "sangat_bahagia", day_number: 80, created_at: "2026-04-21T14:00:00Z", updated_at: "2026-04-21T14:00:00Z" },
    { id: "je-24", journal_id: "jrnl-3", title: "Backend dengan Node.js", content: "Mulai belajar backend. Express.js dan MongoDB. Bikin REST API sederhana. Senang bisa lihat data mengalir dari frontend ke database.", mood: "bahagia", day_number: 100, created_at: "2026-05-11T11:00:00Z", updated_at: "2026-05-11T11:00:00Z" },
    { id: "je-25", journal_id: "jrnl-3", title: "Full Stack Project", content: "Mulai bikin full stack project: e-commerce sederhana. React frontend, Express backend, MongoDB database. Seru dan banyak belajar.", mood: "bahagia", day_number: 120, created_at: "2026-05-31T13:00:00Z", updated_at: "2026-05-31T13:00:00Z" },
    { id: "je-26", journal_id: "jrnl-3", title: "Deploy ke Vercel & Railway", content: "Deploy project pertama! Frontend ke Vercel, backend ke Railway. Rasanya luar biasa bisa lihat aplikasi sendiri online.", mood: "sangat_bahagia", day_number: 130, created_at: "2026-06-10T15:00:00Z", updated_at: "2026-06-10T15:00:00Z" },
  ],
  "building-a-business": [
    { id: "je-27", journal_id: "jrnl-4", title: "Ide Bisnis", content: "Dapat ide bisnis dari masalah sehari-hari: aplikasi manajemen tugas untuk mahasiswa. Riset pasar menunjukkan banyak mahasiswa butuh ini.", mood: "bahagia", day_number: 1, created_at: "2026-04-01T09:00:00Z", updated_at: "2026-04-01T09:00:00Z" },
    { id: "je-28", journal_id: "jrnl-4", title: "Validasi Ide", content: "Survey ke 50 mahasiswa. 70% bilang tertarik pakai aplikasi ini. Validasi awal cukup positif. Lanjut ke pembuatan MVP!", mood: "bahagia", day_number: 14, created_at: "2026-04-14T10:00:00Z", updated_at: "2026-04-14T10:00:00Z" },
    { id: "je-29", journal_id: "jrnl-4", title: "MVP Selesai!", content: "Setelah 3 minggu coding, MVP selesai! Fitur utama: create task, deadline, share ke teman. Belum sempurna tapi functional.", mood: "sangat_bahagia", day_number: 30, created_at: "2026-04-30T18:00:00Z", updated_at: "2026-04-30T18:00:00Z" },
    { id: "je-30", journal_id: "jrnl-4", title: "User Pertama!", content: "Dapat 10 user pertama dari circle pertemanan. Feedback: UI perlu diperbaiki, tapi konsepnya bagus. Semangat iterasi!", mood: "bahagia", day_number: 45, created_at: "2026-05-15T10:00:00Z", updated_at: "2026-05-15T10:00:00Z" },
    { id: "je-31", journal_id: "jrnl-4", title: "Tantangan Monetisasi", content: "Bingung mau monetisasi bagaimana. Gratis semua, server cost jalan terus. Harus cari model bisnis yang tepat. Mikir keras!", mood: "sedih", day_number: 60, created_at: "2026-05-30T20:00:00Z", updated_at: "2026-05-30T20:00:00Z" },
    { id: "je-32", journal_id: "jrnl-4", title: "Freemium Model", content: "Putuskan pakai model freemium: fitur dasar gratis, premium untuk analitik dan kolaborasi tim. Semoga ini keputusan yang tepat.", mood: "biasa", day_number: 70, created_at: "2026-06-09T11:00:00Z", updated_at: "2026-06-09T11:00:00Z" },
  ],
  "becoming-a-content-creator": [
    { id: "je-33", journal_id: "jrnl-5", title: "Niche: Tech Education", content: "Setelah bingung milih niche, akhirnya pilih tech education. Mau bikin konten tutorial coding yang mudah dipahami pemula.", mood: "bahagia", day_number: 1, created_at: "2026-01-01T10:00:00Z", updated_at: "2026-01-01T10:00:00Z" },
    { id: "je-34", journal_id: "jrnl-5", title: "Posting Pertama", content: "Posting video pertama di TikTok: 'Tips belajar coding untuk pemula'. Dapat 200 views. Lumayan untuk pertama kali!", mood: "bahagia", day_number: 7, created_at: "2026-01-07T12:00:00Z", updated_at: "2026-01-07T12:00:00Z" },
    { id: "je-35", journal_id: "jrnl-5", title: "Viral? Belum", content: "1 bulan, 30 video, cuma 500 followers. Rasanya pengen berhenti. Tapi saya ingat kenapa mulai: membantu orang belajar coding.", mood: "sedih", day_number: 35, created_at: "2026-02-04T20:00:00Z", updated_at: "2026-02-04T20:00:00Z" },
    { id: "je-36", journal_id: "jrnl-5", title: "Breakthrough!", content: "Salah satu video tiba-tiba 50K views! Followers naik dari 500 ke 3000 dalam seminggu. Konten tentang 'HTML dalam 1 menit' ternyata disukai!", mood: "sangat_bahagia", day_number: 60, created_at: "2026-03-01T08:00:00Z", updated_at: "2026-03-01T08:00:00Z" },
    { id: "je-37", journal_id: "jrnl-5", title: "10K Followers!", content: "Tiga bulan dan akhirnya tembus 10K followers! Dapat email dari brand untuk endorsement pertama. Ini mimpi yang jadi nyata.", mood: "sangat_bahagia", day_number: 90, created_at: "2026-03-31T09:00:00Z", updated_at: "2026-03-31T09:00:00Z" },
    { id: "je-38", journal_id: "jrnl-5", title: "Konsisten Adalah Kunci", content: "Hari ke-120 dan saya masih konsisten posting. Followers sekarang 25K. Pendapatan dari endorsement mulai mengalir. Percaya sama proses!", mood: "bahagia", day_number: 120, created_at: "2026-04-30T10:00:00Z", updated_at: "2026-04-30T10:00:00Z" },
  ],
};

export const MOCK_JOURNAL_MILESTONES: Record<string, JournalMilestone[]> = {
  "road-to-medical-school": [
    { id: "jm-1", journal_id: "jrnl-1", title: "Skor Try Out 550+", description: "Mencapai skor try out minimal 550", is_achieved: true, achieved_at: "2026-03-30T00:00:00Z", created_at: "2026-03-01T00:00:00Z" },
    { id: "jm-2", journal_id: "jrnl-1", title: "Skor Try Out 600+", description: "Mencapai skor try out minimal 600", is_achieved: true, achieved_at: "2026-05-30T00:00:00Z", created_at: "2026-03-01T00:00:00Z" },
    { id: "jm-3", journal_id: "jrnl-1", title: "Skor Try Out 650+", description: "Mencapai skor try out minimal 650", is_achieved: false, created_at: "2026-03-01T00:00:00Z" },
    { id: "jm-4", journal_id: "jrnl-1", title: "Lolos Seleksi Kedokteran", description: "Diterima di fakultas kedokteran PTN", is_achieved: false, created_at: "2026-03-01T00:00:00Z" },
  ],
  "my-running-journey": [
    { id: "jm-5", journal_id: "jrnl-2", title: "Lari 1km Non-stop", description: "Mampu berlari 1km tanpa berhenti", is_achieved: true, achieved_at: "2026-01-28T00:00:00Z", created_at: "2026-01-15T00:00:00Z" },
    { id: "jm-6", journal_id: "jrnl-2", title: "Lari 5km", description: "Menyelesaikan lari 5km", is_achieved: true, achieved_at: "2026-03-15T00:00:00Z", created_at: "2026-01-15T00:00:00Z" },
    { id: "jm-7", journal_id: "jrnl-2", title: "Half Marathon (21km)", description: "Finish half marathon pertama", is_achieved: true, achieved_at: "2026-05-15T00:00:00Z", created_at: "2026-01-15T00:00:00Z" },
    { id: "jm-8", journal_id: "jrnl-2", title: "Full Marathon (42km)", description: "Finish marathon penuh", is_achieved: false, created_at: "2026-01-15T00:00:00Z" },
  ],
  "learning-coding-from-zero": [
    { id: "jm-9", journal_id: "jrnl-3", title: "JavaScript Dasar", description: "Kuasai dasar JavaScript", is_achieved: true, achieved_at: "2026-03-01T00:00:00Z", created_at: "2026-02-01T00:00:00Z" },
    { id: "jm-10", journal_id: "jrnl-3", title: "React Dasar", description: "Paham React dan hooks", is_achieved: true, achieved_at: "2026-04-21T00:00:00Z", created_at: "2026-02-01T00:00:00Z" },
    { id: "jm-11", journal_id: "jrnl-3", title: "Backend Dasar", description: "Kuasai Node.js dan database", is_achieved: false, created_at: "2026-02-01T00:00:00Z" },
    { id: "jm-12", journal_id: "jrnl-3", title: "Full Stack Project", description: "Selesaikan full stack project", is_achieved: false, created_at: "2026-02-01T00:00:00Z" },
  ],
  "building-a-business": [
    { id: "jm-13", journal_id: "jrnl-4", title: "Validasi Ide", description: "Validasi ide dengan 50+ responden", is_achieved: true, achieved_at: "2026-04-14T00:00:00Z", created_at: "2026-04-01T00:00:00Z" },
    { id: "jm-14", journal_id: "jrnl-4", title: "MVP Launch", description: "Meluncurkan MVP ke publik", is_achieved: true, achieved_at: "2026-04-30T00:00:00Z", created_at: "2026-04-01T00:00:00Z" },
    { id: "jm-15", journal_id: "jrnl-4", title: "100 User", description: "Mendapatkan 100 pengguna aktif", is_achieved: false, created_at: "2026-04-01T00:00:00Z" },
    { id: "jm-16", journal_id: "jrnl-4", title: "Break-even", description: "Pendapatan mencapai break-even", is_achieved: false, created_at: "2026-04-01T00:00:00Z" },
  ],
  "becoming-a-content-creator": [
    { id: "jm-17", journal_id: "jrnl-5", title: "1.000 Followers", description: "Mencapai 1.000 followers", is_achieved: true, achieved_at: "2026-02-15T00:00:00Z", created_at: "2026-01-01T00:00:00Z" },
    { id: "jm-18", journal_id: "jrnl-5", title: "10.000 Followers", description: "Mencapai 10.000 followers", is_achieved: true, achieved_at: "2026-03-31T00:00:00Z", created_at: "2026-01-01T00:00:00Z" },
    { id: "jm-19", journal_id: "jrnl-5", title: "Endorsement Pertama", description: "Mendapat endorsement berbayar", is_achieved: true, achieved_at: "2026-04-15T00:00:00Z", created_at: "2026-01-01T00:00:00Z" },
    { id: "jm-20", journal_id: "jrnl-5", title: "50.000 Followers", description: "Mencapai 50.000 followers", is_achieved: false, created_at: "2026-01-01T00:00:00Z" },
  ],
};

const STORAGE_KEY = "beautifio_journals";

export function getStoredJournals(): Journal[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveJournal(journal: Journal): void {
  if (typeof window === "undefined") return;
  try {
    const items = getStoredJournals();
    const idx = items.findIndex((j) => j.id === journal.id);
    if (idx >= 0) items[idx] = journal;
    else items.unshift(journal);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function getAllJournals(): Journal[] {
  return [...MOCK_JOURNALS, ...getStoredJournals()];
}

export function getJournalBySlug(slug: string): Journal | undefined {
  return getAllJournals().find((j) => j.slug === slug);
}

export function storeJournalEntry(journalSlug: string, entry: JournalEntry): void {
  if (typeof window === "undefined") return;
  try {
    const key = `beautifio_journal_entries_${journalSlug}`;
    const stored = localStorage.getItem(key);
    const entries: JournalEntry[] = stored ? JSON.parse(stored) : [];
    entries.unshift(entry);
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {}
}

export function getAllEntries(journalSlug: string): JournalEntry[] {
  const key = `beautifio_journal_entries_${journalSlug}`;
  const seed = MOCK_JOURNAL_ENTRIES[journalSlug] ?? [];
  if (typeof window === "undefined") return seed;
  try {
    const stored = localStorage.getItem(key);
    const userEntries: JournalEntry[] = stored ? JSON.parse(stored) : [];
    return [...seed, ...userEntries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch {
    return seed;
  }
}

export function storeJournalMilestone(journalSlug: string, milestone: JournalMilestone): void {
  if (typeof window === "undefined") return;
  try {
    const key = `beautifio_journal_milestones_${journalSlug}`;
    const stored = localStorage.getItem(key);
    const milestones: JournalMilestone[] = stored ? JSON.parse(stored) : [];
    const idx = milestones.findIndex((m) => m.id === milestone.id);
    if (idx >= 0) milestones[idx] = milestone;
    else milestones.push(milestone);
    localStorage.setItem(key, JSON.stringify(milestones));
  } catch {}
}

export function getAllMilestones(journalSlug: string): JournalMilestone[] {
  const key = `beautifio_journal_milestones_${journalSlug}`;
  const seed = MOCK_JOURNAL_MILESTONES[journalSlug] ?? [];
  if (typeof window === "undefined") return seed;
  try {
    const stored = localStorage.getItem(key);
    const userMilestones: JournalMilestone[] = stored ? JSON.parse(stored) : [];
    return [...seed, ...userMilestones];
  } catch {
    return seed;
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
