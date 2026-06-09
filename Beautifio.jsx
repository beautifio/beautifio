import React, { useState, useMemo } from "react";
import {
  Home, Sparkles, ShieldCheck, MessageSquareHeart, User,
  Search, Star, Heart, ChevronRight, Check, X, ArrowLeft,
  TrendingUp, BadgeCheck, AlertTriangle, Coffee, Gift,
  Flame, Droplet, Sun, ShieldAlt, ChevronDown, Coins, Award
} from "lucide-react";

/* ──────────────────────────────────────────────────────────
   BEAUTIFIO — Media-first beauty platform
   Core jobs: (1) Cocokin — produk mana yang cocok untukmu
              (2) Cek Aman — produk ini aman & asli nggak
   Honest media wrapper · curated affiliate commerce
   ────────────────────────────────────────────────────────── */

const C = {
  plum: "#4A2335", plumDeep: "#351826", rose: "#BF5577", roseDeep: "#A33F62",
  blush: "#E2A0B5", soft: "#F4D8E1", cream: "#FBF4EF", white: "#FFFFFF",
  caramel: "#B97D4B", caramelBg: "#FBF2E8", sage: "#7E9B6F", sageDeep: "#5E7A50",
  charcoal: "#2E1922", gray: "#8A6B76", border: "#ECD6DE", gold: "#D89A52",
};
const serif = "Georgia, 'Times New Roman', serif";

/* ── DATA ────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 1, name: "Gentle Hydra Cleanser", brand: "Lokal Glow", emoji: "🧼",
    cat: "Pembersih", price: 45000, bpom: "NA18230xxxxx", verified: true,
    skin: ["kering", "sensitif", "normal"], concern: ["kusam", "kemerahan"],
    rating: 4.6, reviews: 312, worth: true,
    verdict: "Lembut, nggak bikin ketarik. Worth banget di harganya.",
  },
  {
    id: 2, name: "Niacinamide 10% Serum", brand: "Skinjur", emoji: "💧",
    cat: "Serum", price: 89000, bpom: "NA18221xxxxx", verified: true,
    skin: ["berminyak", "kombinasi", "normal"], concern: ["jerawat", "pori", "bekas"],
    rating: 4.4, reviews: 528, worth: true,
    verdict: "Bagus untuk pori & bekas, tapi mulai dari 2x seminggu ya.",
  },
  {
    id: 3, name: "Bright Tone Moisturizer", brand: "Aurora", emoji: "🌸",
    cat: "Pelembap", price: 120000, bpom: "NA18219xxxxx", verified: true,
    skin: ["kering", "normal", "kombinasi"], concern: ["kusam", "penuaan"],
    rating: 4.2, reviews: 198, worth: false,
    verdict: "Teksturnya enak tapi agak overpriced. Ada alternatif lebih murah.",
  },
  {
    id: 4, name: "Acne Spot Gel", brand: "Klin", emoji: "🎯",
    cat: "Treatment", price: 38000, bpom: "NA18240xxxxx", verified: true,
    skin: ["berminyak", "kombinasi", "sensitif"], concern: ["jerawat"],
    rating: 4.7, reviews: 644, worth: true,
    verdict: "Juara untuk jerawat baru. Pakai tipis di titik jerawat aja.",
  },
  {
    id: 5, name: "Sunscreen SPF 50 PA++++", brand: "Lokal Glow", emoji: "☀️",
    cat: "Sunscreen", price: 65000, bpom: "NA18233xxxxx", verified: true,
    skin: ["berminyak", "kombinasi", "normal", "kering", "sensitif"], concern: ["penuaan", "kusam", "bekas"],
    rating: 4.5, reviews: 871, worth: true,
    verdict: "Nggak whitecast, ringan. Wajib punya — ini fondasi semua skincare.",
  },
  {
    id: 6, name: "Glow Booster Essence", brand: "Mystiq", emoji: "✨",
    cat: "Essence", price: 95000, bpom: null, verified: false,
    skin: ["normal", "kombinasi"], concern: ["kusam"],
    rating: 3.6, reviews: 47, worth: false,
    verdict: "Belum ada nomor BPOM resmi. Tim Beautifio belum merekomendasikan.",
  },
];

const SKIN_TYPES = [
  { id: "kering", label: "Kering", icon: Droplet },
  { id: "berminyak", label: "Berminyak", icon: Flame },
  { id: "kombinasi", label: "Kombinasi", icon: Sun },
  { id: "sensitif", label: "Sensitif", icon: Heart },
  { id: "normal", label: "Normal", icon: Check },
];
const CONCERNS = [
  { id: "jerawat", label: "Jerawat" }, { id: "kusam", label: "Kulit kusam" },
  { id: "kemerahan", label: "Kemerahan" }, { id: "pori", label: "Pori besar" },
  { id: "bekas", label: "Bekas jerawat" }, { id: "penuaan", label: "Penuaan dini" },
];
const BUDGETS = [
  { id: "low", label: "< Rp50.000", max: 50000 },
  { id: "mid", label: "Rp50–150 ribu", max: 150000 },
  { id: "high", label: "Rp150–300 ribu", max: 300000 },
  { id: "any", label: "Berapa aja", max: Infinity },
];

const REVIEWS = [
  { id: 1, user: "Sasa", avatar: "🌷", product: "Acne Spot Gel", rating: 5, skin: "Berminyak",
    text: "Jerawat baru langsung kempes dalam 2 hari. Nggak bikin kering. Anak kos friendly!", helpful: 84, verified: true },
  { id: 2, user: "Mira", avatar: "🌙", product: "Glow Booster Essence", rating: 2, skin: "Sensitif",
    text: "Bikin breakout di pipi aku. Hati-hati buat yang sensitif, dan ini belum ada BPOM ya.", helpful: 121, verified: true },
  { id: 3, user: "Dinda", avatar: "🌼", product: "Niacinamide 10% Serum", rating: 4, skin: "Kombinasi",
    text: "Pori mengecil pelan-pelan. Awal pakai sempat purging seminggu, sabar aja.", helpful: 56, verified: true },
  { id: 4, user: "Rara", avatar: "🪷", product: "Sunscreen SPF 50", rating: 5, skin: "Normal",
    text: "Reapply gampang, nggak lengket. Ini sunscreen lokal terbaik yang pernah aku coba.", helpful: 203, verified: true },
];

const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");

/* ── SHARED UI ───────────────────────────────────────────── */
function Pill({ children, bg, color, style }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, ...style }}>
      {children}
    </span>
  );
}

function VerifiedTag({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-1" style={{ color: C.sageDeep, fontSize: 11, fontWeight: 600 }}>
      <BadgeCheck size={13} /> Terdaftar BPOM
    </span>
  ) : (
    <span className="inline-flex items-center gap-1" style={{ color: C.gold, fontSize: 11, fontWeight: 600 }}>
      <AlertTriangle size={13} /> Belum terverifikasi
    </span>
  );
}

function Stars({ value, size = 13 }) {
  return (
    <span className="inline-flex items-center" style={{ gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? C.gold : "none"}
          style={{ color: i <= Math.round(value) ? C.gold : C.border }} />
      ))}
    </span>
  );
}

function ProductCard({ p, onClick, matchScore, reasons }) {
  return (
    <button onClick={onClick} className="w-full text-left"
      style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 14, marginBottom: 12 }}>
      <div className="flex gap-3">
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 60, height: 60, borderRadius: 14, background: C.soft, fontSize: 28 }}>
          {p.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p style={{ fontSize: 10, fontWeight: 700, color: C.rose, letterSpacing: 1 }}>{p.brand.toUpperCase()}</p>
            {matchScore != null && (
              <Pill bg={matchScore >= 80 ? C.sage : matchScore >= 60 ? C.gold : C.gray} color={C.white}>
                {matchScore}% cocok
              </Pill>
            )}
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, lineHeight: 1.2, marginTop: 2 }}>{p.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Stars value={p.rating} />
            <span style={{ fontSize: 11, color: C.gray }}>{p.rating} · {p.reviews} ulasan</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span style={{ fontSize: 15, fontWeight: 800, color: C.charcoal }}>{rupiah(p.price)}</span>
            <VerifiedTag ok={p.verified} />
          </div>
        </div>
      </div>
      {reasons && reasons.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${C.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: C.sageDeep, marginBottom: 4 }}>KENAPA COCOK UNTUKMU</p>
          <div className="flex flex-wrap gap-1.5">
            {reasons.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-1"
                style={{ fontSize: 11, color: C.charcoal, background: C.cream, padding: "3px 8px", borderRadius: 999 }}>
                <Check size={11} style={{ color: C.sage }} /> {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}

/* ── HOME ────────────────────────────────────────────────── */
function HomeScreen({ go, openProduct }) {
  return (
    <div className="pb-2">
      {/* Hero */}
      <div style={{ background: C.plum, padding: "22px 18px 26px", borderRadius: "0 0 26px 26px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -30, top: -30, width: 140, height: 140, borderRadius: 999, background: C.rose, opacity: 0.35 }} />
        <div style={{ position: "absolute", right: 50, bottom: -40, width: 90, height: 90, borderRadius: 999, background: C.caramel, opacity: 0.25 }} />
        <p style={{ color: C.blush, fontSize: 12, fontWeight: 600, letterSpacing: 1 }}>HALO, SASA 👋</p>
        <h1 style={{ color: C.white, fontFamily: serif, fontSize: 24, fontWeight: 700, lineHeight: 1.15, marginTop: 6, maxWidth: 260 }}>
          Skincare yang cocok untukmu, bukan untuk semua orang.
        </h1>
        <div className="flex gap-2 mt-4">
          <button onClick={() => go("match")} className="flex-1 flex items-center gap-2"
            style={{ background: C.white, borderRadius: 14, padding: "12px 14px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: C.soft, display: "grid", placeItems: "center" }}>
              <Sparkles size={18} style={{ color: C.rose }} />
            </span>
            <span className="text-left">
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.charcoal }}>Cocokin</span>
              <span style={{ display: "block", fontSize: 10, color: C.gray }}>Cari yang pas</span>
            </span>
          </button>
          <button onClick={() => go("safety")} className="flex-1 flex items-center gap-2"
            style={{ background: C.white, borderRadius: 14, padding: "12px 14px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: C.caramelBg, display: "grid", placeItems: "center" }}>
              <ShieldCheck size={18} style={{ color: C.caramel }} />
            </span>
            <span className="text-left">
              <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.charcoal }}>Cek Aman</span>
              <span style={{ display: "block", fontSize: 10, color: C.gray }}>BPOM & asli</span>
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* Honest verdict banner */}
        <div className="flex items-start gap-3" style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 18 }}>
          <MessageSquareHeart size={20} style={{ color: C.rose, marginTop: 2 }} />
          <p style={{ fontSize: 12.5, color: C.charcoal, lineHeight: 1.45 }}>
            <b>Review jujur, bukan endorse.</b> Kalau produk jelek, kami bilang jelek — walau brand-nya bayar kami.
          </p>
        </div>

        {/* Trending honest reviews */}
        <div className="flex items-center justify-between mb-3">
          <h2 style={{ fontFamily: serif, fontSize: 17, fontWeight: 700, color: C.charcoal }}>Lagi ramai dibahas</h2>
          <span className="inline-flex items-center gap-1" style={{ fontSize: 11, fontWeight: 600, color: C.rose }}>
            <TrendingUp size={13} /> Trending
          </span>
        </div>
        {PRODUCTS.slice(0, 3).map((p) => (
          <ProductCard key={p.id} p={p} onClick={() => openProduct(p)} />
        ))}

        {/* Glow & Brew teaser */}
        <div className="flex items-center gap-3 mt-2" style={{ background: C.plum, borderRadius: 18, padding: 16 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: C.caramel, display: "grid", placeItems: "center" }}>
            <Coffee size={20} style={{ color: C.white }} />
          </span>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 700, color: C.white }}>Glow & Brew Jogja</p>
            <p style={{ fontSize: 11, color: C.blush }}>Coba tester, ngopi, ikut beauty class. Tiap Sabtu.</p>
          </div>
          <ChevronRight size={18} style={{ color: C.blush }} />
        </div>
      </div>
    </div>
  );
}

/* ── MATCHER (signature feature) ─────────────────────────── */
function MatchScreen({ openProduct }) {
  const [step, setStep] = useState(0);
  const [skin, setSkin] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [budget, setBudget] = useState(null);

  const toggleConcern = (id) =>
    setConcerns((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < 3 ? [...c, id] : c));

  const results = useMemo(() => {
    if (step < 3) return [];
    const budgetMax = BUDGETS.find((b) => b.id === budget)?.max ?? Infinity;
    return PRODUCTS
      .filter((p) => p.verified) // only safe products get recommended
      .map((p) => {
        let score = 0;
        const reasons = [];
        if (p.skin.includes(skin)) { score += 45; reasons.push(`Untuk kulit ${skin}`); }
        const hits = concerns.filter((c) => p.concern.includes(c));
        score += hits.length * 18;
        hits.forEach((h) => reasons.push(`Atasi ${CONCERNS.find((c) => c.id === h)?.label.toLowerCase()}`));
        if (p.price <= budgetMax) { score += 15; reasons.push("Sesuai budget"); }
        else { score -= 15; }
        if (p.worth) score += 8;
        score = Math.max(20, Math.min(98, score));
        return { p, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [step, skin, concerns, budget]);

  const reset = () => { setStep(0); setSkin(null); setConcerns([]); setBudget(null); };

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.charcoal }}>Cocokin</h1>
      <p style={{ fontSize: 12.5, color: C.gray, marginTop: 2 }}>3 pertanyaan. Lalu kami tunjukkan apa yang pas untukmu.</p>

      {/* progress */}
      {step < 3 && (
        <div className="flex gap-1.5 mt-4 mb-5">
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ flex: 1, height: 5, borderRadius: 999, background: i <= step ? C.rose : C.border }} />
          ))}
        </div>
      )}

      {/* Step 0 — skin */}
      {step === 0 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 14 }}>Jenis kulitmu apa?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {SKIN_TYPES.map((s) => {
              const Icon = s.icon; const on = skin === s.id;
              return (
                <button key={s.id} onClick={() => setSkin(s.id)}
                  style={{ background: on ? C.rose : C.white, border: `1.5px solid ${on ? C.rose : C.border}`,
                    borderRadius: 16, padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <Icon size={22} style={{ color: on ? C.white : C.rose }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: on ? C.white : C.charcoal }}>{s.label}</span>
                </button>
              );
            })}
          </div>
          <NextBtn disabled={!skin} onClick={() => setStep(1)} />
        </div>
      )}

      {/* Step 1 — concerns */}
      {step === 1 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 4 }}>Apa yang ingin kamu atasi?</p>
          <p style={{ fontSize: 11.5, color: C.gray, marginBottom: 14 }}>Pilih maksimal 3</p>
          <div className="flex flex-wrap gap-2">
            {CONCERNS.map((c) => {
              const on = concerns.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggleConcern(c.id)}
                  style={{ background: on ? C.rose : C.white, border: `1.5px solid ${on ? C.rose : C.border}`,
                    borderRadius: 999, padding: "10px 16px", fontSize: 13, fontWeight: 600, color: on ? C.white : C.charcoal }}>
                  {on && <Check size={13} style={{ display: "inline", marginRight: 4 }} />}{c.label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-7">
            <BackBtn onClick={() => setStep(0)} />
            <NextBtn disabled={concerns.length === 0} onClick={() => setStep(2)} flex />
          </div>
        </div>
      )}

      {/* Step 2 — budget */}
      {step === 2 && (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.charcoal, marginBottom: 14 }}>Budget per produk?</p>
          <div className="grid gap-2.5">
            {BUDGETS.map((b) => {
              const on = budget === b.id;
              return (
                <button key={b.id} onClick={() => setBudget(b.id)}
                  className="flex items-center justify-between"
                  style={{ background: on ? C.rose : C.white, border: `1.5px solid ${on ? C.rose : C.border}`,
                    borderRadius: 14, padding: "15px 16px" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: on ? C.white : C.charcoal }}>{b.label}</span>
                  {on && <Check size={18} style={{ color: C.white }} />}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-7">
            <BackBtn onClick={() => setStep(1)} />
            <NextBtn disabled={!budget} onClick={() => setStep(3)} flex label="Lihat hasil" />
          </div>
        </div>
      )}

      {/* Step 3 — results */}
      {step === 3 && (
        <div className="mt-1">
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 15, fontWeight: 700, color: C.charcoal }}>Paling cocok untukmu</p>
            <button onClick={reset} style={{ fontSize: 12, fontWeight: 600, color: C.rose }}>Ulangi</button>
          </div>
          {results.map(({ p, score, reasons }) => (
            <ProductCard key={p.id} p={p} matchScore={score} reasons={reasons} onClick={() => openProduct(p)} />
          ))}
          <p style={{ fontSize: 11, color: C.gray, textAlign: "center", marginTop: 6, lineHeight: 1.5 }}>
            Hanya produk ber-BPOM yang kami rekomendasikan.<br />Skor dihitung dari kecocokan kulit, masalah & budget kamu.
          </p>
        </div>
      )}
    </div>
  );
}

function NextBtn({ disabled, onClick, flex, label = "Lanjut" }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className={flex ? "flex-1" : "w-full"}
      style={{ marginTop: flex ? 0 : 28, background: disabled ? C.border : C.rose, color: C.white,
        fontSize: 14, fontWeight: 700, padding: "14px", borderRadius: 14, opacity: disabled ? 0.7 : 1 }}>
      {label}
    </button>
  );
}
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "14px 18px" }}>
      <ArrowLeft size={18} style={{ color: C.charcoal }} />
    </button>
  );
}

/* ── SAFETY CHECK ────────────────────────────────────────── */
function SafetyScreen() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);

  const check = () => {
    const term = q.trim().toLowerCase();
    if (!term) return;
    const found = PRODUCTS.find(
      (p) => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term) ||
        (p.bpom && p.bpom.toLowerCase().includes(term))
    );
    if (!found) setResult({ status: "unknown" });
    else if (found.verified) setResult({ status: "safe", p: found });
    else setResult({ status: "warn", p: found });
  };

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.charcoal }}>Cek Aman</h1>
      <p style={{ fontSize: 12.5, color: C.gray, marginTop: 2 }}>Cek status BPOM & keaslian sebelum kamu beli atau pakai.</p>

      <div className="flex gap-2 mt-5">
        <div className="flex-1 flex items-center gap-2" style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 14px" }}>
          <Search size={18} style={{ color: C.gray }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Nama produk / brand / no. BPOM"
            style={{ flex: 1, border: "none", outline: "none", fontSize: 13.5, color: C.charcoal, background: "transparent" }} />
        </div>
        <button onClick={check} style={{ background: C.caramel, color: C.white, fontWeight: 700, fontSize: 13, padding: "0 18px", borderRadius: 14 }}>
          Cek
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        <span style={{ fontSize: 11, color: C.gray }}>Coba:</span>
        {["Lokal Glow", "Mystiq", "Niacinamide"].map((t) => (
          <button key={t} onClick={() => setQ(t)} style={{ fontSize: 11, color: C.rose, fontWeight: 600 }}>{t}</button>
        ))}
      </div>

      {/* Result */}
      {result?.status === "safe" && (
        <ResultCard color={C.sage} bg="#F2F8F0" icon={<BadgeCheck size={26} style={{ color: C.sageDeep }} />}
          title="Aman & Terdaftar" sub={`${result.p.brand} · ${result.p.name}`}>
          <Row k="Status BPOM" v="Terdaftar ✓" vc={C.sageDeep} />
          <Row k="No. Registrasi" v={result.p.bpom} />
          <Row k="Penilaian Beautifio" v={result.p.worth ? "Direkomendasikan" : "Layak, dengan catatan"} />
          <p style={{ fontSize: 12, color: C.charcoal, marginTop: 10, lineHeight: 1.5 }}>{result.p.verdict}</p>
        </ResultCard>
      )}
      {result?.status === "warn" && (
        <ResultCard color={C.gold} bg="#FDF6EC" icon={<AlertTriangle size={26} style={{ color: C.gold }} />}
          title="Hati-hati" sub={`${result.p.brand} · ${result.p.name}`}>
          <Row k="Status BPOM" v="Tidak ditemukan" vc={C.gold} />
          <p style={{ fontSize: 12, color: C.charcoal, marginTop: 10, lineHeight: 1.5 }}>
            Produk ini belum punya nomor BPOM resmi di data kami. Tunda dulu pembelian sampai keasliannya jelas.
          </p>
        </ResultCard>
      )}
      {result?.status === "unknown" && (
        <ResultCard color={C.gray} bg={C.cream} icon={<Search size={24} style={{ color: C.gray }} />}
          title="Belum ada di data kami" sub="">
          <p style={{ fontSize: 12.5, color: C.charcoal, lineHeight: 1.5 }}>
            Kami belum punya datanya. Cek langsung di <b>cekbpom.pom.go.id</b>, atau laporkan produk ini supaya kami review.
          </p>
        </ResultCard>
      )}

      {!result && (
        <div className="mt-7" style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>Kenapa ini penting?</p>
          <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.55 }}>
            Banyak produk ilegal mengandung merkuri atau hidrokuinon yang merusak kulit jangka panjang.
            Sebelum tergoda produk viral, pastikan dulu aman. Kesehatan kulitmu nggak bisa di-refund.
          </p>
        </div>
      )}
    </div>
  );
}
function ResultCard({ color, bg, icon, title, sub, children }) {
  return (
    <div className="mt-6" style={{ background: bg, border: `1.5px solid ${color}`, borderRadius: 18, padding: 16 }}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <div>
          <p style={{ fontSize: 16, fontWeight: 800, color }}>{title}</p>
          {sub && <p style={{ fontSize: 12, color: C.gray }}>{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
function Row({ k, v, vc }) {
  return (
    <div className="flex items-center justify-between" style={{ padding: "5px 0" }}>
      <span style={{ fontSize: 12, color: C.gray }}>{k}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: vc || C.charcoal }}>{v}</span>
    </div>
  );
}

/* ── REVIEWS ─────────────────────────────────────────────── */
function ReviewScreen() {
  const [reviews, setReviews] = useState(REVIEWS);
  const toggleHelpful = (id) =>
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, helpful: r.helpful + (r.liked ? -1 : 1), liked: !r.liked } : r)));

  return (
    <div className="px-4 pt-5 pb-2">
      <h1 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: C.charcoal }}>Ulasan Komunitas</h1>
      <p style={{ fontSize: 12.5, color: C.gray, marginTop: 2 }}>Dari pengguna asli, jujur — termasuk yang kecewa.</p>

      <div className="flex items-center gap-2 mt-4 mb-5" style={{ background: C.cream, borderRadius: 12, padding: "10px 12px" }}>
        <BadgeCheck size={16} style={{ color: C.sage }} />
        <p style={{ fontSize: 11.5, color: C.charcoal }}>Hanya pembeli terverifikasi yang bisa menulis ulasan.</p>
      </div>

      {reviews.map((r) => (
        <div key={r.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 12 }}>
          <div className="flex items-center gap-2.5 mb-2">
            <span style={{ width: 38, height: 38, borderRadius: 999, background: C.soft, display: "grid", placeItems: "center", fontSize: 18 }}>{r.avatar}</span>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 13.5, fontWeight: 700, color: C.charcoal }}>{r.user}</span>
                {r.verified && <BadgeCheck size={13} style={{ color: C.sage }} />}
              </div>
              <span style={{ fontSize: 11, color: C.gray }}>Kulit {r.skin}</span>
            </div>
            <Stars value={r.rating} />
          </div>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.rose, marginBottom: 4 }}>{r.product}</p>
          <p style={{ fontSize: 13, color: C.charcoal, lineHeight: 1.5 }}>{r.text}</p>
          <button onClick={() => toggleHelpful(r.id)} className="inline-flex items-center gap-1.5 mt-3"
            style={{ fontSize: 11.5, fontWeight: 600, color: r.liked ? C.rose : C.gray }}>
            <Heart size={14} fill={r.liked ? C.rose : "none"} /> Membantu ({r.helpful})
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── PROFILE ─────────────────────────────────────────────── */
function ProfileScreen() {
  const points = 3240;
  const tier = "Enthusiast";
  const nextTier = 5000;
  const badges = [
    { icon: Sparkles, label: "First Match", on: true },
    { icon: MessageSquareHeart, label: "5 Ulasan", on: true },
    { icon: ShieldCheck, label: "Safety Hero", on: true },
    { icon: Coffee, label: "Glow & Brew", on: false },
  ];
  const rewards = [
    { pts: 1000, label: "Diskon Rp5.000" },
    { pts: 2500, label: "Free ongkir" },
    { pts: 5000, label: "Tester kit gratis" },
    { pts: 8000, label: "Free kopi Glow & Brew" },
  ];
  return (
    <div className="pb-2">
      <div style={{ background: C.plum, padding: "24px 18px 30px", borderRadius: "0 0 26px 26px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -30, top: -20, width: 110, height: 110, borderRadius: 999, background: C.rose, opacity: 0.3 }} />
        <div style={{ width: 64, height: 64, borderRadius: 999, background: C.soft, display: "grid", placeItems: "center", fontSize: 30, margin: "0 auto" }}>🌷</div>
        <p style={{ color: C.white, fontFamily: serif, fontSize: 19, fontWeight: 700, marginTop: 8 }}>Sasa</p>
        <div className="inline-flex items-center gap-1.5 mt-1" style={{ background: C.rose, padding: "4px 12px", borderRadius: 999 }}>
          <Award size={13} style={{ color: C.white }} />
          <span style={{ color: C.white, fontSize: 12, fontWeight: 700 }}>{tier}</span>
        </div>
      </div>

      <div className="px-4 -mt-5">
        {/* Points card */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16, boxShadow: "0 4px 14px rgba(74,35,53,0.06)" }}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12, color: C.gray }}>
              <Coins size={15} style={{ color: C.gold }} /> Poin kamu
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, fontFamily: serif }}>{points.toLocaleString("id-ID")}</span>
          </div>
          <div style={{ height: 8, background: C.border, borderRadius: 999, marginTop: 12, overflow: "hidden" }}>
            <div style={{ width: `${(points / nextTier) * 100}%`, height: "100%", background: C.rose, borderRadius: 999 }} />
          </div>
          <p style={{ fontSize: 11, color: C.gray, marginTop: 6 }}>{(nextTier - points).toLocaleString("id-ID")} poin lagi ke tier Expert</p>
        </div>

        {/* Badges */}
        <p style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, margin: "20px 0 10px" }}>Lencana</p>
        <div className="grid grid-cols-4 gap-2">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} style={{ background: b.on ? C.white : C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 6px", textAlign: "center", opacity: b.on ? 1 : 0.5 }}>
                <Icon size={20} style={{ color: b.on ? C.rose : C.gray, margin: "0 auto" }} />
                <p style={{ fontSize: 9.5, fontWeight: 600, color: C.charcoal, marginTop: 5 }}>{b.label}</p>
              </div>
            );
          })}
        </div>

        {/* Rewards */}
        <p style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, margin: "20px 0 10px" }}>Tukar poin</p>
        {rewards.map((r, i) => {
          const can = points >= r.pts;
          return (
            <div key={i} className="flex items-center justify-between" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
              <div className="flex items-center gap-2.5">
                <span style={{ width: 32, height: 32, borderRadius: 10, background: C.cream, display: "grid", placeItems: "center" }}>
                  <Gift size={15} style={{ color: C.rose }} />
                </span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.charcoal }}>{r.label}</p>
                  <p style={{ fontSize: 11, color: C.gray }}>{r.pts.toLocaleString("id-ID")} poin</p>
                </div>
              </div>
              <button disabled={!can} style={{ fontSize: 12, fontWeight: 700, color: can ? C.white : C.gray, background: can ? C.rose : C.border, padding: "7px 14px", borderRadius: 999 }}>
                {can ? "Tukar" : "Kurang"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── PRODUCT DETAIL ──────────────────────────────────────── */
function ProductDetail({ p, onBack }) {
  const productReviews = REVIEWS.filter((r) => p.name.includes(r.product.split(" ")[0]) || r.product.includes(p.name.split(" ")[0]));
  return (
    <div className="pb-2">
      <div style={{ background: C.plum, padding: "16px 16px 24px", borderRadius: "0 0 24px 24px" }}>
        <button onClick={onBack} className="inline-flex items-center gap-1.5" style={{ color: C.blush, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="flex items-center gap-4 mt-4">
          <div style={{ width: 76, height: 76, borderRadius: 18, background: C.soft, display: "grid", placeItems: "center", fontSize: 38 }}>{p.emoji}</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.blush, letterSpacing: 1 }}>{p.brand.toUpperCase()}</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.white, fontFamily: serif, lineHeight: 1.15 }}>{p.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Stars value={p.rating} /><span style={{ fontSize: 12, color: C.blush }}>{p.rating} · {p.reviews}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontSize: 22, fontWeight: 800, color: C.charcoal }}>{rupiah(p.price)}</span>
          <VerifiedTag ok={p.verified} />
        </div>

        {/* Honest verdict */}
        <div style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 16, padding: 14, marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: C.rose, marginBottom: 5 }}>VERDICT BEAUTIFIO</p>
          <p style={{ fontSize: 13.5, color: C.charcoal, lineHeight: 1.5 }}>{p.verdict}</p>
          {!p.worth && (
            <div className="inline-flex items-center gap-1.5 mt-2" style={{ fontSize: 11, fontWeight: 600, color: C.gold }}>
              <AlertTriangle size={13} /> Ada alternatif lebih worth — cek lewat Cocokin
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          <Pill bg={C.soft} color={C.roseDeep}>{p.cat}</Pill>
          {p.skin.slice(0, 3).map((s) => <Pill key={s} bg={C.caramelBg} color={C.caramel}>Kulit {s}</Pill>)}
        </div>

        {/* Reviews */}
        {productReviews.length > 0 && (
          <>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.charcoal, marginBottom: 10 }}>Kata pengguna</p>
            {productReviews.map((r) => (
              <div key={r.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: 12, marginBottom: 10 }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5" style={{ fontSize: 12.5, fontWeight: 700, color: C.charcoal }}>
                    {r.avatar} {r.user} <span style={{ fontSize: 10.5, fontWeight: 400, color: C.gray }}>· {r.skin}</span>
                  </span>
                  <Stars value={r.rating} size={11} />
                </div>
                <p style={{ fontSize: 12.5, color: C.charcoal, lineHeight: 1.45 }}>{r.text}</p>
              </div>
            ))}
          </>
        )}

        {/* CTA — affiliate, no inventory */}
        <button style={{ width: "100%", background: p.verified ? C.rose : C.border, color: C.white, fontSize: 15, fontWeight: 700, padding: 15, borderRadius: 16, marginTop: 8, opacity: p.verified ? 1 : 0.7 }}>
          {p.verified ? "Beli lewat partner tepercaya" : "Belum direkomendasikan"}
        </button>
        <p style={{ fontSize: 10.5, color: C.gray, textAlign: "center", marginTop: 8 }}>
          Beautifio dapat komisi kecil. Verdict kami tetap jujur — itu janji kami.
        </p>
      </div>
    </div>
  );
}

/* ── ROOT ────────────────────────────────────────────────── */
export default function Beautifio() {
  const [tab, setTab] = useState("home");
  const [product, setProduct] = useState(null);

  const go = (t) => { setProduct(null); setTab(t); };
  const openProduct = (p) => setProduct(p);

  const NAV = [
    { id: "home", label: "Beranda", icon: Home },
    { id: "match", label: "Cocokin", icon: Sparkles },
    { id: "safety", label: "Cek Aman", icon: ShieldCheck },
    { id: "review", label: "Ulasan", icon: MessageSquareHeart },
    { id: "profile", label: "Saya", icon: User },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.charcoal, display: "flex", justifyContent: "center", alignItems: "flex-start", fontFamily: "system-ui, -apple-system, sans-serif", padding: "0" }}>
      {/* Phone frame */}
      <div style={{ width: "100%", maxWidth: 412, minHeight: "100vh", background: C.cream, position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 0 40px rgba(0,0,0,0.3)" }}>
        {/* top status bar */}
        <div className="flex items-center justify-between" style={{ padding: "10px 18px 6px", background: tab === "home" || tab === "profile" || product ? C.plum : C.cream }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: tab === "home" || tab === "profile" || product ? C.white : C.charcoal, fontFamily: serif, letterSpacing: 2 }}>BEAUTIFIO</span>
          <span style={{ fontSize: 11, color: tab === "home" || tab === "profile" || product ? C.blush : C.gray }}>Jogja</span>
        </div>

        {/* content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 78 }}>
          {product ? <ProductDetail p={product} onBack={() => setProduct(null)} />
            : tab === "home" ? <HomeScreen go={go} openProduct={openProduct} />
            : tab === "match" ? <MatchScreen openProduct={openProduct} />
            : tab === "safety" ? <SafetyScreen />
            : tab === "review" ? <ReviewScreen />
            : <ProfileScreen />}
        </div>

        {/* bottom nav */}
        <div className="flex items-center justify-around" style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: "8px 4px 12px" }}>
          {NAV.map((nv) => {
            const Icon = nv.icon; const active = tab === nv.id && !product;
            return (
              <button key={nv.id} onClick={() => go(nv.id)} className="flex flex-col items-center" style={{ gap: 3, flex: 1 }}>
                <Icon size={21} style={{ color: active ? C.rose : C.gray }} fill={active ? C.soft : "none"} />
                <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, color: active ? C.rose : C.gray }}>{nv.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
