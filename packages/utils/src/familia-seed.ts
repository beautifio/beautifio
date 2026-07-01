import type { VoucherType } from "@beautifio/types";

// Legacy seed data — used by admin panel until Fase 5 migration.
// Frontend pages now fetch from API. Do NOT import these in new code.
export const FAMILIA_MERCHANTS = [
  { id: "fm1", name: "Soto Pak Slamet", slug: "soto-pak-slamet", category: "makanan", description: "Soto ayam khas Lamongan dengan bumbu rahasia turun-temurun", merchant_code: "SOTO01", daily_pin: "3817", monthly_quota: 30, voucher_types: ["free_drink", "bogof", "discount", "free_addon"], is_active: true, total_vouchers: 30, total_redeemed: 5, total_expired: 3, created_at: "2026-06-01T00:00:00Z" },
  { id: "fm2", name: "Kopi Nusantara", slug: "kopi-nusantara", category: "minuman", description: "Kopi specialty dari berbagai daerah di Indonesia", merchant_code: "KOPI01", daily_pin: "2745", monthly_quota: 50, voucher_types: ["free_drink", "discount"], is_active: true, total_vouchers: 50, total_redeemed: 12, total_expired: 2, created_at: "2026-06-01T00:00:00Z" },
  { id: "fm3", name: "Bakso Boedjangan", slug: "bakso-boedjangan", category: "makanan", description: "Bakso sapi ukuran jumbo dengan kuah kaldu sapi asli", merchant_code: "BAKS01", daily_pin: "5923", monthly_quota: 40, voucher_types: ["buy1get1", "free_addon", "discount"], is_active: true, total_vouchers: 40, total_redeemed: 8, total_expired: 4, created_at: "2026-06-01T00:00:00Z" },
  { id: "fm4", name: "Stationery Hub", slug: "stationery-hub", category: "belanja", description: "Toko alat tulis dan perlengkapan kreatif", merchant_code: "STAH01", daily_pin: "4361", monthly_quota: 25, voucher_types: ["discount", "free_addon"], is_active: true, total_vouchers: 25, total_redeemed: 3, total_expired: 1, created_at: "2026-06-01T00:00:00Z" },
  { id: "fm5", name: "Cafe Ruang Baca", slug: "cafe-ruang-baca", category: "minuman", description: "Cafe cozy dengan koleksi buku untuk dibaca", merchant_code: "CAFE01", daily_pin: "8152", monthly_quota: 35, voucher_types: ["free_drink", "discount"], is_active: true, total_vouchers: 35, total_redeemed: 6, total_expired: 2, created_at: "2026-06-01T00:00:00Z" },
];

export const FAMILIA_AFFILIATE_DEALS = [
  { id: "fd1", title: "Sepatu Lari Terbaik 2026", slug: "sepatu-lari", description: "Dapatkan diskon eksklusif sepatu lari dari brand ternama.", image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", category: "olahraga", partner_name: "SportsDirect", partner_url: "https://www.tokopedia.com", platform: "tokopedia", goal_category: "kesehatan", is_featured: true, click_count: 234, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd2", title: "Buku Panduan Masuk Fakultas Kedokteran", slug: "buku-kedokteran", description: "Buku persiapan masuk FK dengan tips dari dokter senior.", image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", category: "pendidikan", partner_name: "Gramedia", partner_url: "https://www.tokopedia.com", platform: "tokopedia", goal_category: "pendidikan", is_featured: true, click_count: 189, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd3", title: "Paket Canva Pro 6 Bulan", slug: "canva-pro", description: "Canva Pro untuk konten kreator dengan harga spesial.", image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80", category: "kreator", partner_name: "Canva", partner_url: "https://www.tokopedia.com", platform: "tokopedia", goal_category: "skill", is_featured: true, click_count: 456, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd4", title: "Mikrofon USB Profesional", slug: "mikrofon-usb", description: "Mikrofon berkualitas untuk content creator pemula.", image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80", category: "kreator", partner_name: "Shopee", partner_url: "https://shopee.co.id", platform: "shopee", goal_category: "skill", is_featured: true, click_count: 312, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd5", title: "Perlengkapan Futsal", slug: "perlengkapan-futsal", description: "Sepatu, jersey, dan bola futsal dengan harga afiliasi.", image_url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&q=80", category: "olahraga", partner_name: "SportsStation", partner_url: "https://www.tokopedia.com", platform: "tokopedia", goal_category: "kesehatan", is_featured: false, click_count: 87, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd6", title: "Set Peralatan Golf Pemula", slug: "peralatan-golf", description: "Set stick golf dan aksesoris untuk pegolf pemula.", image_url: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80", category: "olahraga", partner_name: "Shopee", partner_url: "https://shopee.co.id", platform: "shopee", goal_category: "kesehatan", is_featured: false, click_count: 45, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd7", title: "Skincare Routine Set", slug: "skincare-set", description: "Paket skincare lengkap untuk kulit sehat bercahaya.", image_url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", category: "kecantikan", partner_name: "Tokopedia", partner_url: "https://www.tokopedia.com", platform: "tokopedia", goal_category: "bisnis", is_featured: true, click_count: 523, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd8", title: "Keyboard Mechanical untuk Coding", slug: "keyboard-mekanikal", description: "Keyboard nyaman untuk programmer dan produktivitas.", image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80", category: "teknologi", partner_name: "Tokopedia", partner_url: "https://www.tokopedia.com", platform: "tokopedia", goal_category: "skill", is_featured: true, click_count: 278, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd9", title: "Laptop Ringan untuk Mahasiswa", slug: "laptop-mahasiswa", description: "Laptop ringan dan bertenaga untuk kebutuhan belajar.", image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80", category: "teknologi", partner_name: "Shopee", partner_url: "https://shopee.co.id", platform: "shopee", goal_category: "pendidikan", is_featured: false, click_count: 156, is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "fd10", title: "Kursus Public Speaking Online", slug: "public-speaking", description: "Belajar public speaking dari mentor berpengalaman.", image_url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80", category: "pendidikan", partner_name: "TikTok Shop", partner_url: "https://www.tiktok.com", platform: "tiktok", goal_category: "pendidikan", is_featured: false, click_count: 134, is_active: true, created_at: "2026-06-01T00:00:00Z" },
];

export const FAMILIA_ACHIEVEMENT_REWARDS = [
  { id: "ar1", title: "New Member", description: "Selesaikan Discovery untuk mendapatkan voucher perdana", trigger_type: "discovery_complete", trigger_value: 1, reward_type: "voucher", reward_description: "Voucher minuman gratis di Kopi Nusantara", icon: "Sparkles", color: "from-yellow-500 to-orange-500", is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "ar2", title: "Pebelajar Sejati", description: "Selesaikan 10 milestone di roadmap untuk voucher makan siang", trigger_type: "roadmap_milestones", trigger_value: 10, reward_type: "voucher", reward_description: "Voucher diskon di Bakso Boedjangan", icon: "Trophy", color: "from-blue-500 to-purple-500", is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "ar3", title: "Anggota Setia", description: "Bergabung dengan Circle selama 30 hari untuk diskon event", trigger_type: "circle_days", trigger_value: 30, reward_type: "discount", reward_description: "Diskon 20% tiket event Beautifio", icon: "Users", color: "from-green-500 to-teal-500", is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "ar4", title: "Mentee Aktif", description: "Ikuti program mentor untuk mendapatkan benefit spesial", trigger_type: "mentor_program", trigger_value: 1, reward_type: "special_benefit", reward_description: "Akses eksklusif webinar mentor tamu", icon: "Heart", color: "from-pink-500 to-rose-500", is_active: true, created_at: "2026-06-01T00:00:00Z" },
  { id: "ar5", title: "Rajin Menulis", description: "Tulis 20 entri jurnal untuk reward spesial", trigger_type: "journal_entries", trigger_value: 20, reward_type: "voucher", reward_description: "Free drink di Cafe Ruang Baca", icon: "BookOpen", color: "from-indigo-500 to-purple-500", is_active: true, created_at: "2026-06-01T00:00:00Z" },
];

export const VOUCHER_TYPE_LABELS: Record<string, string> = {
  free_drink: "Free Drink",
  bogof: "Buy 1 Get 1",
  discount: "Diskon",
  free_addon: "Free Add-On",
  buy1get1: "Buy 1 Get 1",
  discount_pct: "Diskon %",
  discount_nominal: "Diskon Rp",
  free_product: "Free Product",
  bogo: "Beli 1 Gratis 1",
};

export const VOUCHER_TYPE_EMOJIS: Record<string, string> = {
  free_drink: "🥤",
  bogof: "2️⃣",
  discount: "💰",
  free_addon: "➕",
  buy1get1: "2️⃣",
  discount_pct: "💰",
  discount_nominal: "💵",
  free_product: "🎁",
  bogo: "🛒",
};

export function getVoucherDetailLabel(merchant: {
  voucher_types?: string[];
  free_product_name?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  promo_buy?: number | null;
  promo_get?: number | null;
}): string {
  const types = merchant.voucher_types || [];
  if (types.includes("free_product")) return `🎁 ${merchant.free_product_name || "Free Product"}`;
  if (types.includes("discount_pct")) return `💰 Diskon ${merchant.discount_value ?? 0}%`;
  if (types.includes("discount_nominal")) return `💵 Diskon Rp ${(merchant.discount_value ?? 0).toLocaleString()}`;
  if (types.includes("bogo")) return `🛒 Beli ${merchant.promo_buy ?? 1} Gratis ${merchant.promo_get ?? 1}`;
  return "";
}

export function getVoucherDetailBrief(merchant: {
  voucher_types?: string[];
  free_product_name?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  promo_buy?: number | null;
  promo_get?: number | null;
}): string {
  const types = merchant.voucher_types || [];
  if (types.includes("free_product")) return merchant.free_product_name || "Free";
  if (types.includes("discount_pct")) return `${merchant.discount_value ?? 0}%`;
  if (types.includes("discount_nominal")) return `Rp${(merchant.discount_value ?? 0).toLocaleString()}`;
  if (types.includes("bogo")) return `B${merchant.promo_buy ?? 1}G${merchant.promo_get ?? 1}`;
  return "";
}

export const FAMILIA_CATEGORIES = [
  { key: "all", label: "Semua", emoji: "✨" },
  { key: "makanan", label: "Makanan", emoji: "🍜" },
  { key: "minuman", label: "Minuman", emoji: "☕" },
  { key: "belanja", label: "Belanja", emoji: "🛍️" },
];
