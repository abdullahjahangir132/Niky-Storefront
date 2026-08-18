import { AdminSidebar } from "./admin-sidebar";
import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="admin-shell flex min-h-[100dvh]">
      <AdminSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      {mobileNavOpen && (
        <button
          aria-label="Close admin navigation"
          onClick={() => setMobileNavOpen(false)}
          className="fixed inset-0 z-40 bg-[#050506]/70 backdrop-blur-sm md:hidden"
        />
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(true)} aria-label="Open admin navigation" className="text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden items-center gap-2 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Operations Console</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Session Active
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout" aria-label="Logout" className="text-muted-foreground hover:bg-accent/10 hover:text-accent">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
