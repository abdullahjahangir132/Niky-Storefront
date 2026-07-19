import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import HeroCarousel from "@/components/storefront/hero-carousel";
import TagScrollBar from "@/components/storefront/tag-scroll-bar";

export default function Home() {
  const { data: featuredProducts } = useListProducts({ featured: true, limit: 4 });
  const { data: newArrivals } = useListProducts({ isNew: true, limit: 4 });
  const { data: saleProducts } = useListProducts({ onSale: true, limit: 4 });

  return (
    <>
      {/* Hero Section */}
      <HeroCarousel />

      {/* Tag Scroll Bar */}
      <TagScrollBar />

      {/* Featured */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-2">Handpicked</p>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">Featured</h2>
            </div>
            <Link href="/shop?featured=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="py-12 px-4">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Men", href: "/collections/men", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
            { label: "Women", href: "/collections/women", img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80" },
            { label: "Kids", href: "/collections/kids", img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80" },
          ].map(({ label, href, img }) => (
            <Link key={label} href={href} className="group relative h-72 md:h-96 rounded-2xl overflow-hidden block">
              <img src={img} alt={label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 flex items-end p-8">
                <div>
                  <h3 className="font-display font-black text-4xl text-white uppercase tracking-tighter">{label}</h3>
                  <p className="text-white/70 text-sm mt-1 font-medium flex items-center gap-1">
                    Shop Collection <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 px-4 bg-secondary/5">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-2">Just Dropped</p>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">New Arrivals</h2>
            </div>
            <Link href="/shop?isNew=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
              See All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals?.products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      {(saleProducts?.products.length ?? 0) > 0 && (
        <section className="py-16 px-4 bg-accent/5 border-y border-accent/20">
          <div className="container mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-2">Limited Time</p>
                <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tight">On Sale</h2>
              </div>
              <Link href="/shop?onSale=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
                Shop Sale <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleProducts?.products.map((product, i) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Story</p>
          <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter mb-6">Built for<br />Pakistan</h2>
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
      <div className="relative aspect-[4/5] bg-secondary/30 rounded-xl overflow-hidden mb-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.isNew && !product.salePrice && (
          <div className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-black px-2.5 py-1 uppercase tracking-widest">
            New
          </div>
        )}
        {product.salePrice && (
          <div className="absolute top-3 left-3 bg-accent text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-widest">
            Sale
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="text-white text-center font-display uppercase tracking-wider font-bold text-sm">
            View Details
          </div>
        </div>
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
  );
}
