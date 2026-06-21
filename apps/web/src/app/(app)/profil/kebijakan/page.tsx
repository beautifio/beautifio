"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@beautifio/ui"

export default function KebijakanPrivasiPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="sticky top-0 z-30 bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-text-primary flex-1">Kebijakan Privasi</h1>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-6 text-sm text-text-primary leading-relaxed">
            <p>
              Kebijakan Privasi ini menjelaskan bagaimana <strong>Beautifio</strong> mengumpulkan,
              menggunakan, dan melindungi informasi pribadi Anda saat menggunakan platform kami.
              Dengan menggunakan Beautifio, Anda menyetujui praktik yang dijelaskan dalam kebijakan ini.
            </p>

            <section>
              <h2 className="text-base font-bold mb-2">1. Data yang Kami Kumpulkan</h2>
              <p className="mb-2">Kami mengumpulkan data berikut saat Anda mendaftar dan menggunakan Beautifio:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nama lengkap dan alamat email (dari akun Google atau manual)</li>
                <li>Informasi profil opsional: foto, tanggal lahir, alamat, bio</li>
                <li>Data aktivitas: mimpi, tujuan hidup, cerita harian, progres journey</li>
                <li>Data interaksi: komentar di Curhat, pesan di Bisik, partisipasi Tebak</li>
                <li>Data teknis: alamat IP, jenis perangkat, browser, halaman yang dikunjungi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2">2. Penggunaan Data</h2>
              <p className="mb-2">Data Anda digunakan untuk:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Menyediakan dan meningkatkan layanan Beautifio</li>
                <li>Personalisasi konten dan rekomendasi</li>
                <li>Keamanan platform dan pencegahan penyalahgunaan</li>
                <li>Analitik internal untuk pengembangan fitur</li>
                <li>Komunikasi terkait akun dan layanan</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2">3. Perlindungan Privasi di Fitur Bisik</h2>
              <p>
                Fitur Bisik menggunakan mekanisme deteksi otomatis untuk melindungi privasi Anda.
                Nomor telepon, alamat email, dan informasi kontak lainnya akan secara otomatis
                terdeteksi dan ditampilkan dalam bentuk tersamarkan (masking). Informasi pribadi
                yang dikirimkan melalui Bisik dapat dicatat untuk tujuan keamanan dan dapat
                mengakibatkan pembatasan akun jika melanggar aturan.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2">4. Penyimpanan dan Keamanan</h2>
              <p>
                Data Anda disimpan di server yang aman dengan enkripsi. Kami menggunakan
                layanan Supabase dan Vercel yang telah memenuhi standar keamanan industri.
                Kami tidak menjual data pribadi Anda kepada pihak ketiga mana pun.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2">5. Cookie dan Pelacakan</h2>
              <p>
                Kami menggunakan cookie esensial untuk otentikasi dan keamanan. Kami juga
                menggunakan cookie analitik untuk memahami penggunaan platform. Anda dapat
                mengontrol preferensi cookie melalui pengaturan browser Anda.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2">6. Hak Anda</h2>
              <p className="mb-2">Anda memiliki hak untuk:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Mengakses data pribadi yang kami simpan</li>
                <li>Memperbaiki data yang tidak akurat</li>
                <li>Menghapus akun dan data Anda</li>
                <li>Menarik persetujuan pemrosesan data</li>
                <li>Keberatan terhadap pemrosesan data untuk kepentingan tertentu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold mb-2">7. Perubahan Kebijakan</h2>
              <p>
                Kebijakan privasi ini dapat diperbarui dari waktu ke waktu. Perubahan akan
                diumumkan melalui platform atau email. Dengan terus menggunakan Beautifio
                setelah perubahan, Anda menyetujui kebijakan yang diperbarui.
              </p>
            </section>

            <section className="!mt-8 pt-4 border-t border-border">
              <h2 className="text-base font-bold mb-2">Kontak</h2>
              <p>
                Jika ada pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui
                email di <span className="text-primary">hi@beautifio.id</span>.
              </p>
              <p className="mt-2 text-text-secondary text-[10px]">
                Terakhir diperbarui: Juni 2026
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
