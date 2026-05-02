import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListCustomers, useGetCustomer, Customer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

function CustomerDetailSheet({ email, open, onOpenChange }: { email: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { data: customerDetail, isLoading } = useGetCustomer(email || "", {
    query: {
      enabled: !!email && open,
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-display text-2xl uppercase tracking-tight">Customer Details</SheetTitle>
          <SheetDescription>
            Full profile and order history
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : customerDetail ? (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 bg-accent text-white">
                <AvatarFallback className="bg-accent text-white text-xl">
                  {customerDetail.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{customerDetail.name}</h3>
                <p className="text-muted-foreground text-sm">{customerDetail.email}</p>
                {customerDetail.phone && <p className="text-muted-foreground text-sm">{customerDetail.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                <p className="text-2xl font-bold font-display">{customerDetail.totalOrders}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-2xl font-bold font-display text-accent">${customerDetail.totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Joined Date</p>
                <p className="font-medium">{new Date(customerDetail.joinedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4 font-display uppercase tracking-wider text-sm text-muted-foreground">Order History</h4>
              {customerDetail.orders && customerDetail.orders.length > 0 ? (
                <div className="space-y-3">
                  {customerDetail.orders.map((order) => (
                    <div key={order.id} className="p-4 border rounded-lg flex justify-between items-center bg-card">
                      <div>
                        <p className="font-bold text-sm">#{order.id.toString().padStart(6, '0')}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center p-4 border rounded-lg bg-muted/10">No orders yet.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">Customer not found.</div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function AdminCustomers() {
  const [search, setSearch] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data, isLoading } = useListCustomers({
    search: search || undefined,
    limit: 50
  });

  const handleViewCustomer = (email: string) => {
    setSelectedEmail(email);
    setIsSheetOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Customers</h1>
            {data?.total !== undefined && (
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-bold">
                {data.total}
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Manage your customer base</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="p-4 border-b flex gap-4 bg-muted/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Orders</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading customers...</td>
                </tr>
              ) : data?.customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No customers found.</td>
                </tr>
              ) : (
                data?.customers.map((customer) => (
                  <tr key={customer.email} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 bg-accent text-white">
                          <AvatarFallback className="bg-accent text-white text-sm font-bold">
                            {customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{customer.phone || '-'}</td>
                    <td className="px-6 py-4 font-medium">{customer.totalOrders}</td>
                    <td className="px-6 py-4 font-bold text-accent">${customer.totalSpent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(customer.joinedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewCustomer(customer.email)} className="font-display uppercase text-xs tracking-wider">
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

      <CustomerDetailSheet 
        email={selectedEmail} 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </AdminLayout>
  );
}