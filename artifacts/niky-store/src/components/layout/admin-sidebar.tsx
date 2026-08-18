import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Tags, Users, Ticket, Settings, LogOut, Bot, Palette, GalleryHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const [location] = useLocation();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    { href: "/admin/hero-slides", label: "Hero Slides", icon: GalleryHorizontal },
    { href: "/admin/themes", label: "Themes", icon: Palette },
    { href: "/admin/ai-usage", label: "AI Usage", icon: Bot },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={cn(
      "z-50 flex min-h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex",
      mobileOpen ? "fixed inset-y-0 left-0 shadow-2xl" : "hidden"
    )}>
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link href="/" onClick={onClose} className="font-display text-xl font-black tracking-[-0.08em] text-white">
          NANO<span className="text-accent">SHOES</span>
          <span className="ml-2 text-[9px] font-normal tracking-[0.2em] text-muted-foreground">ADMIN</span>
        </Link>
        {mobileOpen && (
          <button onClick={onClose} aria-label="Close admin navigation" className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-white md:hidden">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
        {links.map((link) => {
          const isActive = link.exact ? location === link.href : location.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
               className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white shadow-[0_8px_20px_hsl(var(--accent)/0.18)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className={cn("h-[18px] w-[18px] transition-transform group-hover:scale-105", isActive ? "text-white" : "text-muted-foreground")} />
              {link.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
         <Link href="/" onClick={onClose} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut className="h-[18px] w-[18px]" />
          Exit to Store
        </Link>
      </div>
    </aside>
  );
}
