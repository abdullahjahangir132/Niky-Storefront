import { Router } from "express";
import { db } from "@workspace/db";
import {
  productsTable,
  ordersTable,
  categoriesTable,
  settingsTable,
  aiUsageLogsTable,
} from "@workspace/db";
import { eq, like, or, desc } from "drizzle-orm";

const router = Router();

// ── Product knowledge-base cache (5 min) ────────────────────────────────────
let kbCache: { data: string; ts: number } | null = null;
const KB_TTL = 5 * 60 * 1000;

async function getLiveKnowledgeBase(): Promise<string> {
  const now = Date.now();
  if (kbCache && now - kbCache.ts < KB_TTL) return kbCache.data;

  const [products, cats, settingsRows] = await Promise.all([
    db
      .select({
        name: productsTable.name,
        price: productsTable.price,
        salePrice: productsTable.salePrice,
        brandLine: productsTable.brandLine,
        mainCategory: productsTable.mainCategory,
        sizes: productsTable.sizes,
        colors: productsTable.colors,
        stock: productsTable.stock,
        isOnSale: productsTable.isOnSale,
        isNew: productsTable.isNew,
        isFeatured: productsTable.isFeatured,
        status: productsTable.status,
      })
      .from(productsTable)
      .where(eq(productsTable.status, "active")),
    db.select({ name: categoriesTable.name }).from(categoriesTable),
    db.select().from(settingsTable),
  ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows) settings[row.key] = row.value;

  const byCategory: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.mainCategory || "other";
    (byCategory[cat] ??= []).push(p);
  }

  let productLines = "=== LIVE PRODUCT CATALOG ===\n";
  for (const [cat, prods] of Object.entries(byCategory)) {
    productLines += `\n[${cat.toUpperCase()}]\n`;
    for (const p of prods) {
      const sizes = (p.sizes as string[]).join(", ") || "38-45";
      const colors = (p.colors as { name: string }[]).map((c) => c.name).join(", ") || "Multiple";
      const priceStr =
        p.isOnSale && p.salePrice
          ? `PKR ${Number(p.salePrice).toLocaleString()} (SALE — was PKR ${Number(p.price).toLocaleString()})`
          : `PKR ${Number(p.price).toLocaleString()}`;
      const badges = [
        p.isFeatured ? "FEATURED" : "",
        p.isNew ? "NEW" : "",
        p.isOnSale ? "ON SALE" : "",
        Number(p.stock) > 0 ? "IN STOCK" : "OUT OF STOCK",
      ]
        .filter(Boolean)
        .join(" | ");
      productLines += `  • ${p.name} — ${priceStr} | Sizes: ${sizes} | Colors: ${colors} | Brand: ${p.brandLine || "Nano Shoes"} | ${badges}\n`;
    }
  }

  const phone = settings.contactPhone || "+92 300 1234567";
  const whatsapp = settings.whatsappNumber || phone;
  const email = settings.contactEmail || "support@nanoshoes.pk";
  const address = settings.address || "Lahore, Pakistan";

  const kb = `${productLines}
=== STORE INFO ===
Name: Nano Shoes | Tagline: Move Beyond Limits
Address: ${address} | Phone: ${phone} | WhatsApp: ${whatsapp} | Email: ${email}
Hours: Mon–Sat 10AM–8PM

=== SHIPPING & PAYMENTS ===
Shipping: PKR ${settings.shippingRate || "200"} | Free above PKR ${settings.freeShippingThreshold || "3000"}
Payment: COD, Credit/Debit Card, EasyPaisa, JazzCash
Delivery: Lahore 1–2 days | Karachi/Islamabad 2–3 days | Other 3–5 days

=== POLICIES ===
Returns: 7 days, unworn, original box | Sale items: exchange only
Track order: /track-order | Size guide: /size-guide
Coupons: NANO10 (10%), NANO20 (20%), WELCOME50 (50% first order)

=== CATEGORIES ===
${cats.map((c) => c.name).join(" | ")}`;

  kbCache = { data: kb, ts: now };
  return kb;
}

// ── Order lookup ─────────────────────────────────────────────────────────────
async function lookupOrderFromMessage(text: string): Promise<string | null> {
  const orderMatch = text.match(/\b(?:ORD[-\s]?\d{3,}|#\d{4,}|\d{6,})\b/i);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!orderMatch && !emailMatch) return null;

  try {
    let order = null;
    if (orderMatch) {
      const raw = orderMatch[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const numId = parseInt(raw.replace(/\D/g, "")) || 0;
      const results = await db
        .select()
        .from(ordersTable)
        .where(or(like(ordersTable.orderNumber, `%${raw}%`), numId > 0 ? eq(ordersTable.id, numId) : undefined))
        .limit(1);
      order = results[0] ?? null;
    }
    if (!order && emailMatch) {
      const results = await db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.customerEmail, emailMatch[0].toLowerCase()))
        .orderBy(desc(ordersTable.createdAt))
        .limit(1);
      order = results[0] ?? null;
    }
    if (!order) return null;

    const statusMap: Record<string, string> = {
      pending: "⏳ Pending",
      confirmed: "✅ Confirmed",
      shipped: "🚚 Shipped",
      delivered: "📦 Delivered",
      cancelled: "❌ Cancelled",
    };

    type Item = { productName: string; quantity: number; size: string; color?: string; price: number };
    const items = (order.items as Item[])
      .map((i) => `${i.productName} ×${i.quantity} (Size: ${i.size})`)
      .join(", ");

    return `=== ORDER FOUND ===
Order No: ${order.orderNumber || `#${order.id}`} | Status: ${statusMap[order.status] || order.status}
Customer: ${order.customerName} | Payment: ${order.paymentMethod?.toUpperCase()} — ${order.paymentStatus}
Items: ${items}
Total: PKR ${Number(order.total).toLocaleString()} | Shipping to: ${order.city}, ${order.province || "Pakistan"}
${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : "Tracking will be shared once shipped."}
Placed: ${new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "long" })}`;
  } catch {
    return null;
  }
}

// ── AI provider settings ──────────────────────────────────────────────────────
async function getAISettings() {
  const rows = await db.select().from(settingsTable);
  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;
  return {
    provider: (map.aiProvider || "anthropic") as "gemini" | "openai" | "anthropic",
    geminiApiKey: map.geminiApiKey || "",
    openaiApiKey: map.openaiApiKey || "",
    anthropicApiKey: map.anthropicApiKey || process.env.ANTHROPIC_API_KEY || "",
  };
}

const BASE_SYSTEM = `You are Nano Bot — the friendly AI assistant for Nano Shoes Pakistan.

LANGUAGE: Match the user's language exactly.
- English → reply English
- Roman Urdu (latin letters) → reply Roman Urdu
- Arabic → reply Arabic
- Urdu script → reply Urdu script

SCOPE: Only answer Nano Shoes related questions. If unrelated, say: "I can only help with Nano Shoes questions. Contact support@nanoshoes.pk"

STYLE: Warm, concise, use bullets for lists. Prices in PKR. End with: "Kuch aur madad chahiye? / Is there anything else I can help you with?"`;

// ── Provider helpers ──────────────────────────────────────────────────────────

type ChatMsg = { role: "user" | "assistant"; content: string };

async function* streamGemini(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMsg[]
): AsyncGenerator<{ text?: string; tokensIn?: number; tokensOut?: number }> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 600 },
      }),
    }
  );

  if (!res.ok || !res.body) throw new Error(`Gemini error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload);
        const text = event.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
        if (text) yield { text };
        const usage = event.usageMetadata;
        if (usage) {
          yield {
            tokensIn: usage.promptTokenCount ?? 0,
            tokensOut: usage.candidatesTokenCount ?? 0,
          };
        }
      } catch { /* skip */ }
    }
  }
}

async function* streamOpenAI(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMsg[]
): AsyncGenerator<{ text?: string; tokensIn?: number; tokensOut?: number }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_completion_tokens: 600,
      stream: true,
      stream_options: { include_usage: true },
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok || !res.body) throw new Error(`OpenAI error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload);
        const text = event.choices?.[0]?.delta?.content as string | undefined;
        if (text) yield { text };
        if (event.usage) {
          yield {
            tokensIn: event.usage.prompt_tokens ?? 0,
            tokensOut: event.usage.completion_tokens ?? 0,
          };
        }
      } catch { /* skip */ }
    }
  }
}

async function* streamAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMsg[]
): AsyncGenerator<{ text?: string; tokensIn?: number; tokensOut?: number }> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: systemPrompt,
      stream: true,
      messages: messages
        .filter((m) => m.content.trim())
        .map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok || !res.body) throw new Error(`Anthropic error: ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let inputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      try {
        const event = JSON.parse(payload);
        if (event.type === "message_start") {
          inputTokens = event.message?.usage?.input_tokens ?? 0;
        }
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
          yield { text: event.delta.text };
        }
        if (event.type === "message_delta" && event.usage) {
          yield { tokensIn: inputTokens, tokensOut: event.usage.output_tokens ?? 0 };
        }
      } catch { /* skip */ }
    }
  }
}

// ── Main chat route ───────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages, language } = req.body as {
      messages?: ChatMsg[];
      language?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const [aiSettings, knowledgeBase] = await Promise.all([
      getAISettings(),
      getLiveKnowledgeBase(),
    ]);

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const orderInfo = await lookupOrderFromMessage(lastUserMsg);

    const systemPrompt = [BASE_SYSTEM, "\n", knowledgeBase, orderInfo ? `\n\n${orderInfo}` : ""].join("\n");

    const { provider, geminiApiKey, openaiApiKey, anthropicApiKey } = aiSettings;

    let apiKey = "";
    if (provider === "gemini") apiKey = geminiApiKey;
    else if (provider === "openai") apiKey = openaiApiKey;
    else apiKey = anthropicApiKey;

    if (!apiKey) {
      res.status(503).json({ error: `No API key configured for provider: ${provider}` });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let tokensIn = 0;
    let tokensOut = 0;
    let modelName = provider === "gemini" ? "gemini-2.0-flash" : provider === "openai" ? "gpt-4o-mini" : "claude-haiku-4-5";

    const stream =
      provider === "gemini"
        ? streamGemini(apiKey, systemPrompt, messages)
        : provider === "openai"
        ? streamOpenAI(apiKey, systemPrompt, messages)
        : streamAnthropic(apiKey, systemPrompt, messages);

    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ content: chunk.text })}\n\n`);
      }
      if (chunk.tokensIn !== undefined) tokensIn = chunk.tokensIn;
      if (chunk.tokensOut !== undefined) tokensOut = chunk.tokensOut;
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // Log usage (non-blocking)
    const total = tokensIn + tokensOut || Math.ceil((systemPrompt.length + lastUserMsg.length) / 4);
    const sessionId = (req.session as any)?.id || req.headers["x-session-id"] as string || "anonymous";
    db.insert(aiUsageLogsTable)
      .values({
        provider,
        model: modelName,
        sessionId,
        userMessage: lastUserMsg.slice(0, 200),
        tokensIn: tokensIn || Math.ceil(systemPrompt.length / 4),
        tokensOut: tokensOut || Math.ceil(total * 0.3),
        totalTokens: total,
      })
      .catch(() => {});
  } catch (error) {
    req.log.error(error, "Chat error");
    if (!res.headersSent) res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
