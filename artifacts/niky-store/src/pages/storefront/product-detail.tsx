import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetProductBySlug, useListProductReviews, useGetWishlist, useAddToWishlist, useRemoveFromWishlist, getGetWishlistQueryKey, getListProductReviewsQueryKey } from "@workspace/api-client-react";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight, Heart, Star, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import { ReviewForm } from "@/components/storefront/review-form";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:slug");
  const slug = params?.slug || "";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const { isLoggedIn } = useUserAuth();

  const { data: product, isLoading } = useGetProductBySlug(slug, {
    query: { enabled: !!slug, queryKey: ["getProductBySlug", slug] },
  });

  const { data: reviewsData } = useListProductReviews(product?.id ?? 0, {
    query: { enabled: !!product?.id, queryKey: ["listProductReviews", product?.id ?? 0] },
  });

  const { data: wishlist } = useGetWishlist({
    query: { retry: false, queryKey: ["getWishlist"] },
  });

  const isInWishlist = wishlist?.items?.some((item: any) => item.id === product?.id);

  const addWishlistMutation = useAddToWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Added to wishlist" });
      },
    },
  });

  const removeWishlistMutation = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Removed from wishlist" });
      },
    },
  });

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColorName, setSelectedColorName] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12 animate-pulse">
          <div className="lg:w-3/5 bg-secondary rounded-2xl aspect-[4/5]" />
          <div className="lg:w-2/5 space-y-6 pt-8">
            <div className="h-8 bg-secondary rounded w-3/4" />
            <div className="h-6 bg-secondary rounded w-1/4" />
            <div className="h-32 bg-secondary rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-black text-4xl uppercase">Product Not Found</h1>
        <Link href="/shop"><Button className="mt-8 font-display uppercase tracking-wider">Back to Shop</Button></Link>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean);
  const currentImage = activeImage || product.imageUrl;
  const colors: { name: string; hex: string }[] = (product.colors as any) || [];
  const selectedColor = colors.find((c) => c.name === selectedColorName) || colors[0];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast({ title: "Select a size", description: "Please select a size before adding to cart.", variant: "destructive" });
      return;
    }
    addItem(product.id, selectedSize, selectedColor?.name || "Default", 1);
  };

  const handleWishlist = () => {
    if (!product) return;
    if (isInWishlist) {
      removeWishlistMutation.mutate({ productId: product.id });
    } else {
      addWishlistMutation.mutate({ productId: product.id });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        {product.mainCategory && (
          <>
            <Link href={`/collections/${product.mainCategory}`} className="hover:text-foreground transition-colors capitalize">{product.mainCategory}</Link>
            <ChevronRight className="w-4 h-4 mx-2" />
          </>
        )}
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Images */}
        <div className="lg:w-3/5 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 flex-shrink-0 pb-2 md:pb-0">
            {allImages.map((img, i) => (
              <button
                key={i}
                className={`w-16 h-20 md:w-20 md:h-24 flex-shrink-0 bg-secondary/30 rounded-lg overflow-hidden border-2 transition-all ${currentImage === img ? "border-foreground" : "border-transparent"}`}
                onMouseEnter={() => setActiveImage(img)}
                onClick={() => setActiveImage(img)}
              >
                <img src={img} alt={`view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-secondary/20 rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center">
            <motion.img
              key={currentImage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="lg:w-2/5 pt-2">
          {product.brandLine && (
            <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-2">{product.brandLine}</p>
          )}
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-3 leading-none">
            {product.name}
          </h1>

          {(product.ratingAverage ?? 0) > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.ratingAverage ?? 0) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.ratingCount ?? 0} reviews)</span>
            </div>
          )}

          <div className="text-2xl font-bold mb-6">
            {product.salePrice ? (
              <div className="flex items-center gap-3">
                <span className="text-accent">{formatPrice(product.salePrice)}</span>
                <span className="text-muted-foreground line-through text-lg">{formatPrice(product.price)}</span>
                <span className="text-xs bg-accent/10 text-accent font-bold px-2 py-1 rounded">
                  Save {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                </span>
              </div>
            ) : (
              <span>{formatPrice(product.price)}</span>
            )}
          </div>

          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wider">
                Color: <span className="font-normal text-muted-foreground normal-case tracking-normal">{selectedColor?.name}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColorName(color.name)}
                    title={color.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColorName === color.name || (!selectedColorName && color === colors[0]) ? "border-foreground scale-110" : "border-border"}`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm uppercase tracking-wider">Select Size</h3>
                <Link href="/size-guide" className="text-xs font-medium text-muted-foreground flex items-center hover:text-foreground transition-colors">
                  <Ruler className="w-3 h-3 mr-1" /> Size Guide
                </Link>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 border rounded-lg font-bold text-sm transition-all ${
                      selectedSize === size
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            <Button
              size="lg"
              className="h-14 rounded-full font-display text-lg uppercase tracking-wider w-full"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={`h-14 rounded-full font-display text-lg uppercase tracking-wider w-full ${isInWishlist ? "border-accent text-accent" : ""}`}
              onClick={handleWishlist}
            >
              <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? "fill-accent" : ""}`} />
              {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            </Button>
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span>Free shipping on orders above <strong>PKR 3,000</strong></span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
              <span>Cash on Delivery available across Pakistan</span>
            </div>
          </div>

          {product.description && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.tags && product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-secondary text-xs font-medium rounded">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t border-border pt-16">
        <div className="max-w-3xl">
          <h2 className="font-display font-black text-3xl uppercase tracking-tight mb-8">
            Reviews {reviewsData && reviewsData.totalReviews > 0 && <span className="text-muted-foreground">({reviewsData.totalReviews})</span>}
          </h2>

          {reviewsData && reviewsData.reviews.length > 0 ? (
            <div className="space-y-6 mb-12">
              {reviewsData.reviews.map((review: any) => (
                <div key={review.id} className="border border-border rounded-xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold">{review.reviewerName}</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("en-PK")}
                    </span>
                  </div>
                  {review.title && <p className="font-semibold mb-1">{review.title}</p>}
                  {review.comment && <p className="text-muted-foreground text-sm">{review.comment}</p>}
                  {review.isVerifiedPurchase && (
                    <span className="mt-3 inline-block text-xs text-green-600 font-medium">Verified Purchase</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mb-8">No reviews yet — be the first to share your experience.</p>
          )}

          <ReviewForm
            productId={product.id}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: getListProductReviewsQueryKey(product.id) });
              toast({ title: "Review submitted", description: "Thank you for your feedback!" });
            }}
          />
        </div>
      </div>
    </div>
  );
}
