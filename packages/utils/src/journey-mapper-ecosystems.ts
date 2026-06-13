import type { JmEcosystem } from "./journey-mapper-types";

export const JM_ECOSYSTEMS: JmEcosystem[] = [
  {
    code: "M01",
    slug: "football-player",
    title: "Pesepakbola / Atlet Olahraga",
    description: "Bermain di lapangan, membela tim, menjadi legenda olahraga. Ekosistem luas: klub, media, sponsorship, data, fisio, manajemen.",
    pivotPoint: "Usia 20-25 (tidak lolos seleksi profesional)",
  },
  {
    code: "M02",
    slug: "doctor",
    title: "Dokter / Tenaga Medis",
    description: "Menyembuhkan orang, menyelamatkan nyawa, berkontribusi pada kesehatan. Ekosistem luas: klinik, riset, healthtech, konten, kebijakan, farmasi.",
    pivotPoint: "Tidak lolos UTBK kedokteran / tidak menyelesaikan koas",
  },
  {
    code: "M03",
    slug: "musician",
    title: "Penyanyi / Musisi",
    description: "Tampil di panggung, rekam album, dikenal karena suara dan lagu. Ekosistem luas: produksi, manajemen, pendidikan seni, terapi, konten.",
    pivotPoint: "Usia 18-25 (tidak tembus label / audisi besar)",
  },
  {
    code: "M04",
    slug: "actress",
    title: "Aktris / Pemain Film",
    description: "Tampil di layar lebar atau serial, menghidupkan karakter. Ekosistem luas: produksi, penulisan, casting, desain kostum, konten.",
    pivotPoint: "Usia 20-27 (tidak mendapat peran besar secara konsisten)",
  },
  {
    code: "M05",
    slug: "teacher",
    title: "Guru / Pendidik",
    description: "Mengubah hidup orang lewat ilmu, mendidik generasi. Ekosistem luas: kurikulum, edtech, pelatihan korporat, penulisan, konseling.",
    pivotPoint: "Bisa berlanjut, tapi sering pivot ke sektor lebih tinggi gajinya",
  },
  {
    code: "M06",
    slug: "chef",
    title: "Chef / Koki",
    description: "Memasak untuk banyak orang, punya restoran, ciptakan pengalaman rasa. Ekosistem luas: F&B, gizi, konten kuliner, product development, event.",
    pivotPoint: "Usia 22-28 (tidak dapat modal / peluang restoran besar)",
  },
  {
    code: "M07",
    slug: "designer",
    title: "Desainer / Seniman Visual",
    description: "Menciptakan visual yang mengubah dunia — logo, bangunan, pakaian. Ekosistem luas: UI/UX, game, interior, industri, ilustrasi, film.",
    pivotPoint: "Tidak dapat klien besar / pindah ke jalur lebih komersial",
  },
  {
    code: "M08",
    slug: "entrepreneur",
    title: "Pengusaha / Entrepreneur",
    description: "Punya perusahaan sendiri, menciptakan lapangan kerja, membangun dari nol. Ekosistem luas: konsultasi, investasi, brand strategy, corporate, mentor.",
    pivotPoint: "Startup pertama gagal / kehabisan modal",
  },
  {
    code: "M09",
    slug: "journalist",
    title: "Jurnalis / Penulis",
    description: "Memberitakan dunia, menulis cerita, memengaruhi opini publik. Ekosistem luas: PR, konten, penerbitan, podcast, komunikasi korporat.",
    pivotPoint: "Media cetak tutup / pendapatan tidak cukup",
  },
  {
    code: "M10",
    slug: "psychologist",
    title: "Psikolog / Konselor",
    description: "Membantu orang memahami pikiran dan emosinya. Ekosistem luas: HR, pelatihan, konten mental health, riset, edtech.",
    pivotPoint: "Tidak lulus S2 profesi / mencari dampak lebih luas",
  },
  {
    code: "M11",
    slug: "scientist",
    title: "Ilmuwan / Peneliti",
    description: "Menemukan hal baru, mendorong kemajuan sains dan teknologi. Ekosistem luas: industri, konsultasi, edtech, data, kebijakan, penulisan sains.",
    pivotPoint: "Tidak lanjut S3 / akademisi tidak menarik lagi",
  },
  {
    code: "M12",
    slug: "programmer",
    title: "Programmer / Tech Developer",
    description: "Membangun aplikasi, sistem, dan solusi teknologi. Ekosistem luas: produk digital, data, keamanan siber, AI, konsultasi IT.",
    pivotPoint: "Sudah jalan di jalur ini, pivot ke spesialisasi baru",
  },
];

export function getJmEcosystem(dreamSlug: string): JmEcosystem | undefined {
  return JM_ECOSYSTEMS.find((e) => e.slug === dreamSlug);
}

export function getJmEcosystemByTitle(title: string): JmEcosystem | undefined {
  return JM_ECOSYSTEMS.find((e) => e.title.toLowerCase().includes(title.toLowerCase()));
}

// Maps all known dream template slugs to their journey mapper ecosystem slug
const TEMPLATE_SLUG_TO_ECOSYSTEM: Record<string, string> = {
  "football-player": "football-player",
  "runner": "football-player",
  "athlete": "football-player",
  "golfer": "football-player",
  "doctor": "doctor",
  "musician": "musician",
  "content-creator": "journalist",
  "digital-marketer": "entrepreneur",
  "entrepreneur": "entrepreneur",
  "programmer": "programmer",
  "beauty-creator": "designer",
};

export function getJmEcosystemByTemplateSlug(templateSlug: string): JmEcosystem | undefined {
  const ecosystemSlug = TEMPLATE_SLUG_TO_ECOSYSTEM[templateSlug];
  if (ecosystemSlug) return getJmEcosystem(ecosystemSlug);
  return getJmEcosystem(templateSlug);
}
