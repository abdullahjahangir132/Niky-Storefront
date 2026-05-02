import { Router } from "express";
import { db } from "@workspace/db";
import { wishlistsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getSessionId(req: any): string {
  if (!req.session.wishlistId) {
    req.session.wishlistId = `wl_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  return req.session.wishlistId as string;
}

function mapProduct(p: typeof productsTable.$inferSelect, categoryName: string) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    costPrice: p.costPrice ? Number(p.costPrice) : null,
    categoryId: p.categoryId,
    categoryName,
    mainCategory: p.mainCategory,
    subCategory: p.subCategory,
    brandLine: p.brandLine,
    tags: p.tags,
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrls,
    sizes: p.sizes,
    colors: p.colors,
    stock: p.stock,
    sku: p.sku,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    isOnSale: p.isOnSale,
    status: p.status,
    ratingAverage: Number(p.ratingAverage),
    ratingCount: p.ratingCount,
    salesCount: p.salesCount,
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /api/wishlist
router.get("/wishlist", async (req, res) => {
  const sessionId = getSessionId(req);
  const items = await db
    .select()
    .from(wishlistsTable)
    .innerJoin(productsTable, eq(wishlistsTable.productId, productsTable.id))
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(wishlistsTable.sessionId, sessionId));

  res.json({ items: items.map(i => mapProduct(i.products, i.categories.name)) });
});

// POST /api/wishlist/:productId
router.post("/wishlist/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const sessionId = getSessionId(req);

  const existing = await db
    .select()
    .from(wishlistsTable)
    .where(and(eq(wishlistsTable.sessionId, sessionId), eq(wishlistsTable.productId, productId)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(wishlistsTable).values({ sessionId, productId });
  }

  res.json({ message: "Added to wishlist" });
});

// DELETE /api/wishlist/:productId
router.delete("/wishlist/:productId", async (req, res) => {
  const productId = parseInt(req.params.productId);
  const sessionId = getSessionId(req);

  await db
    .delete(wishlistsTable)
    .where(and(eq(wishlistsTable.sessionId, sessionId), eq(wishlistsTable.productId, productId)));

  res.json({ message: "Removed from wishlist" });
});

export default router;
