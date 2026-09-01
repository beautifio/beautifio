"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, LogIn, ArrowRight } from "lucide-react";
import { Button, Input } from "@beautifio/ui";
import { signInAction } from "@/app/actions/auth";

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
    try {
      await signIn("google", { callbackUrl: "/home" });
    } catch {
      setError("Gagal login dengan Google.");
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-6">
      <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center">Masuk ke Beautifio</h1>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="relative">
          <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>Masuk</Button>
        <Button type="button" variant="secondary" className="w-full" onClick={handleGoogleLogin}>Login dengan Google</Button>
      </form>
    </div>
  );
}
