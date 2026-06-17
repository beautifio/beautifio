#!/usr/bin/env python3
import json

def esc(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "TRUE" if v else "FALSE"
    if isinstance(v, int): return str(v)
    return "'" + str(v).replace("'", "''") + "'"

def jb(v):
    s = json.dumps(v, ensure_ascii=False)
    return "'" + s.replace("'", "''") + "'::jsonb"

def ca(arr):
    return "ARRAY[" + ", ".join(esc(x) for x in arr) + "]"

def bw(title, desc, why, alt, o):
    return {"title":title,"description":desc,"why_it_matters":why,"alternative_path":alt,"order":o}
def sw(bwt, t, d, o):
    return {"big_win_title":bwt,"title":t,"description":d,"order":o}
def af(t, d, s):
    return {"title":t,"description":d,"skills":s}
def oq(i, l, o):
    return {"id":i,"type":"single_select","label":l,"options":o}
def da(sp, ph, kn, so, ch, dr):
    return {"spiritual":sp,"physical":ph,"knowledge":kn,"social":so,"character":ch,"dream_skill":dr}

I = lambda x: x  # identity, for better formatting

S,C,B,H,Tc,L = "sports","creative","business","health","tech","lifestyle"

rows = []

def add(slug, title, emoji, color, cat, dur, min_a, max_a, jdur, desc, why, careers, bws, sws, das, afs, oqs):
    rows.append((slug, title, emoji, color, cat, dur, min_a, max_a, jdur, desc, why, careers, bws, sws, das, afs, oqs))

# ===== SPORTS (5) =====
add("pro-footballer","Pemain Sepak Bola Profesional","\u26bd","from-green-600 to-emerald-500",S,"8-15 tahun",8,35,"8-15 tahun",
 "Jalur menjadi pesepakbola profesional dari SSB sampai ke klub besar. Cocok buat lo yang dari kecil bercita-cita jadi pemain Timnas.",
 "Sepak bola bukan cuma olahraga \u2014 ini sekolah kehidupan. Lewat sepak bola lo belajar disiplin, kerja tim, dan mental baja. Pemain profesional ngga cuma ngejar gol, tapi jadi inspirasi buat generasi muda Indonesia.",
 ["Pemain Klub Profesional (Liga 1, Liga 2)","Tim Nasional Indonesia","Pemain Luar Negeri","Pelatih Profesional","Akademi Pembinaan Muda","Analis Sepak Bola","Manajer Olahraga"],
 [bw("Mulai di SSB atau Akademi","Gabung SSB","Teknik dasar nentuin seberapa jauh lo melangkah","Ikut ekskul sepak bola",1),bw("Jadi Pemain Inti","Tembus starting eleven","Konsistensi bedain pemain biasa dan hebat","Jadi pemain pengganti berdampak",2),bw("Kompetisi Resmi Pertama","Ikut turnamen provinsi","Mental bertanding ngga bisa dilatih aja","Turnamen antar-sekolah",3),bw("Seleksi Pelatda/Pelatnas","Seleksi Timnas usia muda","Gerbang ke level profesional","Fokus karir klub",4),bw("Kontrak Profesional","Teken kontrak pertama","Puncak perjuangan \u2014 baru awal","Manajemen atau pelatih",5)],
 [sw("Mulai di SSB atau Akademi","Survey 3 SSB","Cek 3 SSB di kotamu",1),sw("Mulai di SSB atau Akademi","Trial Session","Coba latihan gratis",2),sw("Jadi Pemain Inti","Latihan Ekstra","Latihan luar jadwal 3x seminggu",3),sw("Jadi Pemain Inti","Evaluasi Pelatih","Minta feedback kelemahan",4),sw("Kompetisi Resmi Pertama","Daftar Turnamen","Daftar turnamen kota",5),sw("Kompetisi Resmi Pertama","Main 90 Menit","Main penuh tanpa diganti",6),sw("Seleksi Pelatda/Pelatnas","Persiapan Fisik","Latihan intensif 2 bulan",7),sw("Seleksi Pelatda/Pelatnas","Lolos Seleksi","Lolos semua tahapan",8),sw("Kontrak Profesional","Negosiasi Kontrak","Baca kontrak",9),sw("Kontrak Profesional","Debut Profesional","Hari pertama pro",10)],
 da(["Sholat tepat waktu","Doa sebelum latihan","Baca Al-Quran 10 menit"],["Latihan fisik 1 jam","Stretching 15 menit","Lari pagi 3km"],["Analisis pertandingan","Baca taktik bola","Belajar bahasa Inggris"],["Komunikasi pelatih","Diskusi taktik tim","Jaga hubungan keluarga"],["Catat progres harian","Evaluasi latihan","Latihan ekstra"],["Dribbling","Passing & shooting","Tactical awareness"]),
 [af("Pelatih Sepak Bola","Banyak legenda jadi pelatih top. Indonesia butuh pelatih muda.",["Manajemen tim","Analisis","Komunikasi","Lisensi"]),af("Manajer Olahraga","Kerja di belakang layar sebagai manajer klub atau scout.",["Manajemen","Networking","Bisnis","Negosiasi"]),af("Analis & Komentator","Jadi pengamat sepak bola di TV atau media.",["Analisis data","Public speaking","Taktik","Penulisan"])],
 [oq("posisi","Posisi favorit lo?",["Kiper","Bek","Gelandang","Penyerang","Belum yakin"]),oq("ssb_status","Udah gabung SSB?",["Belum","Baru","Udah > 1 tahun"]),oq("kompetisi","Pengalaman kompetisi?",["Belum","1-5 kali","> 5 kali"]),oq("target","Target utama?",["Timnas","Luar negeri","Liga 1","Jadi pro"])])

add("pro-badminton","Pemain Bulutangkis Profesional","\U0001f3f8","from-red-600 to-rose-500",S,"8-12 tahun",8,35,"8-12 tahun",
 "Jalur jadi atlet bulutangkis dari klub sampai Pelatnas. Cocok buat yang mau ngebawa nama Indonesia ke kancah dunia.",
 "Bulutangkis andalan Indonesia di kancah internasional. Jadi atlet bukan cuma soal menang \u2014 lo ngewakilin bangsa dan ngelanjutin legenda.",
 ["Atlet Bulutangkis Nasional","Atlet Bulutangkis Internasional","Pelatih Bulutangkis","Manajer Klub","Komentator","Pengusaha Perlengkapan"],
 [bw("Gabung Klub","Latihan terstruktur klub resmi","Footwork, grip, pukulan dasar harus bener","Les privat atau komunitas",1),bw("Juara Kota","Menang turnamen kota pertama","Kemenangan bukti mental juara","Fokus peringkat PBSI",2),bw("Masuk Pelatda","Lolos Pelatda provinsi","Batu loncatan Pelatnas","Les privat intensif",3),bw("Masuk Pelatnas","Lolos Pelatnas PBSI","Puncak pembinaan","Liga profesional luar negeri",4),bw("Medali Internasional","Medali BWF atau SEA Games","Bukti bisa bersaing dunia","Jadi pelatih atau buka klub",5)],
 [sw("Gabung Klub","Survey Klub","Cek 3 klub",1),sw("Gabung Klub","Latihan Perdana","Daftar dan latihan",2),sw("Juara Kota","Daftar Turnamen","Cari turnamen kota",3),sw("Juara Kota","Menang Babak 1","Menang pertandingan pertama",4),sw("Masuk Pelatda","Siapkan Dokumen","Surat rekomendasi",5),sw("Masuk Pelatda","Lolos Seleksi","Lolos tahapan Pelatda",6),sw("Masuk Pelatnas","Konsultasi Pelatih","Diskusi strategi",7),sw("Masuk Pelatnas","Daftar Seleksi","Kirim portofolio PBSI",8),sw("Medali Internasional","Turun Grade 3","Ikut BWF Future Series",9),sw("Medali Internasional","Podium","Dapat medali BWF pertama",10)],
 da(["Sholat 5 waktu","Doa sebelum tanding","Baca Al-Quran"],["Footwork 30 menit","Lari interval","Core 15 menit"],["Analisis video lawan","Teknik bulutangkis","Belajar bahasa asing"],["Diskusi strategi pelatih","Support teman klub","Komunikasi orang tua"],["Catat progres","Jurnal evaluasi","Jaga pola makan"],["Netting & dropshot","Smash","Defense & counter"]),
 [af("Pelatih Bulutangkis","Banyak mantan atlet jadi pelatih sukses. PBSI butuh pelatih muda.",["Kepelatihan","Analisis teknik","Manajemen atlet","Komunikasi"]),af("Komentator","Analis bulutangkis di TV atau YouTube.",["Pengetahuan","Public speaking","Suara","Penulisan"]),af("Pengusaha","Buka brand perlengkapan bulutangkis.",["Bisnis ritel","Marketing","Supplier","Stok"])],
 [oq("posisi","Bidang lo?",["Tunggal putra","Tunggal putri","Ganda putra","Ganda putri","Campuran","Belum yakin"]),oq("klub_status","Udah gabung klub?",["Belum","Baru","Udah > 1 tahun"]),oq("turnamen","Ikut turnamen?",["Belum","1-3 kali","> 3 kali"]),oq("target","Target karir?",["Pelatnas & Timnas","Turnamen internasional","Buka klub","Atlet pro aja"])])

add("pro-basketball","Pemain Basket Profesional","\U0001f3c0","from-orange-600 to-yellow-600",S,"6-12 tahun",10,35,"6-12 tahun",
 "Jalur jadi pemain basket dari latihan dasar sampai main di IBL.",
 "Basket ngajarin kerja tim dan keputusan cepat. IBL makin populer dan basket Indonesia naik daun.",
 ["Pemain IBL","Pemain Tim Nasional","Pelatih Basket","Wasit Profesional","Manajer Klub","Scout"],
 [bw("Latihan Basket","Gabung klub basket resmi","Dribbling, passing, shooting harus bener","Komunitas basket",1),bw("Tembus Tim Inti","Jadi bagian tim kompetisi","Main tim ngajarin rotasi","Fokus 3x3 basketball",2),bw("Turnamen Resmi","Main turnamen provinsi Perbasi","Mental tanding ga dari latihan aja","Event komunitas",3),bw("Akademi Elite","Program pembinaan nasional","Akselerasi karir","Tryout IBL sambil kuliah",4),bw("Rookie IBL","Dikontrak klub IBL","Gerbang ke pro Indonesia","Main luar negeri atau pelatih",5)],
 [sw("Latihan Basket","Cari Klub & Trial","Survey 3 klub",1),sw("Latihan Basket","Latihan Rutin 3x","Latihan klub 3x seminggu",2),sw("Tembus Tim Inti","Seleksi Tim","Lolos seleksi",3),sw("Tembus Tim Inti","Scrimmage","Main lawan tim lain",4),sw("Turnamen Resmi","Daftar Turnamen","Daftar turnamen Perbasi",5),sw("Turnamen Resmi","Menang 1 Laga","Menang pertandingan pertama",6),sw("Akademi Elite","Riset Akademi","Cari info akademi elite",7),sw("Akademi Elite","Lolos Akademi","Lolos seleksi",8),sw("Rookie IBL","Tryout IBL","Open recruitment IBL",9),sw("Rookie IBL","Kontrak Rookie","Teken kontrak IBL",10)],
 da(["Sholat 5 waktu","Baca doa","Refleksi"],["Dribbling & footwork","Sprint interval","Strength training"],["Strategi basket","Analisis pertandingan","Tonton NBA/IBL"],["Team bonding","Komunikasi lapangan","Instruksi"],["Catat progres","Jaga disiplin","Mental juara"],["Shooting & layup","Ball handling","Defense & rebounding"]),
 [af("Pelatih Basket","Jadi pelatih tim basket sekolah atau klub.",["Kepelatihan","Analisis","Manajemen tim","Teknik"]),af("Wasit Profesional","Wasit IBL atau turnamen resmi.",["Peraturan","Pengambilan keputusan","Fisik","Sertifikasi"]),af("Konten Basket","Konten basket di YouTube atau TikTok.",["Content creation","Video editing","Public speaking","Pengetahuan"])],
 [oq("posisi","Posisi favorit?",["Point Guard","Shooting Guard","Small Forward","Power Forward","Center","Belum yakin"]),oq("pengalaman","Pengalaman main?",["Pemula","1-2 tahun","> 3 tahun"]),oq("tim","Punya tim?",["Belum","Tim sekolah","Klub"]),oq("target","Target?",["IBL","Timnas","Luar negeri","Pelatih"])])

add("swimmer","Atlet Renang Profesional","\U0001f3ca","from-sky-600 to-cyan-500",S,"5-10 tahun",8,35,"5-10 tahun",
 "Jalur jadi atlet renang dari klub sampai ke Olimpiade. Buat lo yang udah jatuh cinta sama air sejak kecil.",
 "Renang unik \u2014 lo lawan diri sendiri, bukan orang lain. Setiap split detik berharga. Atlet renang Indonesia udah banyak ngebuktiin diri di SEA Games.",
 ["Atlet Renang Nasional","Atlet Renang Internasional","Pelatih Renang","Fisioterapis","Manajer Akuatik","Komentator"],
 [bw("Kuasai 4 Gaya","Bebas, punggung, dada, kupu-kupu","Teknik benar cegah cedera","Fokus 1-2 gaya",1),bw("Gabung Klub","Masuk klub PRSI","Program periodisasi profesional","Les privat",2),bw("Kompetisi Pertama","Lomba level kota/provinsi","Mental bertanding skill sendiri","Event renang komunitas",3),bw("Raih Limit Nasional","Waktu sesuai limit PRSI","Gerbang Kejurnas","Fokus open water",4),bw("Event Internasional","Wakili Indonesia SEA Games","Puncak karir atlet renang","Pelatih atau sekolah renang",5)],
 [sw("Kuasai 4 Gaya","Gaya Bebas 50m","Renang 50m bebas",1),sw("Kuasai 4 Gaya","4 Gaya 25m","Masing-masing 25m",2),sw("Gabung Klub","Trial Klub","Kunjungi 3 klub",3),sw("Gabung Klub","Anggota Resmi","Daftar jadi anggota",4),sw("Kompetisi Pertama","Daftar Lomba","Daftar event pemula",5),sw("Kompetisi Pertama","Finish Tanpa DQ","Selesai tanpa diskualifikasi",6),sw("Raih Limit Nasional","Catat Target","Cari limit nasional",7),sw("Raih Limit Nasional","Break Limit","Waktu di bawah limit",8),sw("Event Internasional","Seleksi Timnas","Ikut seleksi Pelatnas",9),sw("Event Internasional","Tiket SEA Games","Masuk tim Indonesia",10)],
 da(["Sholat 5 waktu","Doa sebelum lomba","Baca Al-Quran"],["Renang 2 jam","Dryland","Stretching"],["Video teknik","Gizi olahraga","Studi lawan"],["Diskusi pelatih","Support teman","Komunikasi keluarga"],["Catat waktu","Jurnal harian","Jaga jam tidur"],["Start & turn","Teknik pernapasan","Sprint finish"]),
 [af("Pelatih Renang","Bina generasi baru perenang.",["Kepelatihan","Analisis","Manajemen atlet","Lisensi"]),af("Fisioterapis Akuatik","Spesialis fisioterapi di air.",["Fisioterapi","Anatomi","Terapi air","Sertifikasi"]),af("Pengusaha","Buka sekolah renang atau bisnis perlengkapan.",["Kewirausahaan","Manajemen","Marketing","Pelayanan"])],
 [oq("gaya","Gaya favorit?",["Bebas","Punggung","Dada","Kupu-kupu","Semua","Belum yakin"]),oq("klub","Udah gabung klub?",["Belum","Baru","Udah > 1 tahun"]),oq("lomba","Ikut lomba?",["Belum","1-3 kali","> 3 kali"]),oq("target","Target?",["Pelatnas & SEA Games","Asian Games","Olimpiade","Sekolah renang"])])

add("martial-artist","Atlet Bela Diri Profesional","\U0001f94b","from-stone-800 to-slate-700",S,"5-15 tahun",8,35,"5-15 tahun",
 "Jalur jadi atlet bela diri \u2014 dari silat, karate, taekwondo, sampai MMA. Buat lo yang pengen jago dan ngebawa nama Indonesia.",
 "Bela diri bukan cuma bertarung \u2014 ini disiplin, hormat, dan kontrol diri. Indonesia punya tradisi silat diakui UNESCO.",
 ["Atlet Silat Nasional","Atlet Taekwondo Nasional","Petarung MMA","Pelatih Bela Diri","Wasit","Pengusaha Dojo"],
 [bw("Mulai Perguruan","Gabung perguruan resmi","Pilih aliran yang tepat","Online training",1),bw("Sparing Internal","Sparing & kompetisi internal","Teknik diuji biar ga ilang","Fokus jurus non-tanding",2),bw("Juara Wilayah","Kejuaraan kota/provinsi","Kemenangan bukti metode kerja","Exhibition dulu",3),bw("Masuk Pelatnas","Lolos seleksi Pelatnas","Puncak pembinaan","Jalur pelatih atau juri",4),bw("Medali Internasional","SEA Games, Asian Games, atau kejuaraan dunia","Inspirasi generasi muda","Buka sanggar",5)],
 [sw("Mulai Perguruan","Survey 3 Tempat","Cek 3 dojo",1),sw("Mulai Perguruan","Latihan Perdana","Daftar dan latihan",2),sw("Sparing Internal","Sparing Pertama","Sparing ringan",3),sw("Sparing Internal","Kompetisi Internal","Ikut kompetisi dojo",4),sw("Juara Wilayah","Daftar Turnamen","Daftar kejuraan",5),sw("Juara Wilayah","Juara 2","Medali regional",6),sw("Masuk Pelatnas","Persiapan Seleksi","Intensif 3 bulan",7),sw("Masuk Pelatnas","Lolos Pelatnas","SK resmi",8),sw("Medali Internasional","Turun Internasional","Wakili Indonesia",9),sw("Medali Internasional","Naik Podium","Dapat medali internasional",10)],
 da(["Meditasi 15 menit","Doa sebelum latihan","Baca kitab suci"],["Pemanasan & stretching","Teknik 1 jam","Cardio"],["Filosofi aliran","Teknik pertarungan","Tonton pertandingan"],["Hormat senior","Bantu junior","Diskusi teknik"],["Catat progres","Jurnal disiplin","Jaga pola makan"],["Kombinasi jurus","Bantingan","Kuncian & submission"]),
 [af("Pelatih","Buka perguruan sendiri atau ngajar.",["Kepelatihan","Teknik","Manajemen kelas","Sertifikasi"]),af("Keamanan","Bodyguard atau konsultan keamanan.",["Sistem keamanan","Pengawalan","Risiko","Bela diri praktis"]),af("Aktor Laga","Koreografer laga atau stuntman.",["Akting","Koreografi","Stunt","Fisik"])],
 [oq("aliran","Aliran bela diri?",["Silat","Karate","Taekwondo","Judo","MMA","Belum yakin"]),oq("pengalaman","Udah latihan?",["Pemula","1-2 tahun","> 3 tahun"]),oq("minat","Kompetisi atau seni?",["Kompetisi","Seni/jurus","Keduanya","Kebugaran"]),oq("target","Target?",["Atlet nasional","Pelatih","Aktor laga","Buka dojo"])])

# ===== CREATIVE (5) =====
add("content-creator","Content Creator","\U0001f4f9","from-rose-600 to-pink-500",C,"6-12 bulan",14,35,"6-12 bulan",
 "Jalur dari nol sampai punya komunitas. Buat lo yang suka nge-vlog dan pengin hidup dari konten.",
 "Siapapun bisa jadi kreator di era digital. Content creator bukan cuma terkenal \u2014 ini ngebuat dampak positif dan ngedukasi orang lewat karya.",
 ["YouTuber","TikTok Creator","Content Strategist","Podcaster","Brand Consultant","Creative Director"],
 [bw("Tentukan Niche","Pilih topik spesifik","Makin spesifik makin gampang dapet audiens","Multi-niche dulu",1),bw("Konten Perdana","Publish konten pertama","Nentuin standar ke depan","Micro-content dulu",2),bw("1000 Subscriber","Dapetin 1000 subscriber organik","Bukti value buat orang lain","Multiplatform",3),bw("Kolaborasi","Kolaborasi sesama kreator","Shortcut pertumbuhan","Program afiliasi",4),bw("Monetisasi","Pendapatan rutin dari konten","Konten jadi karir","Jasa buat konten",5)],
 [sw("Tentukan Niche","Riset 10 Kreator","Analisis 10 kreator sukses",1),sw("Tentukan Niche","Buat Brand Kit","Nama, logo, banner",2),sw("Konten Perdana","Siapkan Alat","HP, lighting, mic",3),sw("Konten Perdana","Upload Pertama","Konten diedit rapi",4),sw("1000 Subscriber","Konsisten 30 Hari","Posting 3x seminggu",5),sw("1000 Subscriber","1000 Subs","Subscriber organik",6),sw("Kolaborasi","Hubungi 3 Kreator","DM ajak kolaborasi",7),sw("Kolaborasi","Konten Kolaborasi","Publik bareng",8),sw("Monetisasi","Program Monetisasi","Daftar YPP",9),sw("Monetisasi","Endorsement","Tawaran brand pertama",10)],
 da(["Refleksi 10 menit","Doa sebelum konten","Bersyukur"],["Stretching","Jaga mata","Posture duduk"],["Algoritma platform","Tutorial video","Update tren"],["Balas komentar","Kolaborasi","Interaksi audiens"],["Catat ide","Evaluasi performa","Imposter syndrome"],["Editing video","Thumbnail design","Storytelling"]),
 [af("Content Strategist","Kerja di agensi tentuin strategi konten.",["Strategi konten","Analisis data","Penulisan","Tim"]),af("Creative Director","Pimpin divisi kreatif perusahaan media.",["Kepemimpinan","Kreativitas","Proyek","Branding"]),af("Social Media Manager","Kelola media sosial brand.",["Social media","Copywriting","Analytics","CS"])],
 [oq("niche","Niche konten?",["Teknologi","Gaya hidup","Pendidikan","Travel & kuliner","Humor"]),oq("pengalaman","Bikin konten?",["Belum","Pernah","Udah konsisten"]),oq("platform","Platform utama?",["YouTube","TikTok","Instagram","Podcast","Multi"]),oq("target","Target?",["Full-time","Sampingan","Brand ambassador","Produk sendiri"])])

add("musician","Musisi Profesional","\U0001f3b5","from-purple-600 to-pink-500",C,"2-5 tahun",10,35,"2-5 tahun",
 "Jalur jadi musisi dari latihan dasar sampai manggung. Buat lo yang hidupnya ga bisa lepas dari musik.",
 "Musik bahasa universal yang nyambungin semua orang. Jadi musisi bukan cuma rilis album \u2014 tapi ngekspresiin perasaan dan ninggalin legacy.",
 ["Pemain Musik Profesional","Pengajar Musik","Session Musician","Komposer","Music Producer","Content Creator","Sound Engineer"],
 [bw("Kuasai Instrumen","Teknik dasar instrumen","Fondasi karir musik","Vocalist atau producer",1),bw("Main 1 Lagu Full","Intro sampai outro stabil","Milestone pertama","Cover sederhana",2),bw("Penampilan Publik","Open mic, kafe, atau acara","Mental panggung beda","Live streaming",3),bw("Rilis Karya Orisinil","Rilis lagu di platform digital","Karya bedain dari cover","Session musician",4),bw("Tur Mini","Residensi atau gigs reguler","Hidup dari musik","Guru musik atau producer",5)],
 [sw("Kuasai Instrumen","Beli/Sewa Instrumen","Dapetin instrumen proper",1),sw("Kuasai Instrumen","Scale & Chord","Mayor/minor dan chord dasar",2),sw("Main 1 Lagu Full","Lagu 4 Chord","Main dengan 4 chord",3),sw("Main 1 Lagu Full","Lagu Favorit","Full lagu favorit",4),sw("Penampilan Publik","Cari Open Mic","Survey open mic",5),sw("Penampilan Publik","Tampil 3 Lagu","3 lagu di depan audiens",6),sw("Rilis Karya Orisinil","Rekam Demo","Rekam 1 lagu orisinil",7),sw("Rilis Karya Orisinil","Rilis ke DSP","Upload ke Spotify",8),sw("Tur Mini","Book Gig Bayaran","Negosiasi gig pertama",9),sw("Tur Mini","Tur 3 Kota","Minimal 3 show",10)],
 da(["Meditasi","Musik spiritual","Refleksi lewat musik"],["Posture","Stretching tangan","Jaga suara"],["Teori musik","Analisis lagu","Teknik baru"],["Jamming","Kolaborasi","Main event"],["Rutin latihan","Terima kritik","Eksplorasi genre"],["Improvisasi","Songwriting","Rekaman"]),
 [af("Guru Musik","Buka kursus atau ngajar di sekolah musik.",["Pengajaran","Teknik","Manajemen kelas","Kurikulum"]),af("Music Producer","Produksi lagu untuk artis atau iklan.",["Produksi","Mixing","DAW","MIDI"]),af("Sound Engineer","Audio engineer di studio atau venue.",["Audio","Sound system","Akustik","Problem solving"])],
 [oq("instrumen","Instrumen utama?",["Gitar","Piano","Drum","Vokal","Bass","Belum"]),oq("pengalaman","Berapa lama main?",["Pemula","1-3 tahun","> 3 tahun"]),oq("genre","Genre favorit?",["Pop","Rock","Jazz","Hip-hop","Dangdut","Eksperimental"]),oq("target","Target karir?",["Artis solo","Session","Produser","Guru"])])

add("beauty-creator","Beauty & Makeup Creator","\U0001f484","from-pink-600 to-rose-500",C,"6-12 bulan",14,35,"6-12 bulan",
 "Jalur dari belajar makeup sampai punya personal brand di industri kecantikan. Buat lo yang suka eksperimen makeup.",
 "Kecantikan industri raksasa. Jadi beauty creator bukan cuma soal makeup \u2014 tapi ngebantu orang lebih percaya diri.",
 ["Makeup Artist","Beauty Content Creator","Skincare Educator","Brand Ambassador","Beauty Entrepreneur","Beauty Writer"],
 [bw("Makeup Dasar","Foundation, blending, contouring","Dasar kuat nentuin hasil","Skincare atau nail art dulu",1),bw("Portofolio 5 Look","5 tampilan beda","CV lo sebagai MUA","1 spesialisasi",2),bw("Client Pertama","Klien bayaran pertama","Transisi hobi ke profesi","Bantu acara teman gratis",3),bw("Kolaborasi Brand","Endorsement brand kecantikan","Validasi dari industri","Program afiliasi",4),bw("Bisnis Sendiri","Launch produk atau jasa","Puncak karir \u2014 kontrol penuh","Kursus makeup",5)],
 [sw("Makeup Dasar","Skin Prep","Urutan skincare benar",1),sw("Makeup Dasar","Full Face","Full face rapi",2),sw("Portofolio 5 Look","Natural Look","Natural everyday",3),sw("Portofolio 5 Look","5 Look Lengkap","Natural-glam-bridal-editorial",4),sw("Client Pertama","Buka Jasa","Posting portofolio",5),sw("Client Pertama","3 Client","Bayar review positif",6),sw("Kolaborasi Brand","Media Kit","Bikin media kit",7),sw("Kolaborasi Brand","Deal Brand","Negosiasi kolab",8),sw("Bisnis Sendiri","Riset Produk","Riset produk kecantikan",9),sw("Bisnis Sendiri","Launch Mini","Launch produk pertama",10)],
 da(["Doa","Refleksi","Bersyukur"],["Skincare rutin","Minum air","Jaga makan"],["Teknik baru","Tren kecantikan","Ilmu skincare"],["Interaksi followers","Kolaborasi","Networking"],["Catat progres","Terima kritik","Peduli klien"],["Contouring","Eye makeup","Photography makeup"]),
 [af("MUA Bridal","Spesialis makeup pengantin.",["Teknik","Manajemen klien","Portofolio","Hygiene"]),af("Beauty Writer","Review produk dan tutorial.",["Penulisan","Pengetahuan produk","SEO","Fotografi"]),af("Brand Founder","Bikin brand kecantikan sendiri.",["Branding","Produksi","Distribusi","BPOM"])],
 [oq("minat","Bidang kecantikan?",["Makeup artist","Skincare","Nail art","Semua"]),oq("pengalaman","Level makeup?",["Pemula","Intermediate","Mahir"]),oq("konten","Jadi content creator?",["Tidak, MUA","Iya","Mungkin"]),oq("target","Target?",["MUA bridal","Influencer","Punya brand","Kursus"])])

add("fashion-designer","Fashion Designer","\U0001f457","from-violet-600 to-purple-500",C,"2-4 tahun",14,35,"2-4 tahun",
 "Jalur dari belajar desain sampe punya brand fashion sendiri. Buat lo yang tertarik dunia mode.",
 "Mode ekspresi diri dan identitas budaya. Indonesia kaya wastra tradisional yang jadi inspirasi ga terbatas.",
 ["Fashion Designer RTW","Fashion Stylist","Pattern Maker","Creative Director","Fashion Buyer","Tekstil Desainer"],
 [bw("Desain & Pola","Fashion illustration, pola dasar","Skill teknis fondasi","Desain digital CLO 3D",1),bw("Jahit & Tekstil","Karakteristik kain","Penentuan hasil akhir","Kerja sama konveksi",2),bw("Koleksi Mini 5","5 outfit tema jelas","Identitas lo sebagai desainer","1-2 outfit signature",3),bw("Fashion Show","Bazaar atau fashion show","Exposure segalanya","Marketplace fashion",4),bw("Launch Brand","Brand dengan koleksi reguler","Transisi ke entrepreneur","Kerja di brand existing",5)],
 [sw("Desain & Pola","Fashion Illustration","Proporsi 9 kepala",1),sw("Desain & Pola","10 Croquis","10 sketch",2),sw("Jahit & Tekstil","Jahit Sederhana","Rok atau kemeja",3),sw("Jahit & Tekstil","5 Jenis Kain","Katun, sutra, denim, satin, jersey",4),sw("Koleksi Mini 5","Moodboard","Tema dan narasi",5),sw("Koleksi Mini 5","5 Outfit Jadi","Produksi lengkap",6),sw("Fashion Show","Sewa Booth","Booth bazaar",7),sw("Fashion Show","Fashion Show","Show mini",8),sw("Launch Brand","Urus Legalitas","Merek, SIUP",9),sw("Launch Brand","Launch Brand","Resmi launch",10)],
 da(["Refleksi kreatif","Doa desain","Apresiasi alam"],["Posture jahit","Stretching leher","Jaga tangan"],["Tren fashion","Sejarah mode","Tekstil"],["Networking","Komunitas mode","Kolaborasi"],["Sketsa tiap hari","Terima kritik","Eksperimen"],["Pattern drafting","Draping","CLO 3D"]),
 [af("Fashion Stylist","Stylist artis atau majalah.",["Styling","Tren","Networking","Wardrobe"]),af("Tekstil Desainer","Desain batik dan motif printing.",["Desain motif","Pewarnaan","Serat","Printing"]),af("Fashion Buyer","Pembeli untuk butik.",["Market analysis","Negosiasi","Forecasting","Logistik"])],
 [oq("spesialisasi","Bidang fashion?",["RTW","Kebaya","Streetwear","Sportswear","Aksesoris"]),oq("pengalaman","Pengalaman?",["Pemula","Otodidak","Pendidikan formal"]),oq("skill","Skill jahit?",["Belum","Bisa dasar","Mahir"]),oq("target","Target?",["Brand sendiri","Brand besar","Stylist","Tekstil"])])

add("animator","Animator Profesional","\U0001f3ac","from-indigo-600 to-blue-600",C,"1-3 tahun",14,35,"1-3 tahun",
 "Jalur jadi animator dari dasar gambar sampe produksi animasi. Buat lo yang suka menggambar dan bercerita.",
 "Animasi ngejelasin konsep rumit secara visual. Industri animasi Indonesia lagi naik \u2014 banyak film lokal tembus internasional.",
 ["Animator 2D/3D","Character Designer","Storyboard Artist","VFX Artist","Game Animator","Animation Director"],
 [bw("12 Prinsip Animasi","Praktek prinsip dasar","Hukum animasi biar hidup","Stop motion dulu",1),bw("Animasi 5 Detik","Loop 5 detik","Timing, spacing, easing","Motion graphics",2),bw("Character & Rigging","Desain karakter+rig","Karakter kuat personality","Pake template",3),bw("Animasi 30 Detik","Narasi jelas","Storytelling skill penting","Music video",4),bw("Rilis ke Publik","Upload atau project bayaran","Feedback publik beda","Freelance Fiverr",5)],
 [sw("12 Prinsip Animasi","Software Siap","Blender atau Maya",1),sw("12 Prinsip Animasi","Bouncing Ball","Squash & stretch",2),sw("Animasi 5 Detik","Walk Cycle","Animasi jalan natural",3),sw("Animasi 5 Detik","5 Detik Jadi","2 objek interaksi",4),sw("Character & Rigging","Character Sheet","3 view + 5 ekspresi",5),sw("Character & Rigging","Rigging Selesai","10 kontrol points",6),sw("Animasi 30 Detik","Storyboard","5-8 panel",7),sw("Animasi 30 Detik","30 Detik Jadi","Render dengan audio",8),sw("Rilis ke Publik","Upload Portfolio","YouTube & website",9),sw("Rilis ke Publik","Project Bayaran","Dapet project berbayar",10)],
 da(["Meditasi","Doa","Bersyukur"],["Stretching tangan","Posture","Olahraga"],["Software baru","Analisis film","12 prinsip"],["Forum animasi","Kolaborasi","Feedback"],["30 menit/hari","Rewrite","Terima kritik"],["Char animation","Lip sync","Compositing"]),
 [af("Game Animator","Animasi karakter game.",["Game animation","Rigging","Unity/Unreal","Optimization"]),af("VFX Artist","Efek visual film atau iklan.",["Particle","Compositing","Node","Shaders"]),af("Animation Director","Pimpin tim animator.",["Kepemimpinan","Storytelling","Proyek","Art direction"])],
 [oq("jenis","Jenis animasi?",["2D","3D","Stop motion","Motion graphics","Belum yakin"]),oq("software","Software?",["Blender","Adobe Animate","Toon Boom","Maya","Bingung"]),oq("pengalaman","Pengalaman?",["Pemula","Udah coba","Ada project"]),oq("target","Target?",["Studio film","Game dev","Freelance","Studio sendiri"])])

# ===== BUSINESS (5) =====
add("entrepreneur","Entrepreneur / Pengusaha","\U0001f4c8","from-amber-600 to-yellow-500",B,"3-5 tahun",14,35,"3-5 tahun",
 "Jalur dari validasi ide sampe bisnis jalan. Cocok buat lo yang punya jiwa dagang.",
 "Entrepreneurship nyiptain solusi nyata dan lapangan kerja. Indonesia butuh banyak entrepreneur muda.",
 ["CEO & Founder","Serial Entrepreneur","Angel Investor","Business Consultant","Corporate Innovator","Social Entrepreneur"],
 [bw("Validasi Ide","Konfirmasi masalah dan pasar mau bayar","Banyak startup gagal karena tanpa validasi","Kerja di startup dulu",1),bw("Buat MVP","Versi paling sederhana","Belajar dari pasar secepat mungkin","Jual jasa dulu",2),bw("Customer Pertama","Customer bayaran di luar temen","Validasi paling kuat","Pre-sale",3),bw("Break-even","Bisnis balik modal","Sustainable tanpa investor","Cari investor",4),bw("Scale & Tim","Tim inti dan sistem","Bisnis bukan freelance","Jaga tetap kecil",5)],
 [sw("Validasi Ide","Problem Interview","Wawancara 30 calon customer",1),sw("Validasi Ide","Riset Pasar","Analisis kompetitor",2),sw("Buat MVP","MVP v1","Launch ke 10 user",3),sw("Buat MVP","Iterasi MVP","Perbaiki feedback",4),sw("Customer Pertama","Customer Bayaran","Transaksi pertama",5),sw("Customer Pertama","10 Customer","10 customer retention",6),sw("Break-even","Revenue > Expense","Balik modal",7),sw("Break-even","3 Bulan Untung","Untung konsisten",8),sw("Scale & Tim","Tim Pertama","Rekrut pegawai",9),sw("Scale & Tim","Sistem Jalan","SOP selesai",10)],
 da(["Doa & dzikir","Bersyukur","Introspeksi"],["Olahraga","Jaga tidur","Stretching"],["Buku bisnis","Financial literacy","Update industri"],["Networking","Follow up customer","Cari mentor"],["Jurnal gagal","Evaluasi mingguan","Zona nyaman out"],["Sales","Financial modeling","Digital marketing"]),
 [af("Business Consultant","Bantu bisnis lain solve masalah.",["Analisis","Strategic thinking","Komunikasi","Expertise"]),af("Angel Investor","Investasi di startup.",["Financial analysis","Portfolio","Networking","Deal sourcing"]),af("Intrapreneur","Inovasi di perusahaan besar.",["Corporate innovation","Project mgmt","Stakeholder","Pitching"])],
 [oq("tahap","Tahap ide?",["Masih ide","Udah riset","Udah MVP","Udah jalan"]),oq("model","Model bisnis?",["Produk fisik","Digital","Jasa","Marketplace","Sosial"]),oq("pengalaman","Pengalaman?",["Belum","Pernah jualan","Punya bisnis"]),oq("target","Target?",["Unicorn","UKM profitable","Social impact","Side hustle"])])

add("digital-marketer","Digital Marketer","\U0001f4ca","from-blue-600 to-indigo-500",B,"6-12 bulan",16,35,"6-12 bulan",
 "Jalur jadi digital marketer dari dasar SEO sampe analytics. Buat lo yang suka strategi pemasaran.",
 "Digital marketing skill paling dicari. Setiap bisnis butuh pemasaran online. Lanskapnya berubah tiap hari \u2014 seru!",
 ["SEO Specialist","Social Media Manager","Content Marketing","PPC Specialist","Marketing Analytics","Growth Marketing"],
 [bw("Dasar Marketing","Funnel, channel, metrik","Fundamental penting","Sertifikasi Google gratis",1),bw("Sertifikasi Platform","Google Analytics/Meta BP","Sertifikasi bikin CV standout","Portofolio case study",2),bw("Campaign Pertama","Rencana & eksekusi campaign","Pengalaman real beda","Bantu UMKM gratis",3),bw("Hasil Terukur","Traffic naik 50% atau improve","Hasil segalanya","Blog personal traffic",4),bw("Spesialis","Deep dive SEO/ads atau pimpin tim","Spesialis digaji lebih","Freelance consultant",5)],
 [sw("Dasar Marketing","Fundamentals","Kursus marketing selesai",1),sw("Dasar Marketing","Paham Funnel","Marketing funnel",2),sw("Sertifikasi Platform","Sertif GA","Google Analytics IQ",3),sw("Sertifikasi Platform","Sertif Meta","Meta Certified",4),sw("Campaign Pertama","Launch Campaign","Budget 500rb",5),sw("Campaign Pertama","A/B Test","Testing & dokumentasi",6),sw("Hasil Terukur","KPI Tercapai","Achieve target",7),sw("Hasil Terukur","Case Study","Dokumentasi hasil",8),sw("Spesialis","Pilih Spesialisasi","SEO/ads/konten",9),sw("Spesialis","Lead Project","Pimpin project",10)],
 da(["Doa","Refleksi","Bersyukur"],["Jalan 10 menit","Stretching leher","Atur jam"],["Update algoritma","Blog marketing","Tools baru"],["Komunitas marketing","Diskusi","Networking"],["Catat data","Evaluasi campaign","Adaptif!"],["Data analysis","Copywriting","Google & Meta Ads"]),
 [af("SEO Specialist","Bantu website naik peringkat.",["On-page SEO","Technical SEO","Link building","Analytics"]),af("Growth Marketer","Fokus growth lewat eksperimen.",["Eksperimen","Data analysis","CRO","Product sense"]),af("CMO","Pimpin strategi marketing.",["Kepemimpinan","Strategi","Budgeting","Analytics"])],
 [oq("minat","Area marketing?",["SEO & konten","Social media","Paid ads","Email","Data"]),oq("pengalaman","Pengalaman?",["Pemula","Pernah bantu","Udah kerja"]),oq("sertifikasi","Sertifikasi?",["Belum","Google Analytics","Meta","Lain"]),oq("target","Target?",["Spesialis","Manager","Freelance","Agensi"])])

add("ux-designer","UX Designer","\U0001f3a8","from-cyan-600 to-teal-500",B,"6-12 bulan",16,35,"6-12 bulan",
 "Jalur dari fundamental desain sampe portfolio siap kerja. Buat lo yang mikirin gimana bikin produk digital yang enak dipake.",
 "UX design jembatan teknologi dan manusia. Setiap aplikasi enak dipake ada UX designer-nya. Demand terus naik.",
 ["UX Designer","UI Designer","Product Designer","UX Researcher","Interaction Designer","Design Lead"],
 [bw("Dasar UX","Design thinking, riset, prototype","Design thinking bedain dari graphic design","Google UX Certificate",1),bw("3 Case Study","Dokumentasi 3 project proses","Portofolio tunjukin proses","Daily UI challenge",2),bw("Feedback Mentor","Konsultasi UX senior","Feedback dari industri","Behance review",3),bw("Project Kolaborasi","Kerja bareng developer","UX ga sendiri","Hackathon",4),bw("Dapet Kerja","Job pertama sebagai UX","Transisi belajar ke pro","Graphic designer dulu",5)],
 [sw("Dasar UX","Design Thinking","5 tahap empathize-test",1),sw("Dasar UX","Figma Kuasai","Wireframe, prototype, system",2),sw("3 Case Study","CS E-commerce","Redesign e-commerce",3),sw("3 Case Study","CS Edukasi","Aplikasi edukasi",4),sw("3 Case Study","CS Fintech","Aplikasi finansial",5),sw("Feedback Mentor","Cari 3 Mentor","UX senior di LinkedIn",6),sw("Feedback Mentor","Revisi Portfolio","Perbaiki feedback",7),sw("Project Kolaborasi","Kolab Developer","Project bareng dev",8),sw("Project Kolaborasi","Presentasi","Presentasi di depan",9),sw("Dapet Kerja","20 Lamaran","Kirim ke perusahaan",10)],
 da(["Meditasi","Doa desain","Bersyukur"],["Posture","Stretching tangan","Olahraga"],["Artikel UX","Design system","Tren UI"],["User interview","Usability testing","Desain review"],["Terima feedback","Ga ego","Growth mindset"],["Figma advance","UX writing","Design system"]),
 [af("Product Designer","Strategi produk end-to-end.",["UX","Product strategy","Analytics","Stakeholder"]),af("UX Researcher","User interview dan usability.",["Metode riset","Data analysis","User psychology","Writing"]),af("Design Lead","Pimpin tim desain.",["Kepemimpinan","Direction","Mentoring","System thinking"])],
 [oq("background","Background?",["Desain grafis","Non-desain","IT","Baru mulai"]),oq("tools","Tools?",["Belum","Pernah Figma","Pernah Sketch","Figma mahir"]),oq("minat","Bidang UX?",["UX research","UI visual","Interaction","Product design"]),oq("target","Target?",["UX di perusahaan","Freelance","Product designer","Agency"])])

add("product-manager","Product Manager","\U0001f4cb","from-blue-700 to-indigo-700",B,"1-2 tahun",18,35,"1-2 tahun",
 "Jalur dari fundamental sampe ngelola produk digital. Buat lo yang suka strategic thinking.",
 "PM jembatan bisnis, teknis, desain. Lo nentuin fitur apa, kenapa, ganti ukurnya. Peran kunci produk.",
 ["Product Manager","Product Owner","Associate PM","Technical PM","Product Operations","Growth PM"],
 [bw("Fundamental PM","Product lifecycle, prioritas","RICE, MoSCoW, OKR wajib","Baca buku Inspired",1),bw("Project Mini Produk","PRD, prioritas, timeline","Portofolio tunjukin case study","Open source product",2),bw("Lead Stakeholder","Cross-functional team","Lead tanpa otoritas langsung","Asisten PM",3),bw("Launch Fitur","End-to-end launch","Koordinasi semua tim","Launch plan dummy",4),bw("Ukur Dampak","Impact & iterasi","PM tanggung jawab outcome","Product ops",5)],
 [sw("Fundamental PM","Framework PM","RICE, MoSCoW, OKR",1),sw("Fundamental PM","PRD Pertama","Tulis PRD 1 fitur",2),sw("Project Mini Produk","Case Study","Analisis produk existing",3),sw("Project Mini Produk","Roadmap 3 Bulan","Buat roadmap",4),sw("Lead Stakeholder","Lead Meeting","Cross-functional meeting",5),sw("Lead Stakeholder","Buy-in","Yakinkan stakeholder",6),sw("Launch Fitur","Launch Plan","Go-to-market plan",7),sw("Launch Fitur","Fitur Launch","Fitur berhasil launch",8),sw("Ukur Dampak","Impact Report","Sebelum vs sesudah",9),sw("Ukur Dampak","Iterasi Plan","Rencana iterasi",10)],
 da(["Doa","Refleksi","Bersyukur"],["Jalan sela meeting","Jaga tidur","Minum air"],["Strategi produk","Tren tech","Data analytics"],["1-on-1 stakeholder","Sinkron tim","User interview"],["Prioritasi","Evaluasi keputusan","Jurnal belajar"],["Strategic thinking","Data analysis","Komunikasi"]),
 [af("Product Owner","Fokus execution & backlog.",["Agile","Backlog","Stakeholder","Tech literacy"]),af("Growth PM","Fokus metrik growth.",["Growth loops","A/B testing","Analytics","Eksperimen"]),af("Head of Product","Pimpin tim PM.",["Leadership","Vision","Org design","Strategy"])],
 [oq("background","Background?",["Teknis","Bisnis","Desain","Baru lulus"]),oq("pengalaman","Pengalaman?",["Baru belajar","Bantu project","Udah kerja tech"]),oq("skill","Skill utama?",["Data","Komunikasi","Teknis","Desain"]),oq("target","Target?",["PM startup","PM korporat","CPO","Buka startup"])])

add("e-commerce-owner","Pemilik Toko Online","\U0001f6d2","from-yellow-600 to-orange-500",B,"3-6 bulan",16,35,"3-6 bulan",
 "Jalur dari riset produk sampe bisnis e-commerce jalan. Cocok buat yang mau jualan di Shopee atau Tokopedia.",
 "E-commerce booming di Indonesia. Modal kecil udah bisa mulai. Yang bikin beda strategi dan konsistensi.",
 ["Toko Online Owner","Dropshipper","Brand Owner","E-commerce Manager","Digital Distributor","Social Seller"],
 [bw("Riset Produk","Temuin produk laku margin bagus","Produk jantung bisnis","Affiliate dulu",1),bw("Buka Toko","Toko marketplace/website","Foto deskripsi nentuin konversi","IG/TikTok Shop dulu",2),bw("Transaksi Pertama","Order dari pembeli ga dikenal","Bukti produk laku","Jual ke teman",3),bw("100 Transaksi","Rating 4.8","Naik seller premium","Produk digital",4),bw("Bisnis Otomatis","Sistem dan tim jalan","Bisnis bukan freelance","Fokus 1 channel",5)],
 [sw("Riset Produk","Riset 20 Produk","Cek margin kompetitor",1),sw("Riset Produk","Survey Supplier","Hubungi 5 supplier",2),sw("Buka Toko","Akun Marketplace","Buka seller Tokopedia",3),sw("Buka Toko","Upload 10 Produk","Foto & deskripsi",4),sw("Transaksi Pertama","Order Pertama","Packing dan kirim",5),sw("Transaksi Pertama","Review 5 Bintang","Dapet rating 5",6),sw("100 Transaksi","25 Transaksi","Rating > 4.5",7),sw("100 Transaksi","100 Transaksi","Rating > 4.8",8),sw("Bisnis Otomatis","Rekrut Admin","Bantu packing",9),sw("Bisnis Otomatis","Sistem Operasional","SOP selesai",10)],
 da(["Doa","Bersyukur","Sedekah"],["Posture","Stretching","Atur jam"],["Pricing","Algoritma marketplace","Foto produk"],["Service pelanggan","Follow up","Negosiasi"],["Catat keuangan","Packing disiplin","Review bulanan"],["Foto produk","Copywriting","Inventory"]),
 [af("Brand Owner","Bikin brand dengan margin lebih.",["Branding","Produksi","Marketing","Legalitas"]),af("E-commerce Manager","Kelola toko orang lain.",["Marketplace","Leadership","Analytics","Ads"]),af("Digital Distributor","Distributor resmi brand.",["Supply chain","Sales","Negosiasi","Inventory"])],
 [oq("produk","Jenis produk?",["Fashion","Elektronik","Makanan","Digital","Belum yakin"]),oq("pengalaman","Pernah jualan?",["Belum","Pernah coba","Udah jalan"]),oq("modal","Modal awal?",["< 500rb","500-2jt","2-10jt","> 10jt"]),oq("target","Target?",["Side income","Full-time","Brand besar","Distributor"])])

# ===== HEALTH (5) =====
add("doctor","Dokter","\U0001fa7a","from-teal-600 to-emerald-500",H,"5-7 tahun",14,35,"5-7 tahun",
 "Jalur dari persiapan kuliah kedokteran sampai praktik. Buat lo yang punya panggilan jiwa nolong orang.",
 "Dokter panggilan jiwa bantu sesama. Dedikasi tinggi dan belajar seumur hidup. Kepuasan nyembuhin pasien priceless.",
 ["Dokter Umum","Dokter Spesialis","Dosen Kedokteran","Peneliti Medis","Dokter Militer","Konsultan"],
 [bw("Lulus SMA","Nilai bagus biologi kimia fisika","Persaingan FK ketat","D3 Keperawatan dulu",1),bw("Pre-Klinik","3-4 tahun fundamental","Anatomi, fisiologi, patologi","Gap year",2),bw("Ujian Profesi","OSCE, UKDI, koas","Nentuin layak pegang stetoskop","Fokus riset",3),bw("Internship","1 tahun RS atau puskesmas","Transisi mahasiswa ke dokter","Langsung spesialis",4),bw("Praktik Dokter","Praktik umum atau spesialis","Puncak perjalanan","S2 Kesehatan Masyarakat",5)],
 [sw("Lulus SMA","Nilai 85+","Biologi, kimia stabil",1),sw("Lulus SMA","Lolos UTBK","Masuk FK negeri",2),sw("Pre-Klinik","Lulus Semester 1","Tahun pertama berat",3),sw("Pre-Klinik","Semua Blok","IPK 3.0",4),sw("Ujian Profesi","Lulus OSCE","OSCE kompetensi",5),sw("Ujian Profesi","Lulus UKDI","Uji Kompetensi Dokter",6),sw("Internship","3 Bulan","Evaluasi baik",7),sw("Internship","1 Tahun","Dapat STR",8),sw("Praktik Dokter","Dapet SIP","Surat Izin Praktik",9),sw("Praktik Dokter","Pasien Pertama","Tangani pasien mandiri",10)],
 da(["Doa praktik","Bersyukur","Baca kitab suci"],["Jaga stamina","Tidur cukup","Olahraga"],["Jurnal medis","Update guideline","Belajar kasus"],["Empati pasien","Komunikasi keluarga","Kolaborasi"],["Catat pembelajaran","Etika profesi","Manajemen stres"],["Diagnostic reasoning","Prosedur medis","Komunikasi"]),
 [af("Dosen","Ngajar di FK dan riset.",["Penelitian","Pengajaran","Publikasi","Kurikulum"]),af("Peneliti Medis","Riset di lab.",["Metodologi","Data analysis","Penulisan","Lab"]),af("Kebijakan Kesehatan","Kerja di kemenkes.",["Public health","Policy","Epidemiologi","Stakeholder"])],
 [oq("jalur","Jalur?",["Kedokteran","Kedokteran gigi","Keperawatan","Farmasi","Kesmas"]),oq("mapel","Mapel favorit?",["Biologi","Kimia","Fisika","Matematika","Ga ada"]),oq("minat","Spesialisasi?",["Bedah","Penyakit dalam","Anak","Kulit","Belum tahu"]),oq("target","Target?",["Spesialis","Dosen","Peneliti","Praktik mandiri"])])

add("nurse","Perawat Profesional","\U0001f469\u200d\u2695\ufe0f","from-cyan-500 to-blue-500",H,"3-4 tahun",16,35,"3-4 tahun",
 "Jalur dari pendidikan sampai praktik. Buat lo yang punya hati besar dan pengen ngerawat orang lain.",
 "Perawat pahlawan paling dekat sama pasien. 24 jam nemenin dan support. Tanpa perawat sistem kesehatan ga jalan.",
 ["Perawat RS","Perawat Komunitas","Perawat Home Care","Perawat Pendidik","Perawat Forensik","Manajer Keperawatan"],
 [bw("Lulus Ners","S1 + Profesi Ners","Kompetensi klinis","D3 Keperawatan dulu",1),bw("STR & SIPP","Surat Tanda Registrasi","Lisensi legal","Luar negeri",2),bw("Kerja Perawat","Praktik di RS","Pengalaman langsung","Perawat komunitas",3),bw("Spesialisasi","ICU, anak, jiwa","Gaji lebih baik","Manajemen",4),bw("Pelatih","Ngajar atau instruktur","Bentuk generasi baru","Kepala ruangan",5)],
 [sw("Lulus Ners","IPK 3.0+","S1 Keperawatan",1),sw("Lulus Ners","Lulus Ners","Profesi selesai",2),sw("STR & SIPP","Urus STR","Surat Registrasi",3),sw("STR & SIPP","Dapat SIPP","Izin Praktik",4),sw("Kerja Perawat","Apply 10 RS","Lamaran RS",5),sw("Kerja Perawat","Mulai Dinas","Hari pertama",6),sw("Spesialisasi","Pilih Unit","Tentukan spesialis",7),sw("Spesialisasi","Ikut Diklat","Sertifikasi",8),sw("Pelatih","Workshop","Metode pengajaran",9),sw("Pelatih","Mulai Ngajar","Instruktur klinik",10)],
 da(["Doa shift","Baca kitab","Bersyukur"],["Kebugaran","Stretching","Tidur cukup"],["Jurnal keperawatan","Update SOP","Prosedur baru"],["Komunikasi pasien","Empati","Kolaborasi dokter"],["Catat pengalaman","Manajemen stres","Profesionalisme"],["Prosedur klinis","Komunikasi","Critical thinking"]),
 [af("Perawat Home Care","Rawat pasien di rumah.",["Mandiri","Komunikasi","Jadwal","Kewirausahaan"]),af("Manajer","Pimpin tim perawat.",["Kepemimpinan","SDM","Quality control","SOP"]),af("Perawat Forensik","Bantu investigasi kriminal.",["Forensik","Dokumentasi","Polisi","Trauma"])],
 [oq("pendidikan","Jalur pendidikan?",["D3","S1+Ners","Langsung S1"]),oq("minat","Unit kerja?",["IGD","ICU","Anak","Jiwa","Komunitas","Belum"]),oq("panggilan","Kenapa perawat?",["Bantu orang","Peluang","Panggilan","Ikut ortu"]),oq("target","Target?",["Perawat RS","Luar negeri","Akademisi","Manajer"])])

add("psychologist","Psikolog","\U0001f9e0","from-indigo-500 to-purple-500",H,"5-6 tahun",16,35,"5-6 tahun",
 "Jalur dari S1 Psikologi sampe lulus profesi. Buat lo yang tertarik cara kerja pikiran manusia.",
 "Kesehatan mental makin penting. Psikolog dibutuhin di sekolah, perusahaan, RS. Lo bisa ubah hidup orang.",
 ["Psikolog Klinis","Psikolog Pendidikan","Psikolog Industri","Psikolog Anak","Konselor","Peneliti"],
 [bw("Lulus S1 Psikologi","Konsentrasi sesuai minat","Fundamental teori","S1 lain + minor",1),bw("Program Profesi","S2 Profesi Psikolog","Gelar psikolog dari profesi","S2 Magister Terapan",2),bw("SIP Psikolog","Izin dari HIMPSI","Lisensi legal","Asisten psikolog",3),bw("Praktik","Klinik/sekolah/pribadi","Belajar ke praktik","Psikolog Industri",4),bw("Spesialisasi","Sertifikasi terapi","Expert dan rate naik","Content creator mental health",5)],
 [sw("Lulus S1 Psikologi","IPK 3.4+","Buat S2 kompetitif",1),sw("Lulus S1 Psikologi","Lulus S1","S1 tuntas",2),sw("Program Profesi","Lulus S2 Profesi","Profesi selesai",3),sw("Program Profesi","UKP Lulus","Uji Kompetensi",4),sw("SIP Psikolog","Urus HIMPSI","Dokumen",5),sw("SIP Psikolog","SIP Terbit","Resmi psikolog!",6),sw("Praktik","Supervisi Awal","Diskusi praktik",7),sw("Praktik","10 Klien","Tangani 10 klien",8),sw("Spesialisasi","Pilih Metode","CBT, DBT, EMDR",9),sw("Spesialisasi","Sertifikasi","Training dan sertifikasi",10)],
 da(["Meditasi","Refleksi","Doa"],["Olahraga","Jaga energi","Tidur"],["Jurnal psikologi","Update DSM","Terapi baru"],["Active listening","Komunikasi","HIMPSI"],["Supervisi","Profesionalisme","Self-care"],["Asesmen","Konseling","Intervensi"]),
 [af("Konselor Karir","Bantu milih jurusan/karir.",["Konseling","Asesmen","Pengetahuan industri","Komunikasi"]),af("HR & People Dev","Rekrutmen, training.",["Psikologi industri","Rekrutmen","Training","Org dev"]),af("Content Creator Mental Health","Edukasi di media sosial.",["Konten","Public speaking","Penulisan","Klinis"])],
 [oq("minat","Bidang psikologi?",["Klinis","Pendidikan","Industri","Anak","Sosial"]),oq("tahap","Tahap?",["Mau kuliah","Lagi S1","Lagi profesi","Udah psikolog"]),oq("setting","Setting?",["Klinik","Pribadi","Perusahaan","Sekolah"]),oq("target","Target?",["Praktik","Akademisi","HR","Konten"])])

add("nutritionist","Ahli Gizi","\U0001f957","from-green-500 to-emerald-600",H,"4-5 tahun",16,35,"4-5 tahun",
 "Jalur dari kuliah Ilmu Gizi sampe praktik konsultasi. Buat lo yang percaya makanan adalah obat terbaik.",
 "Gizi fondasi kesehatan. Di era penyakit degeneratif, ahli gizi makin dibutuhin bantu orang hidup lebih sehat.",
 ["Ahli Gizi RS","Konsultan Gizi","Ahli Gizi Olahraga","Food Service Manager","Peneliti Gizi","Nutrition Creator"],
 [bw("Lulus S1 Ilmu Gizi","Ilmu pangan metabolisme","Biokimia bedain dari influencer","D3 Gizi dulu",1),bw("Profesi Dietisien","Pendidikan profesi + UKOM","Lisensi praktik klinis","Nutrisionis industri",2),bw("STR & SIPP","Registrasi ahli gizi","Lisensi legal","R&D makanan",3),bw("Konsultasi","Klinik RS atau pribadi","Skill assessment terasah","Gizi olahraga",4),bw("Spesialisasi","Gizi klinis/olahraga","Value naik","Food blogger",5)],
 [sw("Lulus S1 Ilmu Gizi","IPK 3.2+","Target S1",1),sw("Lulus S1 Ilmu Gizi","Praktikum","Praktikum gizi klinis",2),sw("Profesi Dietisien","Lulus Profesi","Pendidikan profesi",3),sw("Profesi Dietisien","UKOM Gizi","Uji kompetensi",4),sw("STR & SIPP","Urus STR","Registrasi",5),sw("STR & SIPP","Dapat SIPP","Izin praktik",6),sw("Konsultasi","Praktik Pertama","Konsultasi klien",7),sw("Konsultasi","10 Klien","Hasil baik",8),sw("Spesialisasi","Pilih Area","Gizi klinis/olahraga",9),sw("Spesialisasi","Sertifikasi","Training",10)],
 da(["Doa","Bersyukur","Mindful"],["Olahraga","Cek kesehatan","Minum"],["Update gizi","Jurnal dietetik","Tren pangan"],["Edukasi pasien","Komunitas","Kolaborasi dokter"],["Catat kasus","Evaluasi diet","Detail"],["Assessment","Diet planning","Edukasi"]),
 [af("Food Service Manager","Kelola gizi di RS atau hotel.",["Dapur","HACCP","Budgeting","Menu"]),af("Peneliti Gizi","Riset pangan dan gizi.",["Metodologi","Data","Publikasi","Lab"]),af("Content Creator Gizi","Edukasi gizi di sosmed.",["Konten","Ilmu gizi","Komunikasi","Foto"]),[]],
 [oq("minat","Bidang gizi?",["Klinis","Olahraga","Masyarakat","Pangan"]),oq("tahap","Tahap?",["Mau kuliah","Lagi S1","Lagi profesi","Udah praktik"]),oq("setting","Setting?",["RS","Pribadi","Industri","F&B"]),oq("target","Target?",["Konsultan","Food service","Peneliti","Content creator"])])

add("pharmacist","Apoteker","\U0001f48a","from-emerald-600 to-teal-600",H,"4-5 tahun",16,35,"4-5 tahun",
 "Jalur dari kuliah farmasi sampe praktik di apotek atau industri. Garda terakhir keamanan obat.",
 "Apoteker pastiin pasien dapet obat tepat, dosis tepat. Peran krusial yang ngga bisa diganti.",
 ["Apoteker RS","Apoteker Komunitas","Apoteker Industri","Peneliti Obat","Regulatory Affairs","Dosen Farmasi"],
 [bw("Lulus S1 Farmasi","Ilmu obat, kimia farmasi","Fundamental kefarmasian","D3 Farmasi dulu",1),bw("Profesi Apoteker","Pendidikan + sumpah","Gelar dari profesi","Kerja industri",2),bw("STR & SIPA","Registrasi apoteker","Lisensi legal","Regulatory affairs",3),bw("Praktik","Apotek/RS","Konseling obat","QC produksi",4),bw("Spesialisasi","Farmasi klinik atau R&D","Buka peluang","Distributor",5)],
 [sw("Lulus S1 Farmasi","IPK 3.0+","Farmasi butuh IPK",1),sw("Lulus S1 Farmasi","Praktikum Lab","Semua lab selesai",2),sw("Profesi Apoteker","Lulus Profesi","Pendidikan selesai",3),sw("Profesi Apoteker","Sumpah","Sumpah apoteker",4),sw("STR & SIPA","Urus STR","Registrasi",5),sw("STR & SIPA","Dapat SIPA","Izin praktik",6),sw("Praktik","Kerja di Apotek","Mulai praktik",7),sw("Praktik","Racik & Konseling","Resep pertama",8),sw("Spesialisasi","Spesialisasi","Farmasi klinik",9),sw("Spesialisasi","Sertifikasi","Training",10)],
 da(["Doa","Bersyukur","Baca kitab"],["Stamina","Tidur","Asupan"],["Jurnal farmasi","Update DIO","Obat baru"],["Konseling","Kolaborasi dokter","Edukasi"],["Teliti","Etika","Rahasia"],["Farmakologi","Manajemen apotek","Regulasi"]),
 [af("Regulatory Affairs","Urus izin edar obat BPOM.",["Regulasi","Dokumentasi","Standarisasi","Komunikasi"]),af("Peneliti Farmasi","R&D obat baru.",["R&D","Formulasi","Uji klinis","Lab"]),af("Distributor Obat","Supply chain obat.",["Supply chain","Logistik","Warehouse","Cold chain"])],
 [oq("minat","Bidang farmasi?",["Klinis","Industri","Regulasi","Penelitian"]),oq("tahap","Tahap?",["Mau kuliah","Lagi S1","Lagi profesi","Udah apoteker"]),oq("setting","Setting?",["Apotek/RS","Industri","Distributor","Akademisi"]),oq("target","Target?",["Kepala apotek","R&D","BPOM","Buka apotek"])])

# ===== TECH (4) =====
add("programmer","Programmer","\U0001f4bb","from-blue-500 to-indigo-600",Tc,"6-12 bulan",12,35,"6-12 bulan",
 "Jalur dari dasar coding sampe siap kerja di perusahaan teknologi.",
 "Programming superpower era digital. Lo bisa ciptain solusi untuk jutaan orang dan karir yang terus berkembang.",
 ["Frontend Engineer","Backend Engineer","Full-Stack Developer","Mobile Developer","DevOps Engineer","Tech Lead"],
 [bw("Dasar Programming","Algoritma, struktur data, 1 bahasa","Fundamental penting","Bootcamp",1),bw("Website Pertama","Buat deploy project sederhana","Project nyata bedain","Open source",2),bw("Git & Kolaborasi","Git, PR, code review","Developer kerja tim","Side project",3),bw("Portofolio","3 project + CV","Nentuin dilirik","Freelance",4),bw("Dapet Kerja","Job pertama developer","Transisi ke pro","Buka jasa",5)],
 [sw("Dasar Programming","Kuasai 1 Bahasa","JavaScript/Python/Go",1),sw("Dasar Programming","Algoritma Dasar","Sorting, searching",2),sw("Website Pertama","Deploy Website","Vercel Netlify",3),sw("Website Pertama","CRUD App","Aplikasi database",4),sw("Git & Kolaborasi","Git Kuasai","Branch, merge, PR",5),sw("Git & Kolaborasi","Open Source PR","PR pertama",6),sw("Portofolio","3 Project","Portofolio siap",7),sw("Portofolio","CV Siap","CV programmer",8),sw("Dapet Kerja","10 Lamaran","Kirim ke perusahaan",9),sw("Dapet Kerja","Offer Pertama","Job offer",10)],
 da(["Doa coding","Refleksi","Bersyukur"],["Posture","Stretching","Jalan tiap 2 jam"],["Update teknologi","Dokumentasi","Arsitektur"],["Forum","Code review","Pair programming"],["Catat pembelajaran","Debugging","Growth mindset"],["System design","Problem solving","Clean code"]),
 [af("Tech Lead","Pimpin tim developer.",["Leadership","System design","Code review","Mentoring"]),af("DevOps Engineer","CI/CD cloud infrastructure.",["Kubernetes","Docker","Cloud","Automation"]),af("Founder Teknologi","Bikin startup tech.",["Full-stack","Product sense","Team","Business"])],
 [oq("minat","Bidang programming?",["Frontend","Backend","Full-stack","Mobile","Data"]),oq("pengalaman","Pengalaman ngoding?",["Pemula","Udah coba","Udah project"]),oq("target_kerja","Target kerja?",["Startup","Perusahaan","Freelance","Jasa"]),oq("bahasa","Bahasa Inggris?",["Pas","Lumayan","Lancar"])])

add("cybersecurity","Ahli Keamanan Siber","\U0001f510","from-red-700 to-slate-900",Tc,"1-2 tahun",16,35,"1-2 tahun",
 "Jalur dari dasar networking sampe penetration testing. Buat lo yang suka hacking etis.",
 "Digitalisasi bikin data berharga dan rawan bocor. Cybersecurity expert makin kritis dan demand tinggi.",
 ["Security Analyst","Penetration Tester","SOC Analyst","Security Engineer","Incident Responder","CISO"],
 [bw("Networking & Security","TCP/IP, firewall, VPN","Tanpa jaringan ga ngerti security","CompTIA Security+",1),bw("Linux & Scripting","Linux command line","Tools jalan di Linux","Windows security",2),bw("Tools Security","Nmap, Wireshark, Burp Suite","Tools utama pentester","Blue team",3),bw("Lab & Sertifikasi","CTF, HackTheBox, CEH","Sertifikasi buktiin skill","Portofolio write-up",4),bw("Kerja Security","Job pertama cybersecurity","Mulai karir resmi","Bug bounty freelance",5)],
 [sw("Networking & Security","OSI Model","7 layer protokol",1),sw("Networking & Security","Firewall & VPN","Konfigurasi dasar",2),sw("Linux & Scripting","Linux Master","Command line",3),sw("Linux & Scripting","Bash/Python","Script otomasi",4),sw("Tools Security","Nmap & Wireshark","Scan network",5),sw("Tools Security","Burp Suite","Web security testing",6),sw("Lab & Sertifikasi","HackTheBox","50 box completed",7),sw("Lab & Sertifikasi","Sertif eJPT","eLearnSecurity JPT",8),sw("Kerja Security","Apply 20","Kirim lamaran",9),sw("Kerja Security","Job Offer","Offer pertama",10)],
 da(["Doa","Etika hacking","Refleksi"],["Posture","Stretching","Tidur"],["Update CVE","Security blog","Threat intel"],["Komunitas hacker","Forum","Reporting"],["Etis & jawab","Teliti","Continuous learning"],["Penetration testing","Reverse engineering","Incident response"]),
 [af("SOC Analyst","Monitor ancaman di SOC.",["SIEM","Incident response","Log analysis","Threat hunting"]),af("Security Engineer","Bangun sistem keamanan.",["Hardening","Cloud security","IAC","Identity"]),af("Bug Bounty Hunter","Cari vuln dibayar.",["Web security","Mobile security","Recon","Reporting"])],
 [oq("minat","Bidang cybersecurity?",["Pentest","SOC","Security engineering","Forensics","GRC"]),oq("pengalaman","Pengalaman IT?",["Pemula","IT support","Developer"]),oq("target","Target?",["Full-time security","Bug bounty","Security engineer","CISO"]),oq("etika","White hat?",["Pastinya!","Belum yakin","Liat dulu"])])

add("data-scientist","Data Scientist","\U0001f4ca","from-blue-600 to-violet-600",Tc,"1-2 tahun",16,35,"1-2 tahun",
 "Jalur dari statistika sampe machine learning. Buat lo yang suka bedah data.",
 "Data minyak baru. Perusahaan butuh orang bedah data buat keputusan. Data scientist profesi paling dicari.",
 ["Data Scientist","Data Analyst","ML Engineer","Data Engineer","BI Analyst","AI Engineer"],
 [bw("Statistika","Probabilitas, linear algebra","ML tanpa statistik = magic","Data analyst dulu",1),bw("Python & Tools","Pandas, NumPy, Scikit-learn","Stack utama","R dulu",2),bw("SQL & Database","Query kompleks, join","Data di database","Excel dulu",3),bw("ML Project","Data gathering-deployment","Portofolio dari project","Kaggle",4),bw("Portofolio & Job","Solid portfolio","Bidang kompetitif","Freelance analytics",5)],
 [sw("Statistika","Probabilitas","Distribusi, Bayesian",1),sw("Statistika","Linear Algebra","Matriks & vector",2),sw("Python & Tools","Python Dasar","Pandas & NumPy",3),sw("Python & Tools","Scikit-learn","Klasifikasi, regresi",4),sw("SQL & Database","SQL Mahir","Join, window function",5),sw("SQL & Database","DB Design","Normalisasi",6),sw("ML Project","ML Project 1","Gathering, EDA, model",7),sw("ML Project","Kaggle","Submit kompetisi",8),sw("Portofolio & Job","3 Project","Portofolio",9),sw("Portofolio & Job","Apply & Offer","Job offer",10)],
 da(["Doa","Fokus","Bersyukur"],["Posture","Stretching","Jalan"],["Update ML/DL","Baca paper","Teknik baru"],["Diskusi","Sharing","Mentoring"],["Teliti data","Skeptis","Curiosity"],["Machine learning","Deep learning","Data engineering"]),
 [af("ML Engineer","Implementasi ML ke production.",["ML engineering","MLOps","Deployment","Cloud"]),af("Data Engineer","Pipeline data & infrastructure.",["ETL","Spark","Airflow","Warehouse"]),af("AI Engineer","NLP, computer vision.",["Deep learning","NLP/CV","LLM","PyTorch"])],
 [oq("minat","Bidang data?",["Data science","Analyst","ML engineer","Data engineer","AI"]),oq("pengalaman","Pengalaman?",["Pemula","Pernah coding","Olah data","Udah kerja"]),oq("tools","Tools?",["None","Python dasar","SQL","Python+SQL"]),oq("target","Target?",["Data scientist","ML engineer","Data engineer","AI researcher"])])

add("game-developer","Game Developer","\U0001f3ae","from-rose-600 to-purple-600",Tc,"1-2 tahun",14,35,"1-2 tahun",
 "Jalur dari dasar programming sampe bikin game sendiri. Buat lo yang suka main game dan pengin bikinnya.",
 "Industri game Indonesia makin ngebut. Kerja di studio, indie, atau ekspor game ke luar. Kreativitas + teknologi.",
 ["Game Programmer","Game Designer","Game Artist","Game Producer","Indie Developer","Technical Artist"],
 [bw("Dasar Game Dev","Pilih engine, logic dasar","Engine tepat buat tujuan","Text-based game dulu",1),bw("Game Sederhana","Pong/Snake/Flappy Bird","Game loop & logic","Game jam 48 jam",2),bw("Asset & Desain","Asset visual + UI","Visual dan audio penting","Asset store",3),bw("Game Jadi & Rilis","Rilis di itch.io/Play Store","Portofolio riil","Prototyping terus",4),bw("Kontrak/Job","Kerja di studio atau project","Mulai karir pro","Indie publish",5)],
 [sw("Dasar Game Dev","Unity/Unreal","Engine siap",1),sw("Dasar Game Dev","C# atau C++","Bahasa scripting",2),sw("Game Sederhana","Game Pertama","Pong atau Snake",3),sw("Game Sederhana","Game 2D","Score & game over",4),sw("Asset & Desain","Asset Game","Karakter background audio",5),sw("Asset & Desain","UI Game","Main menu, pause",6),sw("Game Jadi & Rilis","Build Game","Build desktop/mobile",7),sw("Game Jadi & Rilis","Rilis Itch.io","Game bisa didownload",8),sw("Kontrak/Job","Portfolio Siap","3 game di portofolio",9),sw("Kontrak/Job","Job/Project","Project bayaran",10)],
 da(["Doa","Fokus","Bersyukur"],["Posture","Stretching","Olahraga"],["Game design theory","Engine update","Optimasi"],["Game jam","Komunitas indie","Feedback tester"],["Iterasi","Terima kritik","Problem solving"],["Gameplay programming","Shader & VFX","Optimasi"]),
 [af("Game Designer","Rancang mekanik & level.",["Game design","Level design","Narrative","Balancing"]),af("Technical Artist","Jembatan artis-programmer.",["Shader","Pipeline","Python/tools","Rigging"]),af("Indie Studio","Bikin studio game sendiri.",["Entrepreneurship","Full-stack","Marketing","Project mgmt"])],
 [oq("peran","Peran di game dev?",["Programmer","Designer","Artist","Producer","All-rounder"]),oq("engine","Engine favorit?",["Unity","Unreal","Godot","Construct","Belum"]),oq("genre","Genre?",["2D platformer","3D action","Puzzle","RPG","FPS","Simulasi"]),oq("target","Target?",["Studio game","Indie","Freelance","Buka studio"])])

# ===== LIFESTYLE (6) =====
add("chef","Koki Profesional","\U0001f468\u200d\U0001f373","from-red-600 to-orange-600",L,"2-4 tahun",16,35,"2-4 tahun",
 "Jalur dari masak dasar sampe kerja di restoran atau punya usaha kuliner.",
 "Kuliner passion yang ga pernah mati. Koki bukan cuma masak enak \u2014 lo bikin orang bahagia lewat makanan.",
 ["Chef Restoran","Pastry Chef","Personal Chef","Food Stylist","Konsultan Kuliner","Pemilik Restoran"],
 [bw("Teknik Dasar Masak","Knife skills, stock, sauce","Dasar nentuin hasil","Kursus online",1),bw("Dapur Profesional","Magang restoran commis","Beda 180 derajat","Catering kecil",2),bw("Spesialisasi","Pastry/asian/western","Nilai lebih & gaji tinggi","Food stylist",3),bw("Chef de Partie","Pimpin 1 section","Promosi pertama","Bisnis sendiri",4),bw("Chef Eksekutif","Head chef atau buka resto","Puncak karir","Konsultan",5)],
 [sw("Teknik Dasar Masak","Knife Skills","Cincang, julienne",1),sw("Teknik Dasar Masak","5 Sauce Ibu","Bechamel, veloute, dll",2),sw("Dapur Profesional","Magang","Magang 3 bulan resto",3),sw("Dapur Profesional","Survive Shift","Shift pertama",4),sw("Spesialisasi","Pilih Spesialisasi","Pastry/asian/western",5),sw("Spesialisasi","Signature Dish","Menu signature",6),sw("Chef de Partie","Lead Section","Pimpin stasiun",7),sw("Chef de Partie","Train Junior","Ngajari commis",8),sw("Chef Eksekutif","Sous Chef","Naik sous chef",9),sw("Chef Eksekutif","Buka Resto","Buka bisnis kuliner",10)],
 da(["Doa masak","Bersyukur","Mindful"],["Stamina dapur","Posture berdiri","Stretching"],["Resep baru","Food science","Safety"],["Team dapur","FOH komunkasi","Feedback"],["Speed teliti","Calm pressure","Kebersihan"],["Cooking techniques","Plating","Menu development"]),
 [af("Pastry Chef","Spesialis dessert dan roti.",["Pastry","Baking","Gula","Krim"]),af("Food Stylist","Styling makanan foto/video.",["Styling","Fotografi","Prop","Tren"]),af("Konsultan Kuliner","Bantu bisnis F&B.",["Menu development","Operation","Training","Cost control"])],
 [oq("spesialisasi","Spesialisasi?",["Masakan Indonesia","Western","Pastry & bakery","Semua"]),oq("pengalaman","Pengalaman masak?",["Pemula","Hobi","Pernah kerja dapur"]),oq("target","Target?",["Kerja resto","Buka bisnis","Personal chef","Konten kuliner"]),oq("pendidikan","Pendidikan?",["Otodidak","Kursus","Akademi chef","SMA aja"])])

add("travel-vlogger","Travel Vlogger","\U0001f30d","from-cyan-500 to-sky-500",L,"6-12 bulan",16,35,"6-12 bulan",
 "Jalur dari nol jadi travel vlogger yang bisa jalan-jalan dan dibayar buat itu.",
 "Travel vlogger bukan cuma jalan-jalan \u2014 lo bercerita, ngasih tips, dan ngenalin budaya ke dunia.",
 ["Travel Vlogger","Travel Blogger","Videographer","Tour Guide","Travel Agent","Destination Marketer"],
 [bw("Niche & Gaya","Tentukan niche travel","Bikin identitas unik","Vlog lokal dulu",1),bw("Konten Perjalanan","Rekam edit travel pertama","Edit cerita penting","Photo blogging",2),bw("1000 Subscriber","Dapetin 1000 subscriber","Monetisasi YPP","Afiliasi travel",3),bw("Kerja Sama","Hotel/tourism board collab","Kolab pertama","Couchsurfing",4),bw("Full-time Travel","Hidup dari travel","Mimpi jadi nyata","Freelance videographer",5)],
 [sw("Niche & Gaya","Riset 10 Travel Vlogger","Analisis niche",1),sw("Niche & Gaya","Buat Branding","Nama, logo, style",2),sw("Konten Perjalanan","Trip Pertama","Trip lokal 3 hari",3),sw("Konten Perjalanan","Video Pertama","Upload vlog perjalanan",4),sw("1000 Subscriber","Konsisten 30 Hari","Upload 2x seminggu",5),sw("1000 Subscriber","1000 Subs","Subscriber organik",6),sw("Kerja Sama","Media Kit","Buat media kit",7),sw("Kerja Sama","Kolab Pertama","Hotel/homestay collab",8),sw("Full-time Travel","Monetisasi","Ads sponsorship",9),sw("Full-time Travel","Trip Luar Negeri","Trip internasional",10)],
 da(["Doa travel","Bersyukur","Menikmati"],["Jalan kaki banyak","Jaga kesehatan","Packing"],["Destinasi baru","Tips travel","Budaya lokal"],["Interaksi lokal","Networking traveler","Storytelling"],["Adaptif","Flexible","Keluar zona nyaman"],["Video editing","Photography","Storytelling"]),
 [af("Travel Blogger","Tulis blog perjalanan.",["Penulisan","Fotografi","SEO","Media sosial"]),af("Tour Guide","Pemandu wisata lokal.",["Pengetahuan lokal","Komunikasi","Organisasi","Bahasa"]),af("Destination Marketer","Promosi destinasi.",["Marketing","Content creation","Networking","Analytics"])],
 [oq("gaya","Gaya travel?",["Backpacker","Luxury","Kuliner","Petualangan","Keluarga"]),oq("pengalaman","Pernah travel?",["Jarang","1-2 kali setahun","Sering banget"]),oq("peralatan","Peralatan?",["HP aja","Kamera HP","Kamera profesional","Belum punya"]),oq("target","Target?",["Travel vlogger","Blogger","Guide","Marketing"])])

add("fitness-coach","Fitness Coach","\U0001f4aa","from-amber-600 to-red-600",L,"6-12 bulan",16,35,"6-12 bulan",
 "Jalur dari fitness enthusiast jadi coach profesional yang bisa bantu orang capai tujuan fitnes mereka.",
 "Fitness bukan cuma fisik \u2014 ini mental dan gaya hidup. Jadi coach berarti lo bantu orang jadi versi terbaik diri mereka.",
 ["Personal Trainer","Fitness Content Creator","Online Coach","Gym Manager","Nutrition Coach","Fitness Entrepreneur"],
 [bw("Dasar Fitness","Anatomi, biomekanik, nutrisi","Fundamental coach","Jadi client dulu",1),bw("Sertifikasi","ACE/NASM/ISSA","Kredibilitas sertifikasi","Pengalaman otodidak",2),bw("Client Pertama","Klien bayaran pertama","Transisi hobby ke pro","Training teman gratis",3),bw("Spesialisasi","Weight loss/strength/sport","Niche lebih mahal","General coach",4),bw("Bisnis Fitness","Online coaching atau gym","Skalasi bisnis","Content creator fitness",5)],
 [sw("Dasar Fitness","Anatomi Dasar","Otot dan gerakan",1),sw("Dasar Fitness","Program Pertama","Buat program sendiri",2),sw("Sertifikasi","Cari Sertifikasi","ACE atau NASM",3),sw("Sertifikasi","Lulus Sertifikasi","Sertifikasi dapat",4),sw("Client Pertama","Free Trial","Training teman gratis",5),sw("Client Pertama","Client Bayaran","Klien pertama bayar",6),sw("Spesialisasi","Pilih Niche","Weight loss/strength",7),sw("Spesialisasi","Program Spesifik","Buat program niche",8),sw("Bisnis Fitness","Online Program","Jual program online",9),sw("Bisnis Fitness","Launch Brand","Launch brand fitness",10)],
 da(["Doa","Syukur","Mindful"],["Latihan rutin","Cardio","Stretching"],["Ilmu anatomi","Nutrisi","Teknik baru"],["Komunikasi klien","Komunitas gym","Feedback"],["Disiplin","Konsisten","Teladan"],["Program design","Teknik latihan","Coaching"]),
 [af("Fitness Content Creator","Konten fitnes di sosmed.",["Content creation","Fitness knowledge","Public speaking","Editing"]),af("Nutrition Coach","Fokus gizi dan diet.",["Nutrition","Diet planning","Conseling","Behavior change"]),af("Gym Manager","Kelola operasional gym.",["Manajemen","Sales","Customer service","Equipment"])],
 [oq("spesialisasi","Bidang fitness?",["Strength training","Weight loss","Calisthenics","Yoga","Crossfit"]),oq("sertifikasi","Punya sertifikasi?",["Belum","ACE","NASM","ISSA","Lain"]),oq("pengalaman","Pengalaman latihan?",["Pemula","1-2 tahun","> 3 tahun"]),oq("target","Target?",["Personal trainer","Online coach","Content creator","Buka gym"])])

add("fashion-model","Fashion Model","\U0001f9cd","from-violet-600 to-pink-500",L,"3-12 bulan",16,35,"3-12 bulan",
 "Jalur jadi fashion model dari portfolio sampe runway. Buat lo yang percaya diri dan tertarik dunia modeling.",
 "Modeling bukan cuma wajah dan badan \u2014 ini soal profesionalisme dan personal brand. Industri fashion butuh talent diverse.",
 ["Fashion Model","Editorial Model","Commercial Model","Runway Model","Brand Ambassador","Model Influencer"],
 [bw("Portfolio Dasar","Bikin portfolio dengan fotografer","Portfolio passport ke industri","TFCD dulu",1),bw("Komposit Siap","Bikin comp card & digit branding","CV model","Bikin IG portfolio",2),bw("Casting Pertama","Ikut casting resmi pertama","Exposure & pengalaman","Submit online",3),bw("Job Bayaran","Dapet job bayaran pertama","Transisi ke pro","Fitting model",4),bw("Agensi & Karir","Gabung agensi resmi","Scaling karir","Freelance model",5)],
 [sw("Portfolio Dasar","Cari Fotografer","Cari TFCD fotografer",1),sw("Portfolio Dasar","Shoot Portfolio","Photo shoot 3 looks",2),sw("Komposit Siap","Buat Comp Card","Front, profile, 3/4",3),sw("Komposit Siap","Digit Branding","IG portfolio siap",4),sw("Casting Pertama","Cari Casting","Info casting terdekat",5),sw("Casting Pertama","Dateng Casting","Dateng ke casting",6),sw("Job Bayaran","Job Pertama","Dapet job bayaran",7),sw("Job Bayaran","3 Job","3 job dengan referral",8),sw("Agensi & Karir","Apply Agensi","Daftar ke agensi",9),sw("Agensi & Karir","Gabung Agensi","Resmi di agensi",10)],
 da(["Doa","Syukur","Afirmasi"],["Jaga badan","Skincare","Olahraga"],["Tren fashion","Posing","Catwalk"],["Networking","Follow up","Interaksi"],["Profesional","Disiplin","On time"],["Posing","Catwalk","Expression"]),
 [af("Brand Ambassador","Wakilin brand di event.",["Public speaking","Personal branding","Social media","Sales"]),af("Model Influencer","Model + konten kreator.",["Content creation","Personal brand","Photography","Engagement"]),af("Fashion Stylist","Pindah ke belakang layar.",["Styling","Wardrobe","Tren","Visi kreatif"])],
 [oq("jenis","Jenis modeling?",["Fashion","Commercial","Editorial","Runway","Plus size"]),oq("pengalaman","Pengalaman?",["Pemula","Pernah coba","Udah job"]),oq("tinggi","Tinggi badan?",["< 160","160-165","165-170","170-175","> 175"]),oq("target","Target?",["Agensi","Freelance","Influencer","Brand ambass"])])

add("photographer","Fotografer Profesional","\U0001f4f8","from-gray-700 to-gray-900",L,"6-12 bulan",14,35,"6-12 bulan",
 "Jalur dari hobi foto jadi fotografer profesional yang dibayar buat mengabadikan momen.",
 "Fotografi ngajarin lo liat dunia dari sudut pandang beda. Jadi fotografer lo ngerekam sejarah dan emosi yang ga terulang.",
 ["Wedding Photographer","Commercial Photographer","Portrait Photographer","Editorial Photographer","Videographer","Photo Editor"],
 [bw("Kuasai Kamera","Segitiga exposure, komposisi","Fundamental nentuin kualitas","HP dulu",1),bw("Lighting & Edit","Natural & artificial light","Lighting bedain amatir-pro","Filter aja dulu",2),bw("Portofolio","10 foto strong dengan niche","Portfolio nentuin klien","Project 365",3),bw("Client Pertama","Dapet client bayaran","Transisi hobi ke pro","Shoot teman gratis",4),bw("Studio/Bisnis","Buka studio atau full-time","Karir profesional","Wedding vendor",5)],
 [sw("Kuasai Kamera","Segitiga Exposure","ISO aperture shutter",1),sw("Kuasai Kamera","Komposisi","Rule of thirds, lines",2),sw("Lighting & Edit","Lighting","Natural + flash dasar",3),sw("Lighting & Edit","Lightroom/PS","Editing dasar",4),sw("Portofolio","Pilih Niche","Wedding/portrait/commercial",5),sw("Portofolio","10 Foto Kuat","Portofolio siap",6),sw("Client Pertama","Shoot Portfolio","Shoot gratis portofolio",7),sw("Client Pertama","Client Bayaran","Job bayaran pertama",8),sw("Studio/Bisnis","Branding","Buat nama & website",9),sw("Studio/Bisnis","Launch","Launch jasa fotografi",10)],
 da(["Doa","Syukur","Apresiasi"],["Jaga stamina","Posture","Jalan"],["Teknik baru","Edit terbaru","Fotografer inspirasi"],["Client komunikasi","Kolaborasi","Networking"],["Rutin motret","Evaluasi hasil","Terima kritik"],["Composition","Lighting","Editing"]),
 [af("Videographer","Video untuk wedding/event.",["Video","Stabilization","Editing","Storytelling"]),af("Photo Editor","Edit foto profesional.",["Photoshop","Capture One","Color grading","Retouching"]),af("Creative Director","Arahkan visi kreatif.",["Art direction","Leadership","Visual concept","Client mgmt"])],
 [oq("niche","Niche foto?",["Wedding","Portrait","Commercial/Lifestyle","Travel","Street"]),oq("peralatan","Kamera?",["HP","DSLR/Mirrorless","Sony/Canon/Nikon","Belum punya"]),oq("pengalaman","Pengalaman?",["Pemula","Hobi","Pernah job"]),oq("target","Target?",["Wedding","Commercial","Content creator","Buka studio"])])

add("writer","Penulis Profesional","\U0001f4dd","from-stone-600 to-amber-800",L,"6-12 bulan",14,35,"6-12 bulan",
 "Jalur jadi penulis dari blog pribadi sampe buku terbit. Buat lo yang suka nulis dan punya cerita.",
 "Kata-kata punya kekuatan. Penulis bisa ngerubah cara pandang orang, nginspirasi, dan ninggalin warisan lewat tulisan yang abadi.",
 ["Penulis Buku","Content Writer","Copywriter","Jurnalis","Penulis Skenario","Technical Writer"],
 [bw("Rutin Menulis","Konsisten nulis tiap hari","Skill nulis cuma dapet dari nulis","Nulis diary",1),bw("Blog/Platform","Blog, Medium, atau platform","Publish karya pertama","Ghostwriting",2),bw("100 Artikel","100 artikel terbit","Bukti konsistensi","Kualitas > kuantitas",3),bw("Umpan Balik","Dapet feedback editor","Naikin level nulis","Komunitas nulis",4),bw("Buku/Penghasilan","Terbit buku atau nulis bayaran","Transisi ke penulis pro","Freelance writer",5)],
 [sw("Rutin Menulis","Nulis 100 Kata/Hari","Konsisten 100 kata",1),sw("Rutin Menulis","Nulis 30 Hari","Challenge 30 hari",2),sw("Blog/Platform","Buka Blog","Blog atau Medium",3),sw("Blog/Platform","Artikel Pertama","Publish artikel pertama",4),sw("100 Artikel","10 Artikel","10 artikel terbit",5),sw("100 Artikel","100 Artikel","100 artikel",6),sw("Umpan Balik","Cari Editor","Kirim ke editor",7),sw("Umpan Balik","Revisi Naskah","Revisi feedback",8),sw("Buku/Penghasilan","Naskah Buku","Selesai naskah buku",9),sw("Buku/Penghasilan","Job Nulis","Job nulis bayaran",10)],
 da(["Doa","Syukur","Renung"],["Jaga posture","Jalan","Stretching"],["Baca buku","Teknik nulis","Grammar"],["Komunitas nulis","Feedback","Berbagi"],["Rutin nulis","Disiplin","Tahan kritik"],["Storytelling","Penulisan kreatif","Editing"]),
 [af("Content Writer","Nulis konten website/brand.",["SEO","Research","Adaptasi tone","Deadline"]),af("Copywriter","Nulis iklan dan marketing.",["Persuasive writing","Brand voice","Headline","AIDA"]),af("Penulis Skenario","Nulis film atau series.",["Story structure","Dialogue","Character","Format"])],
 [oq("genre","Genre tulisan?",["Fiksi","Non-fiksi","Puisi","Jurnalistik","Konten digital"]),oq("pengalaman","Pengalaman nulis?",["Pemula","Blog pribadi","Pernah publikasi"]),oq("target","Target?",["Penulis buku","Content writer","Jurnalis","Skenario"]),oq("bahasa","Bahasa nulis?",["Indonesia","Inggris","Dua-duanya"])])

print(f"Total templates: {len(rows)}")
# Write SQL
with open("/home/taradfs/beautifio/supabase/migrations/00021_seed_30_templates.sql", "w") as f:
    f.write("-- ============================================================================\n")
    f.write("-- 00021_seed_30_templates.sql\n")
    f.write("-- Beautifio \u2014 Seed 30 dream templates across 6 categories\n")
    f.write("-- ============================================================================\n\n")
    f.write("TRUNCATE dream_templates CASCADE;\n\n")
    f.write("INSERT INTO dream_templates (\n")
    f.write("  slug, title, emoji, color, category, duration, description, why_matters,\n")
    f.write("  career_options, success_examples, big_wins, small_wins, daily_activities,\n")
    f.write("  alternative_futures, min_age, max_age, journey_duration_years,\n")
    f.write("  onboarding_questions\n")
    f.write(") VALUES\n\n")

    for i, t in enumerate(rows):
        sep = ";" if i == len(rows) - 1 else ","
        bw_json = json.dumps(t[12], ensure_ascii=False).replace("'", "''")
        sw_json = json.dumps(t[13], ensure_ascii=False).replace("'", "''")
        da_json = json.dumps(t[14], ensure_ascii=False).replace("'", "''")
        af_json = json.dumps(t[15], ensure_ascii=False).replace("'", "''")
        oq_json = json.dumps(t[16], ensure_ascii=False).replace("'", "''")
        ca_sql = "ARRAY[" + ", ".join(esc(x) for x in t[11]) + "]"

        f.write("(\n")
        f.write(f"  {esc(t[0])},\n")
        f.write(f"  {esc(t[1])},\n")
        f.write(f"  {esc(t[2])},\n")
        f.write(f"  {esc(t[3])},\n")
        f.write(f"  {esc(t[4])},\n")
        f.write(f"  {esc(t[5])},\n")
        f.write(f"  {esc(t[9])},\n")
        f.write(f"  {esc(t[10])},\n")
        f.write(f"  {ca_sql},\n")
        f.write(f"  '[]'::jsonb,\n")
        f.write(f"  '{bw_json}'::jsonb,\n")
        f.write(f"  '{sw_json}'::jsonb,\n")
        f.write(f"  '{da_json}'::jsonb,\n")
        f.write(f"  '{af_json}'::jsonb,\n")
        f.write(f"  {t[6]}, {t[7]},\n")
        f.write(f"  {esc(t[8])},\n")
        f.write(f"  '{oq_json}'::jsonb\n")
        f.write(f"){sep}\n\n")

print(f"Written to supabase/migrations/00021_seed_30_templates.sql")
print("Done!")
