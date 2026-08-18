import { useState } from "react";
import { useListProducts, useListCategories, ListProductsSort } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "popular", label: "Best Sellers" },
];

const mainCategories = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
];

export default function Shop() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [mainCategory, setMainCategory] = useState<string | undefined>(params.get("mainCategory") || undefined);
  const [subCategory, setSubCategory] = useState<string | undefined>(params.get("subCategory") || undefined);
  const [brandLine, setBrandLine] = useState<string | undefined>(params.get("brandLine") || undefined);
  const [tag, setTag] = useState<string | undefined>(params.get("tag") || undefined);
  const [sort, setSort] = useState<ListProductsSort>((params.get("sort") as ListProductsSort) || "newest");
  const [search, setSearch] = useState<string | undefined>(params.get("search") || undefined);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: productsData, isLoading } = useListProducts({
    mainCategory,
    subCategory,
    brandLine,
    tag,
    sort,
    search,
    limit: 48,
  });

  const { data: categories } = useListCategories();

  const title = mainCategory ? mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1) + "'s Footwear" : "All Footwear";

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter">{title}</h1>
          <p className="text-muted-foreground mt-2 font-medium">{productsData?.total || 0} Results</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 md:w-auto font-display uppercase tracking-wider">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[380px]">
              <SheetHeader>
                <SheetTitle className="font-display uppercase text-2xl tracking-tight">Filter</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-8">
                <div>
                  <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Category</h3>
                  <div className="space-y-3">
                    {mainCategories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setMainCategory(mainCategory === cat.value ? undefined : cat.value)}
                        className={`flex items-center justify-between w-full text-left py-1 hover:text-accent transition-colors ${mainCategory === cat.value ? "font-bold text-accent" : "text-muted-foreground"}`}
                      >
                        <span>{cat.label}</span>
                        {mainCategory === cat.value && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {categories && categories.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Type</h3>
                    <div className="space-y-3">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          className="flex items-center justify-between w-full text-left py-1 hover:text-accent transition-colors text-muted-foreground"
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs">{cat.productCount}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full font-display uppercase tracking-wider"
                  onClick={() => { setMainCategory(undefined); setSubCategory(undefined); setBrandLine(undefined); setTag(undefined); setSort("newest"); setSearch(undefined); setIsFilterOpen(false); }}
                >
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:w-auto font-display uppercase tracking-wider">
                Sort By <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as ListProductsSort)}>
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>{option.label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(mainCategory || subCategory || brandLine || tag || search) && (
        <div className="flex flex-wrap gap-2 mb-8">
          {mainCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium capitalize">
              {mainCategory}
              <button onClick={() => setMainCategory(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
          {subCategory && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium capitalize">
              {subCategory}
              <button onClick={() => setSubCategory(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
          {brandLine && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium">
              {brandLine}
              <button onClick={() => setBrandLine(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
          {tag && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium capitalize">
              #{tag}
              <button onClick={() => setTag(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium">
              Search: {search}
              <button onClick={() => setSearch(undefined)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-secondary/50 aspect-[4/5] rounded-xl mb-4" />
              <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
              <div className="h-4 bg-secondary/50 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : productsData?.products.length === 0 ? (
        <div className="py-24 text-center">
          <h3 className="font-display font-bold text-3xl uppercase mb-2">No products found</h3>
          <p className="text-muted-foreground mb-6">Try adjusting your filters.</p>
          <Button onClick={() => { setMainCategory(undefined); setSearch(undefined); }} className="font-display uppercase tracking-wider">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
          {productsData?.products.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}>
              <Link href={`/product/${product.slug}`} className="group block">
                   <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-xl border border-border bg-[#171719]">
                   <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-4 transition-transform duration-700 group-hover:scale-105 sm:p-6" />
                  {product.isNew && !product.salePrice && (
                     <div className="absolute left-3 top-3 rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-background">New</div>
                  )}
                  {product.salePrice && (
                     <div className="absolute left-3 top-3 rounded-lg bg-accent px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">Sale</div>
                  )}
                </div>
                <div>
                  {product.brandLine && (
                    <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-1">{product.brandLine}</p>
                  )}
                  <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-accent transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {product.salePrice ? (
                      <>
                        <span className="font-bold text-accent">{formatPrice(product.salePrice)}</span>
                        <span className="text-muted-foreground line-through text-sm">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="font-bold">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
