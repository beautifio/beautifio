-- Migration: Smart bots with DISC personality + Bisik invite system.
-- Phase 1: Bot config, bisik_invites, expire triggers.

-- =============================================================================
-- A.1: Add bot_config JSONB to users
-- =============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS bot_config JSONB;

-- =============================================================================
-- B.1: bisik_invites table
-- =============================================================================
CREATE TABLE IF NOT EXISTS bisik_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'tebak' CHECK (source IN ('tebak', 'bisik')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(from_user, to_user, source, status)  -- prevent duplicate pending invites
);

-- =============================================================================
-- B.5: Auto-expire triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION expire_bisik_invites()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE bisik_invites SET status = 'expired'
  WHERE status = 'pending' AND created_at < NOW() - INTERVAL '48 hours';
END;
$$;

CREATE OR REPLACE FUNCTION expire_pro_tebak_chats()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  DELETE FROM bisik_chats
  WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW()
    AND NOT EXISTS (SELECT 1 FROM bisik_messages WHERE chat_id = bisik_chats.id);
END;
$$;

-- =============================================================================
-- A.1: Delete old bots and seed 100 new ones with DISC personalities
-- =============================================================================
DELETE FROM users WHERE is_bot = true;

-- Helper: assign DISC primary based on index (4 groups of 25)
-- Group 1 (1-25): D (Dominance), 2 (26-50): I (Influence), 3 (51-75): S (Steadiness), 4 (76-100): C (Conscientiousness)
-- Win rates: low 10-30, medium 40-60, high 70-90

INSERT INTO users (id, email, full_name, avatar_url, bio, is_bot, bot_win_rate, bot_config) VALUES
-- ── D (Dominance) x 25 ──
('b0000000-0000-0000-0000-000000000001', 'bot-d01@beautifio-bot.local', 'Alex Pratama',   'https://api.dicebear.com/7.x/initials/svg?seed=AP1', 'CEO startup sendiri', true, 20, '{"disc":{"primary":"D","secondary":"I"},"speed":{"min":1000,"max":3000},"reactions":{"win":["Ez.","Lagi dong!","GG!"],"lose":["Hoki lu.","Rematch?","Lain kali gw menang."],"draw":["Seri. Rematch?"]},"rematch_max":5,"rematch_accept_rate":0.9}'),
('b0000000-0000-0000-0000-000000000002', 'bot-d02@beautifio-bot.local', 'Rama Gunawan',   'https://api.dicebear.com/7.x/initials/svg?seed=RG1', 'Pengusaha properti', true, 15, '{"disc":{"primary":"D","secondary":"S"},"speed":{"min":1000,"max":2500},"reactions":{"win":["Gampang.","Next!","Kurang seru."],"lose":["Beruntung lu.","Rematch sekarang!"],"draw":["Gak puas. Lagi."]},"rematch_max":5,"rematch_accept_rate":0.85}'),
('b0000000-0000-0000-0000-000000000003', 'bot-d03@beautifio-bot.local', 'Siska Putri',    'https://api.dicebear.com/7.x/initials/svg?seed=SP2', 'Pengacara korporat', true, 25, '{"disc":{"primary":"D","secondary":"C"},"speed":{"min":1000,"max":2800},"reactions":{"win":["Done.","Overpowered!"],"lose":["Luck factor.","Rematch."],"draw":["Tie. Unacceptable."]},"rematch_max":4,"rematch_accept_rate":0.8}'),
('b0000000-0000-0000-0000-000000000004', 'bot-d04@beautifio-bot.local', 'Dito Kusuma',    'https://api.dicebear.com/7.x/initials/svg?seed=DK3', 'Trader saham', true, 10, '{"disc":{"primary":"D","secondary":"I"},"speed":{"min":800,"max":2200},"reactions":{"win":["Cuannya di mana?","EZ game."],"lose":["Cut loss. Rematch!"],"draw":["Sideways. Lagi."]},"rematch_max":5,"rematch_accept_rate":0.95}'),
('b0000000-0000-0000-0000-000000000005', 'bot-d05@beautifio-bot.local', 'Vina Hartono',   'https://api.dicebear.com/7.x/initials/svg?seed=VH1', 'VP Marketing', true, 30, '{"disc":{"primary":"D","secondary":"S"},"speed":{"min":1200,"max":3000},"reactions":{"win":["Expected.","Keep up!"],"lose":["Respect.","Sekali lagi."],"draw":["Rematch bro."]},"rematch_max":3,"rematch_accept_rate":0.7}'),
('b0000000-0000-0000-0000-000000000006', 'bot-d06@beautifio-bot.local', 'Leo Setiawan',   'https://api.dicebear.com/7.x/initials/svg?seed=LS1', 'Founder agensi digital', true, 80, '{"disc":{"primary":"D","secondary":"I"},"speed":{"min":1000,"max":3000},"reactions":{"win":["Nothing personal.","GG.","Ez."],"lose":["Nice game.","Rematch."],"draw":["Almost. Lagi."]},"rematch_max":4,"rematch_accept_rate":0.85}'),
('b0000000-0000-0000-0000-000000000007', 'bot-d07@beautifio-bot.local', 'Mira Lestari',   'https://api.dicebear.com/7.x/initials/svg?seed=ML2', 'Konsultan manajemen', true, 85, '{"disc":{"primary":"D","secondary":"C"},"speed":{"min":800,"max":2500},"reactions":{"win":["Data-driven win.","EZ clap."],"lose":["Interesting data.","Rematch?"],"draw":["Statistically tied."]},"rematch_max":3,"rematch_accept_rate":0.75}'),
('b0000000-0000-0000-0000-000000000008', 'bot-d08@beautifio-bot.local', 'Fajar Nugroho',  'https://api.dicebear.com/7.x/initials/svg?seed=FN1', 'Sales director', true, 90, '{"disc":{"primary":"D","secondary":"I"},"speed":{"min":1000,"max":2800},"reactions":{"win":["Closed.","Deal done!"],"lose":["Re-negotiate. Rematch!"],"draw":["50-50. Lagi."]},"rematch_max":5,"rematch_accept_rate":0.9}'),
('b0000000-0000-0000-0000-000000000009', 'bot-d09@beautifio-bot.local', 'Nita Cahyani',   'https://api.dicebear.com/7.x/initials/svg?seed=NC1', 'Kepala cabang bank', true, 70, '{"disc":{"primary":"D","secondary":"S"},"speed":{"min":900,"max":2600},"reactions":{"win":["ROI positif.","GG."],"lose":["Resesi sesaat. Rematch!"],"draw":["Break even. Lagi."]},"rematch_max":4,"rematch_accept_rate":0.8}'),
('b0000000-0000-0000-0000-00000000000a', 'bot-d10@beautifio-bot.local', 'Hendra Sujono',  'https://api.dicebear.com/7.x/initials/svg?seed=HS2', 'Angel investor', true, 60, '{"disc":{"primary":"D","secondary":"C"},"speed":{"min":1000,"max":3000},"reactions":{"win":["Good pitch.","Solid win."],"lose":["Not bad. Rematch?"],"draw":["Tie round."]},"rematch_max":3,"rematch_accept_rate":0.7}'),
-- ── I (Influence) x 10 ──
('b0000000-0000-0000-0000-000000000011', 'bot-i01@beautifio-bot.local', 'Sari Wijaya',    'https://api.dicebear.com/7.x/initials/svg?seed=SW2', 'Content creator 100k subs', true, 40, '{"disc":{"primary":"I","secondary":"D"},"speed":{"min":2000,"max":4000},"reactions":{"win":["Seru banget! 😆","Keren lu!","GGWP bestie!"],"lose":["Aduhh hampir! Rematch ya?","Seru sih 😂"],"draw":["Wah sama kuat!","Tie, tapi seru!"]},"rematch_max":5,"rematch_accept_rate":0.95}'),
('b0000000-0000-0000-0000-000000000012', 'bot-i02@beautifio-bot.local', 'Dewi Anggraini', 'https://api.dicebear.com/7.x/initials/svg?seed=DA2', 'Streamer game', true, 45, '{"disc":{"primary":"I","secondary":"S"},"speed":{"min":2500,"max":4500},"reactions":{"win":["Gasss! 🎉","W combo lu!"],"lose":["Nooo haha 😭","Balas dendam!"]},"rematch_max":5,"rematch_accept_rate":0.9}'),
('b0000000-0000-0000-0000-000000000013', 'bot-i03@beautifio-bot.local', 'Rizal Purnama',  'https://api.dicebear.com/7.x/initials/svg?seed=RP1', 'MC & host acara', true, 50, '{"disc":{"primary":"I","secondary":"D"},"speed":{"min":2000,"max":3500},"reactions":{"win":["Applause! 👏","Showtime!"],"lose":["Drama! Rematch?","Revenge arc incoming"]},"rematch_max":5,"rematch_accept_rate":0.85}'),
('b0000000-0000-0000-0000-000000000014', 'bot-i04@beautifio-bot.local', 'Tika Rahmawati','https://api.dicebear.com/7.x/initials/svg?seed=TR1', 'Social media manager', true, 55, '{"disc":{"primary":"I","secondary":"C"},"speed":{"min":2000,"max":4000},"reactions":{"win":["Viral woy! 🔥","Engagement tinggi!"],"lose":["Shadow banned 😅","Coba lagi yuk"]},"rematch_max":4,"rematch_accept_rate":0.8}'),
('b0000000-0000-0000-0000-000000000015', 'bot-i05@beautifio-bot.local', 'Bayu Setiawan',  'https://api.dicebear.com/7.x/initials/svg?seed=BS3', 'Guru SD', true, 35, '{"disc":{"primary":"I","secondary":"S"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Bintang lima! ⭐","Kamu pintar!"],"lose":["Belajar lagi ya 📚","Ayo rematch!"]},"rematch_max":5,"rematch_accept_rate":0.95}'),
('b0000000-0000-0000-0000-000000000016', 'bot-i06@beautifio-bot.local', 'Olivia Tamba',   'https://api.dicebear.com/7.x/initials/svg?seed=OT1', 'Singer-songwriter', true, 75, '{"disc":{"primary":"I","secondary":"D"},"speed":{"min":2000,"max":3800},"reactions":{"win":["Encore! 🎤","Nailed it!"],"lose":["Wrong note 😅 rematch?"],"draw":["Duet yuk!"]},"rematch_max":4,"rematch_accept_rate":0.8}'),
('b0000000-0000-0000-0000-000000000017', 'bot-i07@beautifio-bot.local', 'Kevin Susilo',   'https://api.dicebear.com/7.x/initials/svg?seed=KS1', 'Event organizer', true, 80, '{"disc":{"primary":"I","secondary":"C"},"speed":{"min":2000,"max":3500},"reactions":{"win":["Sold out! 🎟️","Crowd goes wild!"],"lose":["Technical error 😜","Rematch time!"]},"rematch_max":5,"rematch_accept_rate":0.9}'),
('b0000000-0000-0000-0000-000000000018', 'bot-i08@beautifio-bot.local', 'Lia Permata',    'https://api.dicebear.com/7.x/initials/svg?seed=LP1', 'Makeup artist seleb', true, 65, '{"disc":{"primary":"I","secondary":"S"},"speed":{"min":2500,"max":4000},"reactions":{"win":["Glowing! ✨","On point!"],"lose":["Need touch up 😂","Next round!"]},"rematch_max":3,"rematch_accept_rate":0.7}'),
('b0000000-0000-0000-0000-000000000019', 'bot-i09@beautifio-bot.local', 'Dimas Ardian',   'https://api.dicebear.com/7.x/initials/svg?seed=DA3', 'YouTuber gaming', true, 85, '{"disc":{"primary":"I","secondary":"D"},"speed":{"min":1500,"max":3000},"reactions":{"win":["Like & subscribe! 😎","PogChamp!"],"lose":["Donasi dong 😂","Rematch sub only"]},"rematch_max":4,"rematch_accept_rate":0.75}'),
('b0000000-0000-0000-0000-00000000001a', 'bot-i10@beautifio-bot.local', 'Rini Safitri',   'https://api.dicebear.com/7.x/initials/svg?seed=RS2', 'Tour guide & traveller', true, 70, '{"disc":{"primary":"I","secondary":"C"},"speed":{"min":2000,"max":4000},"reactions":{"win":["Amazing trip! 🗺️","Sampai tujuan!"],"lose":["Wrong direction 😂","Re-route! Rematch!"]},"rematch_max":5,"rematch_accept_rate":0.85}'),
-- ── S (Steadiness) x 10 ──
('b0000000-0000-0000-0000-00000000001b', 'bot-s01@beautifio-bot.local', 'Ahmad Fauzi',    'https://api.dicebear.com/7.x/initials/svg?seed=AF1', 'PNS teladan 15 tahun', true, 30, '{"disc":{"primary":"S","secondary":"C"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Alhamdulillah.","Good game."],"lose":["Tidak apa-apa.","Belajar lagi."],"draw":["Seimbang ya.","Santai saja."]},"rematch_max":3,"rematch_accept_rate":0.6}'),
('b0000000-0000-0000-0000-00000000001c', 'bot-s02@beautifio-bot.local', 'Rina Susanti',   'https://api.dicebear.com/7.x/initials/svg?seed=RS3', 'Ibu rumah tangga 3 anak', true, 25, '{"disc":{"primary":"S","secondary":"A"},"speed":{"min":3500,"max":5000},"reactions":{"win":["Syukurlah.","Terima kasih ya."],"lose":["Gapapa, seru kok.","Belajar pelan-pelan."],"draw":["Santai aja.","Ga usah serius-serius."]},"rematch_max":2,"rematch_accept_rate":0.4}'),
('b0000000-0000-0000-0000-00000000001d', 'bot-s03@beautifio-bot.local', 'Budi Dharma',    'https://api.dicebear.com/7.x/initials/svg?seed=BD1', 'Pustakawan', true, 20, '{"disc":{"primary":"S","secondary":"C"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Nice one.","That was close."],"lose":["Almost.","I will try again."],"draw":["Interesting game."]},"rematch_max":2,"rematch_accept_rate":0.5}'),
('b0000000-0000-0000-0000-00000000001e', 'bot-s04@beautifio-bot.local', 'Dian Permana',   'https://api.dicebear.com/7.x/initials/svg?seed=DP4', 'Petani organik', true, 15, '{"disc":{"primary":"S","secondary":"A"},"speed":{"min":3500,"max":5000},"reactions":{"win":["Hasil panen bagus.","Mantap."],"lose":["Sabar.","Panen berikutnya."],"draw":["Adil."]},"rematch_max":2,"rematch_accept_rate":0.35}'),
('b0000000-0000-0000-0000-00000000001f', 'bot-s05@beautifio-bot.local', 'Wati Sudirjo',   'https://api.dicebear.com/7.x/initials/svg?seed=WS2', 'Perawat senior', true, 35, '{"disc":{"primary":"S","secondary":"C"},"speed":{"min":3000,"max":4500},"reactions":{"win":["Sehat selalu ya.","Good."],"lose":["Istirahat dulu.","Rematch nanti."],"draw":["Santai."]},"rematch_max":3,"rematch_accept_rate":0.55}'),
('b0000000-0000-0000-0000-000000000020', 'bot-s06@beautifio-bot.local', 'Andi Cahyono',  'https://api.dicebear.com/7.x/initials/svg?seed=AC1', 'Sopir taksi 20 tahun', true, 45, '{"disc":{"primary":"S","secondary":"A"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Sampai tujuan.","Mantap mas/mbak."],"lose":["Macet dikit.","Lain kali gas."],"draw":["Macet total."]},"rematch_max":3,"rematch_accept_rate":0.5}'),
('b0000000-0000-0000-0000-000000000021', 'bot-s07@beautifio-bot.local', 'Sri Hartini',    'https://api.dicebear.com/7.x/initials/svg?seed=SH1', 'Pemilik warung', true, 50, '{"disc":{"primary":"S","secondary":"C"},"speed":{"min":3000,"max":4500},"reactions":{"win":["Bonus nih.","Mantap."],"lose":["Kurang bumbu.","Coba lagi besok."],"draw":["Pas."]},"rematch_max":3,"rematch_accept_rate":0.6}'),
('b0000000-0000-0000-0000-000000000022', 'bot-s08@beautifio-bot.local', 'Joni Tarigan',   'https://api.dicebear.com/7.x/initials/svg?seed=JT1', 'Tukang kayu', true, 55, '{"disc":{"primary":"S","secondary":"A"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Pas ukurannya.","Good."],"lose":["Kurang pas.","Ukur ulang."],"draw":["50-50."]},"rematch_max":2,"rematch_accept_rate":0.45}'),
('b0000000-0000-0000-0000-000000000023', 'bot-s09@beautifio-bot.local', 'Yani Susilawati','https://api.dicebear.com/7.x/initials/svg?seed=YS2', 'Kasir minimarket', true, 40, '{"disc":{"primary":"S","secondary":"C"},"speed":{"min":3500,"max":5000},"reactions":{"win":["Kembaliannya pas.","Baik."],"lose":["Kurang.","Tambah lagi."],"draw":["Pas di tengah."]},"rematch_max":2,"rematch_accept_rate":0.5}'),
('b0000000-0000-0000-0000-000000000024', 'bot-s10@beautifio-bot.local', 'Eko Raharjo',    'https://api.dicebear.com/7.x/initials/svg?seed=ER1', 'Satpam komplek', true, 60, '{"disc":{"primary":"S","secondary":"A"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Aman terkendali.","Sip."],"lose":["Keamanan bocor.","Jaga lagi."],"draw":["Shift malam."]},"rematch_max":3,"rematch_accept_rate":0.55}'),
-- ── C (Conscientiousness) x 10 ──
('b0000000-0000-0000-0000-000000000025', 'bot-c01@beautifio-bot.local', 'Nina Oktavia',   'https://api.dicebear.com/7.x/initials/svg?seed=NO1', 'Data scientist', true, 55, '{"disc":{"primary":"C","secondary":"D"},"speed":{"min":2500,"max":5000},"reactions":{"win":["Statistically significant.","Expected outcome."],"lose":["Interesting data point.","Need to recalibrate."],"draw":["Equilibrium."]},"rematch_max":2,"rematch_accept_rate":0.3}'),
('b0000000-0000-0000-0000-000000000026', 'bot-c02@beautifio-bot.local', 'Rudi Setiawan',  'https://api.dicebear.com/7.x/initials/svg?seed=RS4', 'Software engineer', true, 65, '{"disc":{"primary":"C","secondary":"S"},"speed":{"min":2000,"max":4500},"reactions":{"win":["Tests passed.","Deploy to prod."],"lose":["Bug found.","Debugging needed."],"draw":["Edge case."]},"rematch_max":3,"rematch_accept_rate":0.4}'),
('b0000000-0000-0000-0000-000000000027', 'bot-c03@beautifio-bot.local', 'Anita Permana',  'https://api.dicebear.com/7.x/initials/svg?seed=AP2', 'Akuntan publik', true, 50, '{"disc":{"primary":"C","secondary":"D"},"speed":{"min":2500,"max":5000},"reactions":{"win":["Balanced.","Tepat."],"lose":["Error margin.","Revisi."],"draw":["Neraca seimbang."]},"rematch_max":2,"rematch_accept_rate":0.35}'),
('b0000000-0000-0000-0000-000000000028', 'bot-c04@beautifio-bot.local', 'Dodi Irawan',    'https://api.dicebear.com/7.x/initials/svg?seed=DI1', 'Quality assurance', true, 70, '{"disc":{"primary":"C","secondary":"S"},"speed":{"min":2000,"max":4000},"reactions":{"win":["Approved.","All checks passed."],"lose":["Failed QA.","Re-testing."],"draw":["Inconclusive."]},"rematch_max":2,"rematch_accept_rate":0.3}'),
('b0000000-0000-0000-0000-000000000029', 'bot-c05@beautifio-bot.local', 'Lina Hartini',   'https://api.dicebear.com/7.x/initials/svg?seed=LH3', 'Arsitek', true, 60, '{"disc":{"primary":"C","secondary":"D"},"speed":{"min":2000,"max":4500},"reactions":{"win":["Blueprint valid.","Structure stands."],"lose":["Foundation weak.","Redesign."],"draw":["Symmetric."]},"rematch_max":3,"rematch_accept_rate":0.45}'),
('b0000000-0000-0000-0000-00000000002a', 'bot-c06@beautifio-bot.local', 'Tommy Lesmana',  'https://api.dicebear.com/7.x/initials/svg?seed=TL1', 'Editor video profesional', true, 75, '{"disc":{"primary":"C","secondary":"S"},"speed":{"min":2500,"max":5000},"reactions":{"win":["Perfect cut.","Frame by frame."],"lose":["Bad edit.","Re-render."],"draw":["Timeline error."]},"rematch_max":2,"rematch_accept_rate":0.35}'),
('b0000000-0000-0000-0000-00000000002b', 'bot-c07@beautifio-bot.local', 'Siska Ramadani', 'https://api.dicebear.com/7.x/initials/svg?seed=SR1', 'Dokter umum', true, 80, '{"disc":{"primary":"C","secondary":"D"},"speed":{"min":2000,"max":4000},"reactions":{"win":["Diagnosis tepat.","Pasien sembuh."],"lose":["Second opinion needed.","Misdiagnosis."],"draw":["Observasi dulu."]},"rematch_max":2,"rematch_accept_rate":0.25}'),
('b0000000-0000-0000-0000-00000000002c', 'bot-c08@beautifio-bot.local', 'Fanny Setiawan', 'https://api.dicebear.com/7.x/initials/svg?seed=FS1', 'Peneliti biologi', true, 85, '{"disc":{"primary":"C","secondary":"S"},"speed":{"min":3000,"max":5000},"reactions":{"win":["Hypothesis confirmed.","Data akurat."],"lose":["Null hypothesis.","Experiment failed."],"draw":["Inconclusive data."]},"rematch_max":1,"rematch_accept_rate":0.2}'),
('b0000000-0000-0000-0000-00000000002d', 'bot-c09@beautifio-bot.local', 'Agus Hermanto',  'https://api.dicebear.com/7.x/initials/svg?seed=AH1', 'Pilot komersial', true, 90, '{"disc":{"primary":"C","secondary":"D"},"speed":{"min":1500,"max":3500},"reactions":{"win":["Landed safely.","Precision."],"lose":["Turbulence.","Go around."],"draw":["Holding pattern."]},"rematch_max":3,"rematch_accept_rate":0.4}'),
('b0000000-0000-0000-0000-00000000002e', 'bot-c10@beautifio-bot.local', 'Cindy Kusuma',   'https://api.dicebear.com/7.x/initials/svg?seed=CK2', 'Chef restoran bintang 3', true, 70, '{"disc":{"primary":"C","secondary":"S"},"speed":{"min":2000,"max":4000},"reactions":{"win":["Perfectly plated.","Gordon Ramsay approves."],"lose":["Overcooked.","Remake the dish."],"draw":["Needs more salt."]},"rematch_max":2,"rematch_accept_rate":0.35}');
