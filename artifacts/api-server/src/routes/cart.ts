import { Router } from "express";
import { db } from "@workspace/db";
import { cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetCartQueryParams,
  AddCartItemBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveCartItemParams,
} from "@workspace/api-zod";

const router = Router();

async function buildCart(sessionId: string) {
  const items = await db
    .select({
      cartItem: cartItemsTable,
      productName: productsTable.name,
      productImageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  const mappedItems = items.map((r) => ({
    id: r.cartItem.id,
    productId: r.cartItem.productId,
    productName: r.productName ?? "",
    productImageUrl: r.productImageUrl ?? "",
    price: Number(r.cartItem.price),
    size: r.cartItem.size,
    color: r.cartItem.color,
    quantity: r.cartItem.quantity,
  }));

  const subtotal = mappedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const itemCount = mappedItems.reduce((acc, item) => acc + item.quantity, 0);

  return { sessionId, items: mappedItems, subtotal, itemCount };
}

// GET /api/cart
router.get("/cart", async (req, res) => {
  const parsed = GetCartQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "sessionId required" });
    return;
  }

  res.json(await buildCart(parsed.data.sessionId));
});

// POST /api/cart/items
router.post("/cart/items", async (req, res) => {
  const parsed = AddCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const { sessionId, productId, size, color, quantity } = parsed.data;

  const product = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, productId))
    .limit(1);

  if (product.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const price = product[0].salePrice ?? product[0].price;

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId),
        eq(cartItemsTable.size, size),
        eq(cartItemsTable.color, color)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing[0].quantity + quantity, updatedAt: new Date() })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      size,
      color,
      quantity,
      price: String(price),
    });
  }

  res.json(await buildCart(sessionId));
});

// PUT /api/cart/items/:itemId
router.put("/cart/items/:itemId", async (req, res) => {
  const idParsed = UpdateCartItemParams.safeParse({ itemId: Number(req.params.itemId) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const item = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.id, idParsed.data.itemId))
    .limit(1);

  if (item.length === 0) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  await db
    .update(cartItemsTable)
    .set({ quantity: parsed.data.quantity, updatedAt: new Date() })
    .where(eq(cartItemsTable.id, idParsed.data.itemId));

  res.json(await buildCart(item[0].sessionId));
});

// DELETE /api/cart/items/:itemId
router.delete("/cart/items/:itemId", async (req, res) => {
  const idParsed = RemoveCartItemParams.safeParse({ itemId: Number(req.params.itemId) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid itemId" });
    return;
  }

  const item = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.id, idParsed.data.itemId))
    .limit(1);

  if (item.length === 0) {
    res.status(404).json({ error: "Cart item not found" });
    return;
  }

  const sessionId = item[0].sessionId;

  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.id, idParsed.data.itemId));

  res.json(await buildCart(sessionId));
});

export default router;
