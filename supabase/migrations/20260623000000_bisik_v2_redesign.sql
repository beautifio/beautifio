-- ============================================================
-- BISIK V2 REDESIGN — Anonymous Names + Mutual Match
-- ============================================================

-- ============================================================
-- 1. DATABASE KATA ALAM/FLORA UNTUK GENERATE NAMA
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_name_words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('alam', 'flora', 'warna'))
);

INSERT INTO bisik_name_words (word, category) VALUES
-- Alam
('langit', 'alam'), ('angin', 'alam'), ('bumi', 'alam'),
('lautan', 'alam'), ('hutan', 'alam'), ('gunung', 'alam'),
('sungai', 'alam'), ('danau', 'alam'), ('bukit', 'alam'),
('lembah', 'alam'), ('pantai', 'alam'), ('pasir', 'alam'),
('bintang', 'alam'), ('bulan', 'alam'), ('aurora', 'alam'),
('pelangi', 'alam'), ('kabut', 'alam'), ('embun', 'alam'),
('hujan', 'alam'), ('badai', 'alam'), ('ombak', 'alam'),
('cahaya', 'alam'), ('fajar', 'alam'), ('senja', 'alam'),
('malam', 'alam'), ('subuh', 'alam'), ('musim', 'alam'),
('salju', 'alam'), ('petir', 'alam'), ('mega', 'alam'),
-- Flora
('mawar', 'flora'), ('melati', 'flora'), ('kenanga', 'flora'),
('dahlia', 'flora'), ('anggrek', 'flora'), ('lotus', 'flora'),
('sakura', 'flora'), ('lavender', 'flora'), ('jasmine', 'flora'),
('tulip', 'flora'), ('lily', 'flora'), ('violet', 'flora'),
('bambu', 'flora'), ('cemara', 'flora'), ('beringin', 'flora'),
('mangga', 'flora'), ('rambutan', 'flora'), ('durian', 'flora'),
('kelapa', 'flora'), ('pisang', 'flora'), ('jambu', 'flora'),
('rotan', 'flora'), ('pakis', 'flora'), ('alang', 'flora'),
-- Warna alam
('hijau', 'warna'), ('biru', 'warna'), ('merah', 'warna'),
('kuning', 'warna'), ('oranye', 'warna'), ('ungu', 'warna'),
('coklat', 'warna'), ('putih', 'warna'), ('kelabu', 'warna'),
('teal', 'warna'), ('indigo', 'warna'), ('amber', 'warna'),
('coral', 'warna'), ('sage', 'warna'), ('rose', 'warna'),
('jade', 'warna'), ('ivory', 'warna'), ('crimson', 'warna'),
('autumn', 'warna'), ('olive', 'warna'), ('mint', 'warna')
ON CONFLICT (word) DO NOTHING;

-- ============================================================
-- 2. TAMBAH KOLOM ANONYMOUS NAME DI USERS
-- ============================================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS bisik_anonymous_name TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS bisik_custom_name TEXT UNIQUE;

-- ============================================================
-- 3. FUNCTION: GENERATE ANONYMOUS NAME
-- Format: kata1kata2## (2 digit angka)
-- Contoh: rosemerah15, langitbiru88
-- ============================================================
CREATE OR REPLACE FUNCTION generate_bisik_anonymous_name()
RETURNS TEXT AS $$
DECLARE
  v_word1 TEXT;
  v_word2 TEXT;
  v_number INTEGER;
  v_candidate TEXT;
  v_exists BOOLEAN;
  v_attempts INTEGER := 0;
BEGIN
  LOOP
    v_attempts := v_attempts + 1;
    IF v_attempts > 100 THEN
      v_candidate := 'user' || floor(random() * 9000 + 1000)::TEXT;
      RETURN v_candidate;
    END IF;

    SELECT word INTO v_word1 FROM bisik_name_words
    ORDER BY random() LIMIT 1;

    SELECT word INTO v_word2 FROM bisik_name_words
    WHERE word != v_word1
    ORDER BY random() LIMIT 1;

    v_number := floor(random() * 90 + 10)::INTEGER;

    v_candidate := v_word1 || v_word2 || v_number::TEXT;

    SELECT EXISTS(
      SELECT 1 FROM users
      WHERE bisik_anonymous_name = v_candidate
      OR bisik_custom_name = v_candidate
    ) INTO v_exists;

    IF NOT v_exists THEN
      RETURN v_candidate;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. FUNCTION: VALIDASI CUSTOM NAME
-- ============================================================
CREATE OR REPLACE FUNCTION validate_bisik_custom_name(
  p_user_id UUID,
  p_custom_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_user_name TEXT;
  v_name_no_vowel TEXT;
  v_name_part TEXT;
  v_name_parts TEXT[];
BEGIN
  IF p_custom_name !~ '^[a-zA-Z0-9]+$' THEN
    RETURN '{"valid": false, "reason": "Hanya huruf dan angka, tanpa simbol"}'::JSONB;
  END IF;

  IF p_custom_name ~ '[0-9]{3,}' THEN
    RETURN '{"valid": false, "reason": "Angka maksimal 2 digit"}'::JSONB;
  END IF;

  IF char_length(p_custom_name) < 4 THEN
    RETURN '{"valid": false, "reason": "Nama minimal 4 karakter"}'::JSONB;
  END IF;

  IF char_length(p_custom_name) > 20 THEN
    RETURN '{"valid": false, "reason": "Nama maksimal 20 karakter"}'::JSONB;
  END IF;

  SELECT LOWER(full_name) INTO v_user_name
  FROM users WHERE id = p_user_id;

  v_name_parts := string_to_array(v_user_name, ' ');
  FOREACH v_name_part IN ARRAY v_name_parts LOOP
    v_name_no_vowel := regexp_replace(
      v_name_part, '[aiueoAIUEO]', '', 'g'
    );

    IF char_length(v_name_no_vowel) >= 3
    AND LOWER(p_custom_name) LIKE '%' || v_name_no_vowel || '%' THEN
      RETURN jsonb_build_object(
        'valid', false,
        'reason', 'Nama tidak boleh mengandung bagian dari nama aslimu'
      );
    END IF;

    IF char_length(v_name_part) >= 3
    AND LOWER(p_custom_name) LIKE '%' || v_name_part || '%' THEN
      RETURN jsonb_build_object(
        'valid', false,
        'reason', 'Nama tidak boleh mengandung bagian dari nama aslimu'
      );
    END IF;
  END LOOP;

  IF EXISTS(
    SELECT 1 FROM users
    WHERE (bisik_anonymous_name = LOWER(p_custom_name)
    OR bisik_custom_name = LOWER(p_custom_name))
    AND id != p_user_id
  ) THEN
    RETURN '{"valid": false, "reason": "Nama ini sudah dipakai orang lain"}'::JSONB;
  END IF;

  RETURN '{"valid": true}'::JSONB;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. TRIGGER: AUTO-GENERATE ANONYMOUS NAME SAAT USER BARU
-- ============================================================
CREATE OR REPLACE FUNCTION auto_assign_bisik_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bisik_anonymous_name IS NULL THEN
    NEW.bisik_anonymous_name := generate_bisik_anonymous_name();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_assign_bisik_name ON users;
CREATE TRIGGER trigger_assign_bisik_name
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_bisik_name();

-- ============================================================
-- 6. BACKFILL & INDEX
-- ============================================================
UPDATE users
SET bisik_anonymous_name = generate_bisik_anonymous_name()
WHERE bisik_anonymous_name IS NULL;

CREATE INDEX IF NOT EXISTS idx_bisik_cards_user_active
  ON bisik_cards(user_id, is_active);

-- ============================================================
-- 7. MUTUAL MATCH TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION check_bisik_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
  v_reverse_card_id UUID;
  v_chat_exists BOOLEAN;
BEGIN
  IF NEW.direction != 'right' THEN
    RETURN NEW;
  END IF;

  SELECT bc.id INTO v_reverse_card_id
  FROM bisik_swipes bs
  JOIN bisik_cards bc ON bc.id = bs.card_id
  WHERE bs.swiper_id = NEW.card_owner_id
    AND bc.user_id = NEW.swiper_id
    AND bs.direction = 'right'
  LIMIT 1;

  IF v_reverse_card_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM bisik_chats
    WHERE (initiator_id = NEW.swiper_id AND receiver_id = NEW.card_owner_id)
    OR (initiator_id = NEW.card_owner_id AND receiver_id = NEW.swiper_id)
    AND status IN ('pending', 'active')
  ) INTO v_chat_exists;

  IF NOT v_chat_exists THEN
    INSERT INTO bisik_chats (
      card_id,
      initiator_id,
      receiver_id,
      status
    ) VALUES (
      NEW.card_id,
      NEW.swiper_id,
      NEW.card_owner_id,
      'active'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_bisik_mutual_match ON bisik_swipes;
CREATE TRIGGER trigger_bisik_mutual_match
  AFTER INSERT ON bisik_swipes
  FOR EACH ROW
  EXECUTE FUNCTION check_bisik_mutual_match();

-- ============================================================
-- 8. FUNCTION: GET BISIK DISPLAY NAME
-- ============================================================
CREATE OR REPLACE FUNCTION get_bisik_display_name(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_name TEXT;
  v_is_pro BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_subscriptions
    WHERE user_id = p_user_id
    AND status = 'active'
    AND expires_at > NOW()
  ) INTO v_is_pro;

  IF v_is_pro THEN
    SELECT COALESCE(bisik_custom_name, bisik_anonymous_name)
    INTO v_name FROM users WHERE id = p_user_id;
  ELSE
    SELECT bisik_anonymous_name INTO v_name
    FROM users WHERE id = p_user_id;
  END IF;

  RETURN COALESCE(v_name, 'Anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
