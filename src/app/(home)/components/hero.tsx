'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { variants, transitions } from '@/lib/motion';

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0.6, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={containerRef} className="relative min-h-[95vh] md:min-h-[100vh] flex items-center justify-center overflow-hidden bg-background pt-20 md:pt-32 pb-12 md:pb-20">
      {/* Sparkles Background - Desktop only for performance */}
      <div className="absolute inset-0 z-0 hidden md:block">
        <SparklesCore
          id="hero-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.8}
          particleDensity={80}
          speed={2}
          particleColor="#187f76"
          className="w-full h-full opacity-60"
        />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Typography */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={variants.staggerContainer}
            className="mb-10 md:mb-16 w-full"
          >
            <motion.h1 
              variants={variants.fadeUp}
              className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-[0.95] mb-6"
            >
              Get Sorted <span className="text-primary italic font-light">Discreetly.</span><br />
              Stay Supported <span className="text-foreground/80">Fully.</span>
            </motion.h1>
 
            <motion.p 
              variants={variants.fadeUp}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Get the private, personal products you need, delivered securely and supported by experts. Your journey starts here.
            </motion.p>

            <motion.div variants={variants.fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Button asChild size="lg" className="h-11 md:h-14 px-5 md:px-8 text-sm md:text-lg rounded-full w-full sm:w-auto shadow-xl hover:scale-105 transition-all duration-300">
                <Link href="/#products">
                  Start Your Order
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 md:h-14 px-5 md:px-8 text-sm md:text-lg rounded-full w-full sm:w-auto hover:bg-muted transition-all duration-300">
                <Link href="/#how-it-works" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Learn How It Works
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Visual */}
          <motion.div 
            className="relative w-full max-w-5xl aspect-[4/3] md:aspect-[16/9]"
            style={{ y, opacity, scale }}
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...transitions.easeOut, delay: 0.3 }}
          >
            <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-border/50">
              <Image
                src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759591519/hero_zdxd3p.png"
                alt="Premium DiscreetKit Collection"
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 90vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
