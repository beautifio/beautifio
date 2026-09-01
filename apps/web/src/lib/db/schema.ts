import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: text("slug").unique().notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
