DROP TABLE IF EXISTS journal_reactions CASCADE;
DROP TABLE IF EXISTS journal_followers CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS journal_milestones CASCADE;
DROP TABLE IF EXISTS journals CASCADE;

UPDATE daily_activities SET title = 'Refleksi Harian' WHERE title = 'Jurnal Harian';
