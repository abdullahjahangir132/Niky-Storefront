import { useState } from "react";
import { useTrackOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const trackMutation = useTrackOrder({
    mutation: {
      onSuccess: () => setSubmitted(true),
    },
  });

  const order = trackMutation.data as any;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) return;
    trackMutation.mutate({ data: { orderNumber, email } });
  };

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">Order Tracking</p>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter">Track Your Order</h1>
        <p className="text-muted-foreground mt-3">Enter your order number and email to check your delivery status.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-secondary/20 border border-border rounded-2xl p-6 mb-8 space-y-4">
        <div>
          <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Order Number</Label>
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. NS-2026-001"
            required
          />
        </div>
        <div>
          <Label className="text-sm font-bold uppercase tracking-wider mb-2 block">Email Address</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email used at checkout"
            required
          />
        </div>
        <Button type="submit" className="w-full font-display uppercase tracking-wider" disabled={trackMutation.isPending}>
          {trackMutation.isPending ? "Tracking..." : "Track Order"}
        </Button>
      </form>

      {trackMutation.isError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center mb-6">
          <XCircle className="w-5 h-5 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive">Order not found. Please check your order number and email.</p>
        </div>
      )}

      {order && (
        <div className="space-y-6">
          <div className="bg-secondary/20 border border-border rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Order Number</p>
                <p className="font-bold text-accent text-lg">{order.orderNumber || `#${order.id}`}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.status === "delivered" ? "bg-green-500/20 text-green-500" :
                order.status === "cancelled" ? "bg-destructive/20 text-destructive" :
                "bg-accent/20 text-accent"
              }`}>
                {order.status}
              </span>
            </div>

            {order.status !== "cancelled" ? (
              <div className="relative mt-6">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-accent transition-all duration-500"
                  style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                          done ? "bg-accent border-accent text-white" : "bg-background border-border text-muted-foreground"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${done ? "text-foreground" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-4 text-destructive">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">This order has been cancelled.</span>
              </div>
            )}
          </div>

          <div className="bg-secondary/20 border border-border rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg uppercase tracking-tight mb-4">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping to</span>
                <span className="font-medium text-right">{order.city}, Pakistan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span className="font-medium capitalize">{order.paymentMethod?.replace("cod", "Cash on Delivery")}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking No.</span>
                  <span className="font-bold">{order.trackingNumber}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-accent">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
