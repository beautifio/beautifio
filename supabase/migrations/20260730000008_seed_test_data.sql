-- Seed test_arah_hidup_questions (60 soal: 20 per modul)

-- ==================== PERSONALITY (OCEAN) ====================
INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('personality','O','Saya suka mencoba hal-hal baru yang belum pernah saya lakukan.',false,1),
('personality','O','Saya menikmati diskusi tentang ide-ide abstrak atau filosofis.',false,2),
('personality','O','Saya lebih suka rutinitas yang sudah dikenal daripada pengalaman baru.',true,3),
('personality','O','Saya sering membayangkan kemungkinan-kemungkinan di masa depan.',false,4),
('personality','C','Saya menyelesaikan tugas tepat waktu.',false,5),
('personality','C','Saya suka membuat daftar dan mengikuti jadwal.',false,6),
('personality','C','Kamar atau meja kerja saya sering berantakan.',true,7),
('personality','C','Saya memperhatikan detail dalam pekerjaan saya.',false,8),
('personality','E','Saya merasa berenergi setelah bersosialisasi dengan banyak orang.',false,9),
('personality','E','Saya lebih suka bekerja sendiri daripada dalam tim.',true,10),
('personality','E','Saya mudah memulai percakapan dengan orang asing.',false,11),
('personality','E','Saya sering menjadi pusat perhatian di acara sosial.',false,12),
('personality','A','Saya peduli dengan perasaan orang lain.',false,13),
('personality','A','Saya sulit menolak permintaan tolong meskipun saya sedang sibuk.',false,14),
('personality','A','Saya tidak tertarik dengan masalah orang lain.',true,15),
('personality','A','Saya percaya bahwa kebanyakan orang pada dasarnya baik.',false,16),
('personality','N','Saya sering merasa cemas tanpa alasan yang jelas.',false,17),
('personality','N','Saya mudah pulih dari suasana hati yang buruk.',true,18),
('personality','N','Saya cenderung overthinking setelah kejadian yang memalukan.',false,19),
('personality','N','Saya jarang merasa tertekan dalam situasi sulit.',true,20);

-- ==================== INTEREST (RIASEC) ====================
INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('interest','R','Saya suka bekerja dengan tangan atau alat-alat fisik.',false,1),
('interest','R','Saya tertarik memperbaiki barang yang rusak.',false,2),
('interest','R','Saya lebih suka pekerjaan di luar ruangan.',false,3),
('interest','I','Saya suka memecahkan masalah dengan logika dan analisis.',false,4),
('interest','I','Saya penasaran tentang bagaimana sesuatu bekerja secara ilmiah.',false,5),
('interest','I','Saya menikmati riset dan mengumpulkan data.',false,6),
('interest','I','Saya tertarik membaca jurnal atau artikel ilmiah.',false,7),
('interest','A2','Saya suka mengekspresikan diri lewat seni atau desain.',false,8),
('interest','A2','Saya menikmati kegiatan kreatif seperti menulis, menggambar, atau musik.',false,9),
('interest','A2','Saya menghargai keindahan dan estetika dalam kehidupan sehari-hari.',false,10),
('interest','S','Saya senang membantu orang lain belajar atau berkembang.',false,11),
('interest','S','Saya lebih memilih pekerjaan yang melibatkan interaksi dengan orang.',false,12),
('interest','S','Saya merasa puas ketika bisa memberi saran yang bermanfaat.',false,13),
('interest','E2','Saya suka memimpin dan mengambil inisiatif dalam kelompok.',false,14),
('interest','E2','Saya tertarik dengan dunia bisnis dan kewirausahaan.',false,15),
('interest','E2','Saya pandai meyakinkan orang lain tentang ide saya.',false,16),
('interest','C2','Saya suka pekerjaan yang terstruktur dengan aturan yang jelas.',false,17),
('interest','C2','Saya teliti dalam mengelola data atau dokumen.',false,18),
('interest','C2','Saya menghargai ketepatan dan efisiensi dalam bekerja.',false,19),
('interest','C2','Saya lebih nyaman dengan rutinitas administratif daripada tugas kreatif.',false,20);

-- ==================== VALUES (Schwartz) ====================
INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('values','SD','Kebebasan menentukan jalan hidup sendiri sangat penting bagi saya.',false,1),
('values','SD','Saya senang mengeksplorasi ide-ide baru dan berpikir kreatif.',false,2),
('values','PO','Saya ingin dihormati dan diakui oleh orang lain.',false,3),
('values','PO','Memiliki kekuasaan dan wewenang penting bagi saya.',false,4),
('values','UN','Keadilan sosial dan kesetaraan adalah nilai yang saya perjuangkan.',false,5),
('values','UN','Saya peduli pada lingkungan dan kesejahteraan semua makhluk.',false,6),
('values','AC','Saya sangat termotivasi untuk mencapai kesuksesan pribadi.',false,7),
('values','AC','Saya menetapkan standar tinggi untuk diri sendiri.',false,8),
('values','SE','Keamanan dan stabilitas adalah prioritas utama dalam hidup saya.',false,9),
('values','SE','Saya lebih memilih lingkungan yang terprediksi dan aman.',false,10),
('values','ST','Saya menyukai tantangan dan sensasi baru dalam hidup.',false,11),
('values','ST','Saya mudah bosan dengan rutinitas yang monoton.',false,12),
('values','CO','Saya menghormati aturan dan norma yang berlaku di masyarakat.',false,13),
('values','CO','Saya percaya pentingnya disiplin diri dan tanggung jawab.',false,14),
('values','TR','Saya menghargai tradisi dan warisan budaya keluarga saya.',false,15),
('values','TR','Agama atau spiritualitas adalah bagian penting dalam hidup saya.',false,16),
('values','BE','Saya selalu siap membantu orang-orang terdekat saya.',false,17),
('values','BE','Kesetiaan dan tanggung jawab pada teman adalah nilai utama saya.',false,18),
('values','HE','Saya percaya bahwa menikmati hidup itu penting.',false,19),
('values','HE','Saya suka memanjakan diri dengan hal-hal yang menyenangkan.',false,20);

-- ==================== PSYCHOLOGISTS ====================
INSERT INTO psychologists (id, full_name, credentials, experience_years, is_verified, is_active) VALUES
('a0000000-0000-0000-0000-000000000099', 'dr. Rina Maharani, M.Psi., Psikolog', 'Psikolog Klinis Dewasa — lulusan Universitas Indonesia', 8, true, true),
('a0000000-0000-0000-0000-00000000009a', 'Ardi Wicaksono, M.Psi., Psikolog', 'Psikolog Karir — lulusan Universitas Gadjah Mada', 5, true, true);
