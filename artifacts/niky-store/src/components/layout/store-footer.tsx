import { Link } from "wouter";

export default function StoreFooter() {
  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="font-display font-bold text-3xl tracking-tighter mb-6 block">
              NANO<span className="text-accent">SHOES</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm mb-6">
              Pakistan's premium footwear brand. High-energy street performance meets elevated South Asian aesthetic. Designed for Lahore, Karachi, and Islamabad. Move Beyond Limits.
            </p>
          </div>
          
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-6 text-lg">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link href="/collections/men" className="hover:text-white transition-colors">Men's Footwear</Link></li>
              <li><Link href="/collections/women" className="hover:text-white transition-colors">Women's Footwear</Link></li>
              <li><Link href="/collections/kids" className="hover:text-white transition-colors">Kids Collection</Link></li>
              <li><Link href="/shop?category=new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?category=sale" className="hover:text-accent transition-colors text-accent">Sale Items</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-6 text-lg">Help & Support</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} NANO SHOES Pakistan. All Rights Reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
