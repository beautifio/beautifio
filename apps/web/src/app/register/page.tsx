"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { use, useState, useEffect } from "react";
import { Eye, EyeOff, UserPlus, ArrowRight } from "lucide-react";
import { Button, Input, Skeleton } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage({
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

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
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

  // If already a regular user, redirect to home
  useEffect(() => {
    if (user && !user.is_anonymous && user.app_metadata?.provider !== "anonymous") {
      router.replace("/home");
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama lengkap harus diisi");
      return;
    }

    if (!gender) {
      setError("Silakan pilih gender untuk melanjutkan");
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
      if (!supabase) {
        setError("Supabase belum dikonfigurasi. Hubungi administrator.");
        setSubmitting(false);
        return;
      }

      if (isUpgrade && user) {
        // Upgrade anonymous account to email account
        const { data, error: linkErr } = await supabase.auth.updateUser({
          email,
          password,
          data: { full_name: name, gender },
        });

        if (linkErr) {
          const msg =
            linkErr.message === "User already registered"
              ? "Email sudah terdaftar"
              : linkErr.message;
          setError(msg);
          setSubmitting(false);
          return;
        }

        // Update user profile
        await supabase.from("users").update({
          is_anonymous: false,
          trial_expires_at: null,
          full_name: name,
        }).eq("id", user.id);

        // Force refresh session to get updated user metadata
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed?.session) {
          useAuthStore.setState({ session: refreshed.session, user: refreshed.session.user });
        }

        router.replace("/home");
        return;
      }

      // Standard registration
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, gender },
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

        await supabase.from("users").update({
          gender,
        }).eq("id", data.session.user.id);

        const dest = mimpiSlug ? `/home?mimpi=${mimpiSlug}` : "/home";
        router.push(dest);
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
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={28} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            {isUpgrade ? "Simpan Perjalananmu" : "Daftar Gratis"}
          </h1>
          <p className="text-sm text-text-secondary mt-1.5">
            {isUpgrade
              ? "Data perjalananmu akan tetap tersimpan"
              : "Mulai wujudkan mimpimu sekarang"}
          </p>
        </div>

        <form onSubmit={handleRegister} className="flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Nama Lengkap
              </label>
              <Input
                type="text"
                placeholder="Nama kamu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Info platform */}
            <div style={{
              background: '#F0F9FF',
              border: '1px solid #6BB9D4',
              borderRadius: 12, padding: '12px 14px',
            }}>
              <p style={{
                fontFamily: 'Inter', fontSize: 12,
                color: '#0E7490', margin: 0, lineHeight: 1.6,
              }}>
                💜 Beautifio adalah platform yang dirancang untuk
                perempuan — ruang aman untuk tumbuh, berbagi, dan
                saling mendukung.
              </p>
            </div>

            <div>
              <label style={{
                fontFamily: 'Inter', fontSize: 12, fontWeight: 600,
                color: '#647488', display: 'block', marginBottom: 8,
              }}>
                Gender *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column',
                gap: 8, marginBottom: 4 }}>
                {[
                  { value: 'perempuan', label: '♀️ Perempuan' },
                  { value: 'prefer_not_to_say',
                    label: '🔒 Tidak ingin menyebutkan' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setGender(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      background: gender === opt.value
                        ? '#F0F9FF' : '#F8FAFC',
                      border: gender === opt.value
                        ? '2px solid #084463' : '1.5px solid #E2E8F0',
                      borderRadius: 12, cursor: 'pointer',
                      textAlign: 'left', width: '100%',
                      transition: 'all 0.15s ease',
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: gender === opt.value
                        ? '5px solid #084463' : '2px solid #D1D5DB',
                      flexShrink: 0, transition: 'all 0.15s ease',
                    }} />
                    <span style={{
                      fontFamily: 'Inter', fontSize: 14,
                      color: '#1E2938', fontWeight: 500,
                    }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

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
                  placeholder="Buat password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
              <div className="mt-2 space-y-1">
                {passwordChecks.map((check) => (
                  <p
                    key={check.label}
                    className={`text-[11px] flex items-center gap-1 ${
                      check.passed ? "text-green-600" : "text-text-secondary/50"
                    }`}
                  >
                    <span>{check.passed ? "✓" : "○"}</span> {check.label}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-text-secondary mb-1.5 block">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              disabled={submitting || !isPasswordValid}
            >
              {submitting
                ? "Mendaftarkan..."
                : isUpgrade
                  ? "Simpan Akunku"
                  : "Daftar Gratis"}{" "}
              <ArrowRight size={16} />
            </Button>

            <p className="text-center text-xs text-text-secondary">
              Sudah punya akun?{" "}
              <Link
                href={isUpgrade ? "/login?upgrade=true" : "/login"}
                className="text-primary font-medium hover:underline"
              >
                Masuk
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
