/**
 * @file how-it-works.tsx
 * @description a visual step-by-step guide explaining the service process.
 *              Mobile: vertical timeline.
 *              Desktop: horizontal stepper with 4 columns and connecting line.
 */

'use client';

import { steps } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";

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
  const stickyScrollContent = steps.map((step) => ({
    title: step.title,
    description: step.description,
    step: step.number,
    details: step.details,
    content: (
      <div className="h-full w-full flex items-center justify-center relative bg-muted/20">
        <Image
          src={step.imageUrl}
          alt={step.title}
          fill
          className="h-full w-full object-cover"
          placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
        />
      </div>
    ),
    cta: step.number === 4 ? (
      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href="/partner-care">
          Meet Our Support Partner
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    ) : undefined,
  }));

  return (
    <section id="how-it-works" className="py-12 md:pt-24 md:pb-8 bg-background relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-4xl">
              A Responsible Path to Your Health Answers
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
              Get your results in 4 simple, private, and secure steps.
            </p>
          </motion.div>
        </div>

        {/* Mobile Layout: Vertical Timeline (Preserved) */}
        <div className="md:hidden">
          <div className="relative">
            {/* The vertical connecting line */}
            <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
            <div className="space-y-12">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  className="relative flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {/* The step number circle */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0 shadow-sm">
                    0{step.number}
                  </div>
                  {/* The content */}
                  <div className="flex-1 pt-1 space-y-4">
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
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

        {/* Desktop Layout: Sticky Scroll */}
        <div className="hidden md:block w-full">
           <StickyScroll content={stickyScrollContent} />
        </div>

      </div>
    </section>
  );
}