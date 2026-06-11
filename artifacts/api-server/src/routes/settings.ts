import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";

const router = Router();

const DEFAULT_SETTINGS = {
  storeName: "Nano Shoes",
  tagline: "Move Beyond Limits",
  logoUrl: "",
  contactEmail: "support@nanoshoes.pk",
  contactPhone: "+92 300 1234567",
  whatsappNumber: "",
  address: "123 Main Boulevard, Gulberg III, Lahore, Pakistan",
  facebookUrl: "",
  instagramUrl: "https://instagram.com/nanoshoes",
  tiktokUrl: "",
  youtubeUrl: "",
  playStoreUrl: "",
  appStoreUrl: "",
  shippingRate: 200,
  freeShippingThreshold: 3000,
  currency: "PKR",
  codEnabled: true,
  cardEnabled: true,
  easypaisaEnabled: true,
  jazzcashEnabled: true,
};

type SettingsType = typeof DEFAULT_SETTINGS;

async function getAllSettings(): Promise<SettingsType> {
  const rows = await db.select().from(settingsTable);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;

  return {
    storeName: map.storeName ?? DEFAULT_SETTINGS.storeName,
    tagline: map.tagline ?? DEFAULT_SETTINGS.tagline,
    logoUrl: map.logoUrl ?? DEFAULT_SETTINGS.logoUrl,
    contactEmail: map.contactEmail ?? DEFAULT_SETTINGS.contactEmail,
    contactPhone: map.contactPhone ?? DEFAULT_SETTINGS.contactPhone,
    whatsappNumber: map.whatsappNumber ?? DEFAULT_SETTINGS.whatsappNumber,
    address: map.address ?? DEFAULT_SETTINGS.address,
    facebookUrl: map.facebookUrl ?? DEFAULT_SETTINGS.facebookUrl,
    instagramUrl: map.instagramUrl ?? DEFAULT_SETTINGS.instagramUrl,
    tiktokUrl: map.tiktokUrl ?? DEFAULT_SETTINGS.tiktokUrl,
    youtubeUrl: map.youtubeUrl ?? DEFAULT_SETTINGS.youtubeUrl,
    playStoreUrl: map.playStoreUrl ?? DEFAULT_SETTINGS.playStoreUrl,
    appStoreUrl: map.appStoreUrl ?? DEFAULT_SETTINGS.appStoreUrl,
    shippingRate: Number(map.shippingRate ?? DEFAULT_SETTINGS.shippingRate),
    freeShippingThreshold: Number(map.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold),
    currency: map.currency ?? DEFAULT_SETTINGS.currency,
    codEnabled: map.codEnabled !== undefined ? map.codEnabled === "true" : DEFAULT_SETTINGS.codEnabled,
    cardEnabled: map.cardEnabled !== undefined ? map.cardEnabled === "true" : DEFAULT_SETTINGS.cardEnabled,
    easypaisaEnabled: map.easypaisaEnabled !== undefined ? map.easypaisaEnabled === "true" : DEFAULT_SETTINGS.easypaisaEnabled,
    jazzcashEnabled: map.jazzcashEnabled !== undefined ? map.jazzcashEnabled === "true" : DEFAULT_SETTINGS.jazzcashEnabled,
  };
}

// GET /api/admin/settings
router.get("/admin/settings", async (_req, res) => {
  res.json(await getAllSettings());
});

// PUT /api/admin/settings
router.put("/admin/settings", async (req, res) => {
  const body = req.body as Partial<SettingsType>;
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    await db.insert(settingsTable)
      .values({ key, value: String(value), updatedAt: new Date() })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: String(value), updatedAt: new Date() } });
  }
  res.json(await getAllSettings());
});

export default router;
