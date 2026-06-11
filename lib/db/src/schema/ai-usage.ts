import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const aiUsageLogsTable = pgTable("ai_usage_logs", {
  id: serial("id").primaryKey(),
  provider: text("provider").notNull().default("anthropic"),
  model: text("model").notNull().default(""),
  sessionId: text("session_id").notNull().default(""),
  userMessage: text("user_message").notNull().default(""),
  tokensIn: integer("tokens_in").notNull().default(0),
  tokensOut: integer("tokens_out").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AiUsageLog = typeof aiUsageLogsTable.$inferSelect;
