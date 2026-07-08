import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useListHeroSlides } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 6000;

const FALLBACK_SLIDE = {
  id: -1,
  mediaType: "image" as const,
  imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80",
  imageUrl2: "",
  videoUrl: "",
  title: "Move Beyond Limits",
  subtitle: "Pakistan's Premium Footwear",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  secondaryCtaText: "Sale Items",
  secondaryCtaLink: "/shop?onSale=true",
};

interface SlideLike {
  mediaType: string;
  imageUrl: string;
  imageUrl2?: string;
  videoUrl?: string;
}

function SlideMedia({ slide }: { slide: SlideLike }) {
  if (slide.mediaType === "video" && slide.videoUrl) {
    return (
      <video
        src={slide.videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  if (slide.imageUrl2) {
    return (
      <div className="w-full h-full grid grid-cols-2">
        <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" loading="eager" />
        <img src={slide.imageUrl2} alt="" className="w-full h-full object-cover" loading="eager" />
      </div>
    );
  }

  return <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" loading="eager" />;
}

export default function HeroCarousel() {
  const { data } = useListHeroSlides();
  const slides = data && data.length > 0 ? data : [FALLBACK_SLIDE];

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clampIndex = useCallback((i: number) => (i + slides.length) % slides.length, [slides.length]);

  const goTo = useCallback((i: number) => setIndex(clampIndex(i)), [clampIndex]);
  const next = useCallback(() => setIndex((i) => clampIndex(i + 1)), [clampIndex]);
  const prev = useCallback(() => setIndex((i) => clampIndex(i - 1)), [clampIndex]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [slides.length, index]);

  useEffect(() => {
    if (!playing || slides.length <= 1) return;
    timerRef.current = setTimeout(next, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, playing, next, slides.length]);

  const slide = slides[index] ?? FALLBACK_SLIDE;

  return (
    <section className="relative h-screen min-h-[600px] w-full overflow-hidden bg-black flex items-center justify-center -mt-20">
      <AnimatePresence mode="sync">
        <motion.div
          key={slide.id ?? index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 z-0"
        >
          <SlideMedia slide={slide as any} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id ?? index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
          >
            {slide.subtitle && (
              <p className="text-accent font-bold uppercase tracking-[0.3em] text-sm mb-4">{slide.subtitle}</p>
            )}
            {slide.title && (
              <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl text-white uppercase tracking-tighter leading-none mb-6 whitespace-pre-line">
                {slide.title}
              </h1>
            )}
            {(slide.ctaText || slide.secondaryCtaText) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                {slide.ctaText && (
                  <Link href={slide.ctaLink || "/shop"}>
                    <Button size="lg" className="h-14 px-10 rounded-full font-display text-lg uppercase tracking-wider w-full sm:w-auto">
                      {slide.ctaText}
                    </Button>
                  </Link>
                )}
                {slide.secondaryCtaText && (
                  <Link href={slide.secondaryCtaLink || "/shop"}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-10 rounded-full font-display text-lg uppercase tracking-wider text-white border-white hover:bg-white hover:text-black w-full sm:w-auto bg-transparent"
                    >
                      {slide.secondaryCtaText}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={prev}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next slide"
            onClick={next}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {slides.map((s, i) => (
              <button
                key={s.id ?? i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 bg-white/40",
                  i === index ? "w-8 bg-white" : "w-4 hover:bg-white/70"
                )}
              />
            ))}
            <button
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              onClick={() => setPlaying((p) => !p)}
              className="ml-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
