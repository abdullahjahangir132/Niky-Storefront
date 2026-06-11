import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id),
  mainCategory: text("main_category").notNull().default("men"), // men|women|kids
  subCategory: text("sub_category").notNull().default(""), // running|casual|formal|sports|sandals|boots
  brandLine: text("brand_line").notNull().default(""), // Nano Pro|Nano Air|Nano Flex|Nano Classic
  tags: json("tags").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url").notNull().default(""),
  imageUrls: json("image_urls").$type<string[]>().notNull().default([]),
  videoUrl: text("video_url").notNull().default(""),
  sizes: json("sizes").$type<string[]>().notNull().default([]),
  colors: json("colors").$type<{ name: string; hex: string }[]>().notNull().default([]),
  stock: integer("stock").notNull().default(0),
  sku: text("sku").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  status: text("status").notNull().default("active"), // active|draft
  ratingAverage: numeric("rating_average", { precision: 3, scale: 2 }).notNull().default("0"),
  ratingCount: integer("rating_count").notNull().default(0),
  salesCount: integer("sales_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  salesCount: true,
  ratingAverage: true,
  ratingCount: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
