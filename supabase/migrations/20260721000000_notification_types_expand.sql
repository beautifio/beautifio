-- Migration: Expand notification type CHECK to include event, subscription, and care types.
-- Bug fix: 7 types were silently rejected because CHECK constraint didn't allow them.

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (
  type IN (
    'info',
    'circle_approved', 'circle_rejected', 'circle_mention',
    'inspirasi_mention', 'tanya_answer',
    'member_joined', 'member_left', 'member_banned',
    'attachment_reported',
    'event', 'event_confirmed', 'event_pending', 'event_rejected', 'event_cancelled',
    'promo', 'recommendation',
    'subscription_active', 'subscription_expiring',
    'care_new_session', 'care_closed', 'care_new_message',
    'tebak_match', 'tebak_result', 'tebak_rematch',
    'curhat_comment', 'curhat_reaction',
    'journey_milestone',
    'bisik_new_match', 'bisik_new_message',
    'circle_new_question', 'circle_question_answered',
    'circle_cohost_promoted',
    'familia_achievement', 'voucher_claimed'
  )
);
