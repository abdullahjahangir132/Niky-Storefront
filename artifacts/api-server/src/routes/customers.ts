// @ts-nocheck
import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable } from "@workspace/db";
import { ilike, or, sql, desc } from "drizzle-orm";

const router = Router();

interface CustomerRow {
  email: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
  joinedAt: string;
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

// GET /api/admin/customers
router.get("/admin/customers", async (req, res) => {
  const search = req.query.search as string | undefined;
  const limit = Math.min(parseInt(String(req.query.limit || "20")), 100);
  const offset = parseInt(String(req.query.offset || "0"));

  const rows = await db
    .select({
      email: ordersTable.customerEmail,
      name: ordersTable.customerName,
      phone: ordersTable.customerPhone,
      totalOrders: sql<number>`count(*)`,
      totalSpent: sql<number>`sum(${ordersTable.total})`,
      lastOrderAt: sql<string>`max(${ordersTable.createdAt})`,
      joinedAt: sql<string>`min(${ordersTable.createdAt})`,
    })
    .from(ordersTable)
    .where(
      search
        ? or(
            ilike(ordersTable.customerEmail, `%${search}%`),
            ilike(ordersTable.customerName, `%${search}%`)
          )
        : undefined
    )
    .groupBy(ordersTable.customerEmail, ordersTable.customerName, ordersTable.customerPhone)
    .orderBy(desc(sql`max(${ordersTable.createdAt})`));

  const total = rows.length;
  const paginated = rows.slice(offset, offset + limit);

  const customers: CustomerRow[] = paginated.map((r) => ({
    email: r.email,
    name: r.name,
    phone: r.phone ?? "",
    totalOrders: Number(r.totalOrders),
    totalSpent: Number(r.totalSpent ?? 0),
    lastOrderAt: r.lastOrderAt ? new Date(r.lastOrderAt).toISOString() : new Date().toISOString(),
    joinedAt: r.joinedAt ? new Date(r.joinedAt).toISOString() : new Date().toISOString(),
  }));

  res.json({ customers, total, limit, offset });
});

// GET /api/admin/customers/:email
router.get("/admin/customers/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);

  const [summary] = await db
    .select({
      email: ordersTable.customerEmail,
      name: ordersTable.customerName,
      phone: ordersTable.customerPhone,
      totalOrders: sql<number>`count(*)`,
      totalSpent: sql<number>`sum(${ordersTable.total})`,
      joinedAt: sql<string>`min(${ordersTable.createdAt})`,
    })
    .from(ordersTable)
    .where(ilike(ordersTable.customerEmail, email))
    .groupBy(ordersTable.customerEmail, ordersTable.customerName, ordersTable.customerPhone);

  if (!summary) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(ilike(ordersTable.customerEmail, email))
    .orderBy(desc(ordersTable.createdAt));

  res.json({
    email: summary.email,
    name: summary.name,
    phone: summary.phone ?? "",
    totalOrders: Number(summary.totalOrders),
    totalSpent: Number(summary.totalSpent ?? 0),
    joinedAt: summary.joinedAt ? new Date(summary.joinedAt).toISOString() : new Date().toISOString(),
    orders: orders.map(mapOrder),
  });
});

export default router;
