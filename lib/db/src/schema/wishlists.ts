import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const wishlistsTable = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull().default(""),
    userId: integer("user_id").references(() => usersTable.id),
    productId: integer("product_id")
      .notNull()
      .references(() => productsTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique("wishlist_session_product").on(t.sessionId, t.productId)]
);

export type Wishlist = typeof wishlistsTable.$inferSelect;
