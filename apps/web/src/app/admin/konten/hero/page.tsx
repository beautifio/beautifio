"use client";

import { useState, useEffect } from "react";
import { Button } from "@beautifio/ui";
import { supabase } from "@/lib/supabase/client";

export default function AdminHeroPage() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (!supabase) return;
    loadHero();
  }, []);

  async function loadHero() {
    const { data } = await supabase!
      .from("app_settings")
      .select("value, updated_at")
      .eq("key", "hero_image_url")
      .single();
    if (data?.value) setCurrentUrl(data.value);
    if (data?.updated_at) setLastUpdated(data.updated_at);
  }

  async function handleUpload() {
    if (!file || !supabase) return;
    setUploading(true);
    setError("");
    setSuccess(false);

    try {
      const ext = file.name.split(".").pop();
      const filename = `hero-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("landing-assets")
        .upload(filename, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from("landing-assets")
        .getPublicUrl(filename);

      const publicUrl = urlData.publicUrl;

      const { error: upsertErr } = await supabase
        .from("app_settings")
        .upsert({
          key: "hero_image_url",
          value: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (upsertErr) throw upsertErr;

      setCurrentUrl(publicUrl);
      setLastUpdated(new Date().toISOString());
      setSuccess(true);
      setFile(null);
    } catch (err: any) {
      setError(err?.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-6">🖼️ Hero Landing Page</h1>

      <div className="space-y-4">
        {/* Preview */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Gambar sekarang:</p>
          {currentUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200">
              <img src={currentUrl} alt="Hero" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl flex items-center justify-center" style={{ backgroundColor: "#084463" }}>
              <p className="text-white/60 text-sm">Belum ada gambar hero</p>
            </div>
          )}
        </div>

        {/* Upload form */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload gambar baru:</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#084463] file:text-white hover:file:bg-[#084463]/90"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {success && (
          <p className="text-sm text-green-600">Hero image berhasil diupdate!</p>
        )}

        <Button
          variant="primary"
          size="lg"
          onClick={handleUpload}
          loading={uploading}
          disabled={!file || uploading}
        >
          Upload & Simpan
        </Button>

        {lastUpdated && (
          <p className="text-xs text-gray-400">
            Terakhir diupdate: {new Date(lastUpdated).toLocaleString("id-ID")}
          </p>
        )}
      </div>
    </div>
  );
}
