import { forwardRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const StoreNavbar = forwardRef<HTMLElement, { onOpenCart: () => void }>(
  ({ onOpenCart }, ref) => {
    const { sessionId } = useCartSession();
    const { data: cart } = useGetCart(
      { sessionId: sessionId || "" },
      { query: { enabled: !!sessionId } }
    );

    const itemCount = cart?.itemCount || 0;

    return (
      <header
        ref={ref}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="font-display font-black text-2xl tracking-tighter hover:text-accent transition-colors">
              NIKY
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/shop" className="text-sm font-semibold tracking-wide uppercase hover:text-accent transition-colors">Shop</Link>
              <Link href="/shop?category=new-arrivals" className="text-sm font-semibold tracking-wide uppercase hover:text-accent transition-colors">New Arrivals</Link>
              <Link href="/shop?category=sale" className="text-sm font-semibold tracking-wide uppercase text-accent hover:text-accent/80 transition-colors">Sale</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={onOpenCart}>
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>
    );
  }
);

StoreNavbar.displayName = "StoreNavbar";