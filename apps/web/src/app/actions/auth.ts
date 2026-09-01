"use server";

import { lucia } from "@/lib/auth/lucia";
import { db } from "@/lib/db";
import { users } from "@/lib/auth/lucia";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import argon2 from "argon2";

export interface AuthResult {
  error?: string;
  success?: boolean;
}

export async function signUpAction(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  try {
    const passwordHash = await argon2.hash(password);
    const userId = generateId(15);

    await db.insert(users).values({
      id: userId,
      email,
      passwordHash: passwordHash,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { error: "Email sudah terdaftar atau terjadi kesalahan." };
  }
}

export async function signInAction(
  email: string,
  password: string
): Promise<AuthResult> {
  const results = await db.select().from(users).where(eq(users.email, email));
  const user = results[0];

  if (!user || !(await argon2.verify(user.passwordHash, password))) {
    return { error: "Email atau password salah" };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  revalidatePath("/");
  return { success: true };
}

export async function signOutAction(): Promise<AuthResult> {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value;
  if (!sessionId) return { success: true };

  await lucia.invalidateSession(sessionId);
  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  revalidatePath("/");
  return { success: true };
}

export async function resetPasswordAction(email: string): Promise<AuthResult> {
  // Implementasi reset password mandiri akan menggunakan sistem email lokal
  return { error: "Fitur reset password sedang dalam migrasi." };
}

