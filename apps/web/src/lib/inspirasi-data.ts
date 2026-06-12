export type ContentType = "all" | "story" | "anonymous" | "journal" | "mentor" | "community";
export type PostingMode = "anonymous" | "nickname" | "public";
export type ModerationStatus = "pending" | "approved" | "rejected";

export interface InspirasiItem {
  id: string;
  slug: string;
  type: ContentType;
  title: string;
  content: string;
  full_content: string;
  author: string;
  initials?: string;
  cover_image?: string;
  category: string;
  reading_time: number;
  like_count: number;
  comment_count: number;
  save_count: number;
  mentor_title?: string;
  community_name?: string;
  related_slugs: string[];
  postingMode?: PostingMode;
  moderationStatus?: ModerationStatus;
  nickname?: string;
  createdAt?: string;
}

export const CONTENT_TABS: { key: ContentType; label: string; icon: string }[] = [
  { key: "all", label: "Semua", icon: "Sparkles" },
  { key: "story", label: "Cerita", icon: "BookOpen" },
  { key: "anonymous", label: "Curhat", icon: "PenLine" },
  { key: "journal", label: "Journal", icon: "BookHeart" },
  { key: "mentor", label: "Mentor", icon: "Quote" },
  { key: "community", label: "Komunitas", icon: "Users" },
];

export const ANON_CATEGORIES = [
  "Pendidikan", "Karier", "Keluarga", "Pertemanan", "Percintaan",
  "Bullying", "Keuangan", "Kesehatan Mental", "Lainnya",
];

export const POSTING_MODES: { key: PostingMode; label: string; description: string }[] = [
  { key: "anonymous", label: "Anonim", description: "Identitas tidak ditampilkan" },
  { key: "nickname", label: "Nama Samaran", description: "Gunakan nama samaran" },
  { key: "public", label: "Publik", description: "Tampilkan nama akun" },
];

export const DATA: InspirasiItem[] = [
  {
    id: "s1",
    slug: "cerita-membangun-karir-di-era-digital",
    type: "story",
    title: "Membangun Karir di Era Digital: Perjalanan Seorang Developer",
    content:
      "Dari nol hingga menjadi full-stack developer, ini adalah kisah perjalanan saya yang penuh dengan tantangan dan pembelajaran...",
    full_content:
      "**Memulai Perjalanan**\n\nSaya memulai karir sebagai seorang fresh graduate yang tidak memiliki pengalaman sama sekali. Dunia teknologi terasa sangat luas dan menakutkan. Namun, dengan tekad yang kuat, saya mulai belajar coding dari dasar...\n\n**Tantangan yang Dihadapi**\n\nSalah satu tantangan terbesar adalah impostor syndrome. Rasa tidak percaya diri sering menghantui, terutama saat melihat rekan-rekan yang lebih berpengalaman. Tapi saya belajar bahwa setiap orang memiliki perjalanannya masing-masing.\n\n**Kunci Sukses**\n\nKonsistensi adalah kunci. Saya menghabiskan setidaknya 2 jam setiap hari untuk belajar teknologi baru. Forum-forum seperti Stack Overflow dan GitHub menjadi sahabat terbaik saya.",
    author: "Rina Wijaya",
    initials: "RW",
    cover_image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    category: "Karir",
    reading_time: 5,
    like_count: 234,
    comment_count: 45,
    save_count: 128,
    related_slugs: ["cerita-belajar-coding-otodidak", "cerita-dari-freelancer-ke-cto"],
  },
  {
    id: "s2",
    slug: "cerita-belajar-coding-otodidak",
    type: "story",
    title: "Belajar Coding Otodidak: Dari Google Hingga Ditawari Gaji Puluhan Juta",
    content:
      "Tanpa bootcamp mahal, tanpa kuliah IT — ini bukti bahwa jalan otodidak bisa mengantarkanmu ke karir impian...",
    full_content:
      "**Awal Mula**\n\nSemuanya berawal dari rasa penasaran. Saya iseng membuka tutorial JavaScript di YouTube dan sejak saat itu, dunia coding tidak pernah lepas dari hidup saya.\n\n**Sumber Belajar Gratis**\n\nSaya memanfaatkan berbagai sumber gratis: freeCodeCamp, The Odin Project, dan dokumentasi MDN. Kuncinya adalah konsisten dan tidak takut mencoba hal baru.\n\n**Hasil yang Didapat**\n\nSetelah 1,5 tahun belajar, saya berhasil mendapatkan pekerjaan sebagai junior developer dengan gaji yang tidak pernah saya bayangkan sebelumnya.",
    author: "Dimas Pratama",
    initials: "DP",
    cover_image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    category: "Pendidikan",
    reading_time: 7,
    like_count: 567,
    comment_count: 89,
    save_count: 312,
    related_slugs: ["cerita-membangun-karir-di-era-digital"],
  },
  {
    id: "s3",
    slug: "cerita-berbisnis-sampingan-sambil-kuliah",
    type: "story",
    title: "Berbisnis Sampingan Sambil Kuliah: Omset 50 Juta Per Bulan",
    content:
      "Memulai bisnis dari kamar kos dengan modal nekat dan laptop pinjaman. Inilah kisah seorang mahasiswa yang berhasil...",
    full_content:
      "**Modal Awal**\n\nTidak ada modal besar. Hanya laptop pinjaman dari teman dan koneksi internet seadanya. Bisnis pertama saya adalah jasa desain grafis untuk UMKM di sekitar kampus.\n\n**Perjuangan**\n\nMenyeimbangkan kuliah dan bisnis bukan hal mudah. Saya sering begadang demi menyelesaikan pesanan sambil tetap mengerjakan tugas kuliah. Namun, passion saya terhadap bisnis membuat semua terasa ringan.\n\n**Pencapaian**\n\nKini omset bisnis saya mencapai 50 juta per bulan dengan tim yang terdiri dari 5 orang. Kuliah tetap berjalan dengan baik, dan saya bisa membantu orang tua.",
    author: "Aditya Nugroho",
    initials: "AN",
    cover_image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=80",
    category: "Bisnis",
    reading_time: 6,
    like_count: 412,
    comment_count: 67,
    save_count: 198,
    related_slugs: [],
  },
  {
    id: "a1",
    slug: "curhat-merasa-terjebak-di-pekerjaan-yang-tidak-disukai",
    type: "anonymous",
    title: "Merasa Terjebak di Pekerjaan yang Tidak Disukai",
    content:
      "Setiap pagi saya bangun dengan rasa malas yang luar biasa. Kantor terasa seperti penjara. Haruskah saya bertahan atau memulai dari awal?",
    full_content:
      "**Kondisi Saat Ini**\n\nSaya sudah bekerja di perusahaan ini selama 3 tahun. Awalnya, pekerjaan ini terasa menyenangkan karena sesuai dengan latar belakang pendidikan saya. Namun, semakin ke sini, saya merasa semakin terjebak.\n\n**Rasa Takut**\n\nSaya takut memulai dari nol. Takut tidak bisa beradaptasi di tempat baru. Tapi di sisi lain, saya juga tidak ingin menghabiskan sisa hidup dalam ketidakbahagiaan.\n\n**Butuh Saran**\n\nApakah ada yang pernah merasakan hal yang sama? Bagaimana cara kalian mengambil keputusan untuk keluar dari zona nyaman?",
    author: "Anonymous",
    initials: "AN",
    category: "Karir",
    reading_time: 4,
    like_count: 892,
    comment_count: 234,
    save_count: 56,
    related_slugs: ["curhat-takut-gagal-sebelum-memulai"],
  },
  {
    id: "a2",
    slug: "curhat-takut-gagal-sebelum-memulai",
    type: "anonymous",
    title: "Takut Gagal Sebelum Memulai: Bagaimana Mengatasinya?",
    content:
      "Rasa takut ini menghantui setiap langkah yang saya ambil. Bagaimana cara kalian melawan rasa takut akan kegagalan?",
    full_content:
      "**Akar Masalah**\n\nKetakutan saya akan kegagalan berakar dari pengalaman masa lalu ketika saya gagal dalam sebuah proyek besar. Trauma itu membekas dan mempengaruhi setiap keputusan yang saya ambil sekarang.\n\n**Dampak**\n\nAkibatnya, saya sering menunda-nunda pekerjaan. Saya ragu untuk mengambil inisiatif dan cenderung memilih jalan yang aman.\n\n**Harapan**\n\nSaya ingin sembuh dari ketakutan ini. Saya ingin berani mengambil risiko dan tidak menyesali masa depan karena terlalu takut melangkah.",
    author: "Anonymous",
    initials: "AN",
    category: "Kesehatan Mental",
    reading_time: 5,
    like_count: 654,
    comment_count: 178,
    save_count: 201,
    related_slugs: ["curhat-merasa-terjebak-di-pekerjaan-yang-tidak-disukai"],
  },
  {
    id: "a3",
    slug: "curhat-hubungan-jarak-jauh-yang-melelahkan",
    type: "anonymous",
    title: "Hubungan Jarak Jauh yang Melelahkan: Bertahan atau Berpisah?",
    content:
      "Sudah 2 tahun menjalani LDR, dan semakin hari semakin terasa berat. Komunikasi mulai renggang, sering bertengkar karena hal sepele...",
    full_content:
      "**Awal Hubungan**\n\nKami memulai hubungan jarak jauh setelah saya harus pindah kota untuk bekerja. Awalnya, semuanya berjalan lancar. Kami rajin video call dan saling mengirim kabar setiap saat.\n\n**Masalah Mulai Muncul**\n\nSeiring waktu, kesibukan masing-masing mulai menggerogoti kualitas hubungan. Percakapan kami menjadi dangkal, hanya sebatas 'sudah makan belum' dan 'hati-hati di jalan'.\n\n**Kebingungan**\n\nSaya bingung harus bertahan atau tidak. Ada cinta, tapi ada juga kelelahan. Apakah LDR memang tidak untuk semua orang?",
    author: "Anonymous",
    initials: "AN",
    category: "Percintaan",
    reading_time: 4,
    like_count: 445,
    comment_count: 312,
    save_count: 78,
    related_slugs: [],
  },
  {
    id: "j1",
    slug: "journal-refleksi-akhir-pekan-bersyukur-dan-bercermin",
    type: "journal",
    title: "Refleksi Akhir Pekan: Bersyukur dan Bercermin",
    content:
      "Saya ingin membiasakan diri menulis refleksi setiap minggu untuk melihat sejauh mana saya telah berkembang...",
    full_content:
      "**Apa yang Terjadi Minggu Ini**\n\nMinggu ini penuh dengan pelajaran berharga. Saya berhasil menyelesaikan proyek besar yang sudah berlangsung selama 3 bulan. Rasanya lega dan bangga.\n\n**Hal yang Disyukuri**\n\nSaya bersyukur memiliki rekan kerja yang suportif dan keluarga yang selalu mendukung. Kesehatan saya juga masih baik meskipun sering begadang.\n\n**Hal yang Perlu Diperbaiki**\n\nManajemen waktu masih perlu ditingkatkan. Saya masih sering menunda pekerjaan kecil dan mengerjakannya di menit-menit terakhir.\n\n**Target Minggu Depan**\n\nSemoga minggu depan bisa lebih disiplin dengan jadwal dan lebih banyak membaca buku.",
    author: "Sarah Putri",
    initials: "SP",
    category: "Self Reflection",
    reading_time: 3,
    like_count: 123,
    comment_count: 12,
    save_count: 89,
    related_slugs: [],
  },
  {
    id: "j2",
    slug: "journal-perjalanan-menjadi-versi-terbaik-diri",
    type: "journal",
    title: "Perjalanan Menjadi Versi Terbaik Diri",
    content:
      "Setiap hari adalah kesempatan untuk menjadi lebih baik. Inilah jurnal perjalanan saya meraih versi terbaik diri...",
    full_content:
      "**Hari Ini**\n\nHari ini saya bangun lebih pagi dari biasanya. Saya memutuskan untuk jogging di taman dekat rumah. Udaranya segar dan membuat pikiran lebih jernih.\n\n**Pekerjaan**\n\nDi kantor, saya mencoba untuk lebih fokus dan mengurangi distraksi dari media sosial. Hasilnya, pekerjaan selesai lebih cepat dan saya bisa pulang tepat waktu.\n\n**Pembelajaran**\n\nSaya belajar bahwa menjadi versi terbaik diri bukan tentang menjadi sempurna, tapi tentang menjadi lebih baik dari versi diri kemarin.\n\n**Catatan Khusus**\n\nHari ini saya juga berhasil menolak ajakan nongkrong yang tidak penting demi menyelesaikan target pribadi. Kemampuan untuk bilang 'tidak' itu penting.",
    author: "Budi Santoso",
    initials: "BS",
    category: "Personal Growth",
    reading_time: 4,
    like_count: 256,
    comment_count: 34,
    save_count: 156,
    related_slugs: [],
  },
  {
    id: "j3",
    slug: "journal-belajar-mencintai-diri-sendiri",
    type: "journal",
    title: "Belajar Mencintai Diri Sendiri: Sebuah Proses",
    content:
      "Self-love bukanlah tentang egois, tapi tentang menghargai diri sendiri. Inilah perjalanan saya belajar mencintai diri...",
    full_content:
      "**Pemahaman Awal**\n\nSelama ini saya pikir self-love itu egois. Saya selalu mengutamakan orang lain dan mengabaikan kebutuhan diri sendiri. Akibatnya, saya sering merasa lelah dan tidak dihargai.\n\n**Perubahan Mindset**\n\nSeorang teman membukakan mata bahwa mencintai diri sendiri adalah fondasi untuk bisa mencintai orang lain dengan sehat. Saya mulai belajar untuk tidak selalu berkata 'iya'.\n\n**Kebiasaan Baru**\n\nSaya mulai melakukan me-time: membaca buku, merawat kulit, dan belajar memasak. Hal-hal kecil ini ternyata sangat berdampak pada kesehatan mental saya.\n\n**Kesimpulan**\n\nSelf-love adalah perjalanan, bukan tujuan. Setiap hari adalah proses belajar untuk lebih menghargai diri sendiri.",
    author: "Dewi Lestari",
    initials: "DL",
    category: "Kesehatan Mental",
    reading_time: 5,
    like_count: 789,
    comment_count: 92,
    save_count: 445,
    related_slugs: [],
  },
  {
    id: "m1",
    slug: "mentor-kunci-sukses-public-speaking-untuk-profesional",
    type: "mentor",
    title: "Kunci Sukses Public Speaking untuk Profesional Muda",
    content:
      "Dari grogi hingga percaya diri berbicara di depan ribuan orang — inilah tips dari mentor berpengalaman...",
    full_content:
      "**Mengatasi Demam Panggung**\n\nHampir semua orang mengalami demam panggung. Kuncinya adalah persiapan yang matang. Latihan berbicara di depan cermin atau merekam diri sendiri bisa sangat membantu.\n\n**Struktur Presentasi**\n\nGunakan struktur pembuka-isi-penutup yang jelas. Mulai dengan hook yang menarik, sampaikan poin utama dengan data pendukung, dan akhiri dengan kesimpulan yang kuat.\n\n**Interaksi dengan Audiens**\n\nJangan hanya bicara sendiri. Libatkan audiens dengan pertanyaan, polling, atau cerita yang relatable. Public speaking yang baik adalah dua arah.\n\n**Latihan Konsisten**\n\nPublic speaking adalah skill yang harus diasah terus-menerus. Jangan lewatkan kesempatan untuk berbicara di depan umum, sekecil apapun.",
    author: "Andi Pratama, M.Kom",
    initials: "AP",
    mentor_title: "Senior Public Speaker & Trainer",
    cover_image:
      "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=600&q=80",
    category: "Public Speaking",
    reading_time: 6,
    like_count: 345,
    comment_count: 56,
    save_count: 234,
    related_slugs: ["mentor-membangun-personal-branding-di-linkedin"],
  },
  {
    id: "m2",
    slug: "mentor-membangun-personal-branding-di-linkedin",
    type: "mentor",
    title: "Membangun Personal Branding di LinkedIn untuk Pemula",
    content:
      "LinkedIn bukan hanya tempat cari kerja. Ini adalah platform untuk membangun personal branding yang kuat...",
    full_content:
      "**Mengapa Personal Branding Penting?**\n\nDi era digital, personal branding adalah aset berharga. LinkedIn menjadi etalase profesional Anda di dunia maya. Rekruter sering mencari kandidat melalui LinkedIn.\n\n**Langkah Pertama**\n\nMulai dengan profil yang lengkap: foto profesional, headline yang menarik, dan ringkasan pengalaman yang relevan. Jangan lupa untuk menambahkan skills dan sertifikasi.\n\n**Konten Berkualitas**\n\nBagikan pengetahuan Anda melalui postingan reguler. Tulis tentang pengalaman, pelajaran, atau insight industri. Konsistensi adalah kunci.\n\n**Membangun Network**\n\nJangan ragu untuk terhubung dengan profesional lain. Berikan komentar yang bernilai di postingan orang lain untuk memulai percakapan.",
    author: "Fajar Ramadhan",
    initials: "FR",
    mentor_title: "Digital Marketing Consultant",
    cover_image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80",
    category: "Personal Branding",
    reading_time: 5,
    like_count: 289,
    comment_count: 48,
    save_count: 312,
    related_slugs: ["mentor-kunci-sukses-public-speaking-untuk-profesional"],
  },
  {
    id: "m3",
    slug: "mentor-strategi-investasi-untuk-milenial",
    type: "mentor",
    title: "Strategi Investasi untuk Milenial: Mulai dari Rp100 Ribu",
    content:
      "Investasi bukan hanya untuk orang kaya. Dengan Rp100 ribu, kamu sudah bisa memulai perjalanan investasi...",
    full_content:
      "**Mengapa Milenial Harus Investasi?**\n\nSemakin cepat memulai, semakin besar potensi keuntungan. Dengan konsep compounding interest, waktu adalah sahabat terbaik investor.\n\n**Instrumen Investasi untuk Pemula**\n\nMulai dengan reksa dana atau emas. Keduanya relatif aman dan bisa dimulai dengan modal kecil. Pelajari juga saham dan obligasi seiring bertambahnya pengetahuan.\n\n**Manajemen Risiko**\n\nJangan menaruh semua telur dalam satu keranjang. Diversifikasi portofolio investasi Anda. Dan yang paling penting: hanya investasikan uang yang Anda siap kehilangan.\n\n**Konsistensi**\n\nInvestasi rutin sekecil apapun lebih baik daripada investasi besar tapi hanya sekali. Terapkan dollar cost averaging untuk hasil optimal.",
    author: "Rizky Hidayat, CFP",
    initials: "RH",
    mentor_title: "Certified Financial Planner",
    cover_image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
    category: "Finance",
    reading_time: 7,
    like_count: 678,
    comment_count: 123,
    save_count: 456,
    related_slugs: [],
  },
  {
    id: "m4",
    slug: "mentor-menulis-buku-pertama-tips-dari-penulis-best-seller",
    type: "mentor",
    title: "Menulis Buku Pertama: Tips dari Penulis Best Seller",
    content:
      "Ingin menulis buku tapi bingung memulai? Mentor kami berbagi tips jitu dari pengalaman menulis lebih dari 10 buku...",
    full_content:
      "**Menemukan Ide**\n\nIde bisa datang dari mana saja: pengalaman pribadi, keahlian profesional, atau tren yang sedang populer. Tulis semua ide tanpa menyaring dulu.\n\n**Mengatasi Writer's Block**\n\nWriter's block itu nyata. Cara mengatasinya: tulis saja tanpa peduli kualitas. Edit belakangan. Yang penting adalah menyelesaikan draf pertama.\n\n**Struktur Buku**\n\nBuat outline yang jelas sebelum mulai menulis. Bagi buku menjadi bab-bab yang logis dan mudah diikuti pembaca.\n\n**Penerbitan**\n\nAda dua jalur: penerbit mayor atau self-publishing. Masing-masing punya kelebihan dan kekurangan. Pilih yang sesuai dengan tujuan Anda.",
    author: "Maya Indriani, S.Sos",
    initials: "MI",
    mentor_title: "Best-Selling Author & Writing Coach",
    cover_image:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80",
    category: "Writing",
    reading_time: 6,
    like_count: 534,
    comment_count: 89,
    save_count: 378,
    related_slugs: [],
  },
  {
    id: "c1",
    slug: "komunitas-wanita-di-dunia-teknologi",
    type: "community",
    title: "Komunitas Wanita di Dunia Teknologi: Memberdayakan Perempuan",
    content:
      "Bersama kita kuat! Komunitas ini hadir untuk memberdayakan perempuan Indonesia yang berkecimpung di dunia teknologi...",
    full_content:
      "**Tujuan Komunitas**\n\nWanita di dunia teknologi masih menjadi minoritas. Komunitas ini hadir untuk menjembatani kesenjangan gender di industri teknologi melalui mentorship, workshop, dan networking.\n\n**Program Unggulan**\n\nKami memiliki program mentorship pairing, coding bootcamp gratis untuk perempuan, dan seminar tahunan dengan pembicara inspiratif dari berbagai perusahaan teknologi.\n\n**Dampak**\n\nSejak berdiri 3 tahun lalu, komunitas ini telah memberdayakan lebih dari 5000 anggota yang tersebar di 15 kota di Indonesia.\n\n**Bergabung**\n\nTidak ada syarat khusus. Cukup punya minat di dunia teknologi dan ingin berkembang bersama.",
    author: "Komunitas Women In Tech Indonesia",
    community_name: "Women In Tech Indonesia",
    cover_image:
      "https://images.unsplash.com/photo-1522542558221-8fd3a9f2d8c3?w=600&q=80",
    category: "Teknologi",
    reading_time: 4,
    like_count: 876,
    comment_count: 145,
    save_count: 567,
    related_slugs: ["komunitas-pengembang-game-indonesia"],
  },
  {
    id: "c2",
    slug: "komunitas-pengembang-game-indonesia",
    type: "community",
    title: "Pengembang Game Indonesia: Dari Hobi Menjadi Profesi",
    content:
      "Komunitas yang mewadahi para pengembang game tanah air. Belajar, berkolaborasi, dan berkarya bersama...",
    full_content:
      "**Latar Belakang**\n\nIndustri game Indonesia berkembang pesat. Komunitas ini didirikan untuk mewadahi para pengembang game dari berbagai latar belakang.\n\n**Kegiatan Rutin**\n\nKami mengadakan game jam bulanan, sharing session dengan developer senior, dan pameran game indie tahunan. Anggota juga bisa mendapatkan akses ke berbagai tools dan assets gratis.\n\n**Kolaborasi**\n\nBanyak game indie sukses lahir dari kolaborasi anggota komunitas ini. Kami percaya bahwa dengan bersatu, kita bisa menembus pasar global.\n\n**Harapan ke Depan**\n\nKami berharap Indonesia bisa menjadi salah satu pusat pengembangan game dunia. Sudah saatnya game buatan Indonesia dikenal secara internasional.",
    author: "Komunitas Game Dev Indonesia",
    community_name: "Game Dev Indonesia",
    cover_image:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=600&q=80",
    category: "Gaming",
    reading_time: 5,
    like_count: 432,
    comment_count: 67,
    save_count: 234,
    related_slugs: ["komunitas-wanita-di-dunia-teknologi"],
  },
  {
    id: "c3",
    slug: "komunitas-pegunungan-jelajah-nusantara",
    type: "community",
    title: "Pecinta Alam: Jelajah Nusantara Bersama",
    content:
      "Bagi kamu yang cinta alam dan petualangan, komunitas ini adalah tempat yang tepat untuk berbagi pengalaman dan ekspedisi...",
    full_content:
      "**Aktivitas**\n\nKami rutin mengadakan pendakian gunung, camping, dan ekspedisi alam terbuka. Setiap bulan ada trip ke destinasi baru yang menantang.\n\n**Nilai-Nilai**\n\nKomunitas ini menjunjung tinggi nilai-nilai: tidak meninggalkan sampah di alam, saling membantu sesama pendaki, dan menghormati kearifan lokal.\n\n**Pengalaman Berharga**\n\nBanyak anggota yang mengaku mendapatkan perspektif hidup baru setelah bergabung. Alam mengajarkan kerendahan hati dan kekuatan teamwork.\n\n**Persyaratan**\n\nTidak perlu pengalaman mendaki. Kami memiliki program untuk pemula hingga level mahir. Safety selalu menjadi prioritas utama.",
    author: "Komunitas Jelajah Nusantara",
    community_name: "Jelajah Nusantara",
    cover_image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&q=80",
    category: "Alam & Petualangan",
    reading_time: 4,
    like_count: 345,
    comment_count: 56,
    save_count: 189,
    related_slugs: [],
  },
  {
    id: "c4",
    slug: "komunitas-penulis-muda-indonesia",
    type: "community",
    title: "Penulis Muda Indonesia: Menebar Inspirasi Lewat Kata",
    content:
      "Komunitas bagi para penulis muda yang ingin mengasah bakat menulis dan menerbitkan karya bersama...",
    full_content:
      "**Visi**\n\nMenjadi wadah bagi penulis muda Indonesia untuk berkembang dan menghasilkan karya-karya berkualitas yang bisa bersaing di kancah nasional dan internasional.\n\n**Program**\n\nKami memiliki kelas menulis kreatif, klub baca bulanan, mentoring dengan penulis senior, dan kesempatan menerbitkan antologi bersama.\n\n**Prestasi**\n\nBeberapa anggota kami telah berhasil menerbitkan buku solo dan memenangkan lomba menulis tingkat nasional. Komunitas ini menjadi batu loncatan bagi banyak penulis muda.\n\n**Bergabung**\n\nCukup kirimkan satu contoh tulisan terbaikmu. Kami sangat terbuka untuk penulis pemula yang memiliki semangat belajar tinggi.",
    author: "Komunitas Penulis Muda Indonesia",
    community_name: "Penulis Muda Indonesia",
    cover_image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
    category: "Menulis & Literasi",
    reading_time: 3,
    like_count: 567,
    comment_count: 89,
    save_count: 345,
    related_slugs: [],
  },
];

const STORAGE_KEY = "beautifio_anon_posts";

export function getStoredItems(): InspirasiItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveItem(item: InspirasiItem): void {
  if (typeof window === "undefined") return;
  try {
    const items = getStoredItems();
    items.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage full or unavailable
  }
}

export function getAllItems(): InspirasiItem[] {
  return [...DATA, ...getStoredItems()];
}
