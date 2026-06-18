-- Migration: 20260618230000_cleanup_relic_templates.sql
-- Hapus 12 template relic dari seed lama (00016/00021) yang slug-nya bukan bagian dari 30 final.
-- Template ini tidak punya dream_phases, jadi user yang pilih salah satunya akan dapat empty journey.
-- Aman dihapus karena CASCADE dari dream_templates akan membersihkan referensi.

DELETE FROM dream_templates WHERE slug IN (
  'animator',
  'cybersecurity',
  'e-commerce-owner',
  'fashion-model',
  'fitness-coach',
  'martial-artist',
  'nurse',
  'nutritionist',
  'product-manager',
  'travel-vlogger',
  'ux-designer',
  'writer'
);
