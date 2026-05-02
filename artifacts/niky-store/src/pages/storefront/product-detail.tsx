import { useState } from "react";
import { useRoute } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { useGetProduct, useAddCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Share2, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const { sessionId } = useCartSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");

  const addToCart = useAddCartItem({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Added to Bag",
          description: `${product?.name} has been added to your bag.`,
        });
        if (sessionId) {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        }
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to add item to bag. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  // Effect to set defaults when product loads
  if (product && !activeImage) setActiveImage(product.imageUrl);
  if (product && !selectedColor && product.colors?.length > 0) setSelectedColor(product.colors[0]);

  const handleAddToCart = () => {
    if (!sessionId) return;
    if (!selectedSize) {
      toast({
        title: "Select a size",
        description: "Please select a size before adding to bag.",
        variant: "destructive"
      });
      return;
    }
    
    addToCart.mutate({
      data: {
        sessionId,
        productId,
        size: selectedSize,
        color: selectedColor || "Default",
        quantity: 1
      }
    });
  };

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
            <div className="lg:w-2/3 grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] bg-secondary rounded-xl col-span-2" />
            </div>
            <div className="lg:w-1/3 space-y-6 pt-8">
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-6 bg-secondary rounded w-1/4" />
              <div className="h-32 bg-secondary rounded w-full" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) return <StoreLayout><div>Product not found</div></StoreLayout>;

  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean);

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <a href="/" className="hover:text-foreground transition-colors">Home</a>
          <ChevronRight className="w-4 h-4 mx-2" />
          <a href="/shop" className="hover:text-foreground transition-colors">Shop</a>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Images */}
          <div className="lg:w-3/5 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 flex-shrink-0 hide-scrollbar pb-2 md:pb-0">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`w-20 h-24 flex-shrink-0 bg-[#F6F6F6] rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-black' : 'border-transparent'}`}
                  onMouseEnter={() => setActiveImage(img)}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`${product.name} view ${i+1}`} className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
            <div className="flex-1 bg-[#F6F6F6] rounded-2xl overflow-hidden aspect-[4/5] md:aspect-auto md:min-h-[700px] flex items-center justify-center p-8">
              <motion.img 
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply" 
              />
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-2/5 pt-4">
            <div className="mb-2 text-lg font-semibold text-accent">{product.categoryName}</div>
            <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter mb-4 leading-none">
              {product.name}
            </h1>
            
            <div className="text-2xl font-bold mb-8">
              {product.salePrice ? (
                <div className="flex items-center gap-3">
                  <span className="text-accent">${product.salePrice.toFixed(2)}</span>
                  <span className="text-muted-foreground line-through text-lg">${product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span>${product.price.toFixed(2)}</span>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold mb-3">Color: <span className="font-normal text-muted-foreground">{selectedColor}</span></h3>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColor === color ? 'border-black p-0.5' : 'border-transparent'}`}
                      onClick={() => setSelectedColor(color)}
                      title={color}
                    >
                      <div className="w-full h-full rounded-full border border-border" style={{ backgroundColor: color.toLowerCase().replace(" ", "") }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Select Size</h3>
                <button className="text-sm font-medium text-muted-foreground flex items-center hover:text-foreground transition-colors">
                  <Ruler className="w-4 h-4 mr-1" /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {product.sizes?.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border rounded-md font-medium transition-all ${
                      selectedSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-border hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-12">
              <Button 
                size="lg" 
                className="h-16 rounded-full font-display text-xl uppercase tracking-wider w-full shadow-xl hover:scale-[1.02] transition-transform"
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
              >
                {addToCart.isPending ? "Adding..." : "Add to Bag"}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-16 rounded-full font-display text-xl uppercase tracking-wider w-full hover:border-black"
              >
                Favorite <Heart className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border flex gap-4">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}