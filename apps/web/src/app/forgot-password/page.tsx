"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button, Input } from "@beautifio/ui";
import { resetPasswordAction } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Custom JWT auth: reset flow handled server-side via resetPasswordAction.
      const result = await resetPasswordAction(email);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      if (result.deliveryUrl) setDeliveryUrl(result.deliveryUrl);
      setEmailSent(result.emailSent ?? null);
      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="max-w-content mx-auto w-full px-6 pt-12 pb-8 flex-1 flex flex-col">
        <Link
          href="/login"
          className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-all active:scale-90 mb-8"
        >
          <ArrowLeft size={18} className="text-text-secondary" />
        </Link>

        {sent ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-success" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">
              {emailSent === false ? "Permintaan Dicatat" : "Cek Email Kamu"}
            </h1>
            {emailSent === false ? (
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Permintaan reset untuk{" "}
                <strong className="text-text-primary">{email}</strong> sudah dicatat,
                namun layanan email sedang tidak aktif. Hubungi administrator untuk
                mendapatkan tautan reset.
              </p>
            ) : (
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                Kami telah mengirim tautan reset password ke{" "}
                <strong className="text-text-primary">{email}</strong>
              </p>
            )}
            {deliveryUrl && (
              <p className="text-xs mt-3">
                <a href={deliveryUrl} className="text-primary font-medium hover:underline">
                  Buka tautan reset (mode development)
                </a>
              </p>
            )}
            <p className="text-xs text-text-secondary mt-4">
              Tidak menerima email?{" "}
              <button
                onClick={() => {
                  setSent(false);
                  setSubmitting(false);
                }}
                className="text-primary font-medium hover:underline cursor-pointer"
              >
                Kirim ulang
              </button>
            </p>
            <Link
              href="/login"
              className="mt-8 text-sm font-medium text-secondary hover:underline"
            >
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-text-primary">
                Lupa Password
              </h1>
              <p className="text-sm text-text-secondary mt-2">
                Masukkan email terdaftar, kami akan kirim tautan reset password
              </p>
            </div>

            <form
              onSubmit={handleReset}
              className="space-y-4 flex-1 flex flex-col"
            >
              <Input
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              {error && (
                <p className="text-xs text-destructive font-medium" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-auto"
                loading={submitting}
                disabled={!email}
              >
                Kirim Tautan Reset
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
