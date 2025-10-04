/**
 * @file hero.tsx
 * @description the main hero section of the homepage, featuring the primary headline,
 *              call-to-action buttons, and a prominent image.
 */

'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';

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


export function Hero() {
  return (
    <section className="overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 py-12 md:pt-20 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* left content column */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center md:text-left"
            >
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                    Get Sorted <span className="font-light italic text-primary">Discreetly</span>.
                    <br />
                    Stay Supported Fully.
                </h1>
                <p className="mt-4 max-w-md mx-auto md:mx-0 text-base text-muted-foreground">
                  Get the private, personal products you need, delivered securely and supported by experts. Your journey starts here.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    {/* primary call-to-action to view products. */}
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href="/#products">
                        Start Your Order
                        <ArrowRight />
                        </Link>
                    </Button>
                    {/* secondary call-to-action for returning users to track their order. */}
                     <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                        <Link href="/#how-it-works">
                            <Info />
                            Learn How It Works
                        </Link>
                    </Button>
                </div>
            </motion.div>

            {/* right image column */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative h-[300px] md:h-[450px] w-full"
            >
                <Image
                    src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759591519/hero_zdxd3p.png"
                    alt="A collection of DiscreetKit's health products arranged neatly on a neutral background."
                    fill
                    priority
                    className="object-cover rounded-3xl"
                    data-ai-hint="product flatlay"
                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                />
            </motion.div>
        </div>
      </div>
    </section>
  );
}
