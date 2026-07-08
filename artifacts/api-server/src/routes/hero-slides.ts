import { Router } from "express";
import { db } from "@workspace/db";
import { heroSlidesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { CreateHeroSlideBody, UpdateHeroSlideBody, UpdateHeroSlideParams, DeleteHeroSlideParams } from "@workspace/api-zod";

const router = Router();

// GET /api/hero-slides — public, active slides only, ordered
router.get("/hero-slides", async (_req, res) => {
  const rows = await db
    .select()
    .from(heroSlidesTable)
    .where(eq(heroSlidesTable.isActive, true))
    .orderBy(asc(heroSlidesTable.sortOrder), asc(heroSlidesTable.id));
  res.json(rows);
});

// GET /api/admin/hero-slides — admin, all slides
router.get("/admin/hero-slides", async (_req, res) => {
  const rows = await db
    .select()
    .from(heroSlidesTable)
    .orderBy(asc(heroSlidesTable.sortOrder), asc(heroSlidesTable.id));
  res.json(rows);
});

// POST /api/admin/hero-slides
router.post("/admin/hero-slides", async (req, res) => {
  const parsed = CreateHeroSlideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const [slide] = await db.insert(heroSlidesTable).values(parsed.data).returning();
  res.status(201).json(slide);
});

// PUT /api/admin/hero-slides/:id
router.put("/admin/hero-slides/:id", async (req, res) => {
  const idParsed = UpdateHeroSlideParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateHeroSlideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const [slide] = await db
    .update(heroSlidesTable)
    .set(parsed.data)
    .where(eq(heroSlidesTable.id, idParsed.data.id))
    .returning();

  if (!slide) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(slide);
});

// DELETE /api/admin/hero-slides/:id
router.delete("/admin/hero-slides/:id", async (req, res) => {
  const parsed = DeleteHeroSlideParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db.delete(heroSlidesTable).where(eq(heroSlidesTable.id, parsed.data.id));
  res.status(200).json({ ok: true });
});

export default router;
