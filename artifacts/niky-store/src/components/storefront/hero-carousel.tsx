import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useListHeroSlides } from "@workspace/api-client-react";
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
    <section className="relative -mt-20 flex min-h-[620px] h-[min(100dvh,880px)] w-full items-center justify-center overflow-hidden bg-[#09090a] pt-20">
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
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.78)_0%,rgba(5,5,6,0.28)_52%,rgba(5,5,6,0.52)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090a] via-transparent to-[#09090a]/45" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto max-w-5xl px-5 text-center sm:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id ?? index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
          >
            {slide.subtitle && (
              <p className="mb-4 text-[11px] font-black uppercase tracking-[0.28em] text-accent sm:text-sm">{slide.subtitle}</p>
            )}
            {slide.title && (
                <h1 className="mb-6 whitespace-pre-line font-display text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                {slide.title}
              </h1>
            )}
            {(slide.ctaText || slide.secondaryCtaText) && (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                {slide.ctaText && (
                  <Link
                    href={slide.ctaLink || "/shop"}
                    className="flex h-14 w-full items-center justify-center bg-accent px-9 font-display text-sm font-black uppercase tracking-[0.16em] text-white transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-accent/90 sm:w-auto"
                  >
                    {slide.ctaText}<span className="ml-3 text-lg leading-none">↗</span>
                  </Link>
                )}
                {slide.secondaryCtaText && (
                  <Link
                    href={slide.secondaryCtaLink || "/shop"}
                    className="flex h-14 w-full items-center justify-center border border-white/60 bg-white/[0.04] px-9 font-display text-sm font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm transition-[transform,background-color,border-color,color] hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#09090a] sm:w-auto"
                  >
                    {slide.secondaryCtaText}
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
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:border-white/70 hover:bg-accent sm:left-5 sm:h-11 sm:w-11 lg:left-8"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next slide"
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:border-white/70 hover:bg-accent sm:right-5 sm:h-11 sm:w-11 lg:right-8"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 sm:bottom-9 sm:gap-3">
            {slides.map((s, i) => (
              <button
                key={s.id ?? i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={cn(
                  "h-1 rounded-full bg-white/40 transition-all duration-300",
                  i === index ? "w-10 bg-accent" : "w-5 hover:bg-white/80"
                )}
              />
            ))}
            <button
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              onClick={() => setPlaying((p) => !p)}
              className="ml-1 flex h-8 w-8 items-center justify-center border border-white/20 bg-black/20 text-white transition-colors hover:border-white/60 hover:bg-white/15"
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
