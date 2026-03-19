'use client';

import React from 'react';
import { steps } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';


const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-6 md:pt-8 md:pb-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-4xl tracking-tight">
              A Responsible Path to Your Health Answers
            </h2>
          </motion.div>
        </div>

        {/* Mobile Layout: Vertical Timeline (Preserved) */}
        <div className="md:hidden">
          <div className="relative">
            {/* The vertical connecting line */}
            <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="relative flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0 shadow-sm">
                    0{step.number}
                  </div>
                  <div className="flex-1 pt-1 space-y-4">
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                    <div className="relative aspect-[4/3] w-full max-w-sm rounded-2xl overflow-hidden shadow-md border border-border/50">
                      <Image
                        src={step.imageUrl}
                        alt={step.title}
                        fill
                        sizes="(max-width: 768px) 80vw"
                        className="object-cover"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
                      />
                    </div>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                    {step.details && (
                      <ul className="space-y-2">
                        {step.details.map((detail, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.number === 4 && (
                      <div className="pt-2">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                          <Link href="/partner-care">
                            Meet Our Support Partner
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout: Cinematic Checkerboard Grid */}
        <div className="hidden md:grid grid-cols-12 gap-6 relative z-10 w-full max-w-7xl mx-auto">
           {steps.map((step, i) => {
              // Checkerboard Logic: 
              // Row 1: Item 0 (7 cols), Item 1 (5 cols)
              // Row 2: Item 2 (5 cols), Item 3 (7 cols)
              const isWide = i === 0 || i === 3;
              const colSpan = isWide ? "md:col-span-7" : "md:col-span-5";
              
              return (
                <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={cn(
                        "group relative h-[450px] w-full overflow-hidden rounded-3xl border border-white/5",
                        colSpan
                    )}
                >
                    {/* Background Image - Dimmed by default */}
                    <div className="absolute inset-0 bg-black/20 z-10 transition-colors duration-500 group-hover:bg-transparent" />
                    <Image
                        src={step.imageUrl}
                        alt={step.title}
                        fill
                        className="object-cover transition-all duration-700 scale-100 group-hover:scale-110 opacity-70 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(600, 400))}`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20" />

                    {/* Content */}
                    <div className="absolute inset-0 z-30 flex flex-col justify-end p-8 md:p-10">
                        <div className="transform transition-transform duration-500">
                             <div className="flex items-center gap-4 mb-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white font-bold backdrop-blur-md">
                                    0{step.number}
                                </span>
                                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight drop-shadow-md">
                                    {step.title}
                                </h3>
                             </div>
                             
                             <p className="text-white/80 max-w-md text-lg leading-relaxed mb-4">
                                {step.description}
                             </p>

                             {step.number === 4 && (
                                <div className="mt-2">
                                    <Button asChild className="rounded-full bg-white text-black hover:bg-white/90">
                                        <Link href="/partner-care">
                                            Meet Our Partner <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                             )}
                        </div>
                    </div>
                </motion.div>
              );
           })}
        </div>

      </div>
    </section>
  );
}