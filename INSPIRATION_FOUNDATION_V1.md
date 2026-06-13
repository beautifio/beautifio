# INSPIRATION FOUNDATION V1

## Definisi

Inspiration Foundation bukan media sosial dan bukan portal berita.

Ini adalah **perpustakaan konten** yang membantu pengguna bertumbuh menuju mimpinya.

**Analogi:**
- Journey = Apa yang harus saya lakukan?
- Inspiration = Apa yang bisa saya pelajari?

## Routes Added

| Route | Type | Description | Auth Required |
|-------|------|-------------|---------------|
| `/inspiration` | Static (SSG) | Inspiration hub with 3 tabs (Untukmu, Cerita, Artikel) | No |
| `/inspiration/[slug]` | Dynamic (SSR) | Inspiration detail page | No |

## Navigation

Bottom navigation bar updated — now 5 tabs:
1. 🏠 **Beranda** → `/home`
2. 🧭 **Journey** → `/journey`
3. 📖 **Inspirasi** → `/inspiration`
4. 👥 **Circle** → `/circle`
5. 👤 **Profil** → `/profil`

## Content Types (V1)

Only 2 types:

### 1. Story (Cerita) — 7 items
Pengalaman hidup, perjalanan seseorang, kegagalan dan keberhasilan.

| Title | Dream | 
|-------|-------|
| Dari Nol Sampai Pelanggan Pertama | Entrepreneur |
| Gagal Masuk FK Tiga Kali — Sekarang Aku Residen | Doctor |
| Dulu Aku Pemalu — Sekarang Ajarin Public Speaking | General |
| Aplikasi Pertamaku Gagal Total | Programmer |
| Dari Pemula Jadi Pelari Maraton | Runner, Athlete |
| Berkarya dari Kamar: Jadi Content Creator | Content Creator |
| Dari Main Bola di Lapangan Kecil Sampai Profesional | Football Player |

### 2. Article (Artikel) — 8 items
Pengetahuan praktis, skill, mindset, pembelajaran.

| Title | Dream |
|-------|-------|
| Cara Belajar Efektif | General |
| Cara Membangun Disiplin Tanpa Menyiksa Diri | General |
| Mengelola Waktu untuk Pelajar dan Mahasiswa | General |
| Cara Menjual Produk Pertamamu Tanpa Takut Ditolak | Entrepreneur |
| Tips Belajar Coding Otodidak untuk Pemula Absolut | Programmer |
| Cara Berbicara di Depan Umum untuk Pemula | General |
| Nutrisi Dasar untuk Atlet Muda | Athlete, Football Player, Runner |
| Cara Mulai Karir di Digital Marketing | Digital Marketer |

## Dream Relationships

Content can be:
- **General** — tidak terkait dream spesifik (tag: empty `[]`)
- **Dream-specific** — terkait 1+ dream (e.g., `dreamSlugs: ["doctor"]`)

Dream filter tersedia di tab "Untukmu" — user bisa filter berdasarkan dream.

## Features

### Tab "Untukmu"
- Menampilkan semua konten
- Filter berdasarkan dream (pilih emoji dream di atas)
- Search bar untuk mencari judul, tags, atau dream

### Tab "Cerita"
- Hanya menampilkan tipe Story
- Search bar

### Tab "Artikel"
- Hanya menampilkan tipe Article
- Search bar

### Search
- Mencocokkan: judul, tags, nama dream
- Bekerja di semua tab

### Detail Page (`/inspiration/[slug]`)
- Gradient header sesuai konten
- Badge tipe (Cerita/Artikel)
- Reading time
- Author + tanggal publikasi
- Tags
- Full content dengan rendering bold
- Related content (berdasarkan dream atau tag yang sama)

## What is NOT Built (V1)

- ❌ Video
- ❌ Podcast
- ❌ Webinar
- ❌ Course
- ❌ Marketplace
- ❌ Event
- ❌ News / Trending
- ❌ Reels / TikTok-style feed
- ❌ Likes
- ❌ Comments
- ❌ Followers
- ❌ Bookmarks
- ❌ Gamification
- ❌ Rankings

## Data Model

```typescript
interface InspirationItem {
  id: string;
  slug: string;
  type: "story" | "article";
  title: string;
  excerpt: string;
  content: string;
  author: string;
  coverGradient: string;
  readingTime: number;
  dreamSlugs: string[];    // empty = general
  dreamEmoji?: string;
  tags: string[];
  publishedAt: string;
}
```

## Future Expansion Opportunities

- Supabase backend for dynamic content management
- Admin UI for adding/editing content
- User-submitted stories with moderation
- Content series / collections
- Rich text content (tiptap, markdown)
- Read progress tracking
- "More from this author"
- Recommended reading based on journey progress
- Weekly inspiration digest (push notification)
- Multi-language content

## Files Created

| File | Purpose |
|------|---------|
| `lib/inspiration-data.ts` | Content data layer (15 items) + query functions |
| `app/(app)/inspiration/page.tsx` | Main inspiration page with 3 tabs + search + dream filter |
| `app/(app)/inspiration/[slug]/page.tsx` | Inspiration detail page |

## Files Modified

| File | Change |
|------|--------|
| `lib/navigation.ts` | Added "Inspirasi" tab with BookOpen icon |

## Manual Testing

1. Buka `/inspiration` → lihat 3 tab (Untukmu, Cerita, Artikel)
2. Tab Untukmu → lihat semua 15 konten
3. Pilih filter dream (e.g., 💼 Entrepreneur) → konten terfilter
4. Tab Cerita → hanya 7 story
5. Tab Artikel → hanya 8 article
6. Search "coding" → muncul artikel programming
7. Klik konten → detail page dengan header, konten, tags, related
8. Bottom nav → ada tab "Inspirasi" dengan icon BookOpen
