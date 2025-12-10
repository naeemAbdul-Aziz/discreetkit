/**
 * @file how-it-works.tsx
 * @description a visual step-by-step guide explaining the service process.
 *              Mobile: vertical timeline.
 *              Desktop: sticky center image with alternating scrolling text.
 */

'use client';

import { steps } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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
  const [activeStep, setActiveStep] = useState(1);

  return (
    <section id="how-it-works" className="py-12 md:py-24 bg-background relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-32">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            A Responsible Path to Your Health Answers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground md:text-base">
            Get your results in 4 simple, private, and secure steps.
          </p>
        </div>

        {/* Mobile Layout: Vertical Timeline (Unchanged) */}
        <div className="md:hidden">
          <div className="relative">
            {/* The vertical connecting line */}
            <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
            <div className="space-y-16">
              {steps.map((step) => (
                <div key={step.number} className="relative flex items-start gap-4">
                  {/* The step number circle */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0">
                    0{step.number}
                  </div>
                  {/* The content */}
                  <div className="flex-1 pt-1 space-y-4">
                    <h3 className="text-lg font-bold text-foreground md:text-xl">{step.title}</h3>
                    <div className="relative aspect-[4/3] w-full max-w-sm rounded-3xl overflow-hidden shadow-md">
                      <Image
                        src={step.imageUrl}
                        alt={step.title}
                        fill
                        sizes="(max-width: 768px) 80vw, 33vw"
                        className="object-cover rounded-3xl"
                        data-ai-hint={step.imageHint}
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground md:text-base">
                      {step.description}
                    </p>
                    {step.details && (
                      <ul className="space-y-3 text-muted-foreground">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm md:text-base">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {step.number === 4 && (
                      <div className="pt-4">
                        <Button asChild size="lg">
                          <Link href="/partner-care">
                            Meet Our Support Partner
                            <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Layout: Sticky Center Image with Alternating Text */}
        <div className="hidden md:flex relative justify-center">
          
          {/* Sticky Image Container */}
          <div className="w-full relative">
            
            {/* The Sticky Image - Centered */}
            <div className="sticky top-1/2 -translate-y-1/2 h-[50vh] flex items-center justify-center z-10 pointer-events-none mb-[20vh]">
              <div className="relative w-[400px] h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background/50 backdrop-blur-sm">
                <AnimatePresence mode="wait">
                  {steps.map((step) => (
                    step.number === activeStep && (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                         <Image
                          src={step.imageUrl}
                          alt={step.title}
                          fill
                          className="object-cover"
                          placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 500))}`}
                        />
                      </motion.div>
                    )
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Scrollable Text Content */}
            <div className="relative z-20 -mt-[50vh] pb-[20vh]"> 
              {steps.map((step, index) => {
                const isEven = index % 2 === 0; // Left side (Step 1, 3...) - wait, 0 is step 1.
                // Step 1 (index 0) even -> Left.
                // Step 2 (index 1) odd -> Right.
                return (
                  <motion.div
                    key={step.number}
                    className={cn(
                      "flex min-h-[80vh] items-center pointer-events-auto",
                      isEven ? "justify-start" : "justify-end"
                    )}
                    onViewportEnter={() => setActiveStep(step.number)}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ amount: 0.5, margin: "-100px 0px -100px 0px" }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={cn(
                      "w-[35%] p-8 rounded-2xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm dark:bg-black/50 dark:border-white/10",
                      "hover:shadow-md transition-shadow duration-300",
                      isEven ? "ml-12 lg:ml-24" : "mr-12 lg:mr-24"
                    )}>
                      <div className="flex items-center gap-4 mb-4">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                          0{step.number}
                        </span>
                        <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                      </div>
                      
                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                        {step.description}
                      </p>

                      {step.details && (
                        <ul className="space-y-3 mb-6">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3 text-muted-foreground">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                              <span className="text-base">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {step.number === 4 && (
                         <Button asChild size="lg" className="w-full sm:w-auto">
                          <Link href="/partner-care">
                            Meet Our Support Partner
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}