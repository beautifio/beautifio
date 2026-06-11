"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

export async function signUpAction(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (signUpError) {
    const message = translateAuthError(signUpError.message);
    return { error: message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signInAction(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const message = translateAuthError(error.message);
    return { error: message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function signOutAction(): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: "Gagal keluar. Silakan coba lagi." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function resetPasswordAction(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) {
    return { error: "Gagal mengirim email reset. Silakan coba lagi." };
  }

  return { success: true };
}

function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email atau password salah",
    "Email not confirmed": "Email belum dikonfirmasi. Cek inbox kamu.",
    "User already registered": "Email sudah terdaftar",
    "Password should be at least 6 characters":
      "Password minimal 6 karakter",
    "Unable to validate email address: invalid format":
      "Format email tidak valid",
    "Email rate limit exceeded": "Terlalu banyak percobaan. Coba lagi nanti.",
    "Signup requires a valid password": "Password harus diisi",
  };

  return map[message] || message;
}
