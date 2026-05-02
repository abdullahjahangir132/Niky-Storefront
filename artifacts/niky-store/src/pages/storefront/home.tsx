import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { StoreLayout } from "@/components/layout/store-layout";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-banner.png";
import secondaryImage from "@/assets/banner-secondary.png";

export default function Home() {
  const { data: featuredProducts } = useListProducts({ featured: true, limit: 4 });
  const { data: newArrivals } = useListProducts({ isNew: true, limit: 8 });

  return (
    <StoreLayout>
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-4rem)] min-h-[600px] w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Hero background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black text-6xl md:text-8xl lg:text-9xl text-white uppercase tracking-tighter leading-none mb-6"
          >
            Defy <br/><span className="text-accent">Gravity</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-300 text-lg md:text-xl font-medium max-w-xl mx-auto mb-10"
          >
            The next generation of high-performance footwear is here. Engineered for maximum energy return.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/shop">
              <Button size="lg" className="h-14 px-8 rounded-full font-display text-xl uppercase tracking-wider w-full sm:w-auto">
                Shop Collection
              </Button>
            </Link>
            <Link href="/shop?category=new-arrivals">
              <Button size="lg" variant="outline" className="h-14 px-8 rounded-full font-display text-xl uppercase tracking-wider text-white border-white hover:bg-white hover:text-black w-full sm:w-auto bg-transparent">
                New Arrivals
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display font-bold text-4xl md:text-5xl uppercase tracking-tight">Trending Now</h2>
            </div>
            <Link href="/shop?featured=true" className="hidden sm:flex items-center font-bold uppercase tracking-wider text-sm hover:text-accent transition-colors">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Banner */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden group">
            <img 
              src={secondaryImage} 
              alt="Editorial" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent p-12 flex flex-col justify-center">
              <h3 className="font-display font-black text-5xl md:text-7xl text-white uppercase tracking-tighter mb-4 max-w-md">
                Unleash Your Potential
              </h3>
              <p className="text-gray-300 max-w-sm mb-8 text-lg">
                Pro-level performance meets street-ready style.
              </p>
              <Link href="/shop">
                <Button className="self-start h-12 px-8 bg-white text-black hover:bg-gray-200 font-display uppercase tracking-wider text-lg">
                  Explore Series
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </StoreLayout>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-square bg-secondary rounded-xl overflow-hidden mb-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-white text-black text-xs font-bold px-2 py-1 uppercase tracking-wider">
            New
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/60 to-transparent">
          <Button variant="secondary" className="w-full font-display uppercase tracking-wider shadow-lg">
            View Details
          </Button>
        </div>
      </div>
      <div>
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-lg leading-tight line-clamp-2">{product.name}</h3>
          <span className="font-medium whitespace-nowrap">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-muted-foreground text-sm mt-1">{product.categoryName}</p>
      </div>
    </Link>
  );
}