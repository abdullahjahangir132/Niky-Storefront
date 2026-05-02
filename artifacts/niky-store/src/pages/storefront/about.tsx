export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-black flex items-center">
        <img
          src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1600&q=80"
          alt="About NANO SHOES"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 container mx-auto px-4">
          <p className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4">Our Story</p>
          <h1 className="font-display font-black text-5xl md:text-8xl text-white uppercase tracking-tighter leading-none">
            Built for<br />Pakistan
          </h1>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-4">Our Mission</p>
              <h2 className="font-display font-black text-4xl uppercase tracking-tighter mb-6">Move Beyond Limits</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                NANO SHOES was born on the streets of Lahore with a single conviction: Pakistan deserves world-class footwear, engineered locally, priced fairly, and designed with the relentless energy of our cities.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the bustling lanes of Karachi to the tech parks of Islamabad, every NANO SHOES product is built for the Pakistani pace of life — where hustle never stops and style matters.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"
                alt="NANO SHOES Mission"
                className="w-full aspect-square object-cover rounded-2xl"
              />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-accent rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-secondary/10">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">What We Stand For</p>
            <h2 className="font-display font-black text-4xl uppercase tracking-tighter">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Performance", desc: "Every material, every stitch engineered for maximum energy return and durability." },
              { title: "Authenticity", desc: "Pakistan-first design language. No imitation. Pure expression of local excellence." },
              { title: "Accessibility", desc: "Premium quality shouldn't mean premium barriers. Fair pricing for every city." },
              { title: "Community", desc: "Built by Pakistani athletes, designers, and dreamers — for all of you." },
            ].map(({ title, desc }) => (
              <div key={title} className="border border-border rounded-2xl p-6">
                <div className="w-8 h-1 bg-accent mb-4" />
                <h3 className="font-display font-black text-xl uppercase tracking-tight mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Lines */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-accent font-bold uppercase tracking-[0.2em] text-xs mb-3">Our Collections</p>
            <h2 className="font-display font-black text-4xl uppercase tracking-tighter">Brand Lines</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: "Nano Air", desc: "Lightweight, breathable, built for speed. For the runner who refuses to slow down.", href: "/shop?brandLine=Nano+Air" },
              { name: "Nano Pro", desc: "Professional-grade performance for serious athletes and weekend warriors alike.", href: "/shop?brandLine=Nano+Pro" },
              { name: "Nano Flex", desc: "Adaptive comfort for all-day wear. From morning runs to evening walks.", href: "/shop?brandLine=Nano+Flex" },
              { name: "Nano Classic", desc: "Timeless silhouettes with modern craft. Style that transcends seasons.", href: "/shop?brandLine=Nano+Classic" },
            ].map(({ name, desc, href }) => (
              <a key={name} href={href} className="group border border-border rounded-2xl p-6 hover:border-accent transition-colors">
                <h3 className="font-display font-black text-2xl uppercase tracking-tight mb-2 group-hover:text-accent transition-colors">{name}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-foreground text-background text-center">
        <h2 className="font-display font-black text-5xl uppercase tracking-tighter mb-4">Ready to Move?</h2>
        <p className="text-background/70 mb-8 text-lg">Find your perfect pair. Free delivery on orders above PKR 3,000.</p>
        <a href="/shop" className="inline-block font-display font-black uppercase tracking-wider text-xl bg-accent text-white px-10 py-4 rounded-full hover:bg-accent/90 transition-colors">
          Shop Now
        </a>
      </section>
    </div>
  );
}
