
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { steps } from '@/lib/data';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <p className="font-semibold text-primary uppercase">How It Works</p>
            <h2 className="mt-2 font-headline text-3xl font-bold text-foreground sm:text-4xl">
              Confidential Testing, Simplified.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 text-left md:grid-cols-3 md:gap-12">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-1 text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="group relative mt-16 w-full cursor-pointer">
            <Image
              src="https://placehold.co/1200x600"
              alt="Lifestyle image showing product in use"
              width={1200}
              height={600}
              className="w-full rounded-xl object-cover shadow-lg transition-opacity group-hover:opacity-80"
              data-ai-hint="person holding product"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/20 transition-colors group-hover:bg-black/30">
              <PlayCircle className="h-20 w-20 transform text-white/90 transition-transform group-hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
