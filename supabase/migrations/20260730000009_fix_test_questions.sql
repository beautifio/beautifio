-- ==================== PERSONALITY (OCEAN - 20 soal, balanced) ====================
-- 4 items per dimension: 2 positive + 2 reverse = 50:50

INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('personality','O','Saya senang mengeksplorasi ide-ide baru dan tidak biasa.',false,1),
('personality','O','Saya sering tenggelam dalam lamunan dan membayangkan berbagai kemungkinan.',false,2),
('personality','O','Saya merasa kurang nyaman dengan perubahan yang tiba-tiba.',true,3),
('personality','O','Saya lebih suka melakukan sesuatu dengan cara yang sudah terbukti.',true,4),

('personality','C','Saya menyelesaikan pekerjaan tepat waktu dan sesuai rencana.',false,5),
('personality','C','Saya menyukai keteraturan dan kerapian di sekitar saya.',false,6),
('personality','C','Terkadang saya menunda-nunda tugas yang seharusnya segera diselesaikan.',true,7),
('personality','C','Saya tidak terlalu memperhatikan detail kecil dalam pekerjaan.',true,8),

('personality','E','Saya menikmati percakapan dengan orang-orang yang baru dikenal.',false,9),
('personality','E','Berada di keramaian membuat saya merasa berenergi.',false,10),
('personality','E','Saya butuh waktu sendiri untuk mengisi ulang energi setelah bersosialisasi.',true,11),
('personality','E','Saya lebih memilih aktivitas yang tenang dan tidak terlalu ramai.',true,12),

('personality','A','Saya berusaha memahami sudut pandang orang lain, meskipun berbeda.',false,13),
('personality','A','Saya percaya bahwa orang pada dasarnya memiliki niat baik.',false,14),
('personality','A','Saya tidak ragu untuk menyampaikan ketidaksetujuan secara langsung.',true,15),
('personality','A','Terkadang saya sulit mempercayai motif di balik tindakan orang lain.',true,16),

('personality','N','Saya sering memikirkan hal-hal yang bisa saja terjadi salah.',false,17),
('personality','N','Suasana hati saya mudah berubah tergantung situasi.',false,18),
('personality','N','Saya bisa tetap tenang meskipun sedang menghadapi tekanan.',true,19),
('personality','N','Saya jarang merasa cemas atau khawatir berlebihan.',true,20);

-- ==================== INTEREST (RIASEC - 18 soal, 3 per dimensi) ====================
-- Balanced across 6 types

INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('interest','R','Saya suka bekerja dengan peralatan, mesin, atau benda fisik.',false,1),
('interest','R','Kegiatan di luar ruangan lebih menarik bagi saya daripada di dalam ruangan.',false,2),
('interest','R','Saya lebih suka pekerjaan yang menghasilkan sesuatu yang nyata dan praktis.',false,3),

('interest','I','Saya tertarik memahami bagaimana sesuatu bekerja secara ilmiah.',false,4),
('interest','I','Memecahkan masalah yang kompleks dan membutuhkan analisis memberi saya kepuasan.',false,5),
('interest','I','Saya menikmati riset, eksperimen, atau mengumpulkan data.',false,6),

('interest','A2','Saya suka mengekspresikan diri melalui seni, musik, atau tulisan.',false,7),
('interest','A2','Saya menghargai keindahan visual dan estetika dalam lingkungan sekitar.',false,8),
('interest','A2','Kreativitas dan imajinasi lebih penting bagi saya daripada aturan yang ketat.',false,9),

('interest','S','Saya merasa puas ketika bisa membantu orang lain belajar atau berkembang.',false,10),
('interest','S','Saya tertarik pada kegiatan yang melibatkan interaksi dan kepedulian sosial.',false,11),
('interest','S','Bekerja dalam tim dan berkolaborasi dengan orang lain membuat saya semangat.',false,12),

('interest','E2','Saya suka mengambil peran kepemimpinan dalam kelompok atau organisasi.',false,13),
('interest','E2','Meyakinkan orang lain tentang ide atau produk adalah hal yang saya nikmati.',false,14),
('interest','E2','Saya tertarik dengan dunia bisnis, wirausaha, dan pengambilan keputusan.',false,15),

('interest','C2','Saya menghargai keteraturan, sistem, dan prosedur yang jelas.',false,16),
('interest','C2','Saya teliti dalam mengelola data, catatan, atau dokumen.',false,17),
('interest','C2','Saya lebih suka pekerjaan yang terstruktur dengan ekspektasi yang jelas.',false,18);

-- ==================== VALUES (Schwartz - 40 soal, 4 per dimensi) ====================
-- 2 positive + 2 reverse mix, 6-point scale

INSERT INTO test_arah_hidup_questions (module, dimension, question_text, is_reverse, sort_order) VALUES
('values','SD','Saya ingin bebas menentukan arah hidup saya sendiri tanpa dikendalikan orang lain.',false,1),
('values','SD','Kreativitas dan rasa ingin tahu adalah bagian penting dari diri saya.',false,2),
('values','SD','Saya lebih nyaman mengikuti petunjuk daripada memutuskan sendiri.',true,3),
('values','SD','Saya lebih suka lingkungan yang terstruktur daripada kebebasan penuh.',true,4),

('values','PO','Saya termotivasi untuk mencapai posisi yang dihormati dalam komunitas saya.',false,5),
('values','PO','Saya ingin memiliki pengaruh dan kemampuan mengarahkan orang lain.',false,6),
('values','PO','Saya tidak terlalu ambisius dalam mengejar status atau kekuasaan.',true,7),
('values','PO','Menjadi pusat perhatian bukanlah hal yang saya cari.',true,8),

('values','UN','Setiap orang berhak diperlakukan dengan adil, tanpa memandang latar belakang.',false,9),
('values','UN','Saya peduli pada kelestarian lingkungan dan kesejahteraan generasi mendatang.',false,10),
('values','UN','Menurut saya, lebih penting fokus pada diri sendiri daripada masalah dunia.',true,11),
('values','UN','Perdamaian dunia bukanlah tanggung jawab individu.',true,12),

('values','AC','Saya menetapkan target yang menantang dan berusaha keras mencapainya.',false,13),
('values','AC','Pengakuan atas pencapaian saya sangat berarti bagi motivasi saya.',false,14),
('values','AC','Saya tidak terlalu peduli apakah orang lain mengakui keberhasilan saya.',true,15),
('values','AC','Saya lebih menikmati proses daripada hasil akhir.',true,16),

('values','SE','Saya mengutamakan keselamatan dan keamanan dalam mengambil keputusan.',false,17),
('values','SE','Saya menghargai stabilitas dan keteraturan dalam kehidupan bermasyarakat.',false,18),
('values','SE','Saya cukup berani mengambil risiko tanpa terlalu khawatir pada keamanan.',true,19),
('values','SE','Saya tidak keberatan dengan ketidakpastian dalam hidup saya.',true,20),

('values','ST','Saya selalu mencari pengalaman dan tantangan baru dalam hidup.',false,21),
('values','ST','Saya mudah bosan dengan rutinitas dan butuh variasi.',false,22),
('values','ST','Saya lebih menikmati ketenangan dan kestabilan daripada sensasi.',true,23),
('values','ST','Rutinitas sehari-hari yang sama tidak mengganggu saya.',true,24),

('values','CO','Saya percaya pentingnya mematuhi aturan dan norma yang berlaku.',false,25),
('values','CO','Saya menghargai kesopanan dan disiplin diri dalam berperilaku.',false,26),
('values','CO','Aturan yang tidak masuk akal tidak perlu selalu diikuti.',true,27),
('values','CO','Saya tidak keberatan jika orang lain melanggar norma selama tidak merugikan.',true,28),

('values','TR','Saya menghormati tradisi, adat, dan kebiasaan yang diwariskan keluarga saya.',false,29),
('values','TR','Nilai-nilai agama atau spiritual sangat penting dalam hidup saya.',false,30),
('values','TR','Menurut saya, tradisi tidak selalu harus dipertahankan di era modern.',true,31),
('values','TR','Saya tidak merasa terikat dengan warisan budaya atau keyakinan leluhur.',true,32),

('values','BE','Membantu orang-orang terdekat yang sedang kesulitan adalah prioritas saya.',false,33),
('values','BE','Saya selalu berusaha menjadi teman atau anggota keluarga yang bisa diandalkan.',false,34),
('values','BE','Saya percaya setiap orang harus menyelesaikan masalahnya sendiri.',true,35),
('values','BE','Saya tidak selalu merasa bertanggung jawab atas kesejahteraan orang lain.',true,36),

('values','HE','Saya percaya bahwa menikmati kesenangan hidup itu penting.',false,37),
('values','HE','Saya suka melakukan hal-hal yang membuat saya senang dan puas.',false,38),
('values','HE','Kesenangan pribadi bukanlah prioritas utama dalam hidup saya.',true,39),
('values','HE','Saya lebih memilih menunda kenikmatan demi tujuan jangka panjang.',true,40);
