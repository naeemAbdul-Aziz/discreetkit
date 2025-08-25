
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PartnerLogos } from './partner-logos';

export function Hero() {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-start space-y-6 text-left">
            <h1 
              className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Your Health, Your Privacy.
              <br />
              <span className="text-primary">Delivered Discreetly.</span>
            </h1>
            <p 
              className="max-w-xl text-lg text-muted-foreground"
            >
              Order confidential self-test kits in Ghana without compromising your privacy. We offer anonymous ordering, unbranded packaging, and secure delivery or pharmacy pickup.
            </p>
            <p className="max-w-xl text-md text-muted-foreground">
              We never store personal details. Your peace of mind is our promise.
            </p>
            <div 
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button asChild size="lg">
                <Link href="/order">Order Test Kit</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/discounts">See Student Discounts</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="https://placehold.co/600x400"
              alt="Discreet package for self-test kit"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl"
              data-ai-hint="discreet package health"
            />
          </div>
        </div>
        <div className="mt-20">
          <PartnerLogos />
        </div>
      </div>
    </section>
  );
}
