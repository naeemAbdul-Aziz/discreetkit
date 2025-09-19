/**
 * @file how-it-works.tsx
 * @description a visual step-by-step guide explaining the service process.
 *              it adapts between a vertical timeline for mobile and an alternating
 *              grid for desktop.
 */

'use client';

import { steps } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// a shimmer effect for image placeholders to improve loading perception.
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

// converts the shimmer svg to a base64 string for the placeholder.
const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            A Responsible Path to Your Health Answers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            Get your results in 4 simple, private, and secure steps.
          </p>
        </div>

        {/* mobile: vertical timeline */}
        <div className="md:hidden relative">
            <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>
            <div className="space-y-12">
                {steps.map((step) => (
                <div key={step.number} className="relative flex items-start gap-4 pl-10">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-md border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0">
                    {step.number}
                    </div>
                    <div className="flex-1 space-y-4 pt-1">
                        <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                        <p className="text-base text-muted-foreground">{step.description}</p>
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden">
                            <Image
                                src={step.imageUrl}
                                alt={step.title}
                                fill
                                sizes="100vw"
                                className="object-cover"
                                data-ai-hint={step.imageHint}
                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                            />
                        </div>
                        {step.number === 4 && (
                            <Button asChild variant="default">
                                <Link href="/partner-care">
                                    Meet Our Support Partner
                                    <ArrowRight />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                ))}
            </div>
        </div>
        
        {/* desktop: alternating grid */}
        <div className="hidden md:grid md:grid-cols-1 gap-16 max-w-5xl mx-auto">
            {steps.map((step, index) => (
                 <div
                    key={step.number}
                 >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className={cn("relative aspect-[4/3] w-full rounded-2xl overflow-hidden", index % 2 === 1 && "md:order-last")}>
                            <Image
                                src={step.imageUrl}
                                alt={step.title}
                                fill
                                sizes="50vw"
                                className="object-cover"
                                data-ai-hint={step.imageHint}
                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                            />
                        </div>

                         <div className={cn("p-8 flex flex-col justify-center", index % 2 === 1 && "md:order-first")}>
                            <div className="flex items-center gap-4 mb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0">
                                {step.number}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold">
                                {step.title}
                            </h3>
                            </div>
                            <p className="text-base text-muted-foreground mb-6">{step.description}</p>
                            {step.number === 4 && (
                                <div className="mt-8">
                                    <Button asChild variant="default" size="lg">
                                        <Link href="/partner-care">
                                            Meet Our Support Partner
                                            <ArrowRight />
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
