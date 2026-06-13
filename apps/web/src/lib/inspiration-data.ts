export interface InspirationItem {
  id: string;
  slug: string;
  type: "story" | "article";
  title: string;
  excerpt: string;
  content: string;
  author: string;
  coverGradient: string;
  readingTime: number;
  dreamSlugs: string[];
  dreamEmoji?: string;
  tags: string[];
  publishedAt: string;
}

export interface DreamCategory {
  slug: string;
  label: string;
  emoji: string;
  dreams: { slug: string; title: string; emoji: string }[];
}

const DREAM_MAP: Record<string, { title: string; emoji: string; category: string }> = {
  doctor: { title: "Dokter", emoji: "🩺", category: "health" },
  entrepreneur: { title: "Entrepreneur", emoji: "💼", category: "business" },
  programmer: { title: "Programmer", emoji: "💻", category: "tech" },
  athlete: { title: "Atlet", emoji: "🏅", category: "sports" },
  musician: { title: "Musisi", emoji: "🎵", category: "creative" },
  "content-creator": { title: "Content Creator", emoji: "🎨", category: "creative" },
  "football-player": { title: "Pemain Bola", emoji: "⚽", category: "sports" },
  runner: { title: "Pelari", emoji: "🏃", category: "sports" },
  "digital-marketer": { title: "Digital Marketer", emoji: "📱", category: "business" },
};

export const DREAM_CATEGORIES: DreamCategory[] = [
  { slug: "sports", label: "Olahraga", emoji: "🏅", dreams: ["athlete", "football-player", "runner"].map((s) => ({ slug: s, ...DREAM_MAP[s] })) },
  { slug: "health", label: "Kesehatan", emoji: "🩺", dreams: ["doctor"].map((s) => ({ slug: s, ...DREAM_MAP[s] })) },
  { slug: "tech", label: "Teknologi", emoji: "💻", dreams: ["programmer"].map((s) => ({ slug: s, ...DREAM_MAP[s] })) },
  { slug: "business", label: "Bisnis", emoji: "💼", dreams: ["entrepreneur", "digital-marketer"].map((s) => ({ slug: s, ...DREAM_MAP[s] })) },
  { slug: "creative", label: "Kreatif", emoji: "🎨", dreams: ["musician", "content-creator"].map((s) => ({ slug: s, ...DREAM_MAP[s] })) },
];

const DATA: InspirationItem[] = [
  // ===== STORIES =====
  {
    id: "s1", slug: "dari-nol-sampai-pelanggan-pertama",
    type: "story", title: "Dari Nol Sampai Pelanggan Pertama",
    excerpt: "Cerita saya membangun usaha dari kamar kos. Modal nekat, hasil manis.",
    content: "Tiga tahun lalu saya duduk di kamar kos 3x3 sambil bengong. Lulus kuliah, belum dapat kerja. Modal hanya laptop seken dan koneksi WiFi yang suka putus.\n\n\nAwalnya saya coba jualan online. Stok barang? Nol. Saya pakai sistem pre-order. Beli barang setelah ada pesanan. Pelan-pelan, mulai dapat satu dua pelanggan.\n\n\nBulan pertama: 3 pelanggan.\nBulan kedua: 7 pelanggan.\nBulan ketiga: 0. Sepi.\n\n\nSaya hampir menyerah. Tapi ingat kata bokap: 'Usaha itu naik turun. Yang penting jalan terus.'\n\n\nSaya evaluasi. Ternyata saya kurang aktif promosi. Mulai belajar bikin konten, belajar foto produk pakai HP, belajar tulis caption yang menarik.\n\n\nBulan keempat: 15 pelanggan. Kelima: 30. Keenam: 50+\n\n\nPelanggan pertama saya — seorang ibu rumah tangga di Bandung — sampai sekarang masih setia belanja. Bahkan jadi reseller.\n\n\nDari kamar kos 3x3, sekarang saya punya tim 5 orang. Gaji pertama yang saya terima? Saya ingat betul: Rp 450.000. Tapi rasanya kaya raya.\n\n\nKalau kamu sedang memulai dan merasa sendirian: teruslah. Pelanggan pertamamu sedang dalam perjalanan menemukanmu.",
    author: "Rudi H.",
    coverGradient: "from-amber-600 to-yellow-500",
    readingTime: 4,
    dreamSlugs: ["entrepreneur"],
    dreamEmoji: "💼",
    tags: ["bisnis", "memulai", "semangat"],
    publishedAt: "2026-06-01",
  },
  {
    id: "s2", slug: "gagal-masuk-fk-tiga-kali",
    type: "story", title: "Gagal Masuk FK Tiga Kali — Sekarang Aku Residen",
    excerpt: "Kegagalan bukan akhir. Ini cerita perjuangan saya masuk Fakultas Kedokteran.",
    content: "SBMPTN 2019: Gagal.\nSBMPTN 2020: Gagal lagi.\nSBMPTN 2021: Gagal lagi.\n\n\nTiga kali berturut-turut. Rasanya pengen nangis setiap kali lihat pengumuman. Teman-teman sudah pada kuliah, saya masih di rumah belajar lagi.\n\n\nHari-hari saya: bangun jam 4 pagi, belajar sampai jam 10 malam. Hanya berhenti untuk makan dan sholat. Kadang saya ragu: 'Apakah ini worth it? Mungkin aku memang tidak ditakdirkan jadi dokter?'\n\n\nTapi ada yang mendorong saya terus: kata ibu, 'Selama kamu masih mau berusaha, ibu akan dukung.'\n\n\nSaya ubah strategi. Ikut try out setiap bulan. Belajar dari soal-soal tahun lalu. Gabung grup belajar. Minta bimbingan kakak kelas.\n\n\nSBMPTN 2022: LULUS.\n\n\nSaya nangis. Ibu juga nangis. Bapak cuma bilang, 'Alhamdulillah.'\n\n\nSekarang saya residen. Masih panjang perjalanannya. Tiap jaga malam, tiap pasien yang sembuh, ingatkan saya kenapa dulu saya bertahan.\n\n\nKalau kamu sedang gagal sekarang: gapapa. Istirahat dulu. Lalu bangun lagi.",
    author: "dr. Andini P.",
    coverGradient: "from-blue-600 to-cyan-500",
    readingTime: 3,
    dreamSlugs: ["doctor"],
    dreamEmoji: "🩺",
    tags: ["kedokteran", "perjuangan", "pantang-menyerah"],
    publishedAt: "2026-06-03",
  },
  {
    id: "s3", slug: "dulu-aku-pemalu",
    type: "story", title: "Dulu Aku Pemalu — Sekarang Ajarin Public Speaking",
    excerpt: "Dari tidak berani bicara di depan kelas sampai jadi mentor komunikasi.",
    content: "SMP kelas 7: disuruh maju presentasi. Saya diam 5 menit. Akhirnya guru bilang 'sudah, duduk.'\n\n\nMalu banget. Muka merah sepanjang hari. Janji dalam hati: 'Aku harus berubah.'\n\n\nSMA: ikut ekskul debat. Awalnya cuma jadi pendengar. Setahun kemudian mulai berani bicara. Dua tahun jadi ketua.\n\n\nTapi tetap deg-degan setiap kali tampil. Sampai kuliah, saya paksa diri ikut organisasi. Lomba MC. Presentasi seminar.\n\n\nTips saya:\n1. Persiapan 2x lipat dari yang kamu kira cukup\n2. Fokus ke pesan, bukan ke diri sendiri\n3. Latihan di depan kaca atau kamera\n4. Terima bahwa deg-degan itu wajar\n\n\nSekarang saya kerja sebagai trainer komunikasi. Masih deg-degan kadang. Tapi sudah tahu cara mengelolanya.\n\n\nKalau kamu yang pemalu: kamu bisa berubah. Pelan-pelan. Tidak perlu langsung jago.",
    author: "Dimas S.",
    coverGradient: "from-secondary to-accent",
    readingTime: 5,
    dreamSlugs: [],
    tags: ["public-speaking", "percaya-diri", "pengembangan-diri"],
    publishedAt: "2026-06-05",
  },
  {
    id: "s4", slug: "aplikasi-pertamaku-gagal-total",
    type: "story", title: "Aplikasi Pertamaku Gagal Total — Ini yang Kupelajari",
    excerpt: "6 bulan coding, 0 user. Tapi itu awal karirku sebagai programmer.",
    content: "Aku menghabiskan 6 bulan membuat aplikasi to-do list yang 'revolusioner'. Fitur lengkap: kategori, prioritas, kolaborasi, analitik.\n\n\nPas launch: 0 user.\n\n\nBukan 0 user aktif. 0 user total. Bahkan temen sendiri gak make.\n\n\nSedih? Banget. Tapi dari situ aku belajar hal paling penting dalam programming: buat sesuatu yang orang BUTUH, bukan yang kamu KIRA mereka butuh.\n\n\nAku mulai dari awal. Cari masalah nyata. Ngobrol sama 20 orang. Tanya: 'Kesulitan apa yang kamu hadapi sehari-hari?'\n\n\nDari situ aku bikin aplikasi sederhana: catatan keuangan buat anak kos. 3 fitur doang: pemasukan, pengeluaran, laporan.\n\n\nBikinnya cuma 2 minggu.\n\n\nBulan pertama: 50 user. Bulan ketiga: 1000 user.\n\n\nPelajaran:\n- Quantity over quality? No. Relevance over complexity.\n- Validasi sebelum eksekusi\n- Gagal itu guru terbaik\n\n\nAplikasi pertamaku gagal. Tapi itu yang bikin aku jadi programmer yang lebih baik.",
    author: "Ayu L.",
    coverGradient: "from-primary to-secondary",
    readingTime: 4,
    dreamSlugs: ["programmer"],
    dreamEmoji: "💻",
    tags: ["programming", "gagal", "belajar"],
    publishedAt: "2026-06-07",
  },
  {
    id: "s5", slug: "dari-pemula-jadi-pelari-maraton",
    type: "story", title: "Dari Tidak Bisa Lari 1km Sampai Finish Marathon",
    excerpt: "Tahun pertama: nggak bisa lari 1 km. Tahun kedua: finish marathon pertama.",
    content: "Awalnya saya benci lari. Napas sesak, pinggang pegal, muka merah. Setelah 500 meter aja udah berhenti.\n\n\nTapi ada teman yang ajak ikut lari pagi. Minggu pertama: jalan cepat. Minggu kedua: jalan + lari 200m. Minggu ketiga: 500m. Bulan kedua: 1km nonstop.\n\n\nPertama kali lari 5km: nangis bahagia.\n\n\nSetahun kemudian daftar marathon. Orang-orang bilang gila. 'Kamu? Lari marathon? Baru setahun lari?'\n\n\nSaya latihan 6 bulan. Rutin. Dari 5km naik ke 10km, 15km, 21km. Sampai akhirnya H-1 saya tidur jam 8, bangun jam 3 pagi.\n\n\nFinish di jam 5:47:23. Bukan waktu bagus. Tapi saya selesai.\n\n\nYang saya pelajari: tubuh kita bisa lebih kuat dari yang kita kira. Kuncinya konsisten, bukan kecepatan.",
    author: "Budi P.",
    coverGradient: "from-orange-500 to-red-500",
    readingTime: 3,
    dreamSlugs: ["runner", "athlete"],
    dreamEmoji: "🏃",
    tags: ["lari", "marathon", "konsisten"],
    publishedAt: "2026-06-09",
  },
  {
    id: "s6", slug: "berkarya-dari-kamar",
    type: "story", title: "Berkarya dari Kamar: Perjalanan Jadi Content Creator",
    excerpt: "Modal HP dan mimpi. Sekarang 100 ribu subscriber.",
    content: "Dulu saya kerja di kantor. Gaji pas-pasan. Tiap hari macetan. Sampai suatu hari saya bertanya: 'Apa ini yang saya mau lakukan 10 tahun ke depan?'\n\n\nMulai bikin konten YouTube dari kamar kos. Topik: masak hemat untuk anak kos.\n\n\nVideo pertama: 50 views. Itu pun mungkin dari ibu saya.\nVideo kesepuluh: 200 views.\nVideo kelima puluh: 5000 views.\n\n\nSatu tahun pertama: 5000 subscriber. Gaji masih dari kantor.\nDua tahun: 20 ribu. Mulai dapat endorse kecil.\nTiga tahun: 100 ribu. Berhenti dari kantor.\n\n\nSekarang penghasilan lebih dari kantor dulu. Tapi yang paling berharga bukan uang. Tapi pesan dari penonton: 'Makasih resepnya kak, anakku jadi doyan makan.'\n\n\nModal: HP 2,5 juta + koneksi WiFi + kemauan untuk konsisten.\n\n\nKalau kamu punya mimpi jadi kreator: mulai dari sekarang. Tidak perlu menunggu sempurna.",
    author: "Siska R.",
    coverGradient: "from-pink-500 to-orange-400",
    readingTime: 4,
    dreamSlugs: ["content-creator"],
    dreamEmoji: "🎨",
    tags: ["content-creator", "youtube", "konsisten"],
    publishedAt: "2026-06-11",
  },
  {
    id: "s7", slug: "ayo-main",
    type: "story", title: "Dari Main Bola di Lapangan Kecil Sampai Jadi Pemain Profesional",
    excerpt: "Tidak ada akademi. Tidak ada pelatih. Hanya lapangan krikil dan mimpi.",
    content: "Setiap sore, saya dan teman-teman main bola di lapangan krikil. Gawang pakai sandal. Bola sudah botak. Tapi kami tidak peduli.\n\n\nSaya tidak lulus seleksi akademi tiga kali. Pelatih bilang: 'Kamu kurang cepat.'\n\n\nPulang saya nangis. Tapi besoknya saya latihan lagi. Lari keliling komplek. Latihan dribble pakai bola tenis.\n\n\nSampai akhirnya ada kesempatan: tim lokal lagi cari pemain. Saya coba. Diterima.\n\n\nDari situ: liga lokal → provinsi → nasional.\n\n\nSekarang bermain di liga 2. Belum besar. Tapi saya bermain bola untuk hidup. Dari kecil yang hanya punya lapangan krikil, ini adalah mimpi yang jadi nyata.",
    author: "Fajar H.",
    coverGradient: "from-green-600 to-emerald-500",
    readingTime: 3,
    dreamSlugs: ["football-player"],
    dreamEmoji: "⚽",
    tags: ["sepak-bola", "perjuangan", "keren"],
    publishedAt: "2026-06-13",
  },

  // ===== ARTICLES =====
  {
    id: "a1", slug: "cara-belajar-efektif",
    type: "article", title: "Cara Belajar Efektif: Teknik yang Terbukti Secara Ilmiah",
    excerpt: "Feynman Technique, Pomodoro, Active Recall — cara belajar yang benar.",
    content: "Kesalahan terbesar dalam belajar: baca ulang dan highlight.\n\n\nPenelitian menunjukkan metode itu tidak efektif. Lalu apa yang bekerja?\n\n\n**1. Active Recall**\nSetelah baca, tutup buku. Coba ingat apa yang baru kamu baca. Ini memaksa otak bekerja lebih keras.\n\n\n**2. Feynman Technique**\nCoba jelaskan konsep yang kamu pelajari dengan bahasa sederhana. Kalau tidak bisa, berarti belum paham.\n\n\n**3. Spaced Repetition**\nBelajar sedikit tapi rutin lebih efektif daripada belajar banyak sekaligus.\n\n\n**4. Pomodoro**\n25 menit fokus, 5 menit istirahat. Siklus pendek menjaga konsentrasi.\n\n\nCoba praktikkan mulai hari ini. 30 menit sehari lebih baik dari 5 jam sehari sekali seminggu.",
    author: "Tim Beautifio",
    coverGradient: "from-purple-600 to-pink-500",
    readingTime: 3,
    dreamSlugs: [],
    tags: ["belajar", "produktivitas", "teknik"],
    publishedAt: "2026-06-02",
  },
  {
    id: "a2", slug: "cara-membangun-disiplin",
    type: "article", title: "Cara Membangun Disiplin Tanpa Menyiksa Diri",
    excerpt: "Disiplin bukan soal memaksa diri. Ini soal sistem.",
    content: "Disiplin itu seperti otot. Kalau tidak pernah dilatih, lemah. Kalau dipaksa angkat beban terlalu berat, cedera.\n\n\n**Mulai dari yang kecil.**\nMau rajin baca buku? Mulai 2 halaman sehari. Mau olahraga? 5 menit sehari. Konsisten dulu, tingkatkan kemudian.\n\n\n**Buat lingkungan yang mendukung.**\nLetakkan buku di atas bantal. Siapkan sepatu lari di depan pintu. Jangan andalkan kemauan — andalkan lingkungan.\n\n\n**Jangan putus rantai.**\nPrinsip 'Don't break the chain'. Kalau udah konsisten 7 hari, kamu akan berpikir dua kali untuk putus.\n\n\n**Maafkan diri sendiri.**\nSuatu hari kamu pasti skip. Itu wajar. Besok lanjut lagi.\n\n\nDisiplin bukan tentang menjadi sempurna. Tentang menjadi konsisten.",
    author: "Tim Beautifio",
    coverGradient: "from-indigo-600 to-purple-500",
    readingTime: 3,
    dreamSlugs: [],
    tags: ["disiplin", "produktivitas", "konsisten"],
    publishedAt: "2026-06-04",
  },
  {
    id: "a3", slug: "cara-mengelola-waktu-untuk-pelajar",
    type: "article", title: "Mengelola Waktu untuk Pelajar dan Mahasiswa",
    excerpt: "24 jam rasanya kurang? Mungkin bukan waktunya yang kurang.",
    content: "Rata-rata orang menghabiskan 4-5 jam per hari untuk scroll media sosial. Bukan waktu yang kurang, tapi prioritas yang belum jelas.\n\n\n**Buat daftar prioritas.**\nTiap malam, tulis 3 hal terpenting untuk besok. Kerjakan itu dulu sebelum yang lain.\n\n\n**Time blocking.**\nAlokasikan waktu spesifik untuk setiap aktivitas. 7-8 pagi: belajar. 4-5 sore: olahraga. 8-9 malam: me time.\n\n\n**Hindari multitasking.**\nOtak tidak dirancang untuk melakukan dua hal sekaligus. Fokus pada satu tugas sampai selesai.\n\n\n**Gunakan waktu luang.**\nWaktu nunggu bis, antre, atau istirahat bisa dipakai baca artikel 5 menit atau review catatan.\n\n\n**Istirahat juga prioritas.**\nTidur 7-8 jam bukan pemborosan. Itu investasi produktivitas esok hari.",
    author: "Tim Beautifio",
    coverGradient: "from-teal-600 to-green-500",
    readingTime: 4,
    dreamSlugs: [],
    tags: ["manajemen-waktu", "produktivitas", "pelajar"],
    publishedAt: "2026-06-06",
  },
  {
    id: "a4", slug: "cara-menjual-produk-pertama",
    type: "article", title: "Cara Menjual Produk Pertamamu Tanpa Takut Ditolak",
    excerpt: "Rasa takut ditolak adalah nomor satu penghambat pengusaha pemula.",
    content: "Ketakutan terbesar pengusaha pemula: ditolak. 'Gimana kalau mereka bilang tidak?'\n\n\n**Pertama: ubah mindset.**\nPenolakan bukan tentang kamu. Bisa jadi:\n- Mereka belum butuh\n- Harganya belum pas\n- Timing-nya kurang tepat\n\n\n**Kedua: mulai dari orang terdekat.**\nTawarkan ke teman, keluarga, atau komunitas. Mereka akan memberi feedback jujur.\n\n\n**Ketiga: gunakan teknik 'Yes... and'.**\nKalau mereka bilang tidak, tanya kenapa. Itu feedback berharga untuk perbaikan.\n\n\n**Keempat: jual manfaat, bukan fitur.**\nJangan bilang 'produk ini terbuat dari bahan X'. Bilang 'produk ini bikin kamu hemat 2 jam sehari'.\n\n\n**Kelima: minta rekomendasi.**\nSetelah berhasil jual ke satu orang, minta tolong: 'Kalau ada teman yang butuh, tolong kasih tahu ya.'\n\n\nPenolakan pertama sakit. Tapi penolakan keseratus sudah biasa. Dan penjualan pertama itu sepadan.",
    author: "Tim Beautifio",
    coverGradient: "from-amber-600 to-yellow-500",
    readingTime: 4,
    dreamSlugs: ["entrepreneur"],
    dreamEmoji: "💼",
    tags: ["sales", "bisnis", "pemula"],
    publishedAt: "2026-06-08",
  },
  {
    id: "a5", slug: "tips-belajar-coding-otodidak",
    type: "article", title: "Tips Belajar Coding Otodidak untuk Pemula Absolut",
    excerpt: "Dari nol sampai bisa bikin web pertama. Panduan langkah demi langkah.",
    content: "Belajar coding otodidak itu sulit tapi bukan tidak mungkin. Ini roadmap yang sudah terbukti.\n\n\n**1. Tentukan tujuan**\nMau bikin website? Game? Aplikasi? Pilih satu dulu.\n\n\n**2. Mulai dari dasar**\nHTML + CSS dulu. Jangan langsung JavaScript atau Python.\n\n\n**3. Bangun proyek nyata**\nSetelah paham dasar, bikin proyek. Landing page pribadi. Kalkulator. To-do list.\n\n\n**4. Dokumentasi adalah teman**\nMDN, W3Schools, Stack Overflow. Biasakan baca dokumentasi.\n\n\n**5. Jangan copy-paste**\nKetik manual. Otak akan merekam pola lebih baik.\n\n\n**6. Cari komunitas**\nTwitter, Discord, forum. Bertanya dan bantu jawab.\n\n\n**7. Konsisten, bukan intens**\n30 menit setiap hari > 5 jam di akhir pekan lalu lupa seminggu.\n\n\n**Sumber daya gratis:** freeCodeCamp, The Odin Project, CS50.\n\n\nMulai hari ini. 30 menit. Tidak perlu langsung jago.",
    author: "Tim Beautifio",
    coverGradient: "from-primary to-secondary",
    readingTime: 5,
    dreamSlugs: ["programmer"],
    dreamEmoji: "💻",
    tags: ["programming", "pemula", "belajar"],
    publishedAt: "2026-06-10",
  },
  {
    id: "a6", slug: "cara-bicara-di-depan-umum",
    type: "article", title: "Cara Berbicara di Depan Umum untuk Pemula",
    excerpt: "Public speaking bukan bakat. Ini skill yang bisa dipelajari.",
    content: "Glossophobia — takut bicara di depan umum — adalah salah satu ketakutan terbesar manusia. Bahkan lebih menakutkan daripada kematian.\n\n\n**Persiapan adalah 80% keberhasilan.**\nSemakin siap, semakin percaya diri. Latihan 10x lebih banyak dari yang kamu kira perlu.\n\n\n**Struktur sederhana:**\n- Pembukaan: hook (pertanyaan/statistik/cerita)\n- Isi: 3 poin utama\n- Penutup: kesimpulan + call to action\n\n\n**Bahasa tubuh:**\n- Berdiri tegak, bahu ke belakang\n- Kontak mata: 3-5 detik per orang\n- Tangan: gestur alami, jangan di saku\n\n\n**Atasi grogi:**\n- Tarik napas dalam 4 detik, tahan 4, hembus 4\n- Fokus ke pesan, bukan ke diri sendiri\n- Ingat: audiens ingin kamu berhasil\n\n\n**Latihan:**\nBicara sendiri di depan kaca. Rekam pakai HP. Minta feedback teman.\n\n\nSemakin sering, semakin mudah.",
    author: "Tim Beautifio",
    coverGradient: "from-rose-500 to-pink-400",
    readingTime: 4,
    dreamSlugs: [],
    tags: ["public-speaking", "komunikasi", "percaya-diri"],
    publishedAt: "2026-06-12",
  },
  {
    id: "a7", slug: "nutrisi-untuk-atlet-muda",
    type: "article", title: "Nutrisi Dasar untuk Atlet Muda",
    excerpt: "Makanan adalah bahan bakar. Pilih yang benar.",
    content: "Sebagai atlet muda, apa yang kamu makan sama pentingnya dengan latihan.\n\n\n**Karbohidrat = energi**\nNasi merah, roti gandum, oat, kentang. Makan 2-3 jam sebelum latihan.\n\n\n**Protein = pemulihan**\nTelur, ayam, ikan, tahu, tempe. Konsumsi dalam 30 menit setelah latihan.\n\n\n**Lemak baik = hormon**\nAlpukat, kacang, ikan salmon. Jangan takut lemak, tapi pilih yang sehat.\n\n\n**Hidrasi = performa**\n2-3 liter per hari. Jangan tunggu haus untuk minum.\n\n\n**Vitamins & minerals**\nSayur dan buah 5 porsi per hari. Variasikan warna untuk nutrisi lengkap.\n\n\n**Yang harus dikurangi:**\nMakanan olahan, gula berlebih, minuman bersoda, kafein berlebihan.\n\n\nIngat: tubuh adalah mesinmu. Isi dengan bahan bakar berkualitas.",
    author: "Tim Beautifio",
    coverGradient: "from-orange-600 to-red-500",
    readingTime: 3,
    dreamSlugs: ["athlete", "football-player", "runner"],
    dreamEmoji: "🏅",
    tags: ["nutrisi", "olahraga", "kesehatan"],
    publishedAt: "2026-06-14",
  },
  {
    id: "a8", slug: "cara-mulai-karir-digital-marketing",
    type: "article", title: "Cara Mulai Karir di Digital Marketing Tanpa Pengalaman",
    excerpt: "Digital marketing adalah salah satu karir paling mudah dimulai tanpa latar belakang khusus.",
    content: "Tidak perlu kuliah marketing. Tidak perlu sertifikat mahal. Ini langkah-langkahnya.\n\n\n**1. Pilih spesialisasi**\nSEO, Social Media, Email Marketing, Content Marketing, atau Paid Ads. Pilih satu dulu.\n\n\n**2. Belajar gratis**\nGoogle Digital Garage, HubSpot Academy, Coursera. Banyak yang gratis dan berkualitas.\n\n\n**3. Praktik langsung**\nBikin proyek untuk teman, keluarga, atau organisasi. Minta izin pakai akun mereka.\n\n\n**4. Bangun portofolio**\nDokumentasikan hasil: berapa kenaikan traffic, engagement, atau conversion.\n\n\n**5. Sertifikasi**\nGoogle Ads, Meta Blueprint, HubSpot. Ini membantu CV.\n\n\n**6. Networking**\nGabung grup digital marketing Indonesia. Banyak lowongan dari grup.\n\n\n**Gaji awal digital marketing:** 4-7 juta. Setelah 2-3 tahun: 10-15 juta.\n\n\nMulai hari ini. Tidak butuh modal besar.",
    author: "Tim Beautifio",
    coverGradient: "from-indigo-600 to-purple-500",
    readingTime: 4,
    dreamSlugs: ["digital-marketer"],
    dreamEmoji: "📱",
    tags: ["karir", "digital-marketing", "pemula"],
    publishedAt: "2026-06-15",
  },
];

export function getAllInspiration(): InspirationItem[] {
  return DATA;
}

export function getInspirationBySlug(slug: string): InspirationItem | undefined {
  return DATA.find((item) => item.slug === slug);
}

export function getInspirationForDream(dreamSlug: string): InspirationItem[] {
  return DATA.filter((item) => item.dreamSlugs.includes(dreamSlug));
}

export function getInspirationForCategory(categorySlug: string): InspirationItem[] {
  const cat = DREAM_CATEGORIES.find((c) => c.slug === categorySlug);
  if (!cat) return [];
  const slugs = cat.dreams.map((d) => d.slug);
  return DATA.filter((item) => item.dreamSlugs.some((s) => slugs.includes(s)));
}

export function getInspirationGrouped(): {
  stories: InspirationItem[];
  articles: InspirationItem[];
} {
  return {
    stories: DATA.filter((item) => item.type === "story"),
    articles: DATA.filter((item) => item.type === "article"),
  };
}

export function searchInspiration(query: string): InspirationItem[] {
  const q = query.toLowerCase();
  return DATA.filter((item) => {
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchTags = item.tags.some((t) => t.toLowerCase().includes(q));
    const matchDream = item.dreamSlugs.some((s) => {
      const dream = DREAM_MAP[s];
      return dream?.title.toLowerCase().includes(q) || dream?.emoji.includes(q);
    });
    return matchTitle || matchTags || matchDream;
  });
}

export { DREAM_MAP };
