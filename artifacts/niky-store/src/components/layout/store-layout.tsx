import { useState } from "react";
import { StoreNavbar } from "./store-navbar";
import { StoreFooter } from "./store-footer";
import { CartDrawer } from "../storefront/cart-drawer";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col selection:bg-accent selection:text-white">
      <StoreNavbar onOpenCart={() => setIsCartOpen(true)} />
      <main className="flex-1 flex flex-col pt-16">
        {children}
      </main>
      <StoreFooter />
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </div>
  );
}