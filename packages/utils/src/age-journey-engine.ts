import { ROADMAP_V3_SEED } from "./roadmap-v3-seed";
import type { RoadmapBigWin, AgePathStage, RoadmapV3 } from "@beautifio/types";

export type AgeGroup = "8-12" | "13-15" | "16-18" | "19-22" | "23+";

export interface AgeGroupedBigWin {
  title: string;
  description: string;
  why_it_matters: string;
  alternative_path: string;
  order: number;
}

export interface AgeGroupedSmallWin {
  big_win_title: string;
  title: string;
  description: string;
  order: number;
}

const AGE_GROUPS: { key: AgeGroup; min: number; max: number; label: string }[] = [
  { key: "8-12",  min: 8,  max: 12, label: "Masa Penemuan" },
  { key: "13-15", min: 13, max: 15, label: "Masa Pengembangan" },
  { key: "16-18", min: 16, max: 18, label: "Masa Persiapan" },
  { key: "19-22", min: 19, max: 22, label: "Masa Percepatan" },
  { key: "23+",   min: 23, max: 99, label: "Masa Profesional" },
];

export function getAgeGroup(age: number): AgeGroup | null {
  for (const g of AGE_GROUPS) {
    if (age >= g.min && age <= g.max) return g.key;
  }
  return null;
}

export function getAgeGroupLabel(ageGroup: AgeGroup): string {
  return AGE_GROUPS.find((g) => g.key === ageGroup)?.label ?? "";
}

export function getAgeRangeLabel(ageGroup: AgeGroup): string {
  const g = AGE_GROUPS.find((a) => a.key === ageGroup);
  return g ? `${g.min}-${g.max} tahun` : "";
}

const STAGE_TO_AGE_GROUPS: Record<string, AgeGroup[]> = {
  beginner: ["8-12"],
  intermediate: ["13-15"],
  advanced: ["16-18", "19-22"],
  professional: ["23+"],
};

export function getStageForAge(age: number): string[] {
  const group = getAgeGroup(age);
  if (!group) return [];
  const stages: string[] = [];
  for (const [stage, groups] of Object.entries(STAGE_TO_AGE_GROUPS)) {
    if (groups.includes(group)) stages.push(stage);
  }
  return stages;
}

function parseAgeRange(range: string): { min: number; max: number } | null {
  const parts = range.split("-");
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10);
    const max = parts[1] === "+" ? 99 : parseInt(parts[1], 10);
    if (!isNaN(min) && !isNaN(max)) return { min, max };
  }
  return null;
}

function ageRangesOverlap(r1: { min: number; max: number }, r2: { min: number; max: number }): boolean {
  return r1.min <= r2.max && r2.min <= r1.max;
}

function bigWinsToAgeGrouped(
  bigWins: RoadmapBigWin[],
  agePath: AgePathStage[],
  roadmap: RoadmapV3
): Record<string, AgeGroupedBigWin[]> {
  const result: Record<string, AgeGroupedBigWin[]> = {
    "8-12": [],
    "13-15": [],
    "16-18": [],
    "19-22": [],
    "23+": [],
  };

  for (const bigWin of bigWins) {
    const stages = bigWin.stage;
    const ageGroups = STAGE_TO_AGE_GROUPS[stages] ?? [];

    for (const group of ageGroups) {
      result[group].push({
        title: bigWin.title,
        description: bigWin.description,
        why_it_matters: roadmap.blueprint?.successFactors?.join(", ") || "",
        alternative_path: "",
        order: bigWin.order,
      });
    }
  }

  for (const stage of agePath) {
    const parsed = parseAgeRange(stage.ageRange);
    if (!parsed) continue;

    for (const groupKey of Object.keys(result) as AgeGroup[]) {
      const g = AGE_GROUPS.find((a) => a.key === groupKey);
      if (!g) continue;
      const groupRange = { min: g.min, max: g.max };

      if (ageRangesOverlap(parsed, groupRange) || parsed.min <= g.max && parsed.max >= g.min) {
        stage.milestones.forEach((milestone, idx) => {
          result[groupKey].push({
            title: milestone,
            description: stage.title + " — " + stage.description,
            why_it_matters: roadmap.dream.whyMatters,
            alternative_path: "",
            order: result[groupKey].length + idx + 1,
          });
        });
      }
    }
  }

  for (const groupKey of Object.keys(result) as AgeGroup[]) {
    result[groupKey].sort((a, b) => a.order - b.order);
    result[groupKey] = result[groupKey].filter(
      (bw, idx, self) => idx === self.findIndex((b) => b.title === bw.title)
    );
    result[groupKey].forEach((bw, idx) => { bw.order = idx + 1; });
  }

  return result;
}

function smallWinsFromBigWins(bigWins: AgeGroupedBigWin[]): AgeGroupedSmallWin[] {
  const smallWins: AgeGroupedSmallWin[] = [];
  for (const bw of bigWins) {
    smallWins.push({
      big_win_title: bw.title,
      title: "Pelajari " + bw.title.toLowerCase(),
      description: "Mulai langkah pertama untuk " + bw.title.toLowerCase(),
      order: 1,
    });
    smallWins.push({
      big_win_title: bw.title,
      title: "Praktikkan " + bw.title.toLowerCase(),
      description: "Terapkan apa yang sudah dipelajari tentang " + bw.title.toLowerCase(),
      order: 2,
    });
    smallWins.push({
      big_win_title: bw.title,
      title: "Refleksi " + bw.title.toLowerCase(),
      description: "Evaluasi kemajuan " + bw.title.toLowerCase(),
      order: 3,
    });
  }
  return smallWins;
}

export function getAgeGroupedContent(
  slug: string,
  age: number
): {
  bigWins: AgeGroupedBigWin[];
  smallWins: AgeGroupedSmallWin[];
  ageGroup: AgeGroup | null;
} | null {
  const roadmap = ROADMAP_V3_SEED[slug];
  if (!roadmap) return null;

  const ageGroup = getAgeGroup(age);
  if (!ageGroup) {
    const defaultBigWins = roadmap.bigWins.map((bw) => ({
      title: bw.title,
      description: bw.description,
      why_it_matters: roadmap.blueprint?.successFactors?.join(", ") || "",
      alternative_path: "",
      order: bw.order,
    }));
    return { bigWins: defaultBigWins, smallWins: smallWinsFromBigWins(defaultBigWins), ageGroup: null };
  }

  const all = bigWinsToAgeGrouped(roadmap.bigWins, roadmap.agePath, roadmap);
  const bigWins = all[ageGroup];

  if (bigWins.length === 0) {
    const defaultBigWins = roadmap.bigWins.map((bw) => ({
      title: bw.title,
      description: bw.description,
      why_it_matters: roadmap.blueprint?.successFactors?.join(", ") || "",
      alternative_path: "",
      order: bw.order,
    }));
    return { bigWins: defaultBigWins, smallWins: smallWinsFromBigWins(defaultBigWins), ageGroup };
  }

  return { bigWins, smallWins: smallWinsFromBigWins(bigWins), ageGroup };
}

export function getAlternativeFuturesForTemplate(slug: string): {
  title: string;
  description: string;
  skills: string[];
}[] {
  const roadmap = ROADMAP_V3_SEED[slug];
  if (!roadmap) return [];

  const futures: { title: string; description: string; skills: string[] }[] = [];

  if (roadmap.realityCheck?.transferableSkills) {
    futures.push({
      title: "Skill yang Bisa Dipakai di Mana Saja",
      description: "Kemampuan yang kamu pelajari dari perjalanan ini berguna di banyak bidang lain.",
      skills: roadmap.realityCheck.transferableSkills,
    });
  }

  if (roadmap.alternativePaths) {
    for (const ap of roadmap.alternativePaths) {
      for (const step of ap.steps) {
        futures.push({
          title: step.role,
          description: ap.scenario + " — " + step.description,
          skills: [step.transition],
        });
      }
    }
  }

  if (roadmap.alternativeFutures) {
    for (const af of roadmap.alternativeFutures) {
      futures.push({
        title: af.title,
        description: af.description,
        skills: af.skills,
      });
    }
  }

  return futures;
}

export function getDreamMeaning(slug: string): string {
  const roadmap = ROADMAP_V3_SEED[slug];
  if (!roadmap) return "";
  return roadmap.dream.whyMatters;
}

export function getCareerOptions(slug: string): string[] {
  const roadmap = ROADMAP_V3_SEED[slug];
  if (!roadmap) return [];
  return roadmap.dream.careerPossibilities;
}
