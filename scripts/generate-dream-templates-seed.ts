import { buildDreamTemplates } from "../packages/utils/src/dream-templates";
import * as fs from "fs";
import * as path from "path";

function sqlEscape(val: string): string {
  return val.replace(/'/g, "''");
}

function toJsonb(val: unknown): string {
  return "'" + sqlEscape(JSON.stringify(val)) + "'::jsonb";
}

function toTextArray(arr: string[]): string {
  const elements = arr.map((s) => "'" + sqlEscape(s) + "'").join(", ");
  return `ARRAY[${elements}]`;
}

const templates = buildDreamTemplates();
const entries = Object.values(templates);

const rows: string[] = [];

for (const t of entries) {
  const slug = sqlEscape(t.slug);
  const title = sqlEscape(t.title);
  const emoji = sqlEscape(t.emoji);
  const color = sqlEscape(t.color);
  const category = sqlEscape(t.category);
  const duration = sqlEscape(t.duration ?? "");
  const description = sqlEscape(t.description);
  const why_matters = sqlEscape(t.why_matters);
  const career_options = toTextArray(t.career_options);
  const success_examples = toJsonb(t.success_examples);
  const big_wins = toJsonb(t.big_wins);
  const small_wins = toJsonb(t.small_wins);
  const daily_activities = toJsonb(t.daily_activities);
  const alternative_futures = toJsonb(t.alternative_futures);
  const min_age = t.min_age ?? 0;
  const max_age = t.max_age ?? 99;

  const row = `('${slug}', '${title}', '${emoji}', '${color}', '${category}', '${duration}', '${description}', '${why_matters}', ${career_options}, ${success_examples}, ${big_wins}, ${small_wins}, ${daily_activities}, ${alternative_futures}, ${min_age}, ${max_age})`;
  rows.push(row);
}

const columns = [
  "slug",
  "title",
  "emoji",
  "color",
  "category",
  "duration",
  "description",
  "why_matters",
  "career_options",
  "success_examples",
  "big_wins",
  "small_wins",
  "daily_activities",
  "alternative_futures",
  "min_age",
  "max_age",
];

const sql = `INSERT INTO dream_templates (${columns.join(", ")})\nVALUES\n${rows.join(",\n")};\n`;

const outputPath = path.resolve(process.cwd(), "supabase/seed_dream_templates.sql");
fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`Generated seed file with ${entries.length} templates → ${outputPath}`);
