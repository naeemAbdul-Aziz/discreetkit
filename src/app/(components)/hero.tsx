
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxwYWNrYWdlfGVufDB8fHx8MTc1NjE0NTQxNnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Discreet package for a test kit"
          layout="fill"
          objectFit="cover"
          className="opacity-40"
          data-ai-hint="discreet package medical"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-6 px-4">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Confidential Health Testing, <br /> Delivered.
        </h1>
        <p className="max-w-xl text-lg text-white/90">
          Private, fast, and reliable self-test kits. Order anonymously from anywhere in Ghana.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/order">
              Order Your Test Kit
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            <Link href="/#how-it-works">
              How It Works
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
