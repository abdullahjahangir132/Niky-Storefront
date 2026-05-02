import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import {
  ListOrdersQueryParams,
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";

const router = Router();

function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    city: o.city,
    country: o.country,
    status: o.status,
    items: o.items,
    subtotal: Number(o.subtotal),
    shippingCost: Number(o.shippingCost),
    total: Number(o.total),
    createdAt: o.createdAt.toISOString(),
  };
}

// GET /api/orders
router.get("/orders", async (req, res) => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const { status, limit = 20, offset = 0 } = parsed.data;

  const where = status ? eq(ordersTable.status, status) : undefined;

  const [orders, total] = await Promise.all([
    db
      .select()
      .from(ordersTable)
      .where(where)
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(ordersTable)
      .where(where),
  ]);

  res.json({
    orders: orders.map(mapOrder),
    total: Number(total[0].count),
    limit,
    offset,
  });
});

// POST /api/orders
router.post("/orders", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const { sessionId, customerName, customerEmail, customerPhone, shippingAddress, city, country } = parsed.data;

  const cartRows = await db
    .select({
      cartItem: cartItemsTable,
      productName: productsTable.name,
      productImageUrl: productsTable.imageUrl,
    })
    .from(cartItemsTable)
    .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartRows.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const items = cartRows.map((r) => ({
    id: r.cartItem.id,
    productId: r.cartItem.productId,
    productName: r.productName ?? "",
    productImageUrl: r.productImageUrl ?? "",
    price: Number(r.cartItem.price),
    size: r.cartItem.size,
    color: r.cartItem.color,
    quantity: r.cartItem.quantity,
  }));

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = 15;
  const total = subtotal + shippingCost;

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName,
      customerEmail,
      customerPhone: customerPhone ?? "",
      shippingAddress,
      city,
      country,
      status: "pending",
      items,
      subtotal: String(subtotal),
      shippingCost: String(shippingCost),
      total: String(total),
    })
    .returning();

  // Update sales counts
  for (const item of items) {
    await db
      .update(productsTable)
      .set({ salesCount: sql`${productsTable.salesCount} + ${item.quantity}` })
      .where(eq(productsTable.id, item.productId));
  }

  // Clear cart
  await db
    .delete(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  res.status(201).json(mapOrder(order));
});

// GET /api/orders/:id
router.get("/orders/:id", async (req, res) => {
  const parsed = GetOrderParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, parsed.data.id))
    .limit(1);

  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(mapOrder(order));
});

// PUT /api/orders/:id
router.put("/orders/:id", async (req, res) => {
  const idParsed = UpdateOrderStatusParams.safeParse({ id: Number(req.params.id) });
  if (!idParsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.format() });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status })
    .where(eq(ordersTable.id, idParsed.data.id))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(mapOrder(order));
});

export default router;
