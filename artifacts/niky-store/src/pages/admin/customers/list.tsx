import { useState } from "react";
import { useListCustomers, useGetCustomer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/utils";

function CustomerDetailSheet({ email, open, onOpenChange }: { email: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: customer, isLoading } = useGetCustomer(email || "", {
    query: { enabled: !!email && open, queryKey: ["getCustomer", email] },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-2xl uppercase tracking-tight">Customer</SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-16 bg-secondary rounded-xl" />
            <div className="h-24 bg-secondary rounded-xl" />
          </div>
        ) : customer ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-accent text-white font-bold text-lg">
                  {customer.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{customer.name}</h3>
                <p className="text-muted-foreground text-sm">{customer.email}</p>
                {customer.phone && <p className="text-muted-foreground text-sm">{customer.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-secondary/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Orders</p>
                <p className="text-2xl font-bold font-display">{customer.totalOrders}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Spent</p>
                <p className="text-lg font-bold font-display text-accent">{formatPrice(customer.totalSpent)}</p>
              </div>
              <div className="p-4 bg-secondary/30 rounded-xl col-span-2">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Member Since</p>
                <p className="font-medium text-sm">{new Date(customer.joinedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-3 font-display uppercase tracking-wider text-xs text-muted-foreground">Order History</h4>
              {customer.orders && customer.orders.length > 0 ? (
                <div className="space-y-2">
                  {customer.orders.map((order: any) => (
                    <div key={order.id} className="p-3 border border-border rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm">{(order as any).orderNumber || `#${order.id.toString().padStart(6, "0")}`}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-PK")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                        <span className={`text-[10px] font-bold capitalize ${
                          order.status === "delivered" ? "text-green-600" :
                          order.status === "cancelled" ? "text-destructive" :
                          "text-muted-foreground"
                        }`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center p-6 border border-border rounded-xl">No orders yet.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center p-8 text-muted-foreground">Customer not found.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isLoading } = useListCustomers({ search: search || undefined, limit: 50 });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? "—"} registered customers</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Phone</th>
                <th className="px-5 py-4 font-medium">Orders</th>
                <th className="px-5 py-4 font-medium">Total Spent</th>
                <th className="px-5 py-4 font-medium">Joined</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-secondary rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No customers found.</td>
                </tr>
              ) : (
                data?.customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent/20 text-accent font-bold text-xs">
                            {customer.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{customer.phone || "—"}</td>
                    <td className="px-5 py-4 font-medium">{customer.totalOrders}</td>
                    <td className="px-5 py-4 font-bold text-accent">{formatPrice(customer.totalSpent)}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(customer.joinedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedEmail(customer.email); setIsSheetOpen(true); }}
                        className="font-display uppercase text-xs tracking-wider"
                      >
                        <Eye className="w-3 h-3 mr-2" /> View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDetailSheet email={selectedEmail} open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
