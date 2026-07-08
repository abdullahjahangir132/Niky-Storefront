import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import { useGetSearchSuggestions } from "@workspace/api-client-react";

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data } = useGetSearchSuggestions();
  const terms = data?.terms ?? [];

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const runSearch = (term: string) => {
    const q = term.trim();
    if (!q) return;
    onClose();
    navigate(`/shop?search=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-background"
        >
          <div className="container mx-auto px-4 md:px-6 h-full flex flex-col">
            <div className="flex items-center gap-4 h-20 flex-shrink-0 border-b border-border">
              <Search size={22} className="text-muted-foreground flex-shrink-0" />
              <form
                className="flex-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  runSearch(query);
                }}
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for shoes, brands, styles…"
                  className="w-full bg-transparent border-none outline-none font-display text-2xl md:text-4xl uppercase tracking-tight placeholder:text-muted-foreground/40"
                />
              </form>
              <button
                aria-label="Close search"
                onClick={onClose}
                className="text-foreground hover:text-accent transition-colors flex-shrink-0"
              >
                <X size={26} />
              </button>
            </div>

            <div className="pt-10 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                <TrendingUp size={14} className="text-accent" />
                Popular Search Terms
              </div>
              <div className="flex flex-wrap gap-3">
                {(terms.length > 0 ? terms : ["Running", "Sneakers", "Nano Air", "Casual", "Sale"]).map((term) => (
                  <button
                    key={term}
                    onClick={() => runSearch(term)}
                    className="px-5 py-2.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors text-sm font-semibold capitalize"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
