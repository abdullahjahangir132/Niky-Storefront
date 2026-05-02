import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_SETTINGS = {
  storeName: "NIKY",
  logoUrl: "",
  contactEmail: "support@niky.store",
  contactPhone: "+1 800 NIKY SHOE",
  address: "123 Sneaker Ave, New York, NY 10001",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  shippingRate: 15,
  freeShippingThreshold: 150,
  currency: "USD",
};

async function getAllSettings(): Promise<typeof DEFAULT_SETTINGS> {
  const rows = await db.select().from(settingsTable);
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  return {
    storeName: map.storeName ?? DEFAULT_SETTINGS.storeName,
    logoUrl: map.logoUrl ?? DEFAULT_SETTINGS.logoUrl,
    contactEmail: map.contactEmail ?? DEFAULT_SETTINGS.contactEmail,
    contactPhone: map.contactPhone ?? DEFAULT_SETTINGS.contactPhone,
    address: map.address ?? DEFAULT_SETTINGS.address,
    facebookUrl: map.facebookUrl ?? DEFAULT_SETTINGS.facebookUrl,
    instagramUrl: map.instagramUrl ?? DEFAULT_SETTINGS.instagramUrl,
    twitterUrl: map.twitterUrl ?? DEFAULT_SETTINGS.twitterUrl,
    shippingRate: Number(map.shippingRate ?? DEFAULT_SETTINGS.shippingRate),
    freeShippingThreshold: Number(map.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold),
    currency: map.currency ?? DEFAULT_SETTINGS.currency,
  };
}

// GET /api/admin/settings
router.get("/admin/settings", async (_req, res) => {
  res.json(await getAllSettings());
});

// PUT /api/admin/settings
router.put("/admin/settings", async (req, res) => {
  const body = req.body as Partial<typeof DEFAULT_SETTINGS>;

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    await db
      .insert(settingsTable)
      .values({ key, value: String(value), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settingsTable.key,
        set: { value: String(value), updatedAt: new Date() },
      });
  }

  res.json(await getAllSettings());
});

export default router;
