import { useState } from "react";
import { StoreLayout } from "@/components/layout/store-layout";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Lock, ArrowLeft } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  cardNumber: z.string().min(16, "Invalid card number").max(19),
  expDate: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "MM/YY format required"),
  cvv: z.string().min(3).max(4),
});

export default function Checkout() {
  const { sessionId } = useCartSession();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart(
    { sessionId: sessionId || "" },
    { query: { enabled: !!sessionId } }
  );

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (order) => {
        toast({
          title: "Order Placed!",
          description: "Your order has been successfully placed.",
        });
        if (sessionId) {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
        }
        setLocation(`/order/${order.id}`);
      },
      onError: () => {
        toast({
          title: "Checkout failed",
          description: "There was an error processing your order.",
          variant: "destructive"
        });
      }
    }
  });

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      country: "",
      cardNumber: "",
      expDate: "",
      cvv: "",
    },
  });

  const onSubmit = (values: z.infer<typeof checkoutSchema>) => {
    if (!sessionId) return;
    
    createOrder.mutate({
      data: {
        sessionId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        shippingAddress: values.shippingAddress,
        city: values.city,
        country: values.country,
      }
    });
  };

  if (isLoading) return <StoreLayout><div className="p-20 text-center">Loading...</div></StoreLayout>;

  if (!cart || cart.items.length === 0) {
    return (
      <StoreLayout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-4">Your Bag is Empty</h1>
          <p className="text-muted-foreground mb-8">Add items to your bag to proceed to checkout.</p>
          <Button className="w-full font-display uppercase tracking-wider" onClick={() => setLocation("/shop")}>
            Continue Shopping
          </Button>
        </div>
      </StoreLayout>
    );
  }

  const shipping = 10.00;
  const total = cart.subtotal + shipping;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b flex items-center px-4 md:px-8 bg-white">
        <a href="/cart" className="flex items-center text-sm font-medium hover:text-accent transition-colors" onClick={(e) => { e.preventDefault(); setLocation("/"); }}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to store
        </a>
        <div className="mx-auto font-display font-black text-2xl tracking-tighter">NIKY CHECKOUT</div>
        <div className="w-[100px]" /> {/* Spacer */}
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Form */}
          <div className="lg:w-2/3">
            <h2 className="font-display font-bold text-3xl uppercase mb-8">Shipping & Payment</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Contact */}
                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-wider border-b pb-2">Contact Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerEmail" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerPhone" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl><Input type="tel" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Shipping */}
                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-wider border-b pb-2">Shipping Address</h3>
                  <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <h3 className="font-bold uppercase tracking-wider border-b pb-2 flex items-center gap-2">
                    Payment <Lock className="w-4 h-4 text-muted-foreground" />
                  </h3>
                  <div className="bg-secondary/30 p-4 rounded-xl space-y-4 border border-border">
                    <FormField control={form.control} name="cardNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="expDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exp. Date</FormLabel>
                          <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cvv" render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl><Input placeholder="123" type="password" maxLength={4} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-16 text-xl font-display uppercase tracking-widest rounded-full shadow-xl hover:scale-[1.02] transition-transform"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? "Processing..." : `Pay $${total.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-secondary/30 p-6 rounded-2xl border sticky top-24">
              <h3 className="font-display font-bold text-2xl uppercase mb-6 tracking-tight">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-md overflow-hidden flex-shrink-0 border">
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="font-bold line-clamp-1">{item.productName}</div>
                      <div className="text-muted-foreground">{item.color} | Size {item.size}</div>
                      <div className="flex justify-between mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Shipping</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-semibold">Calculated at next step</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center text-lg">
                  <span className="font-bold uppercase tracking-wider">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}