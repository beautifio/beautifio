export interface BantuanLembaga {
  id: string;
  kategori: "perlindungan" | "hukum" | "psikologi" | "agama" | "umum";
  nama: string;
  deskripsi: string;
  nomor: string;
  jamOperasional?: string;
  wilayah: string;
}

export const KATEGORI_LABEL: Record<string, string> = {
  perlindungan: "🛡️ Perlindungan",
  hukum: "⚖️ Bantuan Hukum",
  psikologi: "🧠 Konseling",
  agama: "🕌 Konsultasi Agama",
  umum: "📞 Hotline Umum",
};

export const LEMBAGA_BANTUAN: BantuanLembaga[] = [
  {
    id: "sapa129",
    kategori: "perlindungan",
    nama: "SAPA 129 — KemenPPPA",
    deskripsi: "Layanan pengaduan kekerasan terhadap perempuan dan anak",
    nomor: "62811229129",
    jamOperasional: "24 jam",
    wilayah: "nasional",
  },
  {
    id: "lpa",
    kategori: "perlindungan",
    nama: "LPAI — Lembaga Perlindungan Anak Indonesia",
    deskripsi: "Pendampingan dan perlindungan anak korban kekerasan",
    nomor: "6281280003300",
    jamOperasional: "Senin–Jumat 08:00–17:00",
    wilayah: "nasional",
  },
  {
    id: "lbh-apik",
    kategori: "hukum",
    nama: "LBH APIK Jakarta",
    deskripsi: "Bantuan hukum gratis untuk perempuan korban kekerasan",
    nomor: "6281311880070",
    jamOperasional: "Senin–Jumat 09:00–17:00",
    wilayah: "Jakarta dan sekitarnya",
  },
  {
    id: "lbh-masyarakat",
    kategori: "hukum",
    nama: "LBH Masyarakat",
    deskripsi: "Bantuan hukum gratis untuk masyarakat tidak mampu",
    nomor: "6281282993498",
    jamOperasional: "Senin–Jumat 09:00–17:00",
    wilayah: "nasional",
  },
  {
    id: "into-the-light",
    kategori: "psikologi",
    nama: "Into The Light",
    deskripsi: "Konseling kesehatan mental dan dukungan sebaya",
    nomor: "6281212345678",
    jamOperasional: "Senin–Minggu 07:00–21:00",
    wilayah: "nasional",
  },
  {
    id: "sehat-jiwa",
    kategori: "psikologi",
    nama: "Hotline Kesehatan Mental — Kemenkes",
    deskripsi: "Layanan konseling psikologis darurat 119 ekstensi 8",
    nomor: "628111190008",
    jamOperasional: "24 jam",
    wilayah: "nasional",
  },
  {
    id: "mui",
    kategori: "agama",
    nama: "Majelis Ulama Indonesia (MUI)",
    deskripsi: "Konsultasi dan pendampingan agama",
    nomor: "6282188883613",
    jamOperasional: "Senin–Jumat 08:00–16:00",
    wilayah: "nasional",
  },
  {
    id: "darurat-112",
    kategori: "umum",
    nama: "Nomor Darurat 112",
    deskripsi: "Layanan darurat kepolisian, ambulans, pemadam kebakaran",
    nomor: "62112",
    jamOperasional: "24 jam",
    wilayah: "nasional",
  },
];
