const { chromium } = require("playwright");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const fs = require("fs");

const BASE = "http://localhost:3458";
const SCREENSHOTS = "/home/taradfs/screenshots";
const SUPABASE_URL = "https://sivltqvqkbaykuazwdja.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdmx0cXZxa2JheWt1YXp3ZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjM3MTksImV4cCI6MjA5NjU5OTcxOX0.EQHzjHuaFRL6JcDuM4H8O0qxXemtJxVWoG_Y3FZ9ZLc";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdmx0cXZxa2JheWt1YXp3ZGphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTAyMzcxOSwiZXhwIjoyMDk2NTk5NzE5fQ.YGiMysDUHYKCKRVv8ExOVRoYIDv32Xfx5sP-5y9_vts";

const SNAP_LIBS = "/snap/code/current/usr/lib/x86_64-linux-gnu";
if (fs.existsSync(SNAP_LIBS)) process.env.LD_LIBRARY_PATH = SNAP_LIBS;

fs.mkdirSync(SCREENSHOTS, { recursive: true });

let userId = null;

function shot(page, name) {
  return page.screenshot({ path: path.join(SCREENSHOTS, name), fullPage: true, timeout: 10000 });
}

(async () => {
  // ─── CREATE ANONYMOUS USER ───
  console.log("\n=== SETUP: Create anonymous user ===");
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: signInData, error: signInErr } = await supabase.auth.signInAnonymously();
  if (signInErr) throw new Error("signInAnonymously: " + signInErr.message);
  userId = signInData.user.id;
  console.log("  User ID:", userId);

  // Create journey data
  const journeySlug = "football-player-" + userId.substring(0, 8);
  const { data: jData, error: jErr } = await supabase
    .from("dream_journeys")
    .insert({
      user_id: userId, template_slug: "football-player", slug: journeySlug,
      title: "Pemain Sepak Bola Profesional", emoji: "⚽", category: "sports",
      status: "active", started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (jErr) console.log("  Journey insert error:", jErr.message);
  const journeyId = jData?.id;
  console.log("  Journey ID:", journeyId);

  if (journeyId) {
    const { error: pe } = await supabase.from("dream_phases").insert([
      { journey_id: journeyId, phase_index: 0, title: "Fase 1: Dasar", status: "active" },
      { journey_id: journeyId, phase_index: 1, title: "Fase 2: Latihan", status: "locked" },
    ]);
    if (pe) console.log("  Phase insert error:", pe.message);
  }

  const session = {
    access_token: signInData.session.access_token,
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: signInData.session.refresh_token,
    user: signInData.user,
  };
  const cookieVal = "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");

  function injectAuth(page, cb) {
    return page.evaluate((val) => {
      document.cookie = "sb-sivltqvqkbaykuazwdja-auth-token=" + encodeURIComponent(val) + "; path=/; max-age=3600; samesite=lax";
    }, cookieVal).then(cb);
  }

  // ─── LAUNCH BROWSER ───
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: "id-ID" });
  const page = await context.newPage();

  // ──────────────────────────────────────────────────
  // TEST 1: Landing page → click template → guest flow
  // ──────────────────────────────────────────────────
  console.log("\n=== TEST 1: Fresh guest flow ===");
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot(page, "01-landing.png");
  console.log("  01-landing.png ✓");

  // Inject auth cookie manually (signInAnonymously from app has localStorage bug)
  await injectAuth(page);

  // Also set localStorage for client-side
  await page.evaluate((s) => {
    localStorage.setItem("sb-sivltqvqkbaykuazwdja-auth-token", JSON.stringify(s));
    localStorage.setItem("pending_template", "football-player");
  }, session);

  // Set the auth cookie for middleware
  await page.evaluate((val) => {
    document.cookie = "sb-sivltqvqkbaykuazwdja-auth-token=" + encodeURIComponent(val) + "; path=/; max-age=3600; samesite=lax";
  }, cookieVal);

  // Navigate to journey (simulating the app's redirect after guest signup)
  await page.goto(BASE + "/journey", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await shot(page, "02-after-signup.png");
  console.log("  02-after-signup.png ✓");

  // ──────────────────────────────────────────────────
  // TEST 2: Journey detail with trial banner
  // ──────────────────────────────────────────────────
  console.log("\n=== TEST 2: Journey detail with trial banner ===");
  if (journeyId) {
    await injectAuth(page);
    await page.goto(BASE + "/journey/" + journeyId, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    console.log("  Journey detail URL:", page.url());
    await shot(page, "03-journey-detail.png");
    console.log("  03-journey-detail.png ✓");
  }

  // ──────────────────────────────────────────────────
  // TEST 3: Profil page / guest indicator
  // ──────────────────────────────────────────────────
  console.log("\n=== TEST 3: Profil with guest card ===");
  await injectAuth(page);
  await page.goto(BASE + "/profil", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await shot(page, "04-profil.png");
  console.log("  04-profil.png ✓");

  // ──────────────────────────────────────────────────
  // TEST 4: /profil/settings (blocked for anonymous)
  // ──────────────────────────────────────────────────
  console.log("\n=== TEST 4: /profil/settings (blocked) ===");
  await injectAuth(page);
  await page.goto(BASE + "/profil/settings", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await shot(page, "05-settings-blocked.png");
  console.log("  05-settings-blocked.png ✓");
  console.log("  Settings URL:", page.url());

  // ──────────────────────────────────────────────────
  // TEST 5: Simulate trial expired
  // ──────────────────────────────────────────────────
  console.log("\n=== TEST 5: Trial expired ===");
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
  await adminClient.from("users").update({ trial_expires_at: new Date(Date.now() - 60000).toISOString() }).eq("id", userId);
  console.log("  Trial expired in DB");

  await injectAuth(page);
  await page.goto(BASE + "/journey", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await shot(page, "06-trial-expired.png");
  console.log("  06-trial-expired.png ✓");
  console.log("  URL after trial expired:", page.url());

  // Show /trial-expired page directly
  await page.goto(BASE + "/trial-expired", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot(page, "07-trial-expired-page.png");
  console.log("  07-trial-expired-page.png ✓");

  // Restore trial for upgrade test
  await adminClient.from("users").update({ trial_expires_at: new Date(Date.now() + 86400000 * 3).toISOString() }).eq("id", userId);

  // ──────────────────────────────────────────────────
  // TEST 6: Upgrade registration
  // ──────────────────────────────────────────────────
  console.log("\n=== TEST 6: Upgrade flow ===");
  // Go to register with upgrade=true (but we need to maintain the session)
  await injectAuth(page);
  await page.goto(BASE + "/register?upgrade=true", { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await shot(page, "08-register-upgrade.png");
  console.log("  08-register-upgrade.png ✓");

  // Fill registration form
  const emailInput = await page.$('input[type="email"], input[name="email"]');
  if (emailInput) {
    await emailInput.fill("e2e-" + userId.substring(0, 8) + "@test.com");
    console.log("  Filled email");
  }
  const pwdInput = await page.$('input[type="password"], input[name="password"]');
  if (pwdInput) {
    await pwdInput.fill("Testing123!");
    console.log("  Filled password");
  }
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(6000);
    console.log("  Submitted registration");
  }

  await page.waitForTimeout(3000);
  await shot(page, "09-after-upgrade.png");
  console.log("  09-after-upgrade.png ✓");
  console.log("  Final URL:", page.url());

  // ──────────────────────────────────────────────────
  // VERIFICATION
  // ──────────────────────────────────────────────────
  console.log("\n=== VERIFICATION QUERY ===");
  const { data: dbUser } = await adminClient
    .from("users")
    .select("id, is_anonymous, trial_expires_at, email")
    .eq("id", userId)
    .single();
  console.log("  DB user:", JSON.stringify(dbUser, null, 2));

  // Cleanup
  if (journeyId) {
    await supabase.from("dream_phases").delete().eq("journey_id", journeyId);
    await supabase.from("dream_journeys").delete().eq("id", journeyId);
  }
  await adminClient.from("users").delete().eq("id", userId);
  console.log("  Test user cleaned up");

  await browser.close();
  console.log("\n=== ALL TESTS COMPLETE ===");
})();
