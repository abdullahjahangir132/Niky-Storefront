// @ts-nocheck
import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable } from "@workspace/db";
import { eq, sql, desc, lte } from "drizzle-orm";

const router = Router();

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

// GET /api/admin/stats
router.get("/admin/stats", async (_req, res) => {
  const [revenueRow] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)` })
    .from(ordersTable)
    .where(sql`${ordersTable.status} != 'cancelled'`);

  const [ordersRow] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
  const [productsRow] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
  const [customersRow] = await db.select({ count: sql<number>`count(distinct ${ordersTable.customerEmail})` }).from(ordersTable);

  // Compare this month vs last month
  const [thisMonth] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`, count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`"orders"."created_at" >= date_trunc('month', now()) AND "orders"."status" != 'cancelled'`);

  const [lastMonth] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)`, count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`"orders"."created_at" >= date_trunc('month', now() - interval '1 month') AND "orders"."created_at" < date_trunc('month', now()) AND "orders"."status" != 'cancelled'`);

  const revenueChange = lastMonth.total > 0 ? ((Number(thisMonth.total) - Number(lastMonth.total)) / Number(lastMonth.total)) * 100 : 0;
  const ordersChange = lastMonth.count > 0 ? ((Number(thisMonth.count) - Number(lastMonth.count)) / Number(lastMonth.count)) * 100 : 0;

  res.json({
    totalRevenue: Number(revenueRow.total),
    revenueChange: Math.round(revenueChange * 10) / 10,
    totalOrders: Number(ordersRow.count),
    ordersChange: Math.round(ordersChange * 10) / 10,
    totalProducts: Number(productsRow.count),
    totalCustomers: Number(customersRow.count),
  });
});

// GET /api/admin/recent-orders
router.get("/admin/recent-orders", async (req, res) => {
  const limit = parseInt(req.query.limit as string || "10") || 10;
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit);
  res.json(orders.map(mapOrder));
});

// GET /api/admin/top-products
router.get("/admin/top-products", async (req, res) => {
  const limit = parseInt(req.query.limit as string || "5") || 5;
  const products = await db.select().from(productsTable).orderBy(desc(productsTable.salesCount)).limit(limit);
  res.json(products.map(p => ({
    id: p.id, name: p.name, imageUrl: p.imageUrl,
    price: Number(p.price), salesCount: p.salesCount,
    revenue: Number(p.price) * p.salesCount,
  })));
});

// GET /api/admin/monthly-revenue
router.get("/admin/monthly-revenue", async (_req, res) => {
  const rows = await db
    .select({
      month: sql<string>`to_char(${ordersTable.createdAt}, 'YYYY-MM')`,
      revenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)`,
      orders: sql<number>`count(*)`,
    })
    .from(ordersTable)
    .where(sql`${ordersTable.status} != 'cancelled' AND ${ordersTable.createdAt} >= now() - interval '12 months'`)
    .groupBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${ordersTable.createdAt}, 'YYYY-MM')`);

  const monthMap: Record<string, { revenue: number; orders: number }> = {};
  for (const r of rows) monthMap[r.month] = { revenue: Number(r.revenue), orders: Number(r.orders) };

  const result = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
    result.push({ month: label, revenue: monthMap[key]?.revenue ?? 0, orders: monthMap[key]?.orders ?? 0 });
  }
  res.json(result);
});

// GET /api/admin/low-stock
router.get("/admin/low-stock", async (req, res) => {
  const threshold = parseInt(req.query.threshold as string || "5") || 5;
  const products = await db.select().from(productsTable).where(lte(productsTable.stock, threshold)).orderBy(productsTable.stock);
  res.json(products.map(p => ({
    id: p.id, name: p.name, imageUrl: p.imageUrl, stock: p.stock,
    price: Number(p.price), sku: p.sku, status: p.status,
    mainCategory: p.mainCategory, subCategory: p.subCategory,
  })));
});

export default router;
