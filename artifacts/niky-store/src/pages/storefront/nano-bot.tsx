export default function NanoBot() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">Nano Bot</p>
        <h1 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter">Official Assistant</h1>
        <p className="text-muted-foreground mt-4">Assalam o Alaikum! Main Nano Bot hun — Nano Shoes ka official assistant.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border border-border rounded-2xl p-6">
          <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">Store Info</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><span className="text-foreground font-semibold">Store:</span> Nano Shoes</p>
            <p><span className="text-foreground font-semibold">Tagline:</span> Move Beyond Limits</p>
            <p><span className="text-foreground font-semibold">Website:</span> www.nanoshoes.com</p>
            <p><span className="text-foreground font-semibold">Email:</span> support@nanoshoes.com</p>
            <p><span className="text-foreground font-semibold">Phone:</span> +92-300-1234567</p>
          </div>
        </div>
        <div className="border border-border rounded-2xl p-6">
          <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">How I Help</h2>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            <li>Products, sizes, colors, and prices</li>
            <li>Account, wishlist, checkout, and tracking</li>
            <li>Payments, coupons, returns, and exchanges</li>
            <li>Admin panel guidance for products, orders, and settings</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border border-border rounded-2xl p-6">
        <h2 className="font-display font-bold text-xl uppercase tracking-tight mb-4">Greeting Message</h2>
        <p className="text-muted-foreground">"Assalam o Alaikum! Main Nano Bot hun — Nano Shoes ka official assistant! Main aapki kaise madad kar sakta hun? Shoes dhundne mein, order place karne mein, ya koi aur sawaal? Puchiye! 👟"</p>
      </div>
    </div>
  );
}
