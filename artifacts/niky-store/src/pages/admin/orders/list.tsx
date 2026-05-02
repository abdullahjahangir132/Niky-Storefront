import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey, ListOrdersStatus, Order } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChevronDown, Filter, Printer, Package, MapPin, CreditCard, Mail, Phone, User } from "lucide-react";

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

function OrderDetailSheet({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = order.discountAmount || 0;
  const shippingTotal = order.total - subtotal + discountAmount;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto sm:border-l-4 sm:border-l-accent p-0">
        <div className="sticky top-0 bg-background z-10 p-6 border-b flex justify-between items-start">
          <SheetHeader className="text-left">
            <div className="flex items-center gap-3">
              <SheetTitle className="font-display text-3xl uppercase tracking-tight">Order #{order.id.toString().padStart(6, '0')}</SheetTitle>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full capitalize border ${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
            <SheetDescription>
              Placed on {new Date(order.createdAt).toLocaleString()}
            </SheetDescription>
          </SheetHeader>
          <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
            <Printer className="w-4 h-4 mr-2" /> Print Invoice
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Customer Information
              </h3>
              <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="font-medium">{order.customerName}</div>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" /> {order.customerEmail}
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" /> {order.customerPhone}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping Address
              </h3>
              <div className="bg-muted/30 p-4 rounded-xl text-sm leading-relaxed">
                <p className="font-medium">{order.customerName}</p>
                <p>{order.address}</p>
                <p>{order.city}, {order.postalCode}</p>
                <p>{order.country}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <h3 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Order Items
            </h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-secondary rounded border flex-shrink-0">
                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-contain p-1" />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{item.productName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size} • Color: {item.color}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">{item.quantity}</td>
                      <td className="px-4 py-4 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <h3 className="font-display uppercase tracking-wider text-sm font-bold text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Summary
            </h3>
            <div className="bg-muted/30 p-6 rounded-xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingTotal > 0 ? `$${shippingTotal.toFixed(2)}` : 'Free'}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t flex justify-between items-center">
                <span className="font-display font-bold uppercase tracking-wider">Total</span>
                <span className="font-bold text-xl text-accent">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<ListOrdersStatus | undefined>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading } = useListOrders({
    status: statusFilter,
    limit: 50
  });

  const updateStatus = useUpdateOrderStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order status updated" });
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        // Update local selected order state if it's the one we're viewing
        if (selectedOrder) {
          queryClient.invalidateQueries(); // Simple hammer to refresh the sheet too
        }
      },
      onError: () => toast({ title: "Error updating status", variant: "destructive" })
    }
  });

  const handleStatusUpdate = (id: number, status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    updateStatus.mutate({ id, data: { status } });
  };

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsSheetOpen(true);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-display font-bold text-4xl uppercase tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and fulfill customer orders</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="font-display uppercase tracking-wider">
              <Filter className="w-4 h-4 mr-2" /> 
              {statusFilter ? statusFilter : "All Statuses"}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>All Statuses</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>Confirmed</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("shipped")}>Shipped</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>Delivered</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading orders...</td>
                </tr>
              ) : ordersData?.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No orders found.</td>
                </tr>
              ) : (
                ordersData?.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => handleRowClick(order)}>
                    <td className="px-6 py-4 font-bold text-accent group-hover:underline">#{order.id.toString().padStart(6, '0')}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.city}, {order.country}</div>
                    </td>
                    <td className="px-6 py-4">{order.items.reduce((acc, item) => acc + item.quantity, 0)} items</td>
                    <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 border text-xs font-bold rounded-full capitalize ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="font-display uppercase text-xs">
                            Update <ChevronDown className="w-3 h-3 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "pending")} disabled={order.status === "pending"}>Mark Pending</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "confirmed")} disabled={order.status === "confirmed"}>Mark Confirmed</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "shipped")} disabled={order.status === "shipped"}>Mark Shipped</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "delivered")} disabled={order.status === "delivered"}>Mark Delivered</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "cancelled")} disabled={order.status === "cancelled"} className="text-destructive">Cancel Order</DropdownMenuItem>
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

      <OrderDetailSheet order={selectedOrder} open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </AdminLayout>
  );
}