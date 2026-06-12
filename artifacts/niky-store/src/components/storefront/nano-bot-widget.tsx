import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Simple markdown renderer ─────────────────────────────────────────────────
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(<strong key={m.index} className="font-bold">{m[1]}</strong>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MsgContent({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table: lines starting with |
    if (line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      const rows = tableLines
        .filter(l => !l.match(/^\s*\|[-| :]+\|\s*$/)) // skip separator rows
        .map(l => l.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()));
      if (rows.length > 0) {
        nodes.push(
          <div key={`table-${i}`} className="overflow-x-auto my-1">
            <table className="text-xs border-collapse w-full">
              <thead>
                <tr className="bg-zinc-100">
                  {rows[0].map((h, j) => (
                    <th key={j} className="border border-zinc-200 px-2 py-1 text-left font-bold">{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(1).map((row, r) => (
                  <tr key={r} className={r % 2 === 0 ? "" : "bg-zinc-50"}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-zinc-200 px-2 py-1">{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Empty line → spacer
    if (line.trim() === "") {
      nodes.push(<div key={`sp-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Bullet: starts with • or -
    if (line.trim().match(/^[•\-]\s/)) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].trim().match(/^[•\-]\s/)) {
        bullets.push(lines[i].trim().replace(/^[•\-]\s/, ""));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-1 space-y-0.5 pl-3">
          {bullets.map((b, j) => (
            <li key={j} className="flex gap-2 text-sm">
              <span className="text-accent mt-0.5 flex-shrink-0">•</span>
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Normal line
    nodes.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{nodes}</div>;
}

type Language = "en" | "rur" | "ar" | "ur";
type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

const COPY = {
  en: {
    title: "Nano Bot",
    subtitle: "Nano Shoes Assistant",
    online: "Online — 24/7",
    placeholder: "Ask about products, orders, sizes...",
    langLabel: "English",
    quickReplies: ["Track My Order", "Products & Prices", "Sizes Available", "Payment Methods", "Return Policy", "Contact Us"],
    greeting: "Hello! Welcome to Nano Shoes 👟\n\nI'm Nano Bot — I have live access to our product catalog, orders, and store info. Ask me anything!\n\n• Product prices & availability\n• Order status (share your order number)\n• Sizes, colors, brand lines\n• Payments, shipping & returns",
    fallback: "Sorry, I couldn't connect right now. Please contact us at support@nanoshoes.pk or WhatsApp us!",
  },
  rur: {
    title: "Nano Bot",
    subtitle: "Nano Shoes Assistant",
    online: "Online — 24/7",
    placeholder: "Kuch poochein — products, orders, sizes...",
    langLabel: "Roman Urdu",
    quickReplies: ["Order Track Karo", "Products & Prices", "Sizes Kya Hain", "Payment Methods", "Return Policy", "Contact Karo"],
    greeting: "Assalam o Alaikum! Nano Shoes mein khush aamdeed 👟\n\nMain Nano Bot hun — mere paas aap ke products, orders, aur store ki live information hai!\n\n• Kisi bhi product ki price aur availability\n• Order status (apna order number batao)\n• Sizes, colors, brand lines\n• Payment, shipping aur return policy",
    fallback: "Maafi chahta hun, abhi connect nahi ho pa raha. support@nanoshoes.pk ya WhatsApp par rabta karein!",
  },
  ar: {
    title: "نانو بوت",
    subtitle: "مساعد نانو شوز",
    online: "متصل — 24/7",
    placeholder: "اسأل عن المنتجات، الطلبات، المقاسات...",
    langLabel: "العربية",
    quickReplies: ["تتبع طلبي", "المنتجات والأسعار", "المقاسات المتاحة", "طرق الدفع", "سياسة الإرجاع", "تواصل معنا"],
    greeting: "مرحباً! أهلاً بك في نانو شوز 👟\n\nأنا نانو بوت — لدي وصول مباشر لكتالوج منتجاتنا والطلبات ومعلومات المتجر!\n\n• أسعار المنتجات وتوفرها\n• حالة الطلب (أرسل رقم طلبك)\n• المقاسات والألوان وخطوط الماركة\n• الدفع والشحن والإرجاع",
    fallback: "عذراً، لم أستطع الاتصال الآن. يرجى التواصل على support@nanoshoes.pk أو واتساب!",
  },
  ur: {
    title: "نانو بوٹ",
    subtitle: "نانو شوز اسسٹنٹ",
    online: "آن لائن — 24/7",
    placeholder: "پروڈکٹس، آرڈرز، سائز کے بارے میں پوچھیں...",
    langLabel: "اردو",
    quickReplies: ["آرڈر ٹریک کریں", "پروڈکٹس اور قیمتیں", "دستیاب سائز", "ادائیگی کے طریقے", "واپسی کی پالیسی", "رابطہ کریں"],
    greeting: "السلام علیکم! نانو شوز میں خوش آمدید 👟\n\nمیں نانو بوٹ ہوں — میرے پاس ہمارے پروڈکٹس، آرڈرز، اور اسٹور کی براہ راست معلومات ہے!\n\n• پروڈکٹ کی قیمت اور دستیابی\n• آرڈر اسٹیٹس (آرڈر نمبر شیئر کریں)\n• سائز، رنگ، برانڈ لائنز\n• ادائیگی، شپنگ اور واپسی",
    fallback: "معذرت، ابھی کنیکٹ نہیں ہو پا رہا۔ support@nanoshoes.pk یا واٹس ایپ پر رابطہ کریں!",
  },
} as const;

const QUICK_PROMPT_MAP: Record<Language, Record<string, string>> = {
  en: {
    "Track My Order": "I want to track my order. Can you help me? My order number is...",
    "Products & Prices": "Show me your current products and prices.",
    "Sizes Available": "What shoe sizes do you carry?",
    "Payment Methods": "What payment methods do you accept?",
    "Return Policy": "Explain your return and exchange policy.",
    "Contact Us": "How can I contact Nano Shoes customer support?",
  },
  rur: {
    "Order Track Karo": "Mujhe apna order track karna hai. Order number hai...",
    "Products & Prices": "Aap ke products aur prices batao.",
    "Sizes Kya Hain": "Aap ke paas kaunse shoe sizes available hain?",
    "Payment Methods": "Aap kaunse payment methods accept karte ho?",
    "Return Policy": "Return aur exchange policy kya hai?",
    "Contact Karo": "Nano Shoes se kaise contact karun?",
  },
  ar: {
    "تتبع طلبي": "أريد تتبع طلبي. رقم طلبي هو...",
    "المنتجات والأسعار": "أرني منتجاتك الحالية وأسعارها.",
    "المقاسات المتاحة": "ما هي مقاسات الأحذية المتاحة؟",
    "طرق الدفع": "ما طرق الدفع المتاحة؟",
    "سياسة الإرجاع": "اشرح سياسة الإرجاع والاستبدال.",
    "تواصل معنا": "كيف أتواصل مع خدمة عملاء نانو شوز؟",
  },
  ur: {
    "آرڈر ٹریک کریں": "مجھے اپنا آرڈر ٹریک کرنا ہے۔ آرڈر نمبر ہے...",
    "پروڈکٹس اور قیمتیں": "اپنے موجودہ پروڈکٹس اور قیمتیں دکھائیں۔",
    "دستیاب سائز": "آپ کے پاس کون سے جوتوں کے سائز دستیاب ہیں؟",
    "ادائیگی کے طریقے": "آپ کون سے ادائیگی کے طریقے قبول کرتے ہیں؟",
    "واپسی کی پالیسی": "واپسی اور تبادلے کی پالیسی بتائیں۔",
    "رابطہ کریں": "نانو شوز سے کیسے رابطہ کروں؟",
  },
};

const LANG_LABELS: { key: Language; label: string; dir: "ltr" | "rtl" }[] = [
  { key: "en",  label: "EN",       dir: "ltr" },
  { key: "rur", label: "RU",       dir: "ltr" },
  { key: "ar",  label: "AR",       dir: "rtl" },
  { key: "ur",  label: "اردو",     dir: "rtl" },
];

export function NanoBotWidget() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: COPY.en.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = COPY[language];
  const dir = language === "ar" || language === "ur" ? "rtl" : "ltr";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 260);
  }, [open]);

  function switchLanguage(lang: Language) {
    setLanguage(lang);
    setMessages([{ role: "assistant", content: COPY[lang].greeting }]);
    setInput("");
  }

  const sendMessage = async (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, messages: nextMessages }),
      });

      if (!res.ok) throw new Error("Request failed");

      const contentType = res.headers.get("Content-Type") ?? "";

      // ── Plain JSON response (no API key — knowledge-base mode) ──
      if (contentType.includes("application/json")) {
        const data = await res.json() as { content?: string; done?: boolean };
        if (data.content) {
          setMessages(prev => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], content: data.content! };
            return next;
          });
        }
        return;
      }

      // ── SSE streaming response (API key configured) ──
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.trim();
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as { content?: string; done?: boolean };
            if (payload.content) {
              setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                next[next.length - 1] = { ...last, content: last.content + payload.content };
                return next;
              });
            }
          } catch { /* skip */ }
        }
      }
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: copy.fallback };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = useMemo(() => copy.quickReplies, [copy]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="flex h-[570px] w-[390px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
            dir={dir}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 bg-[#111] px-4 py-3 text-white flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm leading-tight font-display tracking-wide">{copy.title}</div>
                  <div className="text-[11px] text-white/65 flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                    {copy.online}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/10 transition-colors flex-shrink-0">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Language switcher */}
            <div className="flex items-center gap-1.5 border-b border-zinc-100 px-3 py-2 bg-zinc-50 flex-shrink-0">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mr-1">Lang:</span>
              {LANG_LABELS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => switchLanguage(key)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                    language === key
                      ? "bg-[#111] text-white"
                      : "border border-zinc-200 text-zinc-500 hover:border-zinc-400"
                  }`}
                >
                  {label}
                </button>
              ))}
              <div className="ms-auto text-[10px] text-zinc-400 font-medium">
                {language === "rur" ? "Roman Urdu" : language === "en" ? "English" : language === "ar" ? "عربي" : "اردو"}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50/50" dir={dir}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" ? (
                    <div className="flex max-w-[82%] items-start gap-2">
                      <div className="mt-1 h-7 w-7 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-white border border-zinc-200 px-4 py-3 text-zinc-800 shadow-sm min-h-[2.5rem]">
                        {message.content ? (
                          <MsgContent text={message.content} />
                        ) : loading && index === messages.length - 1 ? (
                          <span className="inline-flex items-center gap-1 align-middle h-5">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:120ms]" />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:240ms]" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[82%]">
                      <div className="whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#111] px-4 py-3 text-sm leading-[1.65] text-white">
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="border-t border-zinc-100 px-3 pt-2.5 pb-1.5 bg-white flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {quickReplies.map((item) => (
                  <button
                    key={item}
                    onClick={() => sendMessage(QUICK_PROMPT_MAP[language][item])}
                    disabled={loading}
                    className="rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] font-medium text-zinc-600 transition-colors hover:border-accent hover:bg-red-50 hover:text-accent disabled:opacity-50"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-zinc-100 bg-white p-3 flex-shrink-0">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder={copy.placeholder}
                disabled={loading}
                className="h-10 rounded-full border-zinc-200 px-4 text-sm focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent"
                dir={dir}
              />
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-[#111] text-white hover:bg-accent flex-shrink-0"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(v => !v)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#111] text-white shadow-lg hover:bg-accent transition-colors"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-accent text-[9px] font-bold leading-5 text-white flex items-center justify-center">
            AI
          </span>
        )}
      </motion.button>
    </div>
  );
}
