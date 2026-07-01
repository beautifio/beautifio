-- Migration: get_user_disc_profile RPC
-- Single-query DISC profile: per-answer accumulation, alphabetical tie-breaker, finished games only.

CREATE OR REPLACE FUNCTION get_user_disc_profile(p_user_id uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH disc_answers AS (
    SELECT ta.answer
    FROM tebak_answers ta
    JOIN tebak_questions tq ON tq.id = ta.question_id
    JOIN tebak_rounds tr ON tr.id = tq.round_id
    JOIN tebak_sessions ts ON ts.id = tr.session_id
    WHERE ta.guesser_id = p_user_id
      AND tr.round_type = 'disc'
      AND ts.status = 'finished'
  ),
  dim_counts AS (
    SELECT answer, COUNT(*)::int AS cnt
    FROM disc_answers
    WHERE answer IN ('D', 'I', 'S', 'C')
    GROUP BY answer
  ),
  total_games AS (
    SELECT COUNT(*)::int AS cnt
    FROM tebak_sessions
    WHERE (player_a_id = p_user_id OR player_b_id = p_user_id)
      AND status = 'finished'
  )
  SELECT jsonb_build_object(
    'game_count', COALESCE((SELECT cnt FROM total_games), 0),
    'scores', COALESCE(
      (SELECT jsonb_object_agg(answer, cnt) FROM dim_counts),
      '{}'::jsonb
    ),
    'primary', (SELECT to_jsonb(t) FROM (
      SELECT answer AS key,
        CASE answer
          WHEN 'D' THEN 'Dominance' WHEN 'I' THEN 'Influence'
          WHEN 'S' THEN 'Steadiness' WHEN 'C' THEN 'Conscientiousness'
        END AS label,
        CASE answer
          WHEN 'D' THEN 'Tegas, kompetitif, berorientasi hasil'
          WHEN 'I' THEN 'Antusias, persuasif, suka bersosialisasi'
          WHEN 'S' THEN 'Sabar, stabil, pendengar yang baik'
          WHEN 'C' THEN 'Teliti, sistematis, berorientasi detail'
        END AS "desc",
        CASE answer
          WHEN 'D' THEN '🦁' WHEN 'I' THEN '🦜'
          WHEN 'S' THEN '🐢' WHEN 'C' THEN '🦉'
        END AS emoji,
        cnt
      FROM dim_counts
      ORDER BY cnt DESC, answer ASC
      LIMIT 1
    ) t),
    'secondary', (SELECT to_jsonb(t) FROM (
      SELECT answer AS key,
        CASE answer
          WHEN 'D' THEN 'Dominance' WHEN 'I' THEN 'Influence'
          WHEN 'S' THEN 'Steadiness' WHEN 'C' THEN 'Conscientiousness'
        END AS label,
        CASE answer
          WHEN 'D' THEN 'Tegas, kompetitif, berorientasi hasil'
          WHEN 'I' THEN 'Antusias, persuasif, suka bersosialisasi'
          WHEN 'S' THEN 'Sabar, stabil, pendengar yang baik'
          WHEN 'C' THEN 'Teliti, sistematis, berorientasi detail'
        END AS "desc",
        CASE answer
          WHEN 'D' THEN '🦁' WHEN 'I' THEN '🦜'
          WHEN 'S' THEN '🐢' WHEN 'C' THEN '🦉'
        END AS emoji,
        cnt
      FROM dim_counts
      ORDER BY cnt DESC, answer ASC
      LIMIT 1 OFFSET 1
    ) t)
  );
$$;
