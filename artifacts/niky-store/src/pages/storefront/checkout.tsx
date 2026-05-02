import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder, useValidateCoupon } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@/lib/utils";
import { getGetCartQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, Tag, Truck, Shield } from "lucide-react";

const SHIPPING_THRESHOLD = 3000;
const SHIPPING_FEE = 200;

const PROVINCES = ["Punjab", "Sindh", "KPK", "Balochistan", "Islamabad", "Gilgit-Baltistan", "AJK"];
const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives" },
  { value: "easypaisa", label: "Easypaisa", desc: "Pay via Easypaisa mobile wallet" },
  { value: "jazzcash", label: "JazzCash", desc: "Pay via JazzCash mobile wallet" },
];

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  shippingAddress: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  province: z.string().min(2, "Province is required"),
  postalCode: z.string().optional(),
  paymentMethod: z.enum(["cod", "easypaisa", "jazzcash"]),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items, subtotal, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");

  const shipping = subtotal - discount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal - discount + shipping;

  const validateCoupon = useValidateCoupon({
    mutation: {
      onSuccess: (data: any) => {
        setDiscount(data.discountAmount || 0);
        setCouponApplied(couponCode);
        toast({ title: "Coupon applied!", description: `You saved ${formatPrice(data.discountAmount || 0)}` });
      },
      onError: () => {
        toast({ title: "Invalid coupon", description: "This coupon code is not valid or has expired.", variant: "destructive" });
      },
    },
  });

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (order: any) => {
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        clearCart();
        setLocation(`/order/${order.id}`);
      },
      onError: () => {
        toast({ title: "Order failed", description: "There was an error placing your order. Please try again.", variant: "destructive" });
      },
    },
  });

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      addressLine2: "",
      city: "",
      province: "",
      postalCode: "",
      paymentMethod: "cod",
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    createOrder.mutate({
      data: {
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        shippingAddress: values.shippingAddress,
        addressLine2: values.addressLine2,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode,
        country: "Pakistan",
        paymentMethod: values.paymentMethod,
        couponCode: couponApplied || undefined,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.salePrice || item.price,
        })),
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-md">
        <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">Add items to your cart to proceed to checkout.</p>
        <Link href="/shop">
          <Button className="w-full font-display uppercase tracking-wider">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
      </Link>

      <h1 className="font-display font-black text-4xl uppercase tracking-tighter mb-10">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form */}
        <div className="lg:w-3/5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Contact */}
              <section className="space-y-4">
                <h2 className="font-display font-bold text-xl uppercase tracking-tight border-b border-border pb-3">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="customerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Ahmed Khan" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerEmail" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="ahmed@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="customerPhone" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input type="tel" placeholder="+92 300 1234567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* Shipping */}
              <section className="space-y-4">
                <h2 className="font-display font-bold text-xl uppercase tracking-tight border-b border-border pb-3">Shipping Address</h2>
                <FormField control={form.control} name="shippingAddress" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl><Input placeholder="House No., Street, Area" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="addressLine2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl><Input placeholder="Apartment, floor, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="Lahore" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="province" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROVINCES.map((p) => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="postalCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code (Optional)</FormLabel>
                      <FormControl><Input placeholder="54000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </section>

              {/* Payment */}
              <section className="space-y-4">
                <h2 className="font-display font-bold text-xl uppercase tracking-tight border-b border-border pb-3 flex items-center gap-2">
                  Payment Method <Shield className="w-4 h-4 text-muted-foreground" />
                </h2>
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${field.value === method.value ? "border-foreground bg-secondary/30" : "border-border hover:border-foreground/50"}`}
                        >
                          <input type="radio" {...field} value={method.value} checked={field.value === method.value} className="accent-foreground" />
                          <div>
                            <p className="font-bold text-sm">{method.label}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              </section>

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 font-display text-lg uppercase tracking-wider rounded-full"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
              </Button>
            </form>
          </Form>
        </div>

        {/* Order Summary */}
        <div className="lg:w-2/5">
          <div className="bg-secondary/20 rounded-2xl border border-border p-6 sticky top-24">
            <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-6">Order Summary</h2>

            <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-bold line-clamp-1">{item.productName}</p>
                    <p className="text-muted-foreground">{item.color} · Size {item.size}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-semibold">{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Coupon Code
              </p>
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  disabled={!!couponApplied}
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="font-display uppercase tracking-wider text-xs px-3 flex-shrink-0"
                  disabled={!couponCode || validateCoupon.isPending || !!couponApplied}
                  onClick={() => validateCoupon.mutate({ data: { code: couponCode, orderTotal: subtotal } })}
                >
                  {couponApplied ? "Applied" : "Apply"}
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Shipping
                </span>
                <span>{shipping === 0 ? <span className="text-green-600 font-bold">Free</span> : formatPrice(shipping)}</span>
              </div>
              {subtotal - discount < SHIPPING_THRESHOLD && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(SHIPPING_THRESHOLD - (subtotal - discount))} more for free shipping
                </p>
              )}
              <div className="border-t border-border pt-3 flex justify-between items-center text-base font-bold">
                <span className="uppercase tracking-wider">Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
