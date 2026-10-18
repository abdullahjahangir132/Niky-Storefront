// @ts-nocheck
import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, cartItemsTable, productsTable, couponsTable } from "@workspace/db";
import { eq, sql, desc, ilike, or } from "drizzle-orm";

const router = Router();

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `NS-${year}-${rand}`;
}

function mapOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    addressLine2: o.addressLine2,
    city: o.city,
    province: o.province,
    postalCode: o.postalCode,
    country: o.country,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    couponCode: o.couponCode ?? null,
    discountAmount: Number(o.discountAmount),
    items: o.items,
    subtotal: Number(o.subtotal),
    shippingCost: Number(o.shippingCost),
    total: Number(o.total),
    trackingNumber: o.trackingNumber ?? null,
    notes: o.notes ?? null,
    createdAt: o.createdAt.toISOString(),
  };
}

// GET /api/orders
router.get("/orders", async (req, res) => {
  const { status, search, limit = "20", offset = "0" } = req.query as Record<string, string | undefined>;
  const lim = parseInt(limit) || 20;
  const off = parseInt(offset) || 0;

  const conditions: any[] = [];
  if (status) conditions.push(eq(ordersTable.status, status));
  if (search) {
    conditions.push(or(
      ilike(ordersTable.customerName, `%${search}%`),
      ilike(ordersTable.orderNumber, `%${search}%`)
    )!);
  }

  const where = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`) : undefined;

  const [orders, total] = await Promise.all([
    db.select().from(ordersTable).where(where).orderBy(desc(ordersTable.createdAt)).limit(lim).offset(off),
    db.select({ count: sql<number>`count(*)` }).from(ordersTable).where(where),
  ]);

  res.json({ orders: orders.map(mapOrder), total: Number(total[0].count), limit: lim, offset: off });
});

// POST /api/orders
router.post("/orders", async (req, res) => {
  const {
    customerName, customerEmail, customerPhone = "",
    shippingAddress, addressLine2 = "", city, province = "", postalCode = "",
    country = "Pakistan", paymentMethod = "cod",
    couponCode, items: manualItems, sessionId,
  } = req.body;

  if (!customerName || !customerEmail || !shippingAddress || !city) {
    res.status(400).json({ error: "Customer name, email, shipping address, and city are required" });
    return;
  }

  let items: any[];

  if (manualItems && Array.isArray(manualItems) && manualItems.length > 0) {
    // Items provided directly (from frontend)
    items = await Promise.all(manualItems.map(async (item: any) => {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      return {
        id: item.productId,
        productId: item.productId,
        productName: product?.name ?? item.productName ?? "",
        productImageUrl: product?.imageUrl ?? item.productImageUrl ?? "",
        price: item.price || Number(product?.salePrice ?? product?.price ?? 0),
        size: item.size ?? "",
        color: item.color ?? "",
        quantity: item.quantity ?? 1,
      };
    }));
  } else if (sessionId) {
    // From cart
    const cartRows = await db
      .select({ cartItem: cartItemsTable, productName: productsTable.name, productImageUrl: productsTable.imageUrl })
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, sessionId));

    if (cartRows.length === 0) { res.status(400).json({ error: "Cart is empty" }); return; }
    items = cartRows.map(r => ({
      id: r.cartItem.id,
      productId: r.cartItem.productId,
      productName: r.productName ?? "",
      productImageUrl: r.productImageUrl ?? "",
      price: Number(r.cartItem.price),
      size: r.cartItem.size,
      color: r.cartItem.color,
      quantity: r.cartItem.quantity,
    }));
  } else {
    res.status(400).json({ error: "Either items or sessionId is required" });
    return;
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const FREE_SHIPPING_THRESHOLD = 3000;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 200;

  // Apply coupon
  let discountAmount = 0;
  let validCoupon: string | undefined;
  if (couponCode) {
    const [coupon] = await db.select().from(couponsTable).where(eq(couponsTable.code, couponCode.toUpperCase())).limit(1);
    if (coupon && coupon.isActive) {
      if (coupon.discountType === "percentage") {
        discountAmount = (subtotal * Number(coupon.discountAmount)) / 100;
      } else {
        discountAmount = Number(coupon.discountAmount);
      }
      discountAmount = Math.min(discountAmount, subtotal);
      validCoupon = coupon.code;
      await db.update(couponsTable).set({ usedCount: sql`${couponsTable.usedCount} + 1` }).where(eq(couponsTable.id, coupon.id));
    }
  }

  const total = subtotal + shippingCost - discountAmount;
  const orderNumber = generateOrderNumber();

  const [order] = await db.insert(ordersTable).values({
    orderNumber,
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    addressLine2,
    city,
    province,
    postalCode,
    country,
    status: "pending",
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    couponCode: validCoupon ?? null,
    discountAmount: String(discountAmount),
    items,
    subtotal: String(subtotal),
    shippingCost: String(shippingCost),
    total: String(total),
  }).returning();

  // Update sales counts
  for (const item of items) {
    await db.update(productsTable)
      .set({ salesCount: sql`${productsTable.salesCount} + ${item.quantity}` })
      .where(eq(productsTable.id, item.productId));
  }

  // Clear cart if session-based
  if (sessionId) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));
  }

  res.status(201).json(mapOrder(order));
});

// POST /api/orders/track
router.post("/orders/track", async (req, res) => {
  const { orderNumber, email } = req.body;
  if (!orderNumber || !email) { res.status(400).json({ error: "Order number and email are required" }); return; }

  const [order] = await db.select().from(ordersTable)
    .where(sql`${ordersTable.orderNumber} = ${orderNumber} AND ${ordersTable.customerEmail} = ${email.toLowerCase()}`)
    .limit(1);

  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(mapOrder(order));
});

// GET /api/orders/:id
router.get("/orders/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapOrder(order));
});

// PUT /api/orders/:id/status
router.put("/orders/:id/status", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, trackingNumber, notes } = req.body;
  if (!status) { res.status(400).json({ error: "status is required" }); return; }

  const updates: Partial<typeof ordersTable.$inferInsert> = { status };
  if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
  if (notes !== undefined) updates.notes = notes;

  const [order] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapOrder(order));
});

// Keep old PUT /orders/:id for admin status updates
router.put("/orders/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { status, trackingNumber, notes } = req.body;
  if (!status) { res.status(400).json({ error: "status is required" }); return; }

  const updates: Partial<typeof ordersTable.$inferInsert> = { status };
  if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
  if (notes !== undefined) updates.notes = notes;

  const [order] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mapOrder(order));
});

export default router;
