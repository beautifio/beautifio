CREATE OR REPLACE FUNCTION care_insert_ai_message(
  p_session_id uuid,
  p_sender_id uuid,
  p_content text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO care_chat_messages (session_id, sender_id, sender_role, content, is_read)
  VALUES (p_session_id, p_sender_id, 'officer', p_content, false);
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION care_close_session(
  p_session_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE care_chat_sessions SET status = 'closed' WHERE id = p_session_id;
  RETURN true;
END;
$$;
