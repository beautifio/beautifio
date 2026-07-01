// Supabase Edge Function: /functions/tebak-advance/index.ts
// This function is deployed as a Supabase Edge Function and configured to run on a cron schedule.
// It is the definitive mechanism for advancing the game state, ensuring no session can get stuck.
//
// DISC R1-2: timeout queries handle both 'both_answering' (DISC) and
// 'subject_answering'/'guesser_guessing' (tebak R3-4) statuses.
// Advance uses advance_tebak_game_v2 which handles DISC and tebak rounds.
//
// ERROR ISOLATION: each processing block (tebak timeout, DISC timeout, advance)
// is wrapped in its own try/catch with Promise.allSettled so that failure in one
// block does not prevent the others from executing.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const now = new Date().toISOString();
  let tebakExpiredCount = 0;
  let discExpiredCount = 0;
  let tebakTimeoutFailed = 0;
  let discTimeoutFailed = 0;
  let advanceFailed = 0;
  let advanceCount = 0;

  // ═══════════════════════════════════════════════════════════════
  // QUERY — expired questions (all three statuses)
  // ═══════════════════════════════════════════════════════════════
  let expiredSubject: { data: { id: string }[] | null; error: any } | null = null;
  let expiredGuesser: { data: { id: string }[] | null; error: any } | null = null;
  let expiredDisc: { data: { id: string }[] | null; error: any } | null = null;

  try {
    [expiredSubject, expiredGuesser, expiredDisc] = await Promise.all([
      supabaseAdmin
        .from("tebak_questions")
        .select("id")
        .eq("status", "subject_answering")
        .not("subject_deadline", "is", null)
        .lt("subject_deadline", now),
      supabaseAdmin
        .from("tebak_questions")
        .select("id")
        .eq("status", "guesser_guessing")
        .not("guesser_deadline", "is", null)
        .lt("guesser_deadline", now),
      supabaseAdmin
        .from("tebak_questions")
        .select("id")
        .eq("status", "both_answering")
        .not("subject_deadline", "is", null)
        .lt("subject_deadline", now),
    ]);
  } catch (err) {
    console.error("Timeout query failed:", err);
    return new Response(JSON.stringify({ error: "Query failed", detail: String(err?.message ?? err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  // Log query errors individually (don't throw — a failing query shouldn't block other blocks)
  if (expiredSubject?.error) console.error("expiredSubject query error:", expiredSubject.error);
  if (expiredGuesser?.error) console.error("expiredGuesser query error:", expiredGuesser.error);
  if (expiredDisc?.error) console.error("expiredDisc query error:", expiredDisc.error);

  const subjectIds = expiredSubject?.data?.map(q => q.id) ?? [];
  const guesserIds = expiredGuesser?.data?.map(q => q.id) ?? [];
  const discIds = expiredDisc?.data?.map(q => q.id) ?? [];

  // ═══════════════════════════════════════════════════════════════
  // BLOK A — TEBAK timeouts (R3-4)
  // ═══════════════════════════════════════════════════════════════
  const tebakExpiredIds = [...subjectIds, ...guesserIds];
  tebakExpiredCount = tebakExpiredIds.length;

  if (tebakExpiredIds.length > 0) {
    try {
      const results = await Promise.allSettled(
        tebakExpiredIds.map(id => supabaseAdmin.rpc("handle_question_timeout", { p_question_id: id }))
      );
      const rejected = results.filter(r => r.status === "rejected");
      tebakTimeoutFailed = rejected.length;
      if (rejected.length > 0) {
        console.error(`tebak timeout: ${rejected.length} rejected RPC calls`);
      }
    } catch (err) {
      console.error("tebak timeout block crashed:", err);
      tebakTimeoutFailed = tebakExpiredIds.length;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOK B — DISC timeouts (R1-2)
  // ═══════════════════════════════════════════════════════════════
  discExpiredCount = discIds.length;

  if (discIds.length > 0) {
    try {
      const results = await Promise.allSettled(
        discIds.map(id => supabaseAdmin.rpc("handle_disc_timeout", { p_question_id: id }))
      );
      const rejected = results.filter(r => r.status === "rejected");
      discTimeoutFailed = rejected.length;
      if (rejected.length > 0) {
        console.error(`disc timeout: ${rejected.length} rejected RPC calls`);
      }
    } catch (err) {
      console.error("disc timeout block crashed:", err);
      discTimeoutFailed = discIds.length;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // BLOK C — ADVANCE (tebak + DISC)
  // ═══════════════════════════════════════════════════════════════
  try {
    const { data: sessionsToAdvance, error: queryError } = await supabaseAdmin
      .from("tebak_sessions")
      .select("id, current_q_seq")
      .eq("status", "active")
      .lt("advance_at", now);

    if (queryError) {
      console.error("advance query error:", queryError);
    } else if (sessionsToAdvance && sessionsToAdvance.length > 0) {
      advanceCount = sessionsToAdvance.length;
      const results = await Promise.allSettled(
        sessionsToAdvance.map(session =>
          supabaseAdmin.rpc("advance_tebak_game_v2", {
            p_session_id: session.id,
            p_expected_seq: session.current_q_seq,
          })
        )
      );
      const rejected = results.filter(r => r.status === "rejected");
      advanceFailed = rejected.length;
      if (rejected.length > 0) {
        console.error(`advance: ${rejected.length} rejected RPC calls`);
      }
    }
  } catch (err) {
    console.error("advance block crashed:", err);
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY — always 200, details in body
  // ═══════════════════════════════════════════════════════════════
  const totalTimeouts = tebakExpiredCount + discExpiredCount;
  const message = `Timeouts: ${totalTimeouts} (tebak: ${tebakExpiredCount} failed: ${tebakTimeoutFailed}, disc: ${discExpiredCount} failed: ${discTimeoutFailed}), Advances: ${advanceCount} (failed: ${advanceFailed}).`;
  console.log(message);

  return new Response(JSON.stringify({
    message,
    tebak_expired: tebakExpiredCount,
    tebak_failed: tebakTimeoutFailed,
    disc_expired: discExpiredCount,
    disc_failed: discTimeoutFailed,
    advances: advanceCount,
    advances_failed: advanceFailed,
  }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
