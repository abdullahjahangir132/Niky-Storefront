import { useState } from "react";
import { StoreLayout } from "@/components/layout/store-layout";
import { useListProducts, useListCategories, ListProductsSort } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_desc", label: "Price: High-Low" },
  { value: "price_asc", label: "Price: Low-High" },
  { value: "popular", label: "Best Sellers" },
];

export default function Shop() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  
  const initialCategory = params.get("category") || undefined;
  const initialSort = (params.get("sort") as ListProductsSort) || "newest";
  const initialSearch = params.get("search") || undefined;
  
  const [category, setCategory] = useState<string | undefined>(initialCategory);
  const [sort, setSort] = useState<ListProductsSort>(initialSort);
  const [search, setSearch] = useState<string | undefined>(initialSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: productsData, isLoading } = useListProducts({
    category,
    sort,
    search,
    limit: 50
  });

  const { data: categories } = useListCategories();

  const handleCategoryChange = (slug?: string) => {
    setCategory(category === slug ? undefined : slug);
  };

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter">
              {category ? category.replace("-", " ") : "All Footwear"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {productsData?.total || 0} Results
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1 md:w-auto font-display uppercase tracking-wider">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="font-display uppercase text-2xl tracking-tight">Filter</SheetTitle>
                </SheetHeader>
                <div className="py-6">
                  <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Categories</h3>
                  <div className="space-y-3">
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        className={`flex items-center justify-between w-full text-left py-1 hover:text-accent transition-colors ${
                          category === cat.slug ? "font-bold text-accent" : "text-muted-foreground"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {category === cat.slug && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border/40">
                    <Button 
                      variant="outline" 
                      className="w-full font-display uppercase tracking-wider"
                      onClick={() => {
                        setCategory(undefined);
                        setSort("newest");
                        setSearch(undefined);
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
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
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Applied Filters */}
        {(category || search) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium">
                {category.replace("-", " ")}
                <button onClick={() => setCategory(undefined)} className="ml-2 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-sm font-medium">
                Search: {search}
                <button onClick={() => setSearch(undefined)} className="ml-2 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-secondary/50 aspect-square rounded-xl mb-4" />
                <div className="h-4 bg-secondary/50 rounded w-3/4 mb-2" />
                <div className="h-4 bg-secondary/50 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : productsData?.products.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="font-display font-bold text-3xl uppercase mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search query.</p>
            <Button onClick={() => { setCategory(undefined); setSearch(undefined); }} className="font-display uppercase tracking-wider">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 gap-y-12">
            {productsData?.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] bg-[#F6F6F6] rounded-xl overflow-hidden mb-4 p-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest">
            New
          </div>
        )}
        {product.salePrice && (
          <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1.5 uppercase tracking-widest">
            Sale
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="text-white text-center font-display uppercase tracking-wider font-bold text-lg">
            Quick View
          </div>
        </div>
      </div>
      <div>
        {product.colors && product.colors.length > 0 && (
          <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">
            {product.colors.length} Color{product.colors.length !== 1 ? 's' : ''}
          </div>
        )}
        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-accent transition-colors">{product.name}</h3>
        <p className="text-muted-foreground text-sm mt-1 mb-2">{product.categoryName}</p>
        <div className="flex items-center gap-2 font-medium">
          {product.salePrice ? (
            <>
              <span className="text-accent">${product.salePrice.toFixed(2)}</span>
              <span className="text-muted-foreground line-through text-sm">${product.price.toFixed(2)}</span>
            </>
          ) : (
            <span>${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}