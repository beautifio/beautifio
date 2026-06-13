# Journey Feature — Language Audit Report

## 1. Journey Page (list/selection)

### `/journey/page.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 1.1 | `Perjalanan Mimpiku` (page heading) | Unclear scope — "Mimpiku" implies one dream, but user may have multiple journeys | **"Perjalanan Mimpi"** | More general; matches the concept of "dream journey" as a feature |
| 1.2 | `Lanjutkan perjalananmu` (subtitle) | Inconsistent with 1.1 — switches between "Perjalanan" and "perjalanan" capitalisation | **"Lanjutkan perjalanan"** | Consistent casing; direct imperative that matches the button below |
| 1.3 | `Perjalanan aktif` (badge under active journey card) | Vague — "aktif" could refer to "active" as in "not finished" or "currently selected" | **"Sedang berjalan"** | Clearer that the journey is in progress, not just "active" |
| 1.4 | `Kamu belum memulai perjalanan.` (empty state) | Correct but feels disconnected from the dream metaphor | **"Kamu belum memulai perjalanan mimpi."** | Reinforces "dream journey" concept |
| 1.5 | `Pilih mimpi yang paling menarik untukmu.` (empty state subtitle) | "menarik" is generic and weak | **"Pilih mimpi yang ingin kamu wujudkan."** | Stronger call-to-action, more aspirational |
| 1.6 | `Pilih Mimpi Ini` (button on template cards) | Inconsistent "Mimpi" capitalisation — in the template card, "mimpi" is lowercase in text but title-case in button | **"Mulai Mimpi Ini"** | More action-oriented, consistent capitalisation |
| 1.7 | `Mimpi Sebelumnya` (section header for past journeys) | Implies "previous dreams" but journeys can also be pivoted, not just completed | **"Perjalanan Sebelumnya"** | More accurate — "mimpi" is the template, "perjalanan" is the instance |
| 1.8 | `Selesai` / `Dialihkan` (status labels on previous journeys) | Mixed verb forms ("Selesai" is adjective, "Dialihkan" is passive verb) | **"Selesai"** / **"Dialihkan"** | Keep both but use consistent part-of-speech — these are fine as labels. **No change recommended.** |
| 1.9 | `Lihat Detail` (link text on active journey card) | Generic and doesn't convey next step | **"Buka Perjalanan"** | Clearer action for what happens when user taps |
| 1.10 | `Lanjutkan Perjalanan` (FAB button) | OK but FAB has insufficient whitespace — not a language problem. **No change recommended.** |
| 1.11 | `Gagal memuat data pengguna` (error state) | "Gagal memuat" is overly technical | **"Data pengguna gagal dimuat."** | More natural Indonesian word order |
| 1.12 | `Gagal membuat perjalanan. Coba lagi.` (error toast) | "perjalanan" is lowercase but heading uses "Perjalanan" | **"Gagal membuat Perjalanan. Coba lagi."** | Match title capitalisation |
| 1.13 | `loading={creating && selectedTemplate === t.slug}` | Not user-facing. **Skip.** |
| 1.14 | `Koneksi sedang bermasalah. Periksa internetmu, ya.` | Overly chatty with "ya" — tonal mismatch for error state | **"Koneksi terputus. Periksa koneksi internet."** | More neutral and professional; errors shouldn't be colloquial |

---

## 2. Journey Detail Page (slug)

### `/journey/[slug]/page.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 2.1 | `Perjalanan Mimpiku` (subtitle under dream emoji/title) | Same issue as 1.1 — "Mimpiku" is singular-possessive | **"Perjalanan Mimpi"** | Consistent with top-level page |
| 2.2 | `Mengapa Mimpi Ini?` (label in dream context card) | Question form is inconsistent — other labels in the same card are statements | **"Tentang Mimpi Ini"** | More informative, matching the style of surrounding text |
| 2.3 | `Makna Mimpi Ini` (label in dream context card) | Good. **No change.** | | |
| 2.4 | `Big Win Saat Ini` (current focus card label) | English "Big Win" mixed with Indonesian — inconsistent with rest of UI where it's also "Big Win" but this is a product decision | **"Target Utama Saat Ini"** or keep as-is. **No change recommended.** | Product term, fine to keep |
| 2.5 | `💡 Kenapa ini penting?` (inside current focus card) | Informally phrased for a UI label | **"💡 Alasan Pentingnya"** | More formal/polished label tone |
| 2.6 | `🎯 Fokus:` (prefix for current small win) | Mixed with emoji — inconsistent; other labels in same card use plain text | **"Fokus saat ini:"** | Cleaner without redundant emoji in a label adjacent to other plain-text labels |
| 2.7 | Tab labels: `Hari Ini`, `Pencapaian`, `Cerita`, `Riwayat` | "Pencapaian" is 4 syllables — longest tab. "Riwayat" is formal/archival. Tonal inconsistency across tabs. | **"Hari Ini"**, **"Pencapaian"**, **"Cerita"**, **"Riwayat"** — consider **"Aktivitas"** instead of "Hari Ini" (more descriptive) | "Hari Ini" is time-bound; if user opens the page tomorrow, past activities look wrong under that label. **Suggested:** rename tab to `"Aktivitas"` |
| 2.8 | `Aktivitas Hari Ini` (section heading inside "Today" tab) | Redundant if tab is already "Hari Ini" | **"Aktivitas"** | Avoid repetition between tab and heading |
| 2.9 | `Refleksi Hari Ini` (section heading when reflection exists) | Same redundancy | **"Refleksi"** | Same fix as above |
| 2.10 | `Dipetik:` (label prefix in reflection display) | Archaic/poetic — "dipetik" literally means "plucked" (as in a fruit). Used to mean "what I learned" but feels out of place | **"Pelajaran:"** | Clearer and more natural |
| 2.11 | `Disyukuri:` (label prefix) | Ambiguous — could be read as "what is being appreciated" vs "what I appreciate" | **"Syukur:"** | Cleaner, natural |
| 2.12 | `Tulis Refleksi Hari Ini` (button to open reflection modal) | "Refleksi" is Dutch-derived (reflectie); "Hari Ini" redundant if it's always about today | **"Tulis Catatan Harian"** | More natural Indonesian ("Catatan Harian" instead of "Refleksi") |
| 2.13 | `{progress?.completed_activities_today || 0} dari {progress?.total_activities_today || 6} aktivitas selesai` | "dari" here reads as "out of" in English. Acceptable but could be clearer | **`{count} dari {total} aktivitas terselesaikan`** | Slightly more natural | |
| 2.14 | `Big Wins` (wins tab section header) | English term; other headers use Indonesian | **"Pencapaian Utama"** | Consistency — tab is "Pencapaian" but section is "Big Wins" |
| 2.15 | `{big_wins_completed}/{big_wins_total} selesai` (wins tab subtitle) | "selesai" doesn't inflect for quantity | **`{X} dari {Y} tercapai`** | More precise than "selesai" (done) |
| 2.16 | `Lihat Semua Langkah ({bigWins.length} langkah)` | Uses "langkah" (steps) to mean "big wins" — introduced inconsistency | **"Lihat Semua Pencapaian ({bigWins.length})"** | Consistent with "Pencapaian" tab name |
| 2.17 | `Lihat Lebih Sedikit` | Conversational but tonally mismatched with other action text | **"Tampilkan Lebih Sedikit"** | More consistent with "Lihat Semua" using "Tampilkan" |
| 2.18 | `Cerita Perjalananku` (story tab heading) | Possessive "ku" is informal; other headings use neutral forms | **"Cerita Perjalanan"** | Consistency — remove first-person possessive |
| 2.19 | `Riwayat Perjalanan` (timeline tab heading) | Formal ("Riwayat" = records/history). Tonal mismatch with more casual "Cerita" tab | **"Linimasa"** | Shorter, more modern, matches "Timeline" concept precisely |
| 2.20 | `Coba Lagi` (retry button on error) | Good. **No change.** | | |
| 2.21 | `Masih bermasalah? Coba tutup dan buka kembali aplikasi.` (error suggestion) | "buka kembali" is redundant — "tutup dan buka kembali" is 7 words for "restart" | **"Coba tutup lalu buka ulang aplikasi."** | Tighter wording |

---

## 3. Daily Activity Card

### `daily-activity-card.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 3.1 | `Tulis catatan...` (placeholder for note input) | Correct but unhelpful — too vague | **"Catat pengalamanmu..."** | More engaging and specific to the context |
| 3.2 | `Simpan` (button for note) | Good. **No change.** | | |
| 3.3 | `Tulis catatan...` (link text before clicking) | Same vagueness as 3.1 | **"Tambahkan catatan..."** | Less imperative, more inviting |
| 3.4 | `Tulis catatan singkat...` (placeholder, appears in one variant) | Slightly different from 3.1 — inconsistency between variants | Use one consistent placeholder | Pick one and apply everywhere |

---

## 4. Big Win Card

### `big-win-card.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 4.1 | `💡 Kenapa langkah ini penting?` (label for why_it_matters section) | "langkah ini" assumes a step — but some big wins are entire milestones | **"💡 Kenapa ini penting?"** | More general (same as used in celebration modal) |
| 4.2 | `Catatan refleksi (opsional) — apa yang kamu pelajari?` (placeholder) | "Refleksi" is Dutch; "—" em dash is unusual in Indonesian mobile UIs | **"Catatan pribadi: apa yang kamu pelajari?"** | More natural wording |
| 4.3 | `Tidak tercapai?` (link to mark as failed) | Ambiguous — "belum tercapai" would imply "not yet achieved" vs "give up" | **"Menyerah?"** or **"Lewati?"** | Clearer intent — this triggers the failure flow |
| 4.4 | `{completedCount}/{smallWins.length}` counter | No label — just numbers. Unclear what it represents | Show label or use progress bar | Accessibility / clarity improvement, not strictly language |
| 4.5 | `✅` / `❌` / `⏳` as status icons (line 21-25) | Status icon approach is clear. **No change.** | | |

---

## 5. Big Win Celebration Modal

### `big-win-celebration.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 5.1 | `Selamat! 🎉` | "Selamat" is incomplete Indonesian — should be "Selamat!" with exclamation. It technically is fine, but "Selamat" alone reads oddly | **"Selamat! 🎉"** (already correct) | **No change** — already correct |
| 5.2 | `Kamu berhasil menyelesaikan Big Win!` | Mixed English/Indonesian; "Big Win" not translated | **"Kamu berhasil menyelesaikan pencapaian utama!"** | Consistency — use Indonesian term |
| 5.3 | `Kenapa ini penting` (section label) | Missing question mark vs other labels that have them | **"Kenapa ini penting?"** | Consistent punctuation |
| 5.4 | `Momen paling berkesan ✨` (label) | Emoji at end — other labels put emoji at start | **"✨ Momen paling berkesan"** | Consistency — all form labels start with emoji |
| 5.5 | `Siapa yang membantu? 🤝` (label) | Same emoji-position inconsistency | **"🤝 Siapa yang membantu?"** | Consistency |
| 5.6 | `Pelajaran terbesar 📖` | Same issue | **"📖 Pelajaran terbesar"** | Consistency |
| 5.7 | `Langkah selanjutnya 🚀` | Same issue + "selanjutnya" should be "selanjutnya" | **"🚀 Langkah selanjutnya"** | Consistency |
| 5.8 | `Apa momen paling berkesan selama mengejar Big Win ini?` (placeholder) | English "Big Win" again | **"Apa momen paling berkesan selama mengejar pencapaian ini?"** | Consistency |
| 5.9 | `Siapa saja yang mendukung perjalananmu?` (placeholder) | Good. **No change.** | | |
| 5.10 | `Apa pelajaran terbesar yang kamu dapat?` (placeholder) | "dapat" is formal/standard; "dapet" is colloquial. It's fine in written form. **No change.** | | |
| 5.11 | `Apa yang ingin kamu lakukan selanjutnya?` (placeholder) | Good. **No change.** | | |
| 5.12 | `Nanti Saja` (dismiss button) | Casual — fine for a dismissive action | **"Nanti"** | Shorter, consistent with industry convention |
| 5.13 | `Simpan` (save button) | OK but note it has `ArrowRight` icon suggesting navigation after save | **"Simpan & Tutup"** | Clearer that this saves and closes the modal |

---

## 6. Failure Modal

### `failure-modal.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 6.1 | `Tidak apa-apa.` (heading) | Repeated in line 10 encouragements array — redundancy between heading and first encouragement | **"Tidak masalah."** | Different from encouragement list, so both feel fresh |
| 6.2 | `Tidak apa-apa. Yang penting kamu sudah berusaha.` (encouragement #1) | "Tidak apa-apa" repeats the heading. If heading changes, this is fine. **No change.** | | |
| 6.3 | `Kegagalan bukan akhir. Ini hanyalah tikungan.` (encouragement #2) | "tikungan" = "a bend in the road" — poetic but may confuse younger users | **"Kegagalan bukan akhir. Ini hanya tikungan di jalan."** | Slightly more complete metaphor |
| 6.4 | `Setiap orang hebat pernah gagal. Yang membedakan adalah mereka bangkit lagi.` (encouragement #3) | Good. **No change.** | | |
| 6.5 | `Kamu berani mencoba — itu sudah lebih berani dari mereka yang diam.` (encouragement #4) | Unclear referent of "diam" — silent? still? not trying? | **"Kamu sudah berani mencoba. Itu lebih berani dari yang hanya diam."** | Clearer meaning |
| 6.6 | `✨ Skills yang sudah kamu dapat:` (section label) | "dapat" vs "dapet" inconsistency; mixed English "Skills" | **"✨ Kemampuan yang sudah kamu pelajari:"** | Indonesian term, more precise |
| 6.7 | `Disiplin`, `Ketekunan`, `Kemampuan belajar`, `Manajemen waktu` (hardcoded transferable skills) | Good. **No change.** | | |
| 6.8 | `✅ {skill}` (skill tag prefix) | Checkmark is good. **No change.** | | |
| 6.9 | `Alternatif masa depan:` (section label) | Good. **No change.** | | |
| 6.10 | `Skills yang kamu pelajari berguna untuk banyak hal.` (alternative futures description) | Mixed English "Skills" | **"Kemampuan yang kamu pelajari berguna untuk banyak hal."** | Consistency |
| 6.11 | `Kamu bisa menjelajahi jalur lain yang tetap terhubung dengan mimpimu.` | Good. **No change.** | | |
| 6.12 | `Masih Lanjut` (button to dismiss) | "Lanjut" is ambiguous — continue what? Continue the journey? Continue trying? | **"Coba Lagi"** or **"Jangan Menyerah"** | Clearer intent — user hasn't given up yet |
| 6.13 | `Tandai Gagal` (confirm button) | "Gagal" is direct; "Tandai" = "mark as". This is fine. **No change.** | | |

---

## 7. Reflection Modal

### `reflection-modal.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 7.1 | `Refleksi Harian` (modal title) | Dutch-derived "Refleksi" | **"Catatan Harian"** | More natural Indonesian |
| 7.2 | `🌱 Apa yang saya pelajari hari ini?` (label) | Uses "saya" (formal) but journey page uses "kamu" (casual) everywhere else — tonal inconsistency | **"🌱 Apa yang kamu pelajari hari ini?"** | Match the rest of the app's tone |
| 7.3 | `Contoh: Belajar passing baru...` (placeholder) | Uses "..." (three dots) inconsistently — other placeholders use "..." | Consistent ellipsis style | Pick one convention |
| 7.4 | `🙏 Apa yang saya syukuri hari ini?` (label) | Same "saya" vs "kamu" issue | **"🙏 Apa yang kamu syukuri hari ini?"** | Consistency |
| 7.5 | `Contoh: Bersyukur bisa latihan hari ini...` (placeholder) | Good. **No change.** | | |
| 7.6 | `🔧 Apa yang akan saya perbaiki besok?` (label) | Same "saya" issue | **"🔧 Apa yang akan kamu perbaiki besok?"** | Consistency |
| 7.7 | `Contoh: Fokus sama teknik dribbling...` (placeholder) | "sama" is colloquial (Betawi) — means "on" as in "focus on technique". Inconsistent register (colloquial vs formal "saya" in labels) | **"Contoh: Fokus pada teknik dribbling..."** | Consistent register — either all formal or all casual |
| 7.8 | `😊 Bagaimana perasaanmu hari ini?` (mood label) | Uses "mu" suffix — colloquial. Conflicting with "saya" in other labels | **Use "kamu" throughout or "Anda" throughout** | Consistent pronoun register |
| 7.9 | Mood labels: `Sangat Bahagia`, `Bahagia`, `Biasa`, `Sedih`, `Sangat Sedih` | Good. **No change.** | | |
| 7.10 | `Simpan Refleksi` (save button) | "Refleksi" vs the app's preferred term | **"Simpan Catatan"** | Consistency if title changes |

---

## 8. Journey Story

### `journey-story.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 8.1 | `Bersyukur: {r.grateful}` (prefix when displaying grateful text) | "Bersyukur" as a label prefix is awkward — reads as "Grateful: {text}" | **"Syukur: {r.grateful}"** | Cleaner label format |
| 8.2 | `Perlu diperbaiki: {r.improve}` (prefix for improve text) | "Perlu diperbaiki" = "needs to be fixed" — negative framing | **"Untuk besok: {r.improve}"** | Positive, forward-looking framing |
| 8.3 | `Belum ada cerita` (empty state) | Good, matches "Cerita" tab. **No change.** | | |
| 8.4 | `Setiap kali kamu merefleksikan hari, ceritamu akan tersimpan di sini.` (empty state subtitle) | "merefleksikan" is Dutch-derived | **"Setiap kali kamu menulis catatan harian, ceritamu akan tersimpan di sini."** | Consistency with preferred terminology |
| 8.5 | `Suasana hati: {entry.mood}` (footer display) | Good. **No change.** | | |

---

## 9. Journey Timeline

### `journey-timeline.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 9.1 | `Belum ada aktivitas` (empty state) | Good. **No change.** | | |
| 9.2 | `Selesaikan aktivitas harianmu untuk memulai` (empty state subtitle) | "harianmu" is colloquial — rest of UI uses "kamu" not "-mu" suffix | **"Selesaikan aktivitas harian untuk memulai"** | Consistent pronoun usage — remove possessive suffix |
| 9.3 | `Hari ini` / `Kemarin` (date formatting) | Good. **No change.** | | |

---

## 10. Story Timeline (Profile page)

### `story-timeline.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 10.1 | `Refleksi` (label prefix for reflection entries) | Same "Refleksi" issue | **"Catatan"** | Consistency |
| 10.2 | `Aku bersyukur {entry.grateful.toLowerCase()}.` (wrapping grateful text) | "Aku" is casual — journey page uses "kamu" for user, but here uses first-person "Aku". Inconsistency. | **"Aku bersyukur {entry.grateful.toLowerCase()}."** — keep "Aku" since this is in first-person narrative voice | This is in first-person narrative, so "Aku" is appropriate. **No change.** |
| 10.3 | `Besok aku ingin {entry.improve.toLowerCase()}.` | Same — first-person narrative. Fine. | **No change.** | |
| 10.4 | `Suasana hati:` (footer) | Same as 8.5. Good. **No change.** | | |
| 10.5 | `Belum ada cerita` (empty state) | Same as 8.3. **No change.** | | |
| 10.6 | `Setiap mimpi yang kamu pilih, pencapaian, dan refleksi akan muncul di sini.` | "refleksi" again | **"Setiap mimpi yang kamu pilih, pencapaian, dan catatan akan muncul di sini."** | Consistency |

---

## 11. Weekly Review

### `weekly-review.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 11.1 | `Memuat...` (loading state) | Good. **No change.** | | |
| 11.2 | `Minggu ini` (review header subtitle) | Good. **No change.** | | |
| 11.3 | `Apa yang membuatku bangga?` (reviewed entry label, present tense) | Uses "ku" suffix — not consistent with rest of app | **"Apa yang membuatmu bangga?"** | Match "kamu" / "mu" suffix consistently |
| 11.4 | `Apa yang sulit?` (reviewed entry label) | OK but doesn't match 11.3 structure | **"Apa yang terasa sulit?"** | Parallel structure with 11.3 |
| 11.5 | `Apa yang ingin kuperbaiki?` (reviewed label) | "kuperbaiki" is first-person; journey uses "kamu" | **"Apa yang ingin kamu perbaiki?"** | Match pronoun register |
| 11.6 | `Review Minggu Ini` (form heading) | English "Review" | **"Catatan Minggu Ini"** | Consistency |
| 11.7 | `Apa yang membuatmu bangga minggu ini?` (form label) | Good. **No change.** | | |
| 11.8 | `Contoh: Berhasil menyelesaikan 3 small win...` (placeholder) | English "small win" | **"Contoh: Menyelesaikan 3 pencapaian kecil..."** | Consistency |
| 11.9 | `Apa yang sulit?` (form label) | Good. **No change.** | | |
| 11.10 | `Contoh: Sulit konsisten belajar setiap hari...` (placeholder) | Good. **No change.** | | |
| 11.11 | `Apa yang ingin kuperbaiki?` (form label) | "kuperbaiki" first-person | **"Apa yang ingin kamu perbaiki?"** | Consistency |
| 11.12 | `Contoh: Bangun lebih pagi biar bisa baca sebelum kuliah...` (placeholder) | "biar" is very colloquial (Betawi/teen slang) — tonal mismatch | **"Contoh: Bangun lebih pagi agar bisa membaca sebelum kuliah..."** | Consistent register |
| 11.13 | `Batal` (cancel button) | Good. **No change.** | | |
| 11.14 | `Simpan Review` (save button) | English "Review" | **"Simpan Catatan"** | Consistency |
| 11.15 | `Menyimpan...` (saving state) | Good. **No change.** | | |
| 11.16 | `Edit` (link to edit existing review) | English "Edit" | **"Ubah"** | Consistency |

---

## 12. Monthly Review

### `monthly-review.tsx`

| # | Current Text | Problem | Suggested Rewrite | Reason |
|---|---|---|---|---|
| 12.1 | `Bulan ini` (review header subtitle) | Good. **No change.** | | |
| 12.2 | `Apa yang berubah?` (reviewed label) | Good. **No change.** | | |
| 12.3 | `Apa yang kupelajari?` (reviewed label) | "kupelajari" first-person | **"Apa yang kamu pelajari?"** | Consistency |
| 12.4 | `Apa yang kusyukuri?` (reviewed label) | "kusyukuri" first-person | **"Apa yang kamu syukuri?"** | Consistency |
| 12.5 | `Fokus bulan depan?` (reviewed label) | Question is missing word: "Fokus untuk bulan depan?" | **"Fokus untuk bulan depan?"** | Complete sentence |
| 12.6 | `Review Bulan Ini` (form heading) | English "Review" | **"Catatan Bulan Ini"** | Consistency |
| 12.7 | `Apa yang berubah bulan ini?` (form label) | Good. **No change.** | | |
| 12.8 | `Contoh: Mulai konsisten belajar setiap hari...` (placeholder) | Good. **No change.** | | |
| 12.9 | `Apa yang kupelajari?` (form label) | "kupelajari" first-person | **"Apa yang kamu pelajari?"** | Consistency |
| 12.10 | `Contoh: Disiplin itu bukan soal motivasi, tapi kebiasaan...` (placeholder) | Good. **No change.** | | |
| 12.11 | `Apa yang kusyukuri?` (form label) | "kusyukuri" first-person | **"Apa yang kamu syukuri?"** | Consistency |
| 12.12 | `Contoh: Keluarga yang selalu mendukung...` (placeholder) | Good. **No change.** | | |
| 12.13 | `Fokus bulan depan?` (form label) | Same as 12.5 | **"Fokus untuk bulan depan?"** | Complete sentence |
| 12.14 | `Contoh: Menyelesaikan small win pertama...` (placeholder) | English "small win" | **"Contoh: Menyelesaikan pencapaian kecil pertama..."** | Consistency |
| 12.15 | `Batal` / `Simpan Review` / `Menyimpan...` / `Edit` | Same issues as weekly review (11.13-11.16) | Apply same fixes | |

---

## Summary of Recurring Issues

### A. Pronoun Register Inconsistency
The app mixes three pronoun registers throughout:
- **Formal:** `saya` (used in reflection modal)
- **Casual:** `kamu` (used most of the journey page)
- **Colloquial:** `-mu` suffix (e.g., "harianmu", "perjalananmu", "mimpimu") and `aku`/`ku-` prefix (used in weekly/monthly reviews, story timeline)

**Fix:** Pick ONE register and apply everywhere.

| Option | Register | Example |
|---|---|---|
| **`kamu` / `-mu`** | Neutral casual | `kamu`, `perjalananmu`, `mimpimu` |
| **`Anda`** | Formal | `Anda`, `perjalanan Anda` |
| **`kamu` + full words** | Casual without suffix | `perjalanan kamu`, `mimpi kamu` |

**Recommended:** Standardise on `kamu` with `-mu` suffix for possessives, and use `kamu` (not `saya`/`aku`/`ku-`) for all second-person address.

### B. English Loanwords (Dutch vs English)
- `Refleksi` (Dutch) — used in title, modal, labels → replace with `Catatan` / `Catatan Harian`
- `Review` (English) — used in weekly/monthly review → replace with `Catatan` / `Tinjauan`
- `Edit` (English) → replace with `Ubah`
- `Skills` (English) → replace with `Kemampuan`
- `Big Win` (English, product term) → either translate to `Pencapaian Utama` or keep as product term. Inconsistent usage.
- `Small Win` (English) → translate to `Pencapaian Kecil`

### C. Redundant Tab + Section Headings
In the journey detail page, the "Today" tab shows `Aktivitas Hari Ini` and `Refleksi Hari Ini` as section headings, but the tab is already labelled `Hari Ini`. Remove redundancy.

### D. Ellipsis Style Inconsistency
Some placeholders use `...` (three dots), some use `...` (same visually but varying Unicode). Some use `---` (em dash). Standardise to `...` for placeholders and `—` (em dash) for narrative breaks.

### E. Emoji Position Inconsistency
In `big-win-celebration.tsx`, form labels put emoji at the END (`Momen paling berkesan ✨`) but other components put emoji at the START (`🌱 Apa yang saya pelajari`). Standardise to emoji-first for form labels.

### F. Hardcoded Strings vs Dynamic Content
- `failure-modal.tsx` hardcodes 4 transferable skills (`Disiplin`, `Ketekunan`, `Kemampuan belajar`, `Manajemen waktu`) that never change per dream template — they should ideally come from the dream template data.
- `ENCOURAGEMENTS` array in `failure-modal.tsx` is also hardcoded — could be per-template or per-stage.

---

## Priority Items for Immediate Fix

| Priority | Item | File(s) | Effort |
|---|---|---|---|
| **P1** | Standardise pronoun register (pick `kamu` throughout) | reflection-modal, weekly-review, monthly-review, story-timeline, journey-story | Small |
| **P1** | Replace Dutch `Refleksi` with `Catatan Harian` | reflection-modal, journey-story, story-timeline, journey-detail | Small |
| **P2** | Replace English `Review` / `Edit` / `Skills` in weekly/monthly reviews | weekly-review, monthly-review, failure-modal | Small |
| **P2** | Standardise emoji position in form labels | big-win-celebration | Small |
| **P2** | Fix tab/section heading redundancy | journey/[slug]/page.tsx | Small |
| **P3** | Unify `Big Win` / `Small Win` term usage | All journey files | Medium (product decision) |
| **P3** | Dynamic transferable skills from template data | failure-modal | Medium |
