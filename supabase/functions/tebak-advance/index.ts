// Supabase Edge Function: /functions/tebak-advance/index.ts
// This function is deployed as a Supabase Edge Function and configured to run on a cron schedule.
// It is the definitive mechanism for advancing the game state, ensuring no session can get stuck.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // 1. Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date().toISOString();

    // 3a. Find and process question timeouts (self-healing for dead clients)
    const [expiredSubject, expiredGuesser] = await Promise.all([
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
    ]);

    if (expiredSubject.error) throw new Error(`Timeout query error: ${expiredSubject.error.message}`);
    if (expiredGuesser.error) throw new Error(`Timeout query error: ${expiredGuesser.error.message}`);

    const expiredIds = [
      ...(expiredSubject.data ?? []).map(q => q.id),
      ...(expiredGuesser.data ?? []).map(q => q.id),
    ];

    if (expiredIds.length > 0) {
      const timeoutResults = await Promise.all(
        expiredIds.map(id => supabaseAdmin.rpc("handle_question_timeout", { p_question_id: id }))
      );
      const failedTimeouts = timeoutResults.filter(r => r.error);
      if (failedTimeouts.length > 0) {
        console.error("Some timeouts failed:", failedTimeouts);
      }
      console.log(`Processed ${expiredIds.length} timeouts. Success: ${expiredIds.length - failedTimeouts.length}, Failed: ${failedTimeouts.length}.`);
    }

    // 3b. Query for all game sessions that are due for advancement
    const { data: sessionsToAdvance, error: queryError } = await supabaseAdmin
      .from("tebak_sessions")
      .select("id, current_q_seq")
      .eq("status", "active")
      .lt("advance_at", now);

    if (queryError) {
      throw new Error(`Failed to query for sessions: ${queryError.message}`);
    }

    // 4. For each due session, call the advance_tebak_game RPC
    const advanceResults = sessionsToAdvance && sessionsToAdvance.length > 0
      ? await Promise.all(
          sessionsToAdvance.map(session =>
            supabaseAdmin.rpc("advance_tebak_game", {
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

    const timeoutCount = expiredIds.length;
    const advanceCount = sessionsToAdvance?.length ?? 0;
    const message = `Timeouts: ${timeoutCount} (failed: ${(expiredIds.length > 0 ? advanceResults.filter(r => r.error).length : 0)}), Advances: ${advanceCount} (failed: ${failedAdvances.length}).`;
    console.log(message);

    // 5. Return a success response
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
