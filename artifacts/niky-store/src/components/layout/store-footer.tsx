import { Link } from "wouter";

export function StoreFooter() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="font-display font-black text-4xl tracking-tighter mb-6 block">
              NIKY
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              High-performance footwear for the relentless. Engineered for speed, designed for impact.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=running" className="hover:text-white transition-colors">Running</Link></li>
              <li><Link href="/shop?category=basketball" className="hover:text-white transition-colors">Basketball</Link></li>
              <li><Link href="/shop?category=lifestyle" className="hover:text-white transition-colors">Lifestyle</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-white transition-colors">Order Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-4">Admin</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/admin" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} NIKY, Inc. All Rights Reserved</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Terms of Sale</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}