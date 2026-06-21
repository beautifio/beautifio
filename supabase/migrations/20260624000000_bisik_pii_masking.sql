-- ============================================================
-- BISIK PII MASKING SYSTEM
-- Auto-sensor nomor HP, email, nama asli di chat messages
-- ============================================================

-- ============================================================
-- 1. TABEL TRACKING PELANGGARAN
-- ============================================================
CREATE TABLE IF NOT EXISTS bisik_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES bisik_chats(id) ON DELETE SET NULL,
  message_id UUID REFERENCES bisik_messages(id) ON DELETE SET NULL,
  violation_type TEXT NOT NULL
    CHECK (violation_type IN ('phone', 'email', 'real_name')),
  original_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bisik_violations_user
  ON bisik_violations(user_id, created_at);

ALTER TABLE bisik_violations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin view violations" ON bisik_violations;
CREATE POLICY "Admin view violations"
  ON bisik_violations FOR SELECT
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));
DROP POLICY IF EXISTS "System insert violations" ON bisik_violations;
CREATE POLICY "System insert violations"
  ON bisik_violations FOR INSERT
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS bisik_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  banned_until TIMESTAMPTZ NOT NULL,
  ban_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE bisik_bans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage bans" ON bisik_bans;
CREATE POLICY "Admin manage bans"
  ON bisik_bans FOR ALL
  USING (public.user_has_role(ARRAY['admin', 'superadmin']));
DROP POLICY IF EXISTS "System insert bans" ON bisik_bans;
CREATE POLICY "System insert bans"
  ON bisik_bans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "System update bans" ON bisik_bans;
CREATE POLICY "System update bans"
  ON bisik_bans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Users check own ban" ON bisik_bans;
CREATE POLICY "Users check own ban"
  ON bisik_bans FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- 2. FUNCTION MASKING UTAMA
-- ============================================================
CREATE OR REPLACE FUNCTION mask_pii_in_message(
  p_content TEXT,
  p_sender_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_masked TEXT;
  v_full_name TEXT;
  v_name_parts TEXT[];
  v_name_part TEXT;
  v_violations TEXT[] := '{}';
BEGIN
  v_masked := p_content;

  -- ============================================================
  -- 1. DETEKSI & SENSOR NOMOR HP
  -- ============================================================
  -- Format: 08xxxxxxxxxx, +628xxxxxxxx, 628xxxxxxxx
  -- Dengan/tanpa separator (spasi, strip, titik)
  IF v_masked ~* '(\+?62|0)[\s\-\.]?8[\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9]?[\s\-\.]?[0-9]?[\s\-\.]?[0-9]?' THEN
    v_masked := regexp_replace(
      v_masked,
      '(\+?62|0)[\s\-\.]?8[\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9]?[\s\-\.]?[0-9]?[\s\-\.]?[0-9]?',
      regexp_replace(
        substring(v_masked FROM '(\+?62|0)[\s\-\.]?8[\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9][\s\-\.]?[0-9]?[\s\-\.]?[0-9]?[\s\-\.]?[0-9]?'),
        '(?<=.).', '*', 'g'
      ),
      'g'
    );
    v_violations := array_append(v_violations, 'phone');
  END IF;

  -- ============================================================
  -- 2. DETEKSI & SENSOR EMAIL
  -- ============================================================
  -- Format email standar
  IF v_masked ~* '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}' THEN
    v_masked := regexp_replace(
      v_masked,
      '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
      regexp_replace(
        substring(v_masked FROM '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}'),
        '(?<=.).', '*', 'g'
      ),
      'g'
    );
    v_violations := array_append(v_violations, 'email');
  END IF;

  -- Format akali "dot" / "titik" / "at"
  IF v_masked ~* '[a-zA-Z0-9]+\s*(dot|titik|\.)\s*(gmail|yahoo|hotmail|outlook)\s*(dot|titik|\.)\s*(com|id|net|org)' THEN
    v_masked := regexp_replace(
      v_masked,
      '([a-zA-Z0-9]+)(\s*(dot|titik|\.)\s*(gmail|yahoo|hotmail|outlook)\s*(dot|titik|\.)\s*(com|id|net|org))',
      '***@***.***',
      'gi'
    );
    v_violations := array_append(v_violations, 'email');
  END IF;

  -- ============================================================
  -- 3. DETEKSI & SENSOR NAMA ASLI
  -- ============================================================
  SELECT full_name INTO v_full_name
  FROM users WHERE id = p_sender_id;

  IF v_full_name IS NOT NULL THEN
    v_name_parts := string_to_array(LOWER(v_full_name), ' ');

    FOREACH v_name_part IN ARRAY v_name_parts LOOP
      IF char_length(v_name_part) < 3 THEN
        CONTINUE;
      END IF;

      IF LOWER(v_masked) LIKE '%' || v_name_part || '%' THEN
        v_masked := regexp_replace(
          v_masked,
          '(?i)' || v_name_part,
          substring(v_name_part, 1, 1) ||
          repeat('*', char_length(v_name_part) - 1),
          'g'
        );
        v_violations := array_append(v_violations, 'real_name');
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'masked_content', v_masked,
    'violations', v_violations,
    'was_modified', (v_masked != p_content)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. TRIGGER PADA bisik_messages INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_mask_bisik_message()
RETURNS TRIGGER AS $$
DECLARE
  v_result JSONB;
  v_violation_type TEXT;
  v_violation_count INTEGER;
BEGIN
  v_result := mask_pii_in_message(NEW.content, NEW.sender_id);

  NEW.content := v_result->>'masked_content';

  IF (v_result->>'was_modified')::BOOLEAN THEN
    FOREACH v_violation_type IN ARRAY
      ARRAY(SELECT jsonb_array_elements_text(v_result->'violations'))
    LOOP
      INSERT INTO bisik_violations (
        user_id, chat_id, message_id, violation_type,
        original_snippet
      ) VALUES (
        NEW.sender_id,
        NEW.chat_id,
        NEW.id,
        v_violation_type,
        left(NEW.content, 50)
      );
    END LOOP;

    SELECT COUNT(DISTINCT created_at::DATE) INTO v_violation_count
    FROM bisik_violations
    WHERE user_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '24 hours';

    IF v_violation_count >= 3 THEN
      INSERT INTO bisik_bans (user_id, reason, banned_until, ban_count)
      VALUES (
        NEW.sender_id,
        'Tiga kali membagikan informasi pribadi dalam chat',
        NOW() + INTERVAL '3 hours',
        1
      )
      ON CONFLICT (user_id) DO UPDATE SET
        banned_until = NOW() + INTERVAL '3 hours',
        ban_count = bisik_bans.ban_count + 1,
        created_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_bisik_pii_mask ON bisik_messages;
CREATE TRIGGER trigger_bisik_pii_mask
  BEFORE INSERT ON bisik_messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_mask_bisik_message();
