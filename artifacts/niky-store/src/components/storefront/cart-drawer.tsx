import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, getGetCartQueryKey } from "@workspace/api-client-react";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { sessionId } = useCartSession();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart(
    { sessionId: sessionId || "" },
    { query: { enabled: !!sessionId } }
  );

  const updateItem = useUpdateCartItem({
    mutation: {
      onSuccess: () => {
        if (sessionId) {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        }
      }
    }
  });

  const removeItem = useRemoveCartItem({
    mutation: {
      onSuccess: () => {
        if (sessionId) {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        }
      }
    }
  });

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateItem.mutate({ id: itemId, data: { quantity: newQuantity } });
  };

  const handleRemove = (itemId: number) => {
    removeItem.mutate({ id: itemId });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-border/10">
        <div className="p-6 border-b border-border/40">
          <SheetHeader>
            <SheetTitle className="font-display uppercase text-2xl tracking-tight">Your Bag</SheetTitle>
            <SheetDescription>
              {cart?.itemCount || 0} items
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {!cart?.items?.length ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-bold text-lg">Your bag is empty</p>
                <p className="text-muted-foreground text-sm">Looks like you haven't added anything yet.</p>
              </div>
              <Button className="mt-4 font-display uppercase tracking-wider" onClick={() => onOpenChange(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-24 h-24 bg-secondary rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link href={`/product/${item.productId}`} className="font-bold hover:underline line-clamp-2" onClick={() => onOpenChange(false)}>
                          {item.productName}
                        </Link>
                        <span className="font-semibold ml-4">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.color} / Size {item.size}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border/60 rounded-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || updateItem.isPending}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} disabled={updateItem.isPending}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(item.id)} disabled={removeItem.isPending}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <div className="p-6 border-t border-border/40 bg-card">
            <div className="flex justify-between items-center mb-6">
              <span className="font-semibold text-lg">Subtotal</span>
              <span className="font-bold text-xl">${cart.subtotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={() => onOpenChange(false)}>
              <Button className="w-full h-14 font-display text-xl uppercase tracking-wider">
                Checkout <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}