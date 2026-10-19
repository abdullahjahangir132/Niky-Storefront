// @ts-nocheck
import { Router } from "express";
import { db } from "@workspace/db";
import { aiUsageLogsTable } from "@workspace/db";
import { desc, count, sum } from "drizzle-orm";

const router = Router();

// GET /api/admin/ai-usage — usage stats + recent logs
router.get("/admin/ai-usage", async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const [logs, totals] = await Promise.all([
    db
      .select()
      .from(aiUsageLogsTable)
      .orderBy(desc(aiUsageLogsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({
        totalRequests: count(),
        totalTokensIn: sum(aiUsageLogsTable.tokensIn),
        totalTokensOut: sum(aiUsageLogsTable.tokensOut),
        totalTokens: sum(aiUsageLogsTable.totalTokens),
      })
      .from(aiUsageLogsTable),
  ]);

  const summary = totals[0] ?? { totalRequests: 0, totalTokensIn: 0, totalTokensOut: 0, totalTokens: 0 };

  res.json({ logs, summary, page, limit });
});

export default router;
