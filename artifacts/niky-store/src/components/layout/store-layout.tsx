import StoreNavbar from "./store-navbar";
import StoreFooter from "./store-footer";
import CartDrawer from "../storefront/cart-drawer";
import { NanoBotWidget } from "../storefront/nano-bot-widget";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-accent selection:text-white">
      <StoreNavbar />
      <main className="flex-1 flex flex-col pt-20">
        {children}
      </main>
      <StoreFooter />
      <CartDrawer />
      <NanoBotWidget />
    </div>
  );
}

export default StoreLayout;
