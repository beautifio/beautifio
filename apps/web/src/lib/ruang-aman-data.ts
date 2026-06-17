export type FormFieldType = "text" | "textarea" | "tel" | "number" | "select" | "boolean" | "location";

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ExternalContact {
  nama: string;
  deskripsi: string;
  nomor: string;
  jam?: string;
}

export type CarePartnerType =
  | "ustadz" | "psikolog" | "konselor-karir" | "konselor-keuangan"
  | "konselor-hubungan" | "konselor-adiksi" | "peer-counselor";

export interface RuangAmanCategory {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
  guide?: string[];
  formFields: FormField[];
  externalContacts?: ExternalContact[];
  carePartnerType?: CarePartnerType;
  carePartnerLabel?: string;
  emergency?: string;
  needsLocation?: boolean;
  skipGuide?: boolean;
  skipForm?: boolean;
  waiver?: string;
}

const RS_DATASET: Record<string, Record<string, { nama: string; telp: string }[]>> = {
  "DKI Jakarta": {
    "Jakarta Pusat": [
      { nama: "RSUPN Dr. Cipto Mangunkusumo", telp: "021-1500135" },
      { nama: "RSUD Tarakan", telp: "021-3812002" },
    ],
    "Jakarta Selatan": [
      { nama: "RSUP Fatmawati", telp: "021-7501524" },
      { nama: "RS Mayapada Kuningan", telp: "021-29850000" },
    ],
    "Jakarta Timur": [
      { nama: "RSUD Ciracas", telp: "021-87714644" },
      { nama: "RS Pusat Pertamina", telp: "021-29889500" },
    ],
    "Jakarta Barat": [
      { nama: "RSUD Cengkareng", telp: "021-54350000" },
      { nama: "RS Royal Taruma", telp: "021-56988888" },
    ],
    "Jakarta Utara": [
      { nama: "RSUD Koja", telp: "021-44444444" },
      { nama: "RS Pantai Indah Kapuk", telp: "021-5881188" },
    ],
  },
  "Jawa Barat": {
    "Bandung": [
      { nama: "RSUP Dr. Hasan Sadikin", telp: "022-2034953" },
      { nama: "RS Borromeus", telp: "022-2033726" },
    ],
    "Bekasi": [
      { nama: "RSUD Bekasi", telp: "021-88333600" },
      { nama: "RS Sentra Medika", telp: "021-88951111" },
    ],
    "Depok": [
      { nama: "RSUD Depok", telp: "021-77821900" },
    ],
  },
  "Jawa Timur": {
    "Surabaya": [
      { nama: "RSUD Dr. Soetomo", telp: "031-5344460" },
      { nama: "RS Siloam Surabaya", telp: "031-5882111" },
    ],
    "Malang": [
      { nama: "RSUD Dr. Saiful Anwar", telp: "0341-362101" },
    ],
  },
  "Jawa Tengah": {
    "Semarang": [
      { nama: "RSUD Dr. Kariadi", telp: "024-8413477" },
    ],
    "Yogyakarta": [
      { nama: "RSUP Dr. Sardjito", telp: "0274-587333" },
      { nama: "RS Bethesda", telp: "0274-586688" },
    ],
    "Surakarta": [
      { nama: "RSUD Dr. Moewardi", telp: "0271-634634" },
    ],
  },
  "Sumatera Utara": {
    "Medan": [
      { nama: "RSUP H. Adam Malik", telp: "061-8360143" },
    ],
  },
  "Sulawesi Selatan": {
    "Makassar": [
      { nama: "RSUP Dr. Wahidin Sudirohusodo", telp: "0411-424341" },
    ],
  },
  "Bali": {
    "Denpasar": [
      { nama: "RSUP Prof. Dr. I.G. Ngoerah", telp: "0361-227911" },
    ],
  },
  "Kalimantan Timur": {
    "Samarinda": [
      { nama: "RSUD Abdul Wahab Sjahranie", telp: "0541-738118" },
    ],
  },
};

export const PROVINSI_LIST = Object.keys(RS_DATASET).sort();

export function getKotaList(provinsi: string): string[] {
  return Object.keys(RS_DATASET[provinsi] || {}).sort();
}

export function getRekomendasiRS(provinsi: string, kota: string): { nama: string; telp: string }[] {
  return RS_DATASET[provinsi]?.[kota] || [];
}

export const KATEGORI: RuangAmanCategory[] = [
  {
    id: "darurat-medis",
    label: "Darurat Medis",
    emoji: "🚑",
    keywords: ["sakit", "darurat", "medis", "kecelakaan", "luka", "pingsan", "demam", "sakits"],
    guide: [
      "Tetap tenang dan jangan panik.",
      "Jika korban tidak sadar, periksa napas dan denyut nadi.",
      "Jika ada pendarahan, tekan luka dengan kain bersih.",
      "Jangan berikan makanan/minuman pada korban tidak sadar.",
      "Cari bantuan medis segera.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu atau korban" },
      { id: "usia", label: "Usia", type: "number", required: true, placeholder: "Usia korban" },
      { id: "gejala", label: "Gejala / Kondisi", type: "textarea", required: true, placeholder: "Jelaskan gejala atau kondisi yang dialami..." },
      { id: "lokasi", label: "Lokasi", type: "location", required: true },
    ],
    externalContacts: [
      { nama: "Ambulans — 119", deskripsi: "Layanan darurat medis", nomor: "119" },
    ],
    emergency: "119",
    needsLocation: true,
  },
  {
    id: "kebakaran-bencana",
    label: "Kebakaran / Bencana",
    emoji: "🔥",
    keywords: ["kebakaran", "bencana", "banjir", "gempa", "longsor", "tsunami", "angin"],
    guide: [
      "Segera evakuasi ke tempat yang aman.",
      "Jangan menggunakan lift — gunakan tangga darurat.",
      "Jika terjebak, tutup celah pintu dengan kain basah.",
      "Hubungi tim penyelamat dan berikan lokasi yang jelas.",
      "Jangan kembali ke lokasi sampai dinyatakan aman.",
    ],
    formFields: [
      { id: "nama", label: "Nama Pelapor", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "lokasi_bencana", label: "Lokasi Kejadian", type: "textarea", required: true, placeholder: "Alamat lengkap lokasi bencana..." },
      { id: "jenis_bencana", label: "Jenis Bencana", type: "select", required: true, options: [
        { value: "kebakaran", label: "🔥 Kebakaran" },
        { value: "banjir", label: "🌊 Banjir" },
        { value: "gempa", label: "🌍 Gempa Bumi" },
        { value: "longsor", label: "⛰️ Tanah Longsor" },
        { value: "tsunami", label: "🌊 Tsunami" },
        { value: "angin", label: "💨 Angin Kencang" },
        { value: "lainnya", label: "Lainnya" },
      ] },
      { id: "ada_korban", label: "Ada Korban?", type: "boolean", required: true },
    ],
    externalContacts: [
      { nama: "Pemadam Kebakaran — 113", deskripsi: "Laporan kebakaran", nomor: "113" },
      { nama: "Nomor Darurat — 112", deskripsi: "Layanan darurat terpadu", nomor: "112" },
    ],
    emergency: "113",
  },
  {
    id: "kriminal",
    label: "Kriminal / Penganiayaan",
    emoji: "🚔",
    keywords: ["kriminal", "penganiayaan", "pencurian", "perampokan", "penipuan", "kekerasan fisik"],
    guide: [
      "Segera cari tempat yang aman.",
      "Jangan menyentuh atau membersihkan barang bukti.",
      "Dokumentasikan luka dan kerusakan (foto/video).",
      "Laporkan ke kantor polisi terdekat.",
      "Catat nomor laporan polisi untuk tindak lanjut.",
      "Hubungi pendamping hukum jika diperlukan.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "alamat", label: "Alamat", type: "textarea", required: true, placeholder: "Alamat lengkap" },
      { id: "no_hp", label: "No. HP", type: "tel", required: true, placeholder: "Nomor yang bisa dihubungi" },
      { id: "kronologi", label: "Kronologi Kejadian", type: "textarea", required: true, placeholder: "Ceritakan kronologi lengkap..." },
      { id: "sudah_lapor", label: "Sudah Lapor Polisi?", type: "boolean", required: false },
    ],
    externalContacts: [
      { nama: "Polisi — 110", deskripsi: "Laporan darurat kepolisian", nomor: "110" },
      { nama: "LBH Masyarakat", deskripsi: "Bantuan hukum gratis", nomor: "6281282993498", jam: "Senin–Jumat 09:00–17:00" },
    ],
    carePartnerType: "konselor-hubungan",
    carePartnerLabel: "pendampingan hukum dan psikologis",
    emergency: "110",
  },
  {
    id: "pelecehan-seksual",
    label: "Pelecehan Seksual",
    emoji: "⚠️",
    keywords: ["pelecehan", "kekerasan seksual", "perkosaan", "dicabuli", "dipaksa"],
    guide: [
      "Kamu tidak sendiri. Ini bukan salahmu.",
      "Jangan mandi atau membersihkan diri — penting untuk bukti medis.",
      "Segera ke rumah sakit untuk visum.",
      "Simpan bukti (pesan, foto, pakaian).",
      "Laporkan ke pihak berwajib.",
      "Dapatkan pendampingan dari lembaga terpercaya.",
      "Hubungi psikolog untuk pemulihan trauma.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "alamat", label: "Alamat", type: "textarea", required: true, placeholder: "Alamat lengkap" },
      { id: "no_hp", label: "No. HP", type: "tel", required: true, placeholder: "Nomor yang bisa dihubungi" },
      { id: "kronologi", label: "Kronologi Kejadian", type: "textarea", required: true, placeholder: "Ceritakan dengan detail apa yang terjadi..." },
      { id: "sudah_lapor", label: "Sudah Lapor Polisi?", type: "boolean", required: false },
    ],
    externalContacts: [
      { nama: "SAPA 129 — KemenPPPA", deskripsi: "Layanan pengaduan kekerasan terhadap perempuan dan anak", nomor: "62811229129", jam: "24 jam" },
      { nama: "LBH APIK Jakarta", deskripsi: "Pendampingan hukum untuk perempuan korban kekerasan", nomor: "6281311880070", jam: "Senin–Jumat 09:00–17:00" },
    ],
    carePartnerType: "psikolog",
    carePartnerLabel: "pendampingan psikologis",
    emergency: "112",
  },
  {
    id: "bullying",
    label: "Bullying / Cyberbullying",
    emoji: "🛡️",
    keywords: ["bullying", "perundungan", "intimidasi", "dibully", "diolok", "cyberbullying"],
    guide: [
      "Kamu tidak sendiri. Bullying bukan salahmu.",
      "Jangan membalas — ini bisa memperburuk situasi.",
      "Kumpulkan bukti (screenshot, pesan, saksi).",
      "Bicarakan dengan orang dewasa yang kamu percaya.",
      "Laporkan ke pihak sekolah, kampus, atau tempat kerja.",
      "Blokir pelaku di media sosial.",
      "Hubungi konselor untuk dukungan emosional.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "tempat", label: "Sekolah / Kantor / Tempat", type: "text", required: true, placeholder: "Nama institusi" },
      { id: "kronologi", label: "Kronologi", type: "textarea", required: true, placeholder: "Ceritakan apa yang terjadi..." },
      { id: "sudah_lapor", label: "Sudah Lapor Pihak Terkait?", type: "boolean", required: false },
    ],
    externalContacts: [
      { nama: "LPAI", deskripsi: "Lembaga Perlindungan Anak Indonesia", nomor: "6281280003300", jam: "Senin–Jumat 08:00–17:00" },
    ],
    carePartnerType: "psikolog",
    carePartnerLabel: "konseling psikologis",
    emergency: "112",
  },
  {
    id: "kdrt-keluarga",
    label: "KDRT / Konflik Keluarga",
    emoji: "🏠",
    keywords: ["kdrt", "kekerasan rumah tangga", "konflik keluarga", "suami", "istri", "orang tua"],
    guide: [
      "Keselamatanmu adalah prioritas utama.",
      "Jika dalam bahaya, segera keluar dari rumah.",
      "Siapkan dokumen penting dan tas darurat.",
      "Hubungi tetangga atau keluarga terdekat.",
      "Jangan ragu untuk melapor — KDRT adalah tindak pidana.",
      "Dapatkan pendampingan dari lembaga terkait.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "alamat", label: "Alamat", type: "textarea", required: true, placeholder: "Alamat rumah" },
      { id: "kronologi", label: "Kronologi", type: "textarea", required: true, placeholder: "Ceritakan apa yang terjadi..." },
      { id: "ada_anak", label: "Ada Anak yang Terlibat?", type: "boolean", required: false },
    ],
    externalContacts: [
      { nama: "SAPA 129 — KemenPPPA", deskripsi: "Layanan pengaduan kekerasan", nomor: "62811229129", jam: "24 jam" },
    ],
    carePartnerType: "psikolog",
    carePartnerLabel: "konseling keluarga",
    emergency: "112",
  },
  {
    id: "percintaan",
    label: "Percintaan / Putus Cinta",
    emoji: "💔",
    keywords: ["putus cinta", "patah hati", "pacaran", "toxic", "ditinggal", "dikhianati"],
    guide: [
      "Sakit hati itu wajar. Beri waktu untuk dirimu.",
      "Jangan memendam sendiri — cerita pada teman atau keluarga.",
      "Hindari kontak sementara dengan mantan.",
      "Fokus pada hal-hal yang kamu sukai.",
      "Ingat: berakhirnya hubungan bukan akhir dari hidupmu.",
      "Jika perlu, bicara dengan konselor hubungan.",
    ],
    formFields: [
      { id: "nama", label: "Nama Kamu", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "deskripsi", label: "Ceritakan Perasaanmu", type: "textarea", required: true, placeholder: "Apa yang kamu rasakan?" },
    ],
    carePartnerType: "konselor-hubungan",
    carePartnerLabel: "konseling hubungan",
  },
  {
    id: "kesehatan-mental",
    label: "Kesehatan Mental",
    emoji: "🧠",
    keywords: ["cemas", "depresi", "stres", "mental", "psikolog", "konseling", "panik", "insomnia", "bipolar"],
    guide: [
      "Kesehatan mental sama pentingnya dengan kesehatan fisik.",
      "Kamu tidak lemah karena merasa seperti ini.",
      "Coba bicara dengan orang terdekat yang kamu percaya.",
      "Catat apa yang kamu rasakan — ini membantu.",
      "Hindari isolasi — tetaplah terhubung dengan orang lain.",
      "Konsultasi dengan psikolog bisa membantu.",
    ],
    formFields: [
      { id: "nama", label: "Nama Kamu", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "gejala_utama", label: "Gejala Utama", type: "select", required: true, options: [
        { value: "cemas", label: "😰 Cemas berlebihan" },
        { value: "mood-rendah", label: "😔 Mood rendah / sedih terus" },
        { value: "panik", label: "💓 Serangan panik" },
        { value: "insomnia", label: "🌙 Sulit tidur" },
        { value: "lelah", label: "😩 Lelah mental" },
        { value: "marah", label: "😤 Sulit kendalikan emosi" },
        { value: "trauma", label: "😶 Pengalaman traumatis" },
        { value: "lainnya", label: "Lainnya" },
      ] },
      { id: "deskripsi", label: "Ceritakan Lebih Detail", type: "textarea", required: false, placeholder: "Apa yang kamu rasakan akhir-akhir ini?" },
    ],
    externalContacts: [
      { nama: "Hotline Kesehatan Mental — 119 ext 8", deskripsi: "Layanan konseling psikologis darurat 24 jam", nomor: "628111190008", jam: "24 jam" },
      { nama: "Into The Light", deskripsi: "Platform kesehatan mental & pencegahan bunuh diri", nomor: "https://intothelight.id" },
    ],
    carePartnerType: "psikolog",
    carePartnerLabel: "konseling psikologis",
    emergency: "119",
  },
  {
    id: "karir-pendidikan",
    label: "Karir / Pendidikan",
    emoji: "💼",
    keywords: ["karir", "karier", "kerja", "phk", "dipecat", "kuliah", "jurusan", "skripsi", "sidang"],
    guide: [
      "Setiap orang punya jalannya masing-masing.",
      "Evaluasi apa yang membuatmu tidak puas saat ini.",
      "Riset tentang alternatif karir atau pendidikan.",
      "Ikuti tes minat bakat atau konseling karir.",
      "Bangun skill baru lewat kursus atau pelatihan.",
      "Jangan takut memulai dari awal — usia bukan penghalang.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "pendidikan", label: "Pendidikan Terakhir", type: "select", required: true, options: [
        { value: "sd", label: "SD / Sederajat" },
        { value: "smp", label: "SMP / Sederajat" },
        { value: "sma", label: "SMA / Sederajat" },
        { value: "d3", label: "D3" },
        { value: "s1", label: "S1" },
        { value: "s2", label: "S2" },
        { value: "s3", label: "S3" },
      ] },
      { id: "bidang", label: "Bidang / Jurusan", type: "text", required: false, placeholder: "Misal: Teknik, Desain, Kesehatan" },
      { id: "deskripsi", label: "Ceritakan Situasimu", type: "textarea", required: true, placeholder: "Apa yang membuatmu bingung atau khawatir?" },
    ],
    carePartnerType: "konselor-karir",
    carePartnerLabel: "konseling karir dan pendidikan",
  },
  {
    id: "keuangan",
    label: "Keuangan / Hutang",
    emoji: "💰",
    keywords: ["hutang", "utang", "keuangan", "bangkrut", "gaji", "tagihan", "pinjaman"],
    guide: [
      "Masalah keuangan bisa terjadi pada siapa saja.",
      "Evaluasi pemasukan dan pengeluaran dengan jujur.",
      "Prioritaskan: kebutuhan pokok > cicilan > lainnya.",
      "Jangan mengambil pinjaman online ilegal.",
      "Bicarakan dengan keluarga — jangan ditanggung sendiri.",
      "Konsultasi dengan perencana keuangan jika perlu.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "estimasi_hutang", label: "Estimasi Total Hutang", type: "text", required: false, placeholder: "Misal: Rp 10.000.000" },
      { id: "deskripsi", label: "Ceritakan Situasimu", type: "textarea", required: true, placeholder: "Apa yang terjadi?" },
    ],
    carePartnerType: "konselor-keuangan",
    carePartnerLabel: "konseling keuangan",
  },
  {
    id: "konsultasi-agama",
    label: "Konsultasi Agama",
    emoji: "🕌",
    keywords: ["agama", "ibadah", "dosa", "tobat", "nikah", "konsultasi agama", "ustadz", "kyai"],
    guide: [
      "Setiap manusia pernah khilaf — pintu taubat selalu terbuka.",
      "Tidak ada pertanyaan yang bodoh dalam urusan agama.",
      "Konsultasi dengan ahli agama bisa memberikan ketenangan.",
      "Pilih pemuka agama yang kamu percaya.",
      "Jika perlu, lakukan konseling dengan pendamping spiritual.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "agama", label: "Agama", type: "select", required: true, options: [
        { value: "islam", label: "🕌 Islam" },
        { value: "kristen", label: "⛪ Kristen" },
        { value: "katolik", label: "⛪ Katolik" },
        { value: "hindu", label: "🛕 Hindu" },
        { value: "buddha", label: "☸️ Buddha" },
        { value: "lainnya", label: "Lainnya" },
      ] },
      { id: "topik", label: "Topik Konsultasi", type: "textarea", required: true, placeholder: "Apa yang ingin kamu konsultasikan?" },
    ],
    externalContacts: [
      { nama: "MUI — Majelis Ulama Indonesia", deskripsi: "Konsultasi dan pendampingan agama Islam", nomor: "6282188883613", jam: "Senin–Jumat 08:00–16:00" },
    ],
    carePartnerType: "ustadz",
    carePartnerLabel: "pendampingan dan konsultasi agama",
  },
  {
    id: "orientasi-diri",
    label: "Orientasi & Identitas Diri",
    emoji: "🏳️",
    keywords: ["orientasi", "identitas", "lgbt", "gay", "lesbi", "biseksual", "transgender", "coming out"],
    guide: [
      "Dirimu berharga apa pun identitas dan orientasimu.",
      "Kamu tidak sendiri — banyak yang mengalami hal yang sama.",
      "Temukan komunitas yang aman dan suportif.",
      "Jika belum siap 'coming out', tidak apa-apa. Ambil waktumu.",
      "Jaga kesehatan mentalmu — lingkungan yang tidak mendukung bisa berat.",
      "Konsultasi dengan psikolog yang LGBTQ+ friendly.",
    ],
    formFields: [
      { id: "nama", label: "Nama atau Inisial", type: "text", required: true, placeholder: "Nama atau inisial" },
      { id: "butuh_dukungan", label: "Butuh Dukungan?", type: "boolean", required: false },
      { id: "deskripsi", label: "Ceritakan Apa yang Kamu Rasakan", type: "textarea", required: true, placeholder: "Kamu bisa cerita dengan aman di sini..." },
    ],
    carePartnerType: "psikolog",
    carePartnerLabel: "konseling psikologis yang inklusif",
    waiver: "Informasi kamu akan dijaga kerahasiaannya dan tidak akan dibagikan tanpa persetujuanmu.",
  },
  {
    id: "kecanduan",
    label: "Kecanduan",
    emoji: "🎮",
    keywords: ["kecanduan", "adiksi", "game", "judi", "narkoba", "alkohol", "miras"],
    guide: [
      "Mengakui ada masalah adalah langkah pertama yang berani.",
      "Kecanduan adalah kondisi yang bisa diatasi.",
      "Kurangi secara bertahap — jangan berhenti total sekaligus.",
      "Cari aktivitas pengganti yang positif.",
      "Minta dukungan dari keluarga atau teman dekat.",
      "Konsultasi dengan konselor adiksi untuk penanganan lebih lanjut.",
    ],
    formFields: [
      { id: "nama", label: "Nama Lengkap", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "jenis_kecanduan", label: "Jenis Kecanduan", type: "select", required: true, options: [
        { value: "game", label: "🎮 Game" },
        { value: "judi", label: "🃏 Judi / Judi Online" },
        { value: "narkoba", label: "💊 Narkoba" },
        { value: "alkohol", label: "🍺 Alkohol" },
        { value: "hp", label: "📱 HP / Medsos" },
        { value: "lainnya", label: "Lainnya" },
      ] },
      { id: "sudah_berhenti", label: "Sudah Pernah Coba Berhenti?", type: "boolean", required: false },
      { id: "deskripsi", label: "Ceritakan Situasimu", type: "textarea", required: false, placeholder: "Seberapa sering? Sudah berapa lama?" },
    ],
    carePartnerType: "konselor-adiksi",
    carePartnerLabel: "konseling kecanduan",
  },
  {
    id: "kesehatan-seksual",
    label: "Kesehatan Seksual & Reproduksi",
    emoji: "🤰",
    keywords: ["hamil", "kehamilan", "seksual", "pms", "hiv", "kontrasepsi", "kb"],
    guide: [
      "Jangan panik. Kamu bisa mencari informasi yang benar.",
      "Konsultasi dengan tenaga medis terpercaya.",
      "Jika ada kekhawatiran tentang kehamilan atau PMS, periksa ke laboratorium.",
      "Jangan mengambil keputusan terburu-buru dalam tekanan.",
      "Bicara dengan orang yang kamu percaya jika perlu.",
      "Semua orang berhak atas pendidikan kesehatan reproduksi.",
    ],
    formFields: [
      { id: "nama", label: "Nama atau Inisial", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "usia", label: "Usia", type: "number", required: true, placeholder: "Usia kamu" },
      { id: "topik", label: "Topik", type: "select", required: true, options: [
        { value: "hamil", label: "🤰 Kehamilan tidak direncanakan" },
        { value: "pms", label: "🩺 Penyakit menular seksual" },
        { value: "kb", label: "💊 Kontrasepsi / KB" },
        { value: "hiv", label: "❤️ HIV / AIDS" },
        { value: "pendidikan", label: "📚 Pendidikan seksual" },
        { value: "lainnya", label: "Lainnya" },
      ] },
      { id: "deskripsi", label: "Ceritakan Lebih Detail", type: "textarea", required: false, placeholder: "Apa yang ingin kamu tanyakan?" },
    ],
    carePartnerType: "psikolog",
    carePartnerLabel: "konseling kesehatan reproduksi",
  },
  {
    id: "kesepian",
    label: "Kesepian / Kehilangan",
    emoji: "😔",
    keywords: ["kesepian", "kesepian", "kehilangan", "duka", "meninggal", "sendirian", "teman"],
    guide: [
      "Kesepian adalah perasaan yang wajar, kamu tidak sendiri.",
      "Coba hubungi teman atau keluarga — walau hanya untuk bicara.",
      "Ikuti kegiatan sosial atau komunitas yang kamu minati.",
      "Rasa duka butuh waktu — tidak ada batas waktu untuk berduka.",
      "Menulis jurnal bisa membantu memproses perasaan.",
      "Jika berkepanjangan, pertimbangkan konseling.",
    ],
    formFields: [
      { id: "nama", label: "Nama Kamu", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "deskripsi", label: "Apa yang Kamu Rasakan?", type: "textarea", required: true, placeholder: "Ceritakan perasaanmu..." },
    ],
    carePartnerType: "peer-counselor",
    carePartnerLabel: "peer counseling dan pendampingan",
  },
  {
    id: "self-harm",
    label: "Self-harm / Suicide",
    emoji: "🆘",
    keywords: ["bunuh diri", "suicide", "self harm", "menyakiti diri", "mati"],
    skipGuide: true,
    skipForm: true,
    formFields: [],
    waiver: "Kamu sangat berharga. Kamu tidak sendiri. Bantuan tersedia sekarang.",
    externalContacts: [
      { nama: "Hotline Kesehatan Mental — 119 ext 8", deskripsi: "Layanan darurat konseling 24 jam", nomor: "628111190008", jam: "24 jam" },
      { nama: "Into The Light", deskripsi: "Platform pencegahan bunuh diri", nomor: "https://intothelight.id" },
      { nama: "Nomor Darurat — 112", deskripsi: "Layanan darurat terpadu", nomor: "112", jam: "24 jam" },
    ],
    emergency: "119",
  },
  {
    id: "lainnya",
    label: "Lainnya",
    emoji: "📞",
    keywords: [],
    guide: [
      "Ceritakan apa yang kamu alami dan kami akan bantu.",
    ],
    formFields: [
      { id: "nama", label: "Nama Kamu", type: "text", required: true, placeholder: "Nama kamu" },
      { id: "pesan", label: "Apa yang Bisa Kami Bantu?", type: "textarea", required: true, placeholder: "Ceritakan apa yang kamu alami..." },
    ],
    externalContacts: [
      { nama: "Nomor Darurat — 112", deskripsi: "Layanan darurat terpadu", nomor: "112" },
    ],
    emergency: "112",
  },
];

export function getCategoryById(id: string): RuangAmanCategory | undefined {
  return KATEGORI.find((k) => k.id === id);
}

export function detectKategori(text: string): string | null {
  const lower = text.toLowerCase();
  for (const cat of KATEGORI) {
    if (cat.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return cat.id;
    }
  }
  return null;
}

export function waUrl(nomor: string, pesan: string): string {
  return `https://wa.me/${nomor.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(pesan)}`;
}

export function buatTemplateWA(cat: RuangAmanCategory, data: Record<string, string>): string {
  let t = `Halo, saya ${data.nama || "yang bertanya"}.\n\n`;
  t += `Saya butuh bantuan terkait: ${cat.emoji} ${cat.label}\n\n`;

  if (data.deskripsi || data.kronologi) {
    t += `📋 Kronologi:\n${data.deskripsi || data.kronologi || ""}\n\n`;
  }

  if (data.alamat) t += `📍 Alamat: ${data.alamat}\n`;
  if (data.no_hp) t += `📞 No. HP: ${data.no_hp}\n`;
  if (data.tempat) t += `🏫 Tempat: ${data.tempat}\n`;
  if (data.usia) t += `👤 Usia: ${data.usia}\n`;
  if (data.sudah_lapor === "true") t += `✅ Sudah lapor pihak berwajib\n`;
  if (data.sudah_lapor === "false") t += `❌ Belum lapor pihak berwajib\n`;
  if (data.agama) t += `🕌 Agama: ${data.agama}\n`;
  if (data.jenis_kecanduan) t += `🎮 Jenis: ${data.jenis_kecanduan}\n`;
  if (data.topik) t += `📌 Topik: ${data.topik}\n`;

  t += `\nMohon bantuannya. Terima kasih.`;
  return t;
}
