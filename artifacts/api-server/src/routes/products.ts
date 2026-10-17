// @ts-nocheck
import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, ilike, and, or, sql, desc, asc, gte, lte } from "drizzle-orm";

const router = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
    videoUrl: p.videoUrl,
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

// GET /api/products
router.get("/products", async (req, res) => {
  const {
    category, mainCategory, subCategory, brandLine, tag,
    search, sort, featured, isNew, onSale,
    minPrice, maxPrice,
    limit = "20", offset = "0",
  } = req.query as Record<string, string | undefined>;

  const conditions: any[] = [eq(productsTable.status, "active")];

  if (category) {
    const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, category)).limit(1);
    if (cat.length > 0) conditions.push(eq(productsTable.categoryId, cat[0].id));
  }
  if (mainCategory) conditions.push(eq(productsTable.mainCategory, mainCategory));
  if (subCategory) conditions.push(eq(productsTable.subCategory, subCategory));
  if (brandLine) conditions.push(eq(productsTable.brandLine, brandLine));
  if (tag) conditions.push(sql`${productsTable.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`);
  if (search) {
    conditions.push(or(ilike(productsTable.name, `%${search}%`), ilike(productsTable.description, `%${search}%`))!);
  }
  if (featured === "true") conditions.push(eq(productsTable.isFeatured, true));
  if (isNew === "true") conditions.push(eq(productsTable.isNew, true));
  if (onSale === "true") conditions.push(eq(productsTable.isOnSale, true));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy: any;
  switch (sort) {
    case "price_asc": orderBy = asc(productsTable.price); break;
    case "price_desc": orderBy = desc(productsTable.price); break;
    case "best_selling": orderBy = desc(productsTable.salesCount); break;
    case "best_rated": orderBy = desc(productsTable.ratingAverage); break;
    case "featured": orderBy = desc(productsTable.isFeatured); break;
    default: orderBy = desc(productsTable.createdAt);
  }

  const lim = parseInt(limit as string) || 20;
  const off = parseInt(offset as string) || 0;

  const [products, total] = await Promise.all([
    db.select({ product: productsTable, categoryName: categoriesTable.name })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(orderBy)
      .limit(lim)
      .offset(off),
    db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where),
  ]);

  res.json({
    products: products.map(r => mapProduct(r.product, r.categoryName ?? "")),
    total: Number(total[0].count),
    limit: lim,
    offset: off,
  });
});

// GET /api/products/slug/:slug  — must be BEFORE /products/:id
router.get("/products/slug/:slug", async (req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.slug, req.params.slug))
    .limit(1);

  if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapProduct(rows[0].product, rows[0].categoryName ?? ""));
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id))
    .limit(1);

  if (rows.length === 0) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapProduct(rows[0].product, rows[0].categoryName ?? ""));
});

// POST /api/products
router.post("/products", async (req, res) => {
  const data = req.body;
  if (!data.name || !data.price || !data.categoryId) {
    res.status(400).json({ error: "name, price, and categoryId are required" });
    return;
  }

  const slug = data.slug || slugify(data.name);
  const [product] = await db.insert(productsTable).values({
    name: data.name,
    slug,
    description: data.description ?? "",
    shortDescription: data.shortDescription ?? "",
    price: String(data.price),
    salePrice: data.salePrice != null ? String(data.salePrice) : null,
    costPrice: data.costPrice != null ? String(data.costPrice) : null,
    categoryId: data.categoryId,
    mainCategory: data.mainCategory ?? "men",
    subCategory: data.subCategory ?? "",
    brandLine: data.brandLine ?? "",
    tags: data.tags ?? [],
    imageUrl: data.imageUrl ?? "",
    imageUrls: data.imageUrls ?? [],
    videoUrl: data.videoUrl ?? "",
    sizes: data.sizes ?? [],
    colors: data.colors ?? [],
    stock: data.stock ?? 0,
    sku: data.sku ?? "",
    isFeatured: data.isFeatured ?? false,
    isNew: data.isNew ?? false,
    isOnSale: data.isOnSale ?? false,
    status: data.status ?? "active",
  }).returning();

  const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
  res.status(201).json(mapProduct(product, cat[0]?.name ?? ""));
});

// PUT /api/products/:id
router.put("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const data = req.body;
  const updates: Partial<typeof productsTable.$inferInsert> = {};
  if (data.name !== undefined) { updates.name = data.name; if (!data.slug) updates.slug = slugify(data.name); }
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.description !== undefined) updates.description = data.description;
  if (data.shortDescription !== undefined) updates.shortDescription = data.shortDescription;
  if (data.price !== undefined) updates.price = String(data.price);
  if (data.salePrice !== undefined) updates.salePrice = data.salePrice != null ? String(data.salePrice) : null;
  if (data.costPrice !== undefined) updates.costPrice = data.costPrice != null ? String(data.costPrice) : null;
  if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
  if (data.mainCategory !== undefined) updates.mainCategory = data.mainCategory;
  if (data.subCategory !== undefined) updates.subCategory = data.subCategory;
  if (data.brandLine !== undefined) updates.brandLine = data.brandLine;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
  if (data.imageUrls !== undefined) updates.imageUrls = data.imageUrls;
  if (data.videoUrl !== undefined) updates.videoUrl = data.videoUrl;
  if (data.sizes !== undefined) updates.sizes = data.sizes;
  if (data.colors !== undefined) updates.colors = data.colors;
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.sku !== undefined) updates.sku = data.sku;
  if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
  if (data.isNew !== undefined) updates.isNew = data.isNew;
  if (data.isOnSale !== undefined) updates.isOnSale = data.isOnSale;
  if (data.status !== undefined) updates.status = data.status;

  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Not found" }); return; }

  const cat = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId)).limit(1);
  res.json(mapProduct(product, cat[0]?.name ?? ""));
});

// DELETE /api/products/:id
router.delete("/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ message: "Deleted" });
});

export default router;
