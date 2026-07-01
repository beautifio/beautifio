"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function ReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memverifikasi pembayaran...");
  const isSubscription = !!searchParams.get("sub") && searchParams.get("type") !== "consultation";
  const isConsultation = searchParams.get("type") === "consultation";

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    const subId = searchParams.get("sub");
    const id = orderId || subId;

    if (!id) {
      setState("error");
      setMessage("Data pembayaran tidak ditemukan");
      return;
    }

    fetch("/api/payment/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: orderId || undefined,
        sub_id: subId || undefined,
      }),
    })
      .then(r => r.json())
      .then(json => {
        if (json.confirmed) {
          setState("success");
          setMessage("Pembayaran berhasil dikonfirmasi!");
          const dest = isConsultation ? "/tes-arah-hidup" : subId ? "/bisik" : "/event/me";
          timerRef.current = setTimeout(() => router.push(dest), 2000);
        } else {
          setState("error");
          setMessage(json.message || "Gagal mengkonfirmasi pembayaran");
        }
      })
      .catch(() => {
        setState("error");
        setMessage("Gagal menghubungi server");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
      <div className="text-center px-6 max-w-sm">
        {state === "loading" && (
          <>
            <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: "#084463" }} />
            <p className="text-sm font-medium" style={{ color: "#1E2938" }}>{message}</p>
            <p className="text-xs mt-2" style={{ color: "#647488" }}>Jangan tutup halaman ini</p>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "#22C55E" }} />
            <p className="text-sm font-bold" style={{ color: "#22C55E" }}>{message}</p>
            <p className="text-xs mt-2" style={{ color: "#647488" }}>Mengarahkan ke halaman Eventku...</p>
          </>
        )}
        {state === "error" && (
          <>
            <XCircle size={48} className="mx-auto mb-4" style={{ color: "#EF4444" }} />
            <p className="text-sm font-medium" style={{ color: "#EF4444" }}>{message}</p>
            <button onClick={() => router.push(isConsultation ? "/tes-arah-hidup" : isSubscription ? "/bisik" : "/event/me")}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer"
              style={{ background: "#084463" }}>
              {isConsultation ? "Kembali ke Tes" : isSubscription ? "Kembali ke Bisik" : "Kembali ke Eventku"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <Loader2 size={40} className="animate-spin" style={{ color: "#084463" }} />
      </div>
    }>
      <ReturnContent />
    </Suspense>
  );
}
