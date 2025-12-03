"use client";
import React, { useRef } from "react";
import { Card } from "@/components/ui/apple-cards-carousel";
import { Marquee } from "@/components/ui/marquee";
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
        <Marquee speed={80} pauseOnHover={true}>
          {cards}
        </Marquee>
      </motion.div>
    </section>
  );
}

const data = [
  {
    category: "Intimacy",
    title: "Intimacy Essentials.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764078634/the_weekend_szdgv5.jpg",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Enhance your connection.
          </span>{" "}
          From protection to pleasure, our intimacy kits are curated to ensure safety and satisfaction. 
          Discreetly delivered, so you can focus on the moment without any awkward pharmacy runs.
        </p>
        <div className="relative h-64 w-full mt-10">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764078634/the_weekend_szdgv5.jpg"
            alt="Intimacy Essentials"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    ),
  },
  {
    category: "Essentials",
    title: "Personal Care.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764757548/personal_care_jfoz28.jpg",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Everyday confidence.
          </span>{" "}
          Stay fresh and confident with our premium personal care selection. 
          We stock high-quality essentials that you use daily, delivered right to your door 
          in unbranded packaging.
        </p>
        <div className="relative h-64 w-full mt-10">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764757548/personal_care_jfoz28.jpg"
            alt="Personal Care"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    ),
  },
  {
    category: "Peace of Mind",
    title: "Preparedness Kits.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764078617/prepared_for_anything_l6arrq.jpg",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Ready for anything.
          </span>{" "}
          Accidents happen, but panic doesn't have to. Our preparedness kits include 
          emergency contraception and other urgent care items, so you have them 
          <i>before</i> you need them.
        </p>
        <div className="relative h-64 w-full mt-10">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764078617/prepared_for_anything_l6arrq.jpg"
            alt="Preparedness Kits"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    ),
  },
  {
    category: "Expert Access",
    title: "Real Doctors. Zero Judgement.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/pyschologist_old_lady_cdm0ej.jpg",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Professional advice, privately.
          </span>{" "}
          Skip the waiting room. Consult with licensed medical professionals online 
          for prescriptions and health advice. It's safe, secure, and completely confidential.
        </p>
        <div className="relative h-64 w-full mt-10">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/pyschologist_old_lady_cdm0ej.jpg"
            alt="Doctor Consultation"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    ),
  },
  {
    category: "Feminine Hygiene",
    title: "Period Care.",
    src: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764756036/self_care_green_purple_fy6cyv.png",
    content: (
      <div className="bg-[#F5F5F7] dark:bg-neutral-800 p-8 md:p-14 rounded-3xl mb-4">
        <p className="text-neutral-600 dark:text-neutral-400 text-base md:text-2xl font-sans max-w-3xl mx-auto">
          <span className="font-bold text-neutral-700 dark:text-neutral-200">
            Comfort when you need it.
          </span>{" "}
          We offer a range of feminine hygiene products designed for comfort and reliability. 
          Get your monthly essentials delivered discreetly, so you never have to worry about running out.
        </p>
        <div className="relative h-64 w-full mt-10">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1764756036/self_care_green_purple_fy6cyv.png"
            alt="Period Care"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </div>
    ),
  },
];
