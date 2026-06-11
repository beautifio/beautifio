import type { StageInfo, ZoneInfo, SpiritualPreference } from "@beautifio/types";

export const STAGE_INFO: Record<string, StageInfo> = {
  sd: {
    stage: "sd",
    label: "SD",
    emoji: "🧒",
    ageRange: "7–12 tahun",
    description: "Masa pertumbuhan awal — bangun kebiasaan dan minat dasar.",
  },
  smp: {
    stage: "smp",
    label: "SMP",
    emoji: "🧑",
    ageRange: "13–15 tahun",
    description: "Fase kritis — eksplorasi bakat dan mulailah menemukan mimpi.",
  },
  sma: {
    stage: "sma",
    label: "SMA",
    emoji: "🧑‍🎓",
    ageRange: "16–18 tahun",
    description: "Fase penentuan arah — fokuskan energi pada satu bidang.",
  },
  university: {
    stage: "university",
    label: "Kuliah",
    emoji: "🎓",
    ageRange: "19–23 tahun",
    description: "Masa pengembangan profesional dan fondasi karir.",
  },
  "early-career": {
    stage: "early-career",
    label: "Awal Karir",
    emoji: "💼",
    ageRange: "24–29 tahun",
    description: "Bangun reputasi, belajar industri, dan naikkan value diri.",
  },
  professional: {
    stage: "professional",
    label: "Profesional",
    emoji: "🏆",
    ageRange: "30–45 tahun",
    description: "Masa puncak performa — lead, mentor, dan impact.",
  },
  mastery: {
    stage: "mastery",
    label: "Mastery",
    emoji: "👑",
    ageRange: "45+ tahun",
    description: "Warisi ilmu, bangun legacy, dan berikan kembali ke generasi berikutnya.",
  },
};

export const ZONE_INFO: Record<string, ZoneInfo> = {
  comfort: {
    zone: "comfort",
    label: "Zona Nyaman",
    friendlyLabel: "Saya merasa hidup saya nyaman saat ini",
    friendlyDescription: "Sekarang semuanya terasa cukup nyaman dan belum banyak tantangan baru.",
    emoji: "🛋️",
    description: "Kamu aman dan nyaman, tapi tidak bertumbuh. Tidak ada yang salah — tapi mimpi besar tidak pernah lahir di sini.",
    encouragement: "Ambiiiiil satu langkah kecil ke arah mimpimu. Rasa tidak nyaman adalah temanmu.",
  },
  fear: {
    zone: "fear",
    label: "Zona Takut",
    friendlyLabel: "Saya ingin berubah tapi masih takut",
    friendlyDescription: "Saya punya impian atau target, tetapi masih sering ragu, malu, atau takut gagal.",
    emoji: "😟",
    description: "Kamu ingin maju tapi ragu, takut gagal, takut dihakimi. Ini titik paling banyak orang menyerah. Tapi kamu di sini — sadar — yang artinya kamu peduli.",
    encouragement: "Keberanian bukan tidak takut. Keberanian adalah bertindak meskipun takut. Satu langkah kecil hari ini.",
  },
  learning: {
    zone: "learning",
    label: "Zona Belajar",
    friendlyLabel: "Saya sedang banyak belajar hal baru",
    friendlyDescription: "Saya mulai mencoba hal baru, belajar kemampuan baru, dan terus berlatih.",
    emoji: "📚",
    description: "Kamu mulai mengambil tantangan. Belajar hal baru. Kadang gagal — dan itu artinya kamu benar-benar belajar.",
    encouragement: "Kegagalan = data. Bukan vonis. Setiap error adalah progress. Terus!",
  },
  growth: {
    zone: "growth",
    label: "Zona Bertumbuh",
    friendlyLabel: "Saya sedang berkembang dan mengejar impian",
    friendlyDescription: "Saya punya tujuan yang jelas dan sedang berusaha mencapainya setiap hari.",
    emoji: "🚀",
    description: "Kamu sudah menemukan ritme. Tantangan yang dulu sulit sekarang terasa biasa. Kamu menginspirasi orang lain tanpa sadar.",
    encouragement: "Sekarang saatnya naikkan standar. Cari tantangan baru. Ingat — ada yang melihatmu dan terinspirasi.",
  },
};

export const SPIRITUAL_PRACTICES: Record<SpiritualPreference, { label: string; examples: string[] }> = {
  islam: {
    label: "Islam",
    examples: [
      "Sholat 5 waktu tepat waktu",
      "Baca Al-Qur'an 15 menit",
      "Dzikir pagi & petang",
      "Puasa sunnah (Senin-Kamis)",
      "Sedekah hari ini",
      "Doa sebelum & sesudah aktivitas",
      "Istighfar & muhasabah diri",
    ],
  },
  kristen: {
    label: "Kristen",
    examples: [
      "Doa pagi & syukur hari ini",
      "Baca Alkitab & renungan harian",
      "Hadiri ibadah minggu",
      "Praktikkan kasih — bantu sesama",
      "Renungan malam sebelum tidur",
      "Bersyukur dalam segala hal",
    ],
  },
  katholik: {
    label: "Katolik",
    examples: [
      "Doa pagi — tawarkan hari pada Tuhan",
      "Baca Kitab Suci & renungan",
      "Rosario atau doa harian",
      "Hadiri misa minggu",
      "Praktikkan belas kasih",
      "Examen harian — refleksi diri",
    ],
  },
  hindu: {
    label: "Hindu",
    examples: [
      "Meditasi & yoga harian",
      "Persembahyangan (Tri Sandhya)",
      "Baca kitab suci (Veda/Bhagavad Gita)",
      "Karma yoga — bekerja tanpa pamrih",
      "Vegetarian atau makanan sattvic",
      "Bersyukur pada alam semesta",
    ],
  },
  buddha: {
    label: "Buddha",
    examples: [
      "Meditasi kesadaran penuh (mindfulness)",
      "Baca dhamma & refleksi",
      "Praktikkan metta (cinta kasih) pada semua makhluk",
      "Hidup sederhana dan puas",
      "Praktikkan sila — etika sehari-hari",
      "Bersyukur pada saat ini",
    ],
  },
  konghucu: {
    label: "Konghucu",
    examples: [
      "Baca kitab & refleksi ajaran",
      "Bakti pada orang tua dan leluhur",
      "Praktikkan ren, yi, li (welas asih, kebenaran, sopan santun)",
      "Belajar dan memperbaiki diri setiap hari",
      "Jaga harmoni dalam relasi",
      "Bersyukur pada Tian (Tuhan) dan alam",
    ],
  },
  agnostic: {
    label: "Agnostik",
    examples: [
      "Luangkan waktu refleksi diri 10 menit",
      "Bersyukur pada hal-hal baik hari ini",
      "Jurnal pribadi tentang makna hidup",
      "Nikmati alam tanpa distraksi",
      "Baca filsafat atau non-fiksi",
      "Praktikkan kebaikan tanpa alasan",
    ],
  },
  other: {
    label: "Lainnya",
    examples: [
      "Luangkan waktu untuk refleksi pribadi",
      "Praktikkan rasa syukur setiap hari",
      "Hubungkan dengan alam dan sekitarmu",
      "Jurnal tentang apa yang berarti bagimu",
      "Lakukan kebaikan untuk sesama",
      "Hargai momen hening dan keheningan",
    ],
  },
};

export const DEFAULT_LIFE_CAPITAL = {
  knowledge: 20,
  skill: 20,
  health: 30,
  relationship: 25,
  character: 25,
  spiritual: 30,
};
