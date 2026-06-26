// Supabase Edge Function: /functions/tebak-advance/index.ts
// This function is deployed as a Supabase Edge Function and configured to run on a cron schedule.
// It is the definitive mechanism for advancing the game state, ensuring no session can get stuck.
//
// DISC R1-2: timeout queries handle both 'both_answering' (DISC) and
// 'subject_answering'/'guesser_guessing' (tebak R3-4) statuses.
// Advance uses advance_tebak_game_v2 which handles DISC and tebak rounds.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date().toISOString();

    // ═══════════════════════════════════════════════════════════════
    // TIMEOUTS — jalankan DULU sebelum advance
    // ═══════════════════════════════════════════════════════════════
    // Tiga kategori: subject_answering (tebak), guesser_guessing (tebak),
    // both_answering (DISC). Semua diproses sebelum advance agar
    // soal yang timeout bisa di-reveal dan set advance_at.
    const [expiredSubject, expiredGuesser, expiredDisc] = await Promise.all([
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

    if (expiredSubject.error) throw new Error(`Timeout query error: ${expiredSubject.error.message}`);
    if (expiredGuesser.error) throw new Error(`Timeout query error: ${expiredGuesser.error.message}`);
    if (expiredDisc.error) throw new Error(`Timeout query error: ${expiredDisc.error.message}`);

    // Tebak timeouts (R3-4)
    const tebakExpiredIds = [
      ...(expiredSubject.data ?? []).map(q => q.id),
      ...(expiredGuesser.data ?? []).map(q => q.id),
    ];

    if (tebakExpiredIds.length > 0) {
      const timeoutResults = await Promise.all(
        tebakExpiredIds.map(id => supabaseAdmin.rpc("handle_question_timeout", { p_question_id: id }))
      );
      const failedTimeouts = timeoutResults.filter(r => r.error);
      if (failedTimeouts.length > 0) {
        console.error("Some tebak timeouts failed:", failedTimeouts);
      }
    }

    // DISC timeouts (R1-2)
    const discExpiredIds = (expiredDisc.data ?? []).map(q => q.id);
    if (discExpiredIds.length > 0) {
      const discResults = await Promise.all(
        discExpiredIds.map(id => supabaseAdmin.rpc("handle_disc_timeout", { p_question_id: id }))
      );
      const failedDisc = discResults.filter(r => r.error);
      if (failedDisc.length > 0) {
        console.error("Some DISC timeouts failed:", failedDisc);
      }
    }

    const totalTimeouts = tebakExpiredIds.length + discExpiredIds.length;

    // ═══════════════════════════════════════════════════════════════
    // ADVANCE — proses setelah timeout
    // ═══════════════════════════════════════════════════════════════
    const { data: sessionsToAdvance, error: queryError } = await supabaseAdmin
      .from("tebak_sessions")
      .select("id, current_q_seq")
      .eq("status", "active")
      .lt("advance_at", now);

    if (queryError) {
      throw new Error(`Failed to query for sessions: ${queryError.message}`);
    }

    const advanceResults = sessionsToAdvance && sessionsToAdvance.length > 0
      ? await Promise.all(
          sessionsToAdvance.map(session =>
            supabaseAdmin.rpc("advance_tebak_game_v2", {
              p_session_id: session.id,
              p_expected_seq: session.current_q_seq,
            })
          )
        )
      : [];

    const failedAdvances = advanceResults.filter(res => res.error);
    if (failedAdvances.length > 0) {
      console.error("Some advances failed:", failedAdvances);
    }

    const advanceCount = sessionsToAdvance?.length ?? 0;
    const message = `Timeouts: ${totalTimeouts} (tebak: ${tebakExpiredIds.length}, disc: ${discExpiredIds.length}), Advances: ${advanceCount} (failed: ${failedAdvances.length}).`;
    console.log(message);

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Cron job error:", err);
    return new Response(String(err?.message ?? err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
