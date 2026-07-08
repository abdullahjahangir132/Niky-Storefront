import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const MAIN_CATEGORIES = ["men", "women", "kids"] as const;

// GET /api/nav-menu — public, drives the storefront mega-menu from live product taxonomy
router.get("/nav-menu", async (_req, res) => {
  const result: Record<string, { subCategories: string[]; brandLines: string[]; tags: string[] }> = {};

  for (const cat of MAIN_CATEGORIES) {
    const rows = await db
      .select({
        subCategory: productsTable.subCategory,
        brandLine: productsTable.brandLine,
        tags: productsTable.tags,
      })
      .from(productsTable)
      .where(eq(productsTable.mainCategory, cat));

    const subCategories = Array.from(new Set(rows.map((r) => r.subCategory).filter((v): v is string => !!v)));
    const brandLines = Array.from(new Set(rows.map((r) => r.brandLine).filter((v): v is string => !!v)));

    const tagSet = new Set<string>();
    rows.forEach((r) => (r.tags || []).forEach((t) => t && tagSet.add(t)));

    result[cat] = {
      subCategories,
      brandLines,
      tags: Array.from(tagSet).slice(0, 8),
    };
  }

  res.json(result);
});

export default router;
