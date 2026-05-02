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

export type PaymentMethod = "cod" | "card" | "easypaisa" | "jazzcash";
export type PaymentStatus = "pending" | "paid" | "failed";

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
  orderNumber: text("order_number").notNull().default(""),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull().default(""),
  shippingAddress: text("shipping_address").notNull(),
  addressLine2: text("address_line_2").notNull().default(""),
  city: text("city").notNull(),
  province: text("province").notNull().default(""),
  postalCode: text("postal_code").notNull().default(""),
  country: text("country").notNull().default("Pakistan"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  couponCode: text("coupon_code"),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  items: json("items").$type<StoredOrderItem[]>().notNull().default([]),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
    .notNull()
    .default("200.00"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Order = typeof ordersTable.$inferSelect;
