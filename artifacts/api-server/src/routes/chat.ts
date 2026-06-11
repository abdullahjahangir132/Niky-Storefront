import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, ordersTable, categoriesTable, settingsTable } from "@workspace/db";
import { eq, like, or, desc } from "drizzle-orm";

const router = Router();

// 5-minute product cache to avoid hitting DB on every message
let productCache: { data: string; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function getLiveKnowledgeBase(): Promise<string> {
  const now = Date.now();
  if (productCache && now - productCache.ts < CACHE_TTL) return productCache.data;

  const [products, cats, settingsRows] = await Promise.all([
    db.select({
      id: productsTable.id,
      name: productsTable.name,
      price: productsTable.price,
      salePrice: productsTable.salePrice,
      brandLine: productsTable.brandLine,
      mainCategory: productsTable.mainCategory,
      subCategory: productsTable.subCategory,
      sizes: productsTable.sizes,
      colors: productsTable.colors,
      stock: productsTable.stock,
      isOnSale: productsTable.isOnSale,
      isNew: productsTable.isNew,
      isFeatured: productsTable.isFeatured,
      status: productsTable.status,
      slug: productsTable.slug,
    }).from(productsTable).where(eq(productsTable.status, "active")),
    db.select({ name: categoriesTable.name, slug: categoriesTable.slug }).from(categoriesTable),
    db.select().from(settingsTable),
  ]);

  const settings: Record<string, string> = {};
  for (const row of settingsRows) settings[row.key] = row.value;

  // Group products by main category
  const byCategory: Record<string, typeof products> = {};
  for (const p of products) {
    const cat = p.mainCategory || "other";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(p);
  }

  let productLines = "=== LIVE PRODUCT CATALOG (database) ===\n";
  for (const [cat, prods] of Object.entries(byCategory)) {
    productLines += `\n[${cat.toUpperCase()} SHOES]\n`;
    for (const p of prods) {
      const sizes = (p.sizes as string[]).join(", ") || "38-45";
      const colors = (p.colors as { name: string }[]).map(c => c.name).join(", ") || "Multiple";
      const inStock = Number(p.stock) > 0;
      const priceStr = p.isOnSale && p.salePrice
        ? `PKR ${Number(p.salePrice).toLocaleString()} (SALE — was PKR ${Number(p.price).toLocaleString()})`
        : `PKR ${Number(p.price).toLocaleString()}`;
      const badges = [
        p.isFeatured ? "FEATURED" : "",
        p.isNew ? "NEW ARRIVAL" : "",
        p.isOnSale ? "ON SALE" : "",
        inStock ? "IN STOCK" : "OUT OF STOCK",
      ].filter(Boolean).join(" | ");
      productLines += `  • ${p.name} — ${priceStr} | Sizes: ${sizes} | Colors: ${colors} | Brand: ${p.brandLine || "Nano Shoes"} | ${badges}\n`;
    }
  }

  const phone = settings.contactPhone || "+92 300 1234567";
  const whatsapp = settings.whatsappNumber || phone;
  const email = settings.contactEmail || "support@nanoshoes.pk";
  const address = settings.address || "Lahore, Pakistan";
  const shippingRate = settings.shippingRate || "200";
  const freeThreshold = settings.freeShippingThreshold || "3000";
  const instagram = settings.instagramUrl || "";
  const facebook = settings.facebookUrl || "";

  const kb = `${productLines}

=== STORE INFO ===
Name: Nano Shoes | Tagline: Move Beyond Limits
Address: ${address}
Phone: ${phone} | WhatsApp: ${whatsapp} | Email: ${email}
${instagram ? `Instagram: ${instagram}` : ""}
${facebook ? `Facebook: ${facebook}` : ""}
Working Hours: Monday–Saturday 10:00 AM – 8:00 PM

=== SHIPPING & PAYMENTS ===
Shipping cost: PKR ${shippingRate} | Free shipping above PKR ${freeThreshold}
Payment: COD (Cash on Delivery), Credit/Debit Card, EasyPaisa, JazzCash
Delivery: Lahore 1–2 days | Karachi/Islamabad 2–3 days | Other cities 3–5 days

=== POLICIES ===
Returns: 7 days from delivery, shoes must be unworn, original box required
Sale items: Exchange only, no cash refund
Order tracking: Visit /track-order on the website and enter order number
Coupon codes: NANO10 (10% off), NANO20 (20% off), WELCOME50 (50% off first order)
Size guide: Available at /size-guide

=== CATEGORIES ===
${cats.map(c => c.name).join(" | ")}`;

  productCache = { data: kb, ts: now };
  return kb;
}

/** Try to find order info if the user message contains an order number or email */
async function lookupOrderFromMessage(text: string): Promise<string | null> {
  // Match patterns: ORD-12345, #12345, plain 5+ digit numbers
  const orderMatch = text.match(/\b(?:ORD[-\s]?\d{3,}|#\d{4,}|\d{6,})\b/i);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  if (!orderMatch && !emailMatch) return null;

  try {
    let order = null;

    if (orderMatch) {
      const raw = orderMatch[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const numericId = parseInt(raw.replace(/[^0-9]/g, "")) || 0;
      const results = await db
        .select()
        .from(ordersTable)
        .where(
          or(
            like(ordersTable.orderNumber, `%${raw}%`),
            numericId > 0 ? eq(ordersTable.id, numericId) : undefined,
          ),
        )
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

    const statusLabels: Record<string, string> = {
      pending: "⏳ Pending — Order received",
      confirmed: "✅ Confirmed — Being processed",
      shipped: "🚚 Shipped — On its way to you",
      delivered: "📦 Delivered",
      cancelled: "❌ Cancelled",
    };

    const itemsList = (order.items as StoredItem[])
      .map((i) => `${i.productName} × ${i.quantity} (Size: ${i.size}, Color: ${i.color || "—"}) — PKR ${Number(i.price).toLocaleString()}`)
      .join("\n    ");

    return `=== ORDER FOUND IN DATABASE ===
Order No: ${order.orderNumber || `#${order.id}`}
Customer: ${order.customerName} | Phone: ${order.customerPhone || "—"}
Status: ${statusLabels[order.status] || order.status}
Payment: ${order.paymentMethod?.toUpperCase()} — ${order.paymentStatus}
Items:
    ${itemsList}
Subtotal: PKR ${Number(order.subtotal).toLocaleString()} | Shipping: PKR ${Number(order.shippingCost).toLocaleString()} | Total: PKR ${Number(order.total).toLocaleString()}
Shipping to: ${order.shippingAddress}, ${order.city}, ${order.province || "Pakistan"}
${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : "Tracking number will be shared once shipped."}
${order.couponCode ? `Coupon used: ${order.couponCode} (Discount: PKR ${Number(order.discountAmount).toLocaleString()})` : ""}
Order placed: ${new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "long" })}`;
  } catch {
    return null;
  }
}

type StoredItem = { productName: string; quantity: number; size: string; color?: string; price: number };

const BASE_SYSTEM_PROMPT = `You are Nano Bot — the friendly, knowledgeable AI assistant for Nano Shoes Pakistan.

LANGUAGE RULES (very important):
- If user writes in English → reply in English
- If user writes in Arabic → reply in Arabic (اعرب)
- If user writes in Urdu script → reply in Urdu script
- If user writes in Roman Urdu (Latin letters like "mujhe batao", "kya price hai") → reply in Roman Urdu (same Latin-script style)
- Mix is fine — match the user's style

SCOPE:
- Only answer Nano Shoes related questions
- If someone asks about something unrelated, say: "I can only help with Nano Shoes questions. For anything else, please contact support@nanoshoes.pk"

BEHAVIOR:
- Be warm, helpful, and professional
- Use bullet points when listing items
- For prices always say PKR (Pakistani Rupees)
- When mentioning products from the catalog, say their exact name and price
- If a product is out of stock, say so and suggest similar alternatives
- For order tracking, use the real order data provided below if available
- Always end with: "Kuch aur madad chahiye? / Is there anything else I can help you with?"`;

router.post("/chat", async (req, res) => {
  try {
    const { messages, language } = req.body as {
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      language?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "AI not configured" });
      return;
    }

    // Fetch live knowledge base and possible order info in parallel
    const lastUserMessage = [...messages].reverse().find(m => m.role === "user")?.content ?? "";
    const [knowledgeBase, orderInfo] = await Promise.all([
      getLiveKnowledgeBase(),
      lookupOrderFromMessage(lastUserMessage),
    ]);

    const systemPrompt = [
      BASE_SYSTEM_PROMPT,
      "\n",
      knowledgeBase,
      orderInfo ? `\n\n${orderInfo}` : "",
    ].join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-20250514",
        max_tokens: 600,
        system: systemPrompt,
        messages: messages
          .filter(m => m.content.trim() !== "")
          .map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      req.log.error({ status: response.status }, "Anthropic request failed");
      res.status(502).json({ error: "AI response failed" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") continue;
        try {
          const event = JSON.parse(payload) as {
            type?: string;
            delta?: { type?: string; text?: string };
          };
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) {
            res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    req.log.error(error, "Chat error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
});

export default router;
