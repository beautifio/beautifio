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

  // The `on_auth_user_created` trigger (handle_new_user) creates the public.users
  // profile from this metadata — do not insert the row here.
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "Email sudah terdaftar." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signInAction(
  email: string,
  password: string
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Email atau password salah" };

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOutAction(): Promise<AuthResult> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  return { success: true };
}

export async function resetPasswordAction(email: string): Promise<AuthResult> {
  const supabase = await createClient();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}
