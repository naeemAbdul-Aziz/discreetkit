
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ShieldCheck, Truck, Users } from 'lucide-react';

export function Hero() {
  return (
    <section className="w-full bg-background py-16 md:py-24">
      <div className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 text-center">
        
        <div 
          className="animate-fade-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
        >
          <Image
            src="https://placehold.co/600x400"
            alt="Discreet package for self-test kit"
            width={600}
            height={400}
            className="rounded-xl shadow-2xl"
            data-ai-hint="discreet package health"
          />
        </div>

        <div className="flex flex-col items-center space-y-6">
          <h1 
            className="animate-fade-up font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-3xl"
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
          >
            Private Health Testing, <br />
            <span className="text-primary">Delivered to Your Doorstep.</span>
          </h1>
          <p 
            className="max-w-2xl animate-fade-up text-lg text-muted-foreground"
            style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
          >
            Order confidential self-test kits in Ghana without compromising your privacy. We offer anonymous ordering, unbranded packaging, and secure delivery or pharmacy pickup.
          </p>
          <div 
            className="flex animate-fade-up flex-col gap-4 sm:flex-row"
            style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
          >
            <Button asChild size="lg">
              <Link href="/order">Order Your Test Kit</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/track">Track My Order</Link>
            </Button>
          </div>
           <div 
            className="flex animate-fade-up items-center space-x-6 pt-4 text-sm text-muted-foreground"
            style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    <span>100% Anonymous</span>
                </div>
                <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span>Discreet Packaging</span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span>Thousands Served</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
