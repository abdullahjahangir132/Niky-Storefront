import StoreNavbar from "./store-navbar";
import StoreFooter from "./store-footer";
import CartDrawer from "../storefront/cart-drawer";
import { NanoBotWidget } from "../storefront/nano-bot-widget";
import AnnouncementBar from "../storefront/announcement-bar";

export function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col selection:bg-accent selection:text-white">
      {/* Sticky header group: announcement bar + navbar */}
      <div className="sticky top-0 z-50 w-full">
        <AnnouncementBar />
        <StoreNavbar />
      </div>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <StoreFooter />
      <CartDrawer />
      <NanoBotWidget />
    </div>
  );
}

export default StoreLayout;
