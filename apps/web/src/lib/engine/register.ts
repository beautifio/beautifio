import type { ActionType } from "./matcher";

export interface SourceRegistration {
  actionType: ActionType;
  contentType: string;
  label: string;
  matchFields: string[];
  priority: number;
}

const _registered = new Map<string, SourceRegistration>();

export function registerSource(reg: SourceRegistration): void {
  _registered.set(reg.actionType, reg);
}

export function getRegisteredSources(): SourceRegistration[] {
  return Array.from(_registered.values());
}

export function isActionTypeRegistered(actionType: string): boolean {
  return _registered.has(actionType);
}

registerSource({
  actionType: "read_article",
  contentType: "article",
  label: "Baca Artikel",
  matchFields: ["title", "content", "category", "tags"],
  priority: 100,
});

registerSource({
  actionType: "comment_curhat",
  contentType: "curhat",
  label: "Komentari Curhat",
  matchFields: ["title", "content", "category"],
  priority: 80,
});

registerSource({
  actionType: "support_curhat",
  contentType: "curhat",
  label: "Dukung Curhat",
  matchFields: ["title", "content", "category"],
  priority: 70,
});

registerSource({
  actionType: "join_circle",
  contentType: "circle",
  label: "Gabung Circle",
  matchFields: ["name", "description"],
  priority: 60,
});

registerSource({
  actionType: "write_curhat",
  contentType: "curhat",
  label: "Tulis Curhat",
  matchFields: [],
  priority: 50,
});

registerSource({
  actionType: "write_journal",
  contentType: "journal",
  label: "Tulis Jurnal",
  matchFields: [],
  priority: 40,
});
