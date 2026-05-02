# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## NIKY Store — E-Commerce App

### Artifacts

- **`artifacts/niky-store`** — React + Vite storefront + admin panel (preview path `/`)
- **`artifacts/api-server`** — Express 5 + Drizzle ORM API server (path `/api`)

### Design System

- Font: Barlow Condensed (font-display)
- Primary: `#111111`, Accent: `#C8102E` (red)
- Bold uppercase headings, premium black/white/red palette

### Storefront Pages

- `/` — Home (hero, featured products, new arrivals)
- `/shop` — Shop with filters (category, size, price)
- `/product/:id` — Product detail with size/color picker, cart
- `/checkout` — Checkout form
- `/order/:id` — Order confirmation

### Admin Panel

- `/admin/login` — Password-protected login (password: `niky-admin-2024`, env: `ADMIN_PASSWORD`)
- `/admin` — Dashboard: KPI cards, Monthly Revenue Line Chart (12 months), Top Products, Recent Orders
- `/admin/products` — Product CRUD (list, create, edit, delete)
- `/admin/orders` — Orders with status filter, order detail Sheet (items, customer, address), print invoice
- `/admin/categories` — Category management
- `/admin/customers` — Customer list with search, detail Sheet (profile + order history)
- `/admin/coupons` — Coupon CRUD (percentage/fixed, uses, expiry, toggle active)
- `/admin/settings` — Store settings tabs (Store Info, Social Media, Shipping & Payments)

### Auth

- Session-based via `express-session` (server-side)
- `SESSION_SECRET` env var (Replit secret)
- `AdminAuthProvider` + `useAdminAuth()` hook + `ProtectedAdminRoute` component

### Database Tables

`categories`, `products`, `cart_items`, `orders`, `order_items`, `coupons`, `settings`

### API Routes

- `GET/POST /api/products` — product list + create
- `GET/PUT/DELETE /api/products/:id`
- `GET/POST /api/categories`
- `GET/POST /api/cart` + `DELETE /api/cart/:id`
- `POST /api/orders` + `GET /api/orders/:id`
- `GET /api/coupons` + CRUD + `POST /api/coupons/validate`
- `GET/PUT /api/admin/settings`
- `GET /api/admin/stats`, `/admin/recent-orders`, `/admin/top-products`, `/admin/revenue-by-category`, `/admin/monthly-revenue`
- `GET /api/admin/customers`, `/api/admin/customers/:email`
- `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`
