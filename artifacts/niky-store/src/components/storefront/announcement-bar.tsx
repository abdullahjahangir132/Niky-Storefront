import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface PublicSettings {
  announcementBarEnabled: string;
  announcementBarItems: string;
}

export default function AnnouncementBar() {
  const [items, setItems] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((data: PublicSettings) => {
        if (data.announcementBarEnabled === "true") {
          try {
            const parsed = JSON.parse(data.announcementBarItems);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setItems(parsed);
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {});
  }, []);

  if (dismissed || items.length === 0) return null;

  // Two identical groups are enough for a seamless loop. The animation travels
  // exactly one group, so every configured item is shown once per cycle.
  const repeated = [items, items];

  return (
    <div className="relative z-50 h-10 flex items-center overflow-hidden select-none bg-[#121214] text-white border-b border-white/10 marquee-viewport">
      <div className="flex h-full w-max animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
        {repeated.map((group, groupIndex) => (
          <div key={groupIndex} className="marquee-group flex h-full shrink-0 items-center">
            {group.map((item, itemIndex) => (
              <span key={`${groupIndex}-${itemIndex}`} className="flex h-full items-center shrink-0">
                <span className="px-7 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 sm:px-10">
                  {item}
                </span>
                <span className="text-accent text-[11px]" aria-hidden="true">/</span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-white/15 bg-[#121214]/90 text-white/55 transition-colors hover:border-accent hover:text-white sm:right-4"
        aria-label="Dismiss announcement bar"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
