"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { Button, Input, Skeleton } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mimpi?: string; upgrade?: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const { user, isLoading } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const mimpiSlug = resolvedParams.mimpi;
  const isUpgrade = resolvedParams.upgrade === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("beautifio_remember_email");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  // If already logged in, redirect to / (middleware handles role-based redirect)
  useEffect(() => {
    if (user && !user.is_anonymous && user.app_metadata?.provider !== "anonymous") {
      router.replace("/");
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (!supabase) {
        setError("Supabase belum dikonfigurasi. Hubungi administrator.");
        setSubmitting(false);
        return;
      }

      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        const msg =
          signInErr.message === "Invalid login credentials"
            ? "Email atau password salah"
            : signInErr.message;
        setError(msg);
        setSubmitting(false);
        return;
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);

        // If upgrading from anonymous, update profile
        if (isUpgrade) {
          await supabase.from("users").update({
            is_anonymous: false,
            trial_expires_at: null,
          }).eq("id", data.session.user.id);
        }

        if (rememberMe) {
          localStorage.setItem("beautifio_remember_email", email);
        } else {
          localStorage.removeItem("beautifio_remember_email");
        }

        const dest = mimpiSlug ? `/?mimpi=${mimpiSlug}` : "/";
        router.push(dest);
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  const handleGoogleLogin = async () => {
    try {
      if (!supabase) {
        setError("Supabase belum dikonfigurasi.");
        return;
      }
      const { error: signInErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signInErr) setError(signInErr.message);
    } catch {
      setError("Gagal login dengan Google.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
        <div className="max-w-content mx-auto w-full space-y-4">
          <div className="flex flex-col items-center mb-8">
            <Skeleton className="w-16 h-16 rounded-full mb-4" />
            <Skeleton className="w-36 h-6 mb-2" />
            <Skeleton className="w-52 h-4" />
          </div>
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-13 mt-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="max-w-content mx-auto w-full px-6 pt-12 pb-8 flex-1 flex flex-col">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LogIn size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            {isUpgrade ? "Hubungkan Akun" : "Masuk"}
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {isUpgrade
              ? "Masuk dengan akun yang sudah ada untuk menyimpan data"
              : "Selamat datang kembali"}
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Email
              </label>
              <Input
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-text-secondary">Ingat saya</span>
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full shadow-lg"
              disabled={submitting}
            >
              {submitting ? "Memproses..." : isUpgrade ? "Hubungkan & Simpan" : "Masuk"}{" "}
              <ArrowRight size={16} />
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-bg px-3 text-xs text-text-secondary">atau</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Lanjutkan dengan Google
            </Button>

            <p className="text-center text-xs text-text-secondary">
              Belum punya akun?{" "}
              <Link
                href={isUpgrade ? "/register?upgrade=true" : "/register"}
                className="text-primary font-medium hover:underline"
              >
                Daftar Gratis
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
