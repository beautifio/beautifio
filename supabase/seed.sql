-- Seed data for Cerita (Stories) module

-- Insert sample stories across all 9 categories
INSERT INTO stories (slug, title, cover_image, author_id, author_name, author_avatar, content, category, reading_time, like_count, save_count, comment_count, is_published, published_at) VALUES
-- Education
(
  'cara-belajar-efektif-di-era-digital',
  'Cara Belajar Efektif di Era Digital',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  NULL, 'Rina Amalia', NULL,
  '<p>Belajar di era digital membawa banyak tantangan dan peluang. Dengan hadirnya berbagai platform pembelajaran online, AI, dan sumber daya tak terbatas, cara kita belajar harus beradaptasi.</p><h2>1. Gunakan Teknik Pomodoro</h2><p>Teknik Pomodoro membantu kamu fokus selama 25 menit, lalu istirahat 5 menit. Ulangi siklus ini 4 kali, lalu ambil istirahat lebih panjang.</p><h2>2. Manfaatkan AI sebagai Tutor Pribadi</h2><p>Gunakan ChatGPT atau Google Gemini untuk menjelaskan konsep yang sulit. Minta mereka memberikan analogi, contoh, atau latihan soal.</p><h2>3. Buat Peta Konsep</h2><p>Visualisasikan hubungan antar topik menggunakan mind map. Ini membantu otak memahami struktur pengetahuan secara keseluruhan.</p><h2>4. Bergabung dengan Komunitas Belajar</h2><p>Belajar sendiri itu membosankan. Cari circle atau forum diskusi yang sesuai dengan bidang yang kamu pelajari.</p>',
  'education', 5, 42, 28, 7, true, '2026-06-01T08:00:00Z'
),
(
  'rekomendasi-beasiswa-2026',
  'Rekomendasi Beasiswa 2026 untuk Anak Muda',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  NULL, 'Budi Santoso', NULL,
  '<p>Tahun 2026 membuka banyak kesempatan beasiswa bagi pelajar Indonesia. Berikut adalah beberapa beasiswa terbaik yang bisa kamu lamar.</p><h2>1. LPDP</h2><p>Beasiswa paling prestisius dari Kemenkeu untuk S2 dan S3 dalam dan luar negeri. Deadline: Maret dan September 2026.</p><h2>2. Erasmus Mundus</h2><p>Beasiswa penuh untuk program Master di Eropa. Mencakup biaya kuliah, hidup, dan tiket pesawat.</p><h2>3. Beasiswa Unggulan</h2><p>Dari Kemendikbudristek untuk mahasiswa berprestasi. Tersedia untuk jenjang S1, S2, dan S3.</p><h2>Tips Lolos Beasiswa</h2><p>Siapkan esai yang kuat, jaga IPK minimal 3.5, dan kumpulkan pengalaman organisasi yang relevan.</p>',
  'education', 4, 38, 35, 12, true, '2026-06-03T10:00:00Z'
),

-- Career
(
  'panduan-membangun-karir-di-tech-industry',
  'Panduan Membangun Karir di Tech Industry',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  NULL, 'Dimas Pratama', NULL,
  '<p>Industri teknologi terus berkembang pesat. Berikut panduan lengkap untuk memulai dan membangun karir di dunia tech.</p><h2>1. Pilih Jalur Karir</h2><p>Frontend, Backend, Data Science, DevOps, atau Product Management? Tentukan minatmu dan fokus.</p><h2>2. Bangun Portofolio</h2><p>Buat proyek nyata. Kontribusi ke open source. Buat personal website yang menampilkan karyamu.</p><h2>3. Networking</h2><p>Hadiri meetup tech, ikuti hackathon, gabung komunitas Discord atau Telegram.</p><h2>4. Sertifikasi</h2><p>Ambil sertifikasi AWS, Google Cloud, atau Meta untuk menambah kredibilitas.</p>',
  'career', 6, 56, 44, 15, true, '2026-06-05T09:00:00Z'
),
(
  'tips-lolos-wawancara-kerja',
  'Tips Lolos Wawancara Kerja di Perusahaan Impian',
  'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80',
  NULL, 'Sari Indah', NULL,
  '<p>Wawancara kerja sering menjadi momok, tapi sebenarnya bisa dipersiapkan. Yuk simak tips berikut.</p><h2>Persiapan Sebelum Wawancara</h2><p>Riset perusahaan, pahami job description, dan siapkan contoh pengalaman relevan menggunakan metode STAR (Situation, Task, Action, Result).</p><h2>Saat Wawancara</h2><p>Jaga kontak mata, bicara jelas dan percaya diri. Jangan ragu untuk bertanya tentang budaya perusahaan.</p><h2>Follow Up</h2><p>Kirim email terima kasih setelah wawancara. Ini menunjukkan antusiasme dan profesionalisme.</p>',
  'career', 4, 31, 22, 9, true, '2026-06-07T11:00:00Z'
),

-- Business
(
  'ide-bisnis-online-modal-kecil',
  'Ide Bisnis Online Modal Kecil untuk Mahasiswa',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
  NULL, 'Andini Putri', NULL,
  '<p>Memulai bisnis tidak perlu modal besar. Berikut ide bisnis online yang cocok untuk mahasiswa.</p><h2>1. Dropshipping</h2><p>Jual produk tanpa stok barang. Kamu hanya perlu toko online dan supplier yang terpercaya.</p><h2>2. Jasa Desain Grafis</h2><p>Modal laptop dan skill desain. Tawarkan jasa pembuatan logo, poster, atau konten media sosial.</p><h2>3. Content Creator</h2><p>Monetisasi hobi membuat konten di TikTok, YouTube, atau Instagram.</p><h2>4. Affiliate Marketing</h2><p>Promosikan produk orang lain dan dapatkan komisi dari setiap penjualan.</p>',
  'business', 5, 48, 33, 11, true, '2026-06-08T07:00:00Z'
),
(
  'cara-membuat-business-plan-sederhana',
  'Cara Membuat Business Plan Sederhana',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  NULL, 'Pak Rudi', NULL,
  '<p>Business plan adalah peta jalan untuk bisnismu. Tidak perlu rumit, yang penting jelas dan terstruktur.</p><h2>Executive Summary</h2><p>Gambaran singkat tentang bisnis, visi, dan misi.</p><h2>Analisis Pasar</h2><p>Siapa target pasar? Siapa kompetitor? Apa keunggulan produkmu?</p><h2>Strategi Pemasaran</h2><p>Bagaimana kamu akan menjangkau pelanggan? Online atau offline?</p><h2>Proyeksi Keuangan</h2><p>Estimasi biaya, pendapatan, dan kapan titik balik modal (break-even point).</p>',
  'business', 5, 24, 18, 6, true, '2026-06-10T06:00:00Z'
),

-- Sports
(
  'tips-mulai-olahraga-untuk-pemula',
  'Tips Mulai Olahraga untuk Pemula Tanpa Cedera',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  NULL, 'Fajar Hidayat', NULL,
  '<p>Mulai olahraga itu mudah jika dilakukan dengan benar. Ikuti panduan ini agar tetap aman dan konsisten.</p><h2>Mulai dari yang Ringan</h2><p>Jangan langsung memaksakan diri. Mulai dengan jalan cepat 15-20 menit per hari.</p><h2>Pemanasan dan Pendinginan</h2><p>Selalu lakukan pemanasan 5-10 menit sebelum olahraga dan pendinginan setelahnya untuk mencegah cedera.</p><h2>Atur Jadwal</h2><p>Konsistensi lebih penting daripada intensitas. Jadwalkan 3-4 kali seminggu.</p><h2>Dengarkan Tubuhmu</h2><p>Jika sakit atau kelelahan, istirahatlah. Cedera terjadi ketika kamu memaksa.</p>',
  'sports', 3, 29, 17, 5, true, '2026-06-09T14:00:00Z'
),
(
  'rekomendasi-olahraga-untuk-pekerja-kantor',
  'Rekomendasi Olahraga untuk Pekerja Kantor',
  'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
  NULL, 'Gita Permata', NULL,
  '<p>Duduk seharian di depan komputer bisa berdampak buruk bagi kesehatan. Berikut olahraga yang cocok dilakukan pekerja kantor.</p><h2>Stretching di Meja Kerja</h2><p>Lakukan peregangan leher, bahu, dan punggung setiap 1 jam sekali. Hanya butuh 2 menit.</p><h2>Jalan Kaki</h2><p>Gunakan tangga, parkir jauh, atau jalan kaki saat istirahat makan siang. Target 10.000 langkah per hari.</p><h2>Yoga atau Pilates</h2><p>Baik untuk postur tubuh dan mengurangi stres. Cukup 20 menit sehari di rumah.</p>',
  'sports', 4, 21, 15, 4, true, '2026-06-12T08:00:00Z'
),

-- Music
(
  'belajar-gitar-otodidak-dari-nol',
  'Belajar Gitar Otodidak dari Nol dalam 30 Hari',
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
  NULL, 'Kevin Alexander', NULL,
  '<p>Ingin bisa main gitar? Ikuti panduan 30 hari ini untuk pemula mutlak.</p><h2>Minggu 1: Kenali Gitarmu</h2><p>Pelajari bagian-bagian gitar, cara tuning, dan chord dasar (A, D, E, G, C).</p><h2>Minggu 2: Chord Transisi</h2><p>Latihan perpindahan antar chord. Mulai dengan lagu yang hanya punya 2-3 chord.</p><h2>Minggu 3: Strumming Patterns</h2><p>Pelajari pola strumming dasar. Dengarkan irama lagu dan ikuti.</p><h2>Minggu 4: Mainkan Lagu Utuh</h2><p>Pilih lagu favorit yang chordnya dikuasai dan mainkan dari awal sampai akhir.</p>',
  'music', 5, 36, 25, 8, true, '2026-06-06T12:00:00Z'
),
(
  'daw-untuk-pemula-rekomendasi-dan-tips',
  'DAW untuk Pemula: Rekomendasi dan Tips Produksi Musik',
  'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80',
  NULL, 'Linda Kusuma', NULL,
  '<p>Digital Audio Workstation (DAW) adalah software untuk membuat musik. Berikut rekomendasi DAW untuk pemula.</p><h2>1. GarageBand (macOS) - Gratis</h2><p>Cocok untuk pemula. Antarmuka intuitif, banyak loop bawaan.</p><h2>2. FL Studio (Windows/Mac) - Mulai $99</h2><p>Populer di kalangan producer musik elektronik. Workflow pattern-based.</p><h2>3. Ableton Live (Windows/Mac) - Mulai $99</h2><p>Standar industri untuk live performance dan produksi.</p><h2>4. BandLab - Gratis (Browser/App)</h2><p>Bisa langsung dari browser. Cocok untuk coba-coba.</p>',
  'music', 4, 19, 14, 3, true, '2026-06-11T15:00:00Z'
),

-- Gaming
(
  'tips-meningkatkan-skill-di-game-fps',
  'Tips Meningkatkan Skill di Game FPS',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  NULL, 'Rizky Ferdian', NULL,
  '<p>Mau jadi pemain FPS yang lebih baik? Ikuti tips-tips berikut untuk meningkatkan aim dan game sense.</p><h2>1. Atur Sensitivity Mouse</h2><p>Gunakan sensitivity yang rendah untuk aim yang lebih stabil. Cari setting yang paling nyaman.</p><h2>2. Latihan Aim</h2><p>Gunakan aim trainer seperti Aim Lab atau Kovaaks selama 15 menit sebelum main.</p><h2>3. Pelajari Maps</h2><p>Hafal layout map, posisi musuh biasa spawn, dan sudut-sudut penting.</p><h2>4. Komunikasi Tim</h2><p>Callout yang jelas sangat penting. Jangan ragu ngomong kalau ada musuh.</p>',
  'gaming', 4, 45, 20, 10, true, '2026-06-04T16:00:00Z'
),
(
  'rekomendasi-game-mobile-ringan',
  'Rekomendasi Game Mobile Ringan untuk Mengisi Waktu',
  'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800&q=80',
  NULL, 'Teguh Wicaksono', NULL,
  '<p>Hape kamu spek rendah? Tenang, masih banyak game seru yang ringan di kantong.</p><h2>1. Stardew Valley - 100 MB</h2><p>Game simulasi bertani yang adiktif. Bisa dimainkan offline.</p><h2>2. Alto Odyssey - 150 MB</h2><p>Game endless runner dengan visual yang indah dan soundtrack menenangkan.</p><h2>3. 8 Ball Pool - 200 MB</h2><p>Game billiard online dengan jutaan pemain aktif.</p><h2>4. Mini Metro - 80 MB</h2><p>Game puzzle strategis tentang membangun jalur kereta bawah tanah.</p>',
  'gaming', 3, 28, 16, 7, true, '2026-06-13T10:00:00Z'
),

-- Creator
(
(
  'panduan-mulai-jadi-content-creator',
  'Panduan Lengkap Mulai Jadi Content Creator',
  'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80',
  NULL, 'Maya Sari', NULL,
  '<p>Content creator adalah salah satu profesi paling populer saat ini. Berikut panduan memulainya.</p><h2>1. Tentukan Niche</h2><p>Apa yang kamu kuasai? Teknologi, fashion, makanan, atau edukasi? Fokus pada satu niche dulu.</p><h2>2. Pilih Platform</h2><p>TikTok untuk video pendek, YouTube untuk konten panjang, Instagram untuk foto dan Reels.</p><h2>3. Konsistensi adalah Raja</h2><p>Upload konten secara konsisten. Buat jadwal posting dan patuhi.</p><h2>4. Interaksi dengan Audiens</h2><p>Balas komentar, buat polling, dan minta pendapat audiens. Bangun komunitas.</p>',
  'creator', 5, 39, 30, 9, true, '2026-06-02T13:00:00Z'
),
(
  'tips-membuat-video-viral-di-tiktok',
  'Tips Membuat Video Viral di TikTok 2026',
  'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80',
  NULL, 'Nando Prabowo', NULL,
  '<p>Viral di TikTok bukan hanya soal keberuntungan. Ada strategi di baliknya.</p><h2>1. Hook di 3 Detik Pertama</h2><p>Taruh momen paling menarik di awal video agar orang tidak scroll.</p><h2>2. Gunakan Tren Audio</h2><p>Pantau halaman For You dan gunakan lagu atau sound yang sedang tren.</p><h2>3. Durasi Ideal 15-30 Detik</h2><p>Video pendek punya retensi lebih tinggi. Sampaikan pesan dengan cepat.</p><h2>4. Caption dan CTA</h2><p>Gunakan caption yang menarik dan ajak audiens untuk like, comment, atau follow.</p>',
  'creator', 4, 52, 38, 14, true, '2026-06-08T17:00:00Z'
),

-- Beauty
(
  'skincare-routine-untuk-remaja',
  'Skincare Routine Sederhana untuk Remaja',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  NULL, 'Citra Dewi', NULL,
  '<p>Merawat kulit tidak perlu ribet dan mahal. Berikut basic skincare routine untuk remaja.</p><h2>Step 1: Cleanser</h2><p>Cuci muka 2 kali sehari dengan facial wash yang sesuai jenis kulitmu.</p><h2>Step 2: Moisturizer</h2><p>Melembabkan kulit agar tidak kering. Pilih yang ringan dan non-comedogenic.</p><h2>Step 3: Sunscreen</h2><p>Wajib! Gunakan SPF 30+ setiap pagi, bahkan di dalam ruangan sekalipun.</p><h2>Jangan Lupa</h2><p>Ganti sarung bantal secara rutin, minum air putih 8 gelas per hari, dan tidur cukup.</p>',
  'beauty', 4, 44, 32, 13, true, '2026-06-05T10:00:00Z'
),
(
  'tutorial-makeup-natural-untuk-kuliah',
  'Tutorial Makeup Natural untuk Sehari-hari',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  NULL, 'Indah Wulandari', NULL,
  '<p>Makeup natural membuat penampilan lebih segar tanpa terlihat menor. Yuk simak step-by-stepnya.</p><h2>Siapkan Kulit</h2><p>Gunakan primer agar makeup tahan lama. Pilih yang ringan dan tidak menyumbat pori.</p><h2>Base Makeup</h2><p>Gunakan BB Cream atau tinted moisturizer, bukan foundation tebal.</p><h2>Mata</h2><p>Cukup maskara dan brow gel. Skip eyeshadow untuk look natural.</p><h2>Bibir</h2><p>Lip tint atau lip balm dengan warna natural seperti pink atau peach.</p>',
  'beauty', 4, 33, 26, 8, true, '2026-06-14T09:00:00Z'
),

-- Technology
(
  'pengenalan-artificial-intelligence-untuk-pemula',
  'Pengenalan Artificial Intelligence untuk Pemula',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  NULL, 'Pak Anton', NULL,
  '<p>AI bukan lagi masa depan — ini sudah hadir. Yuk pahami dasar-dasarnya.</p><h2>Apa itu AI?</h2><p>Artificial Intelligence adalah simulasi kecerdasan manusia oleh mesin. Termasuk di dalamnya machine learning dan deep learning.</p><h2>Machine Learning</h2><p>AI yang bisa belajar dari data tanpa diprogram secara eksplisit. Contoh: rekomendasi Netflix.</p><h2>Deep Learning</h2><p>Subset dari ML yang menggunakan neural network. Digunakan di ChatGPT, self-driving cars.</p><h2>Belajar dari Mana?</h2><p>Mulai dari kursus gratis: CS50 AI, Fast.ai, atau Google AI.</p>',
  'technology', 6, 61, 47, 18, true, '2026-06-01T06:00:00Z'
),
(
  'rekomendasi-gadget-untuk-mahasiswa-2026',
  'Rekomendasi Gadget untuk Mahasiswa 2026',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  NULL, 'Bella Safira', NULL,
  '<p>Memilih gadget yang tepat sangat penting untuk menunjang perkuliahan.</p><h2>Laptop</h2><p>MacBook Air M2 atau ThinkPad X1 Carbon untuk produktivitas. Pastikan minimal 16GB RAM.</p><h2>Tablet</h2><p>iPad (generasi terbaru) atau Samsung Tab S9 untuk membaca dan mencatat.</p><h2>Smartphone</h2><p>Prioritaskan baterai tahan lama dan kamera yang cukup untuk scan dokumen.</p><h2>Aksesoris</h2><p>Mouse ergonomis, power bank 20.000 mAh, dan earphone noise-cancelling.</p>',
  'technology', 4, 37, 29, 10, true, '2026-06-09T08:00:00Z'
);

-- Insert story recommendations
INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description, resource_image)
SELECT id, 'roadmap', '1', 'Roadmap Belajar AI', 'Panduan langkah demi langkah belajar AI dari nol hingga mahir.', NULL
FROM stories WHERE slug = 'pengenalan-artificial-intelligence-untuk-pemula';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description, resource_image)
SELECT id, 'circle', '1', 'Tech Founders Circle', 'Diskusi dan kolaborasi untuk para tech enthusiast.', NULL
FROM stories WHERE slug = 'panduan-membangun-karir-di-tech-industry';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description, resource_image)
SELECT id, 'product', '1', 'Skill Academy', 'Platform kursus online dengan sertifikat resmi.', NULL
FROM stories WHERE slug = 'cara-belajar-efektif-di-era-digital';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description, resource_image)
SELECT id, 'circle', '2', 'Creative Lab Circle', 'Ruang berkarya untuk creator dan desainer.', NULL
FROM stories WHERE slug = 'panduan-mulai-jadi-content-creator';
