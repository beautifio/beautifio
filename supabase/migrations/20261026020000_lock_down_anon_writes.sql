-- SECURITY FIX: 12 tables in `public` had RLS disabled while granting `anon` (and
-- `authenticated`) full privileges — including UPDATE, DELETE and TRUNCATE. The anon key
-- is public (baked into the browser bundle), so anyone on the internet could wipe or
-- forge these tables. Notably `daily_counters` backs the tier rate limits
-- (maxChatsPerWeek / maxTebakPerDay in lib/tier.ts), so resetting it bypassed paid plans.
--
-- Each grant below was decided from how the app actually uses the table, so no feature
-- loses access it relies on:

-- (1) Not reached from client code at all. `daily_counters` is written only by the
--     SECURITY DEFINER function next_counter(), which ignores these grants.
--     `content_tags` is unused — the app reads app_settings WHERE key='content_tags'.
REVOKE ALL ON public.daily_counters               FROM anon, authenticated;
REVOKE ALL ON public.tebak_questions_for_guesser  FROM anon, authenticated;
REVOKE ALL ON public.ref_cities                   FROM anon, authenticated;
REVOKE ALL ON public.ref_provinces                FROM anon, authenticated;
REVOKE ALL ON public.industry_templates           FROM anon, authenticated;
REVOKE ALL ON public.content_tags                 FROM anon, authenticated;

-- (2) Client only reads these (bisik anonymous-name words, region pickers in
--     profil/edit, tebak media in JedaScreen/RoundResultScreen). Keep SELECT, drop writes.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.bisik_name_words     FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.indonesia_provinces  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.indonesia_regencies  FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.media_assets         FROM anon, authenticated;

-- (3) lib/engine/dedup.ts both reads and inserts here. Keep those, drop the rest.
REVOKE UPDATE, DELETE, TRUNCATE ON public.content_suggestions FROM anon, authenticated;

-- (4) Holds who invited whom in the private "bisik" feature, so it needs real RLS
--     rather than only tighter grants. Policies mirror bisik_chats/bisik_messages and
--     the access paths in lib/tebak/bisik-bridge.ts. expire_bisik_invites() is
--     SECURITY DEFINER, so the expiry job keeps working.
ALTER TABLE public.bisik_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view own invites" ON public.bisik_invites;
CREATE POLICY "Participants can view own invites"
  ON public.bisik_invites FOR SELECT
  USING (auth.uid() = from_user OR auth.uid() = to_user);

DROP POLICY IF EXISTS "Senders can create invites" ON public.bisik_invites;
CREATE POLICY "Senders can create invites"
  ON public.bisik_invites FOR INSERT
  WITH CHECK (auth.uid() = from_user);

DROP POLICY IF EXISTS "Participants can respond to invites" ON public.bisik_invites;
CREATE POLICY "Participants can respond to invites"
  ON public.bisik_invites FOR UPDATE
  USING (auth.uid() = from_user OR auth.uid() = to_user)
  WITH CHECK (auth.uid() = from_user OR auth.uid() = to_user);

REVOKE DELETE, TRUNCATE ON public.bisik_invites FROM anon, authenticated;
