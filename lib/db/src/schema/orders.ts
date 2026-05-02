import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type StoredOrderItem = {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
};

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  shippingAddress: text("shipping_address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  status: text("status").notNull().default("pending"),
  items: json("items").$type<StoredOrderItem[]>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
    .notNull()
    .default("15.00"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
