"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, UserPlus, User } from "lucide-react";
import { Button, Input, Skeleton } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = [
    { label: "Minimal 8 karakter", passed: password.length >= 8 },
    { label: "Mengandung huruf besar", passed: /[A-Z]/.test(password) },
    { label: "Mengandung huruf kecil", passed: /[a-z]/.test(password) },
    { label: "Mengandung angka", passed: /\d/.test(password) },
  ];

  const isPasswordValid = passwordChecks.every((c) => c.passed);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama lengkap harus diisi");
      return;
    }

    if (!validateEmail(email)) {
      setError("Format email tidak valid");
      return;
    }

    if (!isPasswordValid) {
      setError("Password tidak memenuhi persyaratan");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setSubmitting(true);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (!supabase) {
        setError("Supabase belum dikonfigurasi. Hubungi administrator.");
        setSubmitting(false);
        return;
      }

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpErr) {
        const msg =
          signUpErr.message === "User already registered"
            ? "Email sudah terdaftar"
            : signUpErr.message ===
                "Password should be at least 6 characters"
              ? "Password minimal 6 karakter"
              : signUpErr.message;
        setError(msg);
        setSubmitting(false);
        return;
      }

      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
        router.push("/home");
        return;
      }

      setSubmitting(false);
      setError("cek-email");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setSubmitting(false);
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
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={28} className="text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Daftar Akun</h1>
          <p className="text-sm text-text-secondary mt-2">
            Mulai perjalananmu di Beautifio
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-5 flex-1 flex flex-col animate-in fade-in duration-500 delay-150"
        >
          <Input
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Buat password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="space-y-1">
            {passwordChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    check.passed
                      ? "bg-success border-success"
                      : "border-border"
                  }`}
                >
                  {check.passed && (
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M2 5L4 7L8 3"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    check.passed
                      ? "text-success font-medium"
                      : "text-text-secondary"
                  }`}
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative">
            <Input
              label="Konfirmasi Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive font-medium">
              Password tidak cocok
            </p>
          )}

          {error === "cek-email" ? (
            <div className="p-3 rounded-xl bg-success/10 border border-success/20">
              <p className="text-xs font-semibold text-success">Akun berhasil dibuat!</p>
              <p className="text-[11px] text-text-secondary mt-1">
                Silakan cek email <strong className="text-text-primary">{email}</strong> untuk konfirmasi akun kamu.
              </p>
            </div>
          ) : error ? (
            <p className="text-xs text-destructive font-medium" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-auto"
            loading={submitting}
            disabled={!name || !email || !password || !confirmPassword || !isPasswordValid || password !== confirmPassword}
          >
            Daftar
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-bg px-3 text-xs text-text-secondary">
              atau
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            setError("");
            try {
              const { signInWithGoogle } = await import(
                "@/lib/supabase/queries"
              );
              const { supabase } = await import("@/lib/supabase/client");
              if (!supabase) {
                setError("Supabase belum dikonfigurasi.");
                return;
              }
              await signInWithGoogle();
            } catch {
              setError("Gagal daftar dengan Google");
            }
          }}
          disabled={submitting}
          className="w-full h-13 flex items-center justify-center gap-3 rounded-xl border border-border bg-surface text-sm font-medium text-text-primary hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-40"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Lanjutkan dengan Google
        </button>

        <p className="text-center text-xs text-text-secondary mt-8">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
