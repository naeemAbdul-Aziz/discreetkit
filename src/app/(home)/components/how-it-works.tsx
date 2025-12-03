/**
 * @file how-it-works.tsx
 * @description a visual step-by-step guide explaining the service process.
 *              it adapts between a vertical timeline for mobile and an alternating
 *              grid for desktop.
 */

'use client';

import { steps } from '@/lib/data';
// Note: Steps data is imported. We should update the data source if possible, 
// but for now we will override the display logic or ensure the data file is updated.
// Actually, let's check if we can update the data file directly.
import { Button } from '@/components/ui/button';
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <section id="how-it-works" className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            A Responsible Path to Your Health Answers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm text-muted-foreground md:text-base">
            Get your results in 4 simple, private, and secure steps.
          </p>
        </div>

        {/* Mobile Layout: Vertical Timeline */}
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
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
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

        {/* Desktop Layout: Sticky Scroll Reveal */}
        <div className="hidden md:block">
          <StickyScroll 
            content={steps.map((step) => ({
              title: step.title,
              description: step.description,
              step: step.number,
              details: step.details,
              cta: step.number === 4 ? (
                <Button asChild size="lg">
                  <Link href="/partner-care">
                    Meet Our Support Partner
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : undefined,
              content: (
                <div className="h-full w-full flex items-center justify-center text-white relative">
                  <Image
                    src={step.imageUrl}
                    alt={step.title}
                    fill
                    className="h-full w-full object-cover"
                  />
                </div>
              ),
            }))} 
          />
        </div>
      </div>
    </section>
  );
}

const CheckCircle = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("h-5 w-5", className)}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.06-1.06l-3.25 3.25-1.5-1.5a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l3.75-3.75z"
        clipRule="evenodd"
      />
    </svg>
  );