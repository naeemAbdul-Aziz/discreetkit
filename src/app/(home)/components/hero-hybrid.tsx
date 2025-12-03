"use client";
import React, { useRef } from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import Image from "next/image";
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { variants } from '@/lib/motion';

export function HeroHybrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} />
  ));

  return (
    <section ref={containerRef} className="relative w-full flex flex-col overflow-hidden bg-background pt-20 md:pt-32 pb-12 md:pb-20">
      <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center">
        
        {/* 1. TEXT SECTION (From Original Hero) */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-8 md:mb-12">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={variants.staggerContainer}
            className="w-full"
          >
            <motion.h1 
              variants={variants.fadeUp}
              className="font-headline text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.95] mb-8"
            >
              Get Sorted <span className="text-primary italic font-light">Discreetly.</span>
            </motion.h1>
 
            {/* Subtext removed for cleaner, image-first approach */}

            <motion.div variants={variants.fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Button asChild size="lg" className="h-11 md:h-14 px-6 md:px-10 text-base md:text-lg rounded-full w-full sm:w-auto shadow-xl hover:scale-105 transition-all duration-300">
                <Link href="/#products">
                  Order Anonymously
                  <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 2. CAROUSEL SECTION (From Demo) */}
      {/* Moved outside container for full width */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-full"
      >
        <Carousel items={cards} marquee={true} speed={150} />
      </motion.div>
    </section>
  );
}

const DummyContent = () => {
  return (
    <>
      {[...new Array(1)].map((_, index) => {
        return (
          <div
            key={"dummy-content" + index}
            className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4"
          >
            <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
              <span className="font-bold text-neutral-700 dark:text-neutral-200">
                Your health is personal.
              </span>{" "}
              We believe in providing discreet, professional care that fits your lifestyle. 
              Whether it's for daily wellness or specific needs, our kits are curated 
              by experts to ensure you get exactly what you need, when you need it.
            </p>
            <div className="relative h-64 w-full mt-10">
               <Image
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop"
                alt="Medical kit"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-xl"
              />
            </div>
          </div>
        );
      })}
    </>
  );
};

const data = [
  {
    category: "Intimacy",
    title: "Intimacy Essentials.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764078634/the_weekend_szdgv5.jpg",
    content: <DummyContent />,
  },
  {
    category: "Essentials",
    title: "Personal Care.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759413266/lube_ysdpst.png",
    content: <DummyContent />,
  },
  {
    category: "Peace of Mind",
    title: "Preparedness Kits.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764078617/prepared_for_anything_l6arrq.jpg",
    content: <DummyContent />,
  },
  {
    category: "Expert Access",
    title: "Real Doctors. Zero Judgement.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/pyschologist_old_lady_cdm0ej.jpg",
    content: <DummyContent />,
  },
  {
    category: "Feminine Hygiene",
    title: "Period Care.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764756036/self_care_green_purple_fy6cyv.png",
    content: <DummyContent />,
  },
];
