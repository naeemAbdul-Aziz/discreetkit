"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image, { ImageProps } from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
  marquee?: boolean;
  speed?: number;
}

type Card = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
  setPaused?: (paused: boolean) => void;
}>({
  onCardClose: () => {},
  currentIndex: 0,
  setPaused: () => {},
});

export const Carousel = ({ items, initialScroll = 0, marquee = false, speed, autoplay = false, autoplayInterval = 3000 }: CarouselProps & { autoplay?: boolean; autoplayInterval?: number }) => {
  // Determine if we should use the CSS marquee
  const isMarquee = marquee || autoplay;

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      dragFree: true,
      align: "start",
      skipSnaps: false,
      active: !isMarquee, // Disable Embla if marquee mode
    },
    [
      (!isMarquee && (marquee || autoplay)) // This logic is redundant if active=false, but good for safety
          ? AutoScroll({
              playOnInit: true,
              speed: speed ? speed / 100 : 1, 
              stopOnInteraction: false,
              stopOnMouseEnter: true,
              stopOnFocusIn: false, 
            })
          : null
    ].filter(Boolean) as any
  );

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollLeft(emblaApi.canScrollPrev());
      setCanScrollRight(emblaApi.canScrollNext());
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    
    // Initial check
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const scrollLeft = () => {
    emblaApi?.scrollPrev();
  };

  const scrollRight = () => {
    emblaApi?.scrollNext();
  };

  const handleCardClose = (index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  };
  
  // Pause autoplay when a card is open (handled via Context in Card component technically, 
  // but here we provide the mechanism if needed. 
  // Actually, Embla Autoplay has 'stopOnInteraction', and opening a card is an interaction usually.
  // We can also expose a way to stop it explicitly if needed.
  
  // For now, the existing context is enough for `Card` to request close.
  // Ideally, valid modal opening should pause autoplay. 
  // `stopOnInteraction: false` means it resumes. 
  // We might want to PAUSE it explicitly when modal is open.
  
  // For CSS Marquee:
  // We need to ensure the animation pauses when a modal is open or (optional) on hover.
  // The context provides `setPaused` which `Card` calls on open/close.
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calculate duration based on number of items and speed.
  // Default speed ~ 1 corresponds to some px/s. ADJUST as needed. 
  // speed=1 in Embla was fast. Here let's default to say 40s for full scroll?
  // Or calculate based on item count? 
  // Let's use a static duration or prop.
  // Assuming about 5-10s per view? 
  // Let's use fairly slow default: 40s.
  // Ideally we'd measure width but fixed duration is often smoother.
  const duration = items.length * 1; // Faster speed: 1s per item roughly. 

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex, setPaused: setIsPaused }}
    >
      <div className="relative w-full overflow-hidden" ref={emblaRef}>
        {isMarquee ? (
            <div 
                className="flex select-none overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
             <div 
                className={cn(
                    "flex flex-nowrap gap-4 py-10 md:py-20",
                    "animate-marquee" 
                )}
                style={{
                    animationDuration: `${duration}s`,
                    animationPlayState: (isPaused || isHovered) ? "paused" : "running"
                }}
             >
                {/* First Set */}
                {items.map((item, index) => (
                    <div key={`slide-${index}`} className="flex-none pl-4">
                         {item}
                    </div>
                ))}
                 {/* Duplicate Set for Loop */}
                {items.map((item, index) => (
                    <div key={`slide-duplicate-${index}`} className="flex-none pl-4">
                         {item}
                    </div>
                ))}
             </div>
             {/* We need the animation to translate -50% of THIS container? 
                 Actually standard technique: 
                 Wrapper (overflow hidden)
                   Inner (flex) -> moves
                 Inside Inner: [Set 1][Set 2]
                 Move Inner from 0 to -50%.
                 
                 Wait, if Inner contains [Set 1][Set 2], width is 200%.
                 Translate -50% means moving one full Set width.
                 Yes.
              */}
              <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee linear infinite;
                    min-width: 100%; /* Ensure it takes width */
                    width: max-content; /* Allow it to grow */
                }
              `}</style>
            </div>
        ) : (
        <div className={cn(
            "flex touch-pan-y",
            "gap-4 pl-4 md:pl-6 max-w-7xl mx-auto py-10 md:py-20"
        )}>
          {items.map((item, index) => (
            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: 0.2 * index,
                  ease: "easeOut",
                  once: true,
                },
              }}
              key={"card" + index}
              className="rounded-3xl flex-[0_0_auto]"
            >
              {item}
            </motion.div>
          ))}
        </div>
        )}
      </div>
          
      {!isMarquee && (
        <div className="flex justify-end gap-2 mr-10 -mt-8 mb-4 relative z-40">
            <button
            title="Scroll left"
            className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            >
            <IconArrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <button
            title="Scroll right"
            className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
            >
            <IconArrowRight className="h-6 w-6 text-gray-500" />
            </button>
        </div>
      )}
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose, currentIndex, setPaused } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
      if(setPaused) setPaused(true);
    } else {
      document.body.style.overflow = "auto";
      if(setPaused) setPaused(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setPaused]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="bg-black/50 h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="max-w-4xl w-full bg-white dark:bg-neutral-900 h-full md:h-auto md:max-h-[85vh] overflow-y-auto z-[60] p-6 md:p-12 md:rounded-[2rem] font-sans relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col border border-neutral-100 dark:border-neutral-800"
            >
              <button
                title="Close card"
                className="absolute top-6 right-6 bg-neutral-100/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 backdrop-blur-md h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200 z-50 group"
                onClick={handleClose}
              >
                <IconX className="h-5 w-5 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-white transition-colors" />
              </button>
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-sm font-bold text-primary uppercase tracking-wider mb-2"
              >
                {card.category}
              </motion.p>
              <motion.h2
                layoutId={layout ? `title-${card.title}` : undefined}
                className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight"
              >
                {card.title}
              </motion.h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-300">
                {card.content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-56 md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 group"
      >
        <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
        <div className="relative z-40 p-8 w-full">
          <div className="flex justify-between items-start w-full">
            <motion.p
              layoutId={layout ? `category-${card.category}` : undefined}
              className="text-white text-sm md:text-base font-medium font-sans text-left"
            >
              {card.category}
            </motion.p>
            
            {/* Subtle Plus Icon */}
            {/* Subtle Plus Icon Removed */}
            {/* <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <IconPlus className="w-4 h-4 text-white" />
            </div> */}
          </div>
          
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="text-white text-xl md:text-3xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2"
          >
            {card.title}
          </motion.p>
        </div>
        <BlurImage
          src={card.src}
          alt={card.title}
          fill
          className="object-cover absolute z-10 inset-0"
          style={{ objectPosition: 'center 55%' }}
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300",
        isLoading ? "blur-sm" : "blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background of a beautiful view"}
      {...rest}
    />
  );
};
