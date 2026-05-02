import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingBag, ShoppingCart, Tags, Users, Ticket, Settings, LogOut } from "lucide-react";

export function AdminSidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products", icon: ShoppingBag },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/coupons", label: "Coupons", icon: Ticket },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:flex flex-col min-h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="font-display font-black text-xl tracking-tighter text-white">
          NANO<span className="text-accent">SHOES</span>
          <span className="text-muted-foreground font-normal tracking-wide text-xs ml-2">ADMIN</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = link.exact ? location === link.href : location.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
          <LogOut className="w-5 h-5" />
          Exit to Store
        </Link>
      </div>
    </aside>
  );
}
