# Tebak Aku — Game Plan

## Game Concept
Dua pemain saling "menebak" dalam 2 round. Setiap round:
- **Subject** (penjawab pertama) mendapat pertanyaan pribadi, memilih jawaban.
- **Guesser** (penebak) harus menebak jawaban subject dalam 15 detik.
- Cocok = subject + guesser sama-sama dapat poin.
- Round 2: peran bertukar.

Total 5 pertanyaan per round × 2 round = 10 pertanyaan per game.

---

## Architecture

### Stack
- Next.js 15 App Router (`'use server'` actions, client components)
- Supabase (Postgres + Realtime)
- Vercel deploy

### Database Tables
- `tebak_sessions` — game session, scores, status, current_subject
- `tebak_rounds` — rounds per session (max 2)
- `tebak_questions` — questions per round (5 each), status, deadlines
- `tebak_answers` — guesser answers per question
- `tebak_question_bank` — master question pool (is_active flag)
- `users` — player profiles, is_bot flag

### Game State Flow
```
waiting → active → finished

Dalam active:
  round → subject_answering (subject pilih jawaban, 20s)
        → guesser_guessing (guesser tebak, 15s)
        → revealed (hasil ditampilkan)
        → next question / next round / finished
```

---

## Completed Features

### Matchmaking
- [x] Queue system: `find_or_create_tebak_session` RPC (atomic, race-condition safe)
- [x] Bot matching: `matchWithBot`, bot plays as opponent
- [x] Retry matchmaking: `retryMatchmaking` — delete old session, join another
- [x] TebakWaiting screen: 2s retry, 10s timeout → match with bot
- [x] Disconnect detection: heartbeat every 30s, 5min inactivity → replace with bot
- [x] Session merge: Realtime payload merged with previous state via `handleMatched`

### Invisible Bots
- [x] Bot users seeded with female Indonesian names + DiceBear avatars
- [x] `is_bot` flag internal only — never shown in UI
- [x] Bot auto-play via `botPlayTurn` action (2-4s delay, configurable win rate)
- [x] No "bot" text/icons anywhere (banner, spinner, labels, waiting screen)
- [x] Opponent real name shown instead of generic "Lawan"

### UI Components
- [x] **MatchIntro**: 5.6s ceremony — PERTANDINGAN title, VS slide, countdown 5→1 (accelerating), MULAI!
- [x] **ScoreBoard**: TV sports broadcast style — dark bg, monospace scores, player names, penalty dots
- [x] **DigitalClock**: Premium LED-style countdown with glow, blinking colon, red pulse ≤5s
- [x] **Timer.tsx**: Wrapper around DigitalClock
- [x] **QuestionView**: Premium card with gradient top bar, option buttons, result reveal
- [x] **ResultScreen**: Score display + kecocokan bar (kurang cocok → soulmate)

### Timers & Timeouts
- [x] **Subject deadline**: 20s countdown via `subject_deadline` column
- [x] **Guesser deadline**: 15s countdown via `guesser_deadline` column
- [x] **Guesser lock-on-timeout**: Tap = select, timer expiry = lock + auto-submit
- [x] **Subject timeout**: No answer in 20s → guesser gets +10, question auto-reveals
- [x] **Bot auto-play**: Responds within 2-4s (simulates human)

### Game Flow
- [x] Questions load after MatchIntro finishes (`handleBegin` → `refreshQuestions`)
- [x] Realtime subscription: session + question + answer updates
- [x] Client-side question filtering via `roundIdsRef` (avoids unsupported subquery in Realtime)
- [x] `advanceGame`: checks all questions revealed → next question / next round / finish
- [x] `switch_tebak_subject` RPC: swap roles for round 2

### Backend
- [x] `increment_tebak_score` RPC (dynamic column name)
- [x] `find_or_create_tebak_session` RPC (atomic session + question insert)
- [x] `activate_tebak_session` RPC (bot join + question insert)
- [x] `switch_tebak_subject` RPC (enum-safe cast)
- [x] `selectQuestionsForRound` — picks 5 random active questions

---

## Remaining Work / Improvements

### Priority
- [] **Penalty dots for subject timeout**: When subject times out, show a red ○ for that question (currently no dot shown since no `tebak_answers` row created)
- [] **ResultScreen — subject timeout message**: When question ends due to subject timeout, the guesser sees "Lawan sudah menjawab" but actually opponent didn't answer — should show "Lawan kehabisan waktu" instead
- [] **Bot subject deadline awareness**: Bot as subject should respect deadline (currently responds in 2-4s, but if delayed >20s, should trigger timeout path)

### Polish
- [] **Sound effects**: Tick sound for countdown, correct/wrong answer sound
- [] **Animations**: Option selection bounce, score increment animation, screen shake on timeout
- [] **Leaderboard**: Current page exists but uses static data
- [] **Rematch button**: After game finishes, option to play again with same opponent
- [] **Abandon game**: If both players leave, auto-cleanup stale sessions

### Edge Cases
- [] **Both players timeout simultaneously**: Very rare but possible — both timers fire, first one wins
- [] **Race condition**: Subject answers + timeout at same time — handled by `status !== 'subject_answering'` check in `handleSubjectTimeout` (action is idempotent)
- [] **Browser tab hidden**: requestAnimationFrame-based DigitalClock pauses when tab hidden — `Timer` uses `setInterval` instead (more reliable)

---

## Key Files
| File | Purpose |
|------|---------|
| `apps/web/src/lib/tebak/actions.ts` | All server actions (join, match, answer, timeout, advance) |
| `apps/web/src/lib/tebak/realtime.ts` | Supabase Realtime subscription setup |
| `apps/web/src/lib/tebak/queries.ts` | TypeScript types (TebakSession, TebakQuestion, etc.) |
| `apps/web/src/lib/tebak/bot.ts` | Bot IDs + win rate config |
| `apps/web/src/components/tebak/GameRoom.tsx` | Main game controller + QuestionView + ResultScreen |
| `apps/web/src/components/tebak/DigitalClock.tsx` | Premium LED countdown display |
| `apps/web/src/components/tebak/Timer.tsx` | Wrapper around DigitalClock |
| `apps/web/src/components/tebak/ScoreBoard.tsx` | Scoreboard + penalty dots |
| `apps/web/src/components/tebak/MatchIntro.tsx` | Pre-game ceremony |
| `apps/web/src/components/tebak/TebakWaiting.tsx` | Matchmaking waiting screen |
| `apps/web/src/app/(app)/tebak/[sessionId]/page.tsx` | Session page wrapper |
| `supabase/migrations/20260620009000_tebak_aku.sql` | Core tables + functions |
| `supabase/migrations/20260622142800_tebak_bots.sql` | Bot seed (male — superseded) |
| `supabase/migrations/20260622000000_bot_female_names.sql` | Bot rename to female names |
| `supabase/migrations/20260622142900_tebak_select_questions_in_rpc.sql` | Atomic question select in RPC |
| `supabase/migrations/20260622000001_subject_deadline.sql` | Subject 20s deadline |
