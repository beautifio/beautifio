import type {
  UserLifeProfile, LifeCapital, GrowthZone, LifeStage,
  CapitalSourceType, LifeLevel,
} from "@beautifio/types";
import { ZONE_INFO, STAGE_INFO, SPIRITUAL_PRACTICES } from "./life-engine-seed";
import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";
import {
  getLifeProfile, getLifeLevel, getCapitalOverview,
  getStrongestCapital, getWeakestCapital, getCapitalGap,
} from "./life-engine";

/* ══════════════════════════════════════════
   AI COACH ENGINE — TYPES
   ══════════════════════════════════════════ */

export interface CoachFocusArea {
  category: string;
  emoji: string;
  title: string;
  description: string;
  action: string;
}

export interface DailyCoachFocus {
  date: string;
  zone: GrowthZone;
  stage: LifeStage;
  greeting: string;
  insight: string;
  focusAreas: CoachFocusArea[];
  motivationSentence: string;
}

export interface WeeklyWin {
  label: string;
  emoji: string;
}

export interface WeeklyChallenge {
  label: string;
  emoji: string;
}

export interface WeeklyGrowthReport {
  weekStart: string;
  weekEnd: string;
  wins: WeeklyWin[];
  challenges: WeeklyChallenge[];
  capitalChanges: Partial<LifeCapital>;
  streakChange: number;
  suggestedImprovements: string[];
  summary: string;
}

export interface FailureCoachResponse {
  whatHappened: string;
  whatWasLearned: string[];
  strengthsBuilt: string[];
  whatToTryNext: string[];
  alternativeRoutes: string[];
  encouragement: string;
}

export interface PivotCoachAnalysis {
  transferableStrengths: string[];
  suggestedPathways: string[];
  newOpportunities: string[];
  capitalPreserved: Partial<LifeCapital>;
  message: string;
}

export interface ReflectionPattern {
  type: "emotion" | "obstacle" | "growth" | "habit";
  label: string;
  detail: string;
}

export interface ReflectionInsight {
  patterns: ReflectionPattern[];
  summary: string;
  deeperQuestions: string[];
  nextAction: string;
}

export interface ZoneAnalysis {
  zone: GrowthZone;
  why: string;
  signalsObserved: string[];
  recommendedActions: string[];
}

export interface CapitalAdvice {
  balanceStatus: "balanced" | "unbalanced";
  strongest: { key: keyof LifeCapital; value: number; label: string };
  weakest: { key: keyof LifeCapital; value: number; label: string };
  gap: number;
  recommendation: string;
  focusMission: string;
}

export interface DreamNavigation {
  nextFocus: string;
  onRightPath: boolean;
  missingSkills: string[];
  opportunities: string[];
  confidence: "high" | "medium" | "low";
}

export interface OpportunityMatch {
  type: "story" | "roadmap" | "circle" | "mentor" | "event";
  title: string;
  reason: string;
  href: string;
}

export interface MotivationMessage {
  message: string;
  context: string;
  emoji: string;
}

export interface PersonalizedInsight {
  type: "capital" | "zone" | "consistency" | "balance" | "growth";
  message: string;
  emoji: string;
  priority: "high" | "medium" | "low";
}

export interface CoachPanelData {
  dailyFocus: DailyCoachFocus;
  insights: PersonalizedInsight[];
  zoneAnalysis: ZoneAnalysis;
  capitalAdvice: CapitalAdvice;
  dreamNavigation: DreamNavigation | null;
  motivation: MotivationMessage;
  opportunities: OpportunityMatch[];
  weeklyReport: WeeklyGrowthReport | null;
}

/* ══════════════════════════════════════════
   AI COACH ENGINE
   ══════════════════════════════════════════ */

function getProfile(): UserLifeProfile {
  return getLifeProfile();
}

function getDreamTitle(slug: string | null): string {
  if (!slug) return "mimpimu";
  return ROADMAP_V3_SEED[slug]?.title ?? slug;
}

/* ─── DAILY COACH FOCUS ─── */

export function generateDailyCoachFocus(): DailyCoachFocus {
  const profile = getProfile();
  const zone = profile.currentZone;
  const stage = profile.currentStage;
  const dream = getDreamTitle(profile.currentDreamSlug);
  const capital = profile.lifeCapital;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";

  const zoneInsights: Record<GrowthZone, string> = {
    comfort: `Kamu berada di ${ZONE_INFO[zone].label}. Tidak apa-apa — tapi ${dream} menunggu keberanianmu.`,
    fear: `${greeting}! Kamu di ${ZONE_INFO[zone].label}. Rasa takut adalah tanda kamu peduli. Satu langkah kecil hari ini.`,
    learning: `Kamu sedang di ${ZONE_INFO[zone].label}. Setiap tantangan adalah guru. ${dream} butuh versi terbaikmu.`,
    growth: `${greeting}! Kamu di ${ZONE_INFO[zone].label}. Momentum ini berharga — gunakan untuk impact yang lebih besar.`,
  };

  const weakest = (Object.entries(capital) as [keyof LifeCapital, number][]).sort((a, b) => a[1] - b[1])[0][0];
  const focusAreaMap: Record<string, { title: string; desc: string; action: string }> = {
    knowledge: { title: "Baca & Pelajari", desc: `Luangkan 15 menit membaca tentang ${dream}`, action: "Buka 1 artikel atau cerita terkait" },
    skill: { title: "Praktik Skill", desc: `Asah kemampuan inti untuk ${dream}`, action: "Praktik 20 menit, catat progresnya" },
    health: { title: "Gerak & Istirahat", desc: "Tubuh adalah aset utama — jaga dengan aktivitas fisik", action: "Jalan kaki 10 menit atau stretching" },
    relationship: { title: "Relasi & Dukungan", desc: "Hubungkan dengan orang yang mendukung perjalananmu", action: "Kirim pesan ke 1 teman atau mentor" },
    character: { title: "Disiplin & Konsisten", desc: "Karakter dibangun dari kebiasaan kecil setiap hari", action: "Catat 1 hal yang kamu selesaikan hari ini" },
    spiritual: { title: "Refleksi & Syukur", desc: "Luangkan waktu untuk memahami makna perjalananmu", action: "Tulis 3 hal yang kamu syukuri hari ini" },
  };

  const spirPractice = SPIRITUAL_PRACTICES[profile.spiritualPreference]?.examples?.[0] ?? "Refleksi diri 5 menit";

  const focusAreas: CoachFocusArea[] = [
    {
      category: "physical",
      emoji: "💪",
      title: "Fisik",
      description: stage === "sd" || stage === "smp" ? "Main dan bergeraklah hari ini" :
                     stage === "sma" ? "Jaga stamina untuk belajar maksimal" :
                     "Aktivitas fisik 20 menit untuk energi",
      action: zone === "comfort" ? "Jalan kaki 5 menit" :
              zone === "fear" ? "Lari kecil 500m" :
              zone === "learning" ? "Olahraga 20 menit" : "Latihan intensitas 30 menit",
    },
    {
      category: "mental",
      emoji: "🧠",
      title: "Mental",
      description: zone === "comfort" ? "Tantang satu asumsi hari ini" :
                   zone === "fear" ? "Hadapi satu ketakutan kecil" :
                   zone === "learning" ? "Rayakan satu progres hari ini" :
                   "Refleksikan dampak yang sudah kamu buat",
      action: `Fokus pada ${focusAreaMap[weakest]?.title.toLowerCase() ?? "pertumbuhan"}`,
    },
    {
      category: "knowledge",
      emoji: "📚",
      title: "Pengetahuan",
      description: focusAreaMap.knowledge.desc,
      action: focusAreaMap.knowledge.action,
    },
    {
      category: "spiritual",
      emoji: "🕊️",
      title: "Spiritual",
      description: `Sesuai preferensimu: ${spirPractice}`,
      action: spirPractice,
    },
    {
      category: "social",
      emoji: "👥",
      title: "Sosial",
      description: stage === "sd" || stage === "smp" ? "Main dengan teman" :
                   stage === "sma" ? "Diskusikan pelajaran dengan teman" :
                   stage === "university" ? "Kolaborasi dengan teman" :
                   "Bangun koneksi yang bermakna hari ini",
      action: "Ajak 1 orang berdiskusi tentang hal yang kamu pelajari",
    },
  ];

  const motMap: Record<GrowthZone, string> = {
    comfort: "Satu langkah kecil keluar dari zona nyaman adalah kemenangan besar.",
    fear: "Keberanian bukan tidak takut — keberanian adalah bertindak meskipun takut.",
    learning: "Kegagalan adalah data. Setiap error adalah progres.",
    growth: "Sekarang saatnya menginspirasi orang lain dengan perjalananmu.",
  };

  return {
    date: new Date().toISOString(),
    zone,
    stage,
    greeting,
    insight: zoneInsights[zone],
    focusAreas,
    motivationSentence: motMap[zone],
  };
}

/* ─── PERSONALIZED INSIGHTS ─── */

export function generateInsights(): PersonalizedInsight[] {
  const profile = getProfile();
  const capital = profile.lifeCapital;
  const overview = getCapitalOverview();
  const insights: PersonalizedInsight[] = [];

  const strongest = getStrongestCapital();
  const weakest = getWeakestCapital();
  const gap = getCapitalGap();

  if (gap > 30) {
    const sLabel = strongest.charAt(0).toUpperCase() + strongest.slice(1);
    const wLabel = weakest.charAt(0).toUpperCase() + weakest.slice(1);
    insights.push({
      type: "balance",
      message: `${sLabel} Capital-mu (${capital[strongest]}) jauh di atas ${wLabel} Capital (${capital[weakest]}). Seimbangkan dengan fokus pada ${wLabel.toLowerCase()}.`,
      emoji: "⚖️",
      priority: "high",
    });
  }

  if (profile.currentZone === "fear" || profile.currentZone === "learning") {
    const trends = overview.trends;
    const improvingCaps = (Object.keys(trends) as (keyof LifeCapital)[]).filter((k) => trends[k].weekly > 0);
    if (improvingCaps.length >= 2) {
      insights.push({
        type: "growth",
        message: `${improvingCaps.length} area capitalmu naik minggu ini. Tanda kamu mulai keluar dari ${ZONE_INFO[profile.currentZone].label}.`,
        emoji: "📈",
        priority: "medium",
      });
    }
  }

  if (profile.resilienceScore > 0) {
    insights.push({
      type: "consistency",
      message: `Resilience score: ${profile.resilienceScore}. Setiap kali kamu bangkit setelah gagal, karaktermu bertambah kuat.`,
      emoji: "💎",
      priority: "medium",
    });
  }

  if (capital.character >= capital.skill && capital.skill > 30) {
    insights.push({
      type: "growth",
      message: "Karaktermu lebih kuat dari skill-mu — ini pertanda kamu punya fondasi yang kokoh.",
      emoji: "⭐",
      priority: "low",
    });
  }

  if (capital.health < 25) {
    insights.push({
      type: "balance",
      message: `${ZONE_INFO[profile.currentZone].emoji} Health Capital rendah. Growth dimulai dari tubuh yang sehat. Prioritaskan istirahat dan gerak.`,
      emoji: "💪",
      priority: "high",
    });
  }

  if (profile.failureReflections.length >= 3) {
    insights.push({
      type: "growth",
      message: `${profile.failureReflections.length} kali refleksi kegagalan — setiap kegagalan adalah batu loncatan. Kamu tumbuh lebih kuat.`,
      emoji: "🔥",
      priority: "low",
    });
  }

  return insights.slice(0, 4);
}

/* ─── ZONE ANALYSIS ─── */

export function analyzeZone(): ZoneAnalysis {
  const profile = getProfile();
  const zone = profile.currentZone;
  const capital = profile.lifeCapital;
  const streak = getRoadmapStreak();
  const vc = getTotalVaultItems();

  const signalsMap: Record<GrowthZone, string[]> = {
    comfort: ["Tidak ada streak aktif", "Belum ada refleksi minggu ini", "Capital tidak banyak berubah"],
    fear: ["Mulai ada streak meski pendek", "Ada keinginan tapi masih ragu", "Masih mencari ritme konsisten"],
    learning: ["Streak mulai konsisten", "Capital naik perlahan", "Mulai menyimpan materi belajar"],
    growth: ["Streak panjang (21+ hari)", "Semua capital di atas 30", "Aktif refleksi dan belajar"],
  };

  const actionsMap: Record<GrowthZone, string[]> = {
    comfort: ["Ambil 1 langkah kecil hari ini", "Tulis 1 hal yang ingin kamu capai", "Baca 1 cerita inspiratif"],
    fear: ["Lakukan 1 hal yang kamu tunda", "Tulis 1 ketakutan dan hadapi", "Ajak 1 teman untuk support"],
    learning: ["Konsisten dengan ritual harian", "Catat progres setiap hari", "Rayakan kemenangan kecil"],
    growth: ["Ajarkan 1 hal ke orang lain", "Cari tantangan baru", "Perluas dampak dan jaringan"],
  };

  return {
    zone,
    why: ZONE_INFO[zone].description,
    signalsObserved: zone === "comfort" && streak === 0
      ? ["Belum ada aktivitas minggu ini", "Capital stabil tanpa perubahan"]
      : signalsMap[zone],
    recommendedActions: actionsMap[zone],
  };
}

/* ─── CAPITAL ADVISOR ─── */

export function getCapitalAdvice(): CapitalAdvice {
  const profile = getProfile();
  const capital = profile.lifeCapital;
  const strongest = getStrongestCapital();
  const weakest = getWeakestCapital();
  const gap = getCapitalGap();

  const capLabels: Record<keyof LifeCapital, { label: string; emoji: string }> = {
    knowledge: { label: "Pengetahuan", emoji: "📚" },
    skill: { label: "Skill", emoji: "⚡" },
    health: { label: "Kesehatan", emoji: "💪" },
    relationship: { label: "Relasi", emoji: "👥" },
    character: { label: "Karakter", emoji: "⭐" },
    spiritual: { label: "Spiritual", emoji: "🕊️" },
  };

  const weakInfo = capLabels[weakest];
  const strongInfo = capLabels[strongest];

  const recommendations: Record<keyof LifeCapital, { rec: string; mission: string }> = {
    knowledge: { rec: "Baca cerita atau artikel baru hari ini. Simpan 1 catatan ke Learning Vault.", mission: "Baca 3 artikel dalam seminggu" },
    skill: { rec: "Praktik skill inti selama 20 menit. Catat progresnya.", mission: "Praktik skill 5 hari berturut-turut" },
    health: { rec: "Fokus pada aktivitas fisik ringan dan tidur cukup. Jangan paksakan.", mission: "Olahraga 30 menit sehari selama 5 hari" },
    relationship: { rec: "Hubungi 1 anggota circle atau mentor. Kehadiranmu berarti.", mission: "Bantu 1 anggota circle minggu ini" },
    character: { rec: "Konsistensi adalah superpower-mu. Jangan lewatkan satu hari pun.", mission: "Streak 7 hari tanpa putus" },
    spiritual: { rec: "Luangkan 5 menit untuk refleksi atau praktik spiritual sesuai keyakinanmu.", mission: "Jurnal syukur 5 hari berturut-turut" },
  };

  return {
    balanceStatus: gap > 30 ? "unbalanced" : "balanced",
    strongest: { key: strongest, value: capital[strongest], label: strongInfo.label },
    weakest: { key: weakest, value: capital[weakest], label: weakInfo.label },
    gap,
    recommendation: gap > 30
      ? `${capital[weakest]} vs ${capital[strongest]}: Terlalu timpang. ${weakInfo.emoji} Fokus pada ${weakInfo.label} selama 1-2 minggu ke depan. ${recommendations[weakest].rec}`
      : `${weakInfo.emoji} Semua capital cukup seimbang. Tapi ${weakInfo.label} masih bisa ditingkatkan. ${recommendations[weakest].rec}`,
    focusMission: recommendations[weakest].mission,
  };
}

/* ─── DREAM NAVIGATOR ─── */

export function navigateDream(): DreamNavigation | null {
  const profile = getProfile();
  if (!profile.currentDreamSlug) return null;

  const dream = getDreamTitle(profile.currentDreamSlug);
  const capital = profile.lifeCapital;
  const roadmap = ROADMAP_V3_SEED[profile.currentDreamSlug];

  const missingSkills: string[] = [];
  if (roadmap) {
    const allSkills = roadmap.smallWins.flatMap((c) => c.skills.map((s) => s.name));
    if (allSkills.length > 0) {
      missingSkills.push(allSkills.slice(0, 3).join(", "));
    }
  }

  const opportunities: string[] = [];
  if (capital.knowledge >= 40) opportunities.push("Ikuti kursus atau workshop");
  if (capital.relationship >= 35) opportunities.push("Cari mentor di bidang ini");
  if (capital.skill >= 30) opportunities.push("Mulai proyek portofolio");

  const avgCap = Object.values(capital).reduce((a, b) => a + b, 0) / 6;

  return {
    nextFocus: capital.skill < capital.knowledge
      ? `Praktik skill ${dream} lebih intensif. Teori sudah cukup, sekarang praktek.`
      : `Perdalam pengetahuan tentang ${dream} — baca kasus nyata dan studi terbaru.`,
    onRightPath: avgCap >= 30 && capital.skill >= 25,
    missingSkills: missingSkills.length > 0 ? missingSkills : ["Identifikasi skill inti yang dibutuhkan"],
    opportunities,
    confidence: avgCap >= 50 ? "high" : avgCap >= 30 ? "medium" : "low",
  };
}

/* ─── OPPORTUNITY MATCHER ─── */

export function matchOpportunities(): OpportunityMatch[] {
  const profile = getProfile();
  const dream = getDreamTitle(profile.currentDreamSlug);

  const matches: OpportunityMatch[] = [
    { type: "story", title: `Cerita tentang ${dream}`, reason: "Inspirasi dari perjalanan orang lain", href: "/cerita" },
    { type: "roadmap", title: `Roadmap ${dream}`, reason: "Panduan langkah demi langkah", href: profile.currentDreamSlug ? `/roadmap/${profile.currentDreamSlug}` : "/roadmap" },
  ];

  if (profile.lifeCapital.relationship >= 30) {
    matches.push({ type: "circle", title: "Gabung Circle", reason: "Temukan komunitas yang sesuai dengan mimpimu", href: "/circle" });
  }

  if (profile.lifeCapital.relationship >= 25) {
    matches.push({ type: "mentor", title: "Cari Mentor", reason: "Dapatkan bimbingan dari yang sudah berpengalaman", href: "/mentors" });
  }

  return matches;
}

/* ─── DREAM COMPANION VOICE ─── */

export function getDreamCompanionVoice(dreamSlug: string | null): string {
  const voices: Record<string, string> = {
    "football-player": "Lapangan masih menunggumu hari ini. Setiap tendangan mendekatkanmu pada mimpimu.",
    doctor: "Satu halaman yang kamu baca hari ini bisa menyelamatkan nyawa seseorang di masa depan.",
    entrepreneur: "Setiap bisnis besar pernah dimulai dari satu ide sederhana. Hari ini, rawat ide itu.",
    programmer: "Baris kode yang kamu tulis hari ini bisa menjadi solusi untuk jutaan orang.",
    musician: "Setiap nada yang kamu latih hari ini adalah langkah menuju panggung impianmu.",
    "content-creator": "Satu konten hari ini bisa menginspirasi ribuan orang yang belum pernah kamu temui.",
    "digital-marketer": "Strategi yang kamu pahami hari ini bisa mengubah cara orang melihat brand.",
    runner: "Setiap langkah hari ini adalah bukti bahwa kamu lebih kuat dari kemarin.",
    athlete: "Latihan hari ini adalah investasi untuk kemenangan di masa depan.",
    "beauty-creator": "Kreativitasmu hari ini bisa membuat seseorang merasa percaya diri.",
    golfer: "Setiap ayunan hari ini mendekatkanmu pada pukulan sempurna.",
  };

  if (!dreamSlug || !voices[dreamSlug]) {
    return "Mimpimu berharga. Teruslah melangkah, meskipun satu langkah kecil hari ini.";
  }
  return voices[dreamSlug];
}

/* ─── MOTIVATION ENGINE ─── */

export function generateMotivation(): MotivationMessage {
  const profile = getProfile();
  const zone = profile.currentZone;
  const dream = getDreamTitle(profile.currentDreamSlug);
  const capital = profile.lifeCapital;
  const avgCap = Math.round(Object.values(capital).reduce((a, b) => a + b, 0) / 6);

  const zoneMotivations: Record<GrowthZone, { message: string; context: string }[]> = {
    comfort: [
      { message: `Mimpimu untuk menjadi ${dream} tidak akan terwujud di zona nyaman. Tapi satu langkah kecil hari ini bisa mengubah segalanya.`, context: "comfort_start" },
      { message: `${ZONE_INFO[zone].emoji} Kamu aman di sini. Tapi ingat — tidak ada yang pernah mengubah hidupnya dengan tetap aman.`, context: "comfort_safe" },
    ],
    fear: [
      { message: `Rasa takutmu adalah tanda bahwa ${dream} benar-benar berarti bagimu. Orang yang tidak peduli tidak akan takut.`, context: "fear_mean" },
      { message: "Keberanian bukan tidak takut. Keberanian adalah suara kecil di akhir hari yang berkata 'aku akan mencoba lagi besok'.", context: "fear_courage" },
      { message: `${ZONE_INFO[zone].emoji} Kamu di sini karena kamu peduli. Dan itu sudah lebih dari cukup untuk memulai.`, context: "fear_care" },
    ],
    learning: [
      { message: `Setiap ahli pernah menjadi pemula. Bedanya? Mereka tidak berhenti. ${dream} butuh versi belajarmu.`, context: "learning_expert" },
      { message: `${ZONE_INFO[zone].emoji} Progresmu ${avgCap}% — ini bukan angka biasa. Ini bukti bahwa kamu terus bergerak maju.`, context: "learning_progress" },
    ],
    growth: [
      { message: `Sekarang kamu di ${ZONE_INFO[zone].label}. Saatnya menginspirasi. Seseorang melihatmu dan berpikir 'aku juga bisa'.`, context: "growth_inspire" },
      { message: `${ZONE_INFO[zone].emoji} Kamu sudah berkembang pesat. Jangan lupa melihat ke belakang untuk melihat seberapa jauh kamu telah melangkah.`, context: "growth_lookback" },
    ],
  };

  const messages = zoneMotivations[zone];
  const pick = messages[Math.floor(Math.random() * messages.length)];

  return {
    message: pick.message,
    context: pick.context,
    emoji: ZONE_INFO[zone].emoji,
  };
}

/* ─── WEEKLY REPORT ─── */

export function generateWeeklyReport(): WeeklyGrowthReport | null {
  const profile = getProfile();
  if (!profile.capitalTrends) return null;

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const weekEnd = now;

  const capitalChanges: Partial<LifeCapital> = {};
  const wins: WeeklyWin[] = [];
  const challenges: WeeklyChallenge[] = [];

  for (const key of Object.keys(profile.capitalTrends) as (keyof LifeCapital)[]) {
    const change = profile.capitalTrends[key]?.weekly ?? 0;
    (capitalChanges as any)[key] = change;
    if (change > 0) {
      wins.push({ label: `${key.charAt(0).toUpperCase() + key.slice(1)} Capital +${change}`, emoji: getCapitalEmoji(key) });
    } else if (change < 0) {
      challenges.push({ label: `${key.charAt(0).toUpperCase() + key.slice(1)} Capital ${change}`, emoji: getCapitalEmoji(key) });
    }
  }

  if (wins.length === 0) wins.push({ label: "Bertahan dan terus hadir", emoji: "💪" });
  if (challenges.length === 0 && profile.currentZone === "comfort") {
    challenges.push({ label: "Belum ada tantangan yang diambil", emoji: "🛋️" });
  }

  const summary = wins.length > challenges.length
    ? `Minggu yang produktif! ${wins.length} area capital meningkat. Fokus terus pada konsistensi.`
    : challenges.length > wins.length
    ? `Minggu yang menantang — tapi kamu tetap di sini. Itu sendiri sudah kemenangan.`
    : `Minggu yang stabil. Saatnya mengambil langkah lebih berani minggu depan.`;

  const improvements = getCapitalAdvice().recommendation
    ? [getCapitalAdvice().recommendation]
    : ["Coba ambil 1 tantangan baru minggu ini"];

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    wins,
    challenges,
    capitalChanges,
    streakChange: getRoadmapStreak(),
    suggestedImprovements: improvements,
    summary,
  };
}

/* ─── FAILURE COACH ─── */

export function generateFailureCoach(milestoneTitle: string, dreamSlug: string): FailureCoachResponse {
  const profile = getProfile();
  const dream = getDreamTitle(dreamSlug);

  return {
    whatHappened: `Kamu belum berhasil menyelesaikan "${milestoneTitle}" dalam perjalanan menjadi ${dream}. Ini bukan kegagalan — ini data.`,
    whatWasLearned: [
      "Kamu sekarang tahu pendekatan mana yang belum berhasil",
      "Kamu lebih memahami batasan dan kapasitasmu saat ini",
      "Proses lebih penting dari hasil — dan kamu tetap bertumbuh selama proses",
    ],
    strengthsBuilt: [
      "Disiplin untuk terus mencoba",
      "Mental yang lebih tangguh dari sebelumnya",
      "Pemahaman yang lebih dalam tentang bidang ini",
    ],
    whatToTryNext: [
      "Pecah milestone ini menjadi langkah yang lebih kecil",
      "Minta masukan dari mentor atau circle",
      "Coba pendekatan yang berbeda dari sebelumnya",
    ],
    alternativeRoutes: [
      `Masih ada jalur lain menuju ${dream} — tidak semua jalan harus lurus`,
      `Pertimbangkan untuk fokus pada aspek lain dulu, lalu kembali lagi`,
    ],
    encouragement: `"${milestoneTitle}" tidak berhasil kali ini. Tapi ${dream} masih menunggumu. Istirahat, belajar, coba lagi. Kamu sudah lebih kuat dari sebelumnya.`,
  };
}

/* ─── PIVOT COACH ─── */

export function generatePivotCoach(newDreamSlug: string): PivotCoachAnalysis {
  const profile = getProfile();
  const newDream = getDreamTitle(newDreamSlug);
  const oldDream = getDreamTitle(profile.currentDreamSlug);

  const transferableStrengths = [
    `Kedisiplinan yang kamu bangun dari ${oldDream}`,
    "Kemampuan belajar mandiri dan konsisten",
    "Manajemen waktu dan prioritas",
    "Adaptabilitas — kemampuan pivot adalah kekuatan langka",
  ];

  return {
    transferableStrengths,
    suggestedPathways: [
      `Mulai dengan membaca tentang ${newDream}`,
      `Cari mentor atau komunitas ${newDream}`,
      `Identifikasi 3 skill utama yang bisa ditransfer langsung`,
    ],
    newOpportunities: [
      `Peluang baru di bidang ${newDream} yang mungkin tidak ada di ${oldDream}`,
      `Kombinasi unique: ${oldDream} + ${newDream} = perspektif langka`,
    ],
    capitalPreserved: {
      character: profile.lifeCapital.character,
      knowledge: profile.lifeCapital.knowledge,
    },
    message: `Pivot dari ${oldDream} ke ${newDream} bukanlah memulai dari nol. ${profile.lifeCapital.character}% karaktermu tetap menjadi modal terbesarmu.`,
  };
}

/* ─── REFLECTION COMPANION ─── */

export function analyzeReflection(text: string): ReflectionInsight {
  const lower = text.toLowerCase();
  const patterns: ReflectionPattern[] = [];

  if (lower.includes("takut") || lower.includes("cemas") || lower.includes("khawatir")) {
    patterns.push({ type: "emotion", label: "Kecemasan", detail: "Ada kekhawatiran yang perlu diakui dan diproses." });
  }
  if (lower.includes("senang") || lower.includes("bangga") || lower.includes("syukur")) {
    patterns.push({ type: "emotion", label: "Emosi Positif", detail: "Kamu mengalami momen yang berarti." });
  }
  if (lower.includes("gagal") || lower.includes("salah") || lower.includes("tidak bisa")) {
    patterns.push({ type: "obstacle", label: "Hambatan", detail: "Ada tantangan yang menghalangi — ini wajar." });
  }
  if (lower.includes("belajar") || lower.includes("paham") || lower.includes("tahu")) {
    patterns.push({ type: "growth", label: "Pertumbuhan", detail: "Kamu menyerap pengetahuan baru." });
  }
  if (lower.includes("coba") || lower.includes("mulai") || lower.includes("rencana")) {
    patterns.push({ type: "habit", label: "Tindakan", detail: "Ada niat untuk bergerak maju." });
  }

  if (patterns.length === 0) {
    patterns.push({ type: "growth", label: "Refleksi", detail: "Kamu meluangkan waktu untuk menulis — itu langkah besar." });
  }

  const emotionCount = patterns.filter((p) => p.type === "emotion").length;
  const obstacleCount = patterns.filter((p) => p.type === "obstacle").length;

  return {
    patterns,
    summary: obstacleCount > 0
      ? "Refleksimu menunjukkan ada hambatan yang sedang kamu hadapi. Sadari bahwa mengakui ini adalah kekuatan."
      : emotionCount > 0
      ? "Refleksimu kaya akan emosi. Kesadaran emosional adalah fondasi kecerdasan diri."
      : "Refleksi yang baik. Kamu sedang memproses pengalamanmu secara aktif.",
    deeperQuestions: [
      "Apa yang bisa kamu pelajari dari situasi ini?",
      "Apa satu langkah kecil yang bisa kamu ambil besok?",
      "Siapa yang bisa kamu ajak bicara tentang ini?",
    ],
    nextAction: "Tulis satu komitmen kecil untuk besok berdasarkan refleksi ini.",
  };
}

/* ─── HELPER ─── */

function getCapitalEmoji(key: keyof LifeCapital): string {
  const map: Record<keyof LifeCapital, string> = {
    knowledge: "📚", skill: "⚡", health: "💪",
    relationship: "👥", character: "⭐", spiritual: "🕊️",
  };
  return map[key];
}

function getRoadmapStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("beautifio_roadmap_dailywins_streak");
    return raw ? (JSON.parse(raw).currentStreak ?? 0) : 0;
  } catch {
    return 0;
  }
}

function getTotalVaultItems(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("beautifio_roadmap_vault");
    if (!raw) return 0;
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items.length : 0;
  } catch {
    return 0;
  }
}

/* ─── PANEL DATA AGGREGATOR ─── */

export function getCoachPanelData(): CoachPanelData {
  return {
    dailyFocus: generateDailyCoachFocus(),
    insights: generateInsights(),
    zoneAnalysis: analyzeZone(),
    capitalAdvice: getCapitalAdvice(),
    dreamNavigation: navigateDream(),
    motivation: generateMotivation(),
    opportunities: matchOpportunities(),
    weeklyReport: generateWeeklyReport(),
  };
}
