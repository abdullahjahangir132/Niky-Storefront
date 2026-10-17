# Deploying NIKY Store to Vercel

This repository is a pnpm monorepo, but the Vercel project should be configured
as one project rooted at the repository root. Do not set the Vercel Root
Directory to one of the `artifacts/` folders.

## What the repository configures

The root `vercel.json` selects the storefront build in `artifacts/niky-store`,
publishes `artifacts/niky-store/dist/public`, routes `/api/*` through the
Express function in `api/index.ts`, and rewrites browser-side routes to
`index.html`. The build also copies the existing product media into the static
output so it can be served by Vercel's CDN.

## Vercel environment

Add the app's production PostgreSQL connection as `DATABASE_URL`. Also configure
unique production values for `SESSION_SECRET` and `ADMIN_PASSWORD`; do not rely
on the development defaults. Configure `ANTHROPIC_API_KEY` only if the server
should use that provider through its environment rather than the admin settings.

## Runtime storage note

Vercel Functions can write only to temporary storage. New uploads are written
under `/tmp` so the upload endpoint can run, but those files can disappear when
the function instance is recycled. Existing repository media is included in the
static build; use durable object storage before relying on admin uploads for new
production assets. Express's default in-memory session store can also lose
sessions when Vercel starts a different function instance.
