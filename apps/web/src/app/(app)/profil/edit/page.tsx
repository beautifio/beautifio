"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, Loader2, Save, Check, ChevronDown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"

interface Province {
  id: number
  name: string
}

interface Regency {
  id: number
  province_id: number
  type: string
  name: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  // Form fields
  const [fullName, setFullName] = useState("")
  const [anonymousName, setAnonymousName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [address, setAddress] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Province & City
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [selectedProvince, setSelectedProvince] = useState("")
  const [selectedRegency, setSelectedRegency] = useState("")
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)
  const [showRegencyDropdown, setShowRegencyDropdown] = useState(false)
  const [provinceSearch, setProvinceSearch] = useState("")
  const [regencySearch, setRegencySearch] = useState("")

  // Avatar
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [isPro, setIsPro] = useState(false)
  const [nameValidation, setNameValidation] = useState<{ valid: boolean; message?: string } | null>(null)

  // Fetch profile data
  useEffect(() => {
    if (!supabase || !user) return
    ;(async () => {
      const { data } = await supabase
        .from("users")
        .select("full_name, bisik_anonymous_name, bisik_custom_name, date_of_birth, city, address, bio, avatar_url")
        .eq("id", user.id)
        .single()
      if (data) {
        setProfile(data)
        setFullName(data.full_name || "")
        setAnonymousName(data.bisik_custom_name || data.bisik_anonymous_name || "")
        setDateOfBirth(data.date_of_birth || "")
        setAddress(data.address || "")
        setBio(data.bio || "")
        setAvatarUrl(data.avatar_url)
        if (data.city) {
          setSelectedRegency(data.city)
        }
      }
      setLoading(false)
    })()

    // Check Pro status
    supabase.from("user_subscriptions").select("id").eq("user_id", user.id).eq("status", "active").maybeSingle().then(({ data }) => {
      setIsPro(!!data)
    })

    // Fetch provinces
    supabase.from("indonesia_provinces").select("*").order("name").then(({ data }) => {
      setProvinces(data ?? [])
    })
  }, [user, supabase])

  // Fetch regencies when province changes
  const loadRegencies = async (provinceId: number) => {
    if (!supabase) return
    const { data } = await supabase
      .from("indonesia_regencies")
      .select("*")
      .eq("province_id", provinceId)
      .order("name")
    setRegencies(data ?? [])
  }

  const handleProvinceChange = (prov: Province) => {
    setSelectedProvince(prov.name)
    setSelectedRegency("")
    setRegencySearch("")
    setShowProvinceDropdown(false)
    loadRegencies(prov.id)
  }

  const handleRegencyChange = (reg: Regency) => {
    setSelectedRegency(`${reg.type} ${reg.name}`)
    setShowRegencyDropdown(false)
  }

  // Filter provinces/regencies by search
  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(provinceSearch.toLowerCase())
  )
  const filteredRegencies = regencies.filter(r =>
    `${r.type} ${r.name}`.toLowerCase().includes(regencySearch.toLowerCase())
  )

  const initials = fullName
    ? fullName.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U"

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabase || !user) return
    setUploading(true)
    try {
      const ext = file.name.split(".").pop()
      const filePath = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const publicUrl = urlData?.publicUrl
      if (publicUrl) {
        setAvatarUrl(publicUrl)
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError("Gagal upload foto. Coba lagi.")
    }
    setUploading(false)
  }

  const handleSave = async () => {
    if (!supabase || !user) return
    setSaving(true)
    setError(null)
    try {
      // Validate anonymous name if changed
      if (isPro && anonymousName !== (profile?.bisik_custom_name || "")) {
        if (anonymousName.length > 0 && anonymousName.length < 4) {
          throw new Error("Username anonymous minimal 4 karakter")
        }
        if (anonymousName.length > 20) {
          throw new Error("Username anonymous maksimal 20 karakter")
        }
        if (anonymousName && !/^[a-z0-9]+$/.test(anonymousName)) {
          throw new Error("Hanya huruf dan angka (tanpa spasi/simbol)")
        }
        if ((anonymousName.match(/\d/g) || []).length > 2) {
          throw new Error("Maksimal 2 angka dalam username")
        }
        const { data: validation } = await supabase
          .rpc("validate_bisik_custom_name", {
            p_user_id: user.id,
            p_custom_name: anonymousName,
          })
        if (!validation?.valid) {
          throw new Error(validation?.message || "Username tidak tersedia")
        }
      }

      const updateData: any = {
        full_name: fullName,
        date_of_birth: dateOfBirth || null,
        city: selectedRegency || "",
        address,
        bio,
        avatar_url: avatarUrl,
      }
      if (isPro && anonymousName) {
        updateData.bisik_custom_name = anonymousName.toLowerCase()
      }
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)
      if (updateError) throw updateError

      // Update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan profil")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-text-primary flex-1">Edit Profil</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          </button>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-border">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <p className="text-[10px] text-text-secondary mt-2">Foto profil (opsional)</p>
        </div>

        {/* Nama Lengkap */}
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Nama Lengkap</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap"
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Username Anonymous */}
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Username Anonymous</label>
          <div className="flex items-center gap-2">
              <input
                  value={anonymousName}
                  onChange={(e) => setAnonymousName(e.target.value)}
                  placeholder="Nama anonim untuk Bisik"
                  maxLength={20}
                  readOnly={!isPro}
                  className={`flex-1 px-4 py-3 rounded-xl border border-border text-sm placeholder:text-text-secondary/50 outline-none transition-colors ${isPro ? "bg-bg text-text-primary focus:border-primary" : "bg-muted/30 text-text-secondary cursor-not-allowed"}`} />
          </div>
          <p className="text-[10px] text-text-secondary mt-1">
            {isPro
              ? "Nama yang ditampilkan di fitur Bisik. Huruf & angka saja, maks 2 angka."
              : "Nama anonim Bisik di-generate otomatis. Upgrade ke Pro untuk mengganti."}
          </p>
        </div>

        {/* Tanggal Lahir */}
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Tanggal Lahir</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-text-primary outline-none focus:border-primary transition-colors"
          />
          <p className="text-[10px] text-text-secondary mt-1">Untuk verifikasi usia (fitur Pro)</p>
        </div>

        {/* Provinsi */}
        <div className="relative">
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Provinsi</label>
          <button
            onClick={() => { setShowProvinceDropdown(!showProvinceDropdown); setShowRegencyDropdown(false) }}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-left flex items-center justify-between text-text-primary hover:border-primary transition-colors cursor-pointer"
          >
            <span className={selectedProvince ? "" : "text-text-secondary/50"}>{selectedProvince || "Pilih provinsi"}</span>
            <ChevronDown size={16} className="text-text-secondary" />
          </button>
          {showProvinceDropdown && (
            <div className="absolute z-50 top-full mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div className="sticky top-0 bg-surface p-2 border-b border-border">
                <input
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  placeholder="Cari provinsi..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-xs outline-none"
                  autoFocus
                />
              </div>
              {filteredProvinces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProvinceChange(p)}
                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors cursor-pointer ${
                    selectedProvince === p.name ? "bg-primary/5 text-primary font-medium" : "text-text-primary"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Kota/Kabupaten */}
        <div className="relative">
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Kota / Kabupaten</label>
          <button
            onClick={() => { setShowRegencyDropdown(!showRegencyDropdown); setShowProvinceDropdown(false) }}
            disabled={!selectedProvince}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-left flex items-center justify-between disabled:opacity-40 text-text-primary hover:border-primary transition-colors cursor-pointer"
          >
            <span className={selectedRegency ? "" : "text-text-secondary/50"}>
              {selectedRegency || (selectedProvince ? "Pilih kota/kabupaten" : "Pilih provinsi dulu")}
            </span>
            <ChevronDown size={16} className="text-text-secondary" />
          </button>
          {showRegencyDropdown && (
            <div className="absolute z-50 top-full mt-1 w-full bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div className="sticky top-0 bg-surface p-2 border-b border-border">
                <input
                  value={regencySearch}
                  onChange={(e) => setRegencySearch(e.target.value)}
                  placeholder="Cari kota/kabupaten..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-xs outline-none"
                  autoFocus
                />
              </div>
              {filteredRegencies.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRegencyChange(r)}
                  className="w-full px-4 py-2.5 text-sm text-left text-text-primary hover:bg-muted transition-colors cursor-pointer"
                >
                  {r.type} {r.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alamat */}
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Alamat</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Masukkan alamat lengkap"
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="text-xs font-semibold text-text-primary mb-1.5 block">Bio Singkat</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 150))}
            placeholder="Ceritakan tentang dirimu..."
            rows={3}
            maxLength={150}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors resize-none"
          />
          <div className="flex justify-end mt-1">
            <span className={`text-[10px] ${bio.length >= 140 ? "text-red-500 font-medium" : "text-text-secondary"}`}>
              {bio.length}/150
            </span>
          </div>
        </div>

        {/* Save button at bottom */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {saving ? "Menyimpan..." : saved ? "Tersimpan ✓" : "Simpan Profil"}
        </button>
      </div>
    </div>
  )
}
