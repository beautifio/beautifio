#!/usr/bin/env python3
import json

def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, int):
        return str(v)
    if isinstance(v, str):
        v = v.replace("'", "''")
        return f"'{v}'"
    if isinstance(v, list):
        items = ", ".join(json.dumps(x, ensure_ascii=False) for x in v)
        return f"ARRAY[{items}]"
    raise ValueError(f"Unknown type {type(v)} for {v}")

def j(v):
    s = json.dumps(v, ensure_ascii=False, indent=1)
    s = s.replace("'", "''")
    return f"'{s}'::jsonb"

class T:
    def __init__(self, slug, title, emoji, color, category, duration, min_age, max_age, journey_duration_years,
                 description, why_matters, career_options, big_wins, small_wins, daily_activities,
                 alternative_futures, onboarding_questions):
        self.slug = slug
        self.title = title
        self.emoji = emoji
        self.color = color
        self.category = category
        self.duration = duration
        self.min_age = min_age
        self.max_age = max_age
        self.journey_duration_years = journey_duration_years
        self.description = description
        self.why_matters = why_matters
        self.career_options = career_options
        self.big_wins = big_wins
        self.small_wins = small_wins
        self.daily_activities = daily_activities
        self.alternative_futures = alternative_futures
        self.onboarding_questions = onboarding_questions

    def to_sql_row(self, is_last):
        cols = [
            q(self.slug), q(self.title), q(self.emoji), q(self.color), q(self.category),
            q(self.duration), q(self.description), q(self.why_matters),
            q(self.career_options), "'[]'::jsonb",
            j(self.big_wins), j(self.small_wins), j(self.daily_activities),
            j(self.alternative_futures), self.min_age, self.max_age, q(self.journey_duration_years),
            j(self.onboarding_questions)
        ]
        outer = "(" + "\n  " + ",\n  ".join(cols) + "\n)"
        if is_last:
            return outer + ";"
        return outer + ","

data = []
cat = "sports"
# --- SPORTS ---
data.append(T("pro-footballer", "Pemain Sepak Bola Profesional", "⚽", "from-green-600 to-emerald-500", cat, "8-15 tahun", 8, 35, "8-15 tahun",
    "Jalur menjadi pesepakbola profesional dari SSB sampai ke klub besar. Cocok buat lo yang dari kecil bercita-cita jadi pemain Timnas.",
    "Sepak bola bukan cuma olahraga — ini sekolah kehidupan. Lewat sepak bola lo belajar disiplin, kerja tim, dan mental baja. Pemain profesional nga cuma ngejar gol, tapi jadi inspirasi buat generasi muda Indonesia.",
    ["Pemain Klub Profesional (Liga 1, Liga 2)", "Tim Nasional Indonesia", "Pemain Luar Negeri (Asia, Eropa)", "Pelatih Profesional", "Akademi Pembinaan Muda", "Analis Sepak Bola", "Manajer Olahraga"],
    [{"title":"Mulai di SSB atau Akademi","description":"Gabung SSB atau akademi resmi untuk latihan terstruktur","why_it_matters":"Teknik dasar yang benar di usia muda nentuin seberapa jauh lo bisa melangkah","alternative_path":"Ikut ekstrakurikuler sepak bola di sekolah","order":1},{"title":"Jadi Pemain Inti Tim","description":"Tembus starting eleven dan jadi andalan tim","why_it_matters":"Konsistensi jadi pembeda antara pemain biasa dan pemain hebat","alternative_path":"Fokus jadi pemain pengganti yang berdampak","order":2},{"title":"Kompetisi Resmi Pertama","description":"Ikut turnamen resmi tingkat provinsi","why_it_matters":"Mental bertanding nga bisa dilatih cuma di latihan","alternative_path":"Ikut turnamen antar-sekolah","order":3},{"title":"Ikut Seleksi Pelatda/Pelatnas","description":"Seleksi Pemusatan Latihan Nasional untuk Timnas usia muda","why_it_matters":"Gerbang ke level profesional dan akses pembinaan level atas","alternative_path":"Fokus ke karir klub dulu","order":4},{"title":"Teken Kontrak Profesional","description":"Tanda tangan kontrak pertama dengan klub profesional","why_it_matters":"Puncak dari bertahun-tahun perjuangan — tapi ini baru awal","alternative_path":"Jalur manajemen atau pelatih","order":5}],
    [{"big_win_title":"Mulai di SSB atau Akademi","title":"Survey 3 SSB","description":"Dateng dan cek 3 SSB di kotamu","order":1},{"big_win_title":"Mulai di SSB atau Akademi","title":"Trial Session","description":"Coba latihan gratis di SSB pilihan","order":2},{"big_win_title":"Jadi Pemain Inti Tim","title":"Latihan Ekstra","description":"Latihan di luar jadwal 3x seminggu","order":3},{"big_win_title":"Jadi Pemain Inti Tim","title":"Evaluasi Pelatih","description":"Minta feedback langsung soal kelemahan","order":4},{"big_win_title":"Kompetisi Resmi Pertama","title":"Daftar Turnamen","description":"Daftar turnamen resmi level kota","order":5},{"big_win_title":"Kompetisi Resmi Pertama","title":"Main Full 90 Menit","description":"Main penuh tanpa diganti di laga resmi","order":6},{"big_win_title":"Ikut Seleksi Pelatda/Pelatnas","title":"Persiapan Fisik","description":"Latihan intensif 2 bulan sebelum seleksi","order":7},{"big_win_title":"Ikut Seleksi Pelatda/Pelatnas","title":"Lolos Seleksi","description":"Ikut dan lolos seluruh tahapan seleksi","order":8},{"big_win_title":"Teken Kontrak Profesional","title":"Negosiasi Kontrak","description":"Baca kontrak dengan bantuan agen","order":9},{"big_win_title":"Teken Kontrak Profesional","title":"Debut Profesional","description":"Hari pertama sebagai pemain profesional","order":10}],
    {"spiritual":["Sholat tepat waktu","Doa sebelum latihan","Baca Al-Quran 10 menit"],"physical":["Latihan fisik 1 jam","Stretching 15 menit","Lari pagi 3km"],"knowledge":["Tonton analisis pertandingan","Baca taktik bola","Belajar bahasa Inggris"],"social":["Komunikasi sama pelatih","Diskusi taktik sama tim","Jaga hubungan keluarga"],"character":["Catat progres harian","Evaluasi latihan","Latihan ekstra tanpa disuruh"],"dream_skill":["Latihan dribbling","Latihan passing & shooting","Latihan tactical awareness"]},
    [{"title":"Pelatih Sepak Bola","description":"Dari pemain jadi pelatih — banyak legenda sepak bola sukses sebagai pelatih top.","skills":["Manajemen tim","Analisis pertandingan","Komunikasi","Lisensi kepelatihan"]},{"title":"Manajer Olahraga","description":"Kerja di belakang layar sebagai manajer klub atau scout.","skills":["Manajemen olahraga","Networking","Bisnis","Negosiasi"]},{"title":"Analis & Komentator","description":"Jadi pengamat sepak bola di TV atau media digital.","skills":["Analisis data","Public speaking","Pengetahuan taktik","Penulisan"]}],
    [{"id":"posisi","type":"single_select","label":"Posisi favorit lo di lapangan?","options":["Kiper","Bek","Gelandang","Penyerang","Belum yakin"]},{"id":"ssb_status","type":"single_select","label":"Udah pernah gabung SSB atau akademi?","options":["Belum pernah","Baru gabung","Udah > 1 tahun"]},{"id":"kompetisi","type":"single_select","label":"Pengalaman kompetisi resmi?","options":["Belum pernah","1-5 turnamen","> 5 turnamen"]},{"id":"target","type":"single_select","label":"Target utama lo?","options":["Timnas Indonesia","Klub luar negeri","Liga 1","Pemain profesional aja"]}]
))

print("Script generated successfully. Run: python gen_seed_full.py > output.sql")
print(f"Total templates: {len(data)}")
