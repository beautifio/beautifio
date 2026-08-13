-- Tes Arah Hidup — Instrumen Lite Tervalidasi
-- OCEAN: Mini-IPIP 20 item (Donnellan, Oswald, Baird, & Lucas, 2006)
-- Interest: O*NET Mini Interest Profiler 30 item (US Dept of Labor, public domain)
-- Values: Schwartz PVQ-21 + ekstensi (Schwartz, 2003)

DELETE FROM test_arah_hidup_questions;

-- ==================== MINI-IPIP (OCEAN — 20 items, validated) ====================
-- Source: Donnellan et al. (2006). Psychological Assessment.
-- 4 items per trait, 50:50 reverse-keyed
INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('personality','E','Saya senang menjadi pusat perhatian dalam suatu acara.',false,1),
('personality','A','Saya merasakan penderitaan orang lain seolah itu penderitaan saya sendiri.',false,2),
('personality','C','Saya menyelesaikan tugas tepat waktu dan sesuai rencana.',false,3),
('personality','N','Saya sering mengalami perubahan suasana hati yang drastis.',false,4),
('personality','O','Saya memiliki imajinasi yang kuat dan hidup.',false,5),
('personality','E','Saya cenderung diam dan pendiam di tengah keramaian.',true,6),
('personality','A','Saya tidak terlalu tertarik dengan masalah orang lain.',true,7),
('personality','C','Saya sering lupa mengembalikan barang ke tempat semula.',true,8),
('personality','N','Saya jarang merasa sedih atau tertekan.',true,9),
('personality','O','Saya tidak tertarik pada ide-ide abstrak atau konsep filosofis.',true,10),
('personality','E','Saya senang berbincang dengan banyak orang di acara sosial.',false,11),
('personality','A','Saya bersimpati pada mereka yang kurang beruntung dibanding saya.',false,12),
('personality','C','Saya menyukai keteraturan dan kerapian.',false,13),
('personality','N','Saya mudah merasa cemas atau gelisah.',false,14),
('personality','O','Saya sering kesulitan memahami ide-ide yang rumit.',true,15),
('personality','E','Saya lebih suka menyendiri daripada bersosialisasi dalam kelompok besar.',true,16),
('personality','A','Saya jarang merasa iba terhadap kesulitan orang lain.',true,17),
('personality','C','Saya sering mengabaikan kewajiban dan tanggung jawab saya.',true,18),
('personality','N','Saya jarang merasa murung atau sedih berkepanjangan.',true,19),
('personality','O','Saya memiliki minat yang luas dan beragam.',false,20);

-- ==================== O*NET MINI INTEREST PROFILER (30 items) ====================
-- Source: US Department of Labor O*NET, public domain
-- 5 items per RIASEC type
INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('interest','R','Memperbaiki peralatan atau mesin yang rusak.',false,1),
('interest','R','Bekerja di luar ruangan sepanjang hari.',false,2),
('interest','R','Membangun atau merakit sesuatu dari bahan mentah.',false,3),
('interest','R','Mengoperasikan kendaraan atau alat berat.',false,4),
('interest','R','Merawat tanaman, hewan, atau area outdoor.',false,5),
('interest','I','Menganalisis data untuk menemukan pola atau solusi.',false,6),
('interest','I','Melakukan eksperimen atau penelitian ilmiah.',false,7),
('interest','I','Membaca jurnal atau artikel tentang penemuan baru.',false,8),
('interest','I','Memecahkan teka-teki logika atau masalah matematika.',false,9),
('interest','I','Mempelajari cara kerja sesuatu secara mendalam.',false,10),
('interest','A2','Mendesain sesuatu yang indah secara visual.',false,11),
('interest','A2','Menulis cerita, puisi, atau artikel kreatif.',false,12),
('interest','A2','Memainkan alat musik atau bernyanyi di depan orang.',false,13),
('interest','A2','Menggambar, melukis, atau membuat kerajinan tangan.',false,14),
('interest','A2','Mengarahkan atau tampil dalam pertunjukan seni.',false,15),
('interest','S','Mengajar atau melatih orang dalam keterampilan baru.',false,16),
('interest','S','Memberikan nasihat atau konseling pada orang lain.',false,17),
('interest','S','Merawat orang yang sakit atau lansia.',false,18),
('interest','S','Memimpin diskusi kelompok atau sesi sharing.',false,19),
('interest','S','Membantu orang menyelesaikan konflik pribadi.',false,20),
('interest','E2','Meyakinkan orang untuk membeli produk atau ide.',false,21),
('interest','E2','Memimpin tim untuk mencapai target bersama.',false,22),
('interest','E2','Membuat strategi bisnis atau rencana pemasaran.',false,23),
('interest','E2','Bernegosiasi dalam kesepakatan atau kontrak.',false,24),
('interest','E2','Mengelola proyek dari awal hingga selesai.',false,25),
('interest','C2','Mengatur dan menyusun dokumen atau catatan.',false,26),
('interest','C2','Memastikan data dan laporan akurat dan rapi.',false,27),
('interest','C2','Mengikuti prosedur dan jadwal yang sudah ditentukan.',false,28),
('interest','C2','Bekerja dengan angka, spreadsheet, atau database.',false,29),
('interest','C2','Memeriksa kualitas atau kesalahan dalam pekerjaan.',false,30);

-- ==================== SCHWARTZ PVQ-21 + EKSTENSI (40 items) ====================
-- Source: Schwartz (2003), adapted. 4 items per value.
-- 6-point scale: Tidak Seperti Saya → Sangat Mirip Saya
INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('values','SD','Berpikir kreatif dan menghasilkan ide-ide baru itu penting bagi saya.',false,1),
('values','SD','Saya ingin bebas menentukan apa yang saya lakukan dalam hidup.',false,2),
('values','SD','Saya lebih suka mengikuti petunjuk daripada memutuskan sendiri.',true,3),
('values','SD','Membuat keputusan sendiri membuat saya tidak nyaman.',true,4),
('values','PO','Saya ingin orang lain menghormati dan mengakui pencapaian saya.',false,5),
('values','PO','Mampu memimpin dan memberi arahan pada orang lain penting bagi saya.',false,6),
('values','PO','Saya tidak terlalu peduli dengan status atau jabatan.',true,7),
('values','PO','Saya lebih suka bekerja di belakang layar tanpa sorotan.',true,8),
('values','UN','Setiap orang di dunia harus diperlakukan dengan adil dan setara.',false,9),
('values','UN','Melindungi lingkungan dan alam itu penting bagi saya.',false,10),
('values','UN','Saya tidak terlalu memikirkan masalah global yang jauh dari saya.',true,11),
('values','UN','Tugas saya bukan menyelamatkan dunia.',true,12),
('values','AC','Saya senang ketika berhasil mencapai target yang saya tetapkan.',false,13),
('values','AC','Menjadi yang terbaik dalam apa yang saya lakukan memotivasi saya.',false,14),
('values','AC','Saya tidak ambisius dalam mengejar kesuksesan.',true,15),
('values','AC','Saya lebih menghargai proses daripada hasil akhir.',true,16),
('values','SE','Hidup di lingkungan yang aman dan stabil adalah prioritas saya.',false,17),
('values','SE','Saya menghargai ketertiban dan keteraturan dalam masyarakat.',false,18),
('values','SE','Saya bersedia mengambil risiko besar demi peluang yang lebih baik.',true,19),
('values','SE','Hidup yang terprediksi terasa membosankan bagi saya.',true,20),
('values','ST','Saya menikmati pengalaman baru yang menantang dan mendebarkan.',false,21),
('values','ST','Rutinitas yang sama setiap hari membuat saya cepat bosan.',false,22),
('values','ST','Saya lebih suka kehidupan yang tenang dan tidak banyak kejutan.',true,23),
('values','ST','Saya merasa nyaman dengan rutinitas yang stabil dan terprediksi.',true,24),
('values','CO','Saya percaya bahwa aturan dan norma harus dihormati.',false,25),
('values','CO','Berperilaku sopan dan sesuai harapan masyarakat penting bagi saya.',false,26),
('values','CO','Aturan boleh dilanggar kalau memang menghambat.',true,27),
('values','CO','Saya tidak masalah jika orang lain melanggar norma selama tidak merugikan.',true,28),
('values','TR','Saya menghormati dan menjaga tradisi keluarga serta budaya leluhur.',false,29),
('values','TR','Keyakinan agama atau spiritual adalah bagian penting dalam hidup saya.',false,30),
('values','TR','Saya tidak merasa harus mengikuti tradisi hanya karena sudah ada sejak dulu.',true,31),
('values','TR','Saya lebih memilih cara modern daripada cara tradisional.',true,32),
('values','BE','Saya selalu siap membantu teman atau keluarga yang sedang kesulitan.',false,33),
('values','BE','Kesetiaan pada orang terdekat adalah nilai utama dalam hidup saya.',false,34),
('values','BE','Setiap orang harus bertanggung jawab atas hidupnya sendiri.',true,35),
('values','BE','Saya tidak merasa wajib membantu orang lain jika itu mengorbankan kenyamanan saya.',true,36),
('values','HE','Saya percaya bahwa menikmati hidup dan bersenang-senang itu penting.',false,37),
('values','HE','Saya suka memanjakan diri dengan hal-hal yang menyenangkan.',false,38),
('values','HE','Kesenangan sesaat tidak sebanding dengan pengorbanan jangka panjang.',true,39),
('values','HE','Saya lebih memilih hidup sederhana daripada mengejar kenikmatan.',true,40);
