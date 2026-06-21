-- Fix PII masking: substring() with capturing group returned only the prefix "0",
-- not the full phone number, causing the entire number to be replaced with "0*".
-- Now uses quantifier {7,10} + substring(v, 1, 1) || repeat('*', len-1) for masking.
-- Also fixes original_snippet to capture pre-mask content in violations.
-- Fix FK: bisik_violations.message_id must be deferrable since trigger is BEFORE INSERT.

CREATE OR REPLACE FUNCTION mask_pii_in_message(
  p_content TEXT,
  p_sender_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_masked TEXT;
  v_full_name TEXT;
  v_name_parts TEXT[];
  v_name_part TEXT;
  v_violations TEXT[] := '{}';
  v_phone_match TEXT;
  v_email_match TEXT;
BEGIN
  v_masked := p_content;

  -- 1. DETEKSI & SENSOR NOMOR HP (08xxx, +628xxx, 628xxx)
  v_phone_match := substring(v_masked FROM '((\+?62|0)[\s\-\.]?8[\s\-\.]?[0-9]{7,10})');
  IF v_phone_match IS NOT NULL THEN
    v_masked := regexp_replace(
      v_masked,
      '(\+?62|0)[\s\-\.]?8[\s\-\.]?[0-9]{7,10}',
      substring(v_phone_match, 1, 1) || repeat('*', char_length(v_phone_match) - 1),
      'g'
    );
    v_violations := array_append(v_violations, 'phone');
  END IF;

  -- 2. DETEKSI & SENSOR EMAIL
  v_email_match := substring(v_masked FROM '([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})');
  IF v_email_match IS NOT NULL THEN
    v_masked := regexp_replace(
      v_masked,
      '[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}',
      substring(v_email_match, 1, 1) || repeat('*', char_length(v_email_match) - 1),
      'g'
    );
    v_violations := array_append(v_violations, 'email');
  END IF;

  -- Format akali "dot"/"titik"/"at"
  IF v_masked ~* '[a-zA-Z0-9]+\s*(dot|titik|\.)\s*(gmail|yahoo|hotmail|outlook)\s*(dot|titik|\.)\s*(com|id|net|org)' THEN
    v_masked := regexp_replace(
      v_masked,
      '([a-zA-Z0-9]+)(\s*(dot|titik|\.)\s*(gmail|yahoo|hotmail|outlook)\s*(dot|titik|\.)\s*(com|id|net|org))',
      '***@***.***',
      'gi'
    );
    v_violations := array_append(v_violations, 'email');
  END IF;

  -- 3. DETEKSI & SENSOR NAMA ASLI
  SELECT full_name INTO v_full_name
  FROM users WHERE id = p_sender_id;
  IF v_full_name IS NOT NULL THEN
    v_name_parts := string_to_array(LOWER(v_full_name), ' ');
    FOREACH v_name_part IN ARRAY v_name_parts LOOP
      IF char_length(v_name_part) < 3 THEN CONTINUE; END IF;
      IF LOWER(v_masked) LIKE '%' || v_name_part || '%' THEN
        v_masked := regexp_replace(
          v_masked, '(?i)' || v_name_part,
          substring(v_name_part, 1, 1) || repeat('*', char_length(v_name_part) - 1), 'g'
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

-- Trigger: save original content before masking for violation snippet
CREATE OR REPLACE FUNCTION trigger_mask_bisik_message()
RETURNS TRIGGER AS $$
DECLARE
  v_result JSONB;
  v_violation_type TEXT;
  v_violation_count INTEGER;
  v_original_content TEXT;
BEGIN
  v_original_content := NEW.content;
  v_result := mask_pii_in_message(NEW.content, NEW.sender_id);
  NEW.content := v_result->>'masked_content';

  IF (v_result->>'was_modified')::BOOLEAN THEN
    FOREACH v_violation_type IN ARRAY
      ARRAY(SELECT jsonb_array_elements_text(v_result->'violations'))
    LOOP
      INSERT INTO bisik_violations (user_id, chat_id, message_id, violation_type, original_snippet)
      VALUES (NEW.sender_id, NEW.chat_id, NEW.id, v_violation_type, left(v_original_content, 50));
    END LOOP;

    SELECT COUNT(DISTINCT created_at::DATE) INTO v_violation_count
    FROM bisik_violations WHERE user_id = NEW.sender_id
    AND created_at > NOW() - INTERVAL '24 hours';

    IF v_violation_count >= 3 THEN
      INSERT INTO bisik_bans (user_id, reason, banned_until, ban_count)
      VALUES (NEW.sender_id, 'Tiga kali membagikan informasi pribadi dalam chat', NOW() + INTERVAL '3 hours', 1)
      ON CONFLICT (user_id) DO UPDATE SET
        banned_until = NOW() + INTERVAL '3 hours',
        ban_count = bisik_bans.ban_count + 1, created_at = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FK must be deferrable because trigger_mask_bisik_message runs BEFORE INSERT
-- and inserts into bisik_violations referencing NEW.id which doesn't exist yet
ALTER TABLE bisik_violations
DROP CONSTRAINT IF EXISTS bisik_violations_message_id_fkey,
ADD CONSTRAINT bisik_violations_message_id_fkey
  FOREIGN KEY (message_id) REFERENCES bisik_messages(id)
  DEFERRABLE INITIALLY DEFERRED;
