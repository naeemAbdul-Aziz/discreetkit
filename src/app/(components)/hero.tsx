
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

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
              Order <strong>confidential self-test kits</strong> in Ghana <strong>without compromising your privacy</strong>. We offer <strong>anonymous ordering</strong>, <strong>unbranded packaging</strong>, and <strong>secure delivery</strong> or pharmacy pickup.
            </p>
            <p className="max-w-xl text-md text-muted-foreground">
              We never store personal details. <strong>Your peace of mind is our promise.</strong>
            </p>
            <div 
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Button asChild size="lg">
                <Link href="/order">
                  Order Test Kit
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/order">
                  See Student Kits
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwYWNrYWdlfGVufDB8fHx8MTc1NjE0NTQxNnww&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Discreet package for self-test kit"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl"
              data-ai-hint="discreet package medical"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
