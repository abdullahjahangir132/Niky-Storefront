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

// ── Knowledge-base cache (5 min) ─────────────────────────────────────────────
let kbCache: { data: KnowledgeBase; ts: number } | null = null;
const KB_TTL = 5 * 60 * 1000;

interface KnowledgeBase {
  products: Array<{
    name: string; price: string; salePrice: string | null;
    mainCategory: string; sizes: unknown; colors: unknown;
    stock: number; isOnSale: boolean; isNew: boolean; status: string;
  }>;
  categories: string[];
  settings: Record<string, string>;
  text: string;
}

async function getKnowledgeBase(): Promise<KnowledgeBase> {
  const now = Date.now();
  if (kbCache && now - kbCache.ts < KB_TTL) return kbCache.data;

  const [products, cats, settingsRows] = await Promise.all([
    db.select({
      name: productsTable.name, price: productsTable.price,
      salePrice: productsTable.salePrice, mainCategory: productsTable.mainCategory,
      sizes: productsTable.sizes, colors: productsTable.colors,
      stock: productsTable.stock, isOnSale: productsTable.isOnSale,
      isNew: productsTable.isNew, status: productsTable.status,
    }).from(productsTable).where(eq(productsTable.status, "active")),
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

  let text = `=== LIVE PRODUCT CATALOG ===\n`;
  for (const [cat, prods] of Object.entries(byCategory)) {
    text += `\n[${cat.toUpperCase()}]\n`;
    for (const p of prods) {
      const sizes = (p.sizes as string[]).join(", ") || "38–45";
      const colors = (p.colors as { name: string }[]).map((c) => c.name).join(", ") || "Multiple";
      const priceStr = p.isOnSale && p.salePrice
        ? `PKR ${Number(p.salePrice).toLocaleString()} (SALE — was PKR ${Number(p.price).toLocaleString()})`
        : `PKR ${Number(p.price).toLocaleString()}`;
      const badges = [p.isNew ? "NEW" : "", p.isOnSale ? "ON SALE" : "", Number(p.stock) > 0 ? "IN STOCK" : "OUT OF STOCK"].filter(Boolean).join(" | ");
      text += `  • ${p.name} — ${priceStr} | Sizes: ${sizes} | Colors: ${colors} | ${badges}\n`;
    }
  }

  const phone = settings.contactPhone || "+92 300 1234567";
  const whatsapp = settings.whatsappNumber || phone;
  const email = settings.contactEmail || "support@nanoshoes.pk";
  const address = settings.address || "Lahore, Pakistan";

  text += `\n=== STORE INFO ===
Name: ${settings.storeName || "Nano Shoes"} | Tagline: Move Beyond Limits
Address: ${address} | Phone: ${phone} | WhatsApp: ${whatsapp} | Email: ${email}
Hours: Mon–Sat 10AM–8PM

=== SHIPPING & PAYMENTS ===
Shipping: PKR ${settings.shippingRate || "200"} | Free above PKR ${settings.freeShippingThreshold || "3000"}
Payment: COD (Cash on Delivery), Credit/Debit Card, EasyPaisa, JazzCash
Delivery: Lahore 1–2 days | Karachi/Islamabad 2–3 days | Other cities 3–5 days

=== POLICIES ===
Returns: 7 days, unworn, original box | Sale items: exchange only
Track: /track-order | Size guide: /size-guide

=== CATEGORIES ===
${cats.map((c) => c.name).join(", ")}`;

  const kb: KnowledgeBase = { products, categories: cats.map((c) => c.name), settings, text };
  kbCache = { data: kb, ts: now };
  return kb;
}

// ── Order lookup ─────────────────────────────────────────────────────────────
async function lookupOrder(text: string) {
  const orderMatch = text.match(/\b(?:ORD[-\s]?\d{3,}|#\d{4,}|\d{6,})\b/i);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!orderMatch && !emailMatch) return null;
  try {
    let order = null;
    if (orderMatch) {
      const raw = orderMatch[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const numId = parseInt(raw.replace(/\D/g, "")) || 0;
      const results = await db.select().from(ordersTable)
        .where(or(like(ordersTable.orderNumber, `%${raw}%`), numId > 0 ? eq(ordersTable.id, numId) : undefined))
        .limit(1);
      order = results[0] ?? null;
    }
    if (!order && emailMatch) {
      const results = await db.select().from(ordersTable)
        .where(eq(ordersTable.customerEmail, emailMatch[0].toLowerCase()))
        .orderBy(desc(ordersTable.createdAt)).limit(1);
      order = results[0] ?? null;
    }
    return order;
  } catch { return null; }
}

// ── Rule-based fallback (no API key needed) ───────────────────────────────────
type RuleCategory =
  | "order_tracking"
  | "payment"
  | "return_policy"
  | "contact"
  | "shipping"
  | "size_guide"
  | "products"
  | "about"
  | "greeting"
  | "unknown";

function detectCategory(msg: string): RuleCategory {
  const m = msg.toLowerCase();

  if (/\b(ord|order|track|where.*my|ship.*status|parcel|consignment|#\d{4,}|\d{6,})\b/.test(m))
    return "order_tracking";
  if (/\b(pay|payment|easypaisa|jazzcash|cod|cash.*deliv|card|visa|mastercard|how.*pay|accept)\b/.test(m))
    return "payment";
  if (/\b(return|exchange|refund|wrong.*size|damaged|broken|policy|waapas|vapas|wapis)\b/.test(m))
    return "return_policy";
  if (/\b(contact|phone|call|whatsapp|email|support|helpline|reach|address)\b/.test(m))
    return "contact";
  if (/\b(ship|deliver|delivery|kitne.*din|how long|when.*receive|time|eta)\b/.test(m))
    return "shipping";
  if (/\b(size|sizing|fit|guide|chart|measurement|number|size.*guide)\b/.test(m))
    return "size_guide";
  if (/\b(product|shoes|collection|available|stock|kya.*ha|kya.*hain|show|catalog|list|sale|discount|offer)\b/.test(m))
    return "products";
  if (/\b(about|brand|who|nano.*shoes|company|story|founded)\b/.test(m))
    return "about";
  if (/\b(hi|hello|hey|salam|assalam|aoa|helo|hii|good\s*(morning|evening|afternoon))\b/.test(m))
    return "greeting";

  return "unknown";
}

async function buildKbAnswer(userMsg: string, kb: KnowledgeBase, order: Awaited<ReturnType<typeof lookupOrder>>): Promise<string> {
  const s = kb.settings;
  const phone = s.contactPhone || "+92 300 1234567";
  const whatsapp = s.whatsappNumber || phone;
  const email = s.contactEmail || "support@nanoshoes.pk";
  const storeName = s.storeName || "Nano Shoes";
  const shipping = s.shippingRate || "200";
  const freeShipping = s.freeShippingThreshold || "3000";
  const cat = detectCategory(userMsg);

  const statusEmoji: Record<string, string> = {
    pending: "⏳ Pending — processing ho raha hai",
    confirmed: "✅ Confirmed — taiyar ho raha hai",
    shipped: "🚚 Shipped — raaste mein hai",
    delivered: "📦 Delivered — mil gaya!",
    cancelled: "❌ Cancelled",
  };

  if (cat === "order_tracking") {
    if (order) {
      type Item = { productName: string; quantity: number; size: string; color?: string };
      const items = (order.items as Item[]).map((i) => `${i.productName} ×${i.quantity} (Size: ${i.size})`).join(", ");
      return `📦 **Order Found!**

**Order:** ${order.orderNumber || `#${order.id}`}
**Status:** ${statusEmoji[order.status] || order.status}
**Customer:** ${order.customerName}
**Items:** ${items}
**Total:** PKR ${Number(order.total).toLocaleString()}
**Delivery:** ${order.city}, ${order.province || "Pakistan"}
${order.trackingNumber ? `**Tracking No:** ${order.trackingNumber}` : "Tracking number ship hone ke baad share kiya jayega."}
**Payment:** ${order.paymentMethod?.toUpperCase()} — ${order.paymentStatus}

Kuch aur help chahiye? 😊`;
    }

    // No order number found
    if (/order|track/i.test(userMsg)) {
      return `📦 **Order Track Karna Hai?**

Apna order track karne ke 2 tarike hain:

1. **Website par:** /track-order page par jaayein aur order number daalen
2. **Order number batayein:** Yahan order number ya email share karein aur main dekh leta hoon!

Order number aapki confirmation email mein hota hai.

Whatsapp par bhi puch sakte hain: ${whatsapp} 📱`;
    }
  }

  if (cat === "payment") {
    return `💳 **Payment Methods — ${storeName}**

Hum ye payment methods accept karte hain:

• 💵 **COD** (Cash on Delivery) — delivery par cash dein
• 💳 **Credit/Debit Card** — Visa, Mastercard
• 📱 **EasyPaisa** — mobile account se pay karein
• 📱 **JazzCash** — mobile account se pay karein

Sab methods secure hain. COD sirf Pakistan mein available hai.

Koi aur sawaal? 😊`;
  }

  if (cat === "return_policy") {
    return `🔄 **Return & Exchange Policy**

**Return:**
• Delivery ke **7 din** ke andar return kar sakte hain
• Shoes unworn honi chahiye, original box mein
• Damaged ya wrong item — free return + replacement

**Exchange:**
• Galat size? Exchange kar sakte hain!
• Sale items: sirf exchange (return nahi)

**Process:**
1. Whatsapp karein: ${whatsapp}
2. Order number aur reason batayein
3. Collection arrange ho jayegi

**Contact:** ${email} | ${phone}`;
  }

  if (cat === "contact") {
    return `📞 **${storeName} — Contact Us**

• 📱 **WhatsApp:** ${whatsapp} _(fastest response)_
• 📞 **Phone:** ${phone}
• 📧 **Email:** ${email}
• 🕐 **Hours:** Mon–Sat, 10AM–8PM
${s.address ? `• 📍 **Address:** ${s.address}` : ""}

WhatsApp par message karein — 30 minutes mein reply guaranteed! 💬`;
  }

  if (cat === "shipping") {
    return `🚚 **Shipping & Delivery — ${storeName}**

**Delivery Time:**
• 🏙️ Lahore — **1–2 business days**
• 🌆 Karachi / Islamabad — **2–3 business days**
• 🏘️ Other cities — **3–5 business days**

**Charges:**
• Standard: **PKR ${Number(shipping).toLocaleString()}**
• FREE shipping on orders above **PKR ${Number(freeShipping).toLocaleString()}** 🎉

**Courier Partners:** TCS, Leopards, BlueEx

Order tracking: **/track-order** page par check karein 📦`;
  }

  if (cat === "size_guide") {
    return `📏 **Size Guide — ${storeName}**

Hum Pakistan standard sizing follow karte hain:

| Pakistan | EU | UK | US |
|---------|----|----|-----|
| 6 | 39 | 6 | 7 |
| 7 | 40 | 7 | 8 |
| 8 | 41 | 8 | 9 |
| 9 | 42 | 9 | 10 |
| 10 | 43 | 10 | 11 |
| 11 | 44 | 11 | 12 |

**Tip:** Agar aap do sizes ke beech mein hain, ek size upar lein!
Detailed guide: **/size-guide** page par dekhein 📐`;
  }

  if (cat === "products") {
    const saleItems = kb.products.filter((p) => p.isOnSale);
    const newItems = kb.products.filter((p) => p.isNew);
    const cats = kb.categories.slice(0, 6).join(", ");

    let resp = `👟 **${storeName} — Product Catalog**\n\n`;
    resp += `**Categories:** ${cats || "Men, Women, Kids, Sports, Casual, Formal"}\n\n`;
    if (saleItems.length > 0) {
      resp += `🔥 **ON SALE (${saleItems.length} items):**\n`;
      saleItems.slice(0, 3).forEach((p) => {
        resp += `• ${p.name} — PKR ${Number(p.salePrice || p.price).toLocaleString()}\n`;
      });
      resp += "\n";
    }
    if (newItems.length > 0) {
      resp += `✨ **NEW ARRIVALS (${newItems.length} items):**\n`;
      newItems.slice(0, 3).forEach((p) => {
        resp += `• ${p.name} — PKR ${Number(p.price).toLocaleString()}\n`;
      });
    }
    resp += `\nPuri collection dekhne ke liye **/shop** visit karein! 🛍️`;
    return resp;
  }

  if (cat === "about") {
    return `👟 **${storeName} — Move Beyond Limits**

Nano Shoes Pakistan ka premium footwear brand hai. Hum quality aur style ko affordable pricing par provide karte hain.

• 🏆 Premium quality materials
• 🇵🇰 Pakistan ka apna brand
• 📦 Nationwide delivery
• ✅ 7-day return policy
• 💰 PKR mein affordable prices

**Collections:** Men | Women | Kids | Sports | Casual | Formal

Apni pasand ki shoes **/shop** par dekhein! 😊`;
  }

  if (cat === "greeting") {
    return `Salam! 👋 Main **NanoBot** hoon — ${storeName} ka AI assistant!

Main in sawaalon mein aapki madad kar sakta hoon:
• 📦 Order tracking
• 💳 Payment methods
• 🔄 Return & exchange policy
• 🚚 Shipping & delivery info
• 📏 Size guide
• 👟 Products & collections
• 📞 Customer support contact

Kya jaanna chahte hain? 😊`;
  }

  // Unknown — give a helpful generic response
  return `Mujhe samajh nahi aaya, lekin main in topics mein madad kar sakta hoon:

• **📦 Order Track** — order number ya email batayein
• **💳 Payments** — COD, Card, EasyPaisa, JazzCash
• **🔄 Returns** — 7-day return/exchange policy
• **🚚 Shipping** — delivery time aur charges
• **📏 Size Guide** — correct size choose karein
• **👟 Products** — sale, new arrivals, collections
• **📞 Contact** — phone, WhatsApp, email

Ya seedha humse contact karein:
📱 WhatsApp: ${whatsapp}
📧 Email: ${email}`;
}

// ── Stream text as SSE chunks ─────────────────────────────────────────────────
async function* streamText(text: string): AsyncGenerator<string> {
  // Split into words and stream in small batches
  const words = text.split(/(\s+)/);
  let buf = "";
  for (const word of words) {
    buf += word;
    if (buf.length >= 20) {
      yield buf;
      buf = "";
      await new Promise((r) => setTimeout(r, 8));
    }
  }
  if (buf) yield buf;
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

const BASE_SYSTEM = `You are NanoBot — the friendly AI assistant for Nano Shoes Pakistan.

LANGUAGE: Match the user's language exactly.
- English → reply English
- Roman Urdu (latin letters) → reply Roman Urdu
- Arabic → reply Arabic
- Urdu script → reply Urdu script

SCOPE: Only answer Nano Shoes related questions.
STYLE: Warm, concise, use bullets for lists. Prices in PKR. End with a helpful follow-up prompt.`;

// ── Provider streaming generators ────────────────────────────────────────────
type ChatMsg = { role: "user" | "assistant"; content: string };

async function* streamGemini(apiKey: string, systemPrompt: string, messages: ChatMsg[]): AsyncGenerator<{ text?: string; tokensIn?: number; tokensOut?: number }> {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 600 },
    }),
  });
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
        if (usage) yield { tokensIn: usage.promptTokenCount ?? 0, tokensOut: usage.candidatesTokenCount ?? 0 };
      } catch { /* skip */ }
    }
  }
}

async function* streamOpenAI(apiKey: string, systemPrompt: string, messages: ChatMsg[]): AsyncGenerator<{ text?: string; tokensIn?: number; tokensOut?: number }> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "gpt-4o-mini", max_completion_tokens: 600, stream: true,
      stream_options: { include_usage: true },
      messages: [{ role: "system", content: systemPrompt }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
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
        if (event.usage) yield { tokensIn: event.usage.prompt_tokens ?? 0, tokensOut: event.usage.completion_tokens ?? 0 };
      } catch { /* skip */ }
    }
  }
}

async function* streamAnthropic(apiKey: string, systemPrompt: string, messages: ChatMsg[]): AsyncGenerator<{ text?: string; tokensIn?: number; tokensOut?: number }> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5", max_tokens: 600, system: systemPrompt, stream: true,
      messages: messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })),
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
        if (event.type === "message_start") inputTokens = event.message?.usage?.input_tokens ?? 0;
        if (event.type === "content_block_delta" && event.delta?.type === "text_delta") yield { text: event.delta.text };
        if (event.type === "message_delta" && event.usage) yield { tokensIn: inputTokens, tokensOut: event.usage.output_tokens ?? 0 };
      } catch { /* skip */ }
    }
  }
}

// ── Main chat route ───────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body as { messages?: ChatMsg[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // Fetch KB and AI settings in parallel
    const [kb, aiSettings, order] = await Promise.all([
      getKnowledgeBase(),
      getAISettings(),
      lookupOrder(lastUserMsg),
    ]);

    const { provider, geminiApiKey, openaiApiKey, anthropicApiKey } = aiSettings;
    const apiKey = provider === "gemini" ? geminiApiKey : provider === "openai" ? openaiApiKey : anthropicApiKey;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // disable nginx/proxy buffering for SSE

    // ── NO API KEY → return rule-based answer as plain JSON (no SSE needed) ──
    if (!apiKey) {
      const answer = await buildKbAnswer(lastUserMsg, kb, order);
      // Return as plain JSON — frontend handles both SSE and JSON responses
      res.removeHeader("Content-Type");
      res.removeHeader("Cache-Control");
      res.removeHeader("Connection");
      res.removeHeader("X-Accel-Buffering");
      res.json({ content: answer, done: true });

      const sessionId = (req.session as any)?.id || req.headers["x-session-id"] as string || "anonymous";
      db.insert(aiUsageLogsTable).values({
        provider: "kb_fallback", model: "rule-based", sessionId,
        userMessage: lastUserMsg.slice(0, 200),
        tokensIn: 0, tokensOut: 0, totalTokens: 0,
      }).catch(() => {});
      return;
    }

    // ── API KEY AVAILABLE → stream from AI provider ──
    const systemPrompt = [BASE_SYSTEM, "\n", kb.text, order ? `\n\n=== ORDER INFO ===\n${JSON.stringify(order)}` : ""].join("\n");
    const modelName = provider === "gemini" ? "gemini-2.0-flash" : provider === "openai" ? "gpt-4o-mini" : "claude-haiku-4-5";

    const stream = provider === "gemini"
      ? streamGemini(apiKey, systemPrompt, messages)
      : provider === "openai"
      ? streamOpenAI(apiKey, systemPrompt, messages)
      : streamAnthropic(apiKey, systemPrompt, messages);

    let tokensIn = 0, tokensOut = 0;
    for await (const chunk of stream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ content: chunk.text })}\n\n`);
        if (typeof (res as any).flush === "function") (res as any).flush();
      }
      if (chunk.tokensIn !== undefined) tokensIn = chunk.tokensIn;
      if (chunk.tokensOut !== undefined) tokensOut = chunk.tokensOut;
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    const sessionId = (req.session as any)?.id || req.headers["x-session-id"] as string || "anonymous";
    const total = tokensIn + tokensOut || Math.ceil((systemPrompt.length + lastUserMsg.length) / 4);
    db.insert(aiUsageLogsTable).values({
      provider, model: modelName, sessionId,
      userMessage: lastUserMsg.slice(0, 200),
      tokensIn: tokensIn || Math.ceil(systemPrompt.length / 4),
      tokensOut: tokensOut || Math.ceil(total * 0.3),
      totalTokens: total,
    }).catch(() => {});

  } catch (error) {
    req.log.error(error, "Chat error");
    if (!res.headersSent) res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
