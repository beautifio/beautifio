"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/layout/AuthShell";
import { Mail, ArrowLeft } from "lucide-react";
import { Button, Input } from "@beautifio/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (!supabase) {
        setError("Supabase belum dikonfigurasi. Hubungi administrator.");
        setSubmitting(false);
        return;
      }
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (resetErr) {
        const msg = resetErr.message?.toLowerCase() || "";
        if (msg.includes("rate limit")) setError("Terlalu banyak percobaan. Coba lagi nanti.");
        else if (msg.includes("not found")) setError("Email tidak terdaftar.");
        else if (msg.includes("invalid")) setError("Format email tidak valid.");
        else setError("Gagal mengirim. Coba lagi.");
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setSubmitting(false);
  };

  return (
    <AuthShell
      title={sent ? "Cek email kamu" : "Lupa password"}
      subtitle={sent ? undefined : "Masukkan email terdaftar, kami kirim tautan untuk membuat password baru."}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 font-semibold text-laut-500 hover:underline">
          <ArrowLeft size={15} aria-hidden /> Kembali ke Masuk
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-success-soft text-success ring-1 ring-inset ring-success/20">
            <Mail size={26} aria-hidden />
          </span>
          <p className="text-[15px] leading-relaxed text-kabut">
            Tautan reset password sudah dikirim ke <strong className="text-tinta">{email}</strong>.
          </p>
          <p className="mt-4 text-[13px] text-kabut">
            Tidak menerima email?{" "}
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setSubmitting(false);
              }}
              className="font-semibold text-laut-500 hover:underline cursor-pointer"
            >
              Kirim ulang
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
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
            <p className="rounded-md bg-danger-soft px-3 py-2.5 text-sm text-danger" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-full" loading={submitting} disabled={!email}>
            Kirim tautan reset
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
