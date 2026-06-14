-- ============================================================================
-- 00019_seed_football_phases.sql
-- Seed data untuk dream_phases + small_win_templates
-- Dream: Pemain Sepak Bola Profesional (slug: football-player)
-- Sumber: Benchmark Database [M01]
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- FASE 1: Fondasi (Usia 8–12 tahun)
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_phase_id UUID;
BEGIN

INSERT INTO dream_phases (
  dream_template_slug, phase_number, phase_name,
  age_min, age_max,
  big_win_title, big_win_description,
  industry_benchmark, over_achievement, behind_schedule_signal,
  sort_order
) VALUES (
  'football-player', 1, 'Fondasi',
  8, 12,
  'Bergabung dan aktif di SSB atau akademi junior lokal',
  'Mulai latihan terstruktur di Sekolah Sepak Bola (SSB) atau akademi usia muda. Konsistensi latihan adalah fondasi utama.',
  'Di usia 12, pemain berbakat di Indonesia sudah aktif di SSB minimal 2 tahun (PSSI Grassroots Program).',
  'Terpilih di seleksi tim daerah (POPDA/O2SN) sebelum usia 12',
  'Belum punya tim/SSB di usia 11+ → prioritas utama cari klub',
  1
)
RETURNING id INTO v_phase_id;

-- Small Win 1.1
INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (
  v_phase_id,
  'Kuasai teknik dasar bola',
  'Jugling, passing, dan kontrol bola dasar',
  '50 jugling berturut-turut, passing akurasi 7/10 jarak 10m',
  NULL,
  'Hitung sendiri dan catat video',
  1
);

-- Small Win 1.2
INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (
  v_phase_id,
  'Stamina dasar',
  'Daya tahan lari tanpa berhenti',
  'Lari 1.2km tanpa berhenti (Cooper Test: >1.600m dalam 12 menit)',
  NULL,
  'Test Cooper di lapangan, catat jarak',
  2
);

-- Small Win 1.3
INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (
  v_phase_id,
  'Ikut pertandingan resmi pertama',
  'Pengalaman bertanding resmi di luar latihan',
  'Minimal 5 pertandingan resmi dalam setahun',
  'pertandingan',
  'Catat nama kompetisi dan tanggal',
  3
);

-- ────────────────────────────────────────────────────────────────────────────
-- FASE 2: Pengembangan (Usia 12–15 tahun)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO dream_phases (
  dream_template_slug, phase_number, phase_name,
  age_min, age_max,
  big_win_title, big_win_description,
  industry_benchmark, over_achievement, behind_schedule_signal,
  sort_order
) VALUES (
  'football-player', 2, 'Pengembangan',
  12, 15,
  'Masuk akademi resmi klub Liga atau tim daerah kompetitif',
  'Bergabung dengan akademi resmi klub Liga 1/Liga 2 atau tim daerah yang terstruktur dan kompetitif.',
  'Akademi Liga 1 (Persija, Persib, PSS, dll) rekrut pemain U-13 dan U-15. Di usia 14, pemain top dunia (Mbappe, Pedri) sudah di akademi top.',
  'Dipanggil seleksi timnas U-14 atau U-15 PSSI',
  'Di usia 15 belum pernah ikut seleksi akademi manapun',
  2
)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'VO2 Max', 'Kapasitas aerobik minimal standar', '46–48 ml/kg/min', 'ml/kg/min', 'Beep Test (20m shuttle run) — level 8 setara ~48 VO2Max', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Kecepatan sprint', 'Sprint 30 meter', '< 5.0 detik', 'detik', 'Stopwatch, minimal 3 percobaan, ambil yang terbaik', 2);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Akurasi passing', 'Passing jarak 15-20 meter', '75% akurasi (15 dari 20 umpan masuk target)', '%', 'Latihan dengan rekan, catat sendiri', 3);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Ikut kompetisi regional', 'Tampil di kompetisi resmi tingkat daerah', 'Minimal 1 kompetisi tingkat kabupaten/kota atau lebih tinggi', 'kompetisi', 'Nama turnamen + dokumentasi foto', 4);

-- ────────────────────────────────────────────────────────────────────────────
-- FASE 3: Elite Junior (Usia 15–17 tahun)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO dream_phases (
  dream_template_slug, phase_number, phase_name,
  age_min, age_max,
  big_win_title, big_win_description,
  industry_benchmark, over_achievement, behind_schedule_signal,
  sort_order
) VALUES (
  'football-player', 3, 'Elite Junior',
  15, 17,
  'Bergabung tim Elite Pro U-17/U-18 Liga 1 atau mewakili provinsi di tingkat nasional',
  'Masuk jenjang tertinggi akademi Indonesia dan bersaing di level nasional.',
  'Liga 1 Elite Pro Academy (EPA) adalah jenjang tertinggi akademi Indonesia. Garuda Select (program PSSI) rekrut usia 15-17.',
  'Dipanggil timnas U-16 atau U-17 PSSI; masuk skuad Garuda Select',
  'Di usia 17 belum pernah tampil di kompetisi antar klub resmi',
  3
)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'VO2 Max naik signifikan', 'Kapasitas aerobik level elite junior', '52–55 ml/kg/min', 'ml/kg/min', 'Beep Test level 10+ setara VO2Max 52', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Konsistensi performa', 'Jumlah pertandingan resmi dalam satu musim', 'Minimal 15 pertandingan resmi', 'pertandingan', 'Catat log pertandingan (lawan, menit bermain, gol/assist)', 2);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Satu keunggulan teknis terukur', 'Spesialisasi sesuai posisi', 'Kiper: clean sheet rate >40%; Striker: 1 gol per 3 pertandingan; Bek: aerial duel >60%', NULL, 'Statistik dari pertandingan resmi', 3);

-- ────────────────────────────────────────────────────────────────────────────
-- FASE 4: Kontrak Pro Pertama (Usia 18–21 tahun)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO dream_phases (
  dream_template_slug, phase_number, phase_name,
  age_min, age_max,
  big_win_title, big_win_description,
  industry_benchmark, over_achievement, behind_schedule_signal,
  sort_order
) VALUES (
  'football-player', 4, 'Kontrak Pro Pertama',
  18, 21,
  'Menandatangani kontrak profesional pertama dengan klub Liga 1, Liga 2, atau Liga 3',
  'Momen transisi dari pemain junior ke pemain profesional dengan kontrak resmi.',
  'Rata-rata pemain Indonesia dapat kontrak pro pertama usia 19-21. Eropa: rata-rata 18-19 tahun.',
  'Kontrak pro sebelum usia 18; langsung di Liga 1 tanpa Liga 3/2',
  'Di usia 22 belum pernah dapat tawaran kontrak',
  4
)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Debut di tim senior', 'Masuk skuad senior tim', 'Masuk skuad senior minimal 5 pertandingan resmi', 'pertandingan', 'Dokumentasi match sheet', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Fisik setara standar pro', 'Kondisi fisik level profesional', 'VO2Max >58 ml/kg/min; sprint 30m <4.5 detik', NULL, 'Tes fisik resmi klub atau mandiri', 2);

-- ────────────────────────────────────────────────────────────────────────────
-- FASE 5: Karier Profesional (Usia 21+)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO dream_phases (
  dream_template_slug, phase_number, phase_name,
  age_min, age_max,
  big_win_title, big_win_description,
  industry_benchmark, over_achievement, behind_schedule_signal,
  sort_order
) VALUES (
  'football-player', 5, 'Karier Profesional',
  21, 35,
  'Debut resmi di Liga 1 Indonesia / kontrak internasional',
  'Puncak karier — bermain di liga tertinggi Indonesia atau bahkan di luar negeri.',
  'Puncak karier pemain sepak bola profesional. Fase ini tidak dibatasi waktu.',
  'Dipanggil timnas senior sebelum usia 22; kontrak ke luar negeri (Malaysia Super League, liga Asia lain)',
  'Di usia 25 belum pernah masuk skuad Liga 1',
  5
)
RETURNING id INTO v_phase_id;

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Debut Liga 1', 'Penampilan pertama di kompetisi tertinggi', 'Debut resmi di Liga 1 Indonesia', NULL, 'Match sheet resmi Liga 1', 1);

INSERT INTO small_win_templates (phase_id, title, description, target_value, target_unit, how_to_measure, sort_order)
VALUES (v_phase_id, 'Menit bermain konsisten', 'Waktu bermain reguler', 'Akumulasi >500 menit bermain per musim', 'menit', 'Statistik resmi Liga 1', 2);

END $$;
