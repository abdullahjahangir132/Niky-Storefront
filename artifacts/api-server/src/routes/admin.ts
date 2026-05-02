import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, productsTable, categoriesTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { GetRecentOrdersQueryParams, GetTopProductsQueryParams } from "@workspace/api-zod";

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

// GET /api/admin/stats
router.get("/admin/stats", async (_req, res) => {
  const [revenueRow] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)` })
    .from(ordersTable)
    .where(sql`${ordersTable.status} != 'cancelled'`);

  const [ordersRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable);

  const [productsRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable);

  const [pendingRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));

  const statusRows = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  // Unique customers (by email)
  const [customersRow] = await db
    .select({
      count: sql<number>`count(distinct ${ordersTable.customerEmail})`,
    })
    .from(ordersTable);

  res.json({
    totalRevenue: Number(revenueRow.total),
    revenueChange: 12.5,
    totalOrders: Number(ordersRow.count),
    ordersChange: 8.3,
    totalProducts: Number(productsRow.count),
    totalCustomers: Number(customersRow.count),
    pendingOrders: Number(pendingRow.count),
    ordersByStatus: statusRows.map((r) => ({
      status: r.status,
      count: Number(r.count),
    })),
  });
});

// GET /api/admin/recent-orders
router.get("/admin/recent-orders", async (req, res) => {
  const parsed = GetRecentOrdersQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(limit);

  res.json(orders.map(mapOrder));
});

// GET /api/admin/top-products
router.get("/admin/top-products", async (req, res) => {
  const parsed = GetTopProductsQueryParams.safeParse(req.query);
  const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.salesCount))
    .limit(limit);

  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      price: Number(p.price),
      salesCount: p.salesCount,
      revenue: Number(p.price) * p.salesCount,
    }))
  );
});

// GET /api/admin/revenue-by-category
router.get("/admin/revenue-by-category", async (_req, res) => {
  const categories = await db.select().from(categoriesTable);
  const orders = await db.select().from(ordersTable).where(sql`${ordersTable.status} != 'cancelled'`);

  const revenueMap: Record<number, { revenue: number; orderCount: number }> = {};

  for (const order of orders) {
    for (const item of order.items as Array<{ productId: number; price: number; quantity: number }>) {
      const product = await db
        .select({ categoryId: productsTable.categoryId })
        .from(productsTable)
        .where(eq(productsTable.id, item.productId))
        .limit(1);

      if (product.length > 0) {
        const catId = product[0].categoryId;
        if (!revenueMap[catId]) {
          revenueMap[catId] = { revenue: 0, orderCount: 0 };
        }
        revenueMap[catId].revenue += item.price * item.quantity;
        revenueMap[catId].orderCount += 1;
      }
    }
  }

  res.json(
    categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      revenue: revenueMap[cat.id]?.revenue ?? 0,
      orderCount: revenueMap[cat.id]?.orderCount ?? 0,
    }))
  );
});

export default router;
