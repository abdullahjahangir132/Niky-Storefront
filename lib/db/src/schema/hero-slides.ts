import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const heroSlidesTable = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  mediaType: text("media_type").notNull().default("image"), // image|video
  imageUrl: text("image_url").notNull().default(""),
  imageUrl2: text("image_url_2").notNull().default(""), // optional 2nd image for split layout
  videoUrl: text("video_url").notNull().default(""),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  ctaText: text("cta_text").notNull().default(""),
  ctaLink: text("cta_link").notNull().default(""),
  secondaryCtaText: text("secondary_cta_text").notNull().default(""),
  secondaryCtaLink: text("secondary_cta_link").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHeroSlideSchema = createInsertSchema(heroSlidesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertHeroSlide = z.infer<typeof insertHeroSlideSchema>;
export type HeroSlide = typeof heroSlidesTable.$inferSelect;
