"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { Button, Input } from "@beautifio/ui";
import { useAuthStore } from "@/stores/auth-store";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-content bg-surface rounded-t-xl sm:rounded-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface z-10 pt-4 pb-2 px-6 border-b border-border">
          <div className="w-10 h-1.5 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary">
              {mode === "login" ? "Masuk" : "Daftar Akun"}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-sm flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4 pb-6">
          <AuthForm
            mode={mode}
            onSuccess={() => {
              onClose();
              onSuccess?.();
            }}
          />

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 text-xs text-text-secondary">atau</span>
            </div>
          </div>

          <GoogleButton />

          <p className="text-center text-xs text-text-secondary mt-5">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary font-medium hover:underline cursor-pointer"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthForm({
  mode,
  onSuccess,
}: {
  mode: "login" | "register";
  onSuccess: () => void;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || (mode === "register" && !name)) return;
    setSubmitting(true);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (!supabase) {
        setError("Supabase belum dikonfigurasi.");
        setSubmitting(false);
        return;
      }

      if (mode === "login") {
        const { signIn } = await import("@/lib/supabase/queries");
        const { data, error: err } = await signIn(email, password);
        if (err) {
          setError(
            err.message === "Invalid login credentials"
              ? "Email atau password salah"
              : err.message
          );
          setSubmitting(false);
          return;
        }
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          onSuccess();
        }
      } else {
        const { signUp } = await import("@/lib/supabase/queries");
        const { data, error: err } = await signUp(email, password, name);
        if (err) {
          setError(err.message);
          setSubmitting(false);
          return;
        }
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
        onSuccess();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === "register" && (
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Nama lengkap"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      )}

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
          placeholder="Min. 6 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-text-secondary hover:text-text-primary cursor-pointer"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={submitting}
        disabled={!email || !password || (mode === "register" && !name)}
      >
        {mode === "login" ? "Masuk" : "Daftar"}
      </Button>
    </form>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      const { signInWithGoogle } = await import("@/lib/supabase/queries");
      await signInWithGoogle();
    } catch {
      setError("Gagal login dengan Google");
    }
    setLoading(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-3 rounded-sm border border-border bg-surface text-sm font-medium text-text-primary hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer disabled:opacity-40"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Lanjutkan dengan Google
      </button>
      {error && <p className="text-xs text-destructive font-medium mt-2">{error}</p>}
    </div>
  );
}
