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

  // Duplicate enough times for a seamless infinite scroll
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div className="relative bg-[#111111] text-white overflow-hidden h-9 flex items-center select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center flex-shrink-0">
            <span className="text-[11px] font-semibold tracking-wider uppercase px-8">
              {item}
            </span>
            <span className="text-accent/60 text-[10px]">•</span>
          </span>
        ))}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors z-10 p-1"
        aria-label="Dismiss announcement bar"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
