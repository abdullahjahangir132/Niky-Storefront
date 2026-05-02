import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

function getSessionId(req: any): string {
  return req.sessionID as string;
}

async function buildCart(sessionId: string) {
  const items = await db
    .select({
      cartItem: cartItemsTable,
      productName: productsTable.name,
      productImageUrl: productsTable.imageUrl,
      salePrice: productsTable.salePrice,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  return items.map(r => ({
    id: r.cartItem.id,
    productId: r.cartItem.productId,
    productName: r.productName ?? "",
    productImageUrl: r.productImageUrl ?? "",
    price: Number(r.cartItem.price),
    salePrice: r.salePrice ? Number(r.salePrice) : null,
    size: r.cartItem.size,
    color: r.cartItem.color,
    quantity: r.cartItem.quantity,
    sessionId: r.cartItem.sessionId,
  }));
}

// GET /api/cart
router.get("/cart", async (req, res) => {
  const sessionId = getSessionId(req);
  res.json(await buildCart(sessionId));
});

// POST /api/cart
router.post("/cart", async (req, res) => {
  const { productId, size = "", color = "", quantity = 1 } = req.body;
  const sessionId = getSessionId(req);

  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const price = product.salePrice ?? product.price;

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(
      eq(cartItemsTable.sessionId, sessionId),
      eq(cartItemsTable.productId, productId),
      eq(cartItemsTable.size, size),
      eq(cartItemsTable.color, color)
    ))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, size, color, quantity, price: String(price) });
  }

  const items = await buildCart(sessionId);
  res.json(items[items.length - 1] ?? items[0]);
});

// PUT /api/cart/:id
router.put("/cart/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { quantity } = req.body;
  if (!quantity || quantity < 1) { res.status(400).json({ error: "quantity >= 1 required" }); return; }

  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, id)).limit(1);
  if (!item) { res.status(404).json({ error: "Cart item not found" }); return; }

  const [updated] = await db
    .update(cartItemsTable)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItemsTable.id, id))
    .returning();

  res.json({ ...updated, price: Number(updated.price) });
});

// DELETE /api/cart/clear
router.delete("/cart/clear", async (req, res) => {
  const sessionId = getSessionId(req);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
  res.json({ message: "Cart cleared" });
});

// DELETE /api/cart/:id
router.delete("/cart/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
  res.json({ message: "Removed" });
});

// Legacy routes for backward compat
router.post("/cart/items", async (req, res) => {
  const { productId, size = "", color = "", quantity = 1, sessionId: bodySessionId } = req.body;
  const sessionId = bodySessionId || getSessionId(req);

  if (!productId) { res.status(400).json({ error: "productId is required" }); return; }

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId)).limit(1);
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }

  const price = product.salePrice ?? product.price;
  const existing = await db
    .select().from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.productId, productId), eq(cartItemsTable.size, size), eq(cartItemsTable.color, color)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(cartItemsTable).set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() }).where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({ sessionId, productId, size, color, quantity, price: String(price) });
  }

  res.json(await buildCart(sessionId));
});

router.put("/cart/items/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const { quantity } = req.body;
  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, itemId)).limit(1);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  await db.update(cartItemsTable).set({ quantity, updatedAt: new Date() }).where(eq(cartItemsTable.id, itemId));
  res.json(await buildCart(item.sessionId));
});

router.delete("/cart/items/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  const [item] = await db.select().from(cartItemsTable).where(eq(cartItemsTable.id, itemId)).limit(1);
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  const { sessionId } = item;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.id, itemId));
  res.json(await buildCart(sessionId));
});

export default router;
