---
name: JSON column array-contains queries in Drizzle
description: Casting quirk when filtering a Postgres `json` (not `jsonb`) array column
---

Filtering products by a value inside a `json("tags").$type<string[]>()` column (Postgres `json` type, not `jsonb`) requires casting both the column and the literal to `jsonb` for the `@>` containment operator to work in raw `sql` template literals with Drizzle:

```ts
sql`${productsTable.tags}::jsonb @> ${JSON.stringify([tag])}::jsonb`
```

**Why:** the `@>` operator is only defined for `jsonb`, not `json`. Without the cast on the column side, Postgres throws an operator-does-not-exist error.

**How to apply:** any time a new filter needs to query inside a `json`-typed array/object column, remember the explicit `::jsonb` cast on the column reference too, not just the parameter.
