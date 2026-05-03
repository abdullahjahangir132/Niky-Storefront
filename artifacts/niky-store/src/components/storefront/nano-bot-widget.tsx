import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Language = "en" | "ar" | "ur";
type Role = "user" | "assistant";

interface Message {
  role: Role;
  content: string;
}

const COPY = {
  en: {
    title: "Nano Bot",
    subtitle: "Nano Shoes Official Assistant",
    online: "Online — 24/7 Support",
    placeholder: "Type your question...",
    quickReplies: ["Track Order", "Our Products", "Payment Methods", "Return Policy", "Contact Us", "About Nano Shoes"],
    greeting:
      "Hello! Welcome to Nano Shoes! I'm Nano Bot, your personal shopping assistant. I can help you with products, orders, payments, and more. How can I help you today? 👟",
    fallback:
      "I can only help with Nano Shoes related questions. For other queries please contact our team at support@nanoshoes.com",
  },
  ar: {
    title: "نانو بوت",
    subtitle: "مساعد نانو شوز الرسمي",
    online: "متصل — دعم 24/7",
    placeholder: "اكتب سؤالك...",
    quickReplies: ["تتبع الطلب", "منتجاتنا", "طرق الدفع", "سياسة الإرجاع", "اتصل بنا", "عن نانو شوز"],
    greeting:
      "مرحباً! أهلاً بك في نانو شوز! أنا نانو بوت، مساعدك الشخصي للتسوق. يمكنني مساعدتك في المنتجات والطلبات والدفع وأكثر. كيف يمكنني مساعدتك اليوم؟ 👟",
    fallback:
      "يمكنني فقط المساعدة في الأسئلة المتعلقة بنانو شوز. للاستفسارات الأخرى، يرجى التواصل معنا على support@nanoshoes.com",
  },
  ur: {
    title: "نانو بوٹ",
    subtitle: "نانو شوز کا آفیشل اسسٹنٹ",
    online: "آن لائن — 24/7 سپورٹ",
    placeholder: "اپنا سوال لکھیں...",
    quickReplies: ["آرڈر ٹریک کریں", "ہماری کلیکشنز", "ادائیگی کے طریقے", "واپسی کی پالیسی", "رابطہ کریں", "نانو شوز کے بارے میں"],
    greeting:
      "السلام علیکم! نانو شوز میں خوش آمدید! میں نانو بوٹ ہوں، آپ کا ذاتی شاپنگ اسسٹنٹ۔ میں پروڈکٹس، آرڈرز، ادائیگی اور مزید میں مدد کر سکتا ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟ 👟",
    fallback:
      "میں صرف نانو شوز سے متعلق سوالات میں مدد کر سکتا ہوں۔ دیگر سوالات کے لیے support@nanoshoes.com پر رابطہ کریں",
  },
} as const;

const SYSTEM_MESSAGES: Record<Language, string> = {
  en: "You are Nano Bot, the friendly, professional AI assistant for Nano Shoes. Answer only Nano Shoes related questions. Use English. Always end with: Is there anything else I can help you with?",
  ar: "أنت نانو بوت، المساعد الذكي الودود والمهني لمتجر نانو شوز. أجب فقط عن الأسئلة المتعلقة بنانو شوز. استخدم العربية. وأنهِ دائماً بـ: هل هناك أي شيء آخر يمكنني مساعدتك به؟",
  ur: "آپ نانو بوٹ ہیں، نانو شوز کے لیے دوستانہ اور پیشہ ور AI اسسٹنٹ۔ صرف نانو شوز سے متعلق سوالات کے جواب دیں۔ اردو میں جواب دیں۔ ہمیشہ اس جملے پر ختم کریں: کیا میں آپ کی مزید مدد کر سکتا ہوں؟",
};

const QUICK_PROMPT_MAP: Record<Language, Record<string, string>> = {
  en: {
    "Track Order": "How do I track my order?",
    "Our Products": "Tell me about your products and collections.",
    "Payment Methods": "What payment methods do you offer?",
    "Return Policy": "Explain your return and exchange policy.",
    "Contact Us": "How can I contact customer support?",
    "About Nano Shoes": "Tell me about Nano Shoes.",
  },
  ar: {
    "تتبع الطلب": "كيف أتابع طلبي؟",
    "منتجاتنا": "حدثني عن المنتجات والمجموعات.",
    "طرق الدفع": "ما هي طرق الدفع المتاحة؟",
    "سياسة الإرجاع": "اشرح سياسة الإرجاع والاستبدال.",
    "اتصل بنا": "كيف أتواصل مع خدمة العملاء؟",
    "عن نانو شوز": "حدثني عن نانو شوز.",
  },
  ur: {
    "آرڈر ٹریک کریں": "میں اپنا آرڈر کیسے ٹریک کروں؟",
    "ہماری کلیکشنز": "اپنی پروڈکٹس اور کلیکشنز کے بارے میں بتائیں۔",
    "ادائیگی کے طریقے": "آپ کون کون سے payment methods دیتے ہیں؟",
    "واپسی کی پالیسی": "اپنی return اور exchange policy سمجھائیں۔",
    "رابطہ کریں": "کسٹمر سپورٹ سے کیسے رابطہ کروں؟",
    "نانو شوز کے بارے میں": "نانو شوز کے بارے میں بتائیں۔",
  },
};

export function NanoBotWidget() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: COPY.en.greeting }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const copy = COPY[language];
  const rtl = language !== "en";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  const sendMessage = async (content?: string) => {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text } as Message];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          systemMessage: SYSTEM_MESSAGES[language],
          messages: nextMessages,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

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
          const payload = JSON.parse(line.slice(6)) as { content?: string; done?: boolean; error?: string };
          if (payload.content) {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, content: last.content + payload.content };
              return next;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: copy.fallback };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = useMemo(() => COPY[language].quickReplies, [language]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3" dir={rtl ? "rtl" : "ltr"}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="flex h-[550px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white"
          >
            <div className="flex items-center justify-between gap-3 bg-[#111111] px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e11d48] text-sm font-bold">NB</div>
                <div className="min-w-0">
                  <div className="font-semibold leading-tight">{copy.title}</div>
                  <div className="text-xs text-white/75">{copy.subtitle}</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-[#ececec] px-4 py-2 text-xs">
              {(["en", "ar", "ur"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setMessages([{ role: "assistant", content: COPY[lang].greeting }]);
                  }}
                  className={`rounded-full px-3 py-1 transition-colors ${language === lang ? "bg-black text-white" : "border border-[#d4d4d4] text-[#444]"}`}
                >
                  {lang === "en" ? "English" : lang === "ar" ? "العربية" : "اردو"}
                </button>
              ))}
              <div className="ms-auto flex items-center gap-1.5 text-[#16a34a]">
                <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                <span>{copy.online}</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#fafafa] px-4 py-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" ? (
                    <div className="flex max-w-[80%] items-start gap-2">
                      <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#e11d48] text-[10px] font-bold text-white">
                        NB
                      </div>
                      <div className="whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-[#f3f4f6] px-4 py-3 text-sm leading-6 text-[#111111]">
                        {message.content}
                        {loading && index === messages.length - 1 && message.content === "" ? (
                          <span className="ml-1 inline-flex items-center gap-1 align-middle">
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999] [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#999] [animation-delay:300ms]" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="flex max-w-[80%] flex-row-reverse items-start gap-2">
                      <div className="mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#111111] text-[10px] font-bold text-white">
                        U
                      </div>
                      <div className="whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-[#111111] px-4 py-3 text-sm leading-6 text-white">
                        {message.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-[#ececec] px-3 py-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((item) => (
                  <button
                    key={item}
                    onClick={() => sendMessage(QUICK_PROMPT_MAP[language][item])}
                    className="rounded-full border border-[#d8d8d8] px-3 py-1.5 text-xs text-[#333] transition-colors hover:border-[#e11d48] hover:bg-[#fff1f4]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#ececec] bg-white p-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={copy.placeholder}
                className="h-11 rounded-full border-[#d6d6d6] px-4 text-sm focus-visible:ring-0"
              />
              <Button size="icon" className="h-11 w-11 rounded-full bg-black text-white hover:bg-[#e11d48]" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setOpen((v) => !v)} className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-sm">
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-[#e11d48] text-[10px] font-bold leading-5 text-white">1</span>
      </motion.button>
    </div>
  );
}
