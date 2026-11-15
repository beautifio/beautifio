"use server";

import { createClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/auth/session";
import { hashPassword, comparePassword } from "@/lib/auth/password";
import { getServerUser } from "@/lib/auth/server-auth";
import { emailReady, sendMail, resetPasswordEmailHtml } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { randomBytes, createHash, randomUUID } from "crypto";

export interface AuthResult {
  error?: string;
  success?: boolean;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

/**
 * Custom JWT sign up: create users row with hashed password, then create session.
 * Replaces supabase.auth.signUp.
 */
export async function signUpAction(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  const supabase = await createClient();

  // Check if email already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  const passwordHash = await hashPassword(password);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase(),
      full_name: fullName,
      password_hash: passwordHash,
      role: "user",
      status: "active",
      is_verified: false,
      onboarding_completed: false,
    })
    .select("id, email, full_name, role")
    .single();

  if (error) {
    return { error: error.message };
  }

  // createSession sets the httpOnly bf_session cookie (jose JWT).
  await createSession(user.id, user.role);

  revalidatePath("/", "layout");
  return { success: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } };
}

/**
 * Custom JWT sign in: verify email+password against users table, then create session.
 * Replaces supabase.auth.signInWithPassword.
 */
export async function signInAction(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, full_name, password_hash, role, status")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error || !user) {
    return { error: "Email atau password salah" };
  }

  if (user.status === "banned") {
    return { error: "Akun telah diperhentikan." };
  }

  if (!user.password_hash) {
    return { error: "Akun tidak memiliki kata sandi. Gunakan login dengan Google." };
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return { error: "Email atau password salah" };
  }

  await createSession(user.id, user.role);

  revalidatePath("/", "layout");
  return { success: true, user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role } };
}

/**
 * Custom JWT sign out: destroy session cookie.
 * Replaces supabase.auth.signOut.
 */
export async function signOutAction(): Promise<AuthResult> {
  const { destroySession } = await import("@/lib/auth/session");
  await destroySession();
  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Custom JWT "forgot password": create a one-time reset token and email the
 * link. Always reports success to avoid leaking which emails are registered.
 * Replaces supabase.auth.resetPasswordForEmail.
 *
 * - Dev: returns `deliveryUrl` so the flow is testable without an SMTP server.
 * - Production: sends via SMTP when configured; `emailSent` tells the UI whether
 *   delivery actually happened, so it can show an honest message instead of a
 *   misleading "check your inbox".
 */
export async function resetPasswordAction(
  email: string
): Promise<AuthResult & { deliveryUrl?: string; emailSent?: boolean }> {
  const supabase = await createClient();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (!user) return { success: true, emailSent: false };

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await supabase.from("password_reset_tokens").insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://beautifio.com";
  const link = `${siteUrl}/reset-password?token=${rawToken}`;

  if (process.env.NODE_ENV !== "production") {
    return { success: true, deliveryUrl: link };
  }

  let sent = false;
  if (emailReady()) {
    sent = await sendMail({
      to: email,
      subject: "Atur ulang password Beautifio",
      html: resetPasswordEmailHtml(link),
    });
  }
  if (!sent) {
    console.warn("[auth] reset token dibuat tapi email tidak terkirim (SMTP belum aktif)");
  }
  // Never expose the raw token to the browser in production.
  return { success: true, emailSent: sent };
}

/** Complete a password reset using a one-time token from the email link. */
export async function resetPasswordWithTokenAction(
  token: string,
  newPassword: string
): Promise<AuthResult> {
  if (!token) return { error: "Token reset tidak valid." };
  if (!newPassword || newPassword.length < 8) return { error: "Password minimal 8 karakter." };

  const supabase = await createClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: reset } = await supabase
    .from("password_reset_tokens")
    .select("id, user_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!reset || reset.used_at || new Date(reset.expires_at) < new Date()) {
    return { error: "Token reset tidak valid atau sudah kedaluwarsa." };
  }

  const passwordHash = await hashPassword(newPassword);
  const { error: updateErr } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", reset.user_id);
  if (updateErr) return { error: "Gagal menyimpan password baru." };

  await supabase
    .from("password_reset_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", reset.id);

  return { success: true };
}

/** Change password for a signed-in user (verifies the current password). */
export async function changePasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<AuthResult> {
  if (!newPassword || newPassword.length < 8) return { error: "Password baru minimal 8 karakter." };

  const user = await getServerUser();
  if (!user) return { error: "Sesi tidak valid. Silakan login ulang." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", user.id)
    .single();

  if (!row?.password_hash) return { error: "Akun ini login dengan Google, tidak punya password." };

  const valid = await comparePassword(currentPassword, row.password_hash);
  if (!valid) return { error: "Password saat ini salah." };

  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", user.id);
  if (error) return { error: "Gagal menyimpan password baru." };

  return { success: true };
}

/**
 * Ensure the visitor has a session by creating a guest user when needed.
 * Replaces supabase.auth.signInAnonymously() on the landing page.
 */
export async function ensureGuestSession(): Promise<AuthResult> {
  const existing = await getServerUser();
  if (existing) return { success: true };

  const supabase = await createClient();
  const guestId = randomUUID();
  const { data: guest, error } = await supabase
    .from("users")
    .insert({
      id: guestId,
      email: `guest-${guestId}@beautifio.local`,
      full_name: "Tamu",
      role: "user",
      status: "active",
      is_verified: false,
      onboarding_completed: false,
      password_hash: null,
    })
    .select("id, role")
    .single();

  if (error || !guest) return { error: "Gagal memulai sesi tamu." };

  await createSession(guest.id, guest.role);
  revalidatePath("/", "layout");
  return { success: true };
}

/** Get the currently authenticated user (custom JWT). Replaces supabase.auth.getUser(). */
export async function getCurrentUserAction() {
  return getServerUser();
}
