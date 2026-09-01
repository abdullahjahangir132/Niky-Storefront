import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";

const router = Router();

const DEFAULT_THEME_1 = JSON.stringify({ name: "Stealth Black", bg: "#0a0a0a", accent: "#c8102e", highlight: "#ffffff" });
const DEFAULT_THEME_2 = JSON.stringify({ name: "Midnight Navy", bg: "#0d1b2a", accent: "#d4af37", highlight: "#ffffff" });
const DEFAULT_THEME_3 = JSON.stringify({ name: "Forest Elite", bg: "#0d1a10", accent: "#ff3355", highlight: "#ffffff" });

const DEFAULT_ANNOUNCEMENT_ITEMS = JSON.stringify([
  "📞 Helpline: +92 300 1234567",
  "🚚 Standard shipping PKR 200",
  "🎉 Free shipping above PKR 3,000",
  "✨ New Collection — Drop I LIVE NOW",
]);

const DEFAULT_TAG_BAR_ITEMS = JSON.stringify([
  "NANO AIR",
  "NANO PRO",
  "NANO FLEX",
  "NANO CLASSIC",
  "NANO SPORT",
  "NANO LITE",
]);

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
  aiProvider: "anthropic",
  geminiApiKey: "",
  openaiApiKey: "",
  anthropicApiKey: "",
  // Theme settings
  activeTheme: "1",
  heroImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80",
  theme1: DEFAULT_THEME_1,
  theme2: DEFAULT_THEME_2,
  theme3: DEFAULT_THEME_3,
  // Announcement bar
  announcementBarEnabled: "true",
  announcementBarItems: DEFAULT_ANNOUNCEMENT_ITEMS,
  // Tag scroll bar
  tagBarEnabled: "true",
  tagBarItems: DEFAULT_TAG_BAR_ITEMS,
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
    aiProvider: map.aiProvider ?? DEFAULT_SETTINGS.aiProvider,
    geminiApiKey: map.geminiApiKey ?? DEFAULT_SETTINGS.geminiApiKey,
    openaiApiKey: map.openaiApiKey ?? DEFAULT_SETTINGS.openaiApiKey,
    anthropicApiKey: map.anthropicApiKey ?? DEFAULT_SETTINGS.anthropicApiKey,
    shippingRate: Number(map.shippingRate ?? DEFAULT_SETTINGS.shippingRate),
    freeShippingThreshold: Number(map.freeShippingThreshold ?? DEFAULT_SETTINGS.freeShippingThreshold),
    currency: map.currency ?? DEFAULT_SETTINGS.currency,
    codEnabled: map.codEnabled !== undefined ? map.codEnabled === "true" : DEFAULT_SETTINGS.codEnabled,
    cardEnabled: map.cardEnabled !== undefined ? map.cardEnabled === "true" : DEFAULT_SETTINGS.cardEnabled,
    easypaisaEnabled: map.easypaisaEnabled !== undefined ? map.easypaisaEnabled === "true" : DEFAULT_SETTINGS.easypaisaEnabled,
    jazzcashEnabled: map.jazzcashEnabled !== undefined ? map.jazzcashEnabled === "true" : DEFAULT_SETTINGS.jazzcashEnabled,
    activeTheme: map.activeTheme ?? DEFAULT_SETTINGS.activeTheme,
    heroImageUrl: map.heroImageUrl ?? DEFAULT_SETTINGS.heroImageUrl,
    theme1: map.theme1 ?? DEFAULT_SETTINGS.theme1,
    theme2: map.theme2 ?? DEFAULT_SETTINGS.theme2,
    theme3: map.theme3 ?? DEFAULT_SETTINGS.theme3,
    announcementBarEnabled: map.announcementBarEnabled ?? DEFAULT_SETTINGS.announcementBarEnabled,
    announcementBarItems: map.announcementBarItems ?? DEFAULT_SETTINGS.announcementBarItems,
    tagBarEnabled: map.tagBarEnabled ?? DEFAULT_SETTINGS.tagBarEnabled,
    tagBarItems: map.tagBarItems ?? DEFAULT_SETTINGS.tagBarItems,
  };
}

// GET /api/settings/public — returns only display-safe settings (no API keys)
router.get("/settings/public", async (_req, res) => {
  const all = await getAllSettings();
  res.json({
    storeName: all.storeName,
    tagline: all.tagline,
    logoUrl: all.logoUrl,
    contactEmail: all.contactEmail,
    contactPhone: all.contactPhone,
    whatsappNumber: all.whatsappNumber,
    address: all.address,
    facebookUrl: all.facebookUrl,
    instagramUrl: all.instagramUrl,
    tiktokUrl: all.tiktokUrl,
    youtubeUrl: all.youtubeUrl,
    playStoreUrl: all.playStoreUrl,
    appStoreUrl: all.appStoreUrl,
    activeTheme: all.activeTheme,
    heroImageUrl: all.heroImageUrl,
    theme1: all.theme1,
    theme2: all.theme2,
    theme3: all.theme3,
    announcementBarEnabled: all.announcementBarEnabled,
    announcementBarItems: all.announcementBarItems,
    tagBarEnabled: all.tagBarEnabled,
    tagBarItems: all.tagBarItems,
  });
});

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
