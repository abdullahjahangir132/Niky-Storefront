import { Link, useLocation } from "wouter";
import { ShoppingBag, User, Menu, X, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useUserAuth } from "@/hooks/use-user-auth";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function StoreNavbar() {
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { isLoggedIn } = useUserAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-background/95 backdrop-blur-md border-border" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
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

        <nav className="hidden md:flex items-center gap-8 font-sans font-medium text-sm tracking-wide uppercase">
          <Link href="/collections/men" className="hover:text-accent transition-colors">Men</Link>
          <Link href="/collections/women" className="hover:text-accent transition-colors">Women</Link>
          <Link href="/collections/kids" className="hover:text-accent transition-colors">Kids</Link>
          <Link href="/shop" className="hover:text-accent transition-colors">All Products</Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/shop" className="text-foreground hover:text-accent transition-colors">
            <Search size={20} />
          </Link>
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border p-4 flex flex-col gap-4 font-display text-xl uppercase font-bold shadow-xl animate-in slide-in-from-top-2">
          <Link href="/collections/men" className="py-2 border-b border-border/50">Men</Link>
          <Link href="/collections/women" className="py-2 border-b border-border/50">Women</Link>
          <Link href="/collections/kids" className="py-2 border-b border-border/50">Kids</Link>
          <Link href="/shop" className="py-2 text-accent">Shop All</Link>
        </div>
      )}
    </header>
  );
}
