import { Router } from "express";
import { db } from "@workspace/db";
import { couponsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateCouponBody,
  UpdateCouponBody,
  ValidateCouponBody,
} from "@workspace/api-zod";

const router = Router();

function mapCoupon(c: typeof couponsTable.$inferSelect) {
  return {
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountAmount: Number(c.discountAmount),
    minOrderAmount: Number(c.minOrderAmount ?? 0),
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
  };
}

// GET /api/coupons
router.get("/coupons", async (_req, res) => {
  const coupons = await db.select().from(couponsTable);
  res.json(coupons.map(mapCoupon));
});

// POST /api/coupons
router.post("/coupons", async (req, res) => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const { code, discountType, discountAmount, minOrderAmount, maxUses, expiresAt, isActive } = parsed.data;

  const [coupon] = await db
    .insert(couponsTable)
    .values({
      code: code.toUpperCase(),
      discountType,
      discountAmount: String(discountAmount),
      minOrderAmount: minOrderAmount != null ? String(minOrderAmount) : "0",
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true,
    })
    .returning();

  res.status(201).json(mapCoupon(coupon));
});

// PUT /api/coupons/:id
router.put("/coupons/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = UpdateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const data = parsed.data;
  const updates: Partial<typeof couponsTable.$inferInsert> = {};
  if (data.code !== undefined) updates.code = data.code.toUpperCase();
  if (data.discountType !== undefined) updates.discountType = data.discountType;
  if (data.discountAmount !== undefined) updates.discountAmount = String(data.discountAmount);
  if (data.minOrderAmount !== undefined) updates.minOrderAmount = String(data.minOrderAmount);
  if (data.maxUses !== undefined) updates.maxUses = data.maxUses;
  if (data.expiresAt !== undefined) updates.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
  if (data.isActive !== undefined) updates.isActive = data.isActive;

  const [coupon] = await db
    .update(couponsTable)
    .set(updates)
    .where(eq(couponsTable.id, id))
    .returning();

  if (!coupon) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }

  res.json(mapCoupon(coupon));
});

// DELETE /api/coupons/:id
router.delete("/coupons/:id", async (req, res) => {
  await db.delete(couponsTable).where(eq(couponsTable.id, parseInt(req.params.id)));
  res.status(204).send();
});

// POST /api/coupons/validate
router.post("/coupons/validate", async (req, res) => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "code and orderTotal required" });
    return;
  }

  const { code, orderTotal } = parsed.data;

  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(couponsTable.code, code.toUpperCase()))
    .limit(1);

  if (!coupon) {
    res.json({ valid: false, discountAmount: 0, message: "Coupon not found", coupon: null });
    return;
  }

  if (!coupon.isActive) {
    res.json({ valid: false, discountAmount: 0, message: "Coupon is inactive", coupon: null });
    return;
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    res.json({ valid: false, discountAmount: 0, message: "Coupon has expired", coupon: null });
    return;
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    res.json({ valid: false, discountAmount: 0, message: "Coupon usage limit reached", coupon: null });
    return;
  }

  const minOrder = Number(coupon.minOrderAmount ?? 0);
  if (orderTotal < minOrder) {
    res.json({
      valid: false,
      discountAmount: 0,
      message: `Minimum order of $${minOrder.toFixed(2)} required`,
      coupon: null,
    });
    return;
  }

  let discountAmount = 0;
  if (coupon.discountType === "percentage") {
    discountAmount = (orderTotal * Number(coupon.discountAmount)) / 100;
  } else {
    discountAmount = Math.min(Number(coupon.discountAmount), orderTotal);
  }

  res.json({
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100,
    message: "Coupon applied successfully",
    coupon: mapCoupon(coupon),
  });
});

export default router;
