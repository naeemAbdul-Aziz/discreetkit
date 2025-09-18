

'use client';

import Image from 'next/image';
import { partnerCareSteps } from '@/lib/data';
import { ShoppingCart, CheckCircle, Phone, HeartHandshake } from 'lucide-react';

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

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function HowItWorksPartner() {
  return (
    <section id="how-it-works-partner" className="py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            From Our Kit to Their Care: Your Journey
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            You've taken the first step. Here’s a clear, simple path to getting professional support.
          </p>
        </div>

        {/* Desktop and Mobile Layout */}
        <div className="relative">
          {/* Vertical line for mobile */}
          <div className="absolute left-5 top-0 h-full w-0.5 bg-border -translate-x-1/2 md:hidden" aria-hidden="true"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {partnerCareSteps.map((step) => (
                  <div key={step.number} className="relative flex flex-col items-start gap-4 md:block">
                     {/* Mobile Step Header */}
                       <div className="flex items-start gap-4 md:hidden w-full">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0 mt-1">
                            {step.number}
                          </div>
                          <div className="flex-1 space-y-2">
                             <h3 className="text-lg font-bold text-foreground pt-2">{step.title}</h3>
                             <p className="text-sm text-muted-foreground">{step.description}</p>
                             <div className="mt-4 relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg">
                                <Image
                                    src={step.imageUrl}
                                    alt={step.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover"
                                    data-ai-hint={step.imageHint}
                                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                                />
                            </div>
                          </div>
                      </div>
                      
                      {/* Desktop Step Header */}
                      <div className="hidden md:flex items-center gap-4 w-full">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground z-10 flex-shrink-0">
                            {step.number}
                          </div>
                          {step.number < 4 && (
                            <div className="flex-grow h-px bg-border"></div>
                          )}
                      </div>
                       <div className="hidden md:block mt-2">
                          <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                      </div>

                      <div className="hidden md:block pl-0">
                        <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                        <div className="mt-4 relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-lg">
                            <Image
                                src={step.imageUrl}
                                alt={step.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                className="object-cover"
                                data-ai-hint={step.imageHint}
                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                            />
                        </div>
                      </div>
                  </div>
              ))}
          </div>
        </div>

      </div>
    </section>
  );
}
