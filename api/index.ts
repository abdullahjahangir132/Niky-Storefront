// @ts-nocheck
import type { Request, Response } from "express";
import app from "../artifacts/api-server/src/app";

const INTERNAL_PATH_QUERY = "__vercel_original_path";

export default function handler(req: Request, res: Response) {
  const rewrittenUrl = new URL(req.url || "/", "http://vercel-function.local");
  const originalPath = rewrittenUrl.searchParams.get(INTERNAL_PATH_QUERY);

  if (originalPath) {
    if (!originalPath.startsWith("/api/")) {
      res.status(400).json({ error: "Invalid API route" });
      return;
    }

    rewrittenUrl.searchParams.delete(INTERNAL_PATH_QUERY);
    const remainingQuery = rewrittenUrl.searchParams.toString();
    req.url = `${originalPath}${remainingQuery ? `?${remainingQuery}` : ""}`;
  }

  return app(req, res);
}
