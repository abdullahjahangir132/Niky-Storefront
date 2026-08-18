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
  pending: "bg-amber-400/10 text-amber-300 border-amber-400/25",
  confirmed: "bg-sky-400/10 text-sky-300 border-sky-400/25",
  shipped: "bg-violet-400/10 text-violet-300 border-violet-400/25",
  delivered: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
  cancelled: "bg-red-400/10 text-red-300 border-red-400/25",
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
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-card/95 p-5 backdrop-blur-xl md:p-6">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-2xl uppercase tracking-tight">
              {(order as any).orderNumber || `#${order.id.toString().padStart(6, "0")}`}
            </SheetTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className={`border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[order.status] || "border-border bg-secondary text-muted-foreground"}`}>
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

        <div className="space-y-7 p-5 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
                <User className="w-3 h-3" /> Customer
              </h3>
              <div className="space-y-1 border border-border/70 bg-secondary/20 p-4 text-sm">
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
              <div className="space-y-0.5 border border-border/70 bg-secondary/20 p-4 text-sm">
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
            <div className="overflow-hidden border border-border">
              {order.items.map((item: any, i: number) => (
                <div key={i} className={`flex gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}>
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden border border-border bg-secondary p-1">
                    <img src={item.productImageUrl || item.productImage} alt={item.productName} className="h-full w-full object-contain" />
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
            <div className="space-y-2 border border-border/70 bg-secondary/20 p-4 text-sm">
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
              <div className="flex justify-between border-t border-border pt-3 font-bold">
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number (optional)"
                className="text-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-shrink-0 font-display text-xs uppercase tracking-wide">
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
      <div className="mb-7 flex flex-col items-start justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-center">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-accent">NANO / 02</p>
          <h1 className="font-display text-4xl font-black uppercase tracking-[-0.06em]">Orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage and fulfill customer orders</p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-border bg-card pl-9 sm:w-52"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border bg-card font-display text-xs uppercase tracking-wider">
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

      <div className="overflow-hidden border border-border bg-card/75 shadow-[0_16px_50px_rgba(0,0,0,0.12)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-4 py-4 font-bold md:px-5">Order</th>
                <th className="px-4 py-4 font-bold md:px-5">Date</th>
                <th className="px-4 py-4 font-bold md:px-5">Customer</th>
                <th className="px-4 py-4 font-bold md:px-5">Total</th>
                <th className="px-4 py-4 font-bold md:px-5">Status</th>
                <th className="px-4 py-4 text-right font-bold md:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-4 md:px-5"><div className="h-4 bg-secondary/80" /></td>
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
                    className="cursor-pointer transition-colors hover:bg-white/[0.035]"
                    onClick={() => { setSelectedOrder(order); setIsSheetOpen(true); }}
                  >
                    <td className="px-4 py-5 font-bold text-accent md:px-5">
                      {order.orderNumber || `#${order.id.toString().padStart(6, "0")}`}
                    </td>
                    <td className="px-4 py-5 text-muted-foreground md:px-5">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-5 md:px-5">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.city}</div>
                    </td>
                    <td className="px-4 py-5 font-bold md:px-5">{formatPrice(order.total)}</td>
                    <td className="px-4 py-5 md:px-5">
                      <span className={`inline-flex border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_COLORS[order.status] || "border-border bg-secondary text-muted-foreground"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right md:px-5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="border-border font-display text-xs uppercase tracking-wide">
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
