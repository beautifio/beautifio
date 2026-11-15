"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { Button, Input } from "@beautifio/ui";
import { signInAction, signUpAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await signInAction(email, password);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.replace("/home");
    }
  };

  const handleGoogleLogin = async () => {
    // Custom Google OAuth: redirect to Google's authorization endpoint.
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Login dengan Google belum dikonfigurasi.");
      return;
    }
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`;
    const scope = "openid email profile";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    window.location.href = googleAuthUrl;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    // Registration handled via AuthModal (signUpAction). This page is login-only.
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-6">
      <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Masuk ke Beautifio</h1>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive font-medium text-center">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>Masuk</Button>
        <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleLogin}>Lanjutkan dengan Google</Button>
        <p className="text-xs text-text-secondary text-center mt-4">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline cursor-pointer">
            Daftar
          </Link>
        </p>
      </form>
    </div>
  );
}
