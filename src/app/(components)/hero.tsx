
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://placehold.co/1920x1080"
          alt="Collage of product in lifestyle settings"
          layout="fill"
          objectFit="cover"
          className="opacity-40"
          data-ai-hint="product collage"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/20"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center space-y-6 px-4">
        <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Say hello to your new favorite <br /> drinking buddy.
        </h1>
        <p className="max-w-xl text-lg text-white/90">
          ...and goodbye to rough mornings.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/order">
              Shop DiscreetKit
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
            <Link href="/order">
              Subscribe & Save
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
