# KONSTITUSI V2 vs PRODUK LIVE

**Peringkat kejujuran:** 0% diplomatis. 100% apa adanya.

---

## RINGKASAN EKSEKUTIF

Produk live saat ini MELANGGAR Konstitusi V2 di **6 area berbeda secara bersamaan**.

Pelanggaran paling parah: **Familia jadi marketplace**, **Life Engine jadi game**, **Cerita/Inspirasi jadi social media**.

Yang sesuai konstitusi hanya **sistem Journey inti** (Dream → Big Win → Small Win → Daily Activity → Reflection) dan **Spiritual dimension**.

Sisanya: kode mati, fitur ngawur, atau janji Konstitusi yang tidak ditepati.

---

## 1. CORE JOURNEY SYSTEM — PERTAHANKAN

Ini satu-satunya yang benar.

| Fitur | Status | Catatan |
|-------|--------|---------|
| Dream Templates | ✅ Sesuai | Seed data dengan slug (entrepreneur, programmer, dll) |
| Dream Selection (`/journey`) | ✅ Sesuai | Satu dream aktif, bisa ganti |
| Big Win → Small Win → Daily Activity | ✅ Sesuai | Hierarki sesuai Konstitusi |
| 6 Daily Activities | ✅ Sesuai | Spiritual, Physical, Knowledge, Character, Social, Dream Skill — lengkap |
| Activity Completion | ✅ Sesuai | Centang selesai |
| Daily Reflection (3 questions) | ✅ Sesuai | learned, grateful, improve + mood |
| Journey Story / Timeline | ✅ Sesuai | Timeline entries |
| Failure Modal / Pivot | ✅ Sesuai | "What did you learn?" bukan "What went wrong?" |
| Alternative Futures | ✅ Sesuai | Transferable skills ke dream lain |
| Big Win Celebration | ✅ Sesuai | Momen selebrasi |
| Spiritual Dimension | ✅ Sesuai | Belief types (islam, kristen, hindu, buddha, agnostic, other), aktivitas spesifik berdasarkan keyakinan |

**Keputusan: PERTAHANKAN SEMUA. Jangan sentuh.**

---

## 2. FAMILIA — HAPUS TOTAL, BANGUN ULANG

**Ini pelanggaran Konstitusi paling parah di produk live.**

| Konstitusi bilang | Live melakukan |
|------------------|----------------|
| "Bukan marketplace" | Affiliate deals ke Tokopedia, Shopee, TikTok Shop |
| "No affiliate fees, no commissions" | `FAMILIA_AFFILIATE_DEALS` dengan `partner_url` |
| "No promoted listings" | `is_featured` flag di deals |
| "The metric is trust, not traffic" | "Featured Benefits", promo, kupon merchant |
| "Vetted resources: scholarships, internships, mentorship programs, workshops, mental health" | **Tidak ada satupun.** Yang ada: voucher makanan, deals merchant, kode diskon |
| "Free or lower-cost listed first" | Tidak ada hirarki biaya |

**Data konkret dari live code:**

| Tabel/Fitur | Isi | Masalah |
|------------|-----|---------|
| `FAMILIA_MERCHANTS` | Soto Pak Slamet, Kopi Nusantara, Bakso Boedjangan, Stationery Hub, Cafe Ruang Baca | Voucher merchant kecil — bukan "real resource" untuk dream |
| `FAMILIA_AFFILIATE_DEALS` | Tokopedia, Shopee, TikTok Shop affiliate links | **Affiliates = violation langsung** |
| `FAMILIA_ACHIEVEMENT_REWARDS` | Voucher/diskon sebagai reward pencapaian | **Commerce = violation langsung** |
| `FAMILIA_EVENT_BENEFITS` | Diskon untuk event/program berbayar | **Commerce = violation langsung** |
| UI | "Affiliate Deals", "Featured Benefits", promo | Bahasa marketplace |

**Keputusan: HAPUS TOTAL.** Tidak bisa diperbaiki incremental. Hapus semua tabel merchant, affiliate deals, achievement rewards, event benefits. Bangun ulang Familia dari nol sebagai direktori sumber daya nyata (beasiswa, magang, mentorship, workshop gratis/terjangkau, layanan kesehatan mental).

---

## 3. LIFE ENGINE / GAMIFICATION — HAPUS TOTAL

**Ini pelanggaran "Never a Game" paling terang-terangan.**

Konstitusi V2 Pasal "Never a Game":
> "No streaks, badges, leaderboards, points, levels, or any mechanic that exploits variable reward loops."

Live product punya **SEMUANYA**:

| Fitur | File | Pelanggaran |
|-------|------|-------------|
| **Life Levels** (seed → explorer → builder → achiever → leader → mentor → legacy) | `life-engine.ts` | **Levels** = violation langsung |
| **Life Capital** (6 capital numeric scores) | `life-engine.ts` | **Points/scoring** = violation langsung |
| **Depth Score** (streak + reflections + vault + lessons) | `growth-tracker.ts` | **Aggregate score** = violation langsung |
| **Resilience Score** | User profile types | **Score** = violation langsung |
| **Streak tracking** | JourneyProgress, GrowthTracker | **Streaks** = violation langsung |
| **Unlockable Features** (based on capital thresholds) | `life-engine.ts` | **Reward loops** = violation langsung |
| **Strongest/Weakest Capital** | `life-engine.ts` | **Labeling** = violation Observation Boundary |
| **Level Progress (%)** | `life-engine.ts` | **Progress bar ke next level** = violation langsung |

**Yang menyedihkan:** Semua kode ini **ORPHANED** — tidak ada UI yang mengkonsumsinya. Route `/life/start` adalah direktori kosong. Tapi kodenya masih ada di `packages/utils/src/life-engine.ts`, `GrowthTracker.tsx`, dan query-query terkait. Ini bom waktu — seseorang bisa mengaktifkannya kapan saja.

| Item | Status |
|------|--------|
| `packages/utils/src/life-engine.ts` (256+ baris) | Kode mati, HAPUS |
| `GrowthTracker.tsx` (komponen) | Kode mati, HAPUS |
| `getLifeLevelProgress()` query | Kode mati, HAPUS |
| `UserLifeProfile.resilienceScore` | Type definition, HAPUS |
| `CapitalSource.points` | Type definition, HAPUS |
| `UnlockableFeature` type | Type definition, HAPUS |
| `/life/start` route | Direktori kosong, HAPUS |

**Keputusan: HAPUS TOTAL.** Semua file life-engine, growth-tracker, capital scores, levels, streaks. Ini bukan "fitur yang bisa diperbaiki" — ini fondasi yang salah dari awal.

---

## 4. CERITA / INSPIRASI — HAPUS ELEMEN SOSIAL

Konstitusi V2:
> "No feeds, followers, likes, comments, DMs, public profiles"

Live product punya:

| Fitur | Route | Pelanggaran |
|-------|-------|-------------|
| `like_count` di Cerita | `/cerita` | **Likes** = social mechanic |
| `comment_count` di Cerita | `/cerita` | **Comments** = social mechanic |
| `save_count` di Cerita | `/cerita` | **Saves (public)** = social mechanic |
| Like button + count di Inspirasi | `/inspirasi` | **Likes** = social mechanic |
| Save button + count di Inspirasi | `/inspirasi` | **Saves** = social mechanic |
| Share button di Inspirasi | `/inspirasi` | **Share** = social mechanic |
| Report button di Inspirasi | `/inspirasi` | Reporting — fine, keep |
| Mentor rating (1-5 stars) | `/mentors` | **Rating** = judge mechanic |
| Mentor mentee/session counts | `/mentors/[slug]` | **Social proof** = violation |

**Masalah khusus Inspirasi:**
- Fitur "curhat anonim" sebenarnya bagus — ini bentuk Safe Space
- Tapi kenapa ada likes/shares/saves? Curhat anonim + like count = kontradiksi
- Fitur ini campur aduk antara Safe Space (support) dan Social Media (performative)

**Keputusan:**
- **HAPUS** like_count, comment_count, save_count dari Cerita dan Inspirasi
- **HAPUS** like/save/share button dari Inspirasi
- **HAPUS** mentor ratings, mentee counts
- **PERTAHANKAN** konten Cerita (edukasi, karir, bisnis — ini valid content)
- **PERTAHANKAN** Inspirasi sebagai Safe Space (tanpa elemen sosial)
- **GANTI** nama Inspirasi menjadi Safe Space atau integrasikan ke Safe Space page

---

## 5. REVIEW SYSTEM — TIDAK ADA, BANGUN

Konstitusi V2 mendefinisikan review cadence lengkap:

| Cadence | Live | Keputusan |
|---------|------|-----------|
| **Daily Reflection** | ✅ Ada (3 questions + mood) | PERTAHANKAN |
| **Weekly Review** | ❌ Tidak ada | BANGUN |
| **Monthly Review** | ❌ Tidak ada | BANGUN |
| **Annual Review** | ❌ Tidak ada | BANGUN — ini yang paling penting untuk North Star |
| **Decadal Review** | ❌ Tidak ada | BANGUN — ini North Star-nya Konstitusi |

**Ini bukan "nice to have."** Ini janji Konstitusi yang langsung dari North Star: "A 25-year-old opens Beautifio to see their 15-year-old self." Tanpa review system, janji itu kosong.

**Keputusan: BANGUN.**

---

## 6. OBSERVATION BOUNDARY — DILANGGAR

Konstitusi: "The app observes. The user evaluates."
Live: App memberi score, level, label.

| Violation | Di mana |
|-----------|---------|
| Progress % ke next Life Level | `getLifeLevelProgress()` |
| Depth Score | GrowthTracker |
| "Strongest Capital" / "Weakest Capital" | `life-engine.ts` — app **melabel** user |
| Resilience Score | Profile types |

**Keputusan: HAPUS** semua scoring dan labeling. Ganti dengan observasi murni: "Kamu menyelesaikan X aktivitas spiritual bulan ini" bukan "Kekuatanmu ada di spiritual."

---

## 7. CHARACTER OUTCOMES — TIDAK ADA

Konstitusi V2 mendefinisikan 6 character outcomes:
- Hope, Discipline, Resilience, Compassion, Purpose, Reverence

Live product: **Nol.** Tidak ada satupun yang direferensikan atau dikultivasi di fitur mana pun.

Satu-satunya yang mendekati adalah Resilience Score — tapi itu violation karena menskoring, bukan mengamati.

**Keputusan: BANGUN secara struktural.** Setiap fitur harus menumbuhkan minimal satu outcome. Kalau tidak bisa, fitur itu tidak punya alasan untuk ada.

---

## 8. SAFE SPACE — SETENGAH MATI

| Konstitusi minta | Live |
|-----------------|------|
| Dedicated page | ❌ Modal doang |
| Failure processing | ✅ Ada (FailureModal) |
| Transferable skills | ✅ Ada (Alternative Futures) |
| Free writing | ❌ Diarahkan ke Inspirasi (yang punya social mechanics) |
| Points to real-world help | ✅ Ada di SafeSpaceModal (emergency contacts) |
| Spiritual crisis | ❌ Tidak ada spesifik |

**Keputusan:**
- **ANGKAT** Safe Space dari modal jadi page dedicated
- **INTEGRASIKAN** Inspirasi (tanpa social mechanics) ke Safe Space
- **TAMBAHKAN** spiritual crisis support
- **PERTAHANKAN** FailureModal dan Alternative Futures

---

## 9. LEGACY CODE — HAPUS SEMUA

| Fitur | Status | Keputusan |
|-------|--------|-----------|
| Route `/roadmap` | Deprecation banner — "pindah ke Journey" | **HAPUS** — sudah deprecate, eksekusi |
| Route `/jurnal` | Deprecation banner — "pindah ke Journey" | **HAPUS** — sudah deprecate, eksekusi |
| Journal localStorage | Kode masih ada | **HAPUS** — ganti dengan Supabase reflection |
| Route `/life/start` | Direktori kosong | **HAPUS** |
| `life-engine.ts` | 256+ baris kode mati | **HAPUS** |
| `GrowthTracker.tsx` | Komponen mati | **HAPUS** |
| `features/coach/` | Direktori kosong | **HAPUS** |
| `FAMILIA_MERCHANTS` | Data merchant voucher | **HAPUS** (lihat bagian 2) |
| `FAMILIA_AFFILIATE_DEALS` | Data affiliate links | **HAPUS** (lihat bagian 2) |
| `FAMILIA_ACHIEVEMENT_REWARDS` | Data reward voucher | **HAPUS** (lihat bagian 2) |
| `FAMILIA_EVENT_BENEFITS` | Data benefit event | **HAPUS** (lihat bagian 2) |

---

## 10. APA YANG HARUS DIBANGUN (dari nol)

| Fitur | Prioritas | Alasan |
|-------|-----------|--------|
| **Safe Space page dedicated** | KRITIS | Saat ini cuma modal. Konstitusi minta page. |
| **Weekly Review** | KRITIS | Review cadence — ini pondasi Story pillar |
| **Monthly Review** | KRITIS | Review cadence |
| **Annual Review** | TINGGI | Untuk North Star |
| **Decadal Review** | TINGGI | Untuk North Star |
| **Familia (real — curated resources)** | TINGGI | Saat ini marketplace. Bangun ulang sebagai direktori. |
| **Character outcome cultivation** | TINGGI | 6 outcome di Konstitusi tidak diimplementasikan |
| **Inspiration (Dream Discovery)** | SEDANG | Yang sekarang ada di localStorage, perlu jadi page dedicated |

---

## 11. KEPUTUSAN PER ROUTE

| Route | Keputusan | Alasan |
|-------|-----------|--------|
| `/home` | PERTAHANKAN | Core daily practice |
| `/journey` | PERTAHANKAN | Core journey |
| `/journey/[id]` | PERTAHANKAN | Core journey detail |
| `/profil` | PERTAHANKAN | Utility — cleanup legacy references |
| `/discover` | PERTAHANKAN sementara | Ganti dengan Inspiration page |
| `/discover/result` | PERTAHANKAN sementara | Ganti dengan Inspiration page |
| `/auth/*` | PERTAHANKAN | Infrastructure |
| `/cerita` | PERTAHANKAN — HAPUS social metrics | Content valid |
| `/cerita/[slug]` | PERTAHANKAN — HAPUS social metrics | Content valid |
| `/inspirasi` | GANTI jadi Safe Space | HAPUS social mechanics |
| `/inspirasi/[slug]` | GANTI jadi Safe Space | HAPUS social mechanics |
| `/inspirasi/post` | GANTI jadi Safe Space post | HAPUS social mechanics |
| `/mentors` | HAPUS (mock data, rating violation) | Ganti dengan mentor di Familia nanti |
| `/mentors/[slug]` | HAPUS | Sama |
| `/opportunity` | HAPUS (mock data) | Ganti dengan opportunity di Familia nanti |
| `/opportunity/[slug]` | HAPUS | Sama |
| `/circle` | HAPUS (mock data, social mechanic) | Circles belum siap — Konstitusi bilang "premature" |
| `/circle/[id]` | HAPUS | Sama |
| `/familia/*` | HAPUS TOTAL | Marketplace — bangun ulang dari nol |
| `/roadmap` | HAPUS (sudah deprecate) | Eksekusi deprecation |
| `/roadmap/[slug]` | HAPUS | Sama |
| `/jurnal` | HAPUS (sudah deprecate) | Eksekusi deprecation |
| `/jurnal/[slug]` | HAPUS | Sama |
| `/jurnal/buat` | HAPUS | Sama |
| `/life/start` | HAPUS (empty) | Tidak ada isi |
| `/onboarding` | PERTAHANKAN | Infrastructure |
| `/welcome` | PERTAHANKAN | Infrastructure |
| `/admin` | PERTAHANKAN | Infrastructure |
| `/admin/familia` | HAPUS | Familia dihapus → admin familia ikut |

---

## SKOR KESESUAIAN KONSTITUSI

**Produk Live vs Konstitusi V2: 3/10**

| Area | Skor | Alasan |
|------|------|--------|
| Dream Pillar | 9/10 | Satu dream aktif, templates, discovery |
| Journey Pillar | 8/10 | Hierarki benar, big win/small win/activity |
| Story Pillar | 4/10 | Timeline ada, review system tidak ada |
| Safe Space Pillar | 3/10 | Modal doang, campur aduk dengan Inspirasi |
| Familia Pillar | 0/10 | Marketplace, bukan direktori |
| 6 Human Dimensions | 8/10 | Spiritual sudah ada, bisa ditingkatkan |
| 6 Character Outcomes | 0/10 | Tidak diimplementasikan |
| Commerce Boundary | 0/10 | Affiliates, merchant, vouchers — total violation |
| Observation Boundary | 2/10 | Scores, levels, labels — hampir semua violation |
| Never a Game | 1/10 | Levels, streaks, points, unlockable features |
| Never a Social Network | 3/10 | No DMs/followers, tapi likes/comments/shares ada |
| Never a Marketplace | 0/10 | Affiliates, vouchers, reward discounts |
| Review Cadence | 1/10 | Hanya daily reflection |
| Spiritual Faith-awareness | 6/10 | Belief types dan aktivitas spesifik sudah ada, tap UI mode selection belum visible |

---

## KESIMPULAN

**Produk live saat ini menderita skizofrenia produk:**

1. **Satu kaki di Konstitusi** — Journey inti (Dream → Big Win → Small Win → Daily Activity → Reflection) dan Spiritual dimension sudah sesuai. Ini yang benar.

2. **Satu kaki di marketplace** — Familia dengan affiliate deals, merchant vouchers, achievement rewards. Ini harus dihapus total.

3. **Satu kaki di game** — Life Engine (levels, capital, scores, streaks, unlockables). Semua orphaned — mujur tidak aktif. Tapi kodenya masih ada dan suatu hari bisa diaktifkan.

4. **Satu kaki di social media** — Cerita dan Inspirasi punya likes, comments, shares. Ratings di mentor. Ini melanggar Never a Social Network.

5. **Janji Konstitusi tidak ditepati** — Review system tidak ada. Character outcomes tidak ada. Safe Space cuma modal. North Star tidak bisa dicapai.

**Yang harus dilakukan sekarang:**
1. Hapus semua commerce di Familia
2. Hapus semua Life Engine gamification
3. Hapus social mechanics (likes, comments, shares)
4. Bangun review cadence (weekly → monthly → annual → decadal)
5. Bangun Safe Space jadi dedicated page
6. Eksekusi deprecation roadmap dan jurnal (hapus route)
7. Bangun ulang Familia sebagai direktori sumber daya nyata
