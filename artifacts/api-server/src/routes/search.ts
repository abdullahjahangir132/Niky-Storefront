import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";

const router = Router();

// GET /api/search-suggestions — public, popular terms derived from live product data
router.get("/search-suggestions", async (_req, res) => {
  const rows = await db
    .select({
      name: productsTable.name,
      brandLine: productsTable.brandLine,
      tags: productsTable.tags,
    })
    .from(productsTable);

  const counts = new Map<string, number>();
  const bump = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    counts.set(clean, (counts.get(clean) ?? 0) + 1);
  };

  for (const row of rows) {
    (row.tags || []).forEach(bump);
    if (row.brandLine) bump(row.brandLine);
  }

  const terms = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term)
    .slice(0, 8);

  res.json({ terms });
});

export default router;
