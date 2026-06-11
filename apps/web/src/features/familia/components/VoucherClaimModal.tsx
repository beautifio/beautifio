"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Clock, Shield, CheckCircle2, AlertCircle, Gift } from "lucide-react";
import type { FamiliaMerchant, FamiliaVoucherSession } from "@beautifio/types";
import { VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS, generateVoucherCode, saveVoucherSession, getActiveVoucherForMerchant, hasRedeemedToday, recordRedemption } from "@beautifio/utils";

type Step = "confirm" | "activated" | "redeem" | "success" | "expired" | "error";

export function VoucherClaimModal({
  open,
  merchant,
  onClose,
}: {
  open: boolean;
  merchant: FamiliaMerchant | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("confirm");
  const [voucherCode, setVoucherCode] = useState("");
  const [session, setSession] = useState<FamiliaVoucherSession | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [remaining, setRemaining] = useState(900);
  const [claimedToday, setClaimedToday] = useState(false);

  useEffect(() => {
    if (open && merchant) {
      setStep("confirm");
      setPin("");
      setPinError("");
      setClaimedToday(hasRedeemedToday(merchant.id));
    }
  }, [open, merchant]);

  const handleActivate = useCallback(() => {
    if (!merchant) return;
    const code = generateVoucherCode();
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000);
    const newSession: FamiliaVoucherSession = {
      id: `vs-${Date.now()}`,
      user_id: "u-user",
      merchant_id: merchant.id,
      voucher_code: code,
      status: "active",
      pin_required: merchant.daily_pin,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
      created_at: now.toISOString(),
    };
    saveVoucherSession(newSession);
    setSession(newSession);
    setVoucherCode(code);
    setRemaining(900);
    setStep("activated");
  }, [merchant]);

  useEffect(() => {
    if (step !== "activated" || !session) return;
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStep("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, session]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleRedeem = useCallback(() => {
    if (!merchant || !session) return;
    if (pin === merchant.daily_pin) {
      recordRedemption(merchant.id);
      setStep("success");
    } else {
      setPinError("PIN salah. Silakan coba lagi.");
    }
  }, [merchant, session, pin]);

  if (!open || !merchant) return null;

  const voucherEmoji = merchant.voucher_types[0] ? VOUCHER_TYPE_EMOJIS[merchant.voucher_types[0]] : "🎫";
  const voucherLabel = merchant.voucher_types[0] ? VOUCHER_TYPE_LABELS[merchant.voucher_types[0]] : "Voucher";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl px-5 pt-5 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-300">
        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {step === "confirm" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Klaim Voucher</h2>
            <p className="text-sm text-gray-500 mt-1">{merchant.name}</p>
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800">
                Voucher akan aktif selama <strong>15 menit</strong>. Jika tidak digunakan dalam 15 menit, voucher akan otomatis hangus. Kuota merchant tidak akan berkurang sampai voucher berhasil digunakan.
              </p>
            </div>
            {claimedToday && (
              <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">Kamu sudah klaim voucher hari ini. Satu voucher per merchant per hari.</p>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Batal
              </button>
              <button
                onClick={handleActivate}
                disabled={claimedToday}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 cursor-pointer"
              >
                Aktifkan Voucher
              </button>
            </div>
          </div>
        )}

        {step === "activated" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Voucher Aktif!</h2>
            <p className="text-sm text-gray-500 mt-1">{merchant.name}</p>
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Kode Voucher</p>
              <p className="text-2xl font-bold tracking-wider text-gray-900 font-mono">{voucherCode}</p>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-amber-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-bold font-mono">{formatTime(remaining)}</span>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-700 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Tunjukkan kode ini ke merchant untuk ditukarkan
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Tutup
              </button>
              <button
                onClick={() => setStep("redeem")}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all cursor-pointer"
              >
                Saya Sudah di Merchant
              </button>
            </div>
          </div>
        )}

        {step === "redeem" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Masukkan PIN</h2>
            <p className="text-sm text-gray-500 mt-1">Minta PIN dari merchant {merchant.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Kode Merchant: <span className="font-mono font-bold">{merchant.merchant_code}</span></p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setPinError(""); }}
              placeholder="4 digit PIN"
              className="mt-4 w-32 mx-auto text-center text-2xl tracking-[0.5em] px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {pinError && <p className="text-xs text-red-500 mt-2">{pinError}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setStep("activated")} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Kembali
              </button>
              <button
                onClick={handleRedeem}
                disabled={pin.length !== 4}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50 cursor-pointer"
              >
                Verifikasi PIN
              </button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Voucher Berhasil!</h2>
            <p className="text-sm text-gray-500 mt-1">{merchant.name}</p>
            <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200">
              <p className="text-xs text-gray-500 mb-1">Voucher {voucherEmoji} {voucherLabel}</p>
              <p className="text-lg font-bold text-gray-900">REDEEMED</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">Nikmati {voucherLabel} di {merchant.name}!</p>
            <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all cursor-pointer">
              Selesai
            </button>
          </div>
        )}

        {step === "expired" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Voucher Hangus</h2>
            <p className="text-sm text-gray-500 mt-1">Waktu klaim telah habis</p>
            <p className="text-xs text-gray-400 mt-4">Kuota merchant tidak berkurang. Kamu bisa klaim ulang kapan saja.</p>
            <button onClick={onClose} className="mt-5 w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
