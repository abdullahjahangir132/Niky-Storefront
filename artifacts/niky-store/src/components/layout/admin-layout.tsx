import { AdminSidebar } from "./admin-sidebar";
import { Menu, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Admin Session Active
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
