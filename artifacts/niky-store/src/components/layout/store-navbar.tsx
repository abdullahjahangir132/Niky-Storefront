import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, X, Search, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MegaMenuPanel, useNavMenu } from "./mega-menu";
import SearchOverlay from "@/components/storefront/search-overlay";

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled || megaMenuOpen ? "bg-background/95 backdrop-blur-md border-border" : "bg-transparent"
      )}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 -ml-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="font-display font-bold text-2xl md:text-3xl tracking-tighter text-foreground">
            NANO<span className="text-accent">SHOES</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-sm tracking-wide uppercase h-full">
          {MEGA_MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onMouseEnter={() => setOpenMenu(cat.value)}
              onClick={() => setOpenMenu(openMenu === cat.value ? null : cat.value)}
              className={cn(
                "flex items-center gap-1 h-full hover:text-accent transition-colors",
                openMenu === cat.value && "text-accent"
              )}
            >
              {cat.label}
              <ChevronDown size={13} className={cn("transition-transform", openMenu === cat.value && "rotate-180")} />
            </button>
          ))}
          <Link href="/shop" onMouseEnter={() => setOpenMenu(null)} className="hover:text-accent transition-colors">
            All Products
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="text-foreground hover:text-accent transition-colors"
          >
            <Search size={20} />
          </button>
          <Link href="/account" className="text-foreground hover:text-accent transition-colors">
            <User size={20} />
          </Link>
          <button
            className="relative text-foreground hover:text-accent transition-colors"
            onClick={() => setIsCartDrawerOpen(true)}
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
        <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 font-display text-xl uppercase font-bold shadow-xl animate-in slide-in-from-top-2 max-h-[80vh] overflow-y-auto">
          <Link href="/collections/men" className="py-2 border-b border-border/50">Men</Link>
          <Link href="/collections/women" className="py-2 border-b border-border/50">Women</Link>
          <Link href="/collections/kids" className="py-2 border-b border-border/50">Kids</Link>
          <Link href="/shop" className="py-2 text-accent">Shop All</Link>
        </div>
      )}
    </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
