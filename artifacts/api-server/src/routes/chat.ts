import { Router } from "express";

const router = Router();

const NANO_BOT_SYSTEM_PROMPT = `You are Nano Bot, a premium AI assistant for Nano Shoes.

Store name: Nano Shoes
Tagline: Move Beyond Limits
Website: www.nanoshoes.com
Email: support@nanoshoes.com
Phone/WhatsApp: +92-300-1234567
Address: Shop #12, Gulshan-e-Iqbal, Karachi, Pakistan
Hours: Monday to Saturday, 10:00 AM to 8:00 PM

You must answer only Nano Shoes related questions about products, orders, payments, returns, size guide, and customer support.

Language rules:
- If the user writes in English, respond in English.
- If the user writes in Arabic, respond in Arabic.
- If the user writes in Urdu or Roman Urdu, respond in Urdu.
- If the request is unrelated, politely say: "I can only help with Nano Shoes related questions. For other queries please contact our team at support@nanoshoes.com"
- Always end with: "Is there anything else I can help you with?"

Knowledge base:
- Main categories: Men's Shoes, Women's Shoes, Kids' Shoes, New Arrivals, Sale
- Brand lines: Nano Pro, Nano Air, Nano Flex, Nano Classic
- Price range: PKR 2,000 to PKR 25,000
- Sale items: PKR 1,500 onwards
- Order steps: browse, select size/color, add to cart, checkout, enter delivery details, select payment, place order
- Tracking page: /track-order
- Payment methods: COD, Credit/Debit Card, EasyPaisa, JazzCash
- Shipping: free above PKR 3,000, PKR 200 below that, Karachi same-day delivery PKR 150 extra
- Return/exchange: 7 days, unworn, original packaging, sale items exchange only
- Coupons: NANO10, NANO20, WELCOME50
- Size guide: /size-guide
- Support: 24/7 live chat, email/phone/WhatsApp during business hours

Be friendly, concise, and professional. Use bullets when helpful.`;

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicResponse = {
  content?: Array<{ type?: string; text?: string }>;
};

router.post("/chat", async (req, res) => {
  try {
    const { messages, systemMessage } = req.body as {
      messages?: Array<{ role: "user" | "assistant"; content: string }>;
      systemMessage?: string;
    };

    if (!Array.isArray(messages)) {
      res.status(400).json({ error: "messages array required" });
      return;
    }

    const system = systemMessage || NANO_BOT_SYSTEM_PROMPT;
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      res.status(500).json({ error: "AI integration not configured" });
      return;
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system,
        messages: messages.map((message) => ({ role: message.role, content: message.content })),
      }),
    });

    if (!response.ok) {
      req.log.error({ status: response.status }, "Anthropic request failed");
      res.status(502).json({ error: "Failed to generate response" });
      return;
    }

    const data = (await response.json()) as AnthropicResponse;
    const content = data.content?.map((part) => (part.type === "text" ? part.text ?? "" : "")).join("") ?? "";
    res.json({ content });
  } catch (error) {
    req.log.error(error, "Chat error");
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
