export interface JmEcosystem {
  code: string;
  slug: string;
  title: string;
  description: string;
  pivotPoint: string;
}

export interface JmProfession {
  code: string;
  name: string;
  ecosystem: string;
  description: string;
  hardSkillsRequired: string[];
  hardSkillsSupporting: string[];
  softSkillsRequired: string[];
  softSkillsSupporting: string[];
}

export interface JmHardSkill {
  code: string;
  name: string;
  category: string;
  description: string;
  tools: string;
}

export interface JmSoftSkill {
  code: string;
  name: string;
  description: string;
}

export interface JmBenchmark {
  professionCode: string;
  name: string;
  context: string;
  platform: string;
}

export interface JmOpportunity {
  dreamSlug: string;
  requiredSkills: string[];
  professions: string[];
  priorityUpgrades: string[];
}

export interface JmCareerPath {
  title: string;
  description: string;
  skills: string[];
  benchmarks: { name: string; context: string; platform: string }[];
}
