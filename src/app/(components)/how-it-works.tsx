
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { steps } from '@/lib/data';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <p className="font-semibold text-primary uppercase">How It Works</p>
            <h2 className="font-headline text-3xl font-bold text-foreground sm:text-4xl">
              Confidential Testing, <br/> Simplified.
            </h2>
            
            <div className="space-y-6">
              {steps.map((step) => (
                <div key={step.number} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-bold text-xl flex-shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild variant="link" className="px-0">
              <Link href="/#faq">
                Learn More
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="https://placehold.co/600x700"
              alt="Lifestyle image showing product in use"
              width={600}
              height={700}
              className="rounded-xl shadow-lg object-cover"
              data-ai-hint="person holding product"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
