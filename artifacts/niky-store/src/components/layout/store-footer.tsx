import { Link } from "wouter";
import { Instagram, Facebook, Phone, MessageCircle, Store, Smartphone, Globe } from "lucide-react";
import { useStoreSettings } from "@/hooks/use-store-settings";

export default function StoreFooter() {
  const { data: settings } = useStoreSettings();

  const s = settings as any;
  const logoUrl = s?.logoUrl || "";
  const storeName = s?.storeName?.trim() || "NANO SHOES";
  const contactPhone = s?.contactPhone || "+92 300 1234567";
  const whatsappNumber = s?.whatsappNumber || "";
  const facebookUrl = s?.facebookUrl || "";
  const instagramUrl = s?.instagramUrl || "";
  const tiktokUrl = s?.tiktokUrl || "";
  const youtubeUrl = s?.youtubeUrl || "";
  const playStoreUrl = s?.playStoreUrl || "";
  const appStoreUrl = s?.appStoreUrl || "";
  const contactEmail = s?.contactEmail || "support@nanoshoes.pk";
  const address = s?.address || "Lahore, Pakistan";

  const hasSocial = facebookUrl || instagramUrl || tiktokUrl || youtubeUrl;
  const hasAppLinks = playStoreUrl || appStoreUrl;
  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`
    : "";

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-white/10">
      <div className="container mx-auto px-4 md:px-6">

        {/* Social bar — prominent strip at top of footer */}
        {hasSocial && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12 pb-10 border-b border-white/10">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 hover:border-pink-500 hover:bg-gradient-to-r hover:from-purple-900/40 hover:to-pink-900/40 transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Instagram size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Follow us on</p>
                  <p className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">Instagram</p>
                </div>
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 hover:border-blue-500 hover:bg-blue-950/40 transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Facebook size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Like us on</p>
                  <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">Facebook</p>
                </div>
              </a>
            )}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 hover:border-green-500 hover:bg-green-950/40 transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Chat on</p>
                  <p className="text-sm font-bold text-white group-hover:text-green-400 transition-colors">WhatsApp</p>
                </div>
              </a>
            )}
            {tiktokUrl && (
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 hover:border-white hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-black border border-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-[10px]">TT</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Watch on</p>
                  <p className="text-sm font-bold text-white group-hover:text-white transition-colors">TikTok</p>
                </div>
              </a>
            )}
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/15 hover:border-red-500 hover:bg-red-950/40 transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Watch on</p>
                  <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">YouTube</p>
                </div>
              </a>
            )}
          </div>
        )}

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-1">
            <Link href="/" className="mb-5 block">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-10 max-w-[160px] object-contain" />
              ) : (
                <span className="font-display font-bold text-2xl tracking-tighter">{storeName}</span>
              )}
            </Link>
            <p className="text-gray-400 text-sm max-w-xs mb-5 leading-relaxed">
              Pakistan's premium footwear brand. Designed for Lahore, Karachi & Islamabad. Move Beyond Limits.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5">
              <a href={`tel:${contactPhone}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <Phone size={12} className="text-gray-400 group-hover:text-accent" />
                </div>
                {contactPhone}
              </a>
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors group">
                  <div className="w-7 h-7 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-green-900/40 transition-colors">
                    <MessageCircle size={12} className="text-gray-400 group-hover:text-green-400" />
                  </div>
                  WhatsApp Chat
                </a>
              )}
            </div>

            {/* App download buttons */}
            {hasAppLinks && (
              <div className="mt-5 space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Download Our App</p>
                {playStoreUrl && (
                  <a
                    href={playStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
                  >
                    <Store size={16} className="text-green-400 flex-shrink-0" />
                    <div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-wider">Get it on</div>
                      <div className="text-xs font-bold text-white">Google Play</div>
                    </div>
                  </a>
                )}
                {appStoreUrl && (
                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition-colors"
                  >
                    <Smartphone size={16} className="text-blue-300 flex-shrink-0" />
                    <div>
                      <div className="text-[8px] text-gray-400 uppercase tracking-wider">Download on the</div>
                      <div className="text-xs font-bold text-white">App Store</div>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-5 text-base">Shop</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><Link href="/collections/men" className="hover:text-white transition-colors">Men's Footwear</Link></li>
              <li><Link href="/collections/women" className="hover:text-white transition-colors">Women's Footwear</Link></li>
              <li><Link href="/collections/kids" className="hover:text-white transition-colors">Kids Collection</Link></li>
              <li><Link href="/shop?isNew=true" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?onSale=true" className="hover:text-accent transition-colors text-accent">Sale Items</Link></li>
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-5 text-base">Help & Support</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              <li><Link href="/track-order" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Brand lines */}
          <div>
            <h4 className="font-display font-bold uppercase tracking-wider mb-5 text-base">Brand Lines</h4>
            <ul className="space-y-3.5 text-sm text-gray-400 font-medium">
              {["Nano Air", "Nano Pro", "Nano Flex", "Nano Classic"].map(b => (
                <li key={b}>
                  <Link href={`/shop?brandLine=${encodeURIComponent(b)}`} className="hover:text-white transition-colors">{b}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-3">Contact</p>
              <p className="text-xs text-gray-500">{contactEmail}</p>
              <p className="text-xs text-gray-500 mt-1">{address}</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-7 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 font-medium gap-4">
          <p>© {new Date().getFullYear()} {storeName} Pakistan. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
