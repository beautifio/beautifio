import type { JmOpportunity } from "./journey-mapper-types";

export const JM_OPPORTUNITIES: JmOpportunity[] = [
  // Pesepakbola
  { dreamSlug: "football-player", requiredSkills: ["HS01"], professions: ["P010"], priorityUpgrades: ["HS35", "HS44", "HS11"] },
  { dreamSlug: "football-player", requiredSkills: ["HS02", "HS03"], professions: ["P011", "P056"], priorityUpgrades: ["HS11", "HS12", "SS12"] },
  { dreamSlug: "football-player", requiredSkills: ["HS09", "HS26"], professions: ["P012", "P053", "P057"], priorityUpgrades: ["HS09", "HS27", "SS20"] },
  { dreamSlug: "football-player", requiredSkills: ["HS18", "HS14"], professions: ["P004", "P005"], priorityUpgrades: ["HS15", "HS17", "SS15"] },
  { dreamSlug: "football-player", requiredSkills: ["HS24", "HS37"], professions: ["P013", "P046"], priorityUpgrades: ["HS46", "SS19"] },
  { dreamSlug: "football-player", requiredSkills: ["HS22", "HS40", "HS45"], professions: ["P009", "P017", "P008"], priorityUpgrades: ["SS09", "SS10", "SS24"] },
  { dreamSlug: "football-player", requiredSkills: ["HS01", "HS02", "HS22"], professions: ["P011", "P016"], priorityUpgrades: ["HS19", "SS23", "SS09"] },
  { dreamSlug: "football-player", requiredSkills: ["HS41", "HS23"], professions: ["P015", "P104"], priorityUpgrades: ["HS45", "HS22", "SS02"] },

  // Penyanyi / Musisi
  { dreamSlug: "musician", requiredSkills: ["HS36", "HS37"], professions: ["P040", "P041"], priorityUpgrades: ["HS36", "SS05", "SS15"] },
  { dreamSlug: "musician", requiredSkills: ["HS03", "HS11"], professions: ["P056", "P057"], priorityUpgrades: ["SS12", "HS12", "SS21"] },
  { dreamSlug: "musician", requiredSkills: ["HS09", "HS37"], professions: ["P044", "P055"], priorityUpgrades: ["HS08", "SS05", "SS12"] },
  { dreamSlug: "musician", requiredSkills: ["HS24", "SS02"], professions: ["P045", "P037", "P043"], priorityUpgrades: ["HS25", "SS08", "HS34"] },

  // Dokter
  { dreamSlug: "doctor", requiredSkills: ["HS09", "HS11"], professions: ["P026", "P025"], priorityUpgrades: ["HS03", "SS12", "HS12"] },
  { dreamSlug: "doctor", requiredSkills: ["HS22", "HS20"], professions: ["P027", "P029"], priorityUpgrades: ["HS07", "HS19", "SS23"] },
  { dreamSlug: "doctor", requiredSkills: ["HS32", "HS11"], professions: ["P023", "P026"], priorityUpgrades: ["HS31", "SS08", "HS09"] },

  // Aktris
  { dreamSlug: "actress", requiredSkills: ["HS03", "HS11"], professions: ["P056", "P060"], priorityUpgrades: ["SS12", "HS12", "SS21"] },
  { dreamSlug: "actress", requiredSkills: ["HS10", "SS05"], professions: ["P048", "P047", "P049"], priorityUpgrades: ["HS09", "HS20", "SS23"] },

  // Chef
  { dreamSlug: "chef", requiredSkills: ["HS01", "HS03"], professions: ["P087", "P086", "P091"], priorityUpgrades: ["HS31", "HS35", "HS11"] },
  { dreamSlug: "chef", requiredSkills: ["HS32", "HS22"], professions: ["P088", "P023", "P090"], priorityUpgrades: ["HS34", "SS06", "SS15"] },

  // Pengusaha
  { dreamSlug: "entrepreneur", requiredSkills: ["HS11", "HS09"], professions: ["P062", "P061", "P058"], priorityUpgrades: ["HS08", "HS12", "SS16"] },
  { dreamSlug: "entrepreneur", requiredSkills: ["HS22", "HS21", "HS19"], professions: ["P070", "P071", "P064"], priorityUpgrades: ["SS23", "SS09", "SS11"] },

  // Jurnalis
  { dreamSlug: "journalist", requiredSkills: ["HS09", "HS03", "HS24"], professions: ["P056", "P057", "P060"], priorityUpgrades: ["SS12", "HS12", "HS46"] },
  { dreamSlug: "journalist", requiredSkills: ["HS09", "HS22"], professions: ["P059", "P062", "P058"], priorityUpgrades: ["SS16", "SS10", "HS08"] },

  // Desainer
  { dreamSlug: "designer", requiredSkills: ["HS04", "HS07"], professions: ["P075", "P096", "P100"], priorityUpgrades: ["HS26", "HS07", "SS08"] },
  { dreamSlug: "designer", requiredSkills: ["HS04", "HS06"], professions: ["P095", "P083", "P049"], priorityUpgrades: ["HS06", "HS16", "SS05"] },

  // Psikolog
  { dreamSlug: "psychologist", requiredSkills: ["HS09", "HS11"], professions: ["P026", "P038"], priorityUpgrades: ["SS12", "SS08", "HS03"] },
  { dreamSlug: "psychologist", requiredSkills: ["HS25", "HS24"], professions: ["P037", "P073", "P034"], priorityUpgrades: ["SS17", "SS18", "HS20"] },

  // Programmer
  { dreamSlug: "programmer", requiredSkills: ["HS15", "HS14"], professions: ["P076", "P077", "P079"], priorityUpgrades: ["HS17", "SS11", "SS12"] },
  { dreamSlug: "programmer", requiredSkills: ["HS16", "HS07"], professions: ["P074", "P075", "P072"], priorityUpgrades: ["HS26", "SS08", "SS23"] },

  // Guru
  { dreamSlug: "teacher", requiredSkills: ["HS09", "HS03", "HS24"], professions: ["P035", "P037", "P056"], priorityUpgrades: ["HS11", "HS12", "SS12"] },
  { dreamSlug: "teacher", requiredSkills: ["HS22", "HS20"], professions: ["P036", "P033"], priorityUpgrades: ["HS07", "HS19", "SS23"] },

  // Ilmuwan
  { dreamSlug: "scientist", requiredSkills: ["HS09", "HS14"], professions: ["P028", "P076", "P081"], priorityUpgrades: ["HS15", "HS17", "SS11"] },
  { dreamSlug: "scientist", requiredSkills: ["HS22", "HS20"], professions: ["P082", "P070", "P067"], priorityUpgrades: ["SS09", "SS23", "HS19"] },
];

export function getJmOpportunities(dreamSlug: string, skillCodes: string[]): JmOpportunity[] {
  const matched: JmOpportunity[] = [];
  for (const opp of JM_OPPORTUNITIES) {
    if (opp.dreamSlug !== dreamSlug) continue;
    const hasAny = opp.requiredSkills.some((s) => skillCodes.includes(s));
    if (hasAny || skillCodes.length === 0) {
      matched.push(opp);
    }
  }
  return matched;
}
