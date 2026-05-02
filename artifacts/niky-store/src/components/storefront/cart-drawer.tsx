import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { isCartDrawerOpen, setIsCartDrawerOpen, items, itemCount, subtotal, updateQty, removeItem } = useCart();

  return (
    <Sheet open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 border-l-border/10 bg-background text-foreground">
        <div className="p-6 border-b border-border">
          <SheetHeader>
            <SheetTitle className="font-display uppercase text-3xl font-bold tracking-tight flex items-center gap-3">
              <ShoppingBag className="w-6 h-6" /> Your Cart
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6 bg-secondary/10">
          {!items.length ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-bold text-xl uppercase">Your cart is empty</p>
                <p className="text-muted-foreground text-sm font-medium mt-2">Time to move beyond limits.</p>
              </div>
              <Button className="mt-8 font-display uppercase tracking-wider font-bold h-12 px-8" onClick={() => setIsCartDrawerOpen(false)}>
                Shop Now
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group bg-card p-3 rounded-lg border border-border">
                  <div className="w-24 h-24 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0 relative">
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/product/${item.productId}`} className="font-bold hover:text-accent transition-colors line-clamp-2 leading-tight" onClick={() => setIsCartDrawerOpen(false)}>
                          {item.productName}
                        </Link>
                        <span className="font-bold text-accent whitespace-nowrap">{formatPrice(item.salePrice || item.price)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-2">
                        {item.color} | Size {item.size}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-border rounded-md bg-background">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground" onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-muted-foreground hover:text-foreground" onClick={() => updateQty(item.id, item.quantity + 1)}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeItem(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-border bg-card">
            <div className="flex justify-between items-center mb-6">
              <span className="font-display text-xl uppercase font-bold text-muted-foreground">Subtotal</span>
              <span className="font-display font-bold text-2xl">{formatPrice(subtotal)}</span>
            </div>
            <Link href="/cart" onClick={() => setIsCartDrawerOpen(false)}>
              <Button variant="outline" className="w-full h-12 font-display text-lg uppercase tracking-wider font-bold mb-3 border-border hover:bg-secondary">
                View Bag
              </Button>
            </Link>
            <Link href="/checkout" onClick={() => setIsCartDrawerOpen(false)}>
              <Button className="w-full h-14 font-display text-xl uppercase tracking-wider font-bold bg-accent hover:bg-accent/90 text-white">
                Checkout <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
