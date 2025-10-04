/**
 * @file closing-cta.tsx
 * @description a final call-to-action component at the bottom of the page,
 *              prompting users to proceed to the shop.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

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


export function ClosingCta() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <Card className="overflow-hidden rounded-2xl bg-card">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center p-8 text-center md:p-12 md:text-left">
              <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Stop Waiting. Start Knowing.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:mx-0">
                Your journey to <strong>peace of mind</strong> is private, fast, and fully supported. Take control of your health today—<strong>securely and confidentially.</strong>
              </p>
              <div className="mt-8 flex justify-center md:justify-start">
                <Button asChild size="lg">
                  <Link href="/cart">
                    Start My Private Order
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative h-64 min-h-[300px] w-full md:h-full">
              <Image
                src="https://images.unsplash.com/photo-1584515933487-759821d27167?q=80&w=800&fit=crop"
                alt="a person's hands holding a small, discreet package."
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                data-ai-hint="hands holding package"
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
              />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
