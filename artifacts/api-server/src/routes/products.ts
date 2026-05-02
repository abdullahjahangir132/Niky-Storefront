import { Router } from "express";
import { db } from "@workspace/db";
import {
  productsTable,
  categoriesTable,
  insertProductSchema,
} from "@workspace/db";
import { eq, ilike, and, or, sql, desc, asc } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
} from "@workspace/api-zod";

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
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : null,
    categoryId: p.categoryId,
    categoryName,
    imageUrl: p.imageUrl,
    imageUrls: p.imageUrls,
    sizes: p.sizes,
    colors: p.colors,
    stock: p.stock,
    isFeatured: p.isFeatured,
    isNew: p.isNew,
    salesCount: p.salesCount,
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /api/products
router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const { category, search, sort, featured, onSale, limit = 20, offset = 0 } = parsed.data;

  const conditions = [];
  if (category) {
    const cat = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, category))
      .limit(1);
    if (cat.length > 0) {
      conditions.push(eq(productsTable.categoryId, cat[0].id));
    }
  }
  if (search) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${search}%`),
        ilike(productsTable.description, `%${search}%`)
      )!
    );
  }
  if (featured !== undefined) {
    conditions.push(eq(productsTable.isFeatured, featured));
  }
  if (onSale) {
    conditions.push(sql`${productsTable.salePrice} IS NOT NULL`);
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sort) {
    case "price_asc":
      orderBy = asc(productsTable.price);
      break;
    case "price_desc":
      orderBy = desc(productsTable.price);
      break;
    case "popular":
      orderBy = desc(productsTable.salesCount);
      break;
    default:
      orderBy = desc(productsTable.createdAt);
  }

  const [products, total] = await Promise.all([
    db
      .select({
        product: productsTable,
        categoryName: categoriesTable.name,
      })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(productsTable)
      .where(where),
  ]);

  res.json({
    products: products.map((r) =>
      mapProduct(r.product, r.categoryName ?? "")
    ),
    total: Number(total[0].count),
    limit,
    offset,
  });
});

// GET /api/products/:id
router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, parsed.data.id))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(mapProduct(rows[0].product, rows[0].categoryName ?? ""));
});

// POST /api/products
router.post("/products", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const data = parsed.data;
  const slug = slugify(data.name);

  const [product] = await db
    .insert(productsTable)
    .values({
      name: data.name,
      slug,
      description: data.description,
      price: String(data.price),
      salePrice: data.salePrice != null ? String(data.salePrice) : null,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      imageUrls: data.imageUrls ?? [],
      sizes: data.sizes,
      colors: data.colors,
      stock: data.stock,
      isFeatured: data.isFeatured ?? false,
      isNew: data.isNew ?? false,
    })
    .returning();

  const cat = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, product.categoryId))
    .limit(1);

  res.status(201).json(mapProduct(product, cat[0]?.name ?? ""));
});

// PUT /api/products/:id
router.put("/products/:id", async (req, res) => {
  const idParsed = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const data = parsed.data;
  const updates: Partial<typeof productsTable.$inferInsert> = {};
  if (data.name !== undefined) {
    updates.name = data.name;
    updates.slug = slugify(data.name);
  }
  if (data.description !== undefined) updates.description = data.description;
  if (data.price !== undefined) updates.price = String(data.price);
  if (data.salePrice !== undefined)
    updates.salePrice = data.salePrice != null ? String(data.salePrice) : null;
  if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
  if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl;
  if (data.imageUrls !== undefined) updates.imageUrls = data.imageUrls;
  if (data.sizes !== undefined) updates.sizes = data.sizes;
  if (data.colors !== undefined) updates.colors = data.colors;
  if (data.stock !== undefined) updates.stock = data.stock;
  if (data.isFeatured !== undefined) updates.isFeatured = data.isFeatured;
  if (data.isNew !== undefined) updates.isNew = data.isNew;

  const [product] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, idParsed.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const cat = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.id, product.categoryId))
    .limit(1);

  res.json(mapProduct(product, cat[0]?.name ?? ""));
});

// DELETE /api/products/:id
router.delete("/products/:id", async (req, res) => {
  const parsed = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  await db
    .delete(productsTable)
    .where(eq(productsTable.id, parsed.data.id));

  res.status(204).send();
});

export default router;
