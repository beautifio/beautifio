-- Seed data for Cerita (Stories) Module
-- Categories are auto-inserted by migration. This seeds stories + recommendations.

WITH cat AS (
  SELECT id, slug FROM story_categories
)
INSERT INTO stories (slug, title, cover_image, author_name, content, category_id, reading_time, like_count, save_count, comment_count, is_published, published_at) VALUES

-- Education (3 stories)
(
  'cara-belajar-efektif-di-era-digital',
  'Cara Belajar Efektif di Era Digital',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
  'Rina Amalia',
  '<p>Belajar di era digital penuh tantangan dan peluang. Dengan platform online, AI, dan sumber daya tak terbatas, cara belajar harus beradaptasi.</p><h2>1. Teknik Pomodoro</h2><p>Fokus 25 menit, istirahat 5 menit. Ulangi 4 kali lalu istirahat panjang. Terbukti meningkatkan produktivitas hingga 40%.</p><h2>2. AI sebagai Tutor</h2><p>Gunakan ChatGPT atau Gemini untuk menjelaskan konsep sulit dengan analogi sederhana.</p><h2>3. Mind Mapping</h2><p>Visualisasikan hubungan antar topik. Otak lebih mudah mengingat informasi yang terstruktur.</p><h2>4. Belajar Bareng</h2><p>Gabung circle atau forum diskusi. Diskusi memperkuat pemahaman.</p>',
  (SELECT id FROM cat WHERE slug = 'education'), 5, 42, 28, 7, true, '2026-06-01T08:00:00Z'
),
(
  'rekomendasi-beasiswa-2026',
  'Rekomendasi Beasiswa 2026 untuk Pelajar Indonesia',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
  'Budi Santoso',
  '<p>Tahun 2026 membuka banyak kesempatan beasiswa. Berikut yang wajib kamu coba.</p><h2>1. LPDP</h2><p>Beasiswa paling prestisius dari Kemenkeu. S2/S3 dalam dan luar negeri. Deadline Maret dan September 2026.</p><h2>2. Erasmus Mundus</h2><p>Beasiswa penuh untuk Master di Eropa. Termasuk biaya hidup dan tiket pesawat.</p><h2>3. Beasiswa Unggulan</h2><p>Dari Kemendikbudristek untuk S1, S2, S3 berprestasi.</p><h2>Tips Lolos</h2><p>Esai kuat, IPK minimal 3.5, dan pengalaman organisasi yang relevan.</p>',
  (SELECT id FROM cat WHERE slug = 'education'), 4, 38, 35, 12, true, '2026-06-03T10:00:00Z'
),
(
  'tips-memilih-jurusan-kuliah',
  'Tips Memilih Jurusan Kuliah yang Tepat',
  'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?w=800&q=80',
  'Sari Indah',
  '<p>Memilih jurusan kuliah adalah keputusan besar. Jangan asal pilih!</p><h2>1. Kenali Minat dan Bakat</h2><p>Apa yang kamu suka lakukan? Apa yang kamu kuasai? Jawabannya adalah petunjuk pertama.</p><h2>2. Riset Prospek Karir</h2><p>Cari tahu peluang kerja, gaji rata-rata, dan perkembangan industri terkait jurusan tersebut.</p><h2>3. Konsultasi</h2><p>Bicara dengan kakak kelas, alumni, atau profesional di bidang yang kamu minati.</p><h2>4. Coba Sebelum Memutuskan</h2><p>Ikuti kursus online atau webinar tentang jurusan yang diminati sebelum mendaftar.</p>',
  (SELECT id FROM cat WHERE slug = 'education'), 5, 33, 24, 9, true, '2026-06-06T09:00:00Z'
),

-- Career (3 stories)
(
  'panduan-membangun-karir-di-teknologi',
  'Panduan Membangun Karir di Industri Teknologi',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  'Dimas Pratama',
  '<p>Industri teknologi terus berkembang. Ini panduan lengkap memulai karir di dunia tech.</p><h2>1. Pilih Jalur</h2><p>Frontend, Backend, Data Science, DevOps, atau PM? Tentukan fokus sejak awal.</p><h2>2. Portofolio</h2><p>Buat proyek nyata. Kontribusi open source. Website portofolio pribadi.</p><h2>3. Networking</h2><p>Hadiri meetup, ikuti hackathon, gabung komunitas Discord atau Telegram.</p><h2>4. Sertifikasi</h2><p>AWS, Google Cloud, atau Meta Certified. Sertifikasi meningkatkan kredibilitas.</p>',
  (SELECT id FROM cat WHERE slug = 'career'), 6, 56, 44, 15, true, '2026-06-05T09:00:00Z'
),
(
  'tips-lolos-wawancara-kerja',
  'Cara Lolos Wawancara Kerja di Perusahaan Impian',
  'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80',
  'Sari Indah',
  '<p>Wawancara kerja sering menjadi momok. Tapi dengan persiapan matang, kamu pasti bisa.</p><h2>Sebelum Wawancara</h2><p>Riset perusahaan, pahami job desc, siapkan pengalaman relevan dengan metode STAR.</p><h2>Saat Wawancara</h2><p>Kontak mata, bicara percaya diri, dan jangan ragu bertanya tentang budaya perusahaan.</p><h2>Follow Up</h2><p>Kirim email terima kasih dalam 24 jam. Ini menunjukkan antusiasme dan profesionalisme.</p>',
  (SELECT id FROM cat WHERE slug = 'career'), 4, 31, 22, 9, true, '2026-06-07T11:00:00Z'
),
(
  'membangun-personal-branding-gen-z',
  'Membangun Personal Branding untuk Gen Z',
  'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80',
  'Andini Putri',
  '<p>Personal branding bukan cuma untuk selebritas. Gen Z perlu membangun personal brand sejak dini.</p><h2>1. Tentukan Niche</h2><p>Apa keahlian utamamu? Fokus pada satu bidang yang kamu kuasai dan sukai.</p><h2>2. Konsisten di Media Sosial</h2><p>LinkedIn untuk profesional, Instagram untuk visual, Twitter/X untuk opini dan wawasan.</p><h2>3. Bagikan Pengetahuan</h2><p>Buat konten edukatif, tutorial, atau opini. Tunjukkan bahwa kamu paham bidangmu.</p><h2>4. Bangun Jaringan</h2><p>Interaksi dengan profesional lain, komentar insightful, dan hadiri event industri.</p>',
  (SELECT id FROM cat WHERE slug = 'career'), 5, 44, 31, 11, true, '2026-06-10T08:00:00Z'
),

-- Business (2 stories)
(
  'ide-bisnis-online-modal-kecil',
  '7 Ide Bisnis Online Modal Kecil untuk Mahasiswa',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80',
  'Andini Putri',
  '<p>Pengen punya penghasilan sendiri tapi modal terbatas? Coba ide-ide ini.</p><h2>1. Dropshipping</h2><p>Jual tanpa stok barang. Modal utama untuk iklan dan promosi.</p><h2>2. Jasa Desain</h2><p>Modal laptop dan skill. Tawarkan jasa desain logo, poster, konten medsos.</p><h2>3. Content Creator</h2><p>Monetisasi hobi. TikTok, YouTube, atau IG bisa jadi sumber penghasilan.</p><h2>4. Affiliate Marketing</h2><p>Promosikan produk orang lain, dapatkan komisi. Tanpa modal.</p><h2>5. Jasa Admin Remote</h2><p>Banyak UKM butuh admin online. Cukup laptop dan koneksi internet.</p><h2>6. Thrifting</h2><p>Jual barang second berkualitas. Modal kecil, margin besar.</p><h2>7. Les Online</h2><p>Ajarkan skill yang kamu kuasai: bahasa Inggris, matematika, coding.</p>',
  (SELECT id FROM cat WHERE slug = 'business'), 6, 48, 33, 11, true, '2026-06-08T07:00:00Z'
),
(
  'cara-membuat-business-plan',
  'Cara Membuat Business Plan Sederhana untuk Pemula',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  'Pak Rudi',
  '<p>Business plan adalah peta jalan bisnismu. Tidak perlu rumit, yang penting jelas.</p><h2>Executive Summary</h2><p>Gambaran singkat bisnis, visi, dan misi. Tulis di akhir setelah semua bagian selesai.</p><h2>Analisis Pasar</h2><p>Siapa target pasar? Siapa kompetitor? Apa keunggulan produkmu?</p><h2>Strategi Marketing</h2><p>Online atau offline? Media apa yang paling efektif menjangkau targetmu?</p><h2>Proyeksi Keuangan</h2><p>Biaya awal, estimasi pendapatan, dan kapan break-even point tercapai.</p>',
  (SELECT id FROM cat WHERE slug = 'business'), 5, 24, 18, 6, true, '2026-06-10T06:00:00Z'
),

-- Sports (2 stories)
(
  'panduan-olahraga-pemula-tanpa-cedera',
  'Panduan Olahraga untuk Pemula Tanpa Cedera',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
  'Fajar Hidayat',
  '<p>Mulai olahraga itu mudah asal dilakukan dengan benar. Ikuti panduan ini.</p><h2>Mulai Ringan</h2><p>Jalan cepat 15-20 menit per hari. Jangan langsung lari atau angkat beban berat.</p><h2>Pemanasan 5-10 Menit</h2><p>Penting untuk menyiapkan otot dan sendi. Kurangi risiko cedera hingga 50%.</p><h2>Konsistensi > Intensitas</h2><p>3-4 kali seminggu lebih baik daripada 1 kali tapi berat.</p><h2>Dengarkan Tubuh</h2><p>Sakit atau kelelahan? Istirahat. Cedera terjadi saat kamu memaksakan diri.</p>',
  (SELECT id FROM cat WHERE slug = 'sports'), 4, 29, 17, 5, true, '2026-06-09T14:00:00Z'
),
(
  'gerakan-olahraga-simpel-di-rumah',
  '5 Gerakan Olahraga Simpel yang Bisa Dilakukan di Rumah',
  'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
  'Gita Permata',
  '<p>Malas ke gym? Tenang, 5 gerakan ini bisa dilakukan di kamar kos.</p><h2>1. Squat (3x15 repetisi)</h2><p>Menguatkan kaki, paha, dan bokong. Pastikan punggung tetap lurus.</p><h2>2. Push-up (3x10 repetisi)</h2><p>Menguatkan dada, bahu, dan trisep. Bisa dimodifikasi dengan lutut.</p><h2>3. Plank (3x30 detik)</h2><p>Menguatkan inti tubuh. Jaga tubuh tetap lurus dari kepala hingga kaki.</p><h2>4. Lunges (3x12 per kaki)</h2><p>Menguatkan kaki dan meningkatkan keseimbangan.</p><h2>5. Jumping Jacks (3x30 detik)</h2><p>Cardio sederhana untuk meningkatkan denyut jantung.</p>',
  (SELECT id FROM cat WHERE slug = 'sports'), 4, 21, 15, 4, true, '2026-06-12T08:00:00Z'
),

-- Music (2 stories)
(
  'belajar-gitar-otodidak-30-hari',
  'Belajar Gitar Otodidak dalam 30 Hari',
  'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
  'Kevin Alexander',
  '<p>Pengen bisa main gitar? Ikuti program 30 hari ini.</p><h2>Minggu 1: Dasar</h2><p>Kenali bagian gitar, cara tuning, dan chord dasar (A, D, E, G, C).</p><h2>Minggu 2: Transisi</h2><p>Latihan perpindahan antar chord. Mulai dengan lagu 2-3 chord.</p><h2>Minggu 3: Strumming</h2><p>Pelajari pola strumming dasar. Dengarkan irama dan ikuti.</p><h2>Minggu 4: Lagu Utuh</h2><p>Pilih lagu favorit yang chordnya dikuasai. Mainkan dari awal sampai akhir.</p>',
  (SELECT id FROM cat WHERE slug = 'music'), 5, 36, 25, 8, true, '2026-06-06T12:00:00Z'
),
(
  'rekomendasi-daw-gratis-produksi-musik',
  'Rekomendasi DAW Gratis untuk Produksi Musik Pemula',
  'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&q=80',
  'Linda Kusuma',
  '<p>Digital Audio Workstation (DAW) adalah software produksi musik. Ini rekomendasi yang gratis!</p><h2>1. GarageBand (macOS)</h2><p>Gratis, intuitif, banyak loop bawaan. Cocok untuk pemula mutlak.</p><h2>2. Cakewalk (Windows)</h2><p>DAW profesional gratis. Fitur setara dengan software berbayar.</p><h2>3. LMMS (Windows/Mac/Linux)</h2><p>Open source. Cocok untuk produksi musik elektronik.</p><h2>4. BandLab (Browser/Mobile)</h2><p>Bisa langsung dari browser. Kolaborasi dengan musisi lain secara real-time.</p>',
  (SELECT id FROM cat WHERE slug = 'music'), 4, 19, 14, 3, true, '2026-06-11T15:00:00Z'
),

-- Gaming (2 stories)
(
  'tips-meningkatkan-aim-game-fps',
  'Tips Meningkatkan Aim di Game FPS',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80',
  'Rizky Ferdian',
  '<p>Mau aim lebih tajam? Terapkan tips berikut secara konsisten.</p><h2>1. Sensitivity</h2><p>Gunakan DPI rendah (400-800) untuk aim stabil. Sesuaikan dengan kenyamanan.</p><h2>2. Aim Trainer</h2><p>Aim Lab atau Kovaaks 15 menit sebelum main. Ini seperti pemanasan sebelum olahraga.</p><h2>3. Hafalkan Maps</h2><p>Posisi spawn musuh, sudut penting, dan rotasi. Pengetahuan map = setengah kemenangan.</p><h2>4. Komunikasi</h2><p>Callout jelas dan singkat. Tim yang komunikatif punya win rate lebih tinggi.</p>',
  (SELECT id FROM cat WHERE slug = 'gaming'), 4, 45, 20, 10, true, '2026-06-04T16:00:00Z'
),
(
  'game-mobile-ringan-semua-hp',
  'Rekomendasi Game Mobile Ringan untuk Semua HP',
  'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=800&q=80',
  'Teguh Wicaksono',
  '<p>HP spek rendah bukan halangan buat main game. Coba game-game berikut.</p><h2>1. Stardew Valley (~100 MB)</h2><p>Simulasi bertani yang adiktif. Bisa offline. Satu session bisa berjam-jam.</p><h2>2. Alto Odyssey (~150 MB)</h2><p>Endless runner visual indah. Soundtrack menenangkan. Cocok untuk melepas penat.</p><h2>3. 8 Ball Pool (~200 MB)</h2><p>Game billiard online. Kompetitif dan ringan. Jutaan pemain aktif.</p><h2>4. Mini Metro (~80 MB)</h2><p>Puzzle strategis membangun jalur kereta. Minimalis dan bikin ketagihan.</p><h2>5. Soul Knight (~200 MB)</h2><p>Roguelike RPG dengan pixel art. Karakter unik dan replayability tinggi.</p>',
  (SELECT id FROM cat WHERE slug = 'gaming'), 4, 28, 16, 7, true, '2026-06-13T10:00:00Z'
),

-- Creator (2 stories)
(
  'panduan-lengkap-content-creator',
  'Panduan Lengkap Memulai Jadi Content Creator',
  'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&q=80',
  'Maya Sari',
  '<p>Content creator adalah profesi impian banyak anak muda. Ini panduan memulainya.</p><h2>1. Tentukan Niche</h2><p>Apa yang kamu kuasai? Teknologi, fashion, makanan, edukasi? Fokus pada satu niche.</p><h2>2. Pilih Platform</h2><p>TikTok untuk video pendek, YouTube untuk konten panjang, IG untuk foto/Reels.</p><h2>3. Konsistensi</h2><p>Buat jadwal posting dan patuhi. Algoritma menyukai kreator yang konsisten.</p><h2>4. Interaksi</h2><p>Balas komentar, buat polling, minta pendapat. Bangun komunitas, bukan hanya audiens.</p>',
  (SELECT id FROM cat WHERE slug = 'creator'), 5, 39, 30, 9, true, '2026-06-02T13:00:00Z'
),
(
  'strategi-konten-viral-tiktok-2026',
  'Strategi Konten Viral di TikTok 2026',
  'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80',
  'Nando Prabowo',
  '<p>Viral di TikTok bukan cuma keberuntungan. Ada strategi di baliknya.</p><h2>1. Hook 3 Detik Pertama</h2><p>Momen paling menarik di awal. Kalau tidak menarik dalam 3 detik, mereka scroll.</p><h2>2. Tren Audio</h2><p>Pantau FYP dan gunakan sound yang sedang tren. Ini faktor ranking utama.</p><h2>3. Durasi 15-30 Detik</h2><p>Retensi lebih tinggi. Sampaikan pesan dengan cepat dan padat.</p><h2>4. Caption + CTA</h2><p>Ajak audiens like, comment, atau follow. Engagement boosting.</p><h2>5. Posting di Jam Prime</h2><p>Pagi (6-8), siang (12-14), malam (19-22). Sesuaikan dengan target audiens.</p>',
  (SELECT id FROM cat WHERE slug = 'creator'), 4, 52, 38, 14, true, '2026-06-08T17:00:00Z'
),

-- Beauty (2 stories)
(
  'skincare-routine-kulit-berminyak',
  'Skincare Routine Sederhana untuk Kulit Berminyak',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  'Citra Dewi',
  '<p>Kulit berminyak bukan masalah. Dengan rutinitas yang tepat, kulit tetap sehat dan fresh.</p><h2>Step 1: Gentle Cleanser</h2><p>Cuci muka 2x sehari dengan facial wash yang mengandung salicylic acid atau niacinamide.</p><h2>Step 2: Toner</h2><p>Pilih toner tanpa alkohol. Membantu menyeimbangkan pH kulit.</p><h2>Step 3: Moisturizer</h2><p>Pelembab ringan, oil-free, non-comedogenic. Jangan skip meski kulit berminyak.</p><h2>Step 4: Sunscreen</h2><p>SPF 30+ setiap pagi. Minyak di kulit bukan alasan untuk tidak pakai sunscreen.</p><h2>Bonus: Clay Mask</h2><p>1-2 kali seminggu untuk menyerap minyak berlebih dan membersihkan pori.</p>',
  (SELECT id FROM cat WHERE slug = 'beauty'), 5, 44, 32, 13, true, '2026-06-05T10:00:00Z'
),
(
  'tutorial-makeup-natural-sehari-hari',
  'Tutorial Makeup Natural untuk Sehari-hari',
  'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80',
  'Indah Wulandari',
  '<p>Makeup natural bikin penampilan lebih segar tanpa menor. Ikuti step ini.</p><h2>1. Persiapan Kulit</h2><p>Primer ringan agar makeup tahan lama dan tidak menyumbat pori.</p><h2>2. Base</h2><p>BB Cream atau tinted moisturizer. Hindari foundation tebal untuk look natural.</p><h2>3. Mata</h2><p>Maskara dan brow gel sudah cukup. Skip eyeshadow atau gunakan warna nude.</p><h2>4. Pipi</h2><p>Cream blush warna peach atau pink. Beri kesan sehat alami.</p><h2>5. Bibir</h2><p>Lip tint atau lip balm dengan warna natural: pink, peach, atau nude.</p><h2>6. Setting</h2><p>Setting spray ringan agar makeup tahan seharian tanpa terasa berat.</p>',
  (SELECT id FROM cat WHERE slug = 'beauty'), 5, 33, 26, 8, true, '2026-06-14T09:00:00Z'
),

-- Technology (2 stories)
(
  'pengenalan-ai-untuk-pemula',
  'Pengenalan Artificial Intelligence untuk Pemula',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
  'Pak Anton',
  '<p>AI bukan lagi fiksi ilmiah. Ini sudah jadi bagian hidup kita sehari-hari.</p><h2>Apa itu AI?</h2><p>Kecerdasan buatan yang memungkinkan mesin belajar dari data dan membuat keputusan.</p><h2>Machine Learning</h2><p>AI yang belajar dari data tanpa diprogram eksplisit. Contoh: rekomendasi Netflix, spam filter.</p><h2>Deep Learning</h2><p>Subset ML menggunakan neural network. Dipakai di ChatGPT, mobil otonom, dan voice assistant.</p><h2>Mulai Belajar</h2><p>CS50 AI (Harvard), Fast.ai, Google AI. Semua gratis dan bisa diakses online.</p>',
  (SELECT id FROM cat WHERE slug = 'technology'), 6, 61, 47, 18, true, '2026-06-01T06:00:00Z'
),
(
  'rekomendasi-gadget-mahasiswa-2026',
  'Rekomendasi Gadget Terbaik untuk Mahasiswa 2026',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  'Bella Safira',
  '<p>Gadget yang tepat menunjang produktivitas kuliah. Ini rekomendasi terbaik 2026.</p><h2>Laptop</h2><p>MacBook Air M4 atau ThinkPad X1 Carbon. Minimal 16GB RAM untuk multitasking.</p><h2>Tablet</h2><p>iPad Air atau Samsung Tab S10. Untuk baca jurnal, catat kuliah, dan sketsa.</p><h2>Smartphone</h2><p>Baterai 5000mAh+, kamera cukup untuk scan dokumen. Prioritaskan daya tahan.</p><h2>Aksesoris</h2><p>Mouse ergonomis, power bank 20.000 mAh, dan TWS noise-cancelling untuk fokus belajar.</p>',
  (SELECT id FROM cat WHERE slug = 'technology'), 4, 37, 29, 10, true, '2026-06-09T08:00:00Z'
);

-- Story Recommendations (roadmap, circle, product)
INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'roadmap', '1', 'Roadmap Belajar AI', 'Panduan langkah demi langkah belajar AI dari nol hingga mahir.'
FROM stories WHERE slug = 'pengenalan-ai-untuk-pemula';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'circle', '1', 'Tech Founders Circle', 'Diskusi dan kolaborasi untuk para tech enthusiast.'
FROM stories WHERE slug = 'panduan-membangun-karir-di-teknologi';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'product', '1', 'Skill Academy Subscription', 'Platform kursus online dengan ribuan materi dan sertifikat resmi.'
FROM stories WHERE slug = 'cara-belajar-efektif-di-era-digital';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'circle', '2', 'Creative Lab Circle', 'Ruang berkarya untuk desainer, penulis, dan content creator.'
FROM stories WHERE slug = 'panduan-lengkap-content-creator';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'roadmap', '2', 'Roadmap Jadi Content Creator', 'Panduan step-by-step dari 0 hingga 10.000 followers.'
FROM stories WHERE slug = 'strategi-konten-viral-tiktok-2026';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'product', '2', 'Canva Pro', 'Tools desain grafis untuk membuat konten visual yang menarik.'
FROM stories WHERE slug = 'membangun-personal-branding-gen-z';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'circle', '3', 'Data Science ID Circle', 'Komunitas belajar data science dan AI untuk pemula.'
FROM stories WHERE slug = 'pengenalan-ai-untuk-pemula';

INSERT INTO story_recommendations (story_id, resource_type, resource_id, resource_name, resource_description)
SELECT id, 'product', '3', 'Notion Plus', 'All-in-one workspace untuk organisasi belajar dan bisnis.'
FROM stories WHERE slug = 'ide-bisnis-online-modal-kecil';
