import { createClient } from "@/lib/supabase/server"

type NotifType =
  | "member_joined" | "member_left" | "member_banned"
  | "circle_new_question" | "circle_question_answered" | "circle_cohost_promoted"
  | "bisik_new_match" | "bisik_new_message"
  | "tebak_match" | "tebak_result" | "tebak_rematch"
  | "curhat_comment" | "curhat_reaction"
  | "care_new_session" | "care_closed" | "care_new_message"
  | "event_confirmed" | "event_pending" | "event_rejected" | "event_cancelled"
  | "subscription_active" | "subscription_expiring"
  | "journey_milestone" | "familia_achievement" | "voucher_claimed"
  | "circle_approved" | "circle_rejected" | "circle_mention"
  | "inspirasi_mention" | "tanya_answer"
  | "attachment_reported"
  | "event" | "promo" | "recommendation" | "info"

export async function insertNotification(params: {
  userId: string
  type: NotifType
  title: string
  body?: string
  data?: Record<string, any>
}): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body || null,
    data: params.data || {},
    is_read: false,
  })
  if (error) console.error("insertNotification error:", error)
}

export type { NotifType }
