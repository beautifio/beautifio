-- ============================================================================
-- 00032_backfill_activities_action_type.sql
-- Beautifio — Backfill existing daily_activities with engine fields
-- ============================================================================

-- Helper: extract keywords from title (mirrors TypeScript extractKeywords)
CREATE OR REPLACE FUNCTION extract_activity_keywords(p_title TEXT)
RETURNS TEXT[] AS $$
DECLARE
  words TEXT[];
  result TEXT[] := '{}';
  w TEXT;
  stop_words TEXT[] := ARRAY[
    'dan','di','ke','dari','yang','ini','itu','dengan',
    'untuk','pada','adalah','akan','telah','bisa','dapat',
    'hari','baru','satu','dalam','setiap','atau',
    'luangkan','waktu','tulis','buat','catat','baca','lihat',
    'pelajari','lakukan','jangan','tidak','minum','makan',
    'sapa','bagikan','bantu','selesaikan','tunda','latihan'
  ];
BEGIN
  -- Remove leading numbers/times
  p_title := regexp_replace(p_title, '^[\d\s:,-]+', '');

  -- Split into words
  words := regexp_split_to_array(lower(trim(p_title)), E'[\\s,()]+');

  FOREACH w IN ARRAY words LOOP
    w := regexp_replace(w, '[^a-z0-9]', '', 'g');
    IF length(w) > 2 AND NOT (w = ANY(stop_words)) THEN
      result := array_append(result, w);
    END IF;
  END LOOP;

  IF array_length(result, 1) IS NULL THEN
    result := ARRAY[substring(lower(trim(p_title)) FROM 1 FOR 20)];
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update action_type based on dimension
UPDATE daily_activities
SET action_type = CASE dimension
    WHEN 'knowledge' THEN 'read_article'
    WHEN 'social' THEN 'comment_curhat'
    WHEN 'dream_skill' THEN 'read_article'
    ELSE 'manual'
  END,
  match_keywords = CASE
    WHEN dimension IN ('knowledge', 'social', 'dream_skill')
    THEN extract_activity_keywords(title)
    ELSE '{}'::TEXT[]
  END
WHERE action_type = 'manual'
  AND activity_date >= CURRENT_DATE - INTERVAL '30 days';
