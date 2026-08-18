import { useState, useEffect } from "react";
import { Link } from "wouter";

interface PublicSettings {
  tagBarEnabled: string;
  tagBarItems: string;
}

const DEFAULT_ITEMS = ["NANO AIR", "NANO PRO", "NANO FLEX", "NANO CLASSIC", "NANO SPORT", "NANO LITE"];

export default function TagScrollBar() {
  const [items, setItems] = useState<string[]>(DEFAULT_ITEMS);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((data: PublicSettings) => {
        if (data.tagBarEnabled === "false") {
          setEnabled(false);
          return;
        }
        try {
          const parsed = JSON.parse(data.tagBarItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
          }
        } catch {
          // keep defaults
        }
      })
      .catch(() => {});
  }, []);

  if (!enabled || items.length === 0) return null;

  // Repeat for seamless infinite scroll
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="flex h-14 items-center overflow-hidden border-y border-white/10 bg-[#1a1a1a]">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <Link
            key={i}
            href={`/shop?brandLine=${encodeURIComponent(item)}`}
            className="flex items-center flex-shrink-0 group"
          >
            <span className="font-display font-black text-sm md:text-base uppercase tracking-[0.15em] text-white/80 group-hover:text-white transition-colors duration-200 px-10">
              {item}
            </span>
            <span className="text-accent font-black text-base">+</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
