---
name: Vite HMR can transiently break React context
description: "useX must be used within Provider" errors that are HMR artifacts, not real bugs
---

Editing a component file that consumes a React context (e.g. a navbar using `useCart()`) can trigger a transient runtime error like `useCart must be used within a CartProvider` purely from Vite's hot module replacement re-evaluating the module graph out of order — even when the provider tree in `App.tsx` is untouched and correct.

**Why:** HMR can re-mount/re-import a consumer component before the provider module has been re-linked, especially after several rapid successive edits to the same file.

**How to apply:** if this error appears right after editing a component (not the provider itself), restart the affected workflow and re-screenshot before assuming the provider wiring is broken. Only dig into `App.tsx`/provider nesting if the error persists after a clean restart.
