import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, X, Search, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MegaMenuPanel, useNavMenu } from "./mega-menu";
import SearchOverlay from "@/components/storefront/search-overlay";
import { useStoreSettings } from "@/hooks/use-store-settings";

const MEGA_MENU_CATEGORIES = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
] as const;

export default function StoreNavbar() {
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { isLoggedIn } = useUserAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();
  const navMenu = useNavMenu();
  const { data: settings } = useStoreSettings();
  const storeName = settings?.storeName?.trim() || "NANO SHOES";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMenu(null);
  }, [location]);

  const megaMenuOpen = !!openMenu;

  return (
    <>
    <header
      className={cn(
        "relative z-50 w-full border-b border-transparent transition-all duration-300",
        isScrolled || megaMenuOpen
          ? "bg-background/95 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl border-border"
          : "bg-background/15 backdrop-blur-[2px]"
      )}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="container mx-auto flex h-[4.5rem] items-center justify-between px-4 md:h-20 md:px-6 relative">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden -ml-2 flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

           <Link href="/" aria-label={storeName} className="font-display text-[1.35rem] font-black tracking-[-0.08em] text-foreground md:text-3xl">
             {storeName}
          </Link>
        </div>

        <nav className="hidden h-full items-center gap-1 font-sans text-[11px] font-bold uppercase tracking-[0.18em] md:flex lg:gap-3">
          {MEGA_MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              aria-expanded={openMenu === cat.value}
              onMouseEnter={() => setOpenMenu(cat.value)}
              onClick={() => setOpenMenu(openMenu === cat.value ? null : cat.value)}
              className={cn(
                "relative flex h-full items-center gap-1.5 px-3 text-foreground/75 transition-colors hover:text-foreground",
                (openMenu === cat.value || location.startsWith(`/collections/${cat.value}`)) && "text-accent",
                "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:origin-center after:scale-x-0 after:bg-accent after:transition-transform",
                (openMenu === cat.value || location.startsWith(`/collections/${cat.value}`)) && "after:scale-x-100"
              )}
            >
              {cat.label}
              <ChevronDown size={13} strokeWidth={2.5} className={cn("transition-transform duration-200", openMenu === cat.value && "rotate-180")} />
            </button>
          ))}
          <Link
            href="/shop"
            onMouseEnter={() => setOpenMenu(null)}
            className={cn(
              "relative flex h-full items-center px-3 text-foreground/75 transition-colors hover:text-foreground",
              location.startsWith("/shop") && "text-accent after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-accent"
            )}
          >
            All Products
          </Link>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-foreground/80 transition-colors hover:bg-white/5 hover:text-accent"
          >
            <Search size={19} strokeWidth={2} />
          </button>
          <Link href="/account" aria-label="Account" className="flex h-10 w-10 items-center justify-center text-foreground/80 transition-colors hover:bg-white/5 hover:text-accent">
            <User size={19} strokeWidth={2} />
          </Link>
          <button
            aria-label={`Shopping bag${itemCount > 0 ? `, ${itemCount} items` : ""}`}
            className="relative flex h-10 w-10 items-center justify-center text-foreground/80 transition-colors hover:bg-white/5 hover:text-accent"
            onClick={() => setIsCartDrawerOpen(true)}
          >
            <ShoppingBag size={19} strokeWidth={2} />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-black text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mega Menu */}
      {openMenu && (
        <MegaMenuPanel
          category={openMenu as "men" | "women" | "kids"}
          data={navMenu[openMenu]}
          onNavigate={() => setOpenMenu(null)}
        />
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full max-h-[calc(100dvh-7rem)] overflow-y-auto border-b border-border bg-background/98 p-4 font-display text-xl font-bold uppercase shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-2 md:hidden">
          <div className="flex flex-col">
            {MEGA_MENU_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/collections/${cat.value}`}
                className={cn(
                  "flex items-center justify-between border-b border-border/70 py-4 transition-colors hover:text-accent",
                  location.startsWith(`/collections/${cat.value}`) && "text-accent"
                )}
              >
                {cat.label}
                <span className="text-xs font-sans font-bold tracking-widest text-muted-foreground">0{MEGA_MENU_CATEGORIES.indexOf(cat) + 1}</span>
              </Link>
            ))}
            <Link href="/shop" className="py-4 text-accent transition-opacity hover:opacity-75">Shop All</Link>
          </div>
        </div>
      )}
    </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
