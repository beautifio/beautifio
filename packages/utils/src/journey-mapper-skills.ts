import type { JmHardSkill, JmSoftSkill } from "./journey-mapper-types";

export const JM_HARD_SKILLS: JmHardSkill[] = [
  { code: "HS01", name: "Fotografi", category: "Visual", description: "Mengambil foto dengan teknik dan komposisi yang baik", tools: "Kamera DSLR/mirrorless, Lightroom, Photoshop" },
  { code: "HS02", name: "Videografi", category: "Visual", description: "Merekam video profesional — teknik, angle, pencahayaan", tools: "Kamera cinema, DJI, GoPro" },
  { code: "HS03", name: "Editing Video", category: "Visual", description: "Menyunting dan merangkai footage menjadi konten final", tools: "Premiere Pro, CapCut, DaVinci Resolve, Final Cut" },
  { code: "HS04", name: "Desain Grafis", category: "Visual", description: "Membuat elemen visual — logo, poster, infografis, layout", tools: "Canva, Adobe Illustrator, Photoshop, Figma" },
  { code: "HS05", name: "Ilustrasi Digital", category: "Visual", description: "Membuat gambar dan ilustrasi menggunakan perangkat digital", tools: "Procreate, Clip Studio Paint, Adobe Fresco" },
  { code: "HS06", name: "Animasi 2D/3D", category: "Visual", description: "Menghidupkan karakter dan objek melalui animasi", tools: "After Effects, Blender, Maya, Spine" },
  { code: "HS07", name: "UI/UX Design", category: "Digital", description: "Merancang tampilan dan alur pengalaman produk digital", tools: "Figma, Adobe XD, Sketch, Maze" },
  { code: "HS08", name: "Copywriting", category: "Teks", description: "Menulis teks yang persuasif untuk iklan, landing page, kampanye", tools: "Google Docs, Jasper AI (referensi)" },
  { code: "HS09", name: "Penulisan Artikel / Jurnalistik", category: "Teks", description: "Menulis berita, feature, atau esai dengan struktur yang baik", tools: "Google Docs, WordPress, Medium" },
  { code: "HS10", name: "Penulisan Skenario", category: "Teks", description: "Menulis naskah dialog dan action untuk film, serial, atau panggung", tools: "Final Draft, Celtx, Highland" },
  { code: "HS11", name: "Social Media Management", category: "Digital", description: "Merencanakan, membuat, dan menganalisis konten media sosial", tools: "Meta Business Suite, Later, Hootsuite, Buffer" },
  { code: "HS12", name: "SEO / SEM", category: "Digital", description: "Mengoptimalkan konten agar mudah ditemukan di mesin pencari", tools: "Google Search Console, Ahrefs, SEMrush, Ubersuggest" },
  { code: "HS13", name: "Email Marketing", category: "Digital", description: "Membuat dan mengelola kampanye email untuk audiens", tools: "Mailchimp, Klaviyo, Brevo" },
  { code: "HS14", name: "Analisis Data", category: "Digital", description: "Mengolah dan menginterpretasi data untuk mendukung keputusan", tools: "Excel, Google Sheets, Tableau, Power BI" },
  { code: "HS15", name: "Data Science / Python", category: "Digital", description: "Menulis kode untuk analisis data, model statistik, dan machine learning", tools: "Python, Pandas, NumPy, scikit-learn" },
  { code: "HS16", name: "Coding / Web Development", category: "Digital", description: "Membangun website atau aplikasi web", tools: "HTML/CSS/JS, React, Next.js, Node.js" },
  { code: "HS17", name: "SQL / Database", category: "Digital", description: "Menulis query untuk mengambil dan memanipulasi data", tools: "PostgreSQL, MySQL, BigQuery, Supabase" },
  { code: "HS18", name: "Statistik Olahraga / Sport Analytics", category: "Olahraga", description: "Menganalisis performa pemain dan tim menggunakan data statistik", tools: "Wyscout, InStat, Opta, FBref, StatsBomb" },
  { code: "HS19", name: "Akuntansi & Keuangan Dasar", category: "Bisnis", description: "Mengelola pembukuan, laporan keuangan, dan arus kas", tools: "Excel, Accurate, QuickBooks, Xero" },
  { code: "HS20", name: "Manajemen Proyek", category: "Bisnis", description: "Merencanakan dan mengeksekusi proyek secara terstruktur", tools: "Notion, Trello, Asana, Monday.com" },
  { code: "HS21", name: "Riset Pasar", category: "Bisnis", description: "Mengumpulkan dan menganalisis data tentang pasar dan konsumen", tools: "Google Forms, SurveyMonkey, Typeform" },
  { code: "HS22", name: "Pitching & Proposal Bisnis", category: "Bisnis", description: "Membuat dan mempresentasikan proposal yang meyakinkan investor atau klien", tools: "Canva, PowerPoint, Google Slides" },
  { code: "HS23", name: "Event Management", category: "Bisnis", description: "Merancang, mengelola, dan mengevaluasi penyelenggaraan acara", tools: "Eventbrite, spreadsheet, timeline tools" },
  { code: "HS24", name: "Public Speaking", category: "Komunikasi", description: "Berbicara di depan umum dengan percaya diri dan efektif", tools: "Toastmasters, rekaman mandiri, kursus presentasi" },
  { code: "HS25", name: "Moderasi & Fasilitasi", category: "Komunikasi", description: "Memimpin diskusi, workshop, atau sesi pelatihan", tools: "Teknik fishbowl, design thinking, liberating structures" },
  { code: "HS26", name: "Wawancara & Riset Kualitatif", category: "Komunikasi", description: "Menggali informasi mendalam dari narasumber", tools: "Teknik jurnalistik, UX research method" },
  { code: "HS27", name: "Bahasa Inggris (Profesional)", category: "Bahasa", description: "Berkomunikasi secara lisan dan tertulis dalam konteks profesional", tools: "Duolingo, British Council, kursus IELTS/TOEFL" },
  { code: "HS28", name: "Bahasa Mandarin", category: "Bahasa", description: "Komunikasi dasar hingga lanjut dalam bahasa Mandarin", tools: "HelloChinese, Duolingo, kelas HSK" },
  { code: "HS29", name: "Bahasa Arab", category: "Bahasa", description: "Komunikasi dasar hingga lanjut dalam bahasa Arab", tools: "Babbel, kelas pesantren, kursus daring" },
  { code: "HS30", name: "Teknik Memasak (Dasar-Lanjut)", category: "Kuliner", description: "Menguasai teknik memasak berbagai metode — dari sauté hingga pastry", tools: "Le Cordon Bleu online, YouTube MasterClass" },
  { code: "HS31", name: "Food Styling & Plating", category: "Kuliner", description: "Menata makanan secara estetis untuk foto atau video", tools: "Kursus food styling, referensi Instagram chef" },
  { code: "HS32", name: "Nutrisi & Ilmu Gizi", category: "Kesehatan", description: "Memahami komposisi gizi makanan dan dampaknya pada tubuh", tools: "Textbook gizi, kursus nutrisi Coursera" },
  { code: "HS33", name: "Anatomi & Fisioterapi Dasar", category: "Kesehatan", description: "Memahami struktur tubuh dan prinsip dasar pemulihan cedera", tools: "Buku anatomi Gray, kursus fisio online" },
  { code: "HS34", name: "Penulisan Ilmiah / Riset Akademis", category: "Akademis", description: "Menulis paper, laporan riset, dan karya ilmiah dengan metodologi benar", tools: "Mendeley, Zotero, Google Scholar" },
  { code: "HS35", name: "Editing Foto (Post-Processing)", category: "Visual", description: "Menyunting foto dengan penyesuaian warna, eksposur, dan retouching", tools: "Lightroom, Photoshop, VSCO, Snapseed" },
  { code: "HS36", name: "Sound Engineering / Mixing", category: "Audio", description: "Merekam, mengedit, dan mencampur audio secara profesional", tools: "GarageBand, Logic Pro, Audacity, Pro Tools" },
  { code: "HS37", name: "Musikalitas & Teori Musik", category: "Seni", description: "Memahami harmoni, ritme, dan struktur lagu", tools: "Musescore, kelas teori musik online" },
  { code: "HS38", name: "Akting / Teknik Peran", category: "Seni", description: "Menghidupkan karakter secara meyakinkan di depan kamera atau panggung", tools: "Kelas akting, teknik Stanislavski, Meisner" },
  { code: "HS39", name: "Koreografi / Tari", category: "Seni", description: "Merancang gerakan tari untuk pertunjukan atau konten", tools: "Kelas tari, studio lokal, YouTube tutorials" },
  { code: "HS40", name: "Legal Literacy / Kontrak Dasar", category: "Hukum", description: "Memahami isi kontrak, hak, dan kewajiban dalam perjanjian", tools: "Kursus hukum dasar Coursera, PKPA online" },
  { code: "HS41", name: "Community Building", category: "Sosial", description: "Membangun dan mengembangkan komunitas yang aktif dan berkelanjutan", tools: "Playbook komunitas, CMX Community" },
  { code: "HS42", name: "Customer Service Excellence", category: "Bisnis", description: "Memberikan pengalaman layanan pelanggan yang luar biasa", tools: "Kursus service design, buku The Thank You Economy" },
  { code: "HS43", name: "Microsoft Office / Google Workspace", category: "Bisnis", description: "Menggunakan Word, Excel, PowerPoint, Docs, Sheets, Slides secara mahir", tools: "Kursus GCF Global, LinkedIn Learning" },
  { code: "HS44", name: "Photography Editing (Lightroom)", category: "Visual", description: "Mengedit foto dengan Lightroom secara profesional", tools: "Kursus Peter McKinnon, kanal YouTube PHLEARN" },
  { code: "HS45", name: "Sponsorship & Partnership Management", category: "Bisnis", description: "Mencari, negosiasi, dan mengelola hubungan sponsorship", tools: "Buku The Sponsorship Seeker's Toolkit" },
  { code: "HS46", name: "Broadcast & On-Camera Presenting", category: "Media", description: "Tampil percaya diri dan efektif di depan kamera atau mikrofon", tools: "Kelas presenting, kanal YouTube TV Presenter Training" },
  { code: "HS47", name: "Fashion Styling", category: "Kreatif", description: "Memilih dan menata pakaian untuk pemotretan, klien, atau konten", tools: "Magang stylist, referensi Pinterest & editorial" },
  { code: "HS48", name: "Pengelolaan Media Sosial Berbayar (Paid Ads)", category: "Digital", description: "Menjalankan iklan berbayar di Meta, TikTok, Google", tools: "Meta Blueprint, Google Ads certification" },
];

export const JM_SOFT_SKILLS: JmSoftSkill[] = [
  { code: "SS01", name: "Komunikasi Efektif", description: "Menyampaikan ide dengan jelas — lisan, tulisan, visual — ke berbagai audiens." },
  { code: "SS02", name: "Kepemimpinan", description: "Mengarahkan, menginspirasi, dan mengambil keputusan untuk tim atau komunitas." },
  { code: "SS03", name: "Kerja Tim / Kolaborasi", description: "Bekerja produktif bersama orang lain menuju tujuan bersama." },
  { code: "SS04", name: "Manajemen Waktu", description: "Mengatur prioritas dan menyelesaikan pekerjaan tepat waktu." },
  { code: "SS05", name: "Kreativitas & Inovasi", description: "Menghasilkan ide baru dan solusi yang tidak biasa untuk masalah yang ada." },
  { code: "SS06", name: "Problem Solving", description: "Mengidentifikasi akar masalah dan menemukan solusi yang efektif." },
  { code: "SS07", name: "Adaptabilitas", description: "Menyesuaikan diri dengan cepat terhadap perubahan situasi atau lingkungan." },
  { code: "SS08", name: "Empati", description: "Memahami dan merasakan perspektif orang lain — kunci dalam layanan dan kepemimpinan." },
  { code: "SS09", name: "Negosiasi", description: "Mencapai kesepakatan yang menguntungkan semua pihak secara win-win." },
  { code: "SS10", name: "Networking", description: "Membangun dan merawat hubungan profesional yang bermakna." },
  { code: "SS11", name: "Critical Thinking", description: "Menganalisis informasi secara objektif sebelum mengambil kesimpulan." },
  { code: "SS12", name: "Storytelling", description: "Menyampaikan pesan melalui cerita yang menarik dan berkesan." },
  { code: "SS13", name: "Resiliensi", description: "Bangkit dan terus melangkah setelah menghadapi kegagalan atau tekanan." },
  { code: "SS14", name: "Inisiatif & Proaktif", description: "Bertindak tanpa menunggu disuruh — melihat peluang dan langsung bergerak." },
  { code: "SS15", name: "Detail Oriented", description: "Memperhatikan hal-hal kecil yang sering diabaikan tapi penting." },
  { code: "SS16", name: "Empati Komersial", description: "Memahami kebutuhan pelanggan atau audiens dan menggunakannya sebagai dasar keputusan." },
  { code: "SS17", name: "Manajemen Konflik", description: "Mengelola ketidaksepakatan dan ketegangan dengan tenang dan konstruktif." },
  { code: "SS18", name: "Kecerdasan Emosional (EQ)", description: "Mengenali, memahami, dan mengelola emosi diri sendiri dan orang lain." },
  { code: "SS19", name: "Presentasi & Persuasi", description: "Menyampaikan ide di depan orang banyak dengan keyakinan yang memengaruhi." },
  { code: "SS20", name: "Curiosity (Rasa Ingin Tahu)", description: "Terus belajar, bertanya, dan mengeksplorasi hal baru secara mandiri." },
  { code: "SS21", name: "Disiplin & Konsistensi", description: "Menjaga komitmen dan menyelesaikan apa yang sudah dimulai." },
  { code: "SS22", name: "Kemampuan Menerima Feedback", description: "Menerima kritik secara terbuka dan menjadikannya bahan tumbuh." },
  { code: "SS23", name: "Berpikir Strategis", description: "Melihat gambaran besar, merencanakan langkah panjang, dan mengkoneksikan titik-titik." },
  { code: "SS24", name: "Integritas & Etika Profesional", description: "Bertindak jujur, bertanggung jawab, dan menjaga kepercayaan orang lain." },
];

export function getJmHardSkill(code: string): JmHardSkill | undefined {
  return JM_HARD_SKILLS.find((s) => s.code === code);
}

export function getJmSoftSkill(code: string): JmSoftSkill | undefined {
  return JM_SOFT_SKILLS.find((s) => s.code === code);
}

export function getJmHardSkillsByCategory(category: string): JmHardSkill[] {
  return JM_HARD_SKILLS.filter((s) => s.category === category);
}

export function resolveJmSkillCodes(codes: string[]): string[] {
  return codes.map((code) => {
    const h = getJmHardSkill(code);
    if (h) return h.name;
    const s = getJmSoftSkill(code);
    if (s) return s.name;
    return code;
  });
}
