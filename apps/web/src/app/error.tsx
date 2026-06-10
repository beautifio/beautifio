"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-bg flex items-center justify-center px-6">
          <div className="max-w-content mx-auto text-center">
            <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={36} className="text-destructive" />
            </div>
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Terjadi Kesalahan
            </h1>
            <p className="text-sm text-text-secondary mb-8 max-w-xs mx-auto">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
            </p>
            <button
              onClick={reset}
              className="inline-flex h-13 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-bold items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
            >
              <RefreshCw size={16} /> Coba Lagi
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
