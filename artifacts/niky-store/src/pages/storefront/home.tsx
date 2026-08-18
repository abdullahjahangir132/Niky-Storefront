import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import HeroCarousel from "@/components/storefront/hero-carousel";
import TagScrollBar from "@/components/storefront/tag-scroll-bar";

export default function Home() {
  const { data: featuredProducts, isLoading: featuredLoading } = useListProducts({ featured: true, limit: 4 });
  const { data: newArrivals, isLoading: newArrivalsLoading } = useListProducts({ isNew: true, limit: 4 });
  const { data: saleProducts, isLoading: saleLoading } = useListProducts({ onSale: true, limit: 4 });

  return (
    <>
      {/* Hero Section */}
      <HeroCarousel />

      {/* Tag Scroll Bar */}
      <TagScrollBar />

      {/* Featured */}
      <section className="bg-background px-4 py-24 md:py-28">
        <div className="container mx-auto">
          <div className="mb-10 flex items-end justify-between border-b border-border pb-5 md:mb-12">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Handpicked / 01</p>
              <h2 className="font-display text-4xl font-black uppercase tracking-[-0.05em] md:text-5xl">Featured</h2>
            </div>
            <Link href="/shop?featured=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {featuredLoading ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />) : featuredProducts?.products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="px-4 py-12 md:py-16">
        <div className="container mx-auto grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {[
            { label: "Men", href: "/collections/men", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
            { label: "Women", href: "/collections/women", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80" },
            { label: "Kids", href: "/collections/kids", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80" },
          ].map(({ label, href, img }) => (
            <Link key={label} href={href} className="group relative block h-72 overflow-hidden border border-border bg-secondary/20 md:h-96">
              <img src={img} alt={label} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090a]/90 via-[#09090a]/20 to-transparent transition-opacity duration-500 group-hover:from-[#09090a]/75" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
                <div>
                  <h3 className="font-display text-4xl font-black uppercase tracking-[-0.06em] text-white">{label}</h3>
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold uppercase tracking-[0.12em] text-white/70 transition-colors group-hover:text-white">
                    Shop Collection <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
                <span className="flex h-9 w-9 translate-y-2 items-center justify-center border border-white/30 text-white opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-secondary/[0.06] px-4 py-24 md:py-28">
        <div className="container mx-auto">
          <div className="mb-10 flex items-end justify-between border-b border-border pb-5 md:mb-12">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Just Dropped / 02</p>
              <h2 className="font-display text-4xl font-black uppercase tracking-[-0.05em] md:text-5xl">New Arrivals</h2>
            </div>
            <Link href="/shop?isNew=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
              See All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {newArrivalsLoading ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />) : newArrivals?.products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      {(saleProducts?.products.length ?? 0) > 0 && (
        <section className="border-y border-accent/20 bg-accent/[0.06] px-4 py-16 md:py-20">
          <div className="container mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">Limited Time / 03</p>
                <h2 className="font-display text-4xl font-black uppercase tracking-[-0.05em] md:text-5xl">On Sale</h2>
              </div>
              <Link href="/shop?onSale=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
                Shop Sale <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {saleLoading ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />) : saleProducts?.products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="hairline-grid px-4 py-24 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Story</p>
           <h2 className="mb-6 font-display text-4xl font-black uppercase tracking-[-0.07em] md:text-6xl">Built for<br />Pakistan</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            From the streets of Lahore to the runways of Karachi — NANO SHOES engineers footwear that performs as hard as Pakistan hustles. Every pair is designed for the relentless.
          </p>
          <Link href="/about">
            <Button variant="outline" className="h-12 px-8 rounded-full font-display uppercase tracking-wider">
              Our Story <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative mb-4 aspect-[4/5] overflow-hidden border border-border bg-[#171719]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-4 mix-blend-normal transition-transform duration-500 ease-out group-hover:scale-105 sm:p-6"
        />
        {product.isNew && !product.salePrice && (
          <div className="absolute left-3 top-3 border border-foreground/20 bg-foreground px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-background">
            New
          </div>
        )}
        {product.salePrice && (
          <div className="absolute left-3 top-3 bg-accent px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white">
            Sale
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-[#09090a]/85 to-transparent px-4 pb-4 pt-10 text-center font-display text-xs font-black uppercase tracking-[0.16em] text-white opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View Details <span className="ml-1 text-accent">↗</span>
        </div>
      </div>
      <div>
        {product.brandLine && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{product.brandLine}</p>
        )}
        <h3 className="line-clamp-1 text-sm font-bold leading-tight transition-colors group-hover:text-accent sm:text-base">{product.name}</h3>
        <div className="mt-2 flex min-h-6 items-center gap-2">
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
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 aspect-[4/5] border border-border bg-secondary/60" />
      <div className="mb-2 h-2.5 w-1/3 bg-secondary/70" />
      <div className="h-4 w-4/5 bg-secondary/70" />
      <div className="mt-3 h-4 w-1/4 bg-secondary/70" />
    </div>
  );
}
