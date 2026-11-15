-- Seed paket langganan 2026 (lihat docs/pricing-2026.md).
-- Idempotent: aman dijalankan berulang, tidak menduplikasi berdasarkan `name`.
-- Jalankan SETELAH 00015_weekly_duration.sql.

BEGIN;

INSERT INTO public.subscription_plans
  (name, duration_type, price_idr, original_price_idr, tier, max_active_chats, features, is_active, display_order)
SELECT v.name, v.duration_type, v.price_idr, v.original_price_idr, v.tier,
       v.max_active_chats, v.features::jsonb, true, v.display_order
FROM (VALUES
  ('Pro Mingguan',       'weekly',  12000, NULL::numeric, 'pro',       20,
   '["30 chat per minggu","15x main Tebak/hari","Nama anonim custom","Cocok buat coba-coba"]', 10),
  ('Ultimate Mingguan',  'weekly',  25000, NULL::numeric, 'ultimate', 999,
   '["Unlimited chat","Unlimited main Tebak","Unlimited journey","Badge Ultimate"]', 11),
  ('Ultimate Bulanan',   'monthly', 99000, NULL::numeric, 'ultimate', 999,
   '["Unlimited chat","Unlimited main Tebak","Unlimited journey","Unlimited circle","Diskon event 20%","Badge Ultimate eksklusif","Semua benefit Pro"]', 12),
  ('Ultimate Tahunan',   'yearly', 799000, 1188000::numeric, 'ultimate', 999,
   '["Unlimited chat","Unlimited main Tebak","Unlimited journey","Unlimited circle","Diskon event 20%","Badge Ultimate eksklusif","Semua benefit Pro","Hemat 33%"]', 13)
) AS v(name, duration_type, price_idr, original_price_idr, tier, max_active_chats, features, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_plans p WHERE p.name = v.name
);

COMMIT;
