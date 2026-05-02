import { useRoute, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { CheckCircle2, Package, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  confirmed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500",
};

export default function OrderConfirmation() {
  const [, params] = useRoute("/order/:id");
  const orderId = parseInt(params?.id || "0");

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: ["getOrder", orderId] },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="animate-pulse space-y-4 max-w-md mx-auto">
          <div className="h-20 w-20 bg-secondary rounded-full mx-auto" />
          <div className="h-8 bg-secondary rounded w-3/4 mx-auto" />
          <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="font-display font-black text-4xl uppercase">Order Not Found</h1>
        <p className="text-muted-foreground mt-4 mb-8">We couldn't find this order.</p>
        <Link href="/"><Button>Return Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-display font-black text-4xl md:text-6xl uppercase tracking-tighter mb-3">
          Order Confirmed
        </h1>
        <p className="text-xl text-muted-foreground">
          Thank you, {order.customerName.split(" ")[0]}! Your order has been placed.
        </p>
        {order.orderNumber && (
          <p className="mt-2 font-bold text-accent text-lg tracking-widest">#{order.orderNumber}</p>
        )}
        <p className="text-muted-foreground text-sm mt-2">A confirmation email has been sent to {order.customerEmail}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-secondary/20 border border-border p-6 rounded-2xl">
          <h3 className="font-display font-bold text-lg uppercase tracking-wide flex items-center gap-2 mb-4 border-b border-border pb-3">
            <MapPin className="w-4 h-4 text-muted-foreground" /> Shipping To
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-bold text-base">{order.customerName}</p>
            <p>{order.shippingAddress}</p>
            {order.addressLine2 && <p>{order.addressLine2}</p>}
            <p>{order.city}{order.province ? `, ${order.province}` : ""}</p>
            <p>Pakistan</p>
            <p className="mt-3 text-muted-foreground">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
          </div>
        </div>

        <div className="bg-secondary/20 border border-border p-6 rounded-2xl">
          <h3 className="font-display font-bold text-lg uppercase tracking-wide flex items-center gap-2 mb-4 border-b border-border pb-3">
            <Truck className="w-4 h-4 text-muted-foreground" /> Order Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${STATUS_COLORS[order.status] || "bg-muted"}`} />
              <div>
                <p className="font-bold capitalize">{order.status}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Payment: <span className="capitalize font-medium text-foreground">{order.paymentMethod?.replace("cod", "Cash on Delivery")}</span>
            </p>
            {order.trackingNumber && (
              <p className="text-sm">Tracking: <strong>{order.trackingNumber}</strong></p>
            )}
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Estimated delivery: 3-5 business days across Pakistan.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden mb-10">
        <div className="p-5 bg-secondary/20 border-b border-border flex items-center gap-2">
          <Package className="w-4 h-4" />
          <h3 className="font-display font-bold text-lg uppercase tracking-wide">Items Ordered</h3>
        </div>
        <div className="divide-y divide-border">
          {order.items.map((item: any) => (
            <div key={item.id} className="p-5 flex gap-4">
              <div className="w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex justify-between">
                <div>
                  <h4 className="font-bold">{item.productName}</h4>
                  <p className="text-sm text-muted-foreground">{item.color} · Size {item.size}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-secondary/10 border-t border-border space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-accent">
              <span>Discount</span>
              <span>- {formatPrice(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between items-center font-bold text-base pt-3 border-t border-border mt-3">
            <span className="uppercase tracking-wider">Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="text-center flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/track-order">
          <Button variant="outline" size="lg" className="h-12 px-8 font-display uppercase tracking-wider">
            Track Order
          </Button>
        </Link>
        <Link href="/shop">
          <Button size="lg" className="h-12 px-10 font-display uppercase tracking-wider">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
