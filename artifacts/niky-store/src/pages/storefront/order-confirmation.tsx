import { useRoute, Link } from "wouter";
import { StoreLayout } from "@/components/layout/store-layout";
import { useGetOrder } from "@workspace/api-client-react";
import { CheckCircle2, Package, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const [, params] = useRoute("/order/:id");
  const orderId = parseInt(params?.id || "0");

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  if (isLoading) return <StoreLayout><div className="p-20 text-center">Loading...</div></StoreLayout>;

  if (!order) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-display font-black text-4xl uppercase">Order Not Found</h1>
          <p className="text-muted-foreground mt-4 mb-8">We couldn't find the order you're looking for.</p>
          <Link href="/"><Button>Return Home</Button></Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter mb-4">
            Order Confirmed
          </h1>
          <p className="text-xl text-muted-foreground">
            Thank you for your purchase, {order.customerName.split(" ")[0]}!
          </p>
          <p className="text-muted-foreground mt-2">
            Your order number is <span className="font-bold text-foreground">#{order.id.toString().padStart(6, '0')}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-secondary/30 p-6 rounded-2xl border">
            <h3 className="font-display font-bold text-xl uppercase tracking-wide flex items-center gap-2 mb-4 border-b pb-2">
              <MapPin className="w-5 h-5 text-muted-foreground" /> Shipping Details
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-base">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.city}, {order.country}</p>
              <p className="mt-4 text-muted-foreground">{order.customerEmail}</p>
              {order.customerPhone && <p className="text-muted-foreground">{order.customerPhone}</p>}
            </div>
          </div>

          <div className="bg-secondary/30 p-6 rounded-2xl border">
            <h3 className="font-display font-bold text-xl uppercase tracking-wide flex items-center gap-2 mb-4 border-b pb-2">
              <Truck className="w-5 h-5 text-muted-foreground" /> Order Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${order.status === 'pending' || order.status === 'confirmed' ? 'bg-accent' : 'bg-green-500'}`} />
                <div>
                  <p className="font-bold capitalize">{order.status}</p>
                  <p className="text-xs text-muted-foreground">Updated {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground border-t pt-4">
                We'll email you a tracking link when your order ships. Estimated delivery is 3-5 business days.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-2xl overflow-hidden">
          <div className="p-6 bg-secondary/20 border-b flex items-center gap-2">
            <Package className="w-5 h-5" />
            <h3 className="font-display font-bold text-xl uppercase tracking-wide">Items Ordered</h3>
          </div>
          
          <div className="divide-y">
            {order.items.map(item => (
              <div key={item.id} className="p-6 flex gap-6">
                <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-contain p-2" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-lg">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">{item.color} | Size {item.size}</p>
                    </div>
                    <span className="font-bold">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="text-sm font-medium">
                    Qty: {item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-secondary/10 border-t space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>${order.shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t mt-4">
              <span className="uppercase tracking-wider">Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/shop">
            <Button size="lg" className="h-14 px-12 rounded-full font-display text-xl uppercase tracking-wider">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}