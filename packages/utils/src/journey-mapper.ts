import type { JmCareerPath, JmProfession } from "./journey-mapper-types";
import { getJmEcosystem } from "./journey-mapper-ecosystems";
import { getJmProfessionsByEcosystem, getJmProfession } from "./journey-mapper-professions";
import { resolveJmSkillCodes } from "./journey-mapper-skills";
import { getJmBenchmarks } from "./journey-mapper-benchmarks";
import { getJmOpportunities } from "./journey-mapper-opportunities";

/**
 * Get all career paths for a given dream slug.
 * Returns professions from the matching ecosystem, enriched with benchmarks and skills.
 */
export function getJmCareerPaths(dreamSlug: string): JmCareerPath[] {
  const ecosystem = getJmEcosystem(dreamSlug);
  if (!ecosystem) return [];

  const ecosystemName = ecosystem.title.split(" / ")[0];
  const allMatching: JmProfession[] = [];

  for (const eco of ecosystem.title.split(" / ")) {
    const found = getJmProfessionsByEcosystem(eco);
    allMatching.push(...found);
  }

  const seen = new Set<string>();
  const unique = allMatching.filter((p) => {
    if (seen.has(p.code)) return false;
    seen.add(p.code);
    return true;
  });

  if (unique.length === 0) {
    const pivotEco = ecosystem.title.includes("Olahraga") ? "Olahraga"
      : ecosystem.title.includes("Kesehatan") || ecosystem.title.includes("Medis") ? "Kesehatan"
      : ecosystem.title.includes("Pendidik") ? "Pendidikan"
      : ecosystem.title.includes("Musisi") || ecosystem.title.includes("Film") ? "Seni"
      : ecosystem.title.includes("Jurnalis") || ecosystem.title.includes("Penulis") ? "Media"
      : ecosystem.title.includes("Pengusaha") || ecosystem.title.includes("Entrepreneur") ? "Bisnis"
      : ecosystem.title.includes("Programmer") || ecosystem.title.includes("Tech") ? "Teknologi"
      : ecosystem.title.includes("Chef") || ecosystem.title.includes("Koki") ? "Kuliner"
      : ecosystem.title.includes("Desainer") || ecosystem.title.includes("Seniman") ? "Kreatif"
      : ecosystem.title.includes("Psikolog") ? "Kesehatan"
      : ecosystem.title.includes("Ilmuwan") || ecosystem.title.includes("Peneliti") ? "Teknologi"
      : "";
    const fromPivot = getJmProfessionsByEcosystem(pivotEco);
    unique.push(...fromPivot);
  }

  return unique.slice(0, 6).map((p) => {
    const allSkillCodes = [...p.hardSkillsRequired, ...p.hardSkillsSupporting, ...p.softSkillsRequired, ...p.softSkillsSupporting];
    const benchmarks = getJmBenchmarks(p.code);
    return {
      title: p.name,
      description: p.description,
      skills: resolveJmSkillCodes(allSkillCodes.slice(0, 5)),
      benchmarks: benchmarks.map((b) => ({
        name: b.name,
        context: b.context,
        platform: b.platform,
      })),
    };
  });
}

/**
 * Get career opportunities that match a user's specific skill set.
 * Filters by dream + skills the user has developed.
 */
export function getJmPersonalizedPaths(
  dreamSlug: string,
  developedSkillNames: string[]
): JmCareerPath[] {
  const ecosystem = getJmEcosystem(dreamSlug);
  if (!ecosystem) return [];

  const matchedOpportunities = getJmOpportunities(dreamSlug, developedSkillNames);

  const professionCodes = new Set<string>();
  for (const opp of matchedOpportunities) {
    for (const code of opp.professions) {
      professionCodes.add(code);
    }
  }

  const paths: JmCareerPath[] = [];

  for (const code of professionCodes) {
    const prof = getJmProfession(code);
    if (!prof) continue;

    const allSkillCodes = [...prof.hardSkillsRequired, ...prof.softSkillsRequired, ...prof.hardSkillsSupporting, ...prof.softSkillsSupporting];
    const benchmarks = getJmBenchmarks(code);

    paths.push({
      title: prof.name,
      description: prof.description,
      skills: resolveJmSkillCodes(allSkillCodes.slice(0, 6)),
      benchmarks: benchmarks.map((b) => ({
        name: b.name,
        context: b.context,
        platform: b.platform,
      })),
    });
  }

  return paths;
}

/**
 * Get encouragement text specific to the dream ecosystem.
 */
export function getJmEncouragement(dreamSlug: string): string[] {
  const list: Record<string, string[]> = {
    "football-player": [
      "Kemampuanmu baca permainan dan disiplin latihan bisa dipakai di banyak peran di ekosistem olahraga.",
      "Atlet yang pensiun bukan akhir — banyak yang sukses sebagai pelatih, analis, atau manajer.",
      "Pengalamanmu di lapangan adalah modal berharga, bukan kerugian.",
    ],
    "doctor": [
      "Pengetahuan medis dan kedisiplinanmu sangat berharga — bahkan di luar klinik.",
      "Banyak lulusan kedokteran yang sukses di healthtech, riset, dan edukasi kesehatan.",
      "Ilmu yang kamu pelajari nggak akan sia-sia. Kamu bisa menyembuhkan dengan cara yang berbeda.",
    ],
    "musician": [
      "Kreativitas dan ketajaman rasa musikmu bisa membuka pintu ke industri yang lebih luas.",
      "Banyak musisi hebat yang akhirnya jadi produser, penulis lagu untuk artis besar, atau pengajar.",
      "Kemampuanmu menangkap nuansa dan emosi sangat berharga di industri konten dan media.",
    ],
    "actress": [
      "Kemampuan akting dan ekspresimu sangat dibutuhkan di industri konten, produksi, dan komunikasi.",
      "Banyak aktor yang sukses di belakang layar sebagai sutradara, produser, atau casting director.",
      "Pengalamanmu menghidupkan karakter adalah storytelling skill yang bernilai tinggi.",
    ],
    "teacher": [
      "Jiwa mendidikmu bisa berkembang ke arah yang lebih luas — edtech, konten edukasi, atau kurikulum.",
      "Kemampuanmu menjelaskan hal rumit dengan sederhana sangat dicari di industri mana pun.",
      "Guru yang hebat akhirnya mendidik lebih banyak orang lewat buku, konten, atau sistem.",
    ],
    "chef": [
      "Kemampuan memasak dan memahami rasa bisa membawamu ke food content, product development, atau gizi.",
      "Banyak chef terkenal yang sukses bukan karena restoran, tapi karena konten dan produk.",
      "Keterampilan tangan, kreativitas, dan ketelitianmu berharga di luar dapur.",
    ],
    "designer": [
      "Matamu yang tajam untuk visual adalah tiket masuk ke industri UI/UX, game, atau brand strategy.",
      "Banyak desainer hebat yang akhirnya jadi art director atau creative director.",
      "Kemampuan melihat estetika dan fungsi adalah skill lintas industri yang sangat dicari.",
    ],
    "entrepreneur": [
      "Jiwa founder-mu bisa disalurkan ke banyak peran — venture capital, konsultan, atau intrapreneur di korporat.",
      "Kegagalan startup bukan kegagalan dirimu. Banyak founder hebat yang gagal beberapa kali sebelum sukses.",
      "Skill yang kamu bangun dari nol adalah yang paling berharga: problem solving, leadership, dan adaptabilitas.",
    ],
    "journalist": [
      "Kemampuan menulis dan menggali informasi bisa membawamu ke PR, konten strategy, atau brand communication.",
      "Banyak jurnalis hebat yang akhirnya jadi penulis buku, podcaster, atau brand strategist.",
      "Keterampilan riset dan storytelling-mu sangat dicari di industri kreatif dan korporat.",
    ],
    "psychologist": [
      "Pemahamanmu tentang manusia sangat berharga di HR, pelatihan, konten mental health, dan UX research.",
      "Banyak psikolog yang sukses di corporate training dan pengembangan organisasi.",
      "Kemampuan mendengar dan memahami orang adalah skill yang nggak bisa digantikan AI.",
    ],
    "scientist": [
      "Cara berpikir ilmiahmu adalah superpower — bisa dipakai di data science, analisis, dan konsultasi.",
      "Banyak peneliti yang sukses di industri, kebijakan publik, atau penulisan sains populer.",
      "Rasa ingin tahu dan kedisiplinan akademismu sangat berharga di era informasi ini.",
    ],
    "programmer": [
      "Kemampuan coding-mu adalah fondasi — kamu bisa tumbuh ke data science, product management, atau tech leadership.",
      "Banyak programmer hebat jadi technical writer, developer advocate, atau founder.",
      "Skill teknologi adalah yang paling mudah dipindahkan ke spesialisasi baru yang lebih menarik.",
    ],
  };

  return list[dreamSlug] ?? [
    "Tidak apa-apa. Skill yang kamu kembangkan selama ini pasti berguna di tempat lain.",
    "Kegagalan bukan akhir. Ini batu loncatan ke peluang baru.",
    "Kamu sudah hebat karena berani mencoba. Terus melangkah.",
  ];
}

/**
 * Get ecosystem-specific transferable skills.
 */
export function getJmTransferableSkills(dreamSlug: string): string[] {
  const map: Record<string, string[]> = {
    "football-player": ["Disiplin latihan", "Kerja tim", "Membaca situasi", "Ketahanan fisik & mental"],
    "doctor": ["Ketelitian", "Empati", "Pengambilan keputusan", "Manajemen tekanan"],
    "musician": ["Kreativitas", "Konsistensi latihan", "Kepercayaan diri", "Kepekaan estetika"],
    "actress": ["Ekspresi komunikasi", "Adaptasi karakter", "Kepercayaan diri", "Empati"],
    "teacher": ["Komunikasi", "Kesabaran", "Kemampuan menjelaskan", "Empati"],
    "chef": ["Kreativitas", "Ketelitian", "Manajemen waktu", "Kerja di bawah tekanan"],
    "designer": ["Kreativitas visual", "Ketelitian", "Adaptasi tren", "Kemampuan menerima kritik"],
    "entrepreneur": ["Problem solving", "Kepemimpinan", "Adaptabilitas", "Mengambil risiko"],
    "journalist": ["Riset & analisis", "Komunikasi", "Writing", "Curiosity"],
    "psychologist": ["Empati", "Aktif mendengar", "Analisis perilaku", "Komunikasi"],
    "scientist": ["Riset", "Critical thinking", "Metodologi", "Ketelitian data"],
    "programmer": ["Logical thinking", "Problem solving", "Belajar mandiri", "Detail oriented"],
  };
  return map[dreamSlug] ?? ["Disiplin", "Ketekunan", "Kemampuan belajar", "Manajemen waktu"];
}
