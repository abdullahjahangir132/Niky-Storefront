---
name: Nav menu driven by product taxonomy
description: How the storefront mega-menu gets its content, for future nav/category work
---

The storefront mega-menu (Men/Women/Kids dropdowns) does not have its own admin-managed config table. It is generated at request time from a `GET /api/nav-menu` endpoint that reads distinct `subCategory`, `brandLine`, and flattened `tags` values per `mainCategory` directly from the `products` table.

**Why:** avoids building and syncing a separate nav/taxonomy admin UI — admins already set `subCategory`/`brandLine`/`tags` per product in the product form, and the nav reflects reality automatically (new subcategory typed on a product appears in the nav without any extra step).

**How to apply:** if new mega-menu columns or nav sections are needed, extend the `/api/nav-menu` aggregation query rather than creating a separate CMS-style nav config. If the taxonomy ever needs manual ordering/curation beyond what's derivable from products, that's the point to introduce a dedicated table.
