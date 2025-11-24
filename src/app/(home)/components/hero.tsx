'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MagneticButton } from '@/components/ui/magnetic-button';
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
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background pt-24 md:pt-32">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-soft-light" />
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-secondary/20 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Typography */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={variants.staggerContainer}
            className="mb-12"
          >
            <motion.h1 
              variants={variants.fadeUp}
              className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground leading-[0.95] mb-6"
            >
              Get Sorted <span className="text-primary italic font-light">Discreetly.</span><br />
              Stay Supported <span className="text-foreground/80">Fully.</span>
            </motion.h1>
 
            <motion.p 
              variants={variants.fadeUp}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Get the private, personal products you need, delivered securely and supported by experts. Your journey starts here.
            </motion.p>

            <motion.div variants={variants.fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/#products" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20">
                  Start Your Order <ArrowRight className="ml-2 w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link href="/#how-it-works" className="w-full sm:w-auto">
                <MagneticButton variant="outline" className="w-full sm:w-auto h-14 px-10 text-lg rounded-full border-border hover:bg-muted/50">
                  <Play className="mr-2 w-4 h-4 fill-current" /> Learn How It Works
                </MagneticButton>
              </Link>
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
