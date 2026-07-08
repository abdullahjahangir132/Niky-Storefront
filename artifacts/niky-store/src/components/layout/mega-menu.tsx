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
    <div className="absolute left-0 right-0 top-full bg-background border-b border-border shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150 z-40">
      <div className="container mx-auto px-4 md:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Highlights</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href={`/collections/${category}`} onClick={onNavigate} className="hover:text-accent transition-colors font-bold">Shop All {label}</Link></li>
            <li><Link href={`/shop?mainCategory=${category}&sort=newest`} onClick={onNavigate} className="hover:text-accent transition-colors">New Arrivals</Link></li>
            <li><Link href={`/shop?mainCategory=${category}&sort=best_selling`} onClick={onNavigate} className="hover:text-accent transition-colors">Bestsellers</Link></li>
            <li><Link href={`/shop?mainCategory=${category}&sort=featured`} onClick={onNavigate} className="hover:text-accent transition-colors">Featured</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Shop By Type</h4>
          <ul className="space-y-3 text-sm">
            {d.subCategories.map((sc) => (
              <li key={sc}>
                <Link href={`/shop?mainCategory=${category}&subCategory=${sc}`} onClick={onNavigate} className="hover:text-accent transition-colors">
                  {titleCase(sc)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Brand Lines</h4>
          <ul className="space-y-3 text-sm">
            {d.brandLines.map((bl) => (
              <li key={bl}>
                <Link href={`/shop?mainCategory=${category}&brandLine=${encodeURIComponent(bl)}`} onClick={onNavigate} className="hover:text-accent transition-colors">
                  {bl}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-accent mb-4">Trending</h4>
          <ul className="space-y-3 text-sm">
            {d.tags.length > 0 ? (
              d.tags.map((tag) => (
                <li key={tag}>
                  <Link href={`/shop?mainCategory=${category}&tag=${encodeURIComponent(tag)}`} onClick={onNavigate} className="hover:text-accent transition-colors capitalize">
                    {tag}
                  </Link>
                </li>
              ))
            ) : (
              <li><Link href={`/shop?mainCategory=${category}&onSale=true`} onClick={onNavigate} className="hover:text-accent transition-colors">Sale</Link></li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
