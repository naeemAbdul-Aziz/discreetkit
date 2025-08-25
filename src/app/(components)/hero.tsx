
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="w-full bg-background">
      <div className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-24 lg:gap-16">
        <div className="flex flex-col items-start space-y-6">
          <h1 
            className="animate-fade-up font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
          >
            Your Health, Your Privacy.
            <br />
            <span className="text-primary">Delivered Discreetly.</span>
          </h1>
          <p 
            className="max-w-xl animate-fade-up text-lg text-muted-foreground"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
          >
            Order confidential self-test kits in Ghana without compromising your privacy. We offer anonymous ordering, unbranded packaging, and secure delivery or pharmacy pickup.
          </p>
          <p 
            className="max-w-xl animate-fade-up text-sm font-medium text-muted-foreground"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
          >
            <span className="font-semibold text-foreground">We never store personal details.</span> Your peace of mind is our promise.
          </p>
          <div 
            className="flex animate-fade-up flex-col gap-4 sm:flex-row"
            style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
          >
            <Button asChild size="lg">
              <Link href="/order">Order Test Kit</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/discounts">See Student Discounts</Link>
            </Button>
          </div>
        </div>
        <div 
          className="animate-fade-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
        >
          <Image
            src="https://placehold.co/600x400"
            alt="Discreet package for self-test kit"
            width={600}
            height={400}
            className="rounded-lg shadow-xl"
            data-ai-hint="discreet package health"
          />
        </div>
      </div>
    </section>
  );
}
