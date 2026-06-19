"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface UploadWithPreviewProps {
  label: string;
  currentUrl?: string;
  aspectRatio?: number;
  maxSizeMb?: number;
  hint?: string;
  specs?: string[];
  bucketName?: string;
  onUploadSuccess: (url: string, file: File | Blob) => void;
  onUploadError?: (msg: string) => void;
}

type UploadState = "idle" | "selected" | "uploading" | "success" | "error";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ALLOWED_EXT = ["PNG", "JPG", "JPEG", "WEBP", "GIF"];

export function UploadWithPreview({
  label,
  currentUrl,
  aspectRatio = 16 / 9,
  maxSizeMb = 5,
  hint,
  specs,
  bucketName = "landing-assets",
  onUploadSuccess,
  onUploadError,
}: UploadWithPreviewProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastTimestamp, setLastTimestamp] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCrop, setShowCrop] = useState(false);
  const [cropBlob, setCropBlob] = useState<Blob | null>(null);
  const [cropFileName, setCropFileName] = useState("");

  function reset() {
    setFile(null);
    setPreviewUrl("");
    setErrorMsg("");
    setUploadProgress(0);
    setShowCrop(false);
    setCropBlob(null);
    setState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function validate(f: File): string | null {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return `Format tidak didukung. Gunakan: ${ALLOWED_EXT.join(", ")}`;
    }
    if (f.size > maxSizeMb * 1024 * 1024) {
      return `File terlalu besar (maks ${maxSizeMb}MB)`;
    }
    return null;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validate(f);
    if (err) {
      setErrorMsg(err);
      setState("error");
      setFile(null);
      setPreviewUrl("");
      return;
    }
    setFile(f);
    setErrorMsg("");
    setPreviewUrl(URL.createObjectURL(f));
    setShowCrop(true);
    setState("selected");
  }

  function handleCropDone(blob: Blob) {
    setCropBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setShowCrop(false);
    setCropFileName(file?.name || "cropped.jpg");
  }

  function handleSkipCrop() {
    setShowCrop(false);
  }

  async function handleUpload() {
    const uploadFile = cropBlob || file;
    if (!uploadFile || !supabase) return;
    setState("uploading");
    setUploadProgress(0);
    setErrorMsg("");

    try {
      const fileName = cropBlob ? cropFileName : file?.name || "image.png";
      const ext = fileName.split(".").pop() || "png";
      const filename = `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(filename, uploadFile, { upsert: true });

      if (uploadErr) throw uploadErr;

      setUploadProgress(100);

      const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filename);
      const publicUrl = urlData.publicUrl;

      setLastTimestamp(new Date().toLocaleString("id-ID"));
      setState("success");
      onUploadSuccess(publicUrl, uploadFile);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("size") || msg.includes("large")) {
        setErrorMsg(`Upload gagal: ukuran file melebihi ${maxSizeMb}MB`);
      } else if (msg.includes("format") || msg.includes("type") || msg.includes("mime")) {
        setErrorMsg(`Upload gagal: format tidak didukung`);
      } else {
        setErrorMsg(`Upload gagal: koneksi bermasalah. Coba lagi. (${msg})`);
      }
      setState("error");
      if (onUploadError) onUploadError(msg);
    }
  }

  return (
    <div className="space-y-4">
      {/* Specs info */}
      {specs && specs.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-0.5">
          {specs.map((s, i) => <p key={i}>{s}</p>)}
        </div>
      )}

      {/* State: IDLE or SUCCESS — show preview + file picker */}
      {(state === "idle" || state === "success") && (
        <>
          <div
            className="relative w-full rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50"
            style={{ aspectRatio: aspectRatio }}
          >
            {(state === "success" && previewUrl) || currentUrl ? (
              <img
                src={state === "success" ? previewUrl : currentUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">Belum ada gambar</span>
              </div>
            )}
          </div>

          {state === "success" && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-700">✓ Berhasil diupload! Gambar sudah aktif.</p>
            </div>
          )}

          {state === "success" && lastTimestamp && (
            <p className="text-xs text-gray-400">Terakhir diupdate: {lastTimestamp}</p>
          )}

          <div>
            <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-sm font-medium text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {state === "success" ? "Ganti Gambar" : "Pilih File Gambar"}
              <input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(",")} onChange={handleFileSelect} className="hidden" />
            </label>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-gray-400">
              <span>Format: {ALLOWED_EXT.join(", ")}</span>
              <span>Maks: {maxSizeMb}MB</span>
              {hint && <span>Rasio: {hint}</span>}
            </div>
          </div>
        </>
      )}

      {/* State: SELECTED — show crop tool */}
      {state === "selected" && file && showCrop && (
        <CropStep
          file={file}
          imageUrl={previewUrl}
          aspectRatio={aspectRatio}
          onCropDone={handleCropDone}
          onSkip={handleSkipCrop}
        />
      )}

      {/* State: SELECTED + crop done (or skipped) — show preview + upload */}
      {state === "selected" && file && !showCrop && (
        <>
          <div className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50" style={{ aspectRatio: aspectRatio }}>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">{file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
            <div className="flex gap-2">
              <button onClick={() => setShowCrop(true)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer">
                ✂ Crop ulang
              </button>
              <button onClick={reset} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-red-500 cursor-pointer">
                Batal
              </button>
            </div>
          </div>
          <button onClick={handleUpload}
            className="w-full py-3 rounded-lg font-semibold text-sm cursor-pointer transition-all"
            style={{ backgroundColor: "#084463", color: "#FFFFFF" }}>
            Upload & Simpan
          </button>
        </>
      )}

      {/* State: UPLOADING */}
      {state === "uploading" && (
        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Mengupload...
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%`, backgroundColor: "#084463" }} />
          </div>
        </div>
      )}

      {/* State: ERROR */}
      {state === "error" && errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-red-500 text-sm">✕</span>
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
          <button onClick={reset} className="px-4 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
            Coba Lagi
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── CropStep dengan react-image-crop ─── */

function CropStep({
  file,
  imageUrl,
  aspectRatio,
  onCropDone,
  onSkip,
}: {
  file: File;
  imageUrl: string;
  aspectRatio: number;
  onCropDone: (blob: Blob) => void;
  onSkip: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });

  async function handleConfirm() {
    const img = imgRef.current;
    if (!img || !crop.width || !crop.height) return;

    const canvas = document.createElement("canvas");
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = Math.round(crop.width * scaleX);
    canvas.height = Math.round(crop.height * scaleY);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      img,
      Math.round(crop.x * scaleX),
      Math.round(crop.y * scaleY),
      Math.round(crop.width * scaleX),
      Math.round(crop.height * scaleY),
      0,
      0,
      canvas.width,
      canvas.height
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92)
    );
    if (blob) onCropDone(blob);
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Crop gambar sesuai area yang diinginkan, lalu klik Konfirmasi.
      </p>
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        aspect={aspectRatio}
        className="max-w-full"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={imageUrl} alt="Crop preview" className="max-w-full max-h-[400px]" />
      </ReactCrop>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleConfirm}
          className="px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all"
          style={{ backgroundColor: "#084463", color: "#FFFFFF", border: "none" }}
        >
          ✓ Konfirmasi Crop
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          Lewati Crop
        </button>
      </div>
    </div>
  );
}
