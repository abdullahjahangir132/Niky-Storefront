import { useState } from "react";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronDown, Search, MapPin, CreditCard, Mail, Phone, User, Package, Printer } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function OrderDetailSheet({ order, open, onOpenChange, onStatusUpdate }: {
  order: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onStatusUpdate: (id: number, status: string) => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState("");

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto p-0">
        <div className="sticky top-0 bg-card z-10 p-6 border-b flex justify-between items-start">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-2xl uppercase tracking-tight">
              {(order as any).orderNumber || `#${order.id.toString().padStart(6, "0")}`}
            </SheetTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize border ${STATUS_COLORS[order.status]}`}>
                {order.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </SheetHeader>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                <User className="w-3 h-3" /> Customer
              </h3>
              <div className="bg-secondary/20 p-4 rounded-xl text-sm space-y-1">
                <p className="font-bold">{order.customerName}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3 h-3" /> {order.customerEmail}</p>
                {order.customerPhone && (
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3" /> {order.customerPhone}</p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3" /> Shipping
              </h3>
              <div className="bg-secondary/20 p-4 rounded-xl text-sm space-y-0.5">
                <p className="font-medium">{order.shippingAddress}</p>
                {order.addressLine2 && <p className="text-muted-foreground">{order.addressLine2}</p>}
                <p className="text-muted-foreground">{order.city}{order.province ? `, ${order.province}` : ""}</p>
                <p className="text-muted-foreground">Pakistan</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
              <Package className="w-3 h-3" /> Items
            </h3>
            <div className="border border-border rounded-xl overflow-hidden">
              {order.items.map((item: any, i: number) => (
                <div key={i} className={`flex gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}>
                  <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.productImageUrl || item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm line-clamp-1">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
              <CreditCard className="w-3 h-3" /> Payment
            </h3>
            <div className="bg-secondary/20 rounded-xl p-4 text-sm space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-accent">{formatPrice(order.total)}</span>
              </div>
              <div className="text-xs text-muted-foreground pt-1">
                Method: <span className="capitalize font-medium text-foreground">{order.paymentMethod?.replace("cod", "Cash on Delivery")}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Update Status</h3>
            <div className="flex gap-2">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number (optional)"
                className="text-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="font-display uppercase text-xs flex-shrink-0">
                    Status <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => onStatusUpdate(order.id, s)}
                      disabled={order.status === s}
                      className={s === "cancelled" ? "text-destructive" : ""}
                    >
                      Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useListOrders({
    status: statusFilter,
    search: search || undefined,
    limit: 50,
  } as any);

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order status updated" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      },
      onError: () => toast({ title: "Error updating status", variant: "destructive" }),
    },
  });

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatus.mutate({ id, data: { status: status as any } });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and fulfill customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="font-display uppercase tracking-wider text-xs">
                {statusFilter ?? "All Statuses"} <ChevronDown className="w-3 h-3 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>All Statuses</DropdownMenuItem>
              {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)} className="capitalize">
                  {s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Order</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Total</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium text-right">Actions</th>
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
              ) : ordersData?.orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">No orders found</td>
                </tr>
              ) : (
                ordersData?.orders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-secondary/20 transition-colors cursor-pointer"
                    onClick={() => { setSelectedOrder(order); setIsSheetOpen(true); }}
                  >
                    <td className="px-5 py-4 font-bold text-accent">
                      {order.orderNumber || `#${order.id.toString().padStart(6, "0")}`}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.city}</div>
                    </td>
                    <td className="px-5 py-4 font-bold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 border text-xs font-bold rounded-full capitalize ${STATUS_COLORS[order.status] || ""}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="font-display uppercase text-xs">
                            Update <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {["pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onClick={() => handleStatusUpdate(order.id, s)}
                              disabled={order.status === s}
                              className={s === "cancelled" ? "text-destructive" : "capitalize"}
                            >
                              Mark {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
