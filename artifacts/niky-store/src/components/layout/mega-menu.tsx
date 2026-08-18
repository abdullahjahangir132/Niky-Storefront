import { Link } from "wouter";
import { useEffect, useState } from "react";

interface NavMenuCategoryData {
  subCategories: string[];
  brandLines: string[];
  tags: string[];
}

type NavMenuData = Record<string, NavMenuCategoryData>;

export function useNavMenu() {
  const [data, setData] = useState<NavMenuData>({});

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/nav-menu`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return data;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

const FALLBACK: Record<string, NavMenuCategoryData> = {
  men: { subCategories: ["running", "casual", "formal", "sports"], brandLines: ["Nano Air", "Nano Pro"], tags: [] },
  women: { subCategories: ["running", "casual", "sports"], brandLines: ["Nano Air", "Nano Flex"], tags: [] },
  kids: { subCategories: ["running", "casual", "formal"], brandLines: ["Nano Classic"], tags: [] },
};

export function MegaMenuPanel({
  category,
  data,
  onNavigate,
}: {
  category: "men" | "women" | "kids";
  data?: NavMenuCategoryData;
  onNavigate: () => void;
}) {
  const label = titleCase(category);
  const d = data && (data.subCategories.length || data.brandLines.length) ? data : FALLBACK[category];

  return (
    <div className="absolute left-0 right-0 top-full z-40 border-b border-border bg-background/98 shadow-[0_24px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="container mx-auto grid grid-cols-2 gap-x-8 gap-y-10 px-5 py-8 md:grid-cols-4 md:px-6 md:py-10 lg:gap-x-16">
        <div className="border-l-2 border-accent pl-4">
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Highlights</h4>
          <ul className="space-y-3.5 text-sm">
            <li><Link href={`/collections/${category}`} onClick={onNavigate} className="font-bold transition-colors hover:text-accent">Shop All {label}<span className="ml-2 text-accent">→</span></Link></li>
            <li><Link href={`/shop?mainCategory=${category}&sort=newest`} onClick={onNavigate} className="text-foreground/75 transition-colors hover:text-accent">New Arrivals</Link></li>
            <li><Link href={`/shop?mainCategory=${category}&sort=best_selling`} onClick={onNavigate} className="text-foreground/75 transition-colors hover:text-accent">Bestsellers</Link></li>
            <li><Link href={`/shop?mainCategory=${category}&sort=featured`} onClick={onNavigate} className="text-foreground/75 transition-colors hover:text-accent">Featured</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Shop By Type</h4>
          <ul className="space-y-3.5 text-sm">
            {d.subCategories.map((sc) => (
              <li key={sc}>
                <Link href={`/shop?mainCategory=${category}&subCategory=${sc}`} onClick={onNavigate} className="text-foreground/75 transition-colors hover:text-accent">
                  {titleCase(sc)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Brand Lines</h4>
          <ul className="space-y-3.5 text-sm">
            {d.brandLines.map((bl) => (
              <li key={bl}>
                <Link href={`/shop?mainCategory=${category}&brandLine=${encodeURIComponent(bl)}`} onClick={onNavigate} className="text-foreground/75 transition-colors hover:text-accent">
                  {bl}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Trending</h4>
          <ul className="space-y-3.5 text-sm">
            {d.tags.length > 0 ? (
              d.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/shop?mainCategory=${category}&tag=${encodeURIComponent(tag)}`} onClick={onNavigate} className="text-foreground/75 transition-colors hover:text-accent capitalize">
                    {tag}
                  </Link>
                </li>
              ))
            ) : (
              <li><Link href={`/shop?mainCategory=${category}&onSale=true`} onClick={onNavigate} className="font-bold text-accent transition-colors hover:text-foreground">Sale</Link></li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
