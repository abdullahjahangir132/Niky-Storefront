import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  {
    category: "Orders & Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "Standard delivery across Pakistan takes 3–5 business days. Major cities like Lahore, Karachi, and Islamabad typically receive orders within 2–3 business days.",
      },
      {
        q: "Is Cash on Delivery available?",
        a: "Yes! Cash on Delivery (COD) is available across Pakistan. We also accept Easypaisa and JazzCash mobile payments.",
      },
      {
        q: "Is shipping free?",
        a: "Yes — shipping is free on all orders above PKR 3,000. For orders below PKR 3,000, a flat shipping fee of PKR 200 applies.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order ships, you'll receive a tracking number via email. You can also track your order using your order number and email on our Track Order page.",
      },
      {
        q: "Do you deliver to all cities in Pakistan?",
        a: "We deliver to all major cities and most areas across Pakistan. If you're unsure about your area, feel free to contact us before placing an order.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for unworn, unwashed items in original packaging. Sale items are not eligible for returns.",
      },
      {
        q: "How do I exchange for a different size?",
        a: "Contact us within 7 days of receiving your order with your order number and the size you need. We'll guide you through the exchange process.",
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 5–7 business days after we receive and inspect the returned item. Easypaisa and JazzCash refunds may take an additional 2–3 days.",
      },
    ],
  },
  {
    category: "Products & Sizing",
    items: [
      {
        q: "How do NANO SHOES fit? Should I size up or down?",
        a: "NANO SHOES generally fit true to size. If you're between sizes, we recommend sizing up for running styles and true-to-size for casual styles. Check our Size Guide for detailed measurements.",
      },
      {
        q: "What sizes do you carry?",
        a: "For men and women, we carry EU sizes 36–47. Kids sizes range from 28–35 EU. See our complete size chart on the Size Guide page.",
      },
      {
        q: "Are the colors accurate in photos?",
        a: "We strive to represent colors as accurately as possible, but slight variations may occur due to screen calibration. If you have questions about a specific colorway, contact us.",
      },
      {
        q: "How do I care for my NANO SHOES?",
        a: "Most styles can be spot-cleaned with a damp cloth and mild soap. Avoid machine washing and direct sunlight for extended periods to preserve color and materials.",
      },
    ],
  },
  {
    category: "Account & Payments",
    items: [
      {
        q: "Do I need an account to place an order?",
        a: "No, you can check out as a guest. However, creating an account lets you track orders, save wishlists, and access your order history anytime.",
      },
      {
        q: "Is my payment information secure?",
        a: "We do not store any card information. All payments are processed through secure, encrypted gateways. Cash on Delivery requires no digital payment.",
      },
      {
        q: "Can I use a coupon code?",
        a: "Yes! Enter your coupon code at checkout before placing your order. Only one coupon can be applied per order.",
      },
    ],
  },
];

export default function Faqs() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">Help Center</p>
        <h1 className="font-display font-black text-4xl md:text-5xl uppercase tracking-tighter">Frequently Asked Questions</h1>
        <p className="text-muted-foreground mt-4">
          Can't find an answer? <a href="/contact" className="text-foreground font-bold hover:text-accent transition-colors">Contact us directly.</a>
        </p>
      </div>

      <div className="space-y-10">
        {FAQS.map(({ category, items }) => (
          <div key={category}>
            <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4 text-accent">{category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {items.map(({ q, a }) => (
                <AccordionItem key={q} value={q} className="border border-border rounded-xl px-5">
                  <AccordionTrigger className="font-bold text-left hover:text-accent transition-colors py-4 text-sm">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
