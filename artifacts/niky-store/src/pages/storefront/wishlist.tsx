import { useGetWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useCart } from "@/hooks/use-cart";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { isLoggedIn } = useUserAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useGetWishlist({
    query: { enabled: isLoggedIn, retry: false, queryKey: ["getWishlist"] },
  });

  const removeMutation = useRemoveFromWishlist({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        toast({ title: "Removed from wishlist" });
      },
    },
  });

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-4">Your Wishlist</h1>
        <p className="text-muted-foreground mb-8">Sign in to save your favourite products and access them from any device.</p>
        <Link href="/account">
          <Button className="font-display uppercase tracking-wider h-12 px-8">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-8">Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] bg-secondary rounded-xl mb-4" />
              <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
              <div className="h-4 bg-secondary rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = (wishlist as any)?.items || [];

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-4">Your Wishlist is Empty</h1>
        <p className="text-muted-foreground mb-8">Save products you love by clicking the heart icon on any product page.</p>
        <Link href="/shop">
          <Button className="font-display uppercase tracking-wider h-12 px-8">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-2">Saved Items</p>
          <h1 className="font-display font-black text-4xl uppercase tracking-tighter">Wishlist</h1>
          <p className="text-muted-foreground mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item: any) => (
          <div key={item.id} className="group relative border border-border rounded-xl overflow-hidden">
            <Link href={`/product/${item.product?.slug || item.productId}`} className="block">
              <div className="aspect-[4/5] bg-secondary/30 overflow-hidden">
                <img
                  src={item.product?.imageUrl}
                  alt={item.product?.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </Link>

            <div className="p-4">
              {item.product?.brandLine && (
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">{item.product.brandLine}</p>
              )}
              <Link href={`/product/${item.product?.slug || item.productId}`}>
                <h3 className="font-bold leading-tight hover:text-accent transition-colors line-clamp-1">{item.product?.name}</h3>
              </Link>
              <div className="flex items-center gap-2 mt-2 mb-4">
                {item.product?.salePrice ? (
                  <>
                    <span className="font-bold text-accent">{formatPrice(item.product.salePrice)}</span>
                    <span className="text-muted-foreground line-through text-sm">{formatPrice(item.product.price)}</span>
                  </>
                ) : (
                  <span className="font-bold">{formatPrice(item.product?.price || 0)}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 font-display uppercase tracking-wider text-xs h-9"
                  onClick={() => {
                    if (!item.product?.sizes?.length) {
                      toast({ title: "Select size on product page" });
                      return;
                    }
                    addItem(item.product.id, item.product.sizes[0], (item.product.colors?.[0] as any)?.name || "Default", 1);
                  }}
                >
                  <ShoppingBag className="w-3 h-3 mr-1" /> Add to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 w-9 p-0 flex-shrink-0 hover:border-destructive hover:text-destructive"
                  onClick={() => removeMutation.mutate({ productId: item.id })}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
